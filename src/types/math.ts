/**
 * Math Domain Types for Pythagoras Agent
 *
 * These types are DISTINCT from the history types used by Socrates.
 * Math pedagogy focuses on:
 * - Fluency (computational speed and accuracy)
 * - Concept (understanding mathematical relationships)
 * - Problem-Solving (applying math to real situations)
 *
 * Distractors in math are about PROCEDURAL ERRORS, not era/category confusion.
 */

// ============ Math Question Types ============

/**
 * Math question classification (different from history's knowledge/wisdom)
 *
 * - fluency: Computational practice (7 × 8 = ?)
 * - concept: Understanding relationships (Why does 1/2 = 2/4?)
 * - problem_solving: Real-world application (Word problems)
 */
export type MathQuestionType = 'fluency' | 'concept' | 'problem_solving';

/**
 * Math topic domains for 5th grade
 */
export type MathDomain =
  | 'multiplication'
  | 'division'
  | 'fractions'
  | 'decimals'
  | 'order_of_operations'
  | 'factors_multiples'
  | 'area_volume'
  | 'patterns'
  | 'coordinate_plane';

/**
 * Math distractor types - these represent PROCEDURAL ERRORS
 *
 * Unlike history where distractors are about confusion between facts,
 * math distractors capture specific computational/conceptual mistakes.
 */
export type MathDistractorType =
  | 'correct'
  | 'wrong_operation'           // Added instead of multiplied, etc.
  | 'place_value_error'         // 45 × 3 = 125 (forgot to carry)
  | 'fraction_denominator_add'  // 1/2 + 1/3 = 2/5 (added denominators)
  | 'fraction_no_common_denom'  // Operated without finding common denominator
  | 'order_of_operations'       // Did operations in wrong order
  | 'sign_error'                // Positive/negative confusion
  | 'off_by_one'                // Close but miscounted
  | 'partial_completion'        // Did part of the problem correctly
  | 'unit_confusion'            // Mixed up units (area vs perimeter)
  | 'pattern_misread'           // Identified wrong pattern
  | 'reasonable_guess';         // Plausible but not computed

/**
 * Visualization types that Pythagoras can suggest
 */
export type MathVisualization =
  | 'number_line'
  | 'fraction_bar'
  | 'fraction_circle'
  | 'array'
  | 'area_model'
  | 'dot_pattern'
  | 'coordinate_grid'
  | 'balance_scale';

// ============ Math Question Structures ============

export interface MathAnswerOption {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  numericValue?: number;  // For computational problems
}

export interface MathQuestion {
  id: string;
  topicId: string;
  domain: MathDomain;
  questionText: string;
  questionType: MathQuestionType;
  difficultyTier: 1 | 2 | 3 | 4;
  options: MathAnswerOption[];
  // Math-specific fields
  expression?: string;          // LaTeX or plain math expression
  visualizationHint?: MathVisualization;
}

export interface MathQuestionWithAnswer extends MathQuestion {
  correctOptionId: string;
  correctAnswer: string;
  correctNumericValue?: number;
  answerExplanation: string;
  distractors: MathDistractorInfo[];
  patternHints: PatternHint[];       // Pythagoras-style hints
  visualizations: VisualizationHint[];
}

/**
 * Information about a math distractor (wrong answer)
 *
 * Unlike history distractors, these describe the PROCEDURAL ERROR
 * that led to this wrong answer.
 */
export interface MathDistractorInfo {
  optionId: string;
  distractorType: MathDistractorType;
  errorDescription: string;       // What computational error produces this answer
  pythgorasGuidance: string;      // How Pythagoras should guide the student
  showWorkExample?: string;       // Example of the wrong procedure
}

/**
 * Pythagoras-style hints that lead students to discover patterns
 */
export interface PatternHint {
  level: 1 | 2 | 3;
  text: string;
  visualization?: MathVisualization;
}

/**
 * Visualization hints for the frontend
 */
export interface VisualizationHint {
  type: MathVisualization;
  description: string;
  data?: Record<string, unknown>;  // Visualization-specific data
}

// ============ Math Session Types ============

export interface MathSessionState {
  sessionId: string;
  studentId: string;
  topicId: string;
  domain: MathDomain;
  status: 'active' | 'paused' | 'completed' | 'failed';
  currentTier: 1 | 2 | 3 | 4;
  currentStreak: number;
  maxStreak: number;
  heartsRemaining: number;
  questionsAnswered: number;
  questionsCorrect: number;
  // Math-specific tracking
  fluencyCorrect: number;
  conceptCorrect: number;
  problemSolvingCorrect: number;
  totalXp: number;
  currentQuestionId?: string;
}

export interface MathSessionSummary {
  totalQuestions: number;
  correctAnswers: number;
  fluencyAccuracy: number;
  conceptAccuracy: number;
  problemSolvingAccuracy: number;
  maxStreak: number;
  xpEarned: number;
  patternsDiscovered: string[];  // Notable patterns the student found
  commonErrors: MathDistractorType[];  // Patterns in mistakes
}

// ============ Math Feedback Types ============

export type MathFeedbackType =
  | 'celebration'
  | 'pattern_hint'
  | 'visualization'
  | 'encouragement'
  | 'discovery'
  | 'real_world_connection';

export type PythagorasEmotion =
  | 'amazed'
  | 'encouraging'
  | 'contemplative'
  | 'excited'
  | 'proud';

export interface MathTutorFeedback {
  isCorrect: boolean;
  feedbackType: MathFeedbackType;
  feedbackText: string;
  avatarEmotion: PythagorasEmotion;
  // Pythagoras-specific feedback
  patternQuestion?: string;        // "What do you notice about...?"
  visualizationHint?: MathVisualization;
  realWorldConnection?: string;    // "This is like when..."
  xpEarned: number;
  streakBonus: boolean;
  correctAnswer?: {
    optionId: string;
    text: string;
    explanation?: string;
  };
}

// ============ Subject System ============

/**
 * Supported subjects with their associated agents
 */
export type Subject = 'history' | 'math';

export interface SubjectConfig {
  subject: Subject;
  agent: 'socrates' | 'pythagoras';
  displayName: string;
  icon: string;
  gradeLevel: number;
  description: string;
}

export const SUBJECT_CONFIGS: Record<Subject, SubjectConfig> = {
  history: {
    subject: 'history',
    agent: 'socrates',
    displayName: 'American History',
    icon: '🦉',
    gradeLevel: 5,
    description: 'Explore the past with Socrates',
  },
  math: {
    subject: 'math',
    agent: 'pythagoras',
    displayName: 'Mathematics',
    icon: '🔢',
    gradeLevel: 5,
    description: 'Discover patterns with Pythagoras',
  },
};
