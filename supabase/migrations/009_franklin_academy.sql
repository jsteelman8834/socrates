-- ============================================
-- FRANKLIN'S GRANDSON ACADEMY
-- Interactive historical storytelling system
-- Migration 009
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ACADEMY ENROLLMENT
-- ============================================

CREATE TABLE franklin_academy_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Progress tracking
    current_week INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 3),
    current_day INTEGER DEFAULT 1 CHECK (current_day BETWEEN 1 AND 15),
    completed_days INTEGER[] DEFAULT '{}',

    -- Four skills tracking (separate from knowledge/wisdom)
    curiosity_score INTEGER DEFAULT 0 CHECK (curiosity_score >= 0),
    courage_score INTEGER DEFAULT 0 CHECK (courage_score >= 0),
    logic_score INTEGER DEFAULT 0 CHECK (logic_score >= 0),
    communication_score INTEGER DEFAULT 0 CHECK (communication_score >= 0),

    -- Metadata
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_session_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    UNIQUE(student_id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. EPISODE CONTENT (Authored Content)
-- ============================================

CREATE TABLE franklin_episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Structure
    week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 3),
    day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 15),
    topic_id UUID REFERENCES topics(id), -- Links to existing topics table

    -- Basic info
    title VARCHAR(200) NOT NULL,
    historical_period VARCHAR(100) NOT NULL, -- e.g., "1763-1775"

    -- Part 1: Recap + Vocab
    recap_prompt TEXT, -- Template for AI to personalize
    vocab_cards JSONB DEFAULT '[]', -- [{term, definition, visual_cue, example}]

    -- Part 2: Story
    story_setup TEXT NOT NULL, -- Opening narrative
    story_context JSONB NOT NULL, -- {date, location, historicalFacts, characters}
    choice_points JSONB NOT NULL, -- [{id, prompt, options: [{id, text, consequences}]}]
    convergence_points JSONB DEFAULT '[]', -- Where branches rejoin

    -- Part 3: Mini-Mission
    mission_type VARCHAR(50) NOT NULL CHECK (mission_type IN ('draw', 'write', 'roleplay', 'math', 'timeline', 'map')),
    mission_prompt TEXT NOT NULL,
    mission_materials JSONB, -- {provided: [], optional: []}
    mission_rubric JSONB NOT NULL, -- [{dimension, scale, descriptors}]
    mission_ai_guide JSONB, -- {lookFor, commonMistakes, encouragementTips}
    skill_targets JSONB NOT NULL, -- {curiosity: 10, logic: 15, ...}
    mission_template JSONB, -- For structured missions (timeline, map)

    -- Part 4: Liberty Ledger
    reflection_prompt TEXT NOT NULL,
    reflection_skill VARCHAR(50) CHECK (reflection_skill IN ('curiosity', 'courage', 'logic', 'communication')),

    -- Metadata
    estimated_minutes INTEGER DEFAULT 30,
    learning_objectives TEXT[],
    historical_sources TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(week, day)
);

-- ============================================
-- 3. STUDENT SESSIONS (Daily Instances)
-- ============================================

CREATE TABLE franklin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES franklin_academy_enrollments(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES franklin_episodes(id),

    -- Session state
    current_part VARCHAR(20) DEFAULT 'recap' CHECK (current_part IN ('recap', 'story', 'mission', 'ledger', 'complete')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    recap_completed_at TIMESTAMPTZ,
    story_completed_at TIMESTAMPTZ,
    mission_completed_at TIMESTAMPTZ,
    ledger_completed_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,

    -- Skills earned this session
    skills_earned JSONB DEFAULT '{}', -- {curiosity: 5, courage: 10, ...}

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. STORY CHOICES
-- ============================================

CREATE TABLE franklin_story_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES franklin_sessions(id) ON DELETE CASCADE,

    -- Choice identification
    choice_point_id VARCHAR(50) NOT NULL, -- From episode.choice_points
    choice_option_id VARCHAR(50) NOT NULL, -- Which option selected

    -- Context for AI narrative synthesis
    story_state_before JSONB, -- {previousChoices, currentNarrative}
    story_state_after JSONB, -- {updatedNarrative, narrativeTag}

    -- Skills awarded for this choice
    skills_awarded JSONB DEFAULT '{}',

    chosen_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. MINI-MISSION SUBMISSIONS
-- ============================================

CREATE TABLE franklin_mission_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES franklin_sessions(id) ON DELETE CASCADE,

    mission_type VARCHAR(50) NOT NULL,

    -- Submission content
    text_content TEXT, -- For writing/roleplay/descriptions
    file_upload_url TEXT, -- For drawings/photos (Supabase Storage)
    structured_data JSONB, -- For timelines, maps (structured responses)

    -- AI Evaluation
    ai_feedback TEXT,
    rubric_scores JSONB, -- {dimension: {score, evidence}}
    skills_awarded JSONB, -- {curiosity: 8, logic: 12}

    -- Timing
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. LIBERTY LEDGER ENTRIES (Reflections)
-- ============================================

CREATE TABLE franklin_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES franklin_sessions(id) ON DELETE CASCADE,

    -- Student's reflection
    reflection_text TEXT NOT NULL,

    -- AI Analysis & Response
    ai_response TEXT,
    skill_identified VARCHAR(50), -- Which skill demonstrated
    skill_points_awarded INTEGER DEFAULT 5,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. CAPSTONE NEWSPAPER (Final Project)
-- ============================================

CREATE TABLE franklin_newspapers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES franklin_academy_enrollments(id) ON DELETE CASCADE,

    -- Newspaper content
    masthead VARCHAR(200), -- Newspaper name
    dateline VARCHAR(200), -- "Philadelphia, December 1775"

    headline_main TEXT,
    headline_secondary TEXT,
    headline_tertiary TEXT,

    timeline_events JSONB, -- [{date, event, source_day, studentNotes}]

    editorial_title TEXT,
    editorial_perspective VARCHAR(50) CHECK (editorial_perspective IN ('patriot', 'loyalist', 'neutral')),
    editorial_body TEXT,
    editorial_signature TEXT,

    -- AI assistance tracking
    ai_suggestions_used JSONB DEFAULT '{}',
    student_original_content_pct FLOAT,

    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'complete', 'published')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- 8. FACT-CHECKING LOG (Grokipedia Integration)
-- ============================================

CREATE TABLE franklin_fact_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES franklin_sessions(id) ON DELETE CASCADE,

    -- Fact query
    fact_query TEXT NOT NULL,
    source VARCHAR(50), -- 'story', 'mission', 'ledger', 'cabinet'

    -- External API response
    api_response JSONB,
    verified BOOLEAN,
    trusted_sources TEXT[],

    -- Student interaction
    student_viewed BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. EXTEND EXISTING TABLES
-- ============================================

-- Add Franklin Academy skills to student_profiles
ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS franklin_curiosity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS franklin_courage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS franklin_logic INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS franklin_communication INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS franklin_academy_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS franklin_academy_completion_date TIMESTAMPTZ;

-- ============================================
-- 10. INDEXES
-- ============================================

-- Enrollment indexes
CREATE INDEX idx_franklin_enrollments_student ON franklin_academy_enrollments(student_id);
CREATE INDEX idx_franklin_enrollments_progress ON franklin_academy_enrollments(current_week, current_day);

-- Session indexes
CREATE INDEX idx_franklin_sessions_enrollment ON franklin_sessions(enrollment_id);
CREATE INDEX idx_franklin_sessions_episode ON franklin_sessions(episode_id);
CREATE INDEX idx_franklin_sessions_status ON franklin_sessions(status);

-- Episode indexes
CREATE INDEX idx_franklin_episodes_week_day ON franklin_episodes(week, day);

-- Story choice indexes
CREATE INDEX idx_franklin_choices_session ON franklin_story_choices(session_id);

-- Mission indexes
CREATE INDEX idx_franklin_missions_session ON franklin_mission_submissions(session_id);

-- Ledger indexes
CREATE INDEX idx_franklin_ledger_session ON franklin_ledger_entries(session_id);

-- Newspaper indexes
CREATE INDEX idx_franklin_newspaper_enrollment ON franklin_newspapers(enrollment_id);

-- Fact check indexes
CREATE INDEX idx_franklin_fact_checks_session ON franklin_fact_checks(session_id);

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all Franklin tables
ALTER TABLE franklin_academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE franklin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE franklin_story_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE franklin_mission_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE franklin_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE franklin_newspapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE franklin_fact_checks ENABLE ROW LEVEL SECURITY;

-- Episodes are public read (content is not user-specific)
ALTER TABLE franklin_episodes ENABLE ROW LEVEL SECURITY;

-- Policies for enrollments
CREATE POLICY "Students manage own enrollment"
    ON franklin_academy_enrollments FOR ALL
    USING (student_id = auth.uid());

-- Policies for sessions
CREATE POLICY "Students manage own sessions"
    ON franklin_sessions FOR ALL
    USING (
        enrollment_id IN (
            SELECT id FROM franklin_academy_enrollments
            WHERE student_id = auth.uid()
        )
    );

-- Policies for story choices
CREATE POLICY "Students manage own story choices"
    ON franklin_story_choices FOR ALL
    USING (
        session_id IN (
            SELECT fs.id FROM franklin_sessions fs
            JOIN franklin_academy_enrollments fe ON fs.enrollment_id = fe.id
            WHERE fe.student_id = auth.uid()
        )
    );

-- Policies for mission submissions
CREATE POLICY "Students manage own mission submissions"
    ON franklin_mission_submissions FOR ALL
    USING (
        session_id IN (
            SELECT fs.id FROM franklin_sessions fs
            JOIN franklin_academy_enrollments fe ON fs.enrollment_id = fe.id
            WHERE fe.student_id = auth.uid()
        )
    );

-- Policies for ledger entries
CREATE POLICY "Students manage own ledger entries"
    ON franklin_ledger_entries FOR ALL
    USING (
        session_id IN (
            SELECT fs.id FROM franklin_sessions fs
            JOIN franklin_academy_enrollments fe ON fs.enrollment_id = fe.id
            WHERE fe.student_id = auth.uid()
        )
    );

-- Policies for newspapers
CREATE POLICY "Students manage own newspapers"
    ON franklin_newspapers FOR ALL
    USING (
        enrollment_id IN (
            SELECT id FROM franklin_academy_enrollments
            WHERE student_id = auth.uid()
        )
    );

-- Policies for fact checks
CREATE POLICY "Students view own fact checks"
    ON franklin_fact_checks FOR SELECT
    USING (
        session_id IN (
            SELECT fs.id FROM franklin_sessions fs
            JOIN franklin_academy_enrollments fe ON fs.enrollment_id = fe.id
            WHERE fe.student_id = auth.uid()
        )
    );

-- Episodes are public read
CREATE POLICY "Anyone can read episodes"
    ON franklin_episodes FOR SELECT
    USING (true);

-- Service role full access (for API routes)
CREATE POLICY "Service role full access enrollments"
    ON franklin_academy_enrollments FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access sessions"
    ON franklin_sessions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access choices"
    ON franklin_story_choices FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access missions"
    ON franklin_mission_submissions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access ledger"
    ON franklin_ledger_entries FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access newspapers"
    ON franklin_newspapers FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access fact checks"
    ON franklin_fact_checks FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access episodes"
    ON franklin_episodes FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 12. UPDATED_AT TRIGGER
-- ============================================

-- Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for tables with updated_at
CREATE TRIGGER update_franklin_enrollments_updated_at
    BEFORE UPDATE ON franklin_academy_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franklin_episodes_updated_at
    BEFORE UPDATE ON franklin_episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 13. COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE franklin_academy_enrollments IS 'Student enrollment in Franklin Academy with progress and skill tracking';
COMMENT ON TABLE franklin_episodes IS 'Authored content for each of the 15 days (3 weeks × 5 days)';
COMMENT ON TABLE franklin_sessions IS 'Daily session instances tracking 4-part progress (recap, story, mission, ledger)';
COMMENT ON TABLE franklin_story_choices IS 'Student choices in narrative with AI synthesis context';
COMMENT ON TABLE franklin_mission_submissions IS 'Activity submissions (drawings, writing, timelines, etc) with AI evaluation';
COMMENT ON TABLE franklin_ledger_entries IS 'Daily reflection entries with Franklin responses';
COMMENT ON TABLE franklin_newspapers IS 'Capstone project: Pre-Revolution newspaper builder';
COMMENT ON TABLE franklin_fact_checks IS 'Historical fact-checking via Grokipedia integration';

COMMENT ON COLUMN franklin_academy_enrollments.curiosity_score IS 'Skill: Asking why, seeking sources, questioning assumptions';
COMMENT ON COLUMN franklin_academy_enrollments.courage_score IS 'Skill: Expressing unpopular views, taking intellectual risks';
COMMENT ON COLUMN franklin_academy_enrollments.logic_score IS 'Skill: Tracing cause-effect, spotting contradictions, building arguments';
COMMENT ON COLUMN franklin_academy_enrollments.communication_score IS 'Skill: Clear expression, persuasion, considering multiple viewpoints';

-- ============================================
-- END OF MIGRATION
-- ============================================
