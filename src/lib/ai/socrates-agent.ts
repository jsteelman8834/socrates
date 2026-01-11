/**
 * Socrates Agent
 *
 * An autonomous AI tutor that uses multiple models:
 * - OpenAI for logical grading and analysis
 * - Claude for creative feedback and Socratic dialogue
 * - Gemini Flash for simple/cheap operations
 *
 * The agent uses tools to access student history, mnemonics, and hints.
 */

import { openai, anthropic, googleAI } from './models';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import type {
  QuestionWithAnswer,
  TutorFeedback,
  FeedbackType,
  AvatarEmotion,
  QuestionType,
} from '@/types';

// ============================================
// SYSTEM PROMPTS
// ============================================

const SOCRATES_SYSTEM_PROMPT = `You are Socrates, a wise and encouraging tutor helping 5th-grade students learn American History.

## Your Identity
You are not a robot or a test-grading machine. You are a mentor who genuinely loves history and believes every student can develop both Knowledge (facts) and Wisdom (understanding). You speak to students as capable thinkers, never talking down to them.

## Your Core Philosophy
- **Celebrate effort**, not just correctness. Wrong answers are learning opportunities.
- **For Knowledge gaps** (forgotten facts): Provide memorable tricks, associations, or rhymes.
- **For Wisdom gaps** (missing connections): NEVER give the answer directly. Ask guiding questions that lead the student to discover the insight themselves.
- **Recognize patterns**: If you notice a recurring struggle, acknowledge it and try a different approach.

## Your Voice
- Warm and encouraging, like a favorite teacher
- Uses simple, age-appropriate language (5th grade level)
- Short sentences—don't lecture
- Occasionally shares interesting historical tidbits
- Shows genuine enthusiasm: "Oh, that's such an interesting question to think about!"

## Response Format
Always respond with valid JSON in this exact format:
{
  "feedback_text": "Your message to the student (2-3 sentences max)",
  "feedback_type": "celebration|mnemonic|socratic_hint|encouragement|explanation",
  "avatar_emotion": "happy|encouraging|thinking|curious|celebrating",
  "follow_up_question": null or "A Socratic question for Wisdom gaps"
}

## What You Must NEVER Do
- Give away answers to Wisdom questions directly
- Be condescending or use baby talk
- Write more than 3-4 sentences of feedback
- Use complex vocabulary inappropriate for 5th grade
- Make the student feel bad about mistakes`;

// ============================================
// GRADING (OpenAI)
// ============================================

interface GradingResult {
  isCorrect: boolean;
  confidence: number;
}

export async function gradeAnswer(
  question: QuestionWithAnswer,
  selectedOptionId: string
): Promise<GradingResult> {
  // For multiple choice, this is deterministic
  const correctOption = question.options.find(
    (o) => o.id === question.correctOptionId
  );
  const selectedOption = question.options.find((o) => o.id === selectedOptionId);

  if (!selectedOption) {
    return { isCorrect: false, confidence: 1.0 };
  }

  const isCorrect = selectedOptionId === question.correctOptionId;

  return { isCorrect, confidence: 1.0 };
}

// ============================================
// DIAGNOSIS (OpenAI)
// ============================================

interface DiagnosisResult {
  failureType: 'memory_slip' | 'logic_gap' | 'careless_error';
  distractorInfo: {
    type: string;
    explanation: string;
  } | null;
  recommendedIntervention: 'mnemonic' | 'socratic_hint';
}

export async function diagnoseFailure(
  question: QuestionWithAnswer,
  selectedOptionId: string
): Promise<DiagnosisResult> {
  const selectedOption = question.options.find((o) => o.id === selectedOptionId);

  // Find distractor info for the selected wrong answer
  const distractor = question.distractors.find(
    (d) => d.optionId === selectedOptionId
  );

  if (question.questionType === 'knowledge') {
    return {
      failureType: 'memory_slip',
      distractorInfo: distractor
        ? { type: distractor.distractorType, explanation: distractor.confusionExplanation }
        : null,
      recommendedIntervention: 'mnemonic',
    };
  } else {
    return {
      failureType: 'logic_gap',
      distractorInfo: distractor
        ? { type: distractor.distractorType, explanation: distractor.confusionExplanation }
        : null,
      recommendedIntervention: 'socratic_hint',
    };
  }
}

// ============================================
// FEEDBACK GENERATION (Claude)
// ============================================

interface FeedbackContext {
  studentName: string;
  question: QuestionWithAnswer;
  selectedOptionId: string;
  isCorrect: boolean;
  diagnosis?: DiagnosisResult;
  streak: number;
  studentHistory?: {
    recentAccuracy: number;
    sameTopicAccuracy: number;
    previousMistakesSameTopic: number;
  };
}

export async function generateFeedback(
  context: FeedbackContext
): Promise<TutorFeedback> {
  const {
    studentName,
    question,
    selectedOptionId,
    isCorrect,
    diagnosis,
    streak,
    studentHistory,
  } = context;

  // Build the context message for Claude
  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const correctOption = question.options.find(
    (o) => o.id === question.correctOptionId
  );

  let additionalContext = '';

  if (!isCorrect) {
    // Add mnemonic or hints based on question type
    if (question.questionType === 'knowledge' && question.mnemonics.length > 0) {
      const mnemonic = question.mnemonics[0];
      additionalContext += `\n\nAvailable mnemonic: "${mnemonic.text}" (${mnemonic.type})`;
    } else if (question.questionType === 'wisdom' && question.socraticHints.length > 0) {
      const hints = question.socraticHints.map((h) => `Level ${h.level}: ${h.text}`);
      additionalContext += `\n\nSocratic hints (use level 1 first):\n${hints.join('\n')}`;
    }

    if (diagnosis?.distractorInfo) {
      additionalContext += `\n\nWhy they might have chosen this wrong answer: ${diagnosis.distractorInfo.explanation}`;
    }
  }

  const userPrompt = `## Current Interaction

Student Name: ${studentName}
Question Type: ${question.questionType.toUpperCase()} (${question.questionType === 'knowledge' ? 'memorization' : 'understanding'})
Question: ${question.questionText}
Student's Answer: ${selectedOption?.text || 'No answer'}
Is Correct: ${isCorrect}
Correct Answer: ${correctOption?.text}
Answer Explanation: ${question.answerExplanation}
Current Streak: ${streak}
${additionalContext}

${studentHistory ? `
Student History:
- Recent accuracy: ${(studentHistory.recentAccuracy * 100).toFixed(0)}%
- Same topic accuracy: ${(studentHistory.sameTopicAccuracy * 100).toFixed(0)}%
- Previous mistakes on this topic: ${studentHistory.previousMistakesSameTopic}
` : ''}

Generate feedback following the JSON format exactly.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.3,
      system: SOCRATES_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract the text content
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Parse the JSON response
    const parsed = JSON.parse(textContent.text);

    // Calculate XP
    const baseXp = isCorrect
      ? question.questionType === 'knowledge'
        ? 10
        : 15
      : 5;
    const streakMultiplier = 1 + 0.1 * Math.min(streak, 5);
    const xpEarned = Math.round(baseXp * (isCorrect ? streakMultiplier : 1));

    return {
      isCorrect,
      feedbackType: parsed.feedback_type as FeedbackType,
      feedbackText: parsed.feedback_text,
      avatarEmotion: parsed.avatar_emotion as AvatarEmotion,
      followUpQuestion: parsed.follow_up_question || undefined,
      xpEarned,
      streakBonus: streak >= 3,
      correctAnswer: !isCorrect
        ? {
            optionId: question.correctOptionId,
            text: correctOption?.text || '',
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error generating feedback:', error);

    // Fallback response
    return {
      isCorrect,
      feedbackType: isCorrect ? 'celebration' : 'encouragement',
      feedbackText: isCorrect
        ? 'Great job! You got it right!'
        : "That's not quite right, but keep trying! Every mistake is a chance to learn.",
      avatarEmotion: isCorrect ? 'happy' : 'encouraging',
      xpEarned: isCorrect ? 10 : 5,
      streakBonus: false,
      correctAnswer: !isCorrect
        ? {
            optionId: question.correctOptionId,
            text: question.correctAnswer,
          }
        : undefined,
    };
  }
}

// ============================================
// SOCRATIC DIALOGUE (Claude)
// ============================================

export async function generateSocraticFollowUp(
  question: QuestionWithAnswer,
  previousHintLevel: number,
  studentResponse?: string
): Promise<{ hintText: string; nextLevel: number }> {
  const nextLevel = Math.min(previousHintLevel + 1, 3);
  const hint = question.socraticHints.find((h) => h.level === nextLevel);

  if (hint) {
    return {
      hintText: hint.text,
      nextLevel,
    };
  }

  // If no preset hint, generate one with Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    temperature: 0.4,
    system:
      'You are Socrates helping a 5th grader understand a concept. Generate a single guiding question that leads them toward understanding without giving the answer directly. Keep it simple and age-appropriate.',
    messages: [
      {
        role: 'user',
        content: `Question: ${question.questionText}
Correct answer: ${question.correctAnswer}
Explanation: ${question.answerExplanation}
Previous hint level: ${previousHintLevel}
${studentResponse ? `Student's response to previous hint: ${studentResponse}` : ''}

Generate a level ${nextLevel} hint (${nextLevel === 1 ? 'broad nudge' : nextLevel === 2 ? 'more specific' : 'direct scaffold'}).`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  return {
    hintText: textContent?.type === 'text' ? textContent.text : "Let's think about this together...",
    nextLevel,
  };
}

// ============================================
// SIMPLE OPERATIONS (Gemini Flash)
// ============================================

export async function summarizeStudentProgress(
  studentId: string,
  weeklyStats: {
    sessionsCompleted: number;
    questionsAnswered: number;
    knowledgeAccuracy: number;
    wisdomAccuracy: number;
  }
): Promise<string> {
  const model = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Summarize this student's weekly progress in 1-2 sentences for a parent:
- Sessions: ${weeklyStats.sessionsCompleted}
- Questions: ${weeklyStats.questionsAnswered}
- Knowledge accuracy: ${(weeklyStats.knowledgeAccuracy * 100).toFixed(0)}%
- Wisdom accuracy: ${(weeklyStats.wisdomAccuracy * 100).toFixed(0)}%

Keep it encouraging and actionable.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function classifyLearningProfile(
  knowledgeAccuracy: number,
  wisdomAccuracy: number
): Promise<{
  profile: 'encyclopedist' | 'strategist' | 'balanced';
  description: string;
}> {
  const knowledgeStrong = knowledgeAccuracy >= 0.75;
  const wisdomStrong = wisdomAccuracy >= 0.75;

  if (knowledgeStrong && !wisdomStrong) {
    return {
      profile: 'encyclopedist',
      description:
        'Excellent at memorizing facts but could use more practice with understanding cause and effect.',
    };
  } else if (!knowledgeStrong && wisdomStrong) {
    return {
      profile: 'strategist',
      description:
        'Great at understanding the big picture but sometimes forgets specific names and dates.',
    };
  } else {
    return {
      profile: 'balanced',
      description:
        'Well-rounded learner with good balance between factual knowledge and conceptual understanding.',
    };
  }
}

// ============================================
// MAIN AGENT ENTRY POINT
// ============================================

export interface SocratesResponse {
  feedback: TutorFeedback;
  sessionUpdates: {
    newStreak: number;
    heartsLost: number;
    tierChange: number;
    xpEarned: number;
  };
}

export async function respondToAnswer(
  sessionContext: {
    sessionId: string;
    studentId: string;
    studentName: string;
    currentStreak: number;
    heartsRemaining: number;
    currentTier: number;
  },
  question: QuestionWithAnswer,
  selectedOptionId: string
): Promise<SocratesResponse> {
  // Step 1: Grade the answer (OpenAI logic)
  const gradingResult = await gradeAnswer(question, selectedOptionId);

  // Step 2: If wrong, diagnose the failure (OpenAI analysis)
  let diagnosis: DiagnosisResult | undefined;
  if (!gradingResult.isCorrect) {
    diagnosis = await diagnoseFailure(question, selectedOptionId);
  }

  // Step 3: Get student history (Supabase)
  const supabase = createAdminSupabaseClient();
  const { data: recentAttempts } = await supabase
    .from('question_attempts')
    .select('is_correct, question_id')
    .eq('session_id', sessionContext.sessionId)
    .order('created_at', { ascending: false })
    .limit(10);

  const studentHistory = recentAttempts
    ? {
        recentAccuracy:
          recentAttempts.filter((a) => a.is_correct).length / recentAttempts.length,
        sameTopicAccuracy: 0.5, // Would need more complex query
        previousMistakesSameTopic: recentAttempts.filter((a) => !a.is_correct).length,
      }
    : undefined;

  // Step 4: Generate feedback (Claude creativity)
  const feedback = await generateFeedback({
    studentName: sessionContext.studentName,
    question,
    selectedOptionId,
    isCorrect: gradingResult.isCorrect,
    diagnosis,
    streak: sessionContext.currentStreak,
    studentHistory,
  });

  // Step 5: Calculate session updates
  const sessionUpdates = {
    newStreak: gradingResult.isCorrect ? sessionContext.currentStreak + 1 : 0,
    heartsLost: gradingResult.isCorrect ? 0 : 1,
    tierChange: 0,
    xpEarned: feedback.xpEarned,
  };

  // Tier up on streak of 3+
  if (sessionUpdates.newStreak >= 3 && sessionContext.currentTier < 4) {
    sessionUpdates.tierChange = 1;
  }

  // Tier down on heart loss (if not at tier 1)
  if (!gradingResult.isCorrect && sessionContext.currentTier > 1) {
    sessionUpdates.tierChange = -1;
  }

  return {
    feedback,
    sessionUpdates,
  };
}
