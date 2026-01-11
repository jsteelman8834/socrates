-- Virtual Socratic University Database Schema
-- Initial migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS AND AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'parent', 'admin')),
    avatar_choice VARCHAR(50) DEFAULT 'owl',
    parent_id UUID REFERENCES users(id),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_parent ON users(parent_id);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    knowledge_rating INTEGER DEFAULT 1000,
    wisdom_rating INTEGER DEFAULT 1000,
    overall_rating INTEGER DEFAULT 1000,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    learning_profile VARCHAR(30),
    badges_earned TEXT[] DEFAULT '{}',
    current_topic_id UUID,
    topics_completed UUID[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT - TOPICS AND QUESTIONS
-- ============================================

CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    grade_level INTEGER NOT NULL,
    subject VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL,
    parent_topic_id UUID REFERENCES topics(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('knowledge', 'wisdom')),
    difficulty_tier INTEGER NOT NULL CHECK (difficulty_tier BETWEEN 1 AND 4),
    cognitive_verb VARCHAR(30) NOT NULL,
    question_stem VARCHAR(20) NOT NULL,
    correct_answer TEXT NOT NULL,
    answer_explanation TEXT NOT NULL,
    is_composite BOOLEAN DEFAULT FALSE,
    source_question_ids UUID[],
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_type_tier ON questions(question_type, difficulty_tier);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = TRUE;

CREATE TABLE answer_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_label CHAR(1) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    distractor_type VARCHAR(30),
    confusion_explanation TEXT,
    related_concept TEXT,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_options_question ON answer_options(question_id);

CREATE TABLE mnemonics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    mnemonic_text TEXT NOT NULL,
    mnemonic_type VARCHAR(30) NOT NULL,
    effectiveness_score FLOAT DEFAULT 0.5,
    times_shown INTEGER DEFAULT 0,
    times_helped INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE socratic_hints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    hint_level INTEGER NOT NULL CHECK (hint_level BETWEEN 1 AND 3),
    hint_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hints_question_level ON socratic_hints(question_id, hint_level);

-- ============================================
-- LEARNING SESSIONS
-- ============================================

CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id),
    topic_id UUID NOT NULL REFERENCES topics(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    knowledge_correct INTEGER DEFAULT 0,
    wisdom_correct INTEGER DEFAULT 0,
    starting_tier INTEGER NOT NULL DEFAULT 1,
    ending_tier INTEGER,
    max_tier_reached INTEGER DEFAULT 1,
    max_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    hearts_remaining INTEGER DEFAULT 3,
    xp_earned INTEGER DEFAULT 0,
    rating_change INTEGER DEFAULT 0,
    current_question_id UUID REFERENCES questions(id),
    asked_question_ids UUID[] DEFAULT '{}'
);

CREATE INDEX idx_sessions_student ON learning_sessions(student_id);
CREATE INDEX idx_sessions_student_topic ON learning_sessions(student_id, topic_id);
CREATE INDEX idx_sessions_status ON learning_sessions(status);

CREATE TABLE question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    selected_option_id UUID REFERENCES answer_options(id),
    free_text_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    question_presented_at TIMESTAMPTZ NOT NULL,
    answer_submitted_at TIMESTAMPTZ NOT NULL,
    time_spent_seconds INTEGER,
    feedback_type VARCHAR(30),
    feedback_text TEXT,
    hint_level_used INTEGER,
    difficulty_tier_at_attempt INTEGER NOT NULL,
    streak_at_attempt INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attempts_session ON question_attempts(session_id);
CREATE INDEX idx_attempts_question ON question_attempts(question_id);

-- ============================================
-- ANALYTICS AND INSIGHTS
-- ============================================

CREATE TABLE daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    sessions_completed INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    knowledge_accuracy FLOAT,
    wisdom_accuracy FLOAT,
    overall_accuracy FLOAT,
    xp_earned INTEGER DEFAULT 0,
    knowledge_rating_change INTEGER DEFAULT 0,
    wisdom_rating_change INTEGER DEFAULT 0,
    strongest_topic_id UUID REFERENCES topics(id),
    weakest_topic_id UUID REFERENCES topics(id),
    UNIQUE(student_id, date)
);

CREATE INDEX idx_daily_progress_student_date ON daily_progress(student_id, date DESC);

CREATE TABLE learning_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id),
    insight_type VARCHAR(50) NOT NULL,
    insight_title VARCHAR(200) NOT NULL,
    insight_body TEXT NOT NULL,
    supporting_data JSONB,
    confidence_score FLOAT,
    is_active BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_insights_student_active ON learning_insights(student_id, is_active);

-- ============================================
-- SUBSCRIPTIONS AND PAYMENTS
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    plan_type VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER student_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER topics_updated_at
    BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON users FOR SELECT USING (true);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Parents can read their children's data
CREATE POLICY student_profiles_select ON student_profiles FOR SELECT USING (true);
CREATE POLICY sessions_select ON learning_sessions FOR SELECT USING (true);
CREATE POLICY attempts_select ON question_attempts FOR SELECT USING (true);
CREATE POLICY progress_select ON daily_progress FOR SELECT USING (true);
CREATE POLICY insights_select ON learning_insights FOR SELECT USING (true);

-- Topics and questions are public read
CREATE POLICY topics_select ON topics FOR SELECT USING (true);
CREATE POLICY questions_select ON questions FOR SELECT USING (true);
CREATE POLICY options_select ON answer_options FOR SELECT USING (true);
CREATE POLICY mnemonics_select ON mnemonics FOR SELECT USING (true);
CREATE POLICY hints_select ON socratic_hints FOR SELECT USING (true);
