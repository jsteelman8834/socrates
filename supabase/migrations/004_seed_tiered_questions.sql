-- Seed: Comprehensive Question Bank with Tiered Distractors
-- Strategy: Same question text, different distractor sets per tier

-- Clear existing data for fresh seed
TRUNCATE TABLE answer_options CASCADE;
TRUNCATE TABLE questions CASCADE;
TRUNCATE TABLE topics CASCADE;

-- Create Topics
INSERT INTO topics (id, name, description, grade_level, icon) VALUES
  ('age-of-exploration', 'Age of Exploration', 'Discover how brave explorers sailed across oceans to find new lands', 5, '🧭'),
  ('colonial-america', 'Colonial America', 'Learn about the founding of the American colonies', 5, '🏛️'),
  ('road-to-revolution', 'Road to Revolution', 'Understand the events that led to American independence', 5, '📜'),
  ('the-acts', 'The Acts', 'Study the British laws that sparked colonial resistance', 5, '⚖️');

-- ============================================================================
-- QUESTION 1: Common Sense Author
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q1-common-sense', 'road-to-revolution',
  'Who wrote "Common Sense" and was a radical liberal friend of Benjamin Franklin?',
  'knowledge', 2, 'Thomas Paine text block');

-- Tier 1 (Easy): Wrong era/category distractors
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q1-common-sense', 'A', 'Thomas Paine', true, 1, 'correct', NULL),
  ('q1-common-sense', 'B', 'Abraham Lincoln', false, 1, 'wrong_era', 'Lincoln was from the Civil War era, nearly 100 years later.'),
  ('q1-common-sense', 'C', 'Martin Luther King Jr.', false, 1, 'wrong_era', 'MLK was a 20th century civil rights leader.'),
  ('q1-common-sense', 'D', 'George Washington', false, 1, 'wrong_category', 'Washington was a military leader and president, not a political writer.');

-- Tier 2 (Medium): Same category - all Revolutionary era figures
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q1-common-sense', 'A', 'Thomas Paine', true, 2, 'correct', NULL),
  ('q1-common-sense', 'B', 'Patrick Henry', false, 2, 'same_category', 'Patrick Henry was famous for speeches ("Give me liberty"), not pamphlets.'),
  ('q1-common-sense', 'C', 'John Adams', false, 2, 'same_category', 'Adams was a Founding Father but wrote legal/political documents, not Common Sense.'),
  ('q1-common-sense', 'D', 'George Washington', false, 2, 'same_category', 'Washington was the military commander, not a political pamphleteer.');

-- Tier 3 (Hard): Near-misses and traps
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q1-common-sense', 'A', 'Thomas Paine', true, 3, 'correct', NULL),
  ('q1-common-sense', 'B', 'John Dickinson', false, 3, 'near_miss', 'Dickinson wrote "Letters from a Pennsylvania Farmer" - similar genre, different work.'),
  ('q1-common-sense', 'C', 'Benjamin Franklin', false, 3, 'trap', 'TRAP: Franklin was Paine''s friend and helped him, but didn''t write Common Sense.'),
  ('q1-common-sense', 'D', 'Samuel Adams', false, 3, 'near_miss', 'Adams was a radical like Paine but focused on organizing, not pamphleteering.');

-- ============================================================================
-- QUESTION 2: Pennsylvania Founders
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q2-pennsylvania', 'colonial-america',
  'Which religious group founded Pennsylvania?',
  'knowledge', 2, 'Settlement Timeline');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q2-pennsylvania', 'A', 'The Quakers', true, 1, 'correct', NULL),
  ('q2-pennsylvania', 'B', 'The Buddhists', false, 1, 'wrong_category', 'Buddhism is an Asian religion not present in colonial America.'),
  ('q2-pennsylvania', 'C', 'The Muslims', false, 1, 'wrong_category', 'Islam was not a founding religion of any American colony.'),
  ('q2-pennsylvania', 'D', 'The Hindus', false, 1, 'wrong_category', 'Hinduism is an Asian religion not present in colonial America.');

-- Tier 2 (Medium): All colonial-era Christian groups
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q2-pennsylvania', 'A', 'The Quakers', true, 2, 'correct', NULL),
  ('q2-pennsylvania', 'B', 'The Puritans', false, 2, 'same_category', 'Puritans founded Massachusetts, not Pennsylvania.'),
  ('q2-pennsylvania', 'C', 'The Catholics', false, 2, 'same_category', 'Catholics founded Maryland under Lord Baltimore.'),
  ('q2-pennsylvania', 'D', 'The Anglicans', false, 2, 'same_category', 'Anglicans (Church of England) were in Virginia, the official British church.');

-- Tier 3 (Hard): Near-misses with pacifist/dissenter groups
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q2-pennsylvania', 'A', 'The Quakers', true, 3, 'correct', NULL),
  ('q2-pennsylvania', 'B', 'The Pilgrims', false, 3, 'near_miss', 'Pilgrims were separatists like Quakers but founded Plymouth, not PA.'),
  ('q2-pennsylvania', 'C', 'The Mennonites', false, 3, 'trap', 'TRAP: Mennonites did settle in PA but didn''t found it - William Penn (a Quaker) did.'),
  ('q2-pennsylvania', 'D', 'The Baptists', false, 3, 'near_miss', 'Baptists were dissenters but associated with Rhode Island (Roger Williams).');

-- ============================================================================
-- QUESTION 3: Cape of Good Hope
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q3-cape', 'age-of-exploration',
  'Who was the first European to sail around the southern tip of Africa (Cape of Good Hope)?',
  'knowledge', 2, 'Bartolomeu Dias text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q3-cape', 'A', 'Bartolomeu Dias', true, 1, 'correct', NULL),
  ('q3-cape', 'B', 'Neil Armstrong', false, 1, 'wrong_era', 'Armstrong was an astronaut in the 1960s, not an explorer.'),
  ('q3-cape', 'C', 'Lewis and Clark', false, 1, 'wrong_era', 'Lewis and Clark explored North America in the 1800s.'),
  ('q3-cape', 'D', 'Captain Cook', false, 1, 'wrong_era', 'Cook explored the Pacific in the 1770s, much later.');

-- Tier 2 (Medium): All Age of Exploration figures
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q3-cape', 'A', 'Bartolomeu Dias', true, 2, 'correct', NULL),
  ('q3-cape', 'B', 'Christopher Columbus', false, 2, 'same_category', 'Columbus sailed west to the Americas, not around Africa.'),
  ('q3-cape', 'C', 'Marco Polo', false, 2, 'same_category', 'Marco Polo traveled overland to Asia, not by sea.'),
  ('q3-cape', 'D', 'Leif Erikson', false, 2, 'same_category', 'Erikson was a Viking who reached North America around 1000 AD.');

-- Tier 3 (Hard): Portuguese explorers near-misses
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q3-cape', 'A', 'Bartolomeu Dias', true, 3, 'correct', NULL),
  ('q3-cape', 'B', 'Vasco da Gama', false, 3, 'trap', 'TRAP: Da Gama went AROUND Africa to India, but Dias discovered the route first.'),
  ('q3-cape', 'C', 'Prince Henry the Navigator', false, 3, 'near_miss', 'Henry sponsored Portuguese exploration but never sailed himself.'),
  ('q3-cape', 'D', 'Ferdinand Magellan', false, 3, 'near_miss', 'Magellan circumnavigated the globe but went around South America, not Africa.');

-- ============================================================================
-- QUESTION 4: Quartering Act
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q4-quartering', 'the-acts',
  'Which Act required colonists to provide housing and food for British soldiers?',
  'knowledge', 2, 'The Quartering Act text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q4-quartering', 'A', 'The Quartering Act', true, 1, 'correct', NULL),
  ('q4-quartering', 'B', 'The Emancipation Proclamation', false, 1, 'wrong_era', 'This was Lincoln''s Civil War document freeing slaves.'),
  ('q4-quartering', 'C', 'The Bill of Rights', false, 1, 'wrong_category', 'This protects citizen rights, doesn''t impose duties.'),
  ('q4-quartering', 'D', 'The Constitution', false, 1, 'wrong_category', 'This established the US government after independence.');

-- Tier 2 (Medium): All colonial-era British Acts
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q4-quartering', 'A', 'The Quartering Act', true, 2, 'correct', NULL),
  ('q4-quartering', 'B', 'The Stamp Act', false, 2, 'same_category', 'The Stamp Act taxed paper goods, not housing.'),
  ('q4-quartering', 'C', 'The Sugar Act', false, 2, 'same_category', 'The Sugar Act taxed molasses and sugar imports.'),
  ('q4-quartering', 'D', 'The Tea Act', false, 2, 'same_category', 'The Tea Act gave the East India Company a tea monopoly.');

-- Tier 3 (Hard): Intolerable Acts confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q4-quartering', 'A', 'The Quartering Act', true, 3, 'correct', NULL),
  ('q4-quartering', 'B', 'The Intolerable Acts', false, 3, 'trap', 'TRAP: The Quartering Act WAS part of the Intolerable Acts, but this is the specific name.'),
  ('q4-quartering', 'C', 'The Boston Port Act', false, 3, 'near_miss', 'This closed Boston Harbor - also an Intolerable Act but different purpose.'),
  ('q4-quartering', 'D', 'The Townshend Acts', false, 3, 'near_miss', 'These were earlier taxes on imports, not housing requirements.');

-- ============================================================================
-- QUESTION 5: Georgia Founder
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q5-georgia', 'colonial-america',
  'Who founded the colony of Georgia as a place for debtors?',
  'knowledge', 2, 'Settlement Timeline');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q5-georgia', 'A', 'James Oglethorpe', true, 1, 'correct', NULL),
  ('q5-georgia', 'B', 'George Washington', false, 1, 'wrong_category', 'Washington was a military leader, not a colonial founder.'),
  ('q5-georgia', 'C', 'King George III', false, 1, 'wrong_category', 'The King ruled Britain but didn''t personally found colonies.'),
  ('q5-georgia', 'D', 'Benjamin Franklin', false, 1, 'wrong_category', 'Franklin was a statesman in Pennsylvania, not Georgia.');

-- Tier 2 (Medium): All colonial founders
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q5-georgia', 'A', 'James Oglethorpe', true, 2, 'correct', NULL),
  ('q5-georgia', 'B', 'William Penn', false, 2, 'same_category', 'Penn founded Pennsylvania for Quakers, not debtors.'),
  ('q5-georgia', 'C', 'Roger Williams', false, 2, 'same_category', 'Williams founded Rhode Island for religious freedom.'),
  ('q5-georgia', 'D', 'Lord Baltimore', false, 2, 'same_category', 'Baltimore founded Maryland for Catholics.');

-- Tier 3 (Hard): Southern colony confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q5-georgia', 'A', 'James Oglethorpe', true, 3, 'correct', NULL),
  ('q5-georgia', 'B', 'John Smith', false, 3, 'near_miss', 'Smith helped save Jamestown (Virginia), not Georgia.'),
  ('q5-georgia', 'C', 'Lord Proprietors', false, 3, 'trap', 'TRAP: The Lords Proprietors founded the Carolinas, which Georgia split from.'),
  ('q5-georgia', 'D', 'King George II', false, 3, 'trap', 'TRAP: Georgia was NAMED after King George, but Oglethorpe actually founded it.');

-- ============================================================================
-- QUESTION 6: Albany Plan of Union
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q6-albany', 'road-to-revolution',
  'What was the main purpose of the "Albany Plan of Union"?',
  'wisdom', 2, 'The Albany Plan of Union text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q6-albany', 'A', 'To create a central government and army for the colonies.', true, 1, 'correct', NULL),
  ('q6-albany', 'B', 'To send astronauts to the moon.', false, 1, 'wrong_era', 'Space exploration happened 200 years later.'),
  ('q6-albany', 'C', 'To build railroads across America.', false, 1, 'wrong_era', 'Railroads came in the 1800s.'),
  ('q6-albany', 'D', 'To free the slaves.', false, 1, 'wrong_era', 'Abolition movements came much later.');

-- Tier 2 (Medium): All plausible colonial-era purposes
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q6-albany', 'A', 'To create a central government and army for the colonies.', true, 2, 'correct', NULL),
  ('q6-albany', 'B', 'To declare independence from Britain.', false, 2, 'same_category', 'Independence came 20+ years later - the Plan was about colonial unity, not separation.'),
  ('q6-albany', 'C', 'To create a peace treaty with France.', false, 2, 'same_category', 'The Plan was about defense AGAINST France, not peace with them.'),
  ('q6-albany', 'D', 'To ban slavery in the North.', false, 2, 'same_category', 'Slavery wasn''t the focus - colonial defense was.');

-- Tier 3 (Hard): Nuanced colonial politics
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q6-albany', 'A', 'To create a central government and army for the colonies.', true, 3, 'correct', NULL),
  ('q6-albany', 'B', 'To protest the Stamp Act.', false, 3, 'trap', 'TRAP: The Stamp Act Congress was DIFFERENT - Albany Plan was 1754, Stamp Act was 1765.'),
  ('q6-albany', 'C', 'To negotiate with the Iroquois Confederacy.', false, 3, 'near_miss', 'The meeting DID involve Iroquois diplomacy, but the PLAN was about colonial union.'),
  ('q6-albany', 'D', 'To establish trade routes with Spain.', false, 3, 'same_category', 'Spain wasn''t the focus - France and defense were.');

-- ============================================================================
-- QUESTION 7: Boston Massacre Defense
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q7-massacre-defense', 'road-to-revolution',
  'Who defended the British soldiers in court after the Boston Massacre?',
  'knowledge', 2, 'John Adams text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q7-massacre-defense', 'A', 'John Adams', true, 1, 'correct', NULL),
  ('q7-massacre-defense', 'B', 'Abraham Lincoln', false, 1, 'wrong_era', 'Lincoln was a 19th century president.'),
  ('q7-massacre-defense', 'C', 'Martin Luther King Jr.', false, 1, 'wrong_era', 'MLK was a 20th century civil rights leader.'),
  ('q7-massacre-defense', 'D', 'Alexander Hamilton', false, 1, 'wrong_era', 'Hamilton was too young during the Massacre and not a lawyer yet.');

-- Tier 2 (Medium): All Revolutionary figures
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q7-massacre-defense', 'A', 'John Adams', true, 2, 'correct', NULL),
  ('q7-massacre-defense', 'B', 'Samuel Adams', false, 2, 'same_category', 'Samuel was John''s cousin but was an agitator, not a lawyer.'),
  ('q7-massacre-defense', 'C', 'Paul Revere', false, 2, 'same_category', 'Revere was a silversmith and messenger, not a lawyer.'),
  ('q7-massacre-defense', 'D', 'Thomas Jefferson', false, 2, 'same_category', 'Jefferson was in Virginia, not involved in the Boston trial.');

-- Tier 3 (Hard): Adams family confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q7-massacre-defense', 'A', 'John Adams', true, 3, 'correct', NULL),
  ('q7-massacre-defense', 'B', 'Samuel Adams', false, 3, 'trap', 'TRAP: Samuel Adams WANTED the soldiers convicted - John defended them for fair trial principles.'),
  ('q7-massacre-defense', 'C', 'Josiah Quincy II', false, 3, 'near_miss', 'Quincy WAS co-counsel with Adams, but Adams is the famous one.'),
  ('q7-massacre-defense', 'D', 'John Hancock', false, 3, 'near_miss', 'Hancock was a wealthy patriot merchant, not involved in the defense.');

-- ============================================================================
-- QUESTION 8: Protestant Reformation
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q8-reformation', 'colonial-america',
  'Which German monk started the Protestant Reformation?',
  'knowledge', 2, 'Martin Luther text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q8-reformation', 'A', 'Martin Luther', true, 1, 'correct', NULL),
  ('q8-reformation', 'B', 'Martin Luther King Jr.', false, 1, 'wrong_era', 'MLK was named AFTER Luther but lived 400 years later.'),
  ('q8-reformation', 'C', 'The Buddha', false, 1, 'wrong_category', 'Buddha founded Buddhism thousands of years earlier in Asia.'),
  ('q8-reformation', 'D', 'George Washington', false, 1, 'wrong_category', 'Washington was a military/political leader, not religious.');

-- Tier 2 (Medium): All Reformation-era figures
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q8-reformation', 'A', 'Martin Luther', true, 2, 'correct', NULL),
  ('q8-reformation', 'B', 'John Calvin', false, 2, 'same_category', 'Calvin was a Reformer but came after Luther and was French/Swiss.'),
  ('q8-reformation', 'C', 'King Henry VIII', false, 2, 'same_category', 'Henry started the Church of England for personal reasons, not theological reform.'),
  ('q8-reformation', 'D', 'Pope Leo X', false, 2, 'same_category', 'Leo X was the Pope Luther protested AGAINST.');

-- Tier 3 (Hard): Theological nuances
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q8-reformation', 'A', 'Martin Luther', true, 3, 'correct', NULL),
  ('q8-reformation', 'B', 'John Calvin', false, 3, 'trap', 'TRAP: Calvin was hugely influential but Luther STARTED the Reformation in 1517.'),
  ('q8-reformation', 'C', 'John Wycliffe', false, 3, 'near_miss', 'Wycliffe was a "proto-Protestant" 100 years earlier but not the Reformation starter.'),
  ('q8-reformation', 'D', 'Huldrych Zwingli', false, 3, 'near_miss', 'Zwingli led Swiss Reformation but Luther in Germany came first.');

-- ============================================================================
-- QUESTION 9: Proclamation Line
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q9-proclamation', 'the-acts',
  'What did the "Proclamation Line of 1763" forbid colonists from doing?',
  'knowledge', 2, 'Proclamation of 1763 text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q9-proclamation', 'A', 'Settling west of the Appalachian Mountains.', true, 1, 'correct', NULL),
  ('q9-proclamation', 'B', 'Eating chocolate.', false, 1, 'wrong_category', 'Food wasn''t regulated by the Proclamation.'),
  ('q9-proclamation', 'C', 'Going to school.', false, 1, 'wrong_category', 'Education wasn''t affected.'),
  ('q9-proclamation', 'D', 'Wearing hats.', false, 1, 'wrong_category', 'Clothing wasn''t regulated.');

-- Tier 2 (Medium): Plausible colonial restrictions
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q9-proclamation', 'A', 'Settling west of the Appalachian Mountains.', true, 2, 'correct', NULL),
  ('q9-proclamation', 'B', 'Trading with the French.', false, 2, 'same_category', 'Trade restrictions existed but weren''t the Proclamation''s purpose.'),
  ('q9-proclamation', 'C', 'Printing their own money.', false, 2, 'same_category', 'Currency acts were separate legislation.'),
  ('q9-proclamation', 'D', 'Buying tea from the Dutch.', false, 2, 'same_category', 'Tea regulations came later with different acts.');

-- Tier 3 (Hard): Post-French & Indian War confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q9-proclamation', 'A', 'Settling west of the Appalachian Mountains.', true, 3, 'correct', NULL),
  ('q9-proclamation', 'B', 'Trading with Native Americans.', false, 3, 'trap', 'TRAP: Trade was REGULATED but the LINE specifically blocked SETTLEMENT.'),
  ('q9-proclamation', 'C', 'Claiming Ohio Valley land grants.', false, 3, 'near_miss', 'Land grants were affected but the broader prohibition was all western settlement.'),
  ('q9-proclamation', 'D', 'Building forts in French territory.', false, 3, 'same_category', 'After 1763, it wasn''t "French territory" anymore - Britain won.');

-- ============================================================================
-- QUESTION 10: Circumnavigation
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q10-circumnavigate', 'age-of-exploration',
  'Which explorer''s crew was the first to circumnavigate the globe?',
  'knowledge', 2, 'Ferdinand Magellan text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q10-circumnavigate', 'A', 'Ferdinand Magellan', true, 1, 'correct', NULL),
  ('q10-circumnavigate', 'B', 'Neil Armstrong', false, 1, 'wrong_era', 'Armstrong orbited Earth in space, 450 years later.'),
  ('q10-circumnavigate', 'C', 'Amelia Earhart', false, 1, 'wrong_era', 'Earhart was an aviator in the 1930s.'),
  ('q10-circumnavigate', 'D', 'Jacques Cousteau', false, 1, 'wrong_era', 'Cousteau was a 20th century ocean explorer.');

-- Tier 2 (Medium): All Age of Exploration figures
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q10-circumnavigate', 'A', 'Ferdinand Magellan', true, 2, 'correct', NULL),
  ('q10-circumnavigate', 'B', 'Francis Drake', false, 2, 'same_category', 'Drake circumnavigated but was SECOND, not first.'),
  ('q10-circumnavigate', 'C', 'Christopher Columbus', false, 2, 'same_category', 'Columbus crossed the Atlantic but never circumnavigated.'),
  ('q10-circumnavigate', 'D', 'Sebastian Cabot', false, 2, 'same_category', 'Cabot explored North America, didn''t circumnavigate.');

-- Tier 3 (Hard): Magellan died during voyage
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q10-circumnavigate', 'A', 'Ferdinand Magellan', true, 3, 'correct', NULL),
  ('q10-circumnavigate', 'B', 'Juan Sebastián Elcano', false, 3, 'trap', 'TRAP: Elcano COMPLETED the voyage after Magellan died, but it was Magellan''s expedition.'),
  ('q10-circumnavigate', 'C', 'Francis Drake', false, 3, 'near_miss', 'Drake was the SECOND to circumnavigate (and first Englishman).'),
  ('q10-circumnavigate', 'D', 'Vasco da Gama', false, 3, 'near_miss', 'Da Gama reached India by sea but returned the same way, not circumnavigation.');

-- ============================================================================
-- QUESTION 11: Squanto
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q11-squanto', 'colonial-america',
  'Who was the Native American who taught the Pilgrims to farm and fish?',
  'knowledge', 2, 'Squanto text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q11-squanto', 'A', 'Squanto', true, 1, 'correct', NULL),
  ('q11-squanto', 'B', 'Sitting Bull', false, 1, 'wrong_era', 'Sitting Bull was a 19th century Lakota leader.'),
  ('q11-squanto', 'C', 'Geronimo', false, 1, 'wrong_era', 'Geronimo was an Apache leader in the 1800s.'),
  ('q11-squanto', 'D', 'Sacagawea', false, 1, 'wrong_era', 'Sacagawea helped Lewis and Clark 200 years later.');

-- Tier 2 (Medium): All colonial-era Native Americans
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q11-squanto', 'A', 'Squanto', true, 2, 'correct', NULL),
  ('q11-squanto', 'B', 'Pocahontas', false, 2, 'same_category', 'Pocahontas helped Jamestown (Virginia), not Plymouth.'),
  ('q11-squanto', 'C', 'Powhatan', false, 2, 'same_category', 'Powhatan was Pocahontas''s father, a Virginia chief.'),
  ('q11-squanto', 'D', 'Massasoit', false, 2, 'same_category', 'Massasoit was the Wampanoag chief who made peace, but Squanto did the teaching.');

-- Tier 3 (Hard): Wampanoag confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q11-squanto', 'A', 'Squanto', true, 3, 'correct', NULL),
  ('q11-squanto', 'B', 'Massasoit', false, 3, 'trap', 'TRAP: Massasoit made the peace treaty, but SQUANTO (who spoke English) did the farming lessons.'),
  ('q11-squanto', 'C', 'Samoset', false, 3, 'near_miss', 'Samoset was the FIRST Native to greet Pilgrims but didn''t stay to teach farming.'),
  ('q11-squanto', 'D', 'Metacom (King Philip)', false, 3, 'near_miss', 'Metacom was Massasoit''s son who later fought the colonists.');

-- ============================================================================
-- QUESTION 12: Church of England
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q12-church-england', 'colonial-america',
  'Why did King Henry VIII start the Church of England?',
  'wisdom', 2, 'King Henry VIII text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q12-church-england', 'A', 'The Catholic Church wouldn''t let him get a divorce.', true, 1, 'correct', NULL),
  ('q12-church-england', 'B', 'He wanted to become a professional soccer player.', false, 1, 'wrong_category', 'Soccer has nothing to do with religious history.'),
  ('q12-church-england', 'C', 'He didn''t like the color of church buildings.', false, 1, 'wrong_category', 'Architecture wasn''t the issue.'),
  ('q12-church-england', 'D', 'He wanted to invent the telephone.', false, 1, 'wrong_era', 'The telephone was invented 350 years later.');

-- Tier 2 (Medium): Plausible religious motivations
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q12-church-england', 'A', 'The Catholic Church wouldn''t let him get a divorce.', true, 2, 'correct', NULL),
  ('q12-church-england', 'B', 'He disagreed with the Bible''s translation.', false, 2, 'same_category', 'Bible translation was an issue but not Henry''s main motivation.'),
  ('q12-church-england', 'C', 'He wanted to stop the Reformation.', false, 2, 'same_category', 'Actually, he JOINED the Reformation movement (sort of).'),
  ('q12-church-england', 'D', 'He wanted to be a monk.', false, 2, 'same_category', 'Monks don''t marry - opposite of his goal.');

-- Tier 3 (Hard): Theological vs. personal motivations
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q12-church-england', 'A', 'The Catholic Church wouldn''t let him get a divorce.', true, 3, 'correct', NULL),
  ('q12-church-england', 'B', 'He agreed with Martin Luther''s theology.', false, 3, 'trap', 'TRAP: Henry actually DISAGREED with Luther theologically - his break was personal, not doctrinal.'),
  ('q12-church-england', 'C', 'The Pope excommunicated him first.', false, 3, 'near_miss', 'The excommunication came AFTER Henry broke away, not before.'),
  ('q12-church-england', 'D', 'He wanted to seize monastery wealth.', false, 3, 'near_miss', 'He DID seize monasteries, but the divorce was the CAUSE, wealth was a benefit.');

-- ============================================================================
-- QUESTION 13: Mayflower Compact
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q13-mayflower-compact', 'colonial-america',
  'What was the "Mayflower Compact"?',
  'knowledge', 2, 'Mayflower Compact Debate text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q13-mayflower-compact', 'A', 'An agreement for self-government signed by the Pilgrims.', true, 1, 'correct', NULL),
  ('q13-mayflower-compact', 'B', 'A type of car.', false, 1, 'wrong_category', 'The Mayflower was a ship, not a car brand.'),
  ('q13-mayflower-compact', 'C', 'A recipe for thanksgiving turkey.', false, 1, 'wrong_category', 'Recipes aren''t legal documents.'),
  ('q13-mayflower-compact', 'D', 'A video game.', false, 1, 'wrong_era', 'Video games didn''t exist in 1620.');

-- Tier 2 (Medium): Plausible colonial documents
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q13-mayflower-compact', 'A', 'An agreement for self-government signed by the Pilgrims.', true, 2, 'correct', NULL),
  ('q13-mayflower-compact', 'B', 'A trade deal with Native Americans.', false, 2, 'same_category', 'Trade agreements were made later, not on the ship.'),
  ('q13-mayflower-compact', 'C', 'A letter to the King asking for money.', false, 2, 'same_category', 'The Compact was about governing themselves, not asking for help.'),
  ('q13-mayflower-compact', 'D', 'A map of the New World.', false, 2, 'same_category', 'Maps are navigation tools, not governance agreements.');

-- Tier 3 (Hard): Similar colonial documents
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q13-mayflower-compact', 'A', 'An agreement for self-government signed by the Pilgrims.', true, 3, 'correct', NULL),
  ('q13-mayflower-compact', 'B', 'The charter from the Virginia Company.', false, 3, 'trap', 'TRAP: They HAD a charter but landed outside its bounds, so they wrote the Compact.'),
  ('q13-mayflower-compact', 'C', 'The Fundamental Orders of Connecticut.', false, 3, 'near_miss', 'The Fundamental Orders came later and were for Connecticut, not Plymouth.'),
  ('q13-mayflower-compact', 'D', 'A contract with the ship''s captain.', false, 3, 'same_category', 'The Compact was between colonists, not with the crew.');

-- ============================================================================
-- QUESTION 14: Printing Press
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q14-printing-press', 'age-of-exploration',
  'Which invention allowed ideas like the Reformation to spread quickly?',
  'wisdom', 2, 'Gutenberg Printing Press text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q14-printing-press', 'A', 'The Printing Press', true, 1, 'correct', NULL),
  ('q14-printing-press', 'B', 'The Internet', false, 1, 'wrong_era', 'The Internet was invented in the 20th century.'),
  ('q14-printing-press', 'C', 'The Television', false, 1, 'wrong_era', 'Television was invented in the 1920s.'),
  ('q14-printing-press', 'D', 'The Smartphone', false, 1, 'wrong_era', 'Smartphones are 21st century technology.');

-- Tier 2 (Medium): Renaissance/Age of Exploration inventions
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q14-printing-press', 'A', 'The Printing Press', true, 2, 'correct', NULL),
  ('q14-printing-press', 'B', 'The Telescope', false, 2, 'same_category', 'The telescope helped astronomy but didn''t spread written ideas.'),
  ('q14-printing-press', 'C', 'The Steam Engine', false, 2, 'same_category', 'Steam engines came later and powered machines, not communication.'),
  ('q14-printing-press', 'D', 'The Telegraph', false, 2, 'same_category', 'The telegraph was invented in the 1800s.');

-- Tier 3 (Hard): Information technology nuances
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q14-printing-press', 'A', 'The Printing Press', true, 3, 'correct', NULL),
  ('q14-printing-press', 'B', 'Movable Type', false, 3, 'trap', 'TRAP: Movable type is the TECHNOLOGY inside the printing press, not a separate invention.'),
  ('q14-printing-press', 'C', 'Paper Money', false, 3, 'near_miss', 'Paper money uses printing but isn''t about spreading ideas.'),
  ('q14-printing-press', 'D', 'The Compass', false, 3, 'same_category', 'The compass helped navigation, not communication.');

-- ============================================================================
-- QUESTION 15: Sons of Liberty
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q15-sons-liberty', 'road-to-revolution',
  'Who led the "Sons of Liberty" in Boston?',
  'knowledge', 2, 'Samuel Adams text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q15-sons-liberty', 'A', 'Samuel Adams', true, 1, 'correct', NULL),
  ('q15-sons-liberty', 'B', 'Abraham Lincoln', false, 1, 'wrong_era', 'Lincoln was president during the Civil War, nearly 100 years later.'),
  ('q15-sons-liberty', 'C', 'Teddy Roosevelt', false, 1, 'wrong_era', 'Roosevelt was a 20th century president.'),
  ('q15-sons-liberty', 'D', 'Donald Duck', false, 1, 'wrong_category', 'Donald Duck is a cartoon character.');

-- Tier 2 (Medium): All Founding era figures
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q15-sons-liberty', 'A', 'Samuel Adams', true, 2, 'correct', NULL),
  ('q15-sons-liberty', 'B', 'John Adams', false, 2, 'same_category', 'John was Samuel''s cousin but was a lawyer, not an agitator.'),
  ('q15-sons-liberty', 'C', 'Benjamin Franklin', false, 2, 'same_category', 'Franklin was in Philadelphia, not leading Boston protests.'),
  ('q15-sons-liberty', 'D', 'John Locke', false, 2, 'same_category', 'Locke was an English philosopher, not an American activist.');

-- Tier 3 (Hard): Adams family and Boston patriots
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q15-sons-liberty', 'A', 'Samuel Adams', true, 3, 'correct', NULL),
  ('q15-sons-liberty', 'B', 'John Adams', false, 3, 'trap', 'TRAP: John Adams was involved in the Revolution but was a MODERATE - Samuel was the radical organizer.'),
  ('q15-sons-liberty', 'C', 'Paul Revere', false, 3, 'near_miss', 'Revere WAS a Son of Liberty member, but Samuel Adams was the LEADER.'),
  ('q15-sons-liberty', 'D', 'John Hancock', false, 3, 'near_miss', 'Hancock was wealthy and supported them financially, but Adams led organizationally.');

-- ============================================================================
-- QUESTION 16: Stamp Act
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q16-stamp-act', 'the-acts',
  'What did the "Stamp Act" tax?',
  'knowledge', 2, 'Stamp Act of 1765 text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q16-stamp-act', 'A', 'Printed materials like newspapers and playing cards.', true, 1, 'correct', NULL),
  ('q16-stamp-act', 'B', 'Shoes and socks.', false, 1, 'wrong_category', 'Clothing wasn''t taxed by the Stamp Act.'),
  ('q16-stamp-act', 'C', 'Hamburgers and hot dogs.', false, 1, 'wrong_category', 'Food wasn''t affected by the Stamp Act.'),
  ('q16-stamp-act', 'D', 'Televisions and computers.', false, 1, 'wrong_era', 'These technologies didn''t exist in the 1700s.');

-- Tier 2 (Medium): Plausible colonial trade goods
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q16-stamp-act', 'A', 'Printed materials like newspapers and playing cards.', true, 2, 'correct', NULL),
  ('q16-stamp-act', 'B', 'Tea and Sugar.', false, 2, 'same_category', 'Tea and sugar were taxed by different acts.'),
  ('q16-stamp-act', 'C', 'Glass and Lead.', false, 2, 'same_category', 'Glass and lead were taxed by the Townshend Acts.'),
  ('q16-stamp-act', 'D', 'Guns and Ammunition.', false, 2, 'same_category', 'Weapons weren''t the focus of colonial taxation.');

-- Tier 3 (Hard): Paper goods specificity
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q16-stamp-act', 'A', 'Printed materials like newspapers and playing cards.', true, 3, 'correct', NULL),
  ('q16-stamp-act', 'B', 'Only legal documents.', false, 3, 'trap', 'TRAP: Legal docs WERE taxed, but so were newspapers, pamphlets, and playing cards.'),
  ('q16-stamp-act', 'C', 'Only newspapers.', false, 3, 'near_miss', 'Newspapers were included but so were legal docs, pamphlets, and cards.'),
  ('q16-stamp-act', 'D', 'Imported paper from England.', false, 3, 'same_category', 'The tax was on the PRINTED item, not raw paper.');

-- ============================================================================
-- QUESTION 17: John Locke
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q17-locke', 'road-to-revolution',
  'Who was the "Father of Liberalism"?',
  'knowledge', 2, 'John Locke text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q17-locke', 'A', 'John Locke', true, 1, 'correct', NULL),
  ('q17-locke', 'B', 'Michael Jordan', false, 1, 'wrong_category', 'Jordan is a basketball player, not a philosopher.'),
  ('q17-locke', 'C', 'Albert Einstein', false, 1, 'wrong_category', 'Einstein was a physicist, not a political philosopher.'),
  ('q17-locke', 'D', 'Elvis Presley', false, 1, 'wrong_category', 'Elvis was a musician, not a philosopher.');

-- Tier 2 (Medium): Enlightenment philosophers
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q17-locke', 'A', 'John Locke', true, 2, 'correct', NULL),
  ('q17-locke', 'B', 'Thomas Hobbes', false, 2, 'same_category', 'Hobbes believed in absolute monarchy, opposite of liberalism.'),
  ('q17-locke', 'C', 'King James II', false, 2, 'same_category', 'James II was the king Locke opposed.'),
  ('q17-locke', 'D', 'Oliver Cromwell', false, 2, 'same_category', 'Cromwell was a military dictator, not a liberal philosopher.');

-- Tier 3 (Hard): Liberal philosophy nuances
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q17-locke', 'A', 'John Locke', true, 3, 'correct', NULL),
  ('q17-locke', 'B', 'Jean-Jacques Rousseau', false, 3, 'trap', 'TRAP: Rousseau was hugely influential but came AFTER Locke - Locke is the "Father."'),
  ('q17-locke', 'C', 'Montesquieu', false, 3, 'near_miss', 'Montesquieu influenced separation of powers but Locke founded liberal theory.'),
  ('q17-locke', 'D', 'Voltaire', false, 3, 'near_miss', 'Voltaire championed free speech but Locke established the core liberal framework.');

-- ============================================================================
-- QUESTION 18: Rhode Island
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q18-rhode-island', 'colonial-america',
  'Which colony was founded by Roger Williams for religious freedom?',
  'knowledge', 2, 'Settlement Timeline map');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q18-rhode-island', 'A', 'Rhode Island', true, 1, 'correct', NULL),
  ('q18-rhode-island', 'B', 'Alaska', false, 1, 'wrong_era', 'Alaska wasn''t a colony - purchased from Russia in 1867.'),
  ('q18-rhode-island', 'C', 'Hawaii', false, 1, 'wrong_era', 'Hawaii wasn''t a colony - annexed in 1898.'),
  ('q18-rhode-island', 'D', 'Texas', false, 1, 'wrong_era', 'Texas was Spanish/Mexican territory, not a British colony.');

-- Tier 2 (Medium): All New England colonies
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q18-rhode-island', 'A', 'Rhode Island', true, 2, 'correct', NULL),
  ('q18-rhode-island', 'B', 'Massachusetts', false, 2, 'same_category', 'Massachusetts was where Williams was BANISHED from.'),
  ('q18-rhode-island', 'C', 'Connecticut', false, 2, 'same_category', 'Connecticut was founded by Thomas Hooker, not Williams.'),
  ('q18-rhode-island', 'D', 'New Hampshire', false, 2, 'same_category', 'New Hampshire had different founders.');

-- Tier 3 (Hard): Religious freedom colony confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q18-rhode-island', 'A', 'Rhode Island', true, 3, 'correct', NULL),
  ('q18-rhode-island', 'B', 'Pennsylvania', false, 3, 'trap', 'TRAP: Pennsylvania ALSO had religious freedom, but was founded by William Penn (Quaker), not Williams.'),
  ('q18-rhode-island', 'C', 'Maryland', false, 3, 'near_miss', 'Maryland had religious tolerance for Christians but was founded by Lord Baltimore (Catholic).'),
  ('q18-rhode-island', 'D', 'Providence Plantation', false, 3, 'trap', 'TRAP: Providence was Williams'' settlement but it became Rhode Island colony.');

-- ============================================================================
-- QUESTION 19: Starving Time
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q19-starving-time', 'colonial-america',
  'What was the "Starving Time"?',
  'knowledge', 2, 'Jamestown/John Smith context');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q19-starving-time', 'A', 'A period of famine in Jamestown.', true, 1, 'correct', NULL),
  ('q19-starving-time', 'B', 'A popular diet plan.', false, 1, 'wrong_category', 'This is a serious historical event, not a modern fad.'),
  ('q19-starving-time', 'C', 'A video game.', false, 1, 'wrong_era', 'Video games didn''t exist in colonial times.'),
  ('q19-starving-time', 'D', 'A cooking show.', false, 1, 'wrong_era', 'TV cooking shows are modern.');

-- Tier 2 (Medium): Colonial hardship events
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q19-starving-time', 'A', 'A period of famine in Jamestown.', true, 2, 'correct', NULL),
  ('q19-starving-time', 'B', 'The long voyage on the Mayflower.', false, 2, 'same_category', 'The Mayflower voyage was hard but not called "Starving Time."'),
  ('q19-starving-time', 'C', 'The winter at Valley Forge.', false, 2, 'same_category', 'Valley Forge was during the Revolution, much later.'),
  ('q19-starving-time', 'D', 'The siege of Boston.', false, 2, 'same_category', 'The Boston siege was during the Revolution.');

-- Tier 3 (Hard): Early colonial hardship confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q19-starving-time', 'A', 'A period of famine in Jamestown.', true, 3, 'correct', NULL),
  ('q19-starving-time', 'B', 'The first winter in Plymouth.', false, 3, 'trap', 'TRAP: Plymouth''s first winter was also deadly, but "Starving Time" specifically refers to Jamestown 1609-1610.'),
  ('q19-starving-time', 'C', 'The Roanoke disappearance.', false, 3, 'near_miss', 'Roanoke was a mystery but happened before Jamestown.'),
  ('q19-starving-time', 'D', 'The period after John Smith left.', false, 3, 'trap', 'TRAP: This is WHEN it happened (Smith left in 1609) but the answer describes WHAT, not when.');

-- ============================================================================
-- QUESTION 20: Declaration of Independence Author
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q20-declaration', 'road-to-revolution',
  'Who drafted the Declaration of Independence?',
  'knowledge', 2, 'Thomas Jefferson text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q20-declaration', 'A', 'Thomas Jefferson', true, 1, 'correct', NULL),
  ('q20-declaration', 'B', 'Barack Obama', false, 1, 'wrong_era', 'Obama was a 21st century president.'),
  ('q20-declaration', 'C', 'Elvis Presley', false, 1, 'wrong_category', 'Elvis was a singer, not a political leader.'),
  ('q20-declaration', 'D', 'Shakespeare', false, 1, 'wrong_era', 'Shakespeare died 160 years before the Declaration.');

-- Tier 2 (Medium): All Founding Fathers
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q20-declaration', 'A', 'Thomas Jefferson', true, 2, 'correct', NULL),
  ('q20-declaration', 'B', 'John Hancock', false, 2, 'same_category', 'Hancock SIGNED it famously but didn''t write it.'),
  ('q20-declaration', 'C', 'George Washington', false, 2, 'same_category', 'Washington was commanding the army, not writing the Declaration.'),
  ('q20-declaration', 'D', 'Patrick Henry', false, 2, 'same_category', 'Henry was famous for speeches but didn''t write the Declaration.');

-- Tier 3 (Hard): Committee of Five confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q20-declaration', 'A', 'Thomas Jefferson', true, 3, 'correct', NULL),
  ('q20-declaration', 'B', 'Benjamin Franklin', false, 3, 'trap', 'TRAP: Franklin was on the committee and EDITED it, but Jefferson DRAFTED it.'),
  ('q20-declaration', 'C', 'John Adams', false, 3, 'trap', 'TRAP: Adams was on the committee and pushed for Jefferson to write it.'),
  ('q20-declaration', 'D', 'Roger Sherman', false, 3, 'near_miss', 'Sherman was on the Committee of Five but had a minor role.');

-- ============================================================================
-- WISDOM QUESTION 21: Americas Discovery Realization
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q21-vespucci', 'age-of-exploration',
  'Who realized that the "New World" was actually a separate continent and not Asia?',
  'wisdom', 3, 'Amerigo Vespucci text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q21-vespucci', 'A', 'Amerigo Vespucci', true, 1, 'correct', NULL),
  ('q21-vespucci', 'B', 'Albert Einstein', false, 1, 'wrong_era', 'Einstein was a 20th century physicist.'),
  ('q21-vespucci', 'C', 'Napoleon', false, 1, 'wrong_era', 'Napoleon was a 19th century French leader.'),
  ('q21-vespucci', 'D', 'Julius Caesar', false, 1, 'wrong_era', 'Caesar lived in ancient Rome, 1500 years earlier.');

-- Tier 2 (Medium): Age of Exploration figures
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q21-vespucci', 'A', 'Amerigo Vespucci', true, 2, 'correct', NULL),
  ('q21-vespucci', 'B', 'Christopher Columbus', false, 2, 'same_category', 'Columbus thought he reached Asia until he died.'),
  ('q21-vespucci', 'C', 'Ferdinand Magellan', false, 2, 'same_category', 'Magellan proved Earth was round but didn''t identify the Americas.'),
  ('q21-vespucci', 'D', 'John Cabot', false, 2, 'same_category', 'Cabot explored North America but didn''t document it as a new continent.');

-- Tier 3 (Hard): Columbus trap
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q21-vespucci', 'A', 'Amerigo Vespucci', true, 3, 'correct', NULL),
  ('q21-vespucci', 'B', 'Christopher Columbus', false, 3, 'trap', 'TRAP: Columbus FOUND the Americas but thought it was Asia. Vespucci realized it was a NEW continent.'),
  ('q21-vespucci', 'C', 'Sebastian Cabot', false, 3, 'near_miss', 'Cabot explored but Vespucci published the realization.'),
  ('q21-vespucci', 'D', 'Vasco da Gama', false, 3, 'near_miss', 'Da Gama reached Asia by going AROUND Africa.');

-- ============================================================================
-- WISDOM QUESTION 22: Boston Port Act
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q22-boston-port', 'the-acts',
  'Which specific Act shut down Boston Harbor until the destroyed tea was paid for?',
  'wisdom', 3, 'The Boston Port Act text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q22-boston-port', 'A', 'The Boston Port Act', true, 1, 'correct', NULL),
  ('q22-boston-port', 'B', 'The Clean Air Act', false, 1, 'wrong_era', 'Environmental laws are modern, not colonial.'),
  ('q22-boston-port', 'C', 'The Affordable Care Act', false, 1, 'wrong_era', 'Healthcare laws are 21st century.'),
  ('q22-boston-port', 'D', 'The Civil Rights Act', false, 1, 'wrong_era', 'Civil rights laws are from the 1960s.');

-- Tier 2 (Medium): Colonial-era acts
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q22-boston-port', 'A', 'The Boston Port Act', true, 2, 'correct', NULL),
  ('q22-boston-port', 'B', 'The Stamp Act', false, 2, 'same_category', 'The Stamp Act taxed paper, didn''t close ports.'),
  ('q22-boston-port', 'C', 'The Tea Act', false, 2, 'same_category', 'The Tea Act CAUSED the Tea Party, the Port Act was the PUNISHMENT.'),
  ('q22-boston-port', 'D', 'The Townshend Acts', false, 2, 'same_category', 'Townshend Acts were earlier import taxes.');

-- Tier 3 (Hard): Intolerable Acts confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q22-boston-port', 'A', 'The Boston Port Act', true, 3, 'correct', NULL),
  ('q22-boston-port', 'B', 'The Quartering Act', false, 3, 'near_miss', 'This was ALSO an Intolerable Act but required housing soldiers, not closing the port.'),
  ('q22-boston-port', 'C', 'The Intolerable Acts', false, 3, 'trap', 'TRAP: The Boston Port Act WAS part of the Intolerable Acts - but this is the CATEGORY, not the specific act.'),
  ('q22-boston-port', 'D', 'The Coercive Acts', false, 3, 'trap', 'TRAP: "Coercive Acts" is the BRITISH name for the Intolerable Acts - same trap.');

-- ============================================================================
-- WISDOM QUESTION 23: Connecticut Founder
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q23-hooker', 'colonial-america',
  'Who founded Connecticut and wrote the "Fundamental Orders"?',
  'wisdom', 3, 'Settlement Timeline #6 Connecticut');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q23-hooker', 'A', 'Thomas Hooker', true, 1, 'correct', NULL),
  ('q23-hooker', 'B', 'Captain Hook', false, 1, 'wrong_category', 'Captain Hook is a fictional pirate from Peter Pan.'),
  ('q23-hooker', 'C', 'Robin Hood', false, 1, 'wrong_category', 'Robin Hood is a medieval English legend.'),
  ('q23-hooker', 'D', 'Harry Potter', false, 1, 'wrong_category', 'Harry Potter is a fictional wizard.');

-- Tier 2 (Medium): Colonial founders
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q23-hooker', 'A', 'Thomas Hooker', true, 2, 'correct', NULL),
  ('q23-hooker', 'B', 'Roger Williams', false, 2, 'same_category', 'Williams founded Rhode Island, not Connecticut.'),
  ('q23-hooker', 'C', 'William Penn', false, 2, 'same_category', 'Penn founded Pennsylvania.'),
  ('q23-hooker', 'D', 'John Winthrop', false, 2, 'same_category', 'Winthrop led Massachusetts Bay Colony.');

-- Tier 3 (Hard): New England founder confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q23-hooker', 'A', 'Thomas Hooker', true, 3, 'correct', NULL),
  ('q23-hooker', 'B', 'Roger Williams', false, 3, 'trap', 'TRAP: Williams founded nearby Rhode Island for similar reasons (religious disagreement with MA).'),
  ('q23-hooker', 'C', 'John Winthrop', false, 3, 'near_miss', 'Winthrop was MA governor - Hooker LEFT Winthrop''s colony to found CT.'),
  ('q23-hooker', 'D', 'John Davenport', false, 3, 'near_miss', 'Davenport founded New Haven, which later merged with Connecticut.');

-- ============================================================================
-- WISDOM QUESTION 24: Dinwiddie
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q24-dinwiddie', 'road-to-revolution',
  'Which British official sent George Washington to the Ohio Valley to confront the French?',
  'wisdom', 3, 'Robert Dinwiddie text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q24-dinwiddie', 'A', 'Robert Dinwiddie', true, 1, 'correct', NULL),
  ('q24-dinwiddie', 'B', 'Queen Elizabeth II', false, 1, 'wrong_era', 'Elizabeth II was a 20th-21st century monarch.'),
  ('q24-dinwiddie', 'C', 'Winston Churchill', false, 1, 'wrong_era', 'Churchill was a 20th century British leader.'),
  ('q24-dinwiddie', 'D', 'King Arthur', false, 1, 'wrong_era', 'King Arthur is a medieval legend.');

-- Tier 2 (Medium): Colonial-era British officials
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q24-dinwiddie', 'A', 'Robert Dinwiddie', true, 2, 'correct', NULL),
  ('q24-dinwiddie', 'B', 'King George III', false, 2, 'same_category', 'The King was in London, didn''t directly send Washington.'),
  ('q24-dinwiddie', 'C', 'General Braddock', false, 2, 'same_category', 'Braddock led the LATER disastrous expedition, Dinwiddie sent Washington first.'),
  ('q24-dinwiddie', 'D', 'Lord North', false, 2, 'same_category', 'Lord North was prime minister during the Revolution, wrong time period.');

-- Tier 3 (Hard): Colonial governor confusion
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q24-dinwiddie', 'A', 'Robert Dinwiddie', true, 3, 'correct', NULL),
  ('q24-dinwiddie', 'B', 'Thomas Hutchinson', false, 3, 'near_miss', 'Hutchinson was Governor of Massachusetts, not Virginia.'),
  ('q24-dinwiddie', 'C', 'William Franklin', false, 3, 'near_miss', 'William Franklin was Governor of New Jersey.'),
  ('q24-dinwiddie', 'D', 'Francis Fauquier', false, 3, 'trap', 'TRAP: Fauquier was the NEXT Virginia Governor after Dinwiddie.');

-- ============================================================================
-- WISDOM QUESTION 25: Impartial Justice Act
-- ============================================================================
INSERT INTO questions (id, topic_id, question_text, question_type, base_difficulty, citation_source)
VALUES ('q25-impartial-justice', 'the-acts',
  'Which "Intolerable Act" allowed the Governor to move trials of British soldiers to England?',
  'wisdom', 3, 'The Act for Impartial Justice text block');

-- Tier 1 (Easy)
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q25-impartial-justice', 'A', 'The Act for Impartial Justice', true, 1, 'correct', NULL),
  ('q25-impartial-justice', 'B', 'The Justice League Act', false, 1, 'wrong_category', 'The Justice League is a superhero team.'),
  ('q25-impartial-justice', 'C', 'The Supreme Court Act', false, 1, 'wrong_era', 'The Supreme Court was established after independence.'),
  ('q25-impartial-justice', 'D', 'The Fair Trial Act', false, 1, 'wrong_category', 'This isn''t a real colonial act.');

-- Tier 2 (Medium): Colonial-era acts
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q25-impartial-justice', 'A', 'The Act for Impartial Justice', true, 2, 'correct', NULL),
  ('q25-impartial-justice', 'B', 'The Quartering Act', false, 2, 'same_category', 'The Quartering Act required housing soldiers, not moving trials.'),
  ('q25-impartial-justice', 'C', 'The Boston Port Act', false, 2, 'same_category', 'The Port Act closed Boston Harbor.'),
  ('q25-impartial-justice', 'D', 'The Stamp Act', false, 2, 'same_category', 'The Stamp Act taxed paper goods, wasn''t about trials.');

-- Tier 3 (Hard): Intolerable Acts specifics
INSERT INTO answer_options (question_id, option_label, option_text, is_correct, difficulty_tier, distractor_type, trap_explanation) VALUES
  ('q25-impartial-justice', 'A', 'The Act for Impartial Justice', true, 3, 'correct', NULL),
  ('q25-impartial-justice', 'B', 'The Massachusetts Government Act', false, 3, 'near_miss', 'This was ALSO an Intolerable Act but changed colonial governance, not trials.'),
  ('q25-impartial-justice', 'C', 'The Administration of Justice Act', false, 3, 'trap', 'TRAP: This is an ALTERNATIVE NAME for the same act - technically correct but usually called "Impartial Justice."'),
  ('q25-impartial-justice', 'D', 'The Murder Act', false, 3, 'trap', 'TRAP: "Murder Act" was a colonial NICKNAME (insult), not the official name.');
