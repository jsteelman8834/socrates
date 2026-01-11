-- Seed: 5th Grade Math Questions with Procedural Error Distractors
--
-- PYTHAGORAS PEDAGOGY: These questions are designed for pattern discovery.
-- Distractors represent PROCEDURAL ERRORS, not fact confusion.
-- Each wrong answer tells us exactly what went wrong in the student's thinking.

-- ============================================
-- MATH TOPICS
-- ============================================

INSERT INTO topics (id, name, description, grade_level, icon, subject, domain) VALUES
  ('fractions', 'Fractions', 'Master the art of parts and wholes', 5, '🍕', 'math', 'fractions'),
  ('multiplication', 'Multiplication', 'Discover the patterns in times tables', 5, '✖️', 'math', 'multiplication'),
  ('decimals', 'Decimals', 'Explore the world between whole numbers', 5, '🔢', 'math', 'decimals'),
  ('patterns', 'Number Patterns', 'Find the hidden rules in sequences', 5, '🔮', 'math', 'patterns'),
  ('order-of-operations', 'Order of Operations', 'Learn the recipe for solving expressions', 5, '📋', 'math', 'order_of_operations')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- QUESTION 1: Fraction Addition (Common Trap)
-- ============================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, subject, math_expression, visualization_hint, answer_explanation)
VALUES ('m1-fraction-add', 'fractions',
  'What is 1/2 + 1/4?',
  'fluency', 2, 'math', '\\frac{1}{2} + \\frac{1}{4}', 'fraction_bar',
  'To add fractions, we need a common denominator. 1/2 = 2/4, so 2/4 + 1/4 = 3/4.');

-- Tier 1: Obvious wrong answers
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m1-fraction-add', 'A', '3/4', true, 1, 'correct', 0.75, NULL, NULL),
  ('m1-fraction-add', 'B', '2', false, 1, 'wrong_operation', 2, 'Student added numerator AND denominator separately: 1+1=2, 2+4=6, then simplified incorrectly to 2', 'Hmm, fractions are trickier than regular addition! Picture two pizzas - can you SEE how much we have total?'),
  ('m1-fraction-add', 'C', '1', false, 1, 'reasonable_guess', 1, 'Student guessed a whole number', 'Fractions give us answers that arent always whole numbers. Lets draw the pieces!'),
  ('m1-fraction-add', 'D', '1/8', false, 1, 'wrong_operation', 0.125, 'Student multiplied instead of adding', 'Check the operation symbol - we are adding, not multiplying!');

-- Tier 2: Procedural errors
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m1-fraction-add', 'A', '3/4', true, 2, 'correct', 0.75, NULL, NULL),
  ('m1-fraction-add', 'B', '2/6', false, 2, 'fraction_denominator_add', 0.333, 'Added both numerators (1+1=2) AND denominators (2+4=6)', 'The fraction trap! You added the bottoms together. But fractions need a COMMON language first. What if both pizzas were cut into the same size pieces?'),
  ('m1-fraction-add', 'C', '1/6', false, 2, 'fraction_denominator_add', 0.167, 'Added 1+1=2 for numerator and 2+4=6 for denominator, then reduced incorrectly', 'I see you added across, but fractions dont work that way. Picture 1/2 of a pizza and 1/4 of a pizza - do you really have only 1/6?'),
  ('m1-fraction-add', 'D', '2/4', false, 2, 'partial_completion', 0.5, 'Only converted 1/2 to 2/4 but forgot to add', 'Youre on the right track converting to 2/4! Now dont forget the second step - add that 1/4!');

-- Tier 3: Subtle errors
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m1-fraction-add', 'A', '3/4', true, 3, 'correct', 0.75, NULL, NULL),
  ('m1-fraction-add', 'B', '2/6', false, 3, 'fraction_denominator_add', 0.333, 'Classic error: added numerators AND denominators separately', 'Ah, the famous fraction trap! Remember: denominators tell us the SIZE of pieces. If pieces are different sizes, we need to cut them the same way first.'),
  ('m1-fraction-add', 'C', '3/8', false, 3, 'fraction_no_common_denom', 0.375, 'Multiplied denominators (2×4=8) but just added numerators', 'Interesting approach! You found A common denominator (8), but forgot to adjust the numerators too. 1/2 = ?/8?'),
  ('m1-fraction-add', 'D', '5/4', false, 3, 'off_by_one', 1.25, 'Found common denominator but made arithmetic error: 2/4 + 1/4 = 5/4', 'So close! Check your addition: 2 + 1 = ?');

-- Pattern hints for this question
INSERT INTO pattern_hints (question_id, hint_level, hint_text, visualization) VALUES
  ('m1-fraction-add', 1, 'Before we can add, we need both fractions to have the same size pieces. What if we cut the 1/2 into fourths?', 'fraction_bar'),
  ('m1-fraction-add', 2, '1/2 is the same as 2/4. Now you have 2/4 + 1/4. How many fourths is that?', 'fraction_bar'),
  ('m1-fraction-add', 3, '2/4 + 1/4 = (2+1)/4. Add the numerators, keep the denominator!', NULL);

-- ============================================
-- QUESTION 2: Multiplication (9s Pattern)
-- ============================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, subject, math_expression, visualization_hint, answer_explanation)
VALUES ('m2-multiply-9', 'multiplication',
  'What is 9 × 7?',
  'fluency', 1, 'math', '9 \\times 7', 'array',
  'The beautiful pattern of 9s! 9×7=63, and notice: 6+3=9. The digits of 9s multiples always sum to 9!');

-- Tier 1
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m2-multiply-9', 'A', '63', true, 1, 'correct', 63, NULL, NULL),
  ('m2-multiply-9', 'B', '16', false, 1, 'wrong_operation', 16, 'Added instead of multiplied: 9+7=16', 'Check the symbol - this is multiplication, not addition!'),
  ('m2-multiply-9', 'C', '97', false, 1, 'reasonable_guess', 97, 'Just wrote the two numbers together', 'Multiplication gives us a different kind of answer - think about 9 groups of 7!'),
  ('m2-multiply-9', 'D', '2', false, 1, 'wrong_operation', 2, 'Subtracted: 9-7=2', 'Look at the symbol - we are multiplying here!');

-- Tier 2
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m2-multiply-9', 'A', '63', true, 2, 'correct', 63, NULL, NULL),
  ('m2-multiply-9', 'B', '54', false, 2, 'off_by_one', 54, 'Computed 9×6 instead of 9×7', 'Thats 9×6! Were looking for one more group of 9.'),
  ('m2-multiply-9', 'C', '72', false, 2, 'off_by_one', 72, 'Computed 9×8 instead of 9×7', 'Thats 9×8! We need one fewer group of 9.'),
  ('m2-multiply-9', 'D', '56', false, 2, 'pattern_misread', 56, 'Confused with 8×7=56', 'That is 8×7! The 9s have their own special pattern.');

-- Tier 3
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m2-multiply-9', 'A', '63', true, 3, 'correct', 63, NULL, NULL),
  ('m2-multiply-9', 'B', '54', false, 3, 'off_by_one', 54, 'Mixed up 9×6 and 9×7', 'So close! Heres a secret: for 9×7, the tens digit is one less than 7 (thats 6), and the digits sum to 9. So 6_... what plus 6 equals 9?'),
  ('m2-multiply-9', 'C', '67', false, 3, 'place_value_error', 67, 'Knew answer was in 60s but guessed wrong ones digit', 'Youre in the right neighborhood! Remember the magic of 9s: the digits always add up to 9. Does 6+7=9?'),
  ('m2-multiply-9', 'D', '45', false, 3, 'pattern_misread', 45, 'Confused with 9×5=45', 'Thats 9×5! Use the pattern: for 9×7, put 6 in tens place (one less than 7), then what makes the digits sum to 9?');

-- Pattern hints
INSERT INTO pattern_hints (question_id, hint_level, hint_text, visualization) VALUES
  ('m2-multiply-9', 1, 'The 9s have a magical pattern! Look: 9, 18, 27, 36, 45, 54, 63... What do you notice about the digits?', 'dot_pattern'),
  ('m2-multiply-9', 2, 'For 9×7: The tens digit is always one less than what youre multiplying by. 7-1=6, so it starts with 6_.', NULL),
  ('m2-multiply-9', 3, 'Its 6_. The digits must sum to 9. 6 + ? = 9. So the answer is 63!', NULL);

-- ============================================
-- QUESTION 3: Decimal Addition
-- ============================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, subject, math_expression, visualization_hint, answer_explanation)
VALUES ('m3-decimal-add', 'decimals',
  'What is 3.5 + 2.75?',
  'fluency', 2, 'math', '3.5 + 2.75', 'number_line',
  'Line up the decimal points! 3.50 + 2.75 = 6.25. Think of it as money: $3.50 + $2.75 = $6.25.');

-- Tier 1
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m3-decimal-add', 'A', '6.25', true, 1, 'correct', 6.25, NULL, NULL),
  ('m3-decimal-add', 'B', '35.275', false, 1, 'reasonable_guess', 35.275, 'Just pushed numbers together', 'We need to actually add, not just combine the digits!'),
  ('m3-decimal-add', 'C', '5', false, 1, 'reasonable_guess', 5, 'Rounded and guessed', 'Think more precisely - decimals give us exact answers between whole numbers.'),
  ('m3-decimal-add', 'D', '100', false, 1, 'reasonable_guess', 100, 'Wild guess', 'Lets work through this step by step - both numbers are small, so our answer should be too!');

-- Tier 2
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m3-decimal-add', 'A', '6.25', true, 2, 'correct', 6.25, NULL, NULL),
  ('m3-decimal-add', 'B', '5.80', false, 2, 'place_value_error', 5.80, 'Added 3+2=5 and 5+75=80, forgot to carry', 'Almost! But 5+75 isnt 80 - think about place value. Try lining up the decimal points!'),
  ('m3-decimal-add', 'C', '6.12', false, 2, 'place_value_error', 6.12, 'Didnt align decimals properly', 'Close! Make sure youre adding the same place values together. Line up those decimal points!'),
  ('m3-decimal-add', 'D', '5.125', false, 2, 'partial_completion', 5.125, 'Made multiple place value errors', 'Lets think of this as money: $3.50 + $2.75. Line up the decimals!');

-- Tier 3
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m3-decimal-add', 'A', '6.25', true, 3, 'correct', 6.25, NULL, NULL),
  ('m3-decimal-add', 'B', '6.15', false, 3, 'off_by_one', 6.15, 'Made carrying error: 50+75=115, wrote 15, carried 1, but then error in ones', 'So close! Check your carrying. 50+75=125, so we write 25 and carry 1.'),
  ('m3-decimal-add', 'C', '5.25', false, 3, 'off_by_one', 5.25, 'Forgot to add the carried 1', 'Check the ones place again. 3+2=5, plus we carried 1 from 50+75=125, so its 6!'),
  ('m3-decimal-add', 'D', '6.125', false, 3, 'place_value_error', 6.125, 'Added an extra decimal place incorrectly', 'Watch the place values! 3.50 has two decimal places just like 2.75. Line them up.');

-- Pattern hints
INSERT INTO pattern_hints (question_id, hint_level, hint_text, visualization) VALUES
  ('m3-decimal-add', 1, 'Decimals are like money! $3.50 + $2.75 = ?', 'number_line'),
  ('m3-decimal-add', 2, 'Write 3.50 (add the 0) so both have the same number of decimal places. Now add like normal!', NULL),
  ('m3-decimal-add', 3, '50+75=125, write 25 carry 1. 3+2+1=6. Answer: 6.25', NULL);

-- ============================================
-- QUESTION 4: Number Pattern (Discovery)
-- ============================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, subject, visualization_hint, answer_explanation)
VALUES ('m4-pattern', 'patterns',
  'What comes next? 2, 5, 8, 11, __',
  'concept', 2, 'math', 'dot_pattern',
  'The pattern adds 3 each time! 2+3=5, 5+3=8, 8+3=11, 11+3=14. This is called an arithmetic sequence.');

-- Tier 1
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m4-pattern', 'A', '14', true, 1, 'correct', 14, NULL, NULL),
  ('m4-pattern', 'B', '20', false, 1, 'reasonable_guess', 20, 'Random guess in plausible range', 'Lets look for the pattern! What do we add to get from 2 to 5?'),
  ('m4-pattern', 'C', '10', false, 1, 'reasonable_guess', 10, 'Guessed a round number', 'Check the pattern - count the jumps between numbers!'),
  ('m4-pattern', 'D', '22', false, 1, 'pattern_misread', 22, 'Doubled 11', 'Were not doubling here - look at the GAP between each pair of numbers.');

-- Tier 2
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m4-pattern', 'A', '14', true, 2, 'correct', 14, NULL, NULL),
  ('m4-pattern', 'B', '15', false, 2, 'off_by_one', 15, 'Found +3 pattern but added 4', 'You found the pattern! But check: 11 + 3 = ?'),
  ('m4-pattern', 'C', '13', false, 2, 'off_by_one', 13, 'Found +3 pattern but added 2', 'Almost! The gap is 3, not 2. 11 + 3 = ?'),
  ('m4-pattern', 'D', '17', false, 2, 'pattern_misread', 17, 'Saw pattern as +3, +3, +3, +6', 'The pattern stays the same each time! Its always +3, not changing.');

-- Tier 3
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m4-pattern', 'A', '14', true, 3, 'correct', 14, NULL, NULL),
  ('m4-pattern', 'B', '12', false, 3, 'pattern_misread', 12, 'Thought pattern increases: +3, +3, +3, then +1', 'The gap between numbers stays constant! 5-2=3, 8-5=3, 11-8=3, so next gap is also 3.'),
  ('m4-pattern', 'C', '16', false, 3, 'pattern_misread', 16, 'Thought pattern was +3, +3, +3, then +5', 'In an arithmetic sequence, the gap stays the SAME. Its +3 every time!'),
  ('m4-pattern', 'D', '13', false, 3, 'off_by_one', 13, 'Miscounted the gap as +2', 'Count carefully: 5-2=? Its 3, not 2. So 11+3=14.');

-- Pattern hints
INSERT INTO pattern_hints (question_id, hint_level, hint_text, visualization) VALUES
  ('m4-pattern', 1, 'Look at the GAPS between numbers, not the numbers themselves. What do you add each time?', 'dot_pattern'),
  ('m4-pattern', 2, '2 to 5 is +3. 5 to 8 is +3. 8 to 11 is +3. So 11 to __ is also...?', 'number_line'),
  ('m4-pattern', 3, 'Add 3 to 11!', NULL);

-- ============================================
-- QUESTION 5: Order of Operations
-- ============================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, subject, math_expression, answer_explanation)
VALUES ('m5-pemdas', 'order-of-operations',
  'What is 3 + 4 × 2?',
  'concept', 2, 'math', '3 + 4 \\times 2',
  'PEMDAS tells us to multiply before adding! 4×2=8, then 3+8=11. Not (3+4)×2=14.');

-- Tier 1
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m5-pemdas', 'A', '11', true, 1, 'correct', 11, NULL, NULL),
  ('m5-pemdas', 'B', '9', false, 1, 'reasonable_guess', 9, 'Random guess', 'Lets work through this step by step - there is a special ORDER to follow!'),
  ('m5-pemdas', 'C', '24', false, 1, 'wrong_operation', 24, 'Multiplied all three: 3×4×2', 'Check the operations - theres a + sign in there!'),
  ('m5-pemdas', 'D', '6', false, 1, 'wrong_operation', 6, 'Added instead of multiplying: 3+4+2', 'Look for the multiplication sign - it needs special attention!');

-- Tier 2
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m5-pemdas', 'A', '11', true, 2, 'correct', 11, NULL, NULL),
  ('m5-pemdas', 'B', '14', false, 2, 'order_of_operations', 14, 'Did left to right: (3+4)×2=14', 'Classic PEMDAS trap! Multiplication comes BEFORE addition, even though + appears first. Which operation should we do first?'),
  ('m5-pemdas', 'C', '10', false, 2, 'off_by_one', 10, 'Did multiplication first but made arithmetic error', 'Right order! But check: 4×2=8, then 3+8=?'),
  ('m5-pemdas', 'D', '12', false, 2, 'off_by_one', 12, 'Small arithmetic error', 'Good thinking on order! Just double-check: 4×2=8, and 3+8=?');

-- Tier 3
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m5-pemdas', 'A', '11', true, 3, 'correct', 11, NULL, NULL),
  ('m5-pemdas', 'B', '14', false, 3, 'order_of_operations', 14, 'Ignored PEMDAS, went left to right', 'Remember the math recipe! PEMDAS says M comes before A. Which operation is multiplication?'),
  ('m5-pemdas', 'C', '8', false, 3, 'partial_completion', 8, 'Only did 4×2, forgot to add 3', 'You did the multiplication first - great! But were not done. Theres still a +3 waiting.'),
  ('m5-pemdas', 'D', '13', false, 3, 'off_by_one', 13, 'Added 5 instead of 3 after multiplying', 'Check the original problem - its 3 + (4×2), not 5 + (4×2).');

-- Pattern hints
INSERT INTO pattern_hints (question_id, hint_level, hint_text, visualization) VALUES
  ('m5-pemdas', 1, 'PEMDAS is like a recipe - some steps MUST come before others. Which operation has priority: + or ×?', NULL),
  ('m5-pemdas', 2, 'Multiplication comes before addition! So do 4×2 first, THEN add 3.', NULL),
  ('m5-pemdas', 3, '4×2=8. Now add 3: 3+8=11.', NULL);

-- ============================================
-- QUESTION 6: Fraction of a Whole (Problem Solving)
-- ============================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, subject, visualization_hint, answer_explanation)
VALUES ('m6-fraction-word', 'fractions',
  'Maria has 24 stickers. She gives 1/4 of them to her friend. How many stickers does she give away?',
  'problem_solving', 2, 'math', 'fraction_bar',
  'To find 1/4 of 24, divide 24 by 4. 24÷4=6 stickers. Or think: 24 split into 4 equal groups = 6 in each group.');

-- Tier 1
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m6-fraction-word', 'A', '6 stickers', true, 1, 'correct', 6, NULL, NULL),
  ('m6-fraction-word', 'B', '1 sticker', false, 1, 'reasonable_guess', 1, 'Just saw the 1 in 1/4', 'The 1/4 tells us WHAT PART to find, not how many stickers!'),
  ('m6-fraction-word', 'C', '4 stickers', false, 1, 'reasonable_guess', 4, 'Saw the 4 in 1/4', 'The denominator (4) tells us how many GROUPS to split into, not the answer!'),
  ('m6-fraction-word', 'D', '24 stickers', false, 1, 'reasonable_guess', 24, 'Wrote the starting amount', 'She is giving away PART of her stickers, not all of them!');

-- Tier 2
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m6-fraction-word', 'A', '6 stickers', true, 2, 'correct', 6, NULL, NULL),
  ('m6-fraction-word', 'B', '18 stickers', false, 2, 'partial_completion', 18, 'Found how many she KEEPS (3/4) instead of gives away (1/4)', 'Thats how many she KEEPS! The question asks how many she GIVES AWAY (1/4).'),
  ('m6-fraction-word', 'C', '8 stickers', false, 2, 'wrong_operation', 8, 'Divided 24 by 3 instead of 4', 'Check the denominator - 1/4 means divide by 4, not 3!'),
  ('m6-fraction-word', 'D', '12 stickers', false, 2, 'pattern_misread', 12, 'Found 1/2 instead of 1/4', 'Were finding 1/4, not 1/2. 1/4 means divide into 4 groups!');

-- Tier 3
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m6-fraction-word', 'A', '6 stickers', true, 3, 'correct', 6, NULL, NULL),
  ('m6-fraction-word', 'B', '18 stickers', false, 3, 'partial_completion', 18, 'Calculated remaining stickers instead of given stickers', 'Read carefully: the question asks for what she GIVES AWAY. 24-6=18 is what she keeps!'),
  ('m6-fraction-word', 'C', '5 stickers', false, 3, 'off_by_one', 5, 'Division error: 24÷4=5', 'Check your division: 4×5=20, but we need 24. 4×6=?'),
  ('m6-fraction-word', 'D', '7 stickers', false, 3, 'off_by_one', 7, 'Division error: thought 24÷4=7', 'Double-check: 4×7=28, but we have 24 stickers. Try 24÷4 again!');

-- Pattern hints
INSERT INTO pattern_hints (question_id, hint_level, hint_text, visualization) VALUES
  ('m6-fraction-word', 1, 'Finding 1/4 of something means splitting it into 4 equal groups. How many in each group?', 'fraction_bar'),
  ('m6-fraction-word', 2, 'If you split 24 stickers into 4 equal piles, how many are in each pile?', 'array'),
  ('m6-fraction-word', 3, '24 ÷ 4 = 6 stickers in each group. One group = 1/4 of the total!', NULL);

-- ============================================
-- QUESTION 7: Multiplication Concept
-- ============================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, subject, visualization_hint, answer_explanation)
VALUES ('m7-mult-concept', 'multiplication',
  'Which expression equals 5 × 8?',
  'concept', 2, 'math', 'array',
  '5×8 means 5 groups of 8, which is 8+8+8+8+8. Multiplication is repeated addition!');

-- Tier 1
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m7-mult-concept', 'A', '8 + 8 + 8 + 8 + 8', true, 1, 'correct', 40, NULL, NULL),
  ('m7-mult-concept', 'B', '5 + 8', false, 1, 'wrong_operation', 13, 'Confused × with +', '5×8 is not 5+8! Multiplication means GROUPS, not just adding the two numbers.'),
  ('m7-mult-concept', 'C', '5 - 8', false, 1, 'wrong_operation', -3, 'Confused × with -', 'That is subtraction! × means multiplication, which is like repeated addition.'),
  ('m7-mult-concept', 'D', '58', false, 1, 'reasonable_guess', 58, 'Just combined the digits', 'We need to calculate, not just push the numbers together!');

-- Tier 2
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m7-mult-concept', 'A', '8 + 8 + 8 + 8 + 8', true, 2, 'correct', 40, NULL, NULL),
  ('m7-mult-concept', 'B', '5 + 5 + 5 + 5 + 5 + 5 + 5 + 5', false, 2, 'pattern_misread', 40, 'This equals 40 too, but represents 8×5 not 5×8', 'This is also 40! But its 8 groups of 5. We want 5 groups of 8. Both work though - discover why!'),
  ('m7-mult-concept', 'C', '5 + 5 + 5 + 5 + 5', false, 2, 'pattern_misread', 25, 'Represents 5×5', 'Thats five 5s, which is 5×5=25. We need five 8s!'),
  ('m7-mult-concept', 'D', '8 + 8 + 8 + 8', false, 2, 'off_by_one', 32, 'Only 4 eights, not 5', 'Count the 8s! We need 5 groups of 8.');

-- Tier 3
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m7-mult-concept', 'A', '8 + 8 + 8 + 8 + 8', true, 3, 'correct', 40, NULL, NULL),
  ('m7-mult-concept', 'B', '5 + 5 + 5 + 5 + 5 + 5 + 5 + 5', false, 3, 'pattern_misread', 40, 'Represents 8×5 which equals the same as 5×8', 'This is also 40! Youve discovered the commutative property: 5×8 = 8×5. Both answers are correct mathematically!'),
  ('m7-mult-concept', 'C', '8 × 8 × 8 × 8 × 8', false, 3, 'wrong_operation', 32768, 'Confused repeated addition with repeated multiplication', 'That is 8 to the 5th power - way bigger! 5×8 means ADD eight, five times, not multiply.'),
  ('m7-mult-concept', 'D', '8 + 8 + 8 + 8 + 8 + 8', false, 3, 'off_by_one', 48, 'Added one extra 8', 'Count the eights: we need exactly 5, but you have 6!');

-- Pattern hints
INSERT INTO pattern_hints (question_id, hint_level, hint_text, visualization) VALUES
  ('m7-mult-concept', 1, '5 × 8 means "5 groups of 8." If you add 8 five times, what do you get?', 'array'),
  ('m7-mult-concept', 2, 'Draw 5 circles, each containing 8 dots. Now write that as addition!', 'dot_pattern'),
  ('m7-mult-concept', 3, '8 + 8 + 8 + 8 + 8 = five eights = 5 × 8 = 40', NULL);

-- ============================================
-- QUESTION 8: Decimal Comparison (Concept)
-- ============================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, subject, visualization_hint, answer_explanation)
VALUES ('m8-decimal-compare', 'decimals',
  'Which is greater: 0.5 or 0.35?',
  'concept', 2, 'math', 'number_line',
  '0.5 = 0.50, which is greater than 0.35. Think of money: 50 cents is more than 35 cents!');

-- Tier 1
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m8-decimal-compare', 'A', '0.5', true, 1, 'correct', 0.5, NULL, NULL),
  ('m8-decimal-compare', 'B', '0.35', false, 1, 'pattern_misread', 0.35, 'Thought more digits means bigger number', 'More digits doesnt mean bigger! Think: would you rather have 50 cents or 35 cents?'),
  ('m8-decimal-compare', 'C', 'They are equal', false, 1, 'reasonable_guess', 0, 'Guessed equality', 'They are different amounts! Try thinking of them as money.'),
  ('m8-decimal-compare', 'D', 'Cannot compare', false, 1, 'reasonable_guess', 0, 'Unsure how to compare', 'We CAN compare decimals! Think: 50 cents vs 35 cents.');

-- Tier 2
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m8-decimal-compare', 'A', '0.5', true, 2, 'correct', 0.5, NULL, NULL),
  ('m8-decimal-compare', 'B', '0.35', false, 2, 'place_value_error', 0.35, 'Thought 35 > 5 so 0.35 > 0.5', 'The trap! 35 > 5 for whole numbers, but 0.35 < 0.50. Compare place by place!'),
  ('m8-decimal-compare', 'C', 'They are equal', false, 2, 'pattern_misread', 0, 'May have thought 0.5 = 0.05', '0.5 = 0.50, not 0.05! Line up decimal points to compare.'),
  ('m8-decimal-compare', 'D', '0.35 because it has more digits', false, 2, 'place_value_error', 0.35, 'Explicitly confused by digit count', 'More digits ≠ bigger number in decimals! Add a zero: 0.5 = 0.50. Now which is bigger?');

-- Tier 3
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, numeric_value, error_description, pythagoras_guidance) VALUES
  ('m8-decimal-compare', 'A', '0.5', true, 3, 'correct', 0.5, NULL, NULL),
  ('m8-decimal-compare', 'B', '0.35', false, 3, 'place_value_error', 0.35, 'Whole number thinking applied to decimals', 'This is the classic decimal trap! 0.5 means 5 tenths, and 0.35 means 35 hundredths. 50 hundredths > 35 hundredths.'),
  ('m8-decimal-compare', 'C', 'They are the same when rounded', false, 3, 'partial_completion', 0, 'True for rounding to ones, but not precise comparison', 'The question asks which is GREATER, not about rounding. Precisely, 0.50 > 0.35.'),
  ('m8-decimal-compare', 'D', '0.35 because tenths < hundredths', false, 3, 'place_value_error', 0.35, 'Confused place value relationships', 'Actually, tenths are BIGGER than hundredths! One tenth = ten hundredths. So 5 tenths = 50 hundredths > 35 hundredths.');

-- Pattern hints
INSERT INTO pattern_hints (question_id, hint_level, hint_text, visualization) VALUES
  ('m8-decimal-compare', 1, 'Think of these as money! 0.5 is like 50 cents. What is 0.35 in cents?', NULL),
  ('m8-decimal-compare', 2, 'Rewrite 0.5 as 0.50. Now compare 0.50 and 0.35 - which has more?', 'number_line'),
  ('m8-decimal-compare', 3, '50 cents > 35 cents, so 0.50 > 0.35. More digits does NOT mean bigger!', NULL);
