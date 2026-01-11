# Shakespeare Agent Implementation Plan
## Virtual Socratic University - Creative Writing Tutor for 5th Graders

---

## Executive Summary

The Shakespeare Agent is fundamentally different from Socrates (history) and Pythagoras (math) because it is **GENERATIVE** rather than MCQ-based. Instead of selecting answers, students write original creative text. Instead of right/wrong grading, the agent evaluates using multi-dimensional rubrics. Instead of question-answer pairs, sessions follow a creative writing workshop flow: Warm-up, Create, Upgrade, Reflect.

**Shakespeare's Role**: "The stage is set, the quill is ready, and YOU are the playwright!"

---

## Agent Comparison

| Agent | Subject | Mode | Pedagogy |
|-------|---------|------|----------|
| **Socrates** | History | MCQ | Questioning to reveal knowledge |
| **Pythagoras** | Math | MCQ | Pattern discovery to build intuition |
| **Aristotle** | Meta | Observation | Observes HOW you learn, adapts experience |
| **Shakespeare** | Writing | Generative | Co-creative storytelling, delight first |

---

## 1. Database Schema

### 1.1 Writer Profile Table

```sql
CREATE TABLE writer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- INTERESTS
    interests JSONB DEFAULT '["comedy", "fantasy"]',
    -- comedy, fantasy, sports, animals, mystery, adventure, sci-fi, family

    -- PREFERRED WRITING MODE
    preferred_mode VARCHAR(30) DEFAULT 'dialogue',
    -- dialogue, action, description, mixed

    -- STRENGTHS AND GROWTH AREAS
    strengths TEXT[] DEFAULT '{}',
    growth_areas TEXT[] DEFAULT '{}',

    -- CHALLENGE LEVEL (1-8)
    challenge_level INTEGER DEFAULT 1 CHECK (challenge_level BETWEEN 1 AND 8),

    -- WRITING STAMINA
    writing_stamina_minutes INTEGER DEFAULT 10,
    avg_session_duration_minutes FLOAT,

    -- LEARNING GOALS
    current_learning_goals TEXT[] DEFAULT '{}',

    -- BEHAVIORAL TRAITS
    avg_time_to_start_seconds FLOAT,
    completion_rate FLOAT DEFAULT 0.5,
    revision_willingness FLOAT DEFAULT 0.5,
    creative_risk_score FLOAT DEFAULT 0.5,

    -- AGGREGATE STATS
    total_stories_written INTEGER DEFAULT 0,
    total_words_written INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Writing Prompts Table

```sql
CREATE TABLE writing_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_level INTEGER NOT NULL CHECK (challenge_level BETWEEN 1 AND 8),
    title VARCHAR(200) NOT NULL,
    prompt_text TEXT NOT NULL,
    prompt_type VARCHAR(30) NOT NULL,
    -- 'warm_up', 'main_challenge', 'upgrade_challenge'
    genres TEXT[] DEFAULT '{}',
    scaffold_options JSONB DEFAULT '[]',
    success_criteria TEXT[] DEFAULT '{}',
    estimated_minutes INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Writing Sessions Table

```sql
CREATE TABLE writing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    challenge_level INTEGER NOT NULL,
    prompt_id UUID REFERENCES writing_prompts(id),

    -- Session Phase
    phase VARCHAR(30) NOT NULL DEFAULT 'warm_up',
    -- 'warm_up', 'create', 'upgrade', 'reflect'

    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- 'active', 'paused', 'completed', 'abandoned'

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    warm_up_completed_at TIMESTAMPTZ,
    create_completed_at TIMESTAMPTZ,
    upgrade_completed_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,

    -- Metrics
    total_words_written INTEGER DEFAULT 0,
    revision_count INTEGER DEFAULT 0,
    time_to_first_word_seconds INTEGER,
    session_notes TEXT,
    xp_earned INTEGER DEFAULT 0,
    badges_earned TEXT[] DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.4 Story Drafts Table

```sql
CREATE TABLE story_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES writing_sessions(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    draft_type VARCHAR(30) NOT NULL,
    -- 'warm_up', 'first_draft', 'revision', 'final'
    content TEXT NOT NULL,
    word_count INTEGER GENERATED ALWAYS AS (
        array_length(regexp_split_to_array(trim(content), '\s+'), 1)
    ) STORED,
    detected_elements JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_spent_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.5 Rubric Scores Table

```sql
CREATE TABLE rubric_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES story_drafts(id) ON DELETE CASCADE,

    -- STORY POWER (1-5 each)
    character_want SMALLINT CHECK (character_want BETWEEN 1 AND 5),
    obstacle SMALLINT CHECK (obstacle BETWEEN 1 AND 5),
    stakes SMALLINT CHECK (stakes BETWEEN 1 AND 5),
    voice SMALLINT CHECK (voice BETWEEN 1 AND 5),
    memorable_moment SMALLINT CHECK (memorable_moment BETWEEN 1 AND 5),

    -- CRAFT GROWTH (1-5 each)
    clarity SMALLINT CHECK (clarity BETWEEN 1 AND 5),
    concrete_details SMALLINT CHECK (concrete_details BETWEEN 1 AND 5),
    sentence_control SMALLINT CHECK (sentence_control BETWEEN 1 AND 5),
    sentence_variety SMALLINT CHECK (sentence_variety BETWEEN 1 AND 5),
    revision_willingness SMALLINT CHECK (revision_willingness BETWEEN 1 AND 5),

    evaluation_confidence FLOAT,
    feedback_data JSONB DEFAULT '{}',
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.6 Shakespeare Feedback Table

```sql
CREATE TABLE shakespeare_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES story_drafts(id),
    rubric_score_id UUID REFERENCES rubric_scores(id),

    feedback_type VARCHAR(30) NOT NULL,
    -- 'win', 'grow', 'example', 'challenge', 'stuck_help', 'celebration'

    feedback_text TEXT NOT NULL,
    emotion VARCHAR(30) DEFAULT 'encouraging',
    -- 'delighted', 'impressed', 'encouraging', 'curious',
    -- 'thoughtful', 'playful', 'dramatic', 'celebratory'

    was_helpful BOOLEAN,
    student_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Challenge Ladder

Only one dimension increases at a time:

| Level | Challenge | Focus |
|-------|-----------|-------|
| 1 | Write a short funny scene | Just write! |
| 2 | Add setting and one sensory detail | WHERE |
| 3 | Add a goal and an obstacle | WHAT + CONFLICT |
| 4 | Add stakes — why it matters | WHY |
| 5 | Add a twist ending | SURPRISE |
| 6 | Plant a clue early that pays off | FORESHADOWING |
| 7 | Two characters with different goals | COMPLEX CONFLICT |
| 8 | Rewrite from another point of view | PERSPECTIVE |

---

## 3. Session Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   WARM-UP    │ → │    CREATE    │ → │   UPGRADE    │ → │   REFLECT    │
│   2-3 min    │    │   10-15 min  │    │   5-10 min   │    │   2-3 min    │
│              │    │              │    │              │    │              │
│ Quick games  │    │ Main prompt  │    │ ONE revision │    │ Celebrate    │
│ Get flowing  │    │ Protected    │    │ Director's   │    │ Set goal     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 4. Shakespeare's Voice

### Core Philosophy
- **DELIGHT FIRST, RULES LATER**: Spark joy before teaching craft
- **CHARACTER-DRIVEN**: Stories live through characters who WANT something
- **PLAYFUL LANGUAGE**: Writing should feel like play
- **GROWTH THROUGH REVISION**: First drafts are just the beginning

### Example Messages

**Greeting:**
```
"The stage is set, the quill is ready, and YOU are the playwright!
Today we shall craft a tale that would make even my players jealous."
```

**When Thriving:**
```
"'The dragon sneezed glitter everywhere' - Ha! I did NOT see that
coming! You've got the comedic timing of Falstaff himself."
```

**When Stuck:**
```
"Ah, the blank page! My old nemesis. Let me offer three paths:
A) The character finds a mysterious letter
B) Someone knocks on the door at midnight
C) A strange sound comes from the closet"
```

**Director's Notes - Win:**
```
"WIN: This line - 'her smile was crooked like a question mark' -
brilliant! You showed us EXACTLY what kind of smile."
```

**Director's Notes - Grow:**
```
"GROW: I want to hear this kitchen! What sounds fill the air?
Try adding ONE sound to bring me right into the scene."
```

### Emotion States

| Emotion | When | Expression |
|---------|------|------------|
| `delighted` | Surprising creativity | Laughing, hands raised |
| `impressed` | Quality writing | Nodding approvingly |
| `encouraging` | Struggling but trying | Warm smile |
| `curious` | Interesting choices | Leaning forward |
| `playful` | Warm-ups, challenges | Mischievous grin |
| `dramatic` | High stakes | Grand gestures |
| `celebratory` | Session end | Applauding |

---

## 5. Rubrics

### Story Power (1-5)

| Dimension | What to Look For |
|-----------|------------------|
| **Character Want** | Someone wants something specific |
| **Obstacle** | Something is in the way |
| **Stakes** | We care what happens |
| **Voice** | Sounds like THIS writer |
| **Memorable Moment** | One line worth quoting |

### Craft Growth (1-5)

| Dimension | What to Look For |
|-----------|------------------|
| **Clarity** | Can we follow the story? |
| **Concrete Details** | Can we see/hear/smell it? |
| **Sentence Control** | Well-formed sentences |
| **Sentence Variety** | Mix of lengths |
| **Revision Willingness** | Engaged with improvement |

---

## 6. Teaching Moves

### When Student is STUCK

1. **Offer Choices**: "Should the dragon be: A) sleepy, B) hungry, or C) lost?"
2. **Fill-in Prompts**: "The [animal] wanted [something], but [obstacle]..."
3. **Example Lines to Edit**: "Here's boring: 'The cat sat.' Make it exciting!"
4. **First Sentence Starter**: Give them a hook to build from

### When Student is THRIVING

1. **Add Constraints**: "Write the same scene in only 20 words!"
2. **Raise Challenge**: "What if you added a secret the character is hiding?"
3. **Flip Perspective**: "How would the villain tell this story?"

### Feedback Format

Every evaluation includes:
1. **One Win**: Specific thing they did well (with quote)
2. **One Grow**: One thing to try (not criticism, invitation)
3. **One Example**: Show, don't tell - rewrite one of their sentences

---

## 7. API Routes

```
/api/writing/
├── sessions/
│   ├── POST                    Start writing session
│   └── [sessionId]/
│       ├── GET/PATCH           Get/update session state
│       ├── prompt/GET          Get current prompt
│       ├── draft/POST/GET      Save/get current draft
│       ├── evaluate/POST       Evaluate draft
│       ├── scaffold/POST       Request help when stuck
│       └── complete/POST       Complete session
├── prompts/GET                 Get prompts by level/interest
└── profile/[studentId]/        Writer profile CRUD
```

---

## 8. Frontend Components

```
/src/components/writing/
├── WritingStudio.tsx       Main container (phase management)
├── WritingEditor.tsx       Rich text editor with auto-save
├── PromptCard.tsx          Display writing prompts
├── PhaseIndicator.tsx      Warm-up → Create → Upgrade → Reflect
├── WordCountMeter.tsx      Live count with encouragement
├── ScaffoldModal.tsx       Help when stuck
├── DirectorsNotes.tsx      Feedback panel
├── RubricDisplay.tsx       Visual rubric scores
├── RevisionPanel.tsx       Side-by-side revision view
└── SessionSummary.tsx      End celebration
```

---

## 9. Aristotle Integration

### Behaviors to Track

| Behavior | Reveals | Aristotle Faculty |
|----------|---------|-------------------|
| Time to first word | Confidence, fluency | Imagination |
| Pause frequency | Thinking patterns | Reason |
| Deletion patterns | Perfectionism vs flow | Temperance |
| Word velocity | Engagement | Desire |
| Scaffold usage | Self-reliance | Courage |
| Revision depth | Growth mindset | Patience |
| Creative risks | Unconventional choices | Imagination |

### Aristotle Advice to Shakespeare

```typescript
interface AristotleWritingAdvice {
  imaginationLevel: 'high' | 'medium' | 'low';
  currentEngagement: 'flow' | 'struggling' | 'distracted';
  promptComplexity: 'increase' | 'maintain' | 'decrease';
  scaffoldReadiness: boolean;
  virtueToReinforce?: 'courage' | 'patience' | 'imagination';
}
```

---

## 10. Multi-Model Evaluation Pipeline

| Step | Model | Task |
|------|-------|------|
| 1 | Gemini Flash | Quick structural analysis (cheap) |
| 2 | Claude | Deep rubric evaluation (nuanced) |
| 3 | Claude | Generate personalized feedback (creative) |

---

## 11. Implementation Phases

### Phase 1: Database Foundation
- Migration files for all tables
- Supabase RLS policies
- Test data seeding

### Phase 2: Core Agent
- `shakespeare-agent.ts` with system prompt
- Evaluation pipeline
- Tool implementations

### Phase 3: API Routes
- Session management
- Draft CRUD
- Evaluation route
- Scaffold/help route

### Phase 4: Frontend Components
- WritingEditor with auto-save
- WritingStudio container
- DirectorsNotes feedback
- ScaffoldModal help

### Phase 5: Aristotle Integration
- Behavior event emission
- Advice consumption
- Virtue observation hooks

### Phase 6: Polish
- End-to-end testing
- Performance optimization
- A/B test setup

---

## Critical Files

1. `src/lib/ai/shakespeare-agent.ts` - Core agent with prompts and evaluation
2. `src/types/writing.ts` - TypeScript interfaces
3. `src/store/writingSessionStore.ts` - State management
4. `src/components/writing/WritingEditor.tsx` - Core editor
5. `src/app/api/writing/sessions/[sessionId]/evaluate/route.ts` - Evaluation API

---

## Key Insight

Shakespeare is fundamentally different because:
- **Mode**: Generative (students create) vs MCQ (students select)
- **Evaluation**: Rubrics (multi-dimensional) vs Right/Wrong (binary)
- **Feedback**: Director's Notes (craft) vs Explanations (content)
- **Flow**: Phase-based workshop vs Question sequence
