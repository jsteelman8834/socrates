/**
 * Agent Dispatcher
 *
 * Routes to the correct tutor agent based on subject.
 * Each agent has its own pedagogy and feedback style.
 *
 * - history → Socrates (questioning, knowledge/wisdom)
 * - math → Pythagoras (pattern discovery, fluency/concept/problem-solving)
 */

import { respondToAnswer as socrates } from '@/lib/ai/socrates-agent';
import { respondToMathAnswer as pythagoras } from '@/lib/ai/pythagoras-agent';
import type { QuestionWithAnswer, TutorFeedback } from '@/types';
import type { MathQuestionWithAnswer, MathTutorFeedback } from '@/types/math';

export type Subject = 'history' | 'math';
export type Agent = 'socrates' | 'pythagoras';

export interface AgentResponse {
  feedback: TutorFeedback | MathTutorFeedback;
  sessionUpdates: {
    newStreak: number;
    heartsLost: number;
    tierChange: number;
    xpEarned: number;
  };
}

export interface SessionContext {
  sessionId: string;
  studentId: string;
  studentName: string;
  currentStreak: number;
  heartsRemaining: number;
  currentTier: number;
}

/**
 * Determine which agent to use based on subject
 */
export function getAgentForSubject(subject: Subject): Agent {
  switch (subject) {
    case 'history':
      return 'socrates';
    case 'math':
      return 'pythagoras';
    default:
      return 'socrates';
  }
}

/**
 * Dispatch to the appropriate agent based on subject
 */
export async function dispatchToAgent(
  subject: Subject,
  sessionContext: SessionContext,
  question: QuestionWithAnswer | MathQuestionWithAnswer,
  selectedOptionId: string
): Promise<AgentResponse> {
  const agent = getAgentForSubject(subject);

  switch (agent) {
    case 'pythagoras':
      return pythagoras(
        sessionContext,
        question as MathQuestionWithAnswer,
        selectedOptionId
      );

    case 'socrates':
    default:
      return socrates(
        sessionContext,
        question as QuestionWithAnswer,
        selectedOptionId
      );
  }
}

/**
 * Get agent display info for UI
 */
export function getAgentInfo(agent: Agent) {
  switch (agent) {
    case 'pythagoras':
      return {
        name: 'Pythagoras',
        icon: '🔢',
        greeting: "Welcome, young mathematician! Let's discover the patterns hidden in numbers.",
        subject: 'Mathematics',
        philosophy: 'All is Number - patterns are the language of the universe.',
      };

    case 'socrates':
    default:
      return {
        name: 'Socrates',
        icon: '🦉',
        greeting: "Hello, young historian! Let's explore the past together.",
        subject: 'American History',
        philosophy: 'True wisdom comes from understanding, not just knowing.',
      };
  }
}
