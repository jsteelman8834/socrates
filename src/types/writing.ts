/**
 * Shakespeare Agent Types
 *
 * Shakespeare is an interactive creative writing tutor that:
 * - Co-writes stories with students in real-time
 * - Uses rubrics (not right/wrong) for evaluation
 * - Follows phase-based sessions: Warm-up → Create → Upgrade → Reflect
 * - Provides "Director's Notes" feedback: One Win, One Grow, One Example
 */

// ============================================
// WRITER PROFILE
// ============================================

export type WritingInterest =
  | 'comedy'
  | 'fantasy'
  | 'sports'
  | 'animals'
  | 'mystery'
  | 'adventure'
  | 'sci_fi'
  | 'family';

export type WritingMode = 'dialogue' | 'action' | 'description' | 'mixed';

export type WritingStrength =
  | 'vivid_characters'
  | 'clever_dialogue'
  | 'surprising_twists'
  | 'sensory_details'
  | 'strong_voice'
  | 'clear_structure'
  | 'emotional_depth'
  | 'humor';

export type GrowthArea =
  | 'sensory_details'
  | 'sentence_variety'
  | 'show_dont_tell'
  | 'clear_endings'
  | 'setting_description'
  | 'character_motivation'
  | 'conflict_development'
  | 'dialogue_tags';

export interface WriterProfile {
  id: string;
  userId: string;

  // Interests
  interests: WritingInterest[];
  preferredMode: WritingMode;

  // Skills
  strengths: WritingStrength[];
  growthAreas: GrowthArea[];

  // Challenge Level (1-8 ladder)
  challengeLevel: number;

  // Stamina
  writingStaminaMinutes: number;
  avgSessionDurationMinutes?: number;

  // Learning Goals
  currentLearningGoals: string[];

  // Behavioral Metrics
  avgTimeToStartSeconds?: number;
  completionRate: number;
  revisionWillingness: number;
  creativeRiskScore: number;

  // Aggregate Stats
  totalStoriesWritten: number;
  totalWordsWritten: number;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CHALLENGE LADDER
// ============================================

export const CHALLENGE_LADDER = [
  { level: 1, name: 'First Scene', focus: 'Just write something funny/interesting' },
  { level: 2, name: 'Setting the Stage', focus: 'Add setting and one sensory detail' },
  { level: 3, name: 'Want & Wall', focus: 'Add a goal and an obstacle' },
  { level: 4, name: 'Why It Matters', focus: 'Add stakes - why should we care?' },
  { level: 5, name: 'The Twist', focus: 'Add a twist ending' },
  { level: 6, name: 'Plant & Payoff', focus: 'Plant a clue early that pays off' },
  { level: 7, name: 'Clash of Wants', focus: 'Two characters with different goals' },
  { level: 8, name: 'Through New Eyes', focus: 'Rewrite from another point of view' },
] as const;

export type ChallengeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// ============================================
// WRITING SESSION
// ============================================

export type SessionPhase = 'warm_up' | 'create' | 'upgrade' | 'reflect' | 'complete';

export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface WritingSession {
  id: string;
  studentId: string;

  // Challenge
  challengeLevel: ChallengeLevel;
  promptId?: string;

  // Phase tracking
  phase: SessionPhase;
  status: SessionStatus;

  // Timing
  startedAt: Date;
  warmUpCompletedAt?: Date;
  createCompletedAt?: Date;
  upgradeCompletedAt?: Date;
  endedAt?: Date;

  // Metrics
  totalWordsWritten: number;
  revisionCount: number;
  timeToFirstWordSeconds?: number;

  // Notes
  sessionNotes?: string;

  // Rewards
  xpEarned: number;
  badgesEarned: string[];

  createdAt: Date;
}

// ============================================
// WRITING PROMPTS
// ============================================

export type PromptType = 'warm_up' | 'main_challenge' | 'upgrade_challenge';

export interface ScaffoldOption {
  type: 'choices' | 'fill_in' | 'example_line' | 'first_sentence';
  content: string | string[];
}

export interface WritingPrompt {
  id: string;
  challengeLevel: ChallengeLevel;
  title: string;
  promptText: string;
  promptType: PromptType;
  genres: WritingInterest[];
  scaffoldOptions: ScaffoldOption[];
  successCriteria: string[];
  estimatedMinutes: number;
  isActive: boolean;
  createdAt: Date;
}

// ============================================
// STORY DRAFTS
// ============================================

export type DraftType = 'warm_up' | 'first_draft' | 'revision' | 'final';

export interface DetectedElements {
  hasCharacter: boolean;
  hasObstacle: boolean;
  hasDialogue: boolean;
  hasDescription: boolean;
  hasSetting: boolean;
  sensoryDetails: ('visual' | 'sound' | 'smell' | 'taste' | 'touch')[];
  sentenceTypes: ('simple' | 'compound' | 'complex')[];
}

export interface StoryDraft {
  id: string;
  sessionId: string;

  // Version tracking
  version: number;
  isCurrent: boolean;
  draftType: DraftType;

  // Content
  content: string;
  wordCount: number;

  // Analysis
  detectedElements?: DetectedElements;

  // Timing
  startedAt: Date;
  submittedAt?: Date;
  timeSpentSeconds?: number;

  createdAt: Date;
}

// ============================================
// RUBRIC SCORES
// ============================================

export interface StoryPowerRubric {
  characterWant: number; // 1-5: Does someone want something?
  obstacle: number; // 1-5: Is something in the way?
  stakes: number; // 1-5: Do we care what happens?
  voice: number; // 1-5: Does it sound like THIS writer?
  memorableMoment: number; // 1-5: Is there one line that sticks?
  average: number;
}

export interface CraftGrowthRubric {
  clarity: number; // 1-5: Can we follow the story?
  concreteDetails: number; // 1-5: Can we see/hear/smell it?
  sentenceControl: number; // 1-5: Are sentences well-formed?
  sentenceVariety: number; // 1-5: Mix of lengths?
  revisionWillingness: number; // 1-5: Did they engage with revision?
  average: number;
}

export interface RubricScores {
  id: string;
  draftId: string;

  storyPower: StoryPowerRubric;
  craftGrowth: CraftGrowthRubric;

  evaluationConfidence: number;
  feedbackData?: Record<string, unknown>;

  evaluatedAt: Date;
}

// ============================================
// SHAKESPEARE FEEDBACK (Director's Notes)
// ============================================

export type FeedbackType =
  | 'win' // One thing they did well
  | 'grow' // One area to improve
  | 'example' // Concrete example of improvement
  | 'prompt' // Next challenge prompt
  | 'stuck_help' // When they're stuck
  | 'celebration'; // Session completion

export type ShakespeareEmotion =
  | 'delighted'
  | 'impressed'
  | 'encouraging'
  | 'curious'
  | 'thoughtful'
  | 'playful'
  | 'dramatic'
  | 'celebratory';

export interface ShakespeareFeedback {
  id: string;
  draftId: string;
  rubricScoreId?: string;

  feedbackType: FeedbackType;
  feedbackText: string;
  emotion: ShakespeareEmotion;

  // For 'win' feedback - quote from their work
  quoteFromWork?: string;

  // For 'grow' feedback - example rewrite
  exampleRewrite?: string;

  // Student response
  wasHelpful?: boolean;
  studentResponse?: string;

  createdAt: Date;
}

// ============================================
// DIRECTOR'S NOTES (Combined Feedback)
// ============================================

export interface DirectorsNotes {
  win: {
    aspect: string;
    quote: string;
    explanation: string;
  };
  grow: {
    aspect: string;
    suggestion: string;
    example: string;
  };
  nextChallenge?: string;
  shakespeareMessage: string;
  emotion: ShakespeareEmotion;
}

// ============================================
// SCAFFOLD HELP
// ============================================

export type StuckType = 'cant_start' | 'stuck_middle' | 'dont_know_ending' | 'need_ideas';

export interface ScaffoldHelp {
  scaffoldType: 'choices' | 'fill_in' | 'example_line' | 'first_sentence';
  content: {
    choices?: string[];
    fillInTemplate?: string;
    exampleLines?: string[];
    firstSentence?: string;
  };
  shakespeareMessage: string;
  emotion: ShakespeareEmotion;
}

// ============================================
// WRITING EVALUATION
// ============================================

export interface WritingEvaluation {
  storyPower: StoryPowerRubric;
  craftGrowth: CraftGrowthRubric;
  detectedElements: DetectedElements;

  directorsNotes: DirectorsNotes;

  challengeLevelAppropriate: boolean;
  suggestedNextLevel: ChallengeLevel;
  confidence: number;
}

// ============================================
// SESSION STATE
// ============================================

export interface WritingSessionState {
  session: WritingSession;
  writerProfile: WriterProfile;
  currentPrompt?: WritingPrompt;
  currentDraft?: StoryDraft;
  latestFeedback?: ShakespeareFeedback;
  rubricScores?: RubricScores;
}

// ============================================
// API TYPES
// ============================================

export interface StartSessionRequest {
  promptId?: string;
  challengeLevel?: ChallengeLevel;
}

export interface StartSessionResponse {
  sessionId: string;
  writerProfile: WriterProfile;
  warmUpPrompt: WritingPrompt;
  shakespeareGreeting: string;
  phase: 'warm_up';
}

export interface SaveDraftRequest {
  content: string;
  draftType: DraftType;
  timeSpentSeconds: number;
}

export interface SaveDraftResponse {
  draftId: string;
  wordCount: number;
  autoSaved: boolean;
  encouragement?: string;
}

export interface EvaluateRequest {
  draftId: string;
  requestedFeedbackType: 'quick' | 'full';
}

export interface EvaluateResponse {
  evaluation: WritingEvaluation;
  feedback: ShakespeareFeedback;
  sessionUpdate: {
    phase: SessionPhase;
    xpEarned: number;
    challengeLevelChange?: number;
  };
}

export interface ScaffoldRequest {
  stuckType: StuckType;
  currentContent: string;
}

export interface ScaffoldResponse {
  scaffold: ScaffoldHelp;
}
