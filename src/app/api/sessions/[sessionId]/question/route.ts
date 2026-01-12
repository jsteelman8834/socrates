import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';

// GET /api/sessions/[sessionId]/question - Get next question
//
// DISTRACTOR ENGINEERING: The question text stays the same, but we serve
// different answer options based on the student's tier:
// - Tier 1: Wrong era/category distractors (obviously wrong)
// - Tier 2: Same category distractors (require subject knowledge)
// - Tier 3: Near-miss and trap distractors (require deep understanding)

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const supabase = createAdminSupabaseClient();

    // Get the session
    const { data: session, error: sessionError } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      );
    }

    if (session.status !== 'active') {
      return NextResponse.json(
        { error: { code: 'SESSION_ENDED', message: 'Session is not active' } },
        { status: 400 }
      );
    }

    // Current difficulty tier determines which distractor set to use
    const targetTier = session.max_tier_reached || 1;
    const askedIds = session.asked_question_ids || [];

    // Determine subject from session
    const subject = session.subject || 'history';
    const isMath = subject === 'math';

    // Alternate between question types based on subject
    // History: knowledge/wisdom (2-way rotation)
    // Math: fluency/concept/problem_solving (3-way rotation)
    let preferType: string;
    if (isMath) {
      const mathTypes = ['fluency', 'concept', 'problem_solving'];
      preferType = mathTypes[session.questions_attempted % 3];
    } else {
      preferType = session.questions_attempted % 2 === 0 ? 'knowledge' : 'wisdom';
    }

    // Query for questions (we'll get options separately by tier)
    let query = supabase
      .from('questions')
      .select(`
        id,
        topic_id,
        question_text,
        question_type,
        base_difficulty,
        citation_text,
        citation_source
      `)
      .eq('topic_id', session.topic_id)
      .eq('is_active', true);

    // Exclude already asked questions
    if (askedIds.length > 0) {
      query = query.not('id', 'in', `(${askedIds.join(',')})`);
    }

    // Try to get preferred type first
    const { data: questions, error: questionError } = await query
      .eq('question_type', preferType)
      .limit(5);

    let selectedQuestion = null;

    if (questions && questions.length > 0) {
      // Randomly select from available questions
      selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
    } else {
      // Fall back to any question type
      const { data: fallbackQuestions } = await supabase
        .from('questions')
        .select(`
          id,
          topic_id,
          question_text,
          question_type,
          base_difficulty,
          citation_text,
          citation_source
        `)
        .eq('topic_id', session.topic_id)
        .eq('is_active', true)
        .not('id', 'in', askedIds.length > 0 ? `(${askedIds.join(',')})` : '()')
        .limit(5);

      if (fallbackQuestions && fallbackQuestions.length > 0) {
        selectedQuestion =
          fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      }
    }

    if (!selectedQuestion) {
      // No more questions available - end session
      await supabase
        .from('learning_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          ending_tier: session.max_tier_reached,
        })
        .eq('id', sessionId);

      return NextResponse.json({
        success: true,
        data: {
          question: null,
          sessionEnded: true,
          reason: 'NO_QUESTIONS_AVAILABLE',
        },
      });
    }

    // DISTRACTOR ENGINEERING: Get answer options for the student's current tier
    // This is where the magic happens - same question, tier-appropriate distractors
    const { data: optionsForTier, error: optionsError } = await supabase
      .from('answer_options')
      .select(`
        id,
        option_label,
        option_text,
        is_correct,
        difficulty_tier,
        distractor_type,
        trap_explanation
      `)
      .eq('question_id', selectedQuestion.id)
      .eq('difficulty_tier', targetTier)
      .order('option_label');

    // If no options exist for this tier, fall back to tier 1
    let options = optionsForTier;
    if (!options || options.length === 0) {
      const { data: fallbackOptions } = await supabase
        .from('answer_options')
        .select(`
          id,
          option_label,
          option_text,
          is_correct,
          difficulty_tier,
          distractor_type,
          trap_explanation
        `)
        .eq('question_id', selectedQuestion.id)
        .eq('difficulty_tier', 1)
        .order('option_label');

      options = fallbackOptions || [];
    }

    // Shuffle options for variety (but keep correct answer random position)
    const shuffledOptions = shuffleArray(options).map((o: any) => ({
      id: o.id,
      label: o.option_label,
      text: o.option_text,
    }));

    // Update session with current question
    await supabase
      .from('learning_sessions')
      .update({
        current_question_id: selectedQuestion.id,
        asked_question_ids: [...askedIds, selectedQuestion.id],
      })
      .eq('id', sessionId);

    return NextResponse.json({
      success: true,
      data: {
        question: {
          id: selectedQuestion.id,
          topicId: selectedQuestion.topic_id,
          questionText: selectedQuestion.question_text,
          questionType: selectedQuestion.question_type,
          difficultyTier: targetTier, // The tier of distractors being served
          options: shuffledOptions,
          citation: selectedQuestion.citation_source || null,
        },
        sessionState: {
          currentTier: targetTier,
          heartsRemaining: session.hearts_remaining,
          currentStreak: session.current_streak,
          questionsAnswered: session.questions_attempted,
          totalXp: session.xp_earned,
        },
        sessionEnded: false,
      },
    });
  } catch (error) {
    console.error('Question API error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
