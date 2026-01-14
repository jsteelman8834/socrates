/**
 * Franklin's Grandson Academy Types
 *
 * Interactive historical storytelling system where students
 * explore the pre-Revolutionary War period (1763-1775) as
 * Benjamin Franklin's apprentice in his Philadelphia print shop.
 */

// ============================================
// SKILLS
// ============================================

export type Skill = 'curiosity' | 'courage' | 'logic' | 'communication';

export interface SkillScores {
  curiosity: number;
  courage: number;
  logic: number;
  communication: number;
}

export type SkillLevel = {
  level: number;
  name: string;
  minPoints: number;
};

export const SKILL_LEVELS: SkillLevel[] = [
  { level: 1, name: 'Apprentice', minPoints: 0 },
  { level: 2, name: 'Journeyman', minPoints: 100 },
  { level: 3, name: 'Practitioner', minPoints: 250 },
  { level: 4, name: 'Artisan', minPoints: 450 },
  { level: 5, name: 'Master', minPoints: 700 },
];

// ============================================
// ENROLLMENT
// ============================================

export interface FranklinEnrollment {
  id: string;
  studentId: string;

  // Progress
  currentWeek: number; // 1-3
  currentDay: number; // 1-15
  completedDays: number[];

  // Skills
  curiosityScore: number;
  courageScore: number;
  logicScore: number;
  communicationScore: number;

  // Timestamps
  startedAt: Date;
  lastSessionAt: Date;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// EPISODE CONTENT (Authored)
// ============================================

export type MissionType = 'draw' | 'write' | 'roleplay' | 'math' | 'timeline' | 'map';

export interface VocabCard {
  term: string;
  definition: string;
  visualCue: string; // Emoji or icon
  exampleInContext: string;
  relatedTo?: string[];
}

export interface HistoricalContext {
  date: string; // e.g., "October 7, 1763"
  location: string; // e.g., "Philadelphia, Franklin's Print Shop"
  historicalFacts: string[];
  characters: Array<{
    name: string;
    role: string;
  }>;
}

export interface ChoiceConsequences {
  immediate: string; // Franklin's immediate response
  skillImpact: Partial<SkillScores>; // Skills awarded
  narrativeTag: string; // e.g., "cautious_thinker", "rebellious_spirit"
}

export interface ChoiceOption {
  id: string; // e.g., "day1_choice1_a"
  text: string; // What student sees
  consequences: ChoiceConsequences;
}

export interface ChoicePoint {
  id: string; // e.g., "day1_choice1"
  position: number; // Order in narrative
  prompt: string; // The question/decision to make
  contextBefore: string; // Narrative leading to choice

  options: ChoiceOption[];

  convergenceAfter?: {
    prompt: string; // How branches rejoin
    synthesisGuide: string; // For AI: "Regardless of choice, emphasize..."
  };
}

export interface StoryContent {
  setup: string; // Opening narrative
  context: HistoricalContext;
  choicePoints: ChoicePoint[];
}

export interface RubricDimension {
  dimension: string; // e.g., "Historical Accuracy"
  scale: { min: number; max: number }; // Usually {min: 1, max: 5}
  descriptors: {
    [key: number]: string; // 1: "...", 3: "...", 5: "..."
  };
}

export interface MissionContent {
  type: MissionType;
  title: string;
  prompt: string;

  materials: {
    provided: string[]; // "Paper and pencil", "Timeline template"
    optional: string[];
  };

  exampleOutput?: {
    description: string;
    imageUrl?: string;
  };

  rubric: RubricDimension[];

  aiEvaluationGuide: {
    lookFor: string[]; // Key elements to check
    commonMistakes: string[];
    encouragementTips: string[];
  };

  skillTargets: Partial<SkillScores>; // Skills this mission develops

  // For structured missions (timeline, map)
  template?: {
    type: 'timeline' | 'map' | 'stakeholder_map';
    structure: any; // Mission-specific structure
  };
}

export interface LedgerPrompt {
  prompt: string; // e.g., "What surprised you most today?"
  skillFocus: Skill; // Primary skill this reflection targets
  guideQuestion?: string; // Follow-up if needed
}

export interface FranklinEpisode {
  id: string;

  // Structure
  week: 1 | 2 | 3;
  day: number; // 1-15
  topicId?: string; // Links to existing topics table

  // Metadata
  title: string;
  historicalPeriod: string; // "1763-1775"

  // Part 1: Recap + Vocab
  recapPrompt: string; // Template: "{studentName}, last we spoke of..."
  vocabCards: VocabCard[];

  // Part 2: Story
  story: StoryContent;

  // Part 3: Mission
  mission: MissionContent;

  // Part 4: Ledger
  ledger: LedgerPrompt;

  // Additional metadata
  estimatedMinutes: number;
  learningObjectives: string[];
  historicalSources: string[];

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SESSION (Daily Instance)
// ============================================

export type SessionPart = 'recap' | 'story' | 'mission' | 'ledger' | 'complete';
export type SessionStatus = 'active' | 'paused' | 'completed';

export interface FranklinSession {
  id: string;
  enrollmentId: string;
  episodeId: string;

  // State
  currentPart: SessionPart;
  status: SessionStatus;

  // Timing
  startedAt: Date;
  recapCompletedAt?: Date;
  storyCompletedAt?: Date;
  missionCompletedAt?: Date;
  ledgerCompletedAt?: Date;
  endedAt?: Date;

  // Skills earned this session
  skillsEarned: Partial<SkillScores>;

  createdAt: Date;
}

// ============================================
// STORY CHOICES (Made by Student)
// ============================================

export interface ChoiceHistory {
  id: string;
  sessionId: string;

  // Choice identification
  choicePointId: string;
  choiceOptionId: string;

  // Context for AI synthesis
  storyStateBefore?: any;
  storyStateAfter?: any;

  // Skills awarded
  skillsAwarded: Partial<SkillScores>;

  chosenAt: Date;
}

// ============================================
// MISSION SUBMISSION
// ============================================

export interface MissionSubmission {
  id: string;
  sessionId: string;

  missionType: MissionType;

  // Content (varies by type)
  textContent?: string; // For writing/roleplay
  fileUploadUrl?: string; // For drawings (Supabase Storage URL)
  structuredData?: any; // For timelines, maps

  // AI Evaluation
  aiFeedback?: string;
  rubricScores?: RubricScoresDetail;
  skillsAwarded?: Partial<SkillScores>;

  // Timestamps
  submittedAt: Date;
  evaluatedAt?: Date;

  createdAt: Date;
}

export interface RubricScoresDetail {
  [dimension: string]: {
    score: number; // 1-5
    evidence: string; // AI's reasoning
  };
}

export interface MissionEvaluation {
  rubricScores: RubricScoresDetail;
  strengths: string[]; // Specific things they did well
  growthSuggestion: {
    area: string;
    suggestion: string;
    example: string; // Rewritten example
  };
  franklinFeedback: string; // Franklin's voice
  skillsAwarded: Partial<SkillScores>;
  totalPoints: number;
}

// ============================================
// LIBERTY LEDGER (Reflection)
// ============================================

export interface LedgerEntry {
  id: string;
  sessionId: string;

  // Student's reflection
  reflectionText: string;

  // AI response
  aiResponse?: string;
  skillIdentified?: Skill;
  skillPointsAwarded: number;

  createdAt: Date;
}

export interface LedgerResponse {
  franklinResponse: string;
  skillAwarded: Skill;
  pointsAwarded: number;
  reasoning: string;
}

// ============================================
// CAPSTONE NEWSPAPER
// ============================================

export type NewspaperPerspective = 'patriot' | 'loyalist' | 'neutral';
export type NewspaperStatus = 'draft' | 'complete' | 'published';

export interface TimelineEvent {
  date: string;
  event: string;
  sourceDay: number; // Which day it came from (1-15)
  studentNotes?: string;
}

export interface Editorial {
  title: string;
  perspective: NewspaperPerspective;
  body: string;
  signature: string;
}

export interface Newspaper {
  id: string;
  enrollmentId: string;

  // Design
  masthead: string; // Newspaper name
  dateline: string; // "Philadelphia, December 1775"

  // Content sections
  headlineMain?: string;
  headlineSecondary?: string;
  headlineTertiary?: string;

  timelineEvents: TimelineEvent[];
  editorial?: Editorial;

  // AI assistance tracking
  aiSuggestionsUsed: {
    headlines: number;
    timeline: number;
    editorial: number;
  };
  studentOriginalContentPct: number;

  // Status
  status: NewspaperStatus;

  createdAt: Date;
  completedAt?: Date;
}

export interface NewspaperSuggestions {
  headlineSuggestions: Array<{
    text: string;
    tone: 'patriot' | 'loyalist' | 'neutral';
    why: string; // Explanation
  }>;

  timelineEvents: Array<{
    date: string;
    event: string;
    why: string; // Why this is important
    fromDay: number;
  }>;

  editorialAngles: Array<{
    perspective: NewspaperPerspective;
    framingQuestion: string;
    keyArguments: string[];
  }>;

  franklinAdvice: string;
}

// ============================================
// FACT-CHECKING
// ============================================

export interface FactCheck {
  id: string;
  sessionId: string;

  factQuery: string;
  source: 'story' | 'mission' | 'ledger' | 'cabinet';

  // External API response
  apiResponse?: any;
  verified: boolean;
  trustedSources: string[];

  // Student interaction
  studentViewed: boolean;

  createdAt: Date;
}

export interface FactCheckResult {
  franklinPresentation: string; // How Franklin presents it
  verified: boolean;
  sources: string[];
  confidence: number;
  rawGrokData?: any;
}

// ============================================
// FRANKLIN AGENT RESPONSES
// ============================================

export type FranklinEmotion =
  | 'welcoming'
  | 'storytelling'
  | 'thoughtful'
  | 'proud'
  | 'curious'
  | 'impressed'
  | 'encouraging';

export interface RecapResponse {
  recap: string; // Personalized recap
  franklinGreeting: string; // Opening message
}

export interface StoryNarrative {
  narrative: string; // Story text leading to choice
  choicePrompt: string; // The question to ask
}

export interface ChoiceSynthesis {
  franklinResponse: string; // Franklin's response to choice
  continuedNarrative: string; // Story continues
  skillsAwarded: Partial<SkillScores>;
  nextChoicePoint?: ChoicePoint;
}

// ============================================
// SESSION STATE (Zustand Store)
// ============================================

export interface FranklinAcademyState {
  // Enrollment
  enrollmentId: string | null;
  currentWeek: number;
  currentDay: number;
  completedDays: number[];

  // Skills
  skills: SkillScores;

  // Current Session
  sessionId: string | null;
  sessionStatus: 'idle' | 'loading' | 'active' | 'paused' | 'complete';
  currentPart: SessionPart;

  // Episode data
  currentEpisode: FranklinEpisode | null;

  // Part 1: Recap
  recap: string | null;
  vocabCards: VocabCard[];

  // Part 2: Story
  storyNarrative: string[]; // Array of narrative paragraphs
  currentChoicePoint: ChoicePoint | null;
  selectedChoice: string | null;
  choiceHistory: ChoiceHistory[];

  // Part 3: Mission
  missionSubmission: MissionSubmission | null;
  missionEvaluation: MissionEvaluation | null;

  // Part 4: Ledger
  ledgerEntry: string | null;
  ledgerResponse: LedgerResponse | null;

  // UI State
  franklinMessage: string | null;
  franklinEmotion: FranklinEmotion;
  isFactChecking: boolean;
  error: string | null;

  // Actions
  startAcademy: () => Promise<void>;
  startDay: (day: number) => Promise<void>;

  // Part 1
  loadRecap: () => Promise<void>;
  completeRecap: () => void;

  // Part 2
  loadStory: () => Promise<void>;
  makeChoice: (choiceId: string) => Promise<void>;
  completeStory: () => void;

  // Part 3
  submitMission: (submission: Partial<MissionSubmission>) => Promise<void>;
  completeMission: () => void;

  // Part 4
  submitLedgerEntry: (text: string) => Promise<void>;
  completeLedger: () => void;

  // Day complete
  completeDay: () => Promise<void>;

  // Utilities
  factCheck: (claim: string) => Promise<void>;
  resetSession: () => void;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface EnrollRequest {
  // No body needed - uses auth.uid() from session
}

export interface EnrollResponse {
  enrollment: FranklinEnrollment;
  currentDay: number;
  skills: SkillScores;
}

export interface StartSessionRequest {
  enrollmentId: string;
  day: number;
}

export interface StartSessionResponse {
  session: FranklinSession;
  episode: FranklinEpisode;
  previousChoices: ChoiceHistory[];
}

export interface RecapRequest {
  choiceHistory: ChoiceHistory[];
}

export interface RecapApiResponse {
  recap: string;
  franklinGreeting: string;
}

export interface StoryRequest {
  choicePointId: string;
  choiceHistory: ChoiceHistory[];
}

export interface StoryResponse {
  narrative: string;
  choicePrompt: string;
}

export interface ChoiceRequest {
  choicePointId: string;
  choiceOptionId: string;
  choiceHistory: ChoiceHistory[];
}

export interface ChoiceResponse {
  franklinResponse: string;
  continuedNarrative: string;
  skillsAwarded: Partial<SkillScores>;
  choiceRecord: ChoiceHistory;
  nextChoicePoint?: ChoicePoint;
}

export interface MissionSubmitRequest {
  type: MissionType;
  textContent?: string;
  fileUploadUrl?: string;
  structuredData?: any;
}

export interface MissionEvaluationResponse {
  evaluation: MissionEvaluation;
}

export interface LedgerSubmitRequest {
  reflectionText: string;
}

export interface LedgerSubmitResponse {
  response: LedgerResponse;
}

export interface CompleteSessionResponse {
  success: boolean;
  nextDay?: number;
}

export interface FactCheckRequest {
  claim: string;
  context: string;
}

export interface FactCheckApiResponse {
  franklinPresentation: string;
  verified: boolean;
  sources: string[];
  confidence: number;
}

export interface NewspaperSuggestionsResponse {
  suggestions: NewspaperSuggestions;
}

export interface NewspaperPublishRequest {
  headlines: {
    main: string;
    secondary: string;
    tertiary: string;
  };
  timelineEvents: TimelineEvent[];
  editorial: Editorial;
}

export interface NewspaperPublishResponse {
  newspaperId: string;
  publishedUrl?: string;
}

// ============================================
// EPISODE CONTENT AUTHORING (JSON Format)
// ============================================

// This is the format for authoring episode content in JSON files
// before loading into the database
export interface EpisodeJSON {
  week: 1 | 2 | 3;
  day: number;
  title: string;
  historicalPeriod: string;

  recap: {
    template: string; // "{studentName}, last we spoke of..."
    references: string[]; // What to recall from previous days
  };

  vocabCards: Array<{
    term: string;
    definition: string;
    visualCue: string;
    exampleInContext: string;
    relatedTo?: string[];
  }>;

  story: {
    setup: string;
    context: {
      date: string;
      location: string;
      historicalFacts: string[];
      characters: Array<{ name: string; role: string }>;
    };
    choicePoints: Array<{
      id: string;
      position: number;
      prompt: string;
      contextBefore: string;
      options: Array<{
        id: string;
        text: string;
        consequences: {
          immediate: string;
          skillImpact: Partial<SkillScores>;
          narrativeTag: string;
        };
      }>;
      convergenceAfter?: {
        prompt: string;
        synthesisGuide: string;
      };
    }>;
  };

  mission: {
    type: MissionType;
    title: string;
    prompt: string;
    materials: {
      provided: string[];
      optional: string[];
    };
    exampleOutput?: {
      description: string;
      imageUrl?: string;
    };
    rubric: Array<{
      dimension: string;
      scale: { min: number; max: number };
      descriptors: Record<number, string>;
    }>;
    aiEvaluationGuide: {
      lookFor: string[];
      commonMistakes: string[];
      encouragementTips: string[];
    };
    skillTargets: Partial<SkillScores>;
    template?: {
      type: string;
      structure: any;
    };
  };

  ledger: {
    prompt: string;
    skillFocus: Skill;
    guideQuestion?: string;
  };

  estimatedMinutes: number;
  learningObjectives: string[];
  historicalSources: string[];
}
