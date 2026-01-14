/**
 * Franklin Academy Store
 *
 * Manages state for Franklin's Grandson Academy sessions:
 * - Enrollment and progress tracking
 * - Daily session flow (4 parts: recap, story, mission, ledger)
 * - Skills accumulation (curiosity, courage, logic, communication)
 * - Interaction with FranklinAgent via API routes
 */

import { create } from 'zustand';
import type {
  FranklinAcademyState,
  FranklinEpisode,
  FranklinEnrollment,
  FranklinSession,
  ChoiceHistory,
  ChoicePoint,
  MissionSubmission,
  MissionEvaluation,
  LedgerResponse,
  SkillScores,
  VocabCard,
} from '@/types/franklin';

const initialSkills: SkillScores = {
  curiosity: 0,
  courage: 0,
  logic: 0,
  communication: 0,
};

export const useFranklinAcademyStore = create<FranklinAcademyState>((set, get) => ({
  // ============================================
  // STATE
  // ============================================

  // Enrollment
  enrollmentId: null,
  currentWeek: 1,
  currentDay: 1,
  completedDays: [],

  // Skills
  skills: { ...initialSkills },

  // Current Session
  sessionId: null,
  sessionStatus: 'idle',
  currentPart: 'recap',

  // Episode data
  currentEpisode: null,

  // Part 1: Recap
  recap: null,
  vocabCards: [],

  // Part 2: Story
  storyNarrative: [],
  currentChoicePoint: null,
  selectedChoice: null,
  choiceHistory: [],

  // Part 3: Mission
  missionSubmission: null,
  missionEvaluation: null,

  // Part 4: Ledger
  ledgerEntry: null,
  ledgerResponse: null,

  // UI State
  franklinMessage: null,
  franklinEmotion: 'welcoming',
  isFactChecking: false,
  error: null,

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Start or resume Franklin Academy enrollment
   */
  startAcademy: async () => {
    set({ sessionStatus: 'loading', error: null });

    try {
      const response = await fetch('/api/franklin-academy/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to enroll');
      }

      const data = await response.json();

      set({
        enrollmentId: data.enrollment.id,
        currentWeek: data.enrollment.currentWeek,
        currentDay: data.enrollment.currentDay,
        completedDays: data.enrollment.completedDays,
        skills: {
          curiosity: data.enrollment.curiosityScore,
          courage: data.enrollment.courageScore,
          logic: data.enrollment.logicScore,
          communication: data.enrollment.communicationScore,
        },
        sessionStatus: 'idle',
        error: null,
      });
    } catch (error) {
      console.error('Failed to start academy:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to start academy',
        sessionStatus: 'complete', // Don't retry automatically - user must click "Try Again"
      });
    }
  },

  /**
   * Start a specific day's session
   */
  startDay: async (day: number) => {
    const { enrollmentId } = get();
    if (!enrollmentId) {
      set({ error: 'No enrollment found. Please start academy first.' });
      return;
    }

    set({ sessionStatus: 'loading', currentDay: day, error: null });

    try {
      const response = await fetch('/api/franklin-academy/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, day }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to start session');
      }

      const data = await response.json();

      set({
        sessionId: data.session.id,
        currentEpisode: data.episode,
        currentPart: 'recap',
        sessionStatus: 'active',
        storyNarrative: [],
        choiceHistory: data.previousChoices || [],
        currentChoicePoint: null,
        selectedChoice: null,
        missionSubmission: null,
        missionEvaluation: null,
        ledgerEntry: null,
        ledgerResponse: null,
        error: null,
      });

      // Auto-load recap
      await get().loadRecap();
    } catch (error) {
      console.error('Failed to start day:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to start session',
        sessionStatus: 'idle',
      });
    }
  },

  // ============================================
  // PART 1: RECAP + VOCAB
  // ============================================

  /**
   * Load personalized recap for the day
   */
  loadRecap: async () => {
    const { sessionId, choiceHistory } = get();
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/franklin-academy/sessions/${sessionId}/recap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choiceHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to load recap');
      }

      const data = await response.json();
      const { currentEpisode } = get();

      set({
        recap: data.recap,
        vocabCards: currentEpisode?.vocabCards || [],
        franklinMessage: data.franklinGreeting,
        franklinEmotion: 'welcoming',
      });
    } catch (error) {
      console.error('Failed to load recap:', error);
      set({ error: 'Failed to load recap' });
    }
  },

  /**
   * Complete recap and move to story
   */
  completeRecap: () => {
    set({ currentPart: 'story' });
    get().loadStory();
  },

  // ============================================
  // PART 2: STORY + CHOICES
  // ============================================

  /**
   * Load story narrative and first choice point
   */
  loadStory: async () => {
    const { sessionId, currentEpisode, choiceHistory } = get();
    if (!sessionId || !currentEpisode) return;

    try {
      // Get first choice point from episode
      const firstChoice = currentEpisode.story.choicePoints[0];
      if (!firstChoice) {
        // No choices in this episode, skip to mission
        set({ currentPart: 'mission' });
        return;
      }

      const response = await fetch(`/api/franklin-academy/sessions/${sessionId}/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choicePointId: firstChoice.id,
          choiceHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load story');
      }

      const data = await response.json();

      set({
        storyNarrative: [data.narrative],
        currentChoicePoint: firstChoice,
        franklinMessage: null,
        franklinEmotion: 'storytelling',
      });
    } catch (error) {
      console.error('Failed to load story:', error);
      set({ error: 'Failed to load story' });
    }
  },

  /**
   * Make a choice in the story
   */
  makeChoice: async (choiceId: string) => {
    const { sessionId, currentChoicePoint, choiceHistory, currentEpisode } = get();
    if (!sessionId || !currentChoicePoint) return;

    set({ selectedChoice: choiceId, sessionStatus: 'loading' });

    try {
      const response = await fetch(`/api/franklin-academy/sessions/${sessionId}/choice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choicePointId: currentChoicePoint.id,
          choiceOptionId: choiceId,
          choiceHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit choice');
      }

      const data = await response.json();

      // Update narrative and skills
      set((state) => ({
        storyNarrative: [...state.storyNarrative, data.franklinResponse, data.continuedNarrative],
        choiceHistory: [...state.choiceHistory, data.choiceRecord],
        skills: {
          curiosity: state.skills.curiosity + (data.skillsAwarded.curiosity || 0),
          courage: state.skills.courage + (data.skillsAwarded.courage || 0),
          logic: state.skills.logic + (data.skillsAwarded.logic || 0),
          communication: state.skills.communication + (data.skillsAwarded.communication || 0),
        },
        franklinMessage: data.franklinResponse,
        franklinEmotion: 'thoughtful',
        sessionStatus: 'active',
        selectedChoice: null,
      }));

      // Check if there's another choice point
      if (data.nextChoicePoint) {
        set({ currentChoicePoint: data.nextChoicePoint });
      } else {
        // Story complete, no more choices
        set({ currentChoicePoint: null });
      }
    } catch (error) {
      console.error('Failed to make choice:', error);
      set({ error: 'Failed to submit choice', sessionStatus: 'active' });
    }
  },

  /**
   * Complete story and move to mission
   */
  completeStory: () => {
    set({ currentPart: 'mission' });
  },

  // ============================================
  // PART 3: MISSION
  // ============================================

  /**
   * Submit mission
   */
  submitMission: async (submission: Partial<MissionSubmission>) => {
    const { sessionId } = get();
    if (!sessionId) return;

    set({ missionSubmission: submission as MissionSubmission, sessionStatus: 'loading' });

    try {
      const response = await fetch(`/api/franklin-academy/sessions/${sessionId}/mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        throw new Error('Failed to submit mission');
      }

      const data = await response.json();

      set((state) => ({
        missionEvaluation: data.evaluation,
        skills: {
          curiosity: state.skills.curiosity + (data.evaluation.skillsAwarded.curiosity || 0),
          courage: state.skills.courage + (data.evaluation.skillsAwarded.courage || 0),
          logic: state.skills.logic + (data.evaluation.skillsAwarded.logic || 0),
          communication: state.skills.communication + (data.evaluation.skillsAwarded.communication || 0),
        },
        franklinMessage: data.evaluation.franklinFeedback,
        franklinEmotion: 'impressed',
        sessionStatus: 'active',
      }));
    } catch (error) {
      console.error('Failed to submit mission:', error);
      set({ error: 'Failed to submit mission', sessionStatus: 'active' });
    }
  },

  /**
   * Complete mission and move to ledger
   */
  completeMission: () => {
    set({ currentPart: 'ledger' });
  },

  // ============================================
  // PART 4: LIBERTY LEDGER
  // ============================================

  /**
   * Submit ledger entry (reflection)
   */
  submitLedgerEntry: async (text: string) => {
    const { sessionId } = get();
    if (!sessionId) return;

    set({ ledgerEntry: text, sessionStatus: 'loading' });

    try {
      const response = await fetch(`/api/franklin-academy/sessions/${sessionId}/ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflectionText: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit ledger entry');
      }

      const data = await response.json();

      set((state) => ({
        ledgerResponse: data.response,
        skills: {
          ...state.skills,
          [data.response.skillAwarded]:
            state.skills[data.response.skillAwarded] + data.response.pointsAwarded,
        },
        franklinMessage: data.response.franklinResponse,
        franklinEmotion: 'proud',
        sessionStatus: 'active',
      }));
    } catch (error) {
      console.error('Failed to submit ledger:', error);
      set({ error: 'Failed to submit reflection', sessionStatus: 'active' });
    }
  },

  /**
   * Complete ledger and finish day
   */
  completeLedger: () => {
    set({ currentPart: 'complete' });
    get().completeDay();
  },

  // ============================================
  // DAY COMPLETION
  // ============================================

  /**
   * Mark day as complete
   */
  completeDay: async () => {
    const { sessionId, currentDay } = get();
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/franklin-academy/sessions/${sessionId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to complete day');
      }

      set((state) => ({
        completedDays: [...state.completedDays, currentDay],
        sessionStatus: 'complete',
      }));
    } catch (error) {
      console.error('Failed to complete day:', error);
      set({ error: 'Failed to complete day' });
    }
  },

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Fact-check a historical claim
   */
  factCheck: async (claim: string) => {
    set({ isFactChecking: true });

    try {
      const response = await fetch('/api/franklin-academy/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, context: 'Pre-Revolutionary Period (1763-1775)' }),
      });

      if (!response.ok) {
        throw new Error('Fact check failed');
      }

      const data = await response.json();

      set({
        franklinMessage: data.franklinPresentation,
        franklinEmotion: 'curious',
        isFactChecking: false,
      });
    } catch (error) {
      console.error('Fact check failed:', error);
      set({ error: 'Failed to check fact', isFactChecking: false });
    }
  },

  /**
   * Reset session state
   */
  resetSession: () => {
    set({
      sessionId: null,
      sessionStatus: 'idle',
      currentPart: 'recap',
      currentEpisode: null,
      recap: null,
      vocabCards: [],
      storyNarrative: [],
      currentChoicePoint: null,
      selectedChoice: null,
      missionSubmission: null,
      missionEvaluation: null,
      ledgerEntry: null,
      ledgerResponse: null,
      franklinMessage: null,
      error: null,
    });
  },
}));
