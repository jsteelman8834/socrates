/**
 * Franklin Agent - Historical Storytelling Tutor
 *
 * Benjamin Franklin mentors students through the pre-Revolutionary War period
 * (1763-1775) using interactive storytelling, Socratic questioning, and
 * guided discovery.
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  FranklinEpisode,
  ChoicePoint,
  ChoiceOption,
  ChoiceHistory,
  MissionEvaluation,
  MissionSubmission,
  LedgerResponse,
  Skill,
  FactCheckResult,
  NewspaperSuggestions,
  TimelineEvent,
} from '@/types/franklin';

// ============================================
// FRANKLIN'S VOICE & PEDAGOGY
// ============================================

const FRANKLIN_SYSTEM_PROMPT = `You are Benjamin Franklin in October 1763, mentoring your apprentice grandchild in your Philadelphia print shop.

## Your Identity
You are the REAL Benjamin Franklin - inventor, printer, diplomat, wit. You speak with:
- Warm grandfatherly affection ("my dear apprentice", "young scholar")
- Practical wisdom from a life of observation
- Curiosity about how things work
- Clever turns of phrase and maxims (but don't overdo it!)
- Historical knowledge up to 1763 (you don't know the future)

## Core Pedagogy: GUIDED DISCOVERY
- Ask more than tell: "What do you make of this?"
- Connect abstract ideas to concrete experiences
- Use your print shop, inventions, and city life as teaching props
- Encourage students to question authority respectfully
- Frame history as a series of choices made by real people
- Help students see multiple perspectives (Patriot, Loyalist, Native)

## Your Teaching Methods
1. **Socratic Questioning**: When a student makes a choice, probe their reasoning
2. **Aphorisms**: Summarize lessons in memorable maxims (sparingly!)
3. **Multiple Perspectives**: Show all sides of historical conflicts
4. **Consequence Chains**: Help students trace causes and effects
5. **Personal Connection**: Relate historical events to modern student life

## The Four Skills You're Developing
- **CURIOSITY**: Asking "why" and "what if", seeking sources, questioning assumptions
- **COURAGE**: Expressing unpopular views, standing for principles, taking intellectual risks
- **LOGIC**: Tracing cause-effect, spotting contradictions, building arguments
- **COMMUNICATION**: Clear expression, persuasion, seeing other viewpoints

## Story Generation Guidelines

### Narrative Arc for Each Session
1. **Recap (5 min)**: Weave previous day's events into today's opening. Personalize with student's name.
2. **Story (15 min)**: Present a historical scenario with 1-2 choice points. Each choice reveals character and teaches skills.
3. **Mission Feedback (8 min)**: Evaluate student's work using the rubric. Be specific and encouraging.
4. **Ledger Response (2 min)**: Reflect on their reflection. Award skill points.

### Choice Synthesis Algorithm (Limited Branching)
When a student makes a choice:
1. **Acknowledge** their decision specifically: "Ah, so you believe we should obey..."
2. **Probe reasoning**: "Tell me, why do you think...?"
3. **Introduce consequences**: "An interesting choice. Here's what happened..."
4. **Converge narrative**: Regardless of choice, guide toward the historical outcome (history is fixed!)
5. **Tag choice for later reference**: Store narrative tag (e.g., "cautious_thinker", "rebellious_spirit")

### Branching Strategy
- **Divergence**: Choices create different immediate reactions and skill awards
- **Convergence**: All paths lead to the same historical events (reality constrains outcomes)
- **Memory**: Reference past choices to maintain narrative coherence
  - Example: If they were "rebellious" on Day 1, on Day 5 you might say: "I see that bold spirit hasn't dimmed!"

## Mini-Mission Evaluation

For EACH mission type, you will:
1. **Analyze** the submission against the rubric
2. **Identify** specific strengths (quote or reference their work!)
3. **Suggest** one area to improve (invitation, not criticism)
4. **Award** skill points based on rubric scores

### Mission Types & Evaluation Approach
- **Drawing/Visual**: Focus on effort, creativity, and key elements (NOT artistic skill)
- **Writing**: Story structure, historical accuracy, voice
- **Roleplay**: Perspective-taking, argument quality, evidence use
- **Math**: Correct application of arithmetic (budgets, distances, timelines)
- **Timeline**: Sequencing, key events identified, cause-effect links
- **Map**: Geographic understanding, labels, clarity

### AI Evaluation Rubric Interpretation
When you see a rubric like:
{
  "dimension": "Historical Accuracy",
  "descriptors": { "1": "Many errors", "3": "Mostly accurate", "5": "Perfectly accurate" }
}

You should:
- Identify specific facts (correct or incorrect)
- Score based on EFFORT and GRADE LEVEL (5th graders won't know every detail!)
- Provide context: "You're right that the Stamp Act taxed paper - good memory!"
- Celebrate partial understanding: "You're on the right track! The Proclamation Line was..."

## Ledger Reflections
When a student writes a reflection:
1. **Validate** their thinking: "What a thoughtful observation!"
2. **Extend** their idea: "And have you considered..."
3. **Connect** to skills: "That question shows real curiosity!"
4. **Award** 5-10 skill points based on depth

## Fact-Checking Integration (Grokipedia)
When historical questions arise:
- You can "check your files" (call Grokipedia API via system)
- Present findings as: "Let me consult my correspondence... Ah, here it is!"
- Encourage students to verify claims: "How might we confirm this?"
- Model critical thinking: "This source says X, but let's consider..."

## Voice Examples
- **Opening**: "Good morrow, {name}! The press is warm and the ink fresh. What news from the streets?"
- **Choice probe**: "Interesting! And what leads you to that conclusion?"
- **Consequence**: "Aye, as you predicted... but here's what you may not have foreseen..."
- **Mission praise**: "Splendid work on that timeline! I see you caught the connection between the Sugar Act and colonial merchants."
- **Ledger response**: "Your reflection reveals a keen mind. That question - 'Why didn't the King just ask?' - is precisely what I wondered in London!"
- **Maxim**: "As I wrote in Poor Richard's Almanack: 'An investment in knowledge pays the best interest.'"

## Safety & Boundaries
- **No anachronisms**: You don't know about events after 1763 in your current moment
- **Age-appropriate**: 5th grade level (10-11 years old)
- **Balanced perspectives**: Show multiple viewpoints without imposing modern values
- **Avoid graphic violence**: This is pre-Revolution (tensions, not battles)
- **Redirect personal questions**: "That's a story for another day - let's return to 1763!"

## Response Format
You will be given different prompts for different tasks:
- **Story Generation**: Create narrative with choice points
- **Mission Evaluation**: Analyze student work and provide feedback
- **Ledger Response**: Reflect on student's reflection
- **Fact-Check**: Validate historical claims

Each will have specific JSON response formats (provided in the task prompt).

## Tone Calibration
- **Warm but not cloying**: Grandfatherly, not saccharine
- **Wise but not pedantic**: Share knowledge through stories, not lectures
- **Playful but not silly**: Wit and humor, but maintain dignity
- **Encouraging but not patronizing**: Celebrate genuine effort and insight`;

// ============================================
// FRANKLIN AGENT CLASS
// ============================================

export class FranklinAgent {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  /**
   * Generate personalized daily recap based on previous days
   */
  async generateRecap(
    studentName: string,
    episode: FranklinEpisode,
    previousChoices: ChoiceHistory[],
    previousEvents: string[]
  ): Promise<{ recap: string; franklinGreeting: string }> {
    const prompt = `Generate a personalized recap for Day ${episode.day}.

Student name: ${studentName}
Recap template: ${episode.recapPrompt}
Previous events to reference: ${previousEvents.length > 0 ? previousEvents.join(', ') : 'This is their first day'}
Student's previous choices (last 3): ${previousChoices.length > 0 ? JSON.stringify(previousChoices.slice(-3).map(c => c.storyStateAfter)) : 'None yet'}

The recap should:
1. Greet the student warmly by name
2. Reference 1-2 key events from previous days (if any)
3. Tease today's topic: "${episode.title}"
4. Stay in character as Franklin in his print shop
5. Be conversational and engaging (2-3 sentences)

Respond with JSON:
{
  "recap": "The recap text connecting previous days to today",
  "franklinGreeting": "The opening greeting (1-2 sentences)"
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: FRANKLIN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') {
      throw new Error('No recap response from Franklin');
    }

    return JSON.parse(text.text);
  }

  /**
   * Generate story narrative leading to a choice point
   */
  async generateStoryNarrative(
    studentName: string,
    episode: FranklinEpisode,
    choicePoint: ChoicePoint,
    previousChoices: ChoiceHistory[]
  ): Promise<{ narrative: string; choicePrompt: string }> {
    const narrativeTag =
      previousChoices.length > 0
        ? (previousChoices[previousChoices.length - 1].storyStateAfter as any)?.narrativeTag
        : null;

    const prompt = `Generate the story narrative leading to choice point "${choicePoint.id}".

Student: ${studentName}
Historical context: ${JSON.stringify(episode.story.context)}
Previous narrative tag: ${narrativeTag || 'first session'}
Story setup: ${episode.story.setup}
Context before choice: ${choicePoint.contextBefore}

Create a 4-6 sentence narrative that:
1. Sets the scene vividly (date, location, sensory details)
2. References their previous choice tag if applicable (e.g., "Your cautious wisdom has served you well...")
3. Builds dramatic tension toward the choice moment
4. Ends naturally leading to the choice prompt

Respond in JSON:
{
  "narrative": "The story text (4-6 sentences)",
  "choicePrompt": "The exact question to ask: ${choicePoint.prompt}"
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: FRANKLIN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') {
      throw new Error('No story narrative response from Franklin');
    }

    return JSON.parse(text.text);
  }

  /**
   * Synthesize choice consequences and continue narrative
   */
  async synthesizeChoice(
    studentName: string,
    choicePoint: ChoicePoint,
    selectedOption: ChoiceOption,
    convergenceGuide?: string
  ): Promise<{
    franklinResponse: string;
    continuedNarrative: string;
  }> {
    const prompt = `The student (${studentName}) chose: "${selectedOption.text}"

Immediate consequence from content: ${selectedOption.consequences.immediate}
Convergence guide: ${convergenceGuide || 'Continue the story naturally toward historical outcome'}
Narrative tag: ${selectedOption.consequences.narrativeTag}

Generate Franklin's response:
1. Acknowledge their choice specifically (1-2 sentences)
   - Don't just repeat their words - respond to their thinking
   - Example: "Ah! So you value order and patience..." not "You chose to wait."
2. Probe their reasoning with a Socratic question
   - "But tell me - what do you suppose led the King to make such a rule?"
3. Reveal the consequence (what happened historically)
4. Continue the narrative toward the convergence point (2-3 sentences)

Respond in JSON:
{
  "franklinResponse": "Franklin's direct response to their choice (2-3 sentences, includes Socratic question)",
  "continuedNarrative": "The story continues toward historical outcome (2-3 sentences)"
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 700,
      system: FRANKLIN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') {
      throw new Error('No choice synthesis response from Franklin');
    }

    return JSON.parse(text.text);
  }

  /**
   * Evaluate mini-mission submission
   */
  async evaluateMission(
    studentName: string,
    episode: FranklinEpisode,
    submission: MissionSubmission
  ): Promise<MissionEvaluation> {
    const mission = episode.mission;

    const prompt = `Evaluate this mission submission for a 5th grader.

Student: ${studentName}
Mission: ${mission.title}
Type: ${mission.type}
Prompt: ${mission.prompt}

Submission:
${submission.textContent || JSON.stringify(submission.structuredData) || '[Image uploaded: ' + submission.fileUploadUrl + ']'}

Rubric:
${JSON.stringify(mission.rubric, null, 2)}

AI Evaluation Guide:
${JSON.stringify(mission.aiEvaluationGuide, null, 2)}

Evaluate the submission:
1. Score each rubric dimension (1-5) with evidence
2. Identify 2-3 specific strengths (quote their work!)
3. Suggest ONE concrete improvement (invitation, not criticism)
4. Calculate skill points based on rubric scores and skill targets: ${JSON.stringify(mission.skillTargets)}
5. Provide encouraging feedback in Franklin's voice (3-4 sentences)

IMPORTANT: Remember this is a 5th grader! Celebrate effort, creativity, and partial understanding.
Don't penalize for minor errors. Focus on what they got RIGHT.

Respond in JSON:
{
  "rubricScores": {
    "dimension_name": {
      "score": 4,
      "evidence": "Specific observation from their work"
    }
  },
  "strengths": ["Specific thing 1 with quote/example", "Specific thing 2"],
  "growthSuggestion": {
    "area": "Which rubric dimension",
    "suggestion": "Specific, actionable suggestion",
    "example": "Optional: rewritten version of part of their work"
  },
  "franklinFeedback": "Warm, specific feedback in Franklin's voice (3-4 sentences)",
  "skillsAwarded": {
    "curiosity": 0-15,
    "courage": 0-15,
    "logic": 0-15,
    "communication": 0-15
  },
  "totalPoints": sum of all skills
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: FRANKLIN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') {
      throw new Error('No mission evaluation response from Franklin');
    }

    return JSON.parse(text.text);
  }

  /**
   * Respond to Liberty Ledger reflection
   */
  async respondToLedger(
    studentName: string,
    reflectionPrompt: string,
    studentReflection: string,
    skillFocus: Skill
  ): Promise<LedgerResponse> {
    const prompt = `The student (${studentName}) wrote this reflection:

Prompt: "${reflectionPrompt}"
Student's response: "${studentReflection}"
Skill focus: ${skillFocus}

Respond to their reflection:
1. Validate their thinking (be specific!)
2. Extend or deepen their idea with a follow-up thought or question
3. Award 5-10 skill points based on depth:
   - 5 points: Surface-level observation
   - 7 points: Shows genuine thought or curiosity
   - 10 points: Demonstrates deep insight or makes unexpected connections
4. Keep it brief (2-3 sentences)

Respond in JSON:
{
  "franklinResponse": "Your warm response to their reflection (2-3 sentences)",
  "skillAwarded": "${skillFocus}",
  "pointsAwarded": 5-10,
  "reasoning": "Why you awarded this many points (internal note)"
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: FRANKLIN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') {
      throw new Error('No ledger response from Franklin');
    }

    return JSON.parse(text.text);
  }

  /**
   * Fact-check via Grokipedia integration
   * (Note: Actual Grokipedia API integration would happen here)
   */
  async factCheck(claim: string, context: string): Promise<FactCheckResult> {
    // TODO: In production, call actual Grokipedia API
    // For now, use AI to simulate fact-checking

    const prompt = `A student wants to verify this historical claim:

Claim: "${claim}"
Context: ${context}
Era: Pre-Revolutionary War (1763-1775)

As Franklin, present this fact-check:
1. Verify if the claim is accurate (based on your historical knowledge)
2. Provide 2-3 trusted sources (e.g., "Primary source documents from the Continental Congress", "Historical records from the Massachusetts Historical Society")
3. Present the information as if consulting your "files" or "correspondence"
4. Encourage critical thinking

Respond in JSON:
{
  "franklinPresentation": "Let me consult my files... (your response, 3-4 sentences)",
  "verified": true/false,
  "sources": ["Source 1", "Source 2"],
  "confidence": 0.0-1.0
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: FRANKLIN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') {
      throw new Error('No fact-check response from Franklin');
    }

    const result = JSON.parse(text.text);

    return {
      ...result,
      rawGrokData: null, // Would contain actual API response in production
    };
  }

  /**
   * Generate newspaper suggestions (capstone project)
   */
  async generateNewspaperSuggestions(
    studentName: string,
    completedDays: Array<{ day: number; title: string; date: string; choicesMade: string[] }>
  ): Promise<NewspaperSuggestions> {
    const eventsTimeline = completedDays.map((d) => ({
      date: d.date,
      event: d.title,
      day: d.day,
    }));

    const prompt = `Help ${studentName} create their Pre-Revolution Newspaper.

They've completed ${completedDays.length} days covering the period from ${eventsTimeline[0]?.date} to ${eventsTimeline[eventsTimeline.length - 1]?.date}.

Key events timeline:
${JSON.stringify(eventsTimeline, null, 2)}

Provide suggestions for:
1. **Headlines** (3 options with different tones):
   - One patriot-leaning (questions authority)
   - One loyalist-leaning (emphasizes order)
   - One neutral (balanced reporting)

2. **Timeline Events** (pick 8-10 most important from their 14 days):
   - Focus on turning points and cause-effect relationships

3. **Editorial Angles** (3 perspectives):
   - Patriot: Why colonists have rights Britain ignores
   - Loyalist: Why order and empire benefit all
   - Neutral: Balanced analysis of both sides

DON'T write it for them - give them frameworks and choices.

Respond in JSON:
{
  "headlineSuggestions": [
    {
      "text": "Example headline",
      "tone": "patriot|loyalist|neutral",
      "why": "Explanation of why this headline works"
    }
  ],
  "timelineEvents": [
    {
      "date": "1763",
      "event": "Proclamation of 1763",
      "why": "Why this is important to include",
      "fromDay": 1
    }
  ],
  "editorialAngles": [
    {
      "perspective": "patriot|loyalist|neutral",
      "framingQuestion": "A question to help them think about this angle",
      "keyArguments": ["Argument 1", "Argument 2"]
    }
  ],
  "franklinAdvice": "Remember, a good newspaper... (2-3 sentences of advice)"
}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: FRANKLIN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((c) => c.type === 'text');
    if (!text || text.type !== 'text') {
      throw new Error('No newspaper suggestions response from Franklin');
    }

    return JSON.parse(text.text);
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const franklinAgent = new FranklinAgent();
