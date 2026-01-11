/**
 * Aristotle Agent - Background Feedback Loop
 *
 * Aristotle analyzes completed sessions and provides:
 * - Cognitive fingerprint updates
 * - Virtue progress tracking
 * - Parent-facing insights
 * - Next-session recommendations
 *
 * This agent runs AFTER sessions complete, not during.
 * It does not affect runtime or student workflows.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import type {
  SessionAnalysisInput,
  SessionAnalysisResult,
  CognitiveFingerprint,
  VirtueProgress,
  ParentInsight,
  NextSessionAdjustments,
  Faculty,
  Virtue,
  BehavioralObservation,
} from '@/types/aristotle';

// ============================================
// ARISTOTLE'S PHILOSOPHY
// ============================================

const ARISTOTLE_SYSTEM_PROMPT = `You are Aristotle, a wise philosopher who observes how students learn. You analyze behavioral patterns from completed learning sessions to understand the student's cognitive development.

## Your Role
You do NOT teach content. You observe HOW the student encounters learning:
- Their pace and timing patterns
- Their response to difficulty
- Their error patterns and recovery
- Their engagement and persistence

## The Five Mental Faculties (De Anima)
1. PERCEPTION: What captures their attention? Do they rush or observe carefully?
2. MEMORY: Do they recall quickly or need time to retrieve?
3. IMAGINATION: Do they predict outcomes? Take creative risks?
4. REASON: How do they handle cause and effect? Pattern recognition?
5. DESIRE: What motivates them? Do they seek challenge or comfort?

## The Virtues You Observe
INTELLECTUAL: Curiosity, Patience, Precision, Open-mindedness
MORAL: Fairness, Temperance, Courage, Reflection

## Your Output
You provide observations and recommendations, NOT judgments.
Frame everything developmentally - children are always growing.
Be specific with evidence from the session data.

## Response Format
Always respond with valid JSON matching the requested schema.`;

// ============================================
// ANALYSIS PROMPTS
// ============================================

const SESSION_ANALYSIS_PROMPT = `Analyze this completed learning session and extract cognitive and virtue signals.

## Session Data
Subject: {subject}
Agent: {agent}
Duration: {duration} seconds
Questions Answered: {questionsAnswered}
Correct: {correctCount} | Incorrect: {incorrectCount}
Max Streak: {streakMax}
Tier Reached: {tierReached}
Hearts Lost: {heartsLost}
Completed: {completed}
End Reason: {endReason}

## Response Time Distribution (ms)
{responseTimes}

## Error Types Selected
{errorTypes}

## Difficulty Progression
{difficultyProgression}

## Instructions
Analyze this data and provide:

1. FACULTY SIGNALS: What does this session reveal about each faculty?
   - Only include faculties where you have meaningful evidence
   - Provide specific evidence from the data

2. VIRTUE SIGNALS: What virtues were demonstrated or challenged?
   - Patience: Did they persist through difficulty?
   - Courage: Did they attempt harder questions?
   - Precision: Were errors careless or conceptual?
   - Reflection: Did they improve after mistakes?

3. RECOMMENDATIONS: What adjustments for the next session?
   - Difficulty level
   - Pacing
   - Topic focus

Respond with this JSON structure:
{
  "facultySignals": [
    { "faculty": "memory|perception|imagination|reason|desire", "signal": "description", "strength": 0.0-1.0, "evidence": "specific data point" }
  ],
  "virtueSignals": [
    { "virtue": "curiosity|patience|precision|open_mindedness|fairness|temperance|courage|reflection", "observed": true/false, "strength": 0.0-1.0, "evidence": "specific data point" }
  ],
  "recommendations": [
    { "type": "difficulty|pacing|topic|approach", "recommendation": "specific suggestion", "confidence": 0.0-1.0 }
  ],
  "profileUpdates": [
    { "field": "fieldName", "currentValue": 0.5, "newValue": 0.6, "reason": "why this change" }
  ]
}`;

const PARENT_INSIGHT_PROMPT = `Generate a parent-friendly insight about their child's learning patterns.

## Student Profile
Learning Style: {learningStyle}
Sessions This Week: {sessionsThisWeek}
Total Questions: {totalQuestions}
Average Accuracy: {avgAccuracy}%
Top Subject: {topSubject}

## Cognitive Fingerprint
Perception: {perceptionScore} - {perceptionTendency}
Memory: {memoryScore} - {memoryTendency}
Imagination: {imaginationScore} - {imaginationTendency}
Reason: {reasonScore} - {reasonTendency}
Desire: {desireScore} - {desireTendency}

## Virtue Progress
Curiosity: {curiosity} | Patience: {patience} | Precision: {precision} | Open-mindedness: {openMindedness}
Courage: {courage} | Temperance: {temperance} | Reflection: {reflection}

## Recent Observations
{recentObservations}

## Instructions
Write a warm, encouraging insight for parents that:
1. Has a short headline capturing their child's learning character
2. Includes 2-3 paragraphs explaining HOW their child learns (not just grades)
3. Lists 2-3 key observations with icons
4. Highlights developing virtues
5. Suggests 1-2 growth opportunities (positive framing)

Use accessible language. No jargon. Focus on development, not deficits.

Respond with this JSON structure:
{
  "headline": "Short characterization (e.g., 'A Curious Explorer with Growing Patience')",
  "narrative": "2-3 paragraphs of warm, specific observations",
  "keyObservations": [
    { "faculty": "perception|memory|imagination|reason|desire", "icon": "emoji", "observation": "specific insight" }
  ],
  "virtueHighlights": [
    { "virtue": "name", "level": "developing|established|flourishing", "observation": "evidence" }
  ],
  "growthOpportunities": [
    { "area": "skill area", "suggestion": "specific, actionable suggestion for parents" }
  ]
}`;

// ============================================
// ARISTOTLE AGENT CLASS
// ============================================

export class AristotleAgent {
  private anthropic: Anthropic;
  private supabase = createAdminSupabaseClient();

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  /**
   * Analyze a completed session
   * This is the main entry point called by the background job
   */
  async analyzeSession(input: SessionAnalysisInput): Promise<SessionAnalysisResult> {
    const prompt = SESSION_ANALYSIS_PROMPT
      .replace('{subject}', input.subject)
      .replace('{agent}', input.agent)
      .replace('{duration}', String(input.duration))
      .replace('{questionsAnswered}', String(input.questionsAnswered))
      .replace('{correctCount}', String(input.correctCount))
      .replace('{incorrectCount}', String(input.incorrectCount))
      .replace('{streakMax}', String(input.streakMax))
      .replace('{tierReached}', String(input.tierReached))
      .replace('{heartsLost}', String(input.heartsLost))
      .replace('{completed}', String(input.completed))
      .replace('{endReason}', input.endReason || 'unknown')
      .replace('{responseTimes}', this.formatResponseTimes(input.responseTimes))
      .replace('{errorTypes}', input.errorTypes.join(', ') || 'none')
      .replace('{difficultyProgression}', input.difficultyProgression.join(' → '));

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: ARISTOTLE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Aristotle');
    }

    const analysis = JSON.parse(textContent.text);

    return {
      sessionId: input.sessionId,
      studentId: input.studentId,
      facultySignals: analysis.facultySignals || [],
      virtueSignals: analysis.virtueSignals || [],
      recommendations: analysis.recommendations || [],
      profileUpdates: analysis.profileUpdates || [],
      analyzedAt: new Date(),
    };
  }

  /**
   * Update cognitive fingerprint based on new observations
   */
  async updateCognitiveFingerprint(
    studentId: string,
    analysisResult: SessionAnalysisResult
  ): Promise<CognitiveFingerprint> {
    // Get or create fingerprint
    let { data: fingerprint } = await this.supabase
      .from('cognitive_fingerprints')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (!fingerprint) {
      const { data: newFingerprint } = await this.supabase
        .from('cognitive_fingerprints')
        .insert({ student_id: studentId })
        .select()
        .single();
      fingerprint = newFingerprint;
    }

    // Apply faculty signals
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const signal of analysisResult.facultySignals) {
      const faculty = signal.faculty as Faculty;
      const scoreField = `${faculty}_score`;
      const countField = `${faculty}_observations_count`;

      // Weighted moving average
      const currentScore = fingerprint[scoreField] || 0.5;
      const currentCount = fingerprint[countField] || 0;
      const weight = Math.min(0.3, 1 / (currentCount + 1)); // Decay weight over time
      const newScore = currentScore * (1 - weight) + signal.strength * weight;

      updates[scoreField] = Math.round(newScore * 100) / 100;
      updates[countField] = currentCount + 1;
    }

    const { data: updated } = await this.supabase
      .from('cognitive_fingerprints')
      .update(updates)
      .eq('student_id', studentId)
      .select()
      .single();

    return this.mapToCognitiveFingerprint(updated);
  }

  /**
   * Update virtue progress based on signals
   */
  async updateVirtueProgress(
    studentId: string,
    virtueSignals: SessionAnalysisResult['virtueSignals']
  ): Promise<VirtueProgress> {
    // Get or create virtue progress
    let { data: progress } = await this.supabase
      .from('virtue_progress')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (!progress) {
      const { data: newProgress } = await this.supabase
        .from('virtue_progress')
        .insert({ student_id: studentId })
        .select()
        .single();
      progress = newProgress;
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      total_observations: (progress.total_observations || 0) + 1,
    };

    // Apply virtue signals
    for (const signal of virtueSignals) {
      if (!signal.observed) continue;

      const virtueMap: Record<string, string> = {
        curiosity: 'curiosity_score',
        patience: 'patience_score',
        precision: 'precision_score',
        open_mindedness: 'open_mindedness_score',
        fairness: 'fairness_score',
        temperance: 'temperance_score',
        courage: 'courage_score',
        reflection: 'reflection_score',
      };

      const field = virtueMap[signal.virtue];
      if (field) {
        const currentScore = progress[field] || 0.5;
        // Gentle updates - virtues develop slowly
        const weight = 0.1;
        const newScore = currentScore * (1 - weight) + signal.strength * weight;
        updates[field] = Math.round(newScore * 100) / 100;
      }
    }

    const { data: updated } = await this.supabase
      .from('virtue_progress')
      .update(updates)
      .eq('student_id', studentId)
      .select()
      .single();

    return this.mapToVirtueProgress(updated);
  }

  /**
   * Generate parent-facing insight
   */
  async generateParentInsight(studentId: string): Promise<ParentInsight> {
    // Gather all relevant data
    const [fingerprint, virtues, stats, recentObservations] = await Promise.all([
      this.getCognitiveFingerprint(studentId),
      this.getVirtueProgress(studentId),
      this.getStudentStats(studentId),
      this.getRecentObservations(studentId, 10),
    ]);

    const prompt = PARENT_INSIGHT_PROMPT
      .replace('{learningStyle}', fingerprint?.primaryLearningStyle || 'developing')
      .replace('{sessionsThisWeek}', String(stats.sessionsThisWeek))
      .replace('{totalQuestions}', String(stats.totalQuestions))
      .replace('{avgAccuracy}', String(Math.round(stats.averageAccuracy * 100)))
      .replace('{topSubject}', stats.topSubject || 'varied')
      .replace('{perceptionScore}', String(fingerprint?.perception.score || 0.5))
      .replace('{perceptionTendency}', JSON.stringify(fingerprint?.perception.tendency || {}))
      .replace('{memoryScore}', String(fingerprint?.memory.score || 0.5))
      .replace('{memoryTendency}', JSON.stringify(fingerprint?.memory.tendency || {}))
      .replace('{imaginationScore}', String(fingerprint?.imagination.score || 0.5))
      .replace('{imaginationTendency}', JSON.stringify(fingerprint?.imagination.tendency || {}))
      .replace('{reasonScore}', String(fingerprint?.reason.score || 0.5))
      .replace('{reasonTendency}', JSON.stringify(fingerprint?.reason.tendency || {}))
      .replace('{desireScore}', String(fingerprint?.desire.score || 0.5))
      .replace('{desireTendency}', JSON.stringify(fingerprint?.desire.tendency || {}))
      .replace('{curiosity}', String(virtues?.curiosity || 0.5))
      .replace('{patience}', String(virtues?.patience || 0.5))
      .replace('{precision}', String(virtues?.precision || 0.5))
      .replace('{openMindedness}', String(virtues?.openMindedness || 0.5))
      .replace('{courage}', String(virtues?.courage || 0.5))
      .replace('{temperance}', String(virtues?.temperance || 0.5))
      .replace('{reflection}', String(virtues?.reflection || 0.5))
      .replace('{recentObservations}', this.formatObservations(recentObservations));

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: ARISTOTLE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Aristotle');
    }

    const insight = JSON.parse(textContent.text);

    // Store the insight
    const { data: stored } = await this.supabase
      .from('parent_insights')
      .insert({
        student_id: studentId,
        headline: insight.headline,
        narrative: insight.narrative,
        key_observations: insight.keyObservations,
        virtue_highlights: insight.virtueHighlights,
        growth_opportunities: insight.growthOpportunities,
        stats: stats,
      })
      .select()
      .single();

    return {
      studentId,
      generatedAt: new Date(),
      headline: insight.headline,
      narrative: insight.narrative,
      keyObservations: insight.keyObservations,
      virtueHighlights: insight.virtueHighlights,
      growthOpportunities: insight.growthOpportunities,
      stats,
    };
  }

  /**
   * Get recommendations for next session
   */
  async getNextSessionAdjustments(
    studentId: string,
    subject: 'history' | 'math' | 'writing'
  ): Promise<NextSessionAdjustments> {
    // Check for existing valid adjustments
    const { data: existing } = await this.supabase
      .from('next_session_adjustments')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject', subject)
      .gt('valid_until', new Date().toISOString())
      .eq('applied', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      return this.mapToNextSessionAdjustments(existing);
    }

    // Generate new adjustments based on recent analyses
    const { data: recentAnalyses } = await this.supabase
      .from('session_analyses')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'completed')
      .order('analyzed_at', { ascending: false })
      .limit(5);

    // Extract recommendations from recent analyses
    const allRecommendations = (recentAnalyses || [])
      .flatMap((a) => a.recommendations || [])
      .filter((r) => r.type === 'difficulty' || r.type === 'pacing');

    // Calculate suggested tier based on recommendations
    let suggestedTier = 1;
    let tierReason = 'Starting fresh';

    const difficultyRecs = allRecommendations.filter((r) => r.type === 'difficulty');
    if (difficultyRecs.length > 0) {
      const avgConfidence =
        difficultyRecs.reduce((sum, r) => sum + r.confidence, 0) / difficultyRecs.length;
      if (avgConfidence > 0.7) {
        suggestedTier = 2;
        tierReason = 'Strong performance in recent sessions';
      }
    }

    const adjustment: NextSessionAdjustments = {
      studentId,
      subject,
      suggestedStartingTier: suggestedTier,
      tierAdjustmentReason: tierReason,
      suggestedSessionLength: 15,
      topicPreferences: [],
      avoidTopics: [],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    };

    // Store for next time
    await this.supabase.from('next_session_adjustments').insert({
      student_id: studentId,
      subject,
      suggested_starting_tier: adjustment.suggestedStartingTier,
      tier_adjustment_reason: adjustment.tierAdjustmentReason,
      suggested_session_length: adjustment.suggestedSessionLength,
      valid_until: adjustment.validUntil.toISOString(),
    });

    return adjustment;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private formatResponseTimes(times: number[]): string {
    if (!times.length) return 'No data';
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    return `Avg: ${Math.round(avg)}ms, Min: ${min}ms, Max: ${max}ms`;
  }

  private formatObservations(observations: BehavioralObservation[]): string {
    if (!observations.length) return 'No recent observations';
    return observations
      .map((o) => `- ${o.behaviorType}: ${o.trait || 'observed'} (${o.facultyObserved})`)
      .join('\n');
  }

  private async getCognitiveFingerprint(studentId: string): Promise<CognitiveFingerprint | null> {
    const { data } = await this.supabase
      .from('cognitive_fingerprints')
      .select('*')
      .eq('student_id', studentId)
      .single();
    return data ? this.mapToCognitiveFingerprint(data) : null;
  }

  private async getVirtueProgress(studentId: string): Promise<VirtueProgress | null> {
    const { data } = await this.supabase
      .from('virtue_progress')
      .select('*')
      .eq('student_id', studentId)
      .single();
    return data ? this.mapToVirtueProgress(data) : null;
  }

  private async getStudentStats(studentId: string): Promise<ParentInsight['stats']> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions } = await this.supabase
      .from('learning_sessions')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', weekAgo);

    const sessionsThisWeek = sessions?.length || 0;
    const totalQuestions = sessions?.reduce((sum, s) => sum + (s.questions_answered || 0), 0) || 0;
    const totalCorrect = sessions?.reduce((sum, s) => sum + (s.correct_count || 0), 0) || 0;
    const averageAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

    // Find top subject
    const subjectCounts: Record<string, number> = {};
    sessions?.forEach((s) => {
      const subject = s.subject || 'history';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    const topSubject =
      Object.entries(subjectCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'history';

    // Get longest streak
    const longestStreak = sessions?.reduce((max, s) => Math.max(max, s.max_streak || 0), 0) || 0;

    return {
      sessionsThisWeek,
      totalQuestionsAnswered: totalQuestions,
      averageAccuracy,
      longestStreak,
      topSubject,
    };
  }

  private async getRecentObservations(
    studentId: string,
    limit: number
  ): Promise<BehavioralObservation[]> {
    const { data } = await this.supabase
      .from('behavioral_observations')
      .select('*')
      .eq('student_id', studentId)
      .order('observed_at', { ascending: false })
      .limit(limit);

    return (data || []).map((o) => ({
      id: o.id,
      studentId: o.student_id,
      sessionId: o.session_id,
      behaviorType: o.behavior_type,
      facultyObserved: o.faculty_observed,
      data: o.observation_data,
      trait: o.behavioral_trait,
      traitStrength: o.trait_strength,
      observedAt: new Date(o.observed_at),
    }));
  }

  private mapToCognitiveFingerprint(data: Record<string, unknown>): CognitiveFingerprint {
    return {
      studentId: data.student_id as string,
      perception: {
        score: (data.perception_score as number) || 0.5,
        tendency: (data.perception_tendency as Record<string, number>) || {},
        observationsCount: (data.perception_observations_count as number) || 0,
        lastUpdated: new Date(data.updated_at as string),
      },
      memory: {
        score: (data.memory_score as number) || 0.5,
        tendency: (data.memory_tendency as Record<string, number>) || {},
        observationsCount: (data.memory_observations_count as number) || 0,
        lastUpdated: new Date(data.updated_at as string),
      },
      imagination: {
        score: (data.imagination_score as number) || 0.5,
        tendency: (data.imagination_tendency as Record<string, number>) || {},
        observationsCount: (data.imagination_observations_count as number) || 0,
        lastUpdated: new Date(data.updated_at as string),
      },
      reason: {
        score: (data.reason_score as number) || 0.5,
        tendency: (data.reason_tendency as Record<string, number>) || {},
        observationsCount: (data.reason_observations_count as number) || 0,
        lastUpdated: new Date(data.updated_at as string),
      },
      desire: {
        score: (data.desire_score as number) || 0.5,
        tendency: (data.desire_tendency as Record<string, number>) || {},
        observationsCount: (data.desire_observations_count as number) || 0,
        lastUpdated: new Date(data.updated_at as string),
      },
      primaryLearningStyle: data.primary_learning_style as string | undefined,
      profileSummary: data.profile_summary as string | undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }

  private mapToVirtueProgress(data: Record<string, unknown>): VirtueProgress {
    return {
      studentId: data.student_id as string,
      curiosity: (data.curiosity_score as number) || 0.5,
      patience: (data.patience_score as number) || 0.5,
      precision: (data.precision_score as number) || 0.5,
      openMindedness: (data.open_mindedness_score as number) || 0.5,
      fairness: (data.fairness_score as number) || 0.5,
      temperance: (data.temperance_score as number) || 0.5,
      courage: (data.courage_score as number) || 0.5,
      reflection: (data.reflection_score as number) || 0.5,
      totalObservations: (data.total_observations as number) || 0,
      virtueNarrative: data.virtue_narrative as string | undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }

  private mapToNextSessionAdjustments(data: Record<string, unknown>): NextSessionAdjustments {
    return {
      studentId: data.student_id as string,
      subject: data.subject as 'history' | 'math' | 'writing',
      suggestedStartingTier: (data.suggested_starting_tier as number) || 1,
      tierAdjustmentReason: data.tier_adjustment_reason as string | undefined,
      suggestedSessionLength: (data.suggested_session_length as number) || 15,
      pacingNotes: data.pacing_notes as string | undefined,
      topicPreferences: (data.topic_preferences as string[]) || [],
      avoidTopics: (data.avoid_topics as string[]) || [],
      agentNotes: data.agent_notes as string | undefined,
      validUntil: new Date(data.valid_until as string),
      createdAt: new Date(data.created_at as string),
    };
  }
}

// Export singleton instance
export const aristotle = new AristotleAgent();
