# Content Structure Guide

## Overview

This document defines how educational content is structured in the Virtual Socratic University. All questions are categorized by type (Knowledge vs. Wisdom), tagged with metadata, and include supporting materials for adaptive feedback.

---

## Question Taxonomy

### Knowledge Questions (K)
Questions that test **factual recall**. The student either knows the answer or doesn't.

**Cognitive Verbs**: identify, name, list, recall, define, state
**Question Stems**: Who, What, When, Where, Which

**Examples**:
- "Who discovered America in 1492?"
- "What year did the Boston Tea Party occur?"
- "Which colony was founded by William Penn?"

### Wisdom Questions (W)
Questions that test **understanding and synthesis**. The student must connect concepts.

**Cognitive Verbs**: explain, compare, analyze, infer, evaluate, predict
**Question Stems**: Why, How, What would happen if, Compare

**Examples**:
- "Why did colonists object to taxation without representation?"
- "How did the Stamp Act differ from the Tea Act?"
- "What might have happened if the colonists had lost the Revolution?"

---

## Difficulty Tiers

### Tier 1: Basic
- Single fact recall
- Direct from textbook
- One concept at a time

### Tier 2: Intermediate
- Requires context
- May need to eliminate similar options
- Still single concept

### Tier 3: Hard
- Application of knowledge
- Must understand "why" not just "what"
- May combine two related facts

### Tier 4: Extra Hard (Composite)
- Multiple concepts combined
- "Both A and B" style questions
- Requires synthesis across topics

---

## Content File Format

Questions are stored as JSON files organized by topic.

### File Structure
```
content/
└── questions/
    ├── age-of-exploration/
    │   ├── columbus.json
    │   ├── spanish-explorers.json
    │   └── english-french-explorers.json
    ├── american-revolution/
    │   ├── causes.json
    │   ├── key-battles.json
    │   └── founding-fathers.json
    └── the-acts/
        ├── stamp-act.json
        ├── tea-act.json
        └── intolerable-acts.json
```

---

## Sample Question Format

```json
{
  "topic_slug": "age-of-exploration",
  "subtopic": "Christopher Columbus",
  "questions": [
    {
      "id": "exp-col-001",
      "text": "Which explorer is credited with discovering America in 1492?",
      "type": "knowledge",
      "difficulty_tier": 1,
      "cognitive_verb": "identify",
      "question_stem": "which",
      "options": [
        {
          "label": "A",
          "text": "Christopher Columbus",
          "is_correct": true
        },
        {
          "label": "B",
          "text": "Amerigo Vespucci",
          "is_correct": false,
          "distractor_type": "common_confusion",
          "confusion_explanation": "Vespucci is often confused with Columbus because America is named after him. However, Vespucci came later and helped map the coastline."
        },
        {
          "label": "C",
          "text": "Ferdinand Magellan",
          "is_correct": false,
          "distractor_type": "same_era",
          "confusion_explanation": "Magellan was also an explorer but is famous for the first circumnavigation, not discovering America."
        },
        {
          "label": "D",
          "text": "John Cabot",
          "is_correct": false,
          "distractor_type": "different_nation",
          "confusion_explanation": "Cabot explored for England, reaching North America in 1497, but Columbus arrived first in 1492."
        }
      ],
      "correct_answer_explanation": "Christopher Columbus, sailing for Spain, reached the Americas on October 12, 1492. Although Vikings had reached North America earlier, Columbus's voyage opened the way for European exploration and colonization.",
      "mnemonic": {
        "text": "Columbus sailed the ocean blue in fourteen hundred ninety-two!",
        "type": "rhyme"
      }
    },
    {
      "id": "exp-col-002",
      "text": "Which country sponsored Christopher Columbus's voyage to the Americas?",
      "type": "knowledge",
      "difficulty_tier": 1,
      "cognitive_verb": "identify",
      "question_stem": "which",
      "options": [
        {
          "label": "A",
          "text": "Portugal",
          "is_correct": false,
          "distractor_type": "near_miss",
          "confusion_explanation": "Portugal was a major exploring nation, but they rejected Columbus's proposal. He then went to Spain."
        },
        {
          "label": "B",
          "text": "England",
          "is_correct": false,
          "distractor_type": "competing_nation",
          "confusion_explanation": "England did sponsor explorers, but John Cabot sailed for England, not Columbus."
        },
        {
          "label": "C",
          "text": "Spain",
          "is_correct": true
        },
        {
          "label": "D",
          "text": "France",
          "is_correct": false,
          "distractor_type": "competing_nation",
          "confusion_explanation": "France sponsored explorers like Jacques Cartier, but not Columbus."
        }
      ],
      "correct_answer_explanation": "Queen Isabella and King Ferdinand of Spain funded Columbus's expedition. After Portugal turned him down, Columbus convinced the Spanish monarchs to take a chance on his westward route to Asia.",
      "mnemonic": {
        "text": "Columbus convinced the Spanish Queen Isabella to fund his dream - think 'Spain' starts with 'S' like 'Sponsored'!",
        "type": "association"
      }
    },
    {
      "id": "exp-col-003",
      "text": "Why did Columbus sail west instead of east to reach Asia?",
      "type": "wisdom",
      "difficulty_tier": 2,
      "cognitive_verb": "explain",
      "question_stem": "why",
      "options": [
        {
          "label": "A",
          "text": "He believed the Earth was round and sailing west would be a shorter route",
          "is_correct": true
        },
        {
          "label": "B",
          "text": "The eastern route was blocked by enemy ships",
          "is_correct": false,
          "distractor_type": "plausible_but_wrong",
          "confusion_explanation": "While the land route to Asia was difficult, the sea route east around Africa wasn't blocked by enemies - it was just very long."
        },
        {
          "label": "C",
          "text": "He was trying to discover new lands, not reach Asia",
          "is_correct": false,
          "distractor_type": "anachronism",
          "confusion_explanation": "Columbus wasn't trying to find new lands - he genuinely believed he could reach Asia. The discovery of the Americas was accidental from his perspective."
        },
        {
          "label": "D",
          "text": "Spain ordered him to sail west",
          "is_correct": false,
          "distractor_type": "partial_truth",
          "confusion_explanation": "Spain didn't order the direction - Columbus proposed the western route because he thought it would be shorter. He underestimated the Earth's size."
        }
      ],
      "correct_answer_explanation": "Columbus believed the Earth was round (which educated people of his time knew) and calculated that sailing west would be a shorter route to Asia than going east around Africa. His math was wrong - he thought the Earth was much smaller than it actually is - but his basic idea about a western route was logical.",
      "socratic_hints": [
        {
          "level": 1,
          "text": "Think about what Columbus knew about the shape of the Earth. What did educated people believe in 1492?"
        },
        {
          "level": 2,
          "text": "If you're trying to get to somewhere on the other side of a ball, are there different ways to get there?"
        },
        {
          "level": 3,
          "text": "Columbus thought the Earth was round. If Asia is in the east, and you keep going west on a round Earth, where would you eventually end up?"
        }
      ]
    },
    {
      "id": "exp-col-004",
      "text": "How did Columbus's voyages change life for the Native Americans he encountered?",
      "type": "wisdom",
      "difficulty_tier": 3,
      "cognitive_verb": "analyze",
      "question_stem": "how",
      "options": [
        {
          "label": "A",
          "text": "Native Americans gained new technologies and their lives improved",
          "is_correct": false,
          "distractor_type": "oversimplification",
          "confusion_explanation": "While some trade did occur, the overall impact was devastating due to disease and colonization. This answer ignores the negative consequences."
        },
        {
          "label": "B",
          "text": "Native Americans were exposed to new diseases and lost their lands to European colonizers",
          "is_correct": true
        },
        {
          "label": "C",
          "text": "Nothing changed because Columbus only visited briefly",
          "is_correct": false,
          "distractor_type": "minimization",
          "confusion_explanation": "Although Columbus's visits were relatively brief, they opened the door for centuries of European colonization that dramatically changed Native American life."
        },
        {
          "label": "D",
          "text": "Native Americans and Europeans became equal trading partners",
          "is_correct": false,
          "distractor_type": "idealistic",
          "confusion_explanation": "The relationship between Europeans and Native Americans was not equal - Europeans sought to colonize and control the lands and people they encountered."
        }
      ],
      "correct_answer_explanation": "Columbus's voyages had devastating effects on Native Americans. Europeans brought diseases like smallpox that killed millions of Native Americans who had no immunity. Additionally, European colonization led to the loss of Native American lands, destruction of their cultures, and in many cases enslavement or death.",
      "socratic_hints": [
        {
          "level": 1,
          "text": "When people from different parts of the world meet for the first time, what kinds of things might they share - both good and bad?"
        },
        {
          "level": 2,
          "text": "Native Americans had never been exposed to European illnesses before. What happens when someone encounters a disease their body has never seen?"
        },
        {
          "level": 3,
          "text": "After Columbus, many more Europeans came. They wanted land to settle on. Whose land did they take?"
        }
      ]
    }
  ]
}
```

---

## Sample Composite Question (Tier 4)

Composite questions are generated dynamically by combining facts from multiple simpler questions.

```json
{
  "id": "composite-exp-001",
  "text": "Which TWO of the following statements about European exploration are TRUE?",
  "type": "wisdom",
  "difficulty_tier": 4,
  "is_composite": true,
  "source_questions": ["exp-col-001", "exp-col-002"],
  "options": [
    {
      "label": "A",
      "text": "Columbus sailed for Spain and reached America in 1492"
    },
    {
      "label": "B",
      "text": "Columbus sailed for Portugal and reached America in 1497"
    },
    {
      "label": "C",
      "text": "Both statements in A are correct",
      "is_correct": true
    },
    {
      "label": "D",
      "text": "Neither statement in A is correct"
    }
  ]
}
```

---

## Content Checklist for Each Question

Before adding a question, verify:

- [ ] Question is age-appropriate (5th grade reading level)
- [ ] Exactly one correct answer
- [ ] All incorrect options are plausible (students might actually pick them)
- [ ] Each distractor has `distractor_type` and `confusion_explanation`
- [ ] Knowledge questions have at least one mnemonic
- [ ] Wisdom questions have 3 levels of Socratic hints
- [ ] `correct_answer_explanation` explains WHY the answer is right
- [ ] Question tagged with correct `type`, `difficulty_tier`, `cognitive_verb`, `question_stem`
- [ ] No trick questions or gotchas
- [ ] Historical accuracy verified

---

## 80 Questions Distribution Plan

For the initial 5th Grade History content:

### Age of Exploration (25 questions)
| Subtopic | K Questions | W Questions | Total |
|----------|-------------|-------------|-------|
| Columbus | 5 | 4 | 9 |
| Spanish Explorers | 4 | 3 | 7 |
| English/French Explorers | 4 | 3 | 7 |
| Impact on Native Americans | 1 | 1 | 2 |

### American Revolution (30 questions)
| Subtopic | K Questions | W Questions | Total |
|----------|-------------|-------------|-------|
| Causes of Revolution | 4 | 5 | 9 |
| Key Battles | 5 | 4 | 9 |
| Founding Fathers | 5 | 3 | 8 |
| Declaration/Constitution | 2 | 2 | 4 |

### The Acts (25 questions)
| Subtopic | K Questions | W Questions | Total |
|----------|-------------|-------------|-------|
| Stamp Act | 4 | 3 | 7 |
| Tea Act | 4 | 3 | 7 |
| Intolerable Acts | 4 | 3 | 7 |
| Comparing Acts | 1 | 3 | 4 |

**Total: 80 questions** (42 Knowledge, 38 Wisdom)

---

## Mnemonic Types

### Rhyme
"Columbus sailed the ocean blue in fourteen hundred ninety-two!"

### Acronym
"HOMES = Huron, Ontario, Michigan, Erie, Superior" (Great Lakes)

### Story/Narrative
"Imagine the colonists at a tea party, so mad about taxes they throw the tea overboard!"

### Visual/Association
"The Stamp Act - think of a STAMP on PAPER. Stamp Act = Paper Tax"

### Chunking
"1776 - Seventeen seventy-SIX = independence day of the USA which has SIXTH month July as important"

---

## Socratic Hint Guidelines

### Level 1: Broad Nudge
- Points student in the right direction
- Doesn't reveal any specific information
- "Think about what the colonists wanted..."

### Level 2: Narrowing Focus
- Gets more specific about the concept
- Still doesn't reveal the answer
- "What was happening with taxes at this time? Who was making the tax decisions?"

### Level 3: Direct Scaffold
- Provides most of the reasoning
- Student just needs to make final connection
- "The colonists couldn't vote for members of Parliament. If you can't vote for the people making laws about your money, how might that feel?"
