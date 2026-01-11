-- Seed data for Virtual Socratic University
-- 5th Grade American History content

-- ============================================
-- TOPICS
-- ============================================

INSERT INTO topics (id, name, slug, description, grade_level, subject, display_order) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'The Age of Exploration', 'age-of-exploration', 'Learn about the brave explorers who discovered new worlds', 5, 'US History', 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'The American Revolution', 'american-revolution', 'Discover how America fought for independence', 5, 'US History', 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'The Acts', 'the-acts', 'Understand the laws that sparked a revolution', 5, 'US History', 3);

-- ============================================
-- QUESTIONS - Age of Exploration
-- ============================================

-- Question 1: Columbus Discovery (Knowledge, Tier 1)
INSERT INTO questions (id, topic_id, question_text, question_type, difficulty_tier, cognitive_verb, question_stem, correct_answer, answer_explanation) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
     'Which explorer is credited with discovering America in 1492?',
     'knowledge', 1, 'identify', 'which',
     'Christopher Columbus',
     'Christopher Columbus, sailing for Spain, reached the Americas on October 12, 1492. Although Vikings had reached North America earlier, Columbus''s voyage opened the way for European exploration and colonization.');

INSERT INTO answer_options (question_id, option_text, option_label, is_correct, distractor_type, confusion_explanation, display_order) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Christopher Columbus', 'A', TRUE, NULL, NULL, 1),
    ('660e8400-e29b-41d4-a716-446655440001', 'Amerigo Vespucci', 'B', FALSE, 'common_confusion', 'Vespucci came later and America is named after him, but Columbus arrived first.', 2),
    ('660e8400-e29b-41d4-a716-446655440001', 'Ferdinand Magellan', 'C', FALSE, 'same_era', 'Magellan is famous for circumnavigation, not discovering America.', 3),
    ('660e8400-e29b-41d4-a716-446655440001', 'John Cabot', 'D', FALSE, 'different_nation', 'Cabot explored for England in 1497, after Columbus.', 4);

INSERT INTO mnemonics (question_id, mnemonic_text, mnemonic_type) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Columbus sailed the ocean blue in fourteen hundred ninety-two!', 'rhyme');

-- Question 2: Columbus Sponsor (Knowledge, Tier 1)
INSERT INTO questions (id, topic_id, question_text, question_type, difficulty_tier, cognitive_verb, question_stem, correct_answer, answer_explanation) VALUES
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
     'Which country sponsored Christopher Columbus''s voyage to the Americas?',
     'knowledge', 1, 'identify', 'which',
     'Spain',
     'Queen Isabella and King Ferdinand of Spain funded Columbus''s expedition after Portugal turned him down.');

INSERT INTO answer_options (question_id, option_text, option_label, is_correct, distractor_type, confusion_explanation, display_order) VALUES
    ('660e8400-e29b-41d4-a716-446655440002', 'Portugal', 'A', FALSE, 'near_miss', 'Portugal rejected Columbus; he then went to Spain.', 1),
    ('660e8400-e29b-41d4-a716-446655440002', 'England', 'B', FALSE, 'competing_nation', 'England sponsored John Cabot, not Columbus.', 2),
    ('660e8400-e29b-41d4-a716-446655440002', 'Spain', 'C', TRUE, NULL, NULL, 3),
    ('660e8400-e29b-41d4-a716-446655440002', 'France', 'D', FALSE, 'competing_nation', 'France sponsored Jacques Cartier, not Columbus.', 4);

INSERT INTO mnemonics (question_id, mnemonic_text, mnemonic_type) VALUES
    ('660e8400-e29b-41d4-a716-446655440002', 'Spain starts with S like Sponsored - Spain Sponsored Columbus!', 'association');

-- Question 3: Why Columbus Sailed West (Wisdom, Tier 2)
INSERT INTO questions (id, topic_id, question_text, question_type, difficulty_tier, cognitive_verb, question_stem, correct_answer, answer_explanation) VALUES
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001',
     'Why did Columbus sail west instead of east to reach Asia?',
     'wisdom', 2, 'explain', 'why',
     'He believed sailing west on a round Earth would be a shorter route',
     'Columbus believed the Earth was round (which educated people of his time knew) and calculated that sailing west would be a shorter route to Asia than going east around Africa. His math was wrong - he thought the Earth was much smaller than it actually is.');

INSERT INTO answer_options (question_id, option_text, option_label, is_correct, distractor_type, confusion_explanation, display_order) VALUES
    ('660e8400-e29b-41d4-a716-446655440003', 'He believed sailing west on a round Earth would be shorter', 'A', TRUE, NULL, NULL, 1),
    ('660e8400-e29b-41d4-a716-446655440003', 'The eastern route was blocked by enemy ships', 'B', FALSE, 'plausible_but_wrong', 'The sea route east was not blocked - it was just very long.', 2),
    ('660e8400-e29b-41d4-a716-446655440003', 'He was trying to discover new lands', 'C', FALSE, 'anachronism', 'Columbus genuinely wanted to reach Asia; finding America was accidental.', 3),
    ('660e8400-e29b-41d4-a716-446655440003', 'Spain ordered him to sail west', 'D', FALSE, 'partial_truth', 'Columbus proposed the route; Spain did not order the direction.', 4);

INSERT INTO socratic_hints (question_id, hint_level, hint_text) VALUES
    ('660e8400-e29b-41d4-a716-446655440003', 1, 'Think about what Columbus knew about the shape of the Earth.'),
    ('660e8400-e29b-41d4-a716-446655440003', 2, 'If you''re trying to get somewhere on the other side of a ball, are there different ways to get there?'),
    ('660e8400-e29b-41d4-a716-446655440003', 3, 'If Asia is in the east, and you keep going west on a round Earth, where would you eventually end up?');

-- ============================================
-- QUESTIONS - The Acts
-- ============================================

-- Question 4: Stamp Act (Knowledge, Tier 1)
INSERT INTO questions (id, topic_id, question_text, question_type, difficulty_tier, cognitive_verb, question_stem, correct_answer, answer_explanation) VALUES
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003',
     'Which act required colonists to buy special stamped paper for legal documents?',
     'knowledge', 1, 'identify', 'which',
     'The Stamp Act',
     'The Stamp Act of 1765 required colonists to pay a tax on printed materials by buying special stamped paper. This affected newspapers, legal documents, and even playing cards.');

INSERT INTO answer_options (question_id, option_text, option_label, is_correct, distractor_type, confusion_explanation, display_order) VALUES
    ('660e8400-e29b-41d4-a716-446655440004', 'The Tea Act', 'A', FALSE, 'common_confusion', 'The Tea Act was about tea, not paper. Easy to confuse different Acts.', 1),
    ('660e8400-e29b-41d4-a716-446655440004', 'The Stamp Act', 'B', TRUE, NULL, NULL, 2),
    ('660e8400-e29b-41d4-a716-446655440004', 'The Quartering Act', 'C', FALSE, 'different_purpose', 'The Quartering Act was about housing soldiers, not taxing paper.', 3),
    ('660e8400-e29b-41d4-a716-446655440004', 'The Sugar Act', 'D', FALSE, 'different_goods', 'The Sugar Act taxed sugar and molasses, not paper.', 4);

INSERT INTO mnemonics (question_id, mnemonic_text, mnemonic_type) VALUES
    ('660e8400-e29b-41d4-a716-446655440004', 'STAMP it on PAPER - The Stamp Act taxed paper!', 'association');

-- Question 5: Boston Tea Party (Knowledge, Tier 1)
INSERT INTO questions (id, topic_id, question_text, question_type, difficulty_tier, cognitive_verb, question_stem, correct_answer, answer_explanation) VALUES
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003',
     'What event was a direct response to the Tea Act of 1773?',
     'knowledge', 1, 'identify', 'what',
     'The Boston Tea Party',
     'The Boston Tea Party (December 1773) was a protest against the Tea Act. Colonists dressed as Native Americans boarded ships and dumped tea into Boston Harbor.');

INSERT INTO answer_options (question_id, option_text, option_label, is_correct, distractor_type, confusion_explanation, display_order) VALUES
    ('660e8400-e29b-41d4-a716-446655440005', 'The Boston Massacre', 'A', FALSE, 'wrong_sequence', 'The Boston Massacre happened in 1770, before the Tea Act.', 1),
    ('660e8400-e29b-41d4-a716-446655440005', 'The Boston Tea Party', 'B', TRUE, NULL, NULL, 2),
    ('660e8400-e29b-41d4-a716-446655440005', 'The signing of the Declaration of Independence', 'C', FALSE, 'later_event', 'The Declaration came in 1776, several years after.', 3),
    ('660e8400-e29b-41d4-a716-446655440005', 'The Battle of Lexington', 'D', FALSE, 'later_event', 'Lexington and Concord came in 1775, after the Tea Party.', 4);

INSERT INTO mnemonics (question_id, mnemonic_text, mnemonic_type) VALUES
    ('660e8400-e29b-41d4-a716-446655440005', 'TEA Act led to TEA Party - tea connects them!', 'association');

-- Question 6: Why Tea Act Angered (Wisdom, Tier 3)
INSERT INTO questions (id, topic_id, question_text, question_type, difficulty_tier, cognitive_verb, question_stem, correct_answer, answer_explanation) VALUES
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003',
     'Why did the Tea Act make colonists angry even though it actually lowered the price of tea?',
     'wisdom', 3, 'analyze', 'why',
     'It still included a tax decided without colonial representation',
     'Even though the Tea Act made tea cheaper, colonists were angry because accepting the cheap tea meant accepting Parliament''s right to tax them without representation. The issue was not the money - it was the principle.');

INSERT INTO answer_options (question_id, option_text, option_label, is_correct, distractor_type, confusion_explanation, display_order) VALUES
    ('660e8400-e29b-41d4-a716-446655440006', 'Colonists did not like tea', 'A', FALSE, 'silly_distractor', 'Tea was actually very popular in the colonies.', 1),
    ('660e8400-e29b-41d4-a716-446655440006', 'The cheaper tea would put colonial merchants out of business', 'B', FALSE, 'partial_truth', 'This was a concern, but the main issue was the principle of taxation.', 2),
    ('660e8400-e29b-41d4-a716-446655440006', 'It still included a tax decided without colonial representation', 'C', TRUE, NULL, NULL, 3),
    ('660e8400-e29b-41d4-a716-446655440006', 'The tea tasted bad', 'D', FALSE, 'silly_distractor', 'The quality of tea was not the issue - it was about principle.', 4);

INSERT INTO socratic_hints (question_id, hint_level, hint_text) VALUES
    ('660e8400-e29b-41d4-a716-446655440006', 1, 'Think about what the colonists had been protesting for years. Was it about the amount of money, or something else?'),
    ('660e8400-e29b-41d4-a716-446655440006', 2, 'If you accept a gift that comes with unfair conditions, what message does that send?'),
    ('660e8400-e29b-41d4-a716-446655440006', 3, 'If colonists bought the cheap tea, they would be paying a tax they never agreed to. What were they really protesting - the price or the principle?');

-- ============================================
-- QUESTIONS - American Revolution
-- ============================================

-- Question 7: No Taxation (Wisdom, Tier 2)
INSERT INTO questions (id, topic_id, question_text, question_type, difficulty_tier, cognitive_verb, question_stem, correct_answer, answer_explanation) VALUES
    ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002',
     'What was the main idea behind "no taxation without representation"?',
     'wisdom', 2, 'explain', 'what',
     'Colonists should have a voice in decisions about taxes that affect them',
     'The colonists believed that if they had to pay taxes, they should have elected representatives in Parliament who could vote on those taxes. Since they had no representatives, they felt the taxes were unfair.');

INSERT INTO answer_options (question_id, option_text, option_label, is_correct, distractor_type, confusion_explanation, display_order) VALUES
    ('660e8400-e29b-41d4-a716-446655440007', 'Colonists should not pay any taxes at all', 'A', FALSE, 'oversimplification', 'Colonists were not against all taxes - they objected to taxes imposed without their voice.', 1),
    ('660e8400-e29b-41d4-a716-446655440007', 'Only representatives should pay taxes', 'B', FALSE, 'misinterpretation', 'This misunderstands the phrase - it is about having representatives who vote on taxes.', 2),
    ('660e8400-e29b-41d4-a716-446655440007', 'Colonists should have a voice in decisions about taxes that affect them', 'C', TRUE, NULL, NULL, 3),
    ('660e8400-e29b-41d4-a716-446655440007', 'Britain should represent the colonies in all matters', 'D', FALSE, 'opposite', 'This is the opposite - colonists wanted their OWN representatives.', 4);

INSERT INTO socratic_hints (question_id, hint_level, hint_text) VALUES
    ('660e8400-e29b-41d4-a716-446655440007', 1, 'Think about what representation means. Who represents you in your school or community?'),
    ('660e8400-e29b-41d4-a716-446655440007', 2, 'Imagine if someone made rules about your allowance without asking you. How would that feel?'),
    ('660e8400-e29b-41d4-a716-446655440007', 3, 'British Parliament made tax laws for the colonies. Did the colonists get to vote for members of Parliament?');

-- Question 8: Declaration Author (Knowledge, Tier 1)
INSERT INTO questions (id, topic_id, question_text, question_type, difficulty_tier, cognitive_verb, question_stem, correct_answer, answer_explanation) VALUES
    ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002',
     'Who was the primary author of the Declaration of Independence?',
     'knowledge', 1, 'identify', 'who',
     'Thomas Jefferson',
     'Thomas Jefferson wrote the Declaration of Independence in 1776. He was chosen by the Continental Congress because of his excellent writing skills.');

INSERT INTO answer_options (question_id, option_text, option_label, is_correct, distractor_type, confusion_explanation, display_order) VALUES
    ('660e8400-e29b-41d4-a716-446655440008', 'George Washington', 'A', FALSE, 'common_confusion', 'Washington was a military leader, not the author of the Declaration.', 1),
    ('660e8400-e29b-41d4-a716-446655440008', 'Benjamin Franklin', 'B', FALSE, 'same_committee', 'Franklin helped edit it but Jefferson was the primary author.', 2),
    ('660e8400-e29b-41d4-a716-446655440008', 'Thomas Jefferson', 'C', TRUE, NULL, NULL, 3),
    ('660e8400-e29b-41d4-a716-446655440008', 'John Adams', 'D', FALSE, 'same_committee', 'Adams was on the committee but asked Jefferson to write it.', 4);

INSERT INTO mnemonics (question_id, mnemonic_text, mnemonic_type) VALUES
    ('660e8400-e29b-41d4-a716-446655440008', 'Jefferson wrote the declaration like a JOURNALIST writes a story - both start with J!', 'association');
