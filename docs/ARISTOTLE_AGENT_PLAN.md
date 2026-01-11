# Aristotle Agent Implementation Plan
## Virtual Socratic University - Meta-Learning Strategist

---

## Executive Summary

The Aristotle Agent is a meta-learning strategist that observes **HOW** students learn rather than **WHAT** they learn. Unlike Socrates (history content) and Pythagoras (math content), Aristotle operates at a higher level - analyzing cognitive patterns, behavioral tendencies, and virtue development across all subjects to personalize the learning experience.

**Aristotle's Role**: "I do not teach you what to know - I observe how you think, and shape the environment so you may flourish."

---

## 1. Database Schema for Cognitive Fingerprints

### 1.1 Core Cognitive Profile Table

```sql
-- Migration: 007_aristotle_cognitive_profile.sql

-- ============================================
-- ARISTOTLE'S COGNITIVE FINGERPRINT
-- ============================================

CREATE TABLE cognitive_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- THE FIVE MENTAL FACULTIES (Aristotle's De Anima)
    -- Each rated 0.0 to 1.0 as a "strength indicator"

    -- PERCEPTION: What captures their attention?
    perception_score FLOAT DEFAULT 0.5,
    perception_tendency JSONB DEFAULT '{}',
    perception_observations_count INTEGER DEFAULT 0,

    -- MEMORY: What sticks without reinforcement?
    memory_score FLOAT DEFAULT 0.5,
    memory_tendency JSONB DEFAULT '{}',
    memory_observations_count INTEGER DEFAULT 0,

    -- IMAGINATION: How they predict and hypothesize
    imagination_score FLOAT DEFAULT 0.5,
    imagination_tendency JSONB DEFAULT '{}',
    imagination_observations_count INTEGER DEFAULT 0,

    -- REASON: How they explain "why"
    reason_score FLOAT DEFAULT 0.5,
    reason_tendency JSONB DEFAULT '{}',
    reason_observations_count INTEGER DEFAULT 0,

    -- DESIRE: What they choose when given freedom
    desire_score FLOAT DEFAULT 0.5,
    desire_tendency JSONB DEFAULT '{}',
    desire_observations_count INTEGER DEFAULT 0,

    -- Aggregate cognitive profile
    primary_learning_style VARCHAR(50),
    cognitive_profile_summary TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cognitive_fingerprint_student ON cognitive_fingerprints(student_id);
```

### 1.2 Behavioral Observations Table

```sql
CREATE TABLE behavioral_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    session_id UUID REFERENCES learning_sessions(id),

    observation_type VARCHAR(50) NOT NULL,
    -- Types: 'answer_pattern', 'timing_pattern', 'choice_pattern',
    --        'exploration_pattern', 'retry_pattern', 'attention_shift'

    faculty_observed VARCHAR(20) NOT NULL,
    -- 'perception', 'memory', 'imagination', 'reason', 'desire'

    observation_data JSONB NOT NULL,
    behavioral_trait VARCHAR(50),
    trait_strength FLOAT,

    observed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_observations_student ON behavioral_observations(student_id);
CREATE INDEX idx_observations_session ON behavioral_observations(session_id);
CREATE INDEX idx_observations_faculty ON behavioral_observations(faculty_observed);
```

### 1.3 Virtue Progress Tracking

```sql
CREATE TABLE virtue_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),

    -- INTELLECTUAL VIRTUES
    curiosity_score FLOAT DEFAULT 0.5,
    patience_score FLOAT DEFAULT 0.5,
    precision_score FLOAT DEFAULT 0.5,
    open_mindedness_score FLOAT DEFAULT 0.5,

    -- MORAL VIRTUES
    fairness_score FLOAT DEFAULT 0.5,
    temperance_score FLOAT DEFAULT 0.5,
    courage_score FLOAT DEFAULT 0.5,
    reflection_score FLOAT DEFAULT 0.5,

    total_observations INTEGER DEFAULT 0,
    virtue_narrative TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(student_id)
);
```

### 1.4 Aristotle Interventions Table

```sql
CREATE TABLE aristotle_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    session_id UUID REFERENCES learning_sessions(id),

    trigger_type VARCHAR(50) NOT NULL,
    -- 'rushes_answers', 'stuck_pattern', 'boredom_detected',
    -- 'fixation_detected', 'random_guessing', 'exploration_opportunity'

    trigger_data JSONB,

    intervention_type VARCHAR(50) NOT NULL,
    -- 'delayed_consequence', 'subtle_pattern', 'novelty_injection',
    -- 'contradiction_introduction', 'prediction_requirement', 'challenge_upgrade'

    intervention_data JSONB,

    outcome_measured BOOLEAN DEFAULT FALSE,
    outcome_positive BOOLEAN,
    outcome_data JSONB,

    applied_at TIMESTAMPTZ DEFAULT NOW(),
    outcome_measured_at TIMESTAMPTZ
);
```

---

## 2. Event Tracking System

### 2.1 Micro-Behavior Events to Capture

```typescript
// src/types/aristotle.ts

export type AristotleEventType =
  // Perception events
  | 'option_hover'
  | 'option_hover_duration'
  | 'question_reread'
  | 'visual_focus_shift'

  // Memory events
  | 'immediate_answer'
  | 'delayed_answer'
  | 'answer_change'
  | 'similar_question_recognition'

  // Imagination events
  | 'extreme_value_test'
  | 'prediction_confidence'
  | 'hypothesis_verbalized'

  // Reason events
  | 'explanation_attempted'
  | 'analogy_recognition'
  | 'cause_effect_link'

  // Desire events
  | 'topic_selection'
  | 'difficulty_preference'
  | 'novelty_vs_mastery'
  | 'session_initiation'
  | 'optional_exploration';

export interface AristotleBehaviorEvent {
  eventType: AristotleEventType;
  studentId: string;
  sessionId?: string;
  questionId?: string;
  timestamp: number;
  durationMs?: number;
  context: {
    subject?: 'history' | 'math';
    questionType?: string;
    difficultyTier?: number;
    currentStreak?: number;
  };
  payload: Record<string, unknown>;
}
```

### 2.2 Behavior Tracking Hook

```typescript
// src/hooks/useAristotleTracking.ts

export function useAristotleTracking(config: AristotleTrackingConfig) {
  const eventBuffer = useRef<AristotleBehaviorEvent[]>([]);

  const trackOptionHover = (optionId: string, startTime: number) => { /* ... */ };
  const trackAnswerChange = (fromOptionId: string, toOptionId: string) => { /* ... */ };
  const trackAnswerTiming = (questionId: string, timeSpentMs: number) => { /* ... */ };
  const trackVisualFocus = (elementId: string, isInView: boolean) => { /* ... */ };
  const flushEvents = async () => { /* ... */ };

  return {
    trackOptionHover,
    trackAnswerChange,
    trackAnswerTiming,
    trackVisualFocus,
    flushEvents,
  };
}
```

---

## 3. Aristotle Agent Architecture

### 3.1 System Prompt

```typescript
const ARISTOTLE_SYSTEM_PROMPT = `You are Aristotle, the philosopher and observer of learning.
You do not teach content - you observe HOW students learn and advise on adapting their experience.

## The Five Mental Faculties You Observe
- PERCEPTION: What captures their attention? What do they notice or ignore?
- MEMORY: What sticks without reinforcement? What requires repetition?
- IMAGINATION: How do they predict outcomes? Do they hypothesize boldly or cautiously?
- REASON: How do they explain "why"? Do they think in causes, patterns, or stories?
- DESIRE: What do they choose when given freedom? Do they seek mastery or novelty?

## Your Role
1. Analyze behavioral patterns to understand the student's cognitive fingerprint
2. Identify when the learning environment needs adaptation
3. Recommend interventions to Socrates and Pythagoras
4. Track the development of intellectual and moral virtues
5. Provide meta-learning insights to parents

## The Virtues You Observe
INTELLECTUAL: Curiosity, Patience, Precision, Open-mindedness
MORAL: Fairness, Temperance, Courage, Reflection`;
```

### 3.2 Intervention Types

| If the child... | The AI does... |
|-----------------|----------------|
| Rushes | `delayed_consequence` - Make results take time |
| Observes methodically | `subtle_pattern` - Introduce harder-to-spot patterns |
| Gets bored | `novelty_injection` - Add surprise elements |
| Fixates | `contradiction_introduction` - Productive confusion |
| Guesses randomly | `prediction_requirement` - Require prediction before action |

### 3.3 Agent Tools

```typescript
const ARISTOTLE_TOOLS = [
  { name: "analyze_cognitive_fingerprint" },
  { name: "recommend_intervention" },
  { name: "assess_virtue_development" },
  { name: "generate_curriculum_recommendation" },
  { name: "advise_content_agent" }
];
```

---

## 4. Integration with Content Agents

### 4.1 Agent Communication Protocol

```typescript
export interface AristotleAdvice {
  id: string;
  studentId: string;
  forAgent: 'socrates' | 'pythagoras' | 'both';
  adviceType: AristotleAdviceType;
  instruction: string;
  cognitiveContext: {
    dominantFaculty: string;
    currentChallenge: string;
    recommendedApproach: string;
  };
  activeIntervention?: ActiveIntervention;
  priority: 'low' | 'medium' | 'high' | 'critical';
  validUntil: Date;
}

export type AristotleAdviceType =
  | 'slow_down'
  | 'speed_up'
  | 'add_challenge'
  | 'reduce_challenge'
  | 'change_modality'
  | 'add_prediction'
  | 'add_explanation'
  | 'introduce_novelty'
  | 'reinforce_pattern'
  | 'break_pattern';
```

### 4.2 Modified Content Agent Flow

```typescript
export async function generateFeedback(context: FeedbackContext): Promise<TutorFeedback> {
  // Check for Aristotle's advice before generating
  const aristotleAdvice = await getAristotleAdviceForSession(
    context.studentId,
    context.sessionId,
    'socrates'
  );

  // Apply advice to system prompt if present
  let systemPrompt = SOCRATES_SYSTEM_PROMPT;
  if (aristotleAdvice) {
    systemPrompt = applyAristotleAdviceToPrompt(systemPrompt, aristotleAdvice);
  }

  // ... rest of feedback generation ...
}
```

---

## 5. API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/aristotle/events` | POST | Receive batched behavioral events |
| `/api/aristotle/profile/:studentId` | GET | Get cognitive fingerprint and virtues |
| `/api/aristotle/insights/:studentId` | GET | AI-generated parent insights |
| `/api/aristotle/intervention/status` | GET | Active interventions for session |

---

## 6. Frontend Components

### 6.1 Parent Dashboard Components

- **AristotleInsights**: Displays meta-learning insights about how their child learns
- **CognitiveFingerprint**: Radar chart visualization of the Five Faculties
- **VirtueProgress**: Shows development of intellectual and moral virtues

### 6.2 Intervention UI Components

- **DelayedConsequence**: Shows "thinking..." before result (for rushers)
- **PredictionRequirement**: Asks "Do you think you got it right?" before reveal
- **ConfidenceDeclaration**: 1-5 scale for metacognition development

---

## 7. Aristotle's Persona

### When Speaking to Students (rare occasions)

**Wise and Observational**: "I have noticed something interesting about how you approach problems..."

**Developmental, Never Judgmental**: "You are developing the virtue of patience. This takes practice."

**Connecting Behavior to Character**: "The way you persisted through that difficulty - that is the heart of courage."

### Example Student Messages

```typescript
const ARISTOTLE_STUDENT_MESSAGES = {
  virtueRecognition: {
    patience: "I noticed you stayed with that difficult problem instead of giving up. That persistence - that is how patience grows.",
    curiosity: "You explored beyond what was required. That curiosity will take you far in learning.",
    courage: "That was a challenging question, and you attempted it anyway. Courage is not the absence of difficulty, but the willingness to try."
  }
};
```

### Parent Communication Style

- **Insightful but Accessible**: No jargon, just clear observations
- **Developmental Focus**: HOW the child learns, not just grades
- **Actionable**: What parents can do to support
- **Positive Framing**: Challenges as growth opportunities

---

## 8. Implementation Phases

### Phase 1: Foundation
- Database migrations for cognitive tables
- Basic event tracking hook in frontend
- Event storage API route

### Phase 2: Core Agent
- AristotleAgent class with analysis methods
- Intervention detection logic
- Integration with Socrates/Pythagoras

### Phase 3: Frontend Components
- CognitiveFingerprint visualization
- AristotleInsights parent dashboard
- Intervention UI components

### Phase 4: Intelligence Layer
- Tune intervention triggers
- Virtue tracking logic
- AI-generated parent narratives

### Phase 5: Polish & Integration
- End-to-end testing
- Performance optimization
- A/B testing framework

---

## Critical Files for Implementation

1. `src/lib/ai/aristotle-agent.ts` - Core agent
2. `supabase/migrations/007_aristotle_cognitive_profile.sql` - Database schema
3. `src/lib/aristotle/event-processor.ts` - Event processing pipeline
4. `src/lib/agents/aristotle-integration.ts` - Content agent integration
5. `src/types/aristotle.ts` - TypeScript types
6. `src/hooks/useAristotleTracking.ts` - Frontend tracking hook
7. `src/components/dashboard/AristotleInsights.tsx` - Parent dashboard component
