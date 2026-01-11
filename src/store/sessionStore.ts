import { create } from 'zustand';
import type { TutorFeedback, AvatarEmotion } from '@/types';

interface SessionState {
  // Session info
  sessionId: string | null;
  topicId: string | null;
  status: 'idle' | 'loading' | 'active' | 'feedback' | 'summary' | 'error';

  // Current question
  currentQuestion: {
    id: string;
    questionText: string;
    questionType: 'knowledge' | 'wisdom';
    options: Array<{
      id: string;
      label: string;
      text: string;
    }>;
  } | null;
  selectedOptionId: string | null;
  questionStartTime: number | null;

  // Game state
  currentTier: number;
  currentStreak: number;
  maxStreak: number;
  heartsRemaining: number;
  questionsAnswered: number;
  knowledgeProgress: number;
  wisdomProgress: number;
  totalXp: number;

  // Feedback
  feedback: TutorFeedback | null;
  tierChanged: boolean;
  tierDirection: 'up' | 'down' | null;

  // Summary
  sessionSummary: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    knowledgeAccuracy: number;
    wisdomAccuracy: number;
    maxStreak: number;
    xpEarned: number;
  } | null;

  // Error
  error: string | null;

  // Actions
  startSession: (topicId: string) => Promise<void>;
  fetchNextQuestion: () => Promise<void>;
  selectOption: (optionId: string) => void;
  submitAnswer: () => Promise<void>;
  dismissFeedback: () => void;
  resetSession: () => void;
}

const initialState = {
  sessionId: null,
  topicId: null,
  status: 'idle' as const,
  currentQuestion: null,
  selectedOptionId: null,
  questionStartTime: null,
  currentTier: 1,
  currentStreak: 0,
  maxStreak: 0,
  heartsRemaining: 3,
  questionsAnswered: 0,
  knowledgeProgress: 0,
  wisdomProgress: 0,
  totalXp: 0,
  feedback: null,
  tierChanged: false,
  tierDirection: null,
  sessionSummary: null,
  error: null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,

  startSession: async (topicId: string) => {
    set({ status: 'loading', topicId, error: null });

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to start session');
      }

      set({
        sessionId: data.data.sessionId,
        currentTier: data.data.startingTier,
        heartsRemaining: data.data.hearts,
        status: 'active',
      });

      // Fetch first question
      await get().fetchNextQuestion();
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  fetchNextQuestion: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    set({ status: 'loading' });

    try {
      const response = await fetch(`/api/sessions/${sessionId}/question`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch question');
      }

      set({
        currentQuestion: data.data.question,
        selectedOptionId: null,
        questionStartTime: Date.now(),
        status: 'active',
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  selectOption: (optionId: string) => {
    set({ selectedOptionId: optionId });
  },

  submitAnswer: async () => {
    const { sessionId, currentQuestion, selectedOptionId, questionStartTime } = get();
    if (!sessionId || !currentQuestion || !selectedOptionId) return;

    set({ status: 'loading' });

    const timeSpentSeconds = questionStartTime
      ? Math.floor((Date.now() - questionStartTime) / 1000)
      : 0;

    try {
      const response = await fetch(`/api/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOptionId,
          timeSpentSeconds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to submit answer');
      }

      const { feedback, sessionState, sessionEnded, tierChanged, tierDirection, sessionSummary } =
        data.data;

      set({
        feedback,
        tierChanged,
        tierDirection,
        currentTier: sessionState.currentTier,
        currentStreak: sessionState.currentStreak,
        maxStreak: sessionState.maxStreak,
        heartsRemaining: sessionState.heartsRemaining,
        questionsAnswered: sessionState.questionsAnswered,
        knowledgeProgress: sessionState.knowledgeProgress,
        wisdomProgress: sessionState.wisdomProgress,
        totalXp: sessionState.totalXp,
        status: 'feedback',
        sessionSummary: sessionEnded ? sessionSummary : null,
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  dismissFeedback: () => {
    const { sessionSummary } = get();

    if (sessionSummary) {
      set({ status: 'summary' });
    } else {
      get().fetchNextQuestion();
    }
  },

  resetSession: () => {
    set(initialState);
  },
}));
