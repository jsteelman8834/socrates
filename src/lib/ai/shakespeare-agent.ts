/**
 * Shakespeare Agent - Creative Writing Tutor
 *
 * Shakespeare co-writes stories with 5th graders through:
 * - Phase-based sessions: Warm-up → Create → Upgrade → Reflect
 * - Rubric evaluation (not right/wrong)
 * - Director's Notes feedback: One Win, One Grow, One Example
 * - Scaffold help when students are stuck
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  WriterProfile,
  WritingSession,
  WritingPrompt,
  StoryDraft,
  WritingEvaluation,
  DirectorsNotes,
  ScaffoldHelp,
  StuckType,
  ShakespeareEmotion,
  ChallengeLevel,
  CHALLENGE_LADDER,
  StoryPowerRubric,
  CraftGrowthRubric,
  DetectedElements,
} from '@/types/writing';

// ============================================
// SHAKESPEARE'S VOICE
// ============================================

const SHAKESPEARE_SYSTEM_PROMPT = `You are Shakespeare, a theatrical, encouraging creative writing mentor for 5th graders (ages 10-11). You are NOT a grammar police or red-pen editor - you are a co-creator who delights in storytelling.

## Your Identity
You speak with theatrical flair but remain accessible to children. You reference your plays when helpful, but never condescendingly. You believe every child has stories worth telling.

## Core Philosophy
- **DELIGHT FIRST, RULES LATER**: Spark joy in writing before teaching craft
- **CHARACTER-DRIVEN**: Stories live through characters who WANT something
- **PLAYFUL LANGUAGE**: Writing should feel like play, not homework
- **GROWTH THROUGH REVISION**: First drafts are just the beginning
- **GRAMMAR EMERGES**: Good grammar comes from reading and writing lots

## The Challenge Ladder (Reference)
1. Write a short funny/interesting scene
2. Add setting and one sensory detail
3. Add a goal and an obstacle
4. Add stakes - why it matters
5. Add a twist ending
6. Plant a clue early that pays off
7. Two characters with different goals
8. Rewrite from another point of view

## Your Voice
- Theatrical but warm: "What a twist! I did not see that coming!"
- Specific praise: "This line - 'the dragon burped sparkles' - made me laugh!"
- Playful challenges: "Dare you to add a smell to this scene!"
- Never harsh: Frame everything as discovery, not correction
- Theater metaphors: "The stage is set!", "What a dramatic entrance!"

## Feedback Format - Director's Notes
ALWAYS give feedback as:
1. **WIN**: Something specific they did well (quote their work!)
2. **GROW**: One specific thing to try (invitation, not criticism)
3. **EXAMPLE**: Show don't tell - rewrite one sentence as a model

## Safety
- No sexual content, graphic violence, self-harm, or adult themes
- Gently redirect unsafe content toward creativity
- Never request personal identifying information

## Response Length
- Keep messages SHORT (2-4 sentences for encouragement)
- Feedback can be slightly longer but never lecture
- Always end with energy and forward momentum`;

// ============================================
// EVALUATION PROMPT
// ============================================

const EVALUATION_PROMPT = `Evaluate this 5th grader's creative writing. Be encouraging but honest. This is for a student at Challenge Level {challengeLevel}.

## Student's Writing:
{content}

## Writing Prompt Given:
{promptText}

## Challenge Level {challengeLevel} Expectations:
{levelExpectations}

## Evaluate Using These Rubrics (1-5 scale):

### STORY POWER
- **Character Want** (1-5): Is there someone who wants something? How clear/specific?
- **Obstacle** (1-5): Is something in the way of what they want?
- **Stakes** (1-5): Do we care what happens? Why does it matter?
- **Voice** (1-5): Does it sound like THIS writer? Unique personality?
- **Memorable Moment** (1-5): Is there one line/scene that sticks?

### CRAFT GROWTH
- **Clarity** (1-5): Can we follow the story?
- **Concrete Details** (1-5): Can we see/hear/smell the story?
- **Sentence Control** (1-5): Are sentences well-formed?
- **Sentence Variety** (1-5): Mix of short and long sentences?

## Detected Elements
Identify what's present in the writing:
- Has character? Has obstacle? Has dialogue? Has setting?
- Which senses are used? (visual, sound, smell, taste, touch)

## Director's Notes
Provide ONE win, ONE grow suggestion, and ONE example rewrite.

Respond with this JSON:
{
  "storyPower": {
    "characterWant": { "score": 1-5, "evidence": "quote or explanation" },
    "obstacle": { "score": 1-5, "evidence": "..." },
    "stakes": { "score": 1-5, "evidence": "..." },
    "voice": { "score": 1-5, "evidence": "..." },
    "memorableMoment": { "score": 1-5, "quote": "the memorable line or null" }
  },
  "craftGrowth": {
    "clarity": { "score": 1-5, "evidence": "..." },
    "concreteDetails": { "score": 1-5, "evidence": "...", "sensoryTypes": [] },
    "sentenceControl": { "score": 1-5, "evidence": "..." },
    "sentenceVariety": { "score": 1-5, "evidence": "..." }
  },
  "detectedElements": {
    "hasCharacter": true/false,
    "hasObstacle": true/false,
    "hasDialogue": true/false,
    "hasDescription": true/false,
    "hasSetting": true/false,
    "sensoryDetails": ["visual", "sound", etc],
    "sentenceTypes": ["simple", "compound", "complex"]
  },
  "directorsNotes": {
    "win": {
      "aspect": "which rubric dimension",
      "quote": "specific text from their writing",
      "explanation": "why this is good (1 sentence)"
    },
    "grow": {
      "aspect": "one dimension to improve",
      "suggestion": "specific actionable suggestion",
      "example": "rewritten version of one of their sentences"
    },
    "nextChallenge": "optional prompt for what to try next"
  },
  "emotion": "delighted|impressed|encouraging|curious|thoughtful|playful|dramatic",
  "levelAppropriate": true/false,
  "suggestedNextLevel": 1-8,
  "confidence": 0.0-1.0
}`;

// ============================================
// SCAFFOLD PROMPTS
// ============================================

const SCAFFOLD_PROMPTS: Record<StuckType, string> = {
  cant_start: `The student is staring at a blank page and can't start writing. Their prompt is: "{promptText}"

Generate helpful scaffolds:
1. Three story starter CHOICES they can pick from
2. A fill-in-the-blank template
3. A first sentence they can use or modify

Be playful and reduce anxiety about the blank page.`,

  stuck_middle: `The student started writing but is stuck in the middle.
Their prompt: "{promptText}"
What they've written so far: "{currentContent}"

Generate scaffolds to help them continue:
1. Three possible "what happens next" CHOICES
2. A "But then..." continuation prompt
3. An example of how to escalate the conflict

Don't write for them - give them options to choose from.`,

  dont_know_ending: `The student has written most of the story but doesn't know how to end it.
Their prompt: "{promptText}"
What they've written: "{currentContent}"

Generate ending scaffolds:
1. Three possible ending TYPES (happy, twist, cliffhanger)
2. A "The last thing that happened was..." template
3. Suggest what could change or be resolved

Help them find THEIR ending, not write it for them.`,

  need_ideas: `The student wants more creative ideas to add to their story.
Their prompt: "{promptText}"
What they've written: "{currentContent}"

Generate idea scaffolds:
1. Three unexpected things that could happen
2. A detail they could add (sensory, character, setting)
3. A "what if..." question to spark imagination

Spark creativity without taking over their story.`,
};

// ============================================
// SHAKESPEARE AGENT CLASS
// ============================================

export class ShakespeareAgent {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  /**
   * Generate a greeting for starting a session
   */
  async generateGreeting(
    writerProfile: WriterProfile,
    prompt: WritingPrompt
  ): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: SHAKESPEARE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a SHORT (2-3 sentences) theatrical greeting for a 5th grader starting a writing session.

Their interests: ${writerProfile.interests.join(', ')}
Challenge level: ${writerProfile.challengeLevel}
Today's prompt title: "${prompt.title}"

Be warm, theatrical, and get them excited to write! End with energy.`,
        },
      ],
    });

    const text = response.content.find((c) => c.type === 'text');
    return text?.type === 'text' ? text.text : "The stage is set, young playwright! Let's create something wonderful today!";
  }

  /**
   * Generate warm-up prompt response/encouragement
   */
  async respondToWarmUp(
    content: string,
    writerProfile: WriterProfile
  ): Promise<{ message: string; emotion: ShakespeareEmotion }> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: SHAKESPEARE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `A 5th grader just completed a quick warm-up exercise. Their response:

"${content}"

Give a SHORT (1-2 sentences) encouraging response that celebrates their creativity and transitions them to the main writing challenge. Be specific about what you liked!

Respond with JSON:
{ "message": "your response", "emotion": "delighted|impressed|encouraging|playful" }`,
        },
      ],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (text?.type === 'text') {
      try {
        return JSON.parse(text.text);
      } catch {
        return { message: text.text, emotion: 'encouraging' };
      }
    }
    return { message: 'Wonderful! Now let\'s dive into today\'s challenge!', emotion: 'encouraging' };
  }

  /**
   * Evaluate a story draft
   */
  async evaluateDraft(
    content: string,
    prompt: WritingPrompt,
    challengeLevel: ChallengeLevel
  ): Promise<WritingEvaluation> {
    const levelExpectations = this.getLevelExpectations(challengeLevel);

    const evaluationPrompt = EVALUATION_PROMPT
      .replace('{content}', content)
      .replace('{promptText}', prompt.promptText)
      .replace(/{challengeLevel}/g, String(challengeLevel))
      .replace('{levelExpectations}', levelExpectations);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SHAKESPEARE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: evaluationPrompt }],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') {
      throw new Error('No evaluation response from Shakespeare');
    }

    const evaluation = JSON.parse(text.text);

    // Build rubric scores
    const storyPower: StoryPowerRubric = {
      characterWant: evaluation.storyPower.characterWant.score,
      obstacle: evaluation.storyPower.obstacle.score,
      stakes: evaluation.storyPower.stakes.score,
      voice: evaluation.storyPower.voice.score,
      memorableMoment: evaluation.storyPower.memorableMoment.score,
      average: 0,
    };
    storyPower.average =
      (storyPower.characterWant +
        storyPower.obstacle +
        storyPower.stakes +
        storyPower.voice +
        storyPower.memorableMoment) /
      5;

    const craftGrowth: CraftGrowthRubric = {
      clarity: evaluation.craftGrowth.clarity.score,
      concreteDetails: evaluation.craftGrowth.concreteDetails.score,
      sentenceControl: evaluation.craftGrowth.sentenceControl.score,
      sentenceVariety: evaluation.craftGrowth.sentenceVariety.score,
      revisionWillingness: 3, // Default, updated after revision
      average: 0,
    };
    craftGrowth.average =
      (craftGrowth.clarity +
        craftGrowth.concreteDetails +
        craftGrowth.sentenceControl +
        craftGrowth.sentenceVariety) /
      4;

    return {
      storyPower,
      craftGrowth,
      detectedElements: evaluation.detectedElements,
      directorsNotes: {
        win: evaluation.directorsNotes.win,
        grow: evaluation.directorsNotes.grow,
        nextChallenge: evaluation.directorsNotes.nextChallenge,
        shakespeareMessage: this.buildShakespeareMessage(evaluation),
        emotion: evaluation.emotion,
      },
      challengeLevelAppropriate: evaluation.levelAppropriate,
      suggestedNextLevel: evaluation.suggestedNextLevel,
      confidence: evaluation.confidence,
    };
  }

  /**
   * Generate scaffold help when student is stuck
   */
  async generateScaffold(
    stuckType: StuckType,
    prompt: WritingPrompt,
    currentContent: string
  ): Promise<ScaffoldHelp> {
    const scaffoldPrompt = SCAFFOLD_PROMPTS[stuckType]
      .replace('{promptText}', prompt.promptText)
      .replace('{currentContent}', currentContent || '(nothing yet)');

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SHAKESPEARE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${scaffoldPrompt}

Respond with JSON:
{
  "scaffoldType": "choices|fill_in|example_line|first_sentence",
  "content": {
    "choices": ["option 1", "option 2", "option 3"],
    "fillInTemplate": "template with ___ blanks",
    "exampleLines": ["example 1"],
    "firstSentence": "optional starter"
  },
  "shakespeareMessage": "short encouraging message (1-2 sentences)",
  "emotion": "encouraging|playful|curious"
}`,
        },
      ],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') {
      throw new Error('No scaffold response from Shakespeare');
    }

    return JSON.parse(text.text);
  }

  /**
   * Generate upgrade prompt after first draft
   */
  async generateUpgradePrompt(
    evaluation: WritingEvaluation,
    content: string,
    challengeLevel: ChallengeLevel
  ): Promise<{ prompt: string; focus: string; emotion: ShakespeareEmotion }> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: SHAKESPEARE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Based on this evaluation, generate ONE focused upgrade prompt for the student.

What they wrote: "${content.substring(0, 500)}..."

Their "grow" area: ${evaluation.directorsNotes.grow.aspect}
Suggestion: ${evaluation.directorsNotes.grow.suggestion}

Generate a SHORT, specific upgrade prompt (2-3 sentences) that asks them to improve ONE thing. Make it feel like an exciting challenge, not a correction.

Respond with JSON:
{ "prompt": "the upgrade prompt", "focus": "what to improve", "emotion": "playful|curious|encouraging" }`,
        },
      ],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (text?.type === 'text') {
      try {
        return JSON.parse(text.text);
      } catch {
        return {
          prompt: evaluation.directorsNotes.grow.suggestion,
          focus: evaluation.directorsNotes.grow.aspect,
          emotion: 'encouraging',
        };
      }
    }
    return {
      prompt: evaluation.directorsNotes.grow.suggestion,
      focus: evaluation.directorsNotes.grow.aspect,
      emotion: 'encouraging',
    };
  }

  /**
   * Generate session completion celebration
   */
  async generateCelebration(
    session: WritingSession,
    finalDraft: StoryDraft,
    evaluation: WritingEvaluation
  ): Promise<{ message: string; highlights: string[]; xpEarned: number }> {
    const wordCount = finalDraft.wordCount || 0;
    const baseXP = Math.floor(wordCount / 10) * 5; // 5 XP per 10 words
    const revisionBonus = session.revisionCount > 0 ? 20 : 0;
    const qualityBonus = Math.floor(evaluation.storyPower.average * 10);
    const xpEarned = baseXP + revisionBonus + qualityBonus;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 250,
      system: SHAKESPEARE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a celebration message for completing a writing session!

Words written: ${wordCount}
Revisions made: ${session.revisionCount}
Story power score: ${evaluation.storyPower.average.toFixed(1)}/5
Their best moment: "${evaluation.directorsNotes.win.quote}"
XP earned: ${xpEarned}

Create a SHORT theatrical celebration (2-3 sentences) and list 2-3 specific highlights from their session.

Respond with JSON:
{
  "message": "celebration message",
  "highlights": ["highlight 1", "highlight 2"]
}`,
        },
      ],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (text?.type === 'text') {
      try {
        const result = JSON.parse(text.text);
        return { ...result, xpEarned };
      } catch {
        return {
          message: `Bravo! ${wordCount} words of pure storytelling magic! Until next time, young playwright!`,
          highlights: ['Completed your story', 'Made creative choices'],
          xpEarned,
        };
      }
    }
    return {
      message: `Bravo! ${wordCount} words of pure storytelling magic!`,
      highlights: ['Completed your story'],
      xpEarned,
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private getLevelExpectations(level: ChallengeLevel): string {
    const expectations: Record<ChallengeLevel, string> = {
      1: 'Just write something interesting or funny. Character and basic action.',
      2: 'Setting should be clear. At least one sensory detail (see, hear, smell, etc.)',
      3: 'Character should want something specific. Something should stand in their way.',
      4: 'We should understand WHY it matters if the character succeeds or fails.',
      5: 'The story should have a twist or surprise that changes how we see things.',
      6: 'A detail early in the story should become important at the end.',
      7: 'Two characters should want different things, creating conflict.',
      8: 'The story should show the same events from a different perspective.',
    };
    return expectations[level];
  }

  private buildShakespeareMessage(evaluation: Record<string, unknown>): string {
    const directorsNotes = evaluation.directorsNotes as {
      win: { explanation: string };
      grow: { suggestion: string };
    };
    return `${directorsNotes.win.explanation} For your next draft, ${directorsNotes.grow.suggestion.toLowerCase()}`;
  }
}

// Export singleton
export const shakespeare = new ShakespeareAgent();
