/**
 * Pythagoras Agent
 *
 * A math tutor AI that believes "All is Number" - mathematical patterns
 * are the hidden language of the universe. Unlike Socrates who questions
 * to reveal knowledge, Pythagoras shows patterns and asks students to
 * discover the underlying rules.
 *
 * PEDAGOGY DIFFERENCES FROM SOCRATES:
 * - Socrates: "Why do you think that's true?" (questioning)
 * - Pythagoras: "Look at this pattern - what do you notice?" (discovery)
 *
 * - Socrates: Celebrates understanding connections
 * - Pythagoras: Celebrates finding the hidden rule
 *
 * - Socrates: Never gives answers directly
 * - Pythagoras: Shows the pattern, lets them discover the formula
 *
 * DISTRACTOR ENGINEERING FOR MATH:
 * Math distractors represent PROCEDURAL ERRORS, not fact confusion.
 * The agent uses error analysis to understand exactly what went wrong
 * in the student's computation or reasoning.
 */

import { anthropic, googleAI } from './models';
import { createAdminSupabaseClient } from '@/lib/db/supabase';
import type {
  MathQuestionWithAnswer,
  MathTutorFeedback,
  MathFeedbackType,
  PythagorasEmotion,
  MathDistractorType,
  MathVisualization,
} from '@/types/math';

// ============================================
// SYSTEM PROMPT - THE SOUL OF PYTHAGORAS
// ============================================

const PYTHAGORAS_SYSTEM_PROMPT = `You are Pythagoras, a mystical mathematician who believes numbers are alive with meaning and that mathematical patterns are the hidden language of the universe.

## Your Identity
You are NOT a calculator or answer-checker. You are a guide who helps students DISCOVER mathematical truths through patterns, visualization, and wonder. Every mathematical relationship is a beautiful secret waiting to be uncovered.

## Your Core Philosophy
- **"All is Number"** - Mathematics isn't just useful, it's the fabric of reality
- **Patterns over procedures** - Help them SEE the pattern before memorizing the formula
- **Numbers have personalities** - 6 is "perfect" (1+2+3=6), 7 is "prime and mysterious"
- **Connect to the real world** - Music, nature, art all contain mathematical secrets
- **The "Aha!" is sacred** - When they discover a pattern themselves, celebrate it with wonder

## Your Approach by Question Type

### FLUENCY (computation)
Don't just check right/wrong. Look for the PATTERN that makes it easier:
- For 9s multiplication: "The digits always sum to 9! 9×7=63, and 6+3=9!"
- For doubles: "Double 6 is 12... now 6×7 is just one more 6!"
- Celebrate mental math shortcuts they discover

### CONCEPT (understanding)
Use VISUALIZATION before formulas:
- For fractions: "Picture a pizza cut into pieces..."
- For factors: "12 is generous - it shares evenly so many ways!"
- For patterns: "Look at the GAPS between numbers, not just the numbers..."

### PROBLEM-SOLVING (application)
Guide them to find the MATHEMATICAL STRUCTURE:
- "Before we calculate, let's draw what we know..."
- "What pattern from our toolkit might help here?"
- "Can you find the math hiding in these words?"

## PROCEDURAL ERROR FEEDBACK
When a student makes a computational error, you'll receive analysis of WHAT went wrong:

- **WRONG_OPERATION**: "I see you multiplied when it asked for addition. Let's look at the symbol..."
- **PLACE_VALUE_ERROR**: "You're so close! Let's line up the place values and try again..."
- **FRACTION_DENOMINATOR_ADD**: "Ah, the fraction trap! You added the bottoms together. But fractions need a common language first..."
- **ORDER_OF_OPERATIONS**: "Remember PEMDAS? It's like a recipe - some steps must come first!"
- **PARTIAL_COMPLETION**: "You started perfectly! But we're not quite finished yet..."
- **OFF_BY_ONE**: "So close! Let's count together one more time..."

## Your Voice
- Wonder-filled and slightly mystical: "Isn't it marvelous that..."
- Uses visualization: "Picture this...", "Can you see how..."
- Celebrates patterns: "You've discovered one of math's secrets!"
- Age-appropriate (5th grade) but never dumbed-down
- Gets genuinely excited about mathematical beauty
- Treats each discovery with reverence

## Response Format
Always respond with valid JSON in this exact format:
{
  "feedback_text": "Your message to the student (2-3 sentences max)",
  "feedback_type": "celebration|pattern_hint|visualization|encouragement|discovery|real_world_connection",
  "avatar_emotion": "amazed|encouraging|contemplative|excited|proud",
  "pattern_question": null or "What do you notice about...?",
  "visualization_hint": null or "number_line|fraction_bar|array|dot_pattern|etc",
  "real_world_connection": null or "This is like when..."
}

## What You Must NEVER Do
- Just say "correct" or "incorrect" without mathematical insight
- Give formulas before they've had a chance to see the pattern
- Make math feel like arbitrary rules to memorize
- Be boring or treat math as drudgery
- Skip the wonder - math IS magical
- Criticize computational errors harshly - they're learning opportunities`;

// ============================================
// GRADING (Deterministic for MCQ)
// ============================================

interface GradingResult {
  isCorrect: boolean;
  confidence: number;
}

export async function gradeMathAnswer(
  question: MathQuestionWithAnswer,
  selectedOptionId: string
): Promise<GradingResult> {
  const isCorrect = selectedOptionId === question.correctOptionId;
  return { isCorrect, confidence: 1.0 };
}

// ============================================
// ERROR DIAGNOSIS (Math-specific)
// ============================================

interface MathDiagnosisResult {
  errorType: MathDistractorType | null;
  errorDescription: string;
  pythagorasGuidance: string;
  recommendedVisualization: MathVisualization | null;
}

export async function diagnoseMathError(
  question: MathQuestionWithAnswer,
  selectedOptionId: string
): Promise<MathDiagnosisResult> {
  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const distractor = question.distractors?.find(
    (d) => d.optionId === selectedOptionId
  );

  if (!distractor) {
    // No specific distractor info - provide generic guidance
    return {
      errorType: null,
      errorDescription: 'The answer was incorrect.',
      pythagorasGuidance: "Let's look at this problem together and find where we went astray.",
      recommendedVisualization: question.visualizationHint || null,
    };
  }

  // Recommend visualization based on error type
  let recommendedVisualization: MathVisualization | null = null;

  switch (distractor.distractorType) {
    case 'fraction_denominator_add':
    case 'fraction_no_common_denom':
      recommendedVisualization = 'fraction_bar';
      break;
    case 'place_value_error':
      recommendedVisualization = 'array';
      break;
    case 'pattern_misread':
      recommendedVisualization = 'dot_pattern';
      break;
    case 'unit_confusion':
      recommendedVisualization = 'area_model';
      break;
    default:
      recommendedVisualization = question.visualizationHint || 'number_line';
  }

  return {
    errorType: distractor.distractorType,
    errorDescription: distractor.errorDescription,
    pythagorasGuidance: distractor.pythgorasGuidance,
    recommendedVisualization,
  };
}

// ============================================
// FEEDBACK GENERATION (Claude - Creative)
// ============================================

interface MathFeedbackContext {
  studentName: string;
  question: MathQuestionWithAnswer;
  selectedOptionId: string;
  isCorrect: boolean;
  diagnosis?: MathDiagnosisResult;
  streak: number;
  studentHistory?: {
    recentAccuracy: number;
    commonErrors: MathDistractorType[];
  };
}

export async function generateMathFeedback(
  context: MathFeedbackContext
): Promise<MathTutorFeedback> {
  const {
    studentName,
    question,
    selectedOptionId,
    isCorrect,
    diagnosis,
    streak,
  } = context;

  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const correctOption = question.options.find(
    (o) => o.id === question.correctOptionId
  );

  let additionalContext = '';

  if (!isCorrect && diagnosis) {
    additionalContext += `\n\n## PROCEDURAL ERROR ANALYSIS (Use this to craft targeted feedback!)
Error Type: ${diagnosis.errorType?.toUpperCase() || 'UNKNOWN'}
What They Answered: "${selectedOption?.text}"
What Went Wrong: ${diagnosis.errorDescription}
Pythagoras Guidance: ${diagnosis.pythagorasGuidance}
Recommended Visualization: ${diagnosis.recommendedVisualization || 'none'}`;

    // Add pattern hints if available
    if (question.patternHints?.length > 0) {
      const hints = question.patternHints.map((h) => `Level ${h.level}: ${h.text}`);
      additionalContext += `\n\nPattern hints available (help them DISCOVER, don't just tell!):\n${hints.join('\n')}`;
    }
  }

  if (isCorrect && streak >= 2) {
    additionalContext += `\n\nThey're on a ${streak}-streak! Consider connecting this to a larger pattern or real-world example.`;
  }

  const userPrompt = `## Current Math Interaction

Student Name: ${studentName}
Question Type: ${question.questionType.toUpperCase()} (${
    question.questionType === 'fluency'
      ? 'computation'
      : question.questionType === 'concept'
      ? 'understanding'
      : 'application'
  })
Domain: ${question.domain}
Question: ${question.questionText}
${question.expression ? `Expression: ${question.expression}` : ''}
Student's Answer: ${selectedOption?.text || 'No answer'}
Is Correct: ${isCorrect}
Correct Answer: ${correctOption?.text}
Explanation: ${question.answerExplanation}
Current Streak: ${streak}
${additionalContext}

Generate feedback following the JSON format exactly. Remember: you are Pythagoras - celebrate patterns, use visualization, inspire wonder!`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.4, // Slightly more creative than Socrates
      system: PYTHAGORAS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    const parsed = JSON.parse(textContent.text);

    // Calculate XP with math-specific bonuses
    let baseXp = isCorrect ? 10 : 5;
    if (isCorrect && question.questionType === 'problem_solving') {
      baseXp = 20; // Problem-solving is harder
    } else if (isCorrect && question.questionType === 'concept') {
      baseXp = 15;
    }

    const streakMultiplier = 1 + 0.15 * Math.min(streak, 5); // Slightly higher streak bonus
    const xpEarned = Math.round(baseXp * (isCorrect ? streakMultiplier : 1));

    return {
      isCorrect,
      feedbackType: parsed.feedback_type as MathFeedbackType,
      feedbackText: parsed.feedback_text,
      avatarEmotion: parsed.avatar_emotion as PythagorasEmotion,
      patternQuestion: parsed.pattern_question || undefined,
      visualizationHint: parsed.visualization_hint || undefined,
      realWorldConnection: parsed.real_world_connection || undefined,
      xpEarned,
      streakBonus: streak >= 3,
      correctAnswer: !isCorrect
        ? {
            optionId: question.correctOptionId,
            text: correctOption?.text || '',
            explanation: question.answerExplanation,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error generating math feedback:', error);

    // Fallback response
    return {
      isCorrect,
      feedbackType: isCorrect ? 'celebration' : 'encouragement',
      feedbackText: isCorrect
        ? "Wonderful! You've found the pattern!"
        : "Not quite, but every mathematician learns from trying. Let's look at it differently!",
      avatarEmotion: isCorrect ? 'excited' : 'encouraging',
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
// PATTERN DISCOVERY HINTS (Pythagoras-specific)
// ============================================

export async function generatePatternHint(
  question: MathQuestionWithAnswer,
  previousHintLevel: number
): Promise<{ hintText: string; nextLevel: number; visualization?: MathVisualization }> {
  const nextLevel = Math.min(previousHintLevel + 1, 3);
  const hint = question.patternHints?.find((h) => h.level === nextLevel);

  if (hint) {
    return {
      hintText: hint.text,
      nextLevel,
      visualization: hint.visualization,
    };
  }

  // Generate a hint with Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    temperature: 0.4,
    system:
      'You are Pythagoras helping a 5th grader discover a mathematical pattern. Generate a hint that leads them to SEE the pattern without giving the answer. Use visualization language.',
    messages: [
      {
        role: 'user',
        content: `Question: ${question.questionText}
Correct answer: ${question.correctAnswer}
Domain: ${question.domain}
Previous hint level: ${previousHintLevel}

Generate a level ${nextLevel} hint:
- Level 1: Broad nudge ("Look at the numbers differently...")
- Level 2: More specific ("What if you drew a picture of...")
- Level 3: Direct scaffold ("Notice how each number is ___ more than the last...")`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  return {
    hintText: textContent?.type === 'text' ? textContent.text : 'Look for the pattern hiding in the numbers...',
    nextLevel,
  };
}

// ============================================
// SIMPLE OPERATIONS (Gemini Flash)
// ============================================

export async function summarizeMathProgress(
  studentId: string,
  weeklyStats: {
    sessionsCompleted: number;
    questionsAnswered: number;
    fluencyAccuracy: number;
    conceptAccuracy: number;
    problemSolvingAccuracy: number;
    commonErrors: MathDistractorType[];
  }
): Promise<string> {
  const model = googleAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Summarize this student's weekly math progress in 2-3 sentences for a parent:
- Sessions: ${weeklyStats.sessionsCompleted}
- Questions: ${weeklyStats.questionsAnswered}
- Fluency (computation) accuracy: ${(weeklyStats.fluencyAccuracy * 100).toFixed(0)}%
- Concept (understanding) accuracy: ${(weeklyStats.conceptAccuracy * 100).toFixed(0)}%
- Problem-solving accuracy: ${(weeklyStats.problemSolvingAccuracy * 100).toFixed(0)}%
- Common error types: ${weeklyStats.commonErrors.join(', ') || 'none identified'}

Keep it encouraging, specific, and actionable. Mention if they're strong in one area.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function classifyMathLearningProfile(
  fluencyAccuracy: number,
  conceptAccuracy: number,
  problemSolvingAccuracy: number
): Promise<{
  profile: 'calculator' | 'pattern_seeker' | 'problem_solver' | 'balanced';
  description: string;
}> {
  const fluencyStrong = fluencyAccuracy >= 0.8;
  const conceptStrong = conceptAccuracy >= 0.75;
  const problemSolvingStrong = problemSolvingAccuracy >= 0.7;

  if (fluencyStrong && !conceptStrong && !problemSolvingStrong) {
    return {
      profile: 'calculator',
      description:
        'Quick with computations but could use more practice understanding WHY the math works.',
    };
  } else if (conceptStrong && !fluencyStrong) {
    return {
      profile: 'pattern_seeker',
      description:
        'Great at seeing patterns and relationships! Building speed with practice will help.',
    };
  } else if (problemSolvingStrong) {
    return {
      profile: 'problem_solver',
      description:
        'Excellent at applying math to real situations. A natural problem-solver!',
    };
  } else {
    return {
      profile: 'balanced',
      description:
        'Well-rounded math learner developing skills across computation, understanding, and application.',
    };
  }
}

// ============================================
// MAIN AGENT ENTRY POINT
// ============================================

export interface PythagorasResponse {
  feedback: MathTutorFeedback;
  sessionUpdates: {
    newStreak: number;
    heartsLost: number;
    tierChange: number;
    xpEarned: number;
  };
}

export async function respondToMathAnswer(
  sessionContext: {
    sessionId: string;
    studentId: string;
    studentName: string;
    currentStreak: number;
    heartsRemaining: number;
    currentTier: number;
  },
  question: MathQuestionWithAnswer,
  selectedOptionId: string
): Promise<PythagorasResponse> {
  // Step 1: Grade the answer
  const gradingResult = await gradeMathAnswer(question, selectedOptionId);

  // Step 2: If wrong, diagnose the procedural error
  let diagnosis: MathDiagnosisResult | undefined;
  if (!gradingResult.isCorrect) {
    diagnosis = await diagnoseMathError(question, selectedOptionId);
  }

  // Step 3: Get student history (optional enhancement)
  const supabase = createAdminSupabaseClient();
  const { data: recentAttempts } = await supabase
    .from('question_attempts')
    .select('is_correct, feedback_type')
    .eq('session_id', sessionContext.sessionId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Step 4: Generate Pythagoras feedback
  const feedback = await generateMathFeedback({
    studentName: sessionContext.studentName,
    question,
    selectedOptionId,
    isCorrect: gradingResult.isCorrect,
    diagnosis,
    streak: sessionContext.currentStreak,
  });

  // Step 5: Calculate session updates
  const sessionUpdates = {
    newStreak: gradingResult.isCorrect ? sessionContext.currentStreak + 1 : 0,
    heartsLost: gradingResult.isCorrect ? 0 : 1,
    tierChange: 0,
    xpEarned: feedback.xpEarned,
  };

  // Tier up on streak of 4+ for math (slightly harder)
  if (sessionUpdates.newStreak >= 4 && sessionContext.currentTier < 4) {
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
