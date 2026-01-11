/**
 * Aristotle Agent Types
 *
 * Aristotle is a background feedback loop agent that:
 * - Analyzes behavioral patterns AFTER sessions complete
 * - Generates insights for parents
 * - Recommends adjustments for future sessions
 * - Does NOT intervene during runtime
 */

// ============================================
// THE FIVE MENTAL FACULTIES (De Anima)
// ============================================

export type Faculty = 'perception' | 'memory' | 'imagination' | 'reason' | 'desire';

export interface FacultyScore {
  score: number; // 0.0 to 1.0
  tendency: Record<string, number>; // e.g., { "detail_focused": 0.7, "big_picture": 0.3 }
  observationsCount: number;
  lastUpdated: Date;
}

export interface CognitiveFingerprint {
  studentId: string;

  // The Five Faculties
  perception: FacultyScore;
  memory: FacultyScore;
  imagination: FacultyScore;
  reason: FacultyScore;
  desire: FacultyScore;

  // Derived Profile
  primaryLearningStyle?: string;
  profileSummary?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// VIRTUE TRACKING
// ============================================

export type IntellectualVirtue = 'curiosity' | 'patience' | 'precision' | 'open_mindedness';
export type MoralVirtue = 'fairness' | 'temperance' | 'courage' | 'reflection';
export type Virtue = IntellectualVirtue | MoralVirtue;

export interface VirtueProgress {
  studentId: string;

  // Intellectual Virtues (related to learning)
  curiosity: number; // 0-1: Do they explore beyond requirements?
  patience: number; // 0-1: Do they persist through difficulty?
  precision: number; // 0-1: Do they check their work?
  openMindedness: number; // 0-1: Do they consider alternatives?

  // Moral Virtues (related to behavior)
  fairness: number; // 0-1: Do they play by rules?
  temperance: number; // 0-1: Do they regulate impulses?
  courage: number; // 0-1: Do they attempt difficult challenges?
  reflection: number; // 0-1: Do they review mistakes?

  totalObservations: number;
  virtueNarrative?: string; // AI-generated description

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// BEHAVIORAL OBSERVATIONS (from session data)
// ============================================

export type BehaviorType =
  // Timing patterns
  | 'response_time' // How quickly they answer
  | 'session_duration' // How long they stay engaged
  | 'time_distribution' // Where they spend time

  // Answer patterns
  | 'streak_pattern' // Consistency of correct answers
  | 'error_pattern' // Types of mistakes made
  | 'difficulty_response' // How they handle tier changes

  // Engagement patterns
  | 'session_completion' // Do they finish sessions?
  | 'voluntary_continuation' // Do they keep going?
  | 'topic_preference' // What subjects they choose

  // Learning patterns
  | 'hint_usage' // Do they use hints?
  | 'explanation_engagement' // Do they read feedback?
  | 'retry_behavior'; // Do they retry after failure?

export interface BehavioralObservation {
  id: string;
  studentId: string;
  sessionId: string;
  behaviorType: BehaviorType;
  facultyObserved: Faculty;
  data: Record<string, unknown>;
  trait?: string;
  traitStrength?: number;
  observedAt: Date;
}

// ============================================
// SESSION ANALYSIS (post-session processing)
// ============================================

export interface SessionAnalysisInput {
  sessionId: string;
  studentId: string;
  subject: 'history' | 'math' | 'writing';
  agent: 'socrates' | 'pythagoras' | 'shakespeare';

  // Session metrics
  duration: number; // seconds
  questionsAnswered: number;
  correctCount: number;
  incorrectCount: number;
  streakMax: number;
  tierReached: number;
  heartsLost: number;

  // Timing data
  responseTimes: number[]; // ms per question
  pauseEvents?: { position: number; durationMs: number }[];

  // Error analysis
  errorTypes: string[]; // distractor types selected
  difficultyProgression: number[]; // tier at each question

  // Session outcome
  completed: boolean;
  endReason?: 'completed' | 'hearts_depleted' | 'abandoned' | 'time_limit';
}

export interface SessionAnalysisResult {
  sessionId: string;
  studentId: string;

  // Cognitive observations
  facultySignals: {
    faculty: Faculty;
    signal: string;
    strength: number; // 0-1
    evidence: string;
  }[];

  // Virtue observations
  virtueSignals: {
    virtue: Virtue;
    observed: boolean;
    strength: number;
    evidence: string;
  }[];

  // Recommendations for next session
  recommendations: {
    type: 'difficulty' | 'pacing' | 'topic' | 'approach';
    recommendation: string;
    confidence: number;
  }[];

  // Profile updates to apply
  profileUpdates: {
    field: string;
    currentValue: number;
    newValue: number;
    reason: string;
  }[];

  analyzedAt: Date;
}

// ============================================
// PARENT INSIGHTS
// ============================================

export interface ParentInsight {
  studentId: string;
  generatedAt: Date;

  // Headline
  headline: string; // e.g., "A Curious Explorer with Growing Patience"

  // Narrative (2-3 paragraphs)
  narrative: string;

  // Key observations
  keyObservations: {
    faculty: Faculty;
    icon: string;
    observation: string;
  }[];

  // Virtue highlights
  virtueHighlights: {
    virtue: Virtue;
    level: 'developing' | 'established' | 'flourishing';
    observation: string;
  }[];

  // Growth opportunities (positive framing)
  growthOpportunities: {
    area: string;
    suggestion: string;
  }[];

  // Stats summary
  stats: {
    sessionsThisWeek: number;
    totalQuestionsAnswered: number;
    averageAccuracy: number;
    longestStreak: number;
    topSubject: string;
  };
}

// ============================================
// CURRICULUM RECOMMENDATIONS
// ============================================

export interface CurriculumRecommendation {
  studentId: string;
  facultyFocus: Faculty;
  cognitiveGap: string; // e.g., "cause_and_effect_reasoning"
  gapSeverity: number; // 0-1
  recommendedExperiences: {
    type: string;
    subject: 'history' | 'math' | 'writing' | 'any';
    description: string;
  }[];
  isActive: boolean;
  progressTowardGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// NEXT SESSION ADJUSTMENTS
// ============================================

export interface NextSessionAdjustments {
  studentId: string;
  subject: 'history' | 'math' | 'writing';

  // Difficulty adjustments
  suggestedStartingTier: number;
  tierAdjustmentReason?: string;

  // Pacing adjustments
  suggestedSessionLength: number; // minutes
  pacingNotes?: string;

  // Content adjustments
  topicPreferences: string[];
  avoidTopics: string[];

  // Agent-specific notes
  agentNotes?: string; // Context for Socrates/Pythagoras/Shakespeare

  validUntil: Date;
  createdAt: Date;
}

// ============================================
// ARISTOTLE AGENT INTERFACE
// ============================================

export interface AristotleAgent {
  /**
   * Analyze a completed session and extract insights
   * Called asynchronously after session ends
   */
  analyzeSession(input: SessionAnalysisInput): Promise<SessionAnalysisResult>;

  /**
   * Update student's cognitive fingerprint based on new observations
   */
  updateCognitiveFingerprint(
    studentId: string,
    observations: BehavioralObservation[]
  ): Promise<CognitiveFingerprint>;

  /**
   * Update student's virtue progress
   */
  updateVirtueProgress(
    studentId: string,
    signals: SessionAnalysisResult['virtueSignals']
  ): Promise<VirtueProgress>;

  /**
   * Generate parent-facing insights
   * Called on-demand or weekly
   */
  generateParentInsight(studentId: string): Promise<ParentInsight>;

  /**
   * Generate recommendations for next session
   */
  getNextSessionAdjustments(
    studentId: string,
    subject: 'history' | 'math' | 'writing'
  ): Promise<NextSessionAdjustments>;

  /**
   * Get curriculum recommendations based on cognitive gaps
   */
  getCurriculumRecommendations(studentId: string): Promise<CurriculumRecommendation[]>;
}
