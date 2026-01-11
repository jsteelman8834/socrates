-- ============================================
-- ARISTOTLE FEEDBACK LOOP AGENT
-- Background analysis and parent insights
-- ============================================

-- Cognitive Fingerprints (The Five Faculties)
CREATE TABLE IF NOT EXISTS cognitive_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

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

    -- Derived profile
    primary_learning_style VARCHAR(50),
    profile_summary TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cognitive_fingerprint_student ON cognitive_fingerprints(student_id);

-- Virtue Progress Tracking
CREATE TABLE IF NOT EXISTS virtue_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Intellectual Virtues
    curiosity_score FLOAT DEFAULT 0.5,
    patience_score FLOAT DEFAULT 0.5,
    precision_score FLOAT DEFAULT 0.5,
    open_mindedness_score FLOAT DEFAULT 0.5,

    -- Moral Virtues
    fairness_score FLOAT DEFAULT 0.5,
    temperance_score FLOAT DEFAULT 0.5,
    courage_score FLOAT DEFAULT 0.5,
    reflection_score FLOAT DEFAULT 0.5,

    total_observations INTEGER DEFAULT 0,
    virtue_narrative TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_virtue_progress_student ON virtue_progress(student_id);

-- Session Analysis Results (stored after each session)
CREATE TABLE IF NOT EXISTS session_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Analysis results
    faculty_signals JSONB DEFAULT '[]',
    virtue_signals JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    profile_updates JSONB DEFAULT '[]',

    -- Processing status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'processing', 'completed', 'failed'

    error_message TEXT,

    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_analyses_session ON session_analyses(session_id);
CREATE INDEX idx_session_analyses_student ON session_analyses(student_id);
CREATE INDEX idx_session_analyses_status ON session_analyses(status);

-- Behavioral Observations (extracted from sessions)
CREATE TABLE IF NOT EXISTS behavioral_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES learning_sessions(id) ON DELETE SET NULL,
    analysis_id UUID REFERENCES session_analyses(id) ON DELETE CASCADE,

    behavior_type VARCHAR(50) NOT NULL,
    faculty_observed VARCHAR(20) NOT NULL,
    observation_data JSONB NOT NULL,
    behavioral_trait VARCHAR(50),
    trait_strength FLOAT,

    observed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_observations_student ON behavioral_observations(student_id);
CREATE INDEX idx_observations_session ON behavioral_observations(session_id);
CREATE INDEX idx_observations_faculty ON behavioral_observations(faculty_observed);

-- Parent Insights (generated on-demand or weekly)
CREATE TABLE IF NOT EXISTS parent_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Insight content
    headline VARCHAR(200) NOT NULL,
    narrative TEXT NOT NULL,
    key_observations JSONB DEFAULT '[]',
    virtue_highlights JSONB DEFAULT '[]',
    growth_opportunities JSONB DEFAULT '[]',
    stats JSONB DEFAULT '{}',

    -- Validity
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parent_insights_student ON parent_insights(student_id);
CREATE INDEX idx_parent_insights_valid ON parent_insights(valid_until);

-- Next Session Adjustments (recommendations for upcoming sessions)
CREATE TABLE IF NOT EXISTS next_session_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(20) NOT NULL,
    -- 'history', 'math', 'writing'

    -- Adjustments
    suggested_starting_tier INTEGER DEFAULT 1,
    tier_adjustment_reason TEXT,
    suggested_session_length INTEGER DEFAULT 15, -- minutes
    pacing_notes TEXT,
    topic_preferences TEXT[] DEFAULT '{}',
    avoid_topics TEXT[] DEFAULT '{}',
    agent_notes TEXT,

    -- Validity
    valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    applied BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_next_session_student ON next_session_adjustments(student_id);
CREATE INDEX idx_next_session_subject ON next_session_adjustments(subject);
CREATE INDEX idx_next_session_valid ON next_session_adjustments(valid_until);

-- Curriculum Recommendations (longer-term guidance)
CREATE TABLE IF NOT EXISTS curriculum_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    faculty_focus VARCHAR(20) NOT NULL,
    cognitive_gap VARCHAR(100) NOT NULL,
    gap_severity FLOAT DEFAULT 0.5,
    recommended_experiences JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    progress_toward_goal FLOAT DEFAULT 0.0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_curriculum_student ON curriculum_recommendations(student_id);
CREATE INDEX idx_curriculum_active ON curriculum_recommendations(is_active) WHERE is_active = TRUE;

-- Analysis Queue (for background processing)
CREATE TABLE IF NOT EXISTS aristotle_analysis_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    priority INTEGER DEFAULT 0, -- Higher = more urgent
    status VARCHAR(20) DEFAULT 'queued',
    -- 'queued', 'processing', 'completed', 'failed'

    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,

    queued_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_queue_status ON aristotle_analysis_queue(status);
CREATE INDEX idx_queue_priority ON aristotle_analysis_queue(priority DESC, queued_at ASC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to queue a session for Aristotle analysis
CREATE OR REPLACE FUNCTION queue_aristotle_analysis()
RETURNS TRIGGER AS $$
BEGIN
    -- Only queue completed sessions
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        INSERT INTO aristotle_analysis_queue (session_id, student_id, priority)
        VALUES (NEW.id, NEW.student_id, 0)
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-queue sessions for analysis
DROP TRIGGER IF EXISTS trigger_queue_aristotle_analysis ON learning_sessions;
CREATE TRIGGER trigger_queue_aristotle_analysis
    AFTER INSERT OR UPDATE OF status ON learning_sessions
    FOR EACH ROW
    EXECUTE FUNCTION queue_aristotle_analysis();

-- Function to get pending analysis count
CREATE OR REPLACE FUNCTION get_pending_analyses_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM aristotle_analysis_queue WHERE status = 'queued');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE cognitive_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtue_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_session_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_recommendations ENABLE ROW LEVEL SECURITY;

-- Students can read their own data
CREATE POLICY "Students can view own cognitive fingerprint"
    ON cognitive_fingerprints FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can view own virtue progress"
    ON virtue_progress FOR SELECT
    USING (student_id = auth.uid());

-- Parents can read their children's data (assuming parent_id in users table)
-- This would need adjustment based on actual parent-child relationship model

-- Service role can do everything (for background processing)
CREATE POLICY "Service role full access cognitive_fingerprints"
    ON cognitive_fingerprints FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access virtue_progress"
    ON virtue_progress FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access session_analyses"
    ON session_analyses FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access behavioral_observations"
    ON behavioral_observations FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access parent_insights"
    ON parent_insights FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access next_session_adjustments"
    ON next_session_adjustments FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access curriculum_recommendations"
    ON curriculum_recommendations FOR ALL
    USING (auth.role() = 'service_role');
