import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuestionType } from '@/types';

// Preview-specific types
export type PreviewStatus = 'intro' | 'active' | 'batch-transition' | 'feedback' | 'summary';
export type FranklinEmotion = 'welcoming' | 'encouraging' | 'delighted' | 'impressed' | 'contemplative' | 'proud';

export interface PreviewQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  topicLabel: string;
  options: Array<{
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
    distractorType?: string;
  }>;
  correctOptionId: string;
  answerExplanation: string;
  mnemonics?: string[];
}

export interface PreviewFeedback {
  isCorrect: boolean;
  feedbackText: string;
  emotion: FranklinEmotion;
  aphorism?: string;
  correctAnswer?: {
    optionId: string;
    text: string;
  };
}

export interface AnswerRecord {
  questionId: string;
  questionType: QuestionType;
  isCorrect: boolean;
  selectedOptionId: string;
  timeSpentSeconds: number;
}

interface PreviewSessionState {
  // Session tracking
  status: PreviewStatus;
  currentBatch: 1 | 2 | 3;
  currentQuestionIndex: number; // 0-14

  // Question state
  currentQuestion: PreviewQuestion | null;
  selectedOptionId: string | null;
  questionStartTime: number | null;

  // Game mechanics
  currentStreak: number;
  maxStreak: number;
  heartsRemaining: number;

  // Scoring
  knowledgeCorrect: number;
  knowledgeTotal: number;
  wisdomCorrect: number;
  wisdomTotal: number;

  // Feedback
  feedback: PreviewFeedback | null;

  // Answer history
  answers: AnswerRecord[];

  // Actions
  startPreview: () => void;
  loadQuestion: (question: PreviewQuestion) => void;
  selectOption: (optionId: string) => void;
  submitAnswer: () => PreviewFeedback;
  dismissFeedback: () => void;
  nextBatch: () => void;
  resetPreview: () => void;
}

const initialState = {
  status: 'intro' as PreviewStatus,
  currentBatch: 1 as const,
  currentQuestionIndex: 0,
  currentQuestion: null,
  selectedOptionId: null,
  questionStartTime: null,
  currentStreak: 0,
  maxStreak: 0,
  heartsRemaining: 3,
  knowledgeCorrect: 0,
  knowledgeTotal: 0,
  wisdomCorrect: 0,
  wisdomTotal: 0,
  feedback: null,
  answers: [],
};

// Franklin feedback generation
function generateFranklinFeedback(
  isCorrect: boolean,
  questionType: QuestionType,
  streak: number,
  explanation: string,
  correctAnswer?: { optionId: string; text: string }
): PreviewFeedback {
  const aphorisms = [
    "An investment in knowledge pays the best interest.",
    "Well done is better than well said.",
    "Energy and persistence conquer all things.",
    "Without continual growth, words like improvement have no meaning.",
    "Tell me and I forget, teach me and I may remember, involve me and I learn.",
  ];

  if (isCorrect) {
    if (streak >= 3) {
      return {
        isCorrect: true,
        feedbackText: `Capital! Industriousness rewarded! Your streak of ${streak} shows the power of consistent effort. ${explanation}`,
        emotion: 'impressed',
        aphorism: aphorisms[Math.floor(Math.random() * aphorisms.length)],
      };
    }
    return {
      isCorrect: true,
      feedbackText: `Excellent! Your mind is as sharp as a lightning rod. ${explanation}`,
      emotion: 'delighted',
    };
  } else {
    if (questionType === 'wisdom') {
      return {
        isCorrect: false,
        feedbackText: `Hmm, let us reason this through together. ${explanation}`,
        emotion: 'contemplative',
        correctAnswer,
      };
    }
    return {
      isCorrect: false,
      feedbackText: `Ah, a common slip! Let me share a trick to remember this. ${explanation}`,
      emotion: 'encouraging',
      correctAnswer,
    };
  }
}

export const usePreviewSessionStore = create<PreviewSessionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startPreview: () => {
        set({
          ...initialState,
          status: 'active',
          questionStartTime: Date.now(),
        });
      },

      loadQuestion: (question: PreviewQuestion) => {
        set({
          currentQuestion: question,
          selectedOptionId: null,
          questionStartTime: Date.now(),
          status: 'active',
        });
      },

      selectOption: (optionId: string) => {
        set({ selectedOptionId: optionId });
      },

      submitAnswer: () => {
        const { currentQuestion, selectedOptionId, questionStartTime, currentStreak, answers } = get();
        if (!currentQuestion || !selectedOptionId) {
          throw new Error('No question or answer selected');
        }

        const selectedOption = currentQuestion.options.find(o => o.id === selectedOptionId);
        const isCorrect = selectedOption?.isCorrect ?? false;
        const timeSpentSeconds = questionStartTime
          ? Math.floor((Date.now() - questionStartTime) / 1000)
          : 0;

        // Update scores
        const newStreak = isCorrect ? currentStreak + 1 : 0;
        const correctOption = currentQuestion.options.find(o => o.isCorrect);

        const feedback = generateFranklinFeedback(
          isCorrect,
          currentQuestion.questionType,
          newStreak,
          currentQuestion.answerExplanation,
          correctOption ? { optionId: correctOption.id, text: correctOption.text } : undefined
        );

        // Record answer
        const answerRecord: AnswerRecord = {
          questionId: currentQuestion.id,
          questionType: currentQuestion.questionType,
          isCorrect,
          selectedOptionId,
          timeSpentSeconds,
        };

        set(state => ({
          feedback,
          status: 'feedback',
          currentStreak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          heartsRemaining: isCorrect ? state.heartsRemaining : Math.max(0, state.heartsRemaining - 1),
          knowledgeCorrect: state.knowledgeCorrect + (isCorrect && currentQuestion.questionType === 'knowledge' ? 1 : 0),
          knowledgeTotal: state.knowledgeTotal + (currentQuestion.questionType === 'knowledge' ? 1 : 0),
          wisdomCorrect: state.wisdomCorrect + (isCorrect && currentQuestion.questionType === 'wisdom' ? 1 : 0),
          wisdomTotal: state.wisdomTotal + (currentQuestion.questionType === 'wisdom' ? 1 : 0),
          answers: [...answers, answerRecord],
        }));

        return feedback;
      },

      dismissFeedback: () => {
        const { currentQuestionIndex, currentBatch, heartsRemaining } = get();
        const questionInBatch = currentQuestionIndex % 5;

        // Check for game over (no hearts)
        if (heartsRemaining <= 0) {
          set({ status: 'summary' });
          return;
        }

        // Check if batch is complete (5 questions per batch)
        if (questionInBatch === 4) {
          // End of batch
          if (currentBatch === 3) {
            // End of preview
            set({ status: 'summary' });
          } else {
            // Show batch transition
            set({ status: 'batch-transition' });
          }
        } else {
          // Next question in same batch
          set(state => ({
            currentQuestionIndex: state.currentQuestionIndex + 1,
            feedback: null,
            status: 'active',
          }));
        }
      },

      nextBatch: () => {
        set(state => ({
          currentBatch: (state.currentBatch + 1) as 1 | 2 | 3,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          feedback: null,
          status: 'active',
        }));
      },

      resetPreview: () => {
        set(initialState);
      },
    }),
    {
      name: 'preview-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
