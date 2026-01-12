/**
 * Aristotle Queue Processor
 *
 * Background job that processes the analysis queue.
 * Called via cron job or serverless function trigger.
 *
 * Flow:
 * 1. Session completes → auto-queued via DB trigger
 * 2. This processor picks up queued items
 * 3. Fetches session data and runs Aristotle analysis
 * 4. Updates cognitive fingerprint and virtue progress
 * 5. Stores analysis results
 */

import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { aristotle } from '@/lib/ai/aristotle-agent';
import type { SessionAnalysisInput } from '@/types/aristotle';

interface QueueItem {
  id: string;
  session_id: string;
  student_id: string;
  priority: number;
  status: string;
  attempts: number;
  max_attempts: number;
}

/**
 * Process a batch of queued analyses
 * @param batchSize Number of items to process (default 10)
 */
export async function processAnalysisQueue(batchSize = 10): Promise<{
  processed: number;
  failed: number;
  remaining: number;
}> {
  const supabase = createAdminSupabaseClient();

  // Get queued items ordered by priority and queue time
  const { data: queueItems, error: fetchError } = await supabase
    .from('aristotle_analysis_queue')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: false })
    .order('queued_at', { ascending: true })
    .limit(batchSize);

  if (fetchError) {
    console.error('Error fetching queue:', fetchError);
    return { processed: 0, failed: 0, remaining: 0 };
  }

  if (!queueItems || queueItems.length === 0) {
    return { processed: 0, failed: 0, remaining: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const item of queueItems as QueueItem[]) {
    try {
      await processQueueItem(item);
      processed++;
    } catch (error) {
      console.error(`Failed to process queue item ${item.id}:`, error);
      failed++;
    }
  }

  // Get remaining count
  const { count: remaining } = await supabase
    .from('aristotle_analysis_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'queued');

  return { processed, failed, remaining: remaining || 0 };
}

/**
 * Process a single queue item
 */
async function processQueueItem(item: QueueItem): Promise<void> {
  const supabase = createAdminSupabaseClient();

  // Mark as processing
  await supabase
    .from('aristotle_analysis_queue')
    .update({
      status: 'processing',
      started_at: new Date().toISOString(),
      attempts: item.attempts + 1,
    })
    .eq('id', item.id);

  try {
    // Fetch session data
    const sessionData = (await fetchSessionData(item.session_id)) as Record<string, any> | null;

    if (!sessionData) {
      throw new Error(`Session ${item.session_id} not found`);
    }

    const questionsAnswered =
      sessionData.questions_attempted ?? sessionData.questions_answered ?? 0;
    const correctCount =
      sessionData.questions_correct ?? sessionData.correct_count ?? 0;
    const incorrectCount =
      sessionData.questions_attempted != null
        ? Math.max(0, questionsAnswered - correctCount)
        : sessionData.incorrect_count || 0;

    // Build analysis input
    const analysisInput: SessionAnalysisInput = {
      sessionId: item.session_id,
      studentId: item.student_id,
      subject: sessionData.subject || 'history',
      agent: sessionData.agent || 'socrates',
      duration: sessionData.duration_seconds || 0,
      questionsAnswered,
      correctCount,
      incorrectCount,
      streakMax: sessionData.max_streak || 0,
      tierReached: sessionData.max_tier_reached || 1,
      heartsLost: 3 - (sessionData.hearts_remaining || 3),
      responseTimes: sessionData.response_times || [],
      errorTypes: sessionData.error_types || [],
      difficultyProgression: sessionData.difficulty_progression || [],
      completed: sessionData.status === 'completed',
      endReason: sessionData.end_reason,
    };

    // Run Aristotle analysis
    const analysisResult = await aristotle.analyzeSession(analysisInput);

    // Store analysis result
    await supabase.from('session_analyses').insert({
      session_id: item.session_id,
      student_id: item.student_id,
      faculty_signals: analysisResult.facultySignals,
      virtue_signals: analysisResult.virtueSignals,
      recommendations: analysisResult.recommendations,
      profile_updates: analysisResult.profileUpdates,
      status: 'completed',
      analyzed_at: new Date().toISOString(),
    });

    // Update cognitive fingerprint
    await aristotle.updateCognitiveFingerprint(item.student_id, analysisResult);

    // Update virtue progress
    await aristotle.updateVirtueProgress(item.student_id, analysisResult.virtueSignals);

    // Store behavioral observations
    for (const signal of analysisResult.facultySignals) {
      await supabase.from('behavioral_observations').insert({
        student_id: item.student_id,
        session_id: item.session_id,
        behavior_type: 'faculty_signal',
        faculty_observed: signal.faculty,
        observation_data: { signal: signal.signal, evidence: signal.evidence },
        behavioral_trait: signal.signal,
        trait_strength: signal.strength,
      });
    }

    // Mark queue item as completed
    await supabase
      .from('aristotle_analysis_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', item.id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if we should retry
    if (item.attempts + 1 >= item.max_attempts) {
      // Mark as failed permanently
      await supabase
        .from('aristotle_analysis_queue')
        .update({
          status: 'failed',
          last_error: errorMessage,
        })
        .eq('id', item.id);

      // Also update session_analyses
      await supabase.from('session_analyses').insert({
        session_id: item.session_id,
        student_id: item.student_id,
        status: 'failed',
        error_message: errorMessage,
      });
    } else {
      // Put back in queue for retry
      await supabase
        .from('aristotle_analysis_queue')
        .update({
          status: 'queued',
          last_error: errorMessage,
        })
        .eq('id', item.id);
    }

    throw error;
  }
}

/**
 * Fetch session data with answer details
 */
async function fetchSessionData(sessionId: string): Promise<Record<string, unknown> | null> {
  const supabase = createAdminSupabaseClient();

  const { data: session } = await supabase
    .from('learning_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (!session) return null;

  // Fetch session answers for response time and error analysis
  const { data: answers } = await supabase
    .from('session_answers')
    .select(
      `
      *,
      answer_options!inner(distractor_type)
    `
    )
    .eq('session_id', sessionId)
    .order('answered_at', { ascending: true });

  // Calculate response times
  const responseTimes: number[] = [];
  const errorTypes: string[] = [];
  const difficultyProgression: number[] = [];

  let prevTime: Date | null = null;
  for (const answer of answers || []) {
    const answerTime = new Date(answer.answered_at);
    if (prevTime) {
      responseTimes.push(answerTime.getTime() - prevTime.getTime());
    }
    prevTime = answerTime;

    if (!answer.is_correct && answer.answer_options?.distractor_type) {
      errorTypes.push(answer.answer_options.distractor_type);
    }

    difficultyProgression.push(answer.tier_at_answer || 1);
  }

  // Calculate duration
  const startTime = new Date(session.started_at);
  const endTime = session.ended_at ? new Date(session.ended_at) : new Date();
  const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

  return {
    ...session,
    duration_seconds: durationSeconds,
    response_times: responseTimes,
    error_types: errorTypes,
    difficulty_progression: difficultyProgression,
  };
}

/**
 * Get queue stats
 */
export async function getQueueStats(): Promise<{
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}> {
  const supabase = createAdminSupabaseClient();

  const { data: stats } = await supabase.from('aristotle_analysis_queue').select('status');

  const counts = {
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  };

  for (const item of stats || []) {
    const status = item.status as keyof typeof counts;
    if (status in counts) {
      counts[status]++;
    }
  }

  return counts;
}

/**
 * Manually queue a session for analysis
 * Useful for reprocessing or testing
 */
export async function queueSessionForAnalysis(
  sessionId: string,
  studentId: string,
  priority = 0
): Promise<void> {
  const supabase = createAdminSupabaseClient();

  await supabase.from('aristotle_analysis_queue').upsert(
    {
      session_id: sessionId,
      student_id: studentId,
      priority,
      status: 'queued',
      attempts: 0,
      queued_at: new Date().toISOString(),
    },
    { onConflict: 'session_id' }
  );
}
