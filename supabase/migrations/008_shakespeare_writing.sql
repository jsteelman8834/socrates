-- ============================================
-- SHAKESPEARE CREATIVE WRITING AGENT
-- Interactive writing sessions with students
-- ============================================

-- Writer Profiles
CREATE TABLE IF NOT EXISTS writer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Interests
    interests JSONB DEFAULT '["comedy", "fantasy"]',
    preferred_mode VARCHAR(30) DEFAULT 'dialogue',

    -- Skills (discovered over time)
    strengths TEXT[] DEFAULT '{}',
    growth_areas TEXT[] DEFAULT '{}',

    -- Challenge Level (1-8 ladder)
    challenge_level INTEGER DEFAULT 1 CHECK (challenge_level BETWEEN 1 AND 8),

    -- Writing Stamina
    writing_stamina_minutes INTEGER DEFAULT 10,
    avg_session_duration_minutes FLOAT,

    -- Learning Goals
    current_learning_goals TEXT[] DEFAULT '{}',

    -- Behavioral Metrics
    avg_time_to_start_seconds FLOAT,
    completion_rate FLOAT DEFAULT 0.5,
    revision_willingness FLOAT DEFAULT 0.5,
    creative_risk_score FLOAT DEFAULT 0.5,

    -- Aggregate Stats
    total_stories_written INTEGER DEFAULT 0,
    total_words_written INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_writer_profiles_user ON writer_profiles(user_id);

-- Writing Prompts
CREATE TABLE IF NOT EXISTS writing_prompts (
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

CREATE INDEX idx_writing_prompts_level ON writing_prompts(challenge_level);
CREATE INDEX idx_writing_prompts_type ON writing_prompts(prompt_type);
CREATE INDEX idx_writing_prompts_active ON writing_prompts(is_active) WHERE is_active = TRUE;

-- Writing Sessions
CREATE TABLE IF NOT EXISTS writing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    challenge_level INTEGER NOT NULL CHECK (challenge_level BETWEEN 1 AND 8),
    prompt_id UUID REFERENCES writing_prompts(id),

    -- Phase tracking
    phase VARCHAR(30) NOT NULL DEFAULT 'warm_up',
    -- 'warm_up', 'create', 'upgrade', 'reflect', 'complete'
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

    -- Notes
    session_notes TEXT,

    -- Rewards
    xp_earned INTEGER DEFAULT 0,
    badges_earned TEXT[] DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_writing_sessions_student ON writing_sessions(student_id);
CREATE INDEX idx_writing_sessions_status ON writing_sessions(status);
CREATE INDEX idx_writing_sessions_phase ON writing_sessions(phase);

-- Story Drafts
CREATE TABLE IF NOT EXISTS story_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES writing_sessions(id) ON DELETE CASCADE,

    -- Version tracking
    version INTEGER NOT NULL DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    draft_type VARCHAR(30) NOT NULL,
    -- 'warm_up', 'first_draft', 'revision', 'final'

    -- Content
    content TEXT NOT NULL,
    word_count INTEGER,

    -- Analysis (populated by Shakespeare)
    detected_elements JSONB DEFAULT '{}',

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_spent_seconds INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_story_drafts_session ON story_drafts(session_id);
CREATE INDEX idx_story_drafts_current ON story_drafts(session_id, is_current) WHERE is_current = TRUE;

-- Rubric Scores
CREATE TABLE IF NOT EXISTS rubric_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES story_drafts(id) ON DELETE CASCADE,

    -- Story Power (1-5)
    character_want SMALLINT CHECK (character_want BETWEEN 1 AND 5),
    obstacle SMALLINT CHECK (obstacle BETWEEN 1 AND 5),
    stakes SMALLINT CHECK (stakes BETWEEN 1 AND 5),
    voice SMALLINT CHECK (voice BETWEEN 1 AND 5),
    memorable_moment SMALLINT CHECK (memorable_moment BETWEEN 1 AND 5),

    -- Craft Growth (1-5)
    clarity SMALLINT CHECK (clarity BETWEEN 1 AND 5),
    concrete_details SMALLINT CHECK (concrete_details BETWEEN 1 AND 5),
    sentence_control SMALLINT CHECK (sentence_control BETWEEN 1 AND 5),
    sentence_variety SMALLINT CHECK (sentence_variety BETWEEN 1 AND 5),
    revision_willingness SMALLINT CHECK (revision_willingness BETWEEN 1 AND 5),

    -- Meta
    evaluation_confidence FLOAT,
    feedback_data JSONB DEFAULT '{}',

    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rubric_scores_draft ON rubric_scores(draft_id);

-- Shakespeare Feedback (Director's Notes)
CREATE TABLE IF NOT EXISTS shakespeare_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES story_drafts(id) ON DELETE CASCADE,
    rubric_score_id UUID REFERENCES rubric_scores(id),

    feedback_type VARCHAR(30) NOT NULL,
    -- 'win', 'grow', 'example', 'prompt', 'stuck_help', 'celebration'

    feedback_text TEXT NOT NULL,
    emotion VARCHAR(30) DEFAULT 'encouraging',
    -- 'delighted', 'impressed', 'encouraging', 'curious',
    -- 'thoughtful', 'playful', 'dramatic', 'celebratory'

    quote_from_work TEXT,
    example_rewrite TEXT,

    was_helpful BOOLEAN,
    student_response TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shakespeare_feedback_draft ON shakespeare_feedback(draft_id);

-- ============================================
-- SEED WRITING PROMPTS
-- ============================================

-- Level 1: Just write something
INSERT INTO writing_prompts (challenge_level, title, prompt_text, prompt_type, genres, scaffold_options, success_criteria, estimated_minutes)
VALUES
(1, 'The Unexpected Guest',
 'A knock at the door. But it''s midnight, and nobody was expected. Write a short scene about who''s there and what happens.',
 'main_challenge', ARRAY['mystery', 'comedy', 'adventure'],
 '[{"type": "choices", "content": ["A talking animal", "A confused delivery person", "Someone from the past"]}]'::jsonb,
 ARRAY['has_character', 'has_action'], 8),

(1, 'The Worst Superpower',
 'Your character just discovered they have a superpower... but it''s the most useless one imaginable. What is it? Write a funny scene showing them trying to use it.',
 'main_challenge', ARRAY['comedy', 'fantasy'],
 '[{"type": "choices", "content": ["They can turn invisible, but only when no one is looking", "They can talk to plants, but plants are boring", "They can fly, but only 2 inches off the ground"]}]'::jsonb,
 ARRAY['has_character', 'humor'], 8),

-- Level 2: Add setting
(2, 'The Strange Shop',
 'Your character walks into a shop they''ve never noticed before. Describe what they see, hear, and smell. What makes this place feel... different?',
 'main_challenge', ARRAY['mystery', 'fantasy'],
 '[{"type": "fill_in", "content": "The shop smelled like ___ and ___. On the shelves, I could see ___."}]'::jsonb,
 ARRAY['has_setting', 'sensory_details'], 10),

-- Level 3: Goal + Obstacle
(3, 'The Important Thing',
 'Your character desperately needs something - but something (or someone) stands in their way. What do they want? What''s stopping them? Write the scene where they try to get it.',
 'main_challenge', ARRAY['adventure', 'comedy', 'sports'],
 '[{"type": "choices", "content": ["They need to return a library book before it closes", "They need to apologize to a friend before they move away", "They need to save the last slice of pizza"]}]'::jsonb,
 ARRAY['has_character', 'has_obstacle', 'character_want_clear'], 12),

-- Level 4: Stakes
(4, 'Why It Matters',
 'Your character is trying to achieve something. But this time, show us WHY it matters so much to them. What will they lose if they fail? What will they gain if they succeed?',
 'main_challenge', ARRAY['adventure', 'family', 'sports'],
 '[{"type": "example_line", "content": ["If I don''t make this shot, everyone will know I''m not as good as they thought.", "This was my grandmother''s ring. If I lose it, I lose the last piece of her."]}]'::jsonb,
 ARRAY['has_stakes', 'emotional_depth'], 12),

-- Level 5: Twist
(5, 'The Surprise',
 'Write a short story where everything seems to be going one way... then twist! Something unexpected changes everything. Make the reader say "I didn''t see that coming!"',
 'main_challenge', ARRAY['mystery', 'comedy', 'fantasy'],
 '[{"type": "example_line", "content": ["The treasure chest was finally open. Inside was... a mirror.", "I had been talking to myself the whole time."]}]'::jsonb,
 ARRAY['has_twist', 'surprise'], 15),

-- Level 6: Plant & Payoff
(6, 'The Hidden Clue',
 'Write a story where you plant a small detail early on that becomes VERY important at the end. The reader should be able to go back and say "Oh! It was there the whole time!"',
 'main_challenge', ARRAY['mystery', 'adventure'],
 '[{"type": "first_sentence", "content": "She always kept that old key on her necklace, though she''d forgotten what it opened."}]'::jsonb,
 ARRAY['has_foreshadowing', 'plant_payoff'], 15),

-- Level 7: Conflicting Goals
(7, 'Two Wants Collide',
 'Two characters both want something - but they can''t both have it. Write the scene where they face off. Remember: neither one is "the bad guy" - they both have good reasons.',
 'main_challenge', ARRAY['family', 'sports', 'adventure'],
 '[]'::jsonb,
 ARRAY['two_characters', 'conflict', 'both_sympathetic'], 18),

-- Level 8: POV Shift
(8, 'Through Different Eyes',
 'Take a story you''ve written before (or a famous story) and rewrite one scene from a different character''s point of view. How does the same event feel completely different?',
 'main_challenge', ARRAY['any'],
 '[]'::jsonb,
 ARRAY['pov_shift', 'character_depth'], 20);

-- Warm-up prompts (level-agnostic)
INSERT INTO writing_prompts (challenge_level, title, prompt_text, prompt_type, genres, success_criteria, estimated_minutes)
VALUES
(1, 'Three Weird Names', 'Give me three weird names for a grumpy wizard.', 'warm_up', ARRAY['fantasy', 'comedy'], ARRAY['creativity'], 2),
(1, 'Worst First Line', 'Write the WORST first line of a story you can think of. Make it terrible on purpose!', 'warm_up', ARRAY['comedy'], ARRAY['playfulness'], 2),
(1, 'Animal Conversation', 'A nervous hamster meets a brave lion. What does the hamster say?', 'warm_up', ARRAY['animals', 'comedy'], ARRAY['dialogue'], 2),
(1, 'Sound Story', 'Write 2 sentences using only sounds. CRASH! WHOOSH! SPLAT!', 'warm_up', ARRAY['action'], ARRAY['sensory_details'], 2),
(1, 'Emoji Story', 'Tell a tiny story in exactly 5 words based on this: 🏃‍♂️💨🐕', 'warm_up', ARRAY['any'], ARRAY['brevity'], 2);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE shakespeare_feedback ENABLE ROW LEVEL SECURITY;

-- Students can read/write their own data
CREATE POLICY "Users can manage own writer profile"
    ON writer_profiles FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own writing sessions"
    ON writing_sessions FOR ALL
    USING (student_id = auth.uid());

CREATE POLICY "Users can manage own story drafts"
    ON story_drafts FOR ALL
    USING (session_id IN (SELECT id FROM writing_sessions WHERE student_id = auth.uid()));

CREATE POLICY "Users can view own rubric scores"
    ON rubric_scores FOR SELECT
    USING (draft_id IN (
        SELECT sd.id FROM story_drafts sd
        JOIN writing_sessions ws ON sd.session_id = ws.id
        WHERE ws.student_id = auth.uid()
    ));

CREATE POLICY "Users can view own feedback"
    ON shakespeare_feedback FOR SELECT
    USING (draft_id IN (
        SELECT sd.id FROM story_drafts sd
        JOIN writing_sessions ws ON sd.session_id = ws.id
        WHERE ws.student_id = auth.uid()
    ));

-- Prompts are public read
CREATE POLICY "Anyone can read prompts"
    ON writing_prompts FOR SELECT
    USING (is_active = TRUE);

-- Service role full access
CREATE POLICY "Service role full access writer_profiles"
    ON writer_profiles FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access writing_sessions"
    ON writing_sessions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access story_drafts"
    ON story_drafts FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access rubric_scores"
    ON rubric_scores FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access shakespeare_feedback"
    ON shakespeare_feedback FOR ALL USING (auth.role() = 'service_role');
