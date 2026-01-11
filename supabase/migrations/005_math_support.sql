-- Migration: Add math subject support
-- This extends the schema to support multiple subjects (history, math)
-- Each subject has its own pedagogy (Socrates vs Pythagoras)

-- ============================================
-- EXTEND TOPICS FOR MULTI-SUBJECT
-- ============================================

-- Add subject column to topics
ALTER TABLE topics ADD COLUMN IF NOT EXISTS subject VARCHAR(50) DEFAULT 'history';

-- Add domain for math-specific categorization
ALTER TABLE topics ADD COLUMN IF NOT EXISTS domain VARCHAR(100);

-- Create index for subject-based queries
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject);

-- ============================================
-- EXTEND QUESTIONS FOR MATH
-- ============================================

-- Add subject column
ALTER TABLE questions ADD COLUMN IF NOT EXISTS subject VARCHAR(50) DEFAULT 'history';

-- Add math-specific columns
ALTER TABLE questions ADD COLUMN IF NOT EXISTS math_expression TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS visualization_hint VARCHAR(50);

-- Create index for subject-based queries
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);

COMMENT ON COLUMN questions.math_expression IS 'LaTeX or plain math expression for the problem';
COMMENT ON COLUMN questions.visualization_hint IS 'Suggested visualization: number_line, fraction_bar, array, dot_pattern, etc.';

-- ============================================
-- EXTEND ANSWER_OPTIONS FOR MATH DISTRACTORS
-- ============================================

-- The existing distractor_type covers history well.
-- For math, we use the same column but with different values:
-- History: trap, near_miss, same_category, wrong_era, wrong_category
-- Math: wrong_operation, place_value_error, fraction_denominator_add, etc.

-- Add math-specific distractor metadata
ALTER TABLE answer_options ADD COLUMN IF NOT EXISTS error_description TEXT;
ALTER TABLE answer_options ADD COLUMN IF NOT EXISTS pythagoras_guidance TEXT;
ALTER TABLE answer_options ADD COLUMN IF NOT EXISTS show_work_example TEXT;
ALTER TABLE answer_options ADD COLUMN IF NOT EXISTS numeric_value DECIMAL;

COMMENT ON COLUMN answer_options.error_description IS 'Math: What procedural error produces this wrong answer';
COMMENT ON COLUMN answer_options.pythagoras_guidance IS 'Math: How Pythagoras should guide students who pick this';
COMMENT ON COLUMN answer_options.show_work_example IS 'Math: Example of the wrong procedure';
COMMENT ON COLUMN answer_options.numeric_value IS 'Math: The numeric value of this answer option';

-- ============================================
-- ADD PATTERN_HINTS TABLE (Pythagoras-specific)
-- ============================================

CREATE TABLE IF NOT EXISTS pattern_hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  hint_level INTEGER NOT NULL CHECK (hint_level BETWEEN 1 AND 3),
  hint_text TEXT NOT NULL,
  visualization VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, hint_level)
);

COMMENT ON TABLE pattern_hints IS 'Pythagoras-style hints that lead students to discover patterns';
COMMENT ON COLUMN pattern_hints.hint_level IS '1=broad nudge, 2=more specific, 3=direct scaffold';
COMMENT ON COLUMN pattern_hints.visualization IS 'Suggested visualization to accompany this hint';

-- ============================================
-- EXTEND LEARNING_SESSIONS FOR MULTI-SUBJECT
-- ============================================

ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS subject VARCHAR(50) DEFAULT 'history';
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS agent VARCHAR(50) DEFAULT 'socrates';

-- Math-specific tracking (parallel to knowledge/wisdom for history)
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS fluency_correct INTEGER DEFAULT 0;
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS concept_correct INTEGER DEFAULT 0;
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS problem_solving_correct INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_sessions_subject ON learning_sessions(subject);

-- ============================================
-- EXTEND STUDENT_PROFILES FOR MULTI-SUBJECT
-- ============================================

-- Add math ratings (separate from history)
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS math_fluency_rating INTEGER DEFAULT 1000;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS math_concept_rating INTEGER DEFAULT 1000;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS math_problem_solving_rating INTEGER DEFAULT 1000;

-- Add math learning profile
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS math_learning_profile VARCHAR(50);

COMMENT ON COLUMN student_profiles.math_learning_profile IS 'calculator, pattern_seeker, problem_solver, or balanced';

-- ============================================
-- CREATE VIEW FOR MATH QUESTIONS
-- ============================================

CREATE OR REPLACE VIEW math_questions_with_options AS
SELECT
    q.id as question_id,
    q.topic_id,
    q.question_text,
    q.question_type,
    q.base_difficulty,
    q.math_expression,
    q.visualization_hint,
    ao.id as option_id,
    ao.option_label,
    ao.option_text,
    ao.is_correct,
    ao.difficulty_tier,
    ao.distractor_type,
    ao.error_description,
    ao.pythagoras_guidance,
    ao.numeric_value
FROM questions q
JOIN answer_options ao ON q.id = ao.question_id
WHERE q.subject = 'math' AND q.is_active = true
ORDER BY q.id, ao.difficulty_tier, ao.option_label;

-- ============================================
-- RLS POLICIES FOR NEW TABLE
-- ============================================

ALTER TABLE pattern_hints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pattern hints are viewable by authenticated users"
  ON pattern_hints FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Pattern hints are manageable by admins"
  ON pattern_hints FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.clerk_id = auth.uid()::text
      AND users.role = 'admin'
    )
  );
