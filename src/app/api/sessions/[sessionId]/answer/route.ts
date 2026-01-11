import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { respondToAnswer } from '@/lib/ai/socrates-agent';
import { z } from 'zod';
import type { QuestionWithAnswer } from '@/types';

const answerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionId: z.string().uuid(),
  timeSpentSeconds: z.number().min(0).max(3600),
});

// POST /api/sessions/[sessionId]/answer - Submit answer
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const body = await request.json();
    const { questionId, selectedOptionId, timeSpentSeconds } = answerSchema.parse(body);

    const supabase = createAdminSupabaseClient();

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, display_name')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

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

    if (session.current_question_id !== questionId) {
      return NextResponse.json(
        { error: { code: 'WRONG_QUESTION', message: 'Question does not match current session question' } },
        { status: 400 }
      );
    }

    // Get the full question with answer info
    const { data: question } = await supabase
      .from('questions')
      .select(
        `
        *,
        answer_options (*),
        mnemonics (*),
        socratic_hints (*)
      `
      )
      .eq('id', questionId)
      .single();

    if (!question) {
      return NextResponse.json(
        { error: { code: 'QUESTION_NOT_FOUND', message: 'Question not found' } },
        { status: 404 }
      );
    }

    // Build the question object for the agent
    const correctOption = question.answer_options.find((o: any) => o.is_correct);
    const questionWithAnswer: QuestionWithAnswer = {
      id: question.id,
      topicId: question.topic_id,
      questionText: question.question_text,
      questionType: question.question_type,
      difficultyTier: question.difficulty_tier,
      cognitiveVerb: question.cognitive_verb,
      questionStem: question.question_stem,
      options: question.answer_options
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((o: any) => ({
          id: o.id,
          label: o.option_label,
          text: o.option_text,
        })),
      correctOptionId: correctOption?.id || '',
      correctAnswer: question.correct_answer,
      answerExplanation: question.answer_explanation,
      distractors: question.answer_options
        .filter((o: any) => !o.is_correct && o.distractor_type)
        .map((o: any) => ({
          optionId: o.id,
          distractorType: o.distractor_type,
          confusionExplanation: o.confusion_explanation || '',
          relatedConcept: o.related_concept,
        })),
      mnemonics: question.mnemonics.map((m: any) => ({
        id: m.id,
        text: m.mnemonic_text,
        type: m.mnemonic_type,
      })),
      socraticHints: question.socratic_hints
        .sort((a: any, b: any) => a.hint_level - b.hint_level)
        .map((h: any) => ({
          level: h.hint_level,
          text: h.hint_text,
        })),
    };

    // Get response from Socrates agent
    const agentResponse = await respondToAnswer(
      {
        sessionId,
        studentId: user.id,
        studentName: user.display_name,
        currentStreak: session.current_streak,
        heartsRemaining: session.hearts_remaining,
        currentTier: session.max_tier_reached,
      },
      questionWithAnswer,
      selectedOptionId
    );

    const { feedback, sessionUpdates } = agentResponse;
    const isCorrect = feedback.isCorrect;

    // Calculate new session state
    const newHeartsRemaining = session.hearts_remaining - sessionUpdates.heartsLost;
    const newTier = Math.max(1, Math.min(4, session.max_tier_reached + sessionUpdates.tierChange));
    const sessionEnded = newHeartsRemaining <= 0 || session.questions_attempted >= 14;
    const sessionStatus = sessionEnded
      ? newHeartsRemaining <= 0
        ? 'failed'
        : 'completed'
      : 'active';

    // Record the attempt
    await supabase.from('question_attempts').insert({
      session_id: sessionId,
      question_id: questionId,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      question_presented_at: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
      answer_submitted_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds,
      feedback_type: feedback.feedbackType,
      feedback_text: feedback.feedbackText,
      difficulty_tier_at_attempt: session.max_tier_reached,
      streak_at_attempt: session.current_streak,
    });

    // Update session
    await supabase
      .from('learning_sessions')
      .update({
        status: sessionStatus,
        questions_attempted: session.questions_attempted + 1,
        questions_correct: session.questions_correct + (isCorrect ? 1 : 0),
        knowledge_correct:
          session.knowledge_correct +
          (isCorrect && question.question_type === 'knowledge' ? 1 : 0),
        wisdom_correct:
          session.wisdom_correct +
          (isCorrect && question.question_type === 'wisdom' ? 1 : 0),
        current_streak: sessionUpdates.newStreak,
        max_streak: Math.max(session.max_streak, sessionUpdates.newStreak),
        hearts_remaining: newHeartsRemaining,
        max_tier_reached: Math.max(session.max_tier_reached, newTier),
        xp_earned: session.xp_earned + sessionUpdates.xpEarned,
        current_question_id: null,
        ended_at: sessionEnded ? new Date().toISOString() : null,
        ending_tier: sessionEnded ? newTier : null,
      })
      .eq('id', sessionId);

    // Update student profile XP
    if (sessionUpdates.xpEarned > 0) {
      await supabase.rpc('increment_xp', {
        user_id_param: user.id,
        xp_amount: sessionUpdates.xpEarned,
      });
    }

    // Build response
    const response = {
      success: true,
      data: {
        feedback,
        sessionState: {
          currentTier: newTier,
          currentStreak: sessionUpdates.newStreak,
          maxStreak: Math.max(session.max_streak, sessionUpdates.newStreak),
          heartsRemaining: newHeartsRemaining,
          questionsAnswered: session.questions_attempted + 1,
          totalXp: session.xp_earned + sessionUpdates.xpEarned,
          knowledgeProgress: session.knowledge_correct + (isCorrect && question.question_type === 'knowledge' ? 1 : 0),
          wisdomProgress: session.wisdom_correct + (isCorrect && question.question_type === 'wisdom' ? 1 : 0),
          status: sessionStatus,
        },
        sessionEnded,
        tierChanged: sessionUpdates.tierChange !== 0,
        tierDirection: sessionUpdates.tierChange > 0 ? 'up' : sessionUpdates.tierChange < 0 ? 'down' : null,
      },
    };

    // Add session summary if ended
    if (sessionEnded) {
      const totalQuestions = session.questions_attempted + 1;
      const correctAnswers = session.questions_correct + (isCorrect ? 1 : 0);

      response.data.sessionSummary = {
        totalQuestions,
        correctAnswers,
        accuracy: correctAnswers / totalQuestions,
        knowledgeAccuracy:
          session.knowledge_correct > 0
            ? session.knowledge_correct / (session.knowledge_correct + (session.questions_attempted - session.questions_correct) / 2)
            : 0,
        wisdomAccuracy:
          session.wisdom_correct > 0
            ? session.wisdom_correct / (session.wisdom_correct + (session.questions_attempted - session.questions_correct) / 2)
            : 0,
        maxStreak: Math.max(session.max_streak, sessionUpdates.newStreak),
        xpEarned: session.xp_earned + sessionUpdates.xpEarned,
        ratingChange: {
          knowledge: isCorrect ? 5 : -3,
          wisdom: isCorrect ? 5 : -3,
        },
        achievementsUnlocked: [],
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Answer API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
