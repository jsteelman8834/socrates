import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import { dispatchToAgent, type Subject } from '@/lib/agents';
import { z } from 'zod';
import type { QuestionWithAnswer } from '@/types';
import type { MathQuestionWithAnswer, MathDistractorInfo, PatternHint } from '@/types/math';

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

    // Determine subject from session
    const subject = (session.subject || 'history') as Subject;
    const isMath = subject === 'math';

    // Get the full question with answer info
    // Include subject-specific related data
    const { data: question } = await supabase
      .from('questions')
      .select(
        isMath
          ? `*, pattern_hints (*)`
          : `*, mnemonics (*), socratic_hints (*)`
      )
      .eq('id', questionId)
      .single();

    if (!question) {
      return NextResponse.json(
        { error: { code: 'QUESTION_NOT_FOUND', message: 'Question not found' } },
        { status: 404 }
      );
    }

    // DISTRACTOR ENGINEERING: Get answer options for the current tier
    // This includes the trap_explanation for targeted feedback
    const currentTier = session.max_tier_reached || 1;
    let { data: answerOptions } = await supabase
      .from('answer_options')
      .select('*')
      .eq('question_id', questionId)
      .eq('difficulty_tier', currentTier)
      .order('option_label');

    // Fall back to tier 1 if no options for current tier
    if (!answerOptions || answerOptions.length === 0) {
      const { data: fallbackOptions } = await supabase
        .from('answer_options')
        .select('*')
        .eq('question_id', questionId)
        .eq('difficulty_tier', 1)
        .order('option_label');
      answerOptions = fallbackOptions || [];
    }

    // Build the question object for the agent based on subject
    const correctOption = answerOptions.find((o: any) => o.is_correct);

    // Build subject-appropriate question object
    let questionForAgent: QuestionWithAnswer | MathQuestionWithAnswer;

    if (isMath) {
      // Build math question with procedural error distractors
      const mathDistractors: MathDistractorInfo[] = answerOptions
        .filter((o: any) => !o.is_correct)
        .map((o: any) => ({
          optionId: o.id,
          distractorType: o.distractor_type || 'reasonable_guess',
          errorDescription: o.error_description || '',
          pythgorasGuidance: o.pythagoras_guidance || '',
          showWorkExample: o.show_work_example || undefined,
        }));

      const patternHints: PatternHint[] = (question.pattern_hints || [])
        .sort((a: any, b: any) => a.hint_level - b.hint_level)
        .map((h: any) => ({
          level: h.hint_level,
          text: h.hint_text,
          visualization: h.visualization || undefined,
        }));

      questionForAgent = {
        id: question.id,
        topicId: question.topic_id,
        domain: question.domain || 'multiplication',
        questionText: question.question_text,
        questionType: question.question_type,
        difficultyTier: currentTier as 1 | 2 | 3 | 4,
        options: answerOptions.map((o: any) => ({
          id: o.id,
          label: o.option_label,
          text: o.option_text,
          numericValue: o.numeric_value || undefined,
        })),
        expression: question.math_expression || undefined,
        visualizationHint: question.visualization_hint || undefined,
        correctOptionId: correctOption?.id || '',
        correctAnswer: correctOption?.option_text || '',
        correctNumericValue: correctOption?.numeric_value || undefined,
        answerExplanation: question.answer_explanation || '',
        distractors: mathDistractors,
        patternHints,
        visualizations: question.visualization_hint
          ? [{ type: question.visualization_hint, description: '' }]
          : [],
      } as MathQuestionWithAnswer;
    } else {
      // Build history question with Socratic distractors
      questionForAgent = {
        id: question.id,
        topicId: question.topic_id,
        questionText: question.question_text,
        questionType: question.question_type,
        difficultyTier: currentTier,
        cognitiveVerb: question.cognitive_verb || '',
        questionStem: question.question_stem || '',
        options: answerOptions.map((o: any) => ({
          id: o.id,
          label: o.option_label,
          text: o.option_text,
        })),
        correctOptionId: correctOption?.id || '',
        correctAnswer: correctOption?.option_text || '',
        answerExplanation: question.answer_explanation || '',
        // DISTRACTOR ENGINEERING: Include trap_explanation for targeted feedback
        distractors: answerOptions
          .filter((o: any) => !o.is_correct)
          .map((o: any) => ({
            optionId: o.id,
            distractorType: o.distractor_type || 'same_category',
            confusionExplanation: o.trap_explanation || '',
            trapExplanation: o.trap_explanation || '',
            relatedConcept: undefined,
          })),
        mnemonics: (question.mnemonics || []).map((m: any) => ({
          id: m.id,
          text: m.mnemonic_text,
          type: m.mnemonic_type,
        })),
        socraticHints: (question.socratic_hints || [])
          .sort((a: any, b: any) => a.hint_level - b.hint_level)
          .map((h: any) => ({
            level: h.hint_level,
            text: h.hint_text,
          })),
      } as QuestionWithAnswer;
    }

    // Dispatch to appropriate agent based on subject
    const agentResponse = await dispatchToAgent(
      subject,
      {
        sessionId,
        studentId: user.id,
        studentName: user.display_name,
        currentStreak: session.current_streak,
        heartsRemaining: session.hearts_remaining,
        currentTier: session.max_tier_reached,
      },
      questionForAgent,
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

    // Update session with subject-specific tracking
    const questionType = question.question_type;
    const sessionUpdate: Record<string, unknown> = {
      status: sessionStatus,
      questions_attempted: session.questions_attempted + 1,
      questions_correct: session.questions_correct + (isCorrect ? 1 : 0),
      current_streak: sessionUpdates.newStreak,
      max_streak: Math.max(session.max_streak, sessionUpdates.newStreak),
      hearts_remaining: newHeartsRemaining,
      max_tier_reached: Math.max(session.max_tier_reached, newTier),
      xp_earned: session.xp_earned + sessionUpdates.xpEarned,
      current_question_id: null,
      ended_at: sessionEnded ? new Date().toISOString() : null,
      ending_tier: sessionEnded ? newTier : null,
    };

    // Track question type progress by subject
    if (isMath) {
      // Math: fluency/concept/problem_solving
      if (isCorrect && questionType === 'fluency') {
        sessionUpdate.fluency_correct = (session.fluency_correct || 0) + 1;
      }
      if (isCorrect && questionType === 'concept') {
        sessionUpdate.concept_correct = (session.concept_correct || 0) + 1;
      }
      if (isCorrect && questionType === 'problem_solving') {
        sessionUpdate.problem_solving_correct = (session.problem_solving_correct || 0) + 1;
      }
    } else {
      // History: knowledge/wisdom
      if (isCorrect && questionType === 'knowledge') {
        sessionUpdate.knowledge_correct = (session.knowledge_correct || 0) + 1;
      }
      if (isCorrect && questionType === 'wisdom') {
        sessionUpdate.wisdom_correct = (session.wisdom_correct || 0) + 1;
      }
    }

    await supabase
      .from('learning_sessions')
      .update(sessionUpdate)
      .eq('id', sessionId);

    // Update student profile XP
    if (sessionUpdates.xpEarned > 0) {
      await supabase.rpc('increment_xp', {
        user_id_param: user.id,
        xp_amount: sessionUpdates.xpEarned,
      });
    }

    // Build response with subject-specific progress
    const baseSessionState = {
      currentTier: newTier,
      currentStreak: sessionUpdates.newStreak,
      maxStreak: Math.max(session.max_streak, sessionUpdates.newStreak),
      heartsRemaining: newHeartsRemaining,
      questionsAnswered: session.questions_attempted + 1,
      totalXp: session.xp_earned + sessionUpdates.xpEarned,
      status: sessionStatus,
    };

    // Add subject-specific progress
    const sessionState = isMath
      ? {
          ...baseSessionState,
          fluencyProgress: (sessionUpdate.fluency_correct as number) || session.fluency_correct || 0,
          conceptProgress: (sessionUpdate.concept_correct as number) || session.concept_correct || 0,
          problemSolvingProgress: (sessionUpdate.problem_solving_correct as number) || session.problem_solving_correct || 0,
        }
      : {
          ...baseSessionState,
          knowledgeProgress: (sessionUpdate.knowledge_correct as number) || session.knowledge_correct || 0,
          wisdomProgress: (sessionUpdate.wisdom_correct as number) || session.wisdom_correct || 0,
        };

    const response = {
      success: true,
      data: {
        feedback,
        sessionState,
        sessionEnded,
        tierChanged: sessionUpdates.tierChange !== 0,
        tierDirection: sessionUpdates.tierChange > 0 ? 'up' : sessionUpdates.tierChange < 0 ? 'down' : null,
      },
    };

    // Add session summary if ended
    if (sessionEnded) {
      const totalQuestions = session.questions_attempted + 1;
      const correctAnswers = session.questions_correct + (isCorrect ? 1 : 0);

      // Build subject-specific summary
      const baseSummary = {
        totalQuestions,
        correctAnswers,
        accuracy: correctAnswers / totalQuestions,
        maxStreak: Math.max(session.max_streak, sessionUpdates.newStreak),
        xpEarned: session.xp_earned + sessionUpdates.xpEarned,
        achievementsUnlocked: [],
      };

      if (isMath) {
        // Math-specific summary
        const fluencyCorrect = (sessionUpdate.fluency_correct as number) || session.fluency_correct || 0;
        const conceptCorrect = (sessionUpdate.concept_correct as number) || session.concept_correct || 0;
        const problemSolvingCorrect = (sessionUpdate.problem_solving_correct as number) || session.problem_solving_correct || 0;

        response.data.sessionSummary = {
          ...baseSummary,
          fluencyCorrect,
          conceptCorrect,
          problemSolvingCorrect,
          ratingChange: {
            fluency: isCorrect ? 5 : -3,
            concept: isCorrect ? 5 : -3,
            problemSolving: isCorrect ? 5 : -3,
          },
        };
      } else {
        // History-specific summary
        const knowledgeCorrect = (sessionUpdate.knowledge_correct as number) || session.knowledge_correct || 0;
        const wisdomCorrect = (sessionUpdate.wisdom_correct as number) || session.wisdom_correct || 0;

        response.data.sessionSummary = {
          ...baseSummary,
          knowledgeCorrect,
          wisdomCorrect,
          knowledgeAccuracy:
            knowledgeCorrect > 0
              ? knowledgeCorrect / (knowledgeCorrect + (session.questions_attempted - session.questions_correct) / 2)
              : 0,
          wisdomAccuracy:
            wisdomCorrect > 0
              ? wisdomCorrect / (wisdomCorrect + (session.questions_attempted - session.questions_correct) / 2)
              : 0,
          ratingChange: {
            knowledge: isCorrect ? 5 : -3,
            wisdom: isCorrect ? 5 : -3,
          },
        };
      }
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
