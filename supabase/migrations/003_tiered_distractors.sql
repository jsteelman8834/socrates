-- Migration: Add tiered distractor support
-- The core insight: difficulty comes from distractor quality, not question text

-- Add tier column to answer_options to support multiple distractor sets per question
ALTER TABLE answer_options ADD COLUMN IF NOT EXISTS difficulty_tier INTEGER DEFAULT 1;

-- Add distractor_type to classify the trap/confusion type
ALTER TABLE answer_options ADD COLUMN IF NOT EXISTS distractor_type VARCHAR(50);
-- Types: 'correct', 'wrong_era', 'wrong_category', 'same_category', 'near_miss', 'trap', 'common_misconception'

-- Add trap_explanation for the agent to understand why this distractor exists
ALTER TABLE answer_options ADD COLUMN IF NOT EXISTS trap_explanation TEXT;

-- Create index for efficient tier-based querying
CREATE INDEX IF NOT EXISTS idx_answer_options_tier ON answer_options(question_id, difficulty_tier);

-- Update the question table to support citation references
ALTER TABLE questions ADD COLUMN IF NOT EXISTS citation_text TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS citation_source VARCHAR(255);

-- Create a view for easy question + options retrieval by tier
CREATE OR REPLACE VIEW questions_with_options AS
SELECT
    q.id as question_id,
    q.topic_id,
    q.question_text,
    q.question_type,
    q.base_difficulty,
    q.citation_text,
    q.citation_source,
    ao.id as option_id,
    ao.option_label,
    ao.option_text,
    ao.is_correct,
    ao.difficulty_tier,
    ao.distractor_type,
    ao.trap_explanation
FROM questions q
JOIN answer_options ao ON q.id = ao.question_id
WHERE q.is_active = true
ORDER BY q.id, ao.difficulty_tier, ao.option_label;

-- Add comments explaining the distractor strategy
COMMENT ON COLUMN answer_options.difficulty_tier IS
'Tier 1: Wrong era/category (obvious). Tier 2: Same category, distinct achievements. Tier 3: Near-misses and traps.';

COMMENT ON COLUMN answer_options.distractor_type IS
'Classifies the distractor: correct, wrong_era, wrong_category, same_category, near_miss, trap, common_misconception';

COMMENT ON COLUMN answer_options.trap_explanation IS
'Agent instruction: Why this answer is wrong and how to guide the student if they pick it.';
