// Core domain types for the Virtual Socratic University

// ============ Question Types ============

export type QuestionType = 'knowledge' | 'wisdom';
export type DifficultyTier = 1 | 2 | 3 | 4;

/**
 * Distractor types used for Distractor Engineering
 * These classify wrong answers by how they're designed to confuse students:
 *
 * - correct: The right answer
 * - wrong_era: Answer from a different time period (easy to rule out)
 * - wrong_category: Answer from a different category entirely (easy)
 * - same_category: Answer in the right category but different fact (medium)
 * - near_miss: Almost correct, closely related (hard)
 * - trap: Deliberately confusing, common misconception (hard)
 * - common_misconception: Widely believed but incorrect (hard)
 */
export type DistractorType =
  | 'correct'
  | 'wrong_era'
  | 'wrong_category'
  | 'same_category'
  | 'near_miss'
  | 'trap'
  | 'common_misconception';

export interface AnswerOption {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  topicId: string;
  questionText: string;
  questionType: QuestionType;
  difficultyTier: DifficultyTier;
  options: AnswerOption[];
  cognitiveVerb: string;
  questionStem: string;
}

// Full question with answer (server-side only)
export interface QuestionWithAnswer extends Question {
  correctOptionId: string;
  correctAnswer: string;
  answerExplanation: string;
  distractors: DistractorInfo[];
  mnemonics: Mnemonic[];
  socraticHints: SocraticHint[];
}

/**
 * Information about a distractor (wrong answer option)
 *
 * This is used by the Socrates Agent to provide targeted feedback
 * based on WHY the student might have chosen this particular wrong answer.
 */
export interface DistractorInfo {
  optionId: string;
  distractorType: DistractorType;
  confusionExplanation: string;   // Human-readable explanation for content editors
  trapExplanation: string;        // Agent instruction: how to guide students who pick this
  relatedConcept?: string;        // What correct concept this relates to
}

export interface Mnemonic {
  id: string;
  text: string;
  type: 'rhyme' | 'acronym' | 'story' | 'visual' | 'association';
}

export interface SocraticHint {
  level: 1 | 2 | 3;
  text: string;
}

// ============ Session Types ============

export type SessionStatus = 'active' | 'paused' | 'completed' | 'failed';

export interface SessionState {
  sessionId: string;
  studentId: string;
  topicId: string;
  status: SessionStatus;
  currentTier: DifficultyTier;
  currentStreak: number;
  maxStreak: number;
  heartsRemaining: number;
  questionsAnswered: number;
  questionsCorrect: number;
  knowledgeCorrect: number;
  wisdomCorrect: number;
  totalXp: number;
  currentQuestionId?: string;
}

export interface SessionSummary {
  totalQuestions: number;
  correctAnswers: number;
  knowledgeAccuracy: number;
  wisdomAccuracy: number;
  maxStreak: number;
  xpEarned: number;
  ratingChange: {
    knowledge: number;
    wisdom: number;
  };
  achievementsUnlocked: Achievement[];
}

// ============ Feedback Types ============

export type FeedbackType = 'celebration' | 'mnemonic' | 'socratic_hint' | 'encouragement' | 'explanation';
export type AvatarEmotion = 'happy' | 'encouraging' | 'thinking' | 'curious' | 'celebrating';

export interface TutorFeedback {
  isCorrect: boolean;
  feedbackType: FeedbackType;
  feedbackText: string;
  avatarEmotion: AvatarEmotion;
  followUpQuestion?: string;
  xpEarned: number;
  streakBonus: boolean;
  correctAnswer?: {
    optionId: string;
    text: string;
  };
}

// ============ User Types ============

export type UserRole = 'student' | 'parent' | 'admin';
export type LearningProfile = 'encyclopedist' | 'strategist' | 'balanced';
export type AvatarChoice = 'owl' | 'scholar' | 'explorer';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarChoice?: AvatarChoice;
  parentId?: string;
  createdAt: Date;
}

export interface StudentProfile {
  userId: string;
  knowledgeRating: number;
  wisdomRating: number;
  overallRating: number;
  totalXp: number;
  currentLevel: number;
  learningProfile?: LearningProfile;
  badgesEarned: string[];
  currentTopicId?: string;
  topicsCompleted: string[];
}

// ============ Topic Types ============

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  gradeLevel: number;
  subject: string;
  displayOrder: number;
  questionCount: number;
  estimatedTimeMinutes: number;
}

export interface TopicProgress {
  topicId: string;
  completed: boolean;
  knowledgeMastery: number;
  wisdomMastery: number;
  lastAttempted?: Date;
}

// ============ Achievement Types ============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// ============ Parent Dashboard Types ============

export interface ChildOverview {
  id: string;
  displayName: string;
  learningProfile?: LearningProfile;
  profileDescription?: string;
  thisWeek: WeeklyStats;
  trend: {
    direction: 'improving' | 'stable' | 'declining';
    knowledgeChange: string;
    wisdomChange: string;
  };
  currentTopic?: {
    name: string;
    progress: number;
  };
}

export interface WeeklyStats {
  sessionsCompleted: number;
  timeSpentMinutes: number;
  questionsAnswered: number;
  knowledgeAccuracy: number;
  wisdomAccuracy: number;
}

export interface LearningInsight {
  id: string;
  type: 'learning_style' | 'struggle_pattern' | 'breakthrough' | 'recommendation';
  title: string;
  body: string;
  recommendation?: string;
}

// ============ API Types ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface StartSessionRequest {
  topicId: string;
}

export interface StartSessionResponse {
  sessionId: string;
  topic: Topic;
  initialState: SessionState;
  socratesGreeting: string;
}

export interface SubmitAnswerRequest {
  questionId: string;
  selectedOptionId: string;
  timeSpentSeconds: number;
}

export interface SubmitAnswerResponse {
  feedback: TutorFeedback;
  sessionState: SessionState;
  sessionEnded: boolean;
  sessionSummary?: SessionSummary;
}
