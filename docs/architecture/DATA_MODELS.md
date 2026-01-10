# Virtual Socratic University - Data Models

## Overview

This document defines all database schemas, relationships, and data structures used throughout the system.

---

## Database Schema (PostgreSQL)

### 1. Content Domain

#### `topics`
The subject matter taxonomy.

```sql
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,           -- e.g., "The Age of Exploration"
    slug VARCHAR(100) UNIQUE NOT NULL,    -- e.g., "age-of-exploration"
    description TEXT,
    grade_level INTEGER NOT NULL,         -- e.g., 5
    subject VARCHAR(50) NOT NULL,         -- e.g., "US History"
    display_order INTEGER NOT NULL,
    parent_topic_id UUID REFERENCES topics(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample Topics for 5th Grade History:
-- 1. The Age of Exploration (Explorers)
-- 2. Colonial America
-- 3. The American Revolution
-- 4. The Acts (Stamp Act, Tea Act, etc.)
```

#### `questions`
The core content - the "Scrolls" in our Library of Truth.

```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id),

    -- Content
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL,   -- 'knowledge' | 'wisdom'
    difficulty_tier INTEGER NOT NULL CHECK (difficulty_tier BETWEEN 1 AND 4),
    -- Tier 1: Basic recall
    -- Tier 2: Intermediate recall
    -- Tier 3: Hard (single concept application)
    -- Tier 4: Extra Hard (multi-concept synthesis)

    -- Classification Tags
    cognitive_verb VARCHAR(30) NOT NULL,  -- 'identify', 'explain', 'compare', 'analyze'
    question_stem VARCHAR(20) NOT NULL,   -- 'who', 'what', 'when', 'where', 'why', 'how'

    -- Correct Answer
    correct_answer TEXT NOT NULL,
    answer_explanation TEXT NOT NULL,     -- Why this is correct

    -- Metadata
    is_composite BOOLEAN DEFAULT FALSE,   -- True if this is a generated "Both A and B" question
    source_question_ids UUID[],           -- For composites: the original questions used
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_type_tier ON questions(question_type, difficulty_tier);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = TRUE;
```

#### `answer_options`
Multiple choice options for each question.

```sql
CREATE TABLE answer_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,

    option_text TEXT NOT NULL,
    option_label CHAR(1) NOT NULL,        -- 'A', 'B', 'C', 'D'
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,

    -- Distractor Analysis (for wrong answers)
    distractor_type VARCHAR(30),          -- 'common_confusion', 'partial_truth', 'anachronism', 'near_miss'
    confusion_explanation TEXT,            -- Why students might pick this wrong answer
    related_concept TEXT,                 -- What concept they're confusing with

    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_options_question ON answer_options(question_id);
```

#### `mnemonics`
Memory aids for Knowledge-type questions.

```sql
CREATE TABLE mnemonics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id),

    mnemonic_text TEXT NOT NULL,          -- e.g., "Columbus sailed the ocean blue in 1492"
    mnemonic_type VARCHAR(30) NOT NULL,   -- 'rhyme', 'acronym', 'story', 'visual', 'association'

    effectiveness_score FLOAT DEFAULT 0.5, -- Updated based on student retention
    times_shown INTEGER DEFAULT 0,
    times_helped INTEGER DEFAULT 0,        -- When shown and student got it right next time

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `socratic_hints`
Guiding questions for Wisdom-type failures.

```sql
CREATE TABLE socratic_hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id),

    hint_level INTEGER NOT NULL CHECK (hint_level BETWEEN 1 AND 3),
    -- Level 1: Broad nudge ("Think about what the colonists wanted...")
    -- Level 2: More specific ("What was happening with taxes at this time?")
    -- Level 3: Direct scaffold ("The Stamp Act made colonists pay for... what everyday items?")

    hint_text TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hints_question_level ON socratic_hints(question_id, hint_level);
```

---

### 2. User Domain

#### `users`
All system users (students and parents).

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Auth (provided by Supabase/Clerk)
    auth_provider_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,

    -- Profile
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,            -- 'student' | 'parent' | 'admin'
    avatar_choice VARCHAR(50),            -- 'owl', 'colonial_soldier', 'founding_father'

    -- Parent-Child Relationship
    parent_id UUID REFERENCES users(id),  -- NULL for parents, set for students

    -- Settings
    preferences JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_parent ON users(parent_id);
CREATE INDEX idx_users_role ON users(role);
```

#### `student_profiles`
Extended data for student users.

```sql
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),

    -- Skill Ratings (Elo-like system, starting at 1000)
    knowledge_rating INTEGER DEFAULT 1000,
    wisdom_rating INTEGER DEFAULT 1000,
    overall_rating INTEGER DEFAULT 1000,

    -- Progress Tracking
    current_topic_id UUID REFERENCES topics(id),
    topics_completed UUID[] DEFAULT '{}',

    -- Gamification
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    badges_earned VARCHAR(50)[] DEFAULT '{}',

    -- Learning Style (updated by analytics)
    learning_profile VARCHAR(30),         -- 'encyclopedist', 'strategist', 'balanced'

    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. Session Domain

#### `learning_sessions`
A single study session.

```sql
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    topic_id UUID NOT NULL REFERENCES topics(id),

    -- Session State
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    -- Performance
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    knowledge_questions_correct INTEGER DEFAULT 0,
    wisdom_questions_correct INTEGER DEFAULT 0,

    -- Difficulty Progression
    starting_tier INTEGER NOT NULL,
    ending_tier INTEGER,
    max_tier_reached INTEGER DEFAULT 1,

    -- Streak Tracking
    max_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,

    -- Lives System
    hearts_remaining INTEGER DEFAULT 3,

    -- Final Stats
    xp_earned INTEGER DEFAULT 0,
    rating_change INTEGER DEFAULT 0
);

CREATE INDEX idx_sessions_student ON learning_sessions(student_id);
CREATE INDEX idx_sessions_student_topic ON learning_sessions(student_id, topic_id);
```

#### `question_attempts`
Individual question responses within a session.

```sql
CREATE TABLE question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES learning_sessions(id),
    question_id UUID NOT NULL REFERENCES questions(id),

    -- Response
    selected_option_id UUID REFERENCES answer_options(id),
    free_text_answer TEXT,                -- For open-ended questions
    is_correct BOOLEAN NOT NULL,

    -- Timing
    question_presented_at TIMESTAMPTZ NOT NULL,
    answer_submitted_at TIMESTAMPTZ NOT NULL,
    time_spent_seconds INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (answer_submitted_at - question_presented_at))
    ) STORED,

    -- Feedback Given
    feedback_type VARCHAR(30),            -- 'celebration', 'mnemonic', 'socratic_hint', 'explanation'
    feedback_text TEXT,
    hint_level_used INTEGER,

    -- Difficulty at time of question
    difficulty_tier_at_attempt INTEGER NOT NULL,
    streak_at_attempt INTEGER NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempts_session ON question_attempts(session_id);
CREATE INDEX idx_attempts_question ON question_attempts(question_id);
CREATE INDEX idx_attempts_student_question ON question_attempts(session_id, question_id);
```

---

### 4. Analytics Domain

#### `daily_progress`
Aggregated daily stats for parent dashboard.

```sql
CREATE TABLE daily_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,

    -- Activity
    sessions_completed INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,

    -- Performance
    knowledge_accuracy FLOAT,             -- 0.0 to 1.0
    wisdom_accuracy FLOAT,
    overall_accuracy FLOAT,

    -- Growth
    xp_earned INTEGER DEFAULT 0,
    knowledge_rating_change INTEGER DEFAULT 0,
    wisdom_rating_change INTEGER DEFAULT 0,

    -- Insights
    strongest_topic_id UUID REFERENCES topics(id),
    weakest_topic_id UUID REFERENCES topics(id),

    UNIQUE(student_id, date)
);

CREATE INDEX idx_daily_progress_student_date ON daily_progress(student_id, date DESC);
```

#### `learning_insights`
AI-generated insights about learning patterns.

```sql
CREATE TABLE learning_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),

    insight_type VARCHAR(50) NOT NULL,    -- 'learning_style', 'struggle_pattern', 'breakthrough', 'recommendation'
    insight_title VARCHAR(200) NOT NULL,
    insight_body TEXT NOT NULL,

    -- Evidence
    supporting_data JSONB,                -- Question IDs, accuracy rates, etc.
    confidence_score FLOAT,               -- How confident is the insight

    -- Lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_insights_student_active ON learning_insights(student_id, is_active);
```

---

## Redis Data Structures

### Session State (Real-time)

```python
# Key: session:{session_id}
# Type: Hash
{
    "student_id": "uuid",
    "topic_id": "uuid",
    "current_streak": 3,
    "hearts": 2,
    "current_tier": 2,
    "questions_asked": ["q1", "q2", "q3"],  # Avoid repeats
    "last_activity": "2024-01-15T10:30:00Z"
}
# TTL: 1 hour (auto-cleanup)
```

### Question Hash Cache

```python
# Key: composite_hash:{hash}
# Type: String (JSON)
# Purpose: Ensure composite questions show same options on repeat
{
    "question_id": "generated-uuid",
    "options": [
        {"label": "A", "text": "Both the Stamp Act and the Tea Act"},
        {"label": "B", "text": "Only the Stamp Act"},
        ...
    ],
    "created_at": "2024-01-15T10:30:00Z"
}
# TTL: 24 hours
```

### Leaderboard (Optional Gamification)

```python
# Key: leaderboard:weekly:{topic_id}
# Type: Sorted Set
# Score: XP earned this week
# Member: student_id
```

---

## TypeScript Types (Frontend)

```typescript
// Core Types
interface Question {
  id: string;
  questionText: string;
  questionType: 'knowledge' | 'wisdom';
  difficultyTier: 1 | 2 | 3 | 4;
  options: AnswerOption[];
  topicId: string;
}

interface AnswerOption {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

// Never send to client:
// - is_correct
// - distractor_type
// - correct_answer

interface StudentProgress {
  knowledgeRating: number;
  wisdomRating: number;
  knowledgeAccuracy: number;  // 0-100%
  wisdomAccuracy: number;     // 0-100%
  currentStreak: number;
  maxStreak: number;
  heartsRemaining: number;
  currentTier: number;
}

interface TutorFeedback {
  isCorrect: boolean;
  feedbackType: 'celebration' | 'mnemonic' | 'socratic_hint' | 'explanation';
  feedbackText: string;
  avatarEmotion: 'happy' | 'encouraging' | 'thinking' | 'curious';
  xpEarned?: number;
  streakBonus?: boolean;
}

interface ParentDashboard {
  studentName: string;
  learningProfile: 'encyclopedist' | 'strategist' | 'balanced';
  weeklyStats: {
    sessionsCompleted: number;
    timeSpentMinutes: number;
    knowledgeAccuracy: number;
    wisdomAccuracy: number;
  };
  insights: LearningInsight[];
  progressByTopic: TopicProgress[];
}
```

---

## Data Relationships Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   topics    │       │  questions  │       │answer_options│
│             │──1:N──│             │──1:N──│             │
│ (Subject    │       │ (The Scrolls│       │ (A, B, C, D) │
│  Taxonomy)  │       │  of Truth)  │       │             │
└─────────────┘       └──────┬──────┘       └─────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌───────────┐  ┌───────────┐  ┌───────────┐
       │ mnemonics │  │ socratic_ │  │ question_ │
       │           │  │ hints     │  │ attempts  │
       │ (Memory   │  │           │  │           │
       │  Tricks)  │  │ (Guiding  │  │ (Student  │
       └───────────┘  │  Questions│  │  Responses│
                      └───────────┘  └─────┬─────┘
                                           │
                                           ▼
                                    ┌───────────┐
        ┌───────────┐               │ learning_ │
        │   users   │───────────────│ sessions  │
        │           │               │           │
        │ (Students │               │ (Study    │
        │  Parents) │               │  Sessions)│
        └─────┬─────┘               └───────────┘
              │
              ▼
       ┌───────────────┐
       │student_profiles│
       │               │
       │ (Ratings,     │
       │  Progress)    │
       └───────────────┘
```
