/**
 * Multi-Model AI Configuration
 *
 * Model Selection Strategy:
 * - OpenAI (GPT-4): Logic, grading, structured analysis
 * - Claude: Creative feedback, Socratic dialogue, personality
 * - Gemini Flash: Cheap tasks, simple queries, batch operations
 */

import OpenAI from 'openai';
import Anthropic from 'anthropic';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize clients
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Model types for different tasks
export type AITask =
  | 'grade_answer'        // OpenAI - logical evaluation
  | 'diagnose_failure'    // OpenAI - analysis
  | 'generate_feedback'   // Claude - creative, personality
  | 'socratic_dialogue'   // Claude - nuanced conversation
  | 'simple_query'        // Gemini Flash - cheap operations
  | 'summarize';          // Gemini Flash - batch operations

export function getModelForTask(task: AITask): {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
} {
  switch (task) {
    case 'grade_answer':
    case 'diagnose_failure':
      return { provider: 'openai', model: 'gpt-4-turbo-preview' };

    case 'generate_feedback':
    case 'socratic_dialogue':
      return { provider: 'anthropic', model: 'claude-sonnet-4-20250514' };

    case 'simple_query':
    case 'summarize':
      return { provider: 'google', model: 'gemini-1.5-flash' };

    default:
      return { provider: 'anthropic', model: 'claude-sonnet-4-20250514' };
  }
}
