# Socrates Agent Specification

## Overview

Socrates is the heart of the Virtual Socratic University—an autonomous AI tutor powered by Claude that adapts to each student's needs in real-time. Unlike simple LLM wrappers that follow rigid rules, Socrates is a true **agent** that reasons about student performance, decides which tools to use, and crafts personalized educational experiences.

---

## Why an Agentic Approach?

### Traditional Approach (Rule-Based)
```
IF wrong_answer AND question_type == "knowledge":
    return get_mnemonic()
ELIF wrong_answer AND question_type == "wisdom":
    return get_hint(level=1)
```

**Problems:**
- Rigid, doesn't adapt to context
- Can't consider student history
- One-size-fits-all responses
- No reasoning about *why* the student struggled

### Agentic Approach (Socrates)
```
Socrates observes: "Student got this wrong. Let me think..."
Socrates reasons: "This is the 3rd time they've confused the Stamp Act with Tea Act.
                   They seem to understand causes, just mixing up names.
                   Let me check their history on similar questions..."
Socrates uses tool: get_student_history(topic="the-acts")
Socrates decides: "I should create a memorable comparison between the two Acts,
                   not just give the standard mnemonic."
```

**Benefits:**
- Contextual awareness across sessions
- Personalized interventions based on patterns
- Natural reasoning visible in responses
- Can handle edge cases gracefully

---

## Claude SDK Integration

### Installation

```bash
pip install anthropic
```

### Core Client Setup

```python
# backend/agents/socrates.py

import anthropic
from typing import List, Dict, Any
import json

class SocratesAgent:
    """
    The Socrates Agent - An autonomous AI tutor powered by Claude.

    Socrates can:
    - Analyze student responses and diagnose misconceptions
    - Access student history to personalize feedback
    - Choose appropriate interventions (mnemonics, hints, explanations)
    - Adjust difficulty based on observed performance
    - Engage in Socratic dialogue for wisdom questions
    """

    def __init__(self, db_session, redis_client):
        self.client = anthropic.Anthropic()  # Uses ANTHROPIC_API_KEY env var
        self.db = db_session
        self.cache = redis_client
        self.model = "claude-sonnet-4-20250514"
        self.max_tokens = 1024

    async def respond_to_answer(
        self,
        session_context: dict,
        question: dict,
        student_answer: str,
        is_correct: bool
    ) -> dict:
        """
        Main entry point - Socrates responds to a student's answer.

        This is an agentic interaction where Claude:
        1. Receives context about the question and answer
        2. Decides which tools to use (if any)
        3. Reasons about the best response
        4. Returns personalized feedback
        """

        # Build the context message for Socrates
        context = self._build_context(session_context, question, student_answer, is_correct)

        messages = [{"role": "user", "content": context}]

        # Agentic loop - Claude may call tools multiple times
        while True:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=SOCRATES_SYSTEM_PROMPT,
                tools=SOCRATES_TOOLS,
                messages=messages
            )

            # Check if Claude wants to use a tool
            if response.stop_reason == "tool_use":
                # Process tool calls
                tool_results = await self._process_tool_calls(response.content)

                # Add assistant message and tool results to conversation
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})

            else:
                # Claude is done reasoning, extract final response
                return self._extract_feedback(response.content)

    async def _process_tool_calls(self, content: List) -> List[dict]:
        """Execute tool calls and return results."""
        results = []

        for block in content:
            if block.type == "tool_use":
                tool_name = block.name
                tool_input = block.input

                # Execute the appropriate tool
                result = await self._execute_tool(tool_name, tool_input)

                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result)
                })

        return results

    async def _execute_tool(self, tool_name: str, tool_input: dict) -> dict:
        """Route tool calls to their implementations."""

        tool_handlers = {
            "get_student_history": self._tool_get_student_history,
            "fetch_mnemonic": self._tool_fetch_mnemonic,
            "get_socratic_hints": self._tool_get_socratic_hints,
            "analyze_distractor": self._tool_analyze_distractor,
            "get_related_questions": self._tool_get_related_questions,
            "record_misconception": self._tool_record_misconception,
            "suggest_difficulty_change": self._tool_suggest_difficulty_change,
        }

        handler = tool_handlers.get(tool_name)
        if handler:
            return await handler(tool_input)
        else:
            return {"error": f"Unknown tool: {tool_name}"}
```

---

## Socrates System Prompt

```python
SOCRATES_SYSTEM_PROMPT = """
You are Socrates, a wise and encouraging tutor helping 5th-grade students learn American History.

## Your Identity
You are not a robot or a test-grading machine. You are a mentor who genuinely loves history
and believes every student can develop both Knowledge (facts) and Wisdom (understanding).
You speak to students as capable thinkers, never talking down to them.

## Your Core Philosophy
- **Celebrate effort**, not just correctness. Wrong answers are learning opportunities.
- **For Knowledge gaps** (forgotten facts): Provide memorable tricks, associations, or rhymes.
- **For Wisdom gaps** (missing connections): NEVER give the answer directly. Ask guiding
  questions that lead the student to discover the insight themselves.
- **Recognize patterns**: Use tools to check if this is a recurring struggle. Persistent
  confusion needs a different approach than a one-time slip.

## Your Voice
- Warm and encouraging, like a favorite teacher
- Uses simple, age-appropriate language (5th grade level)
- Short sentences—don't lecture
- Occasionally shares interesting historical tidbits
- Shows genuine enthusiasm: "Oh, that's such an interesting question to think about!"

## How to Respond

### When the student is CORRECT:
1. Celebrate briefly (one sentence)
2. Optionally add a fascinating related fact
3. Keep energy high but don't overdo it

### When the student is WRONG on a KNOWLEDGE question:
1. Be encouraging ("Good try! This one is tricky...")
2. Use the `fetch_mnemonic` tool to get a memory trick
3. If they've missed similar questions before (check with `get_student_history`),
   try a DIFFERENT approach than last time
4. Explain what makes this fact memorable

### When the student is WRONG on a WISDOM question:
1. Acknowledge their thinking ("I see where you're coming from...")
2. Use `get_socratic_hints` to get guiding questions
3. Ask ONE guiding question—don't overwhelm them
4. DO NOT reveal the correct answer
5. Encourage them to think it through

### When you notice a pattern:
- Use `get_student_history` to check past performance
- Use `record_misconception` to track persistent confusions
- Adapt your approach based on what has/hasn't worked before

## What You Must NEVER Do
- Give away answers to Wisdom questions directly
- Be condescending or use baby talk
- Write more than 3-4 sentences of feedback
- Use complex vocabulary inappropriate for 5th grade
- Make the student feel bad about mistakes

## Output Format
After using any tools you need, provide your final response as JSON:
{
    "feedback_text": "Your message to the student",
    "feedback_type": "celebration|mnemonic|socratic_hint|encouragement",
    "avatar_emotion": "happy|encouraging|thinking|curious|celebrating",
    "follow_up_question": null or "A Socratic question for Wisdom gaps",
    "internal_notes": "Brief note about why you chose this approach (for logging)"
}
"""
```

---

## Socrates Tool Definitions

```python
SOCRATES_TOOLS = [
    {
        "name": "get_student_history",
        "description": """Retrieve the student's past performance on questions related to a specific
        topic or concept. Use this to understand patterns—are they consistently struggling with
        certain types of questions? Have they seen similar content before? This helps you
        personalize your response rather than giving generic feedback.""",
        "input_schema": {
            "type": "object",
            "properties": {
                "student_id": {
                    "type": "string",
                    "description": "The student's unique identifier"
                },
                "topic_slug": {
                    "type": "string",
                    "description": "Topic to check history for (e.g., 'stamp-act', 'columbus')"
                },
                "question_type": {
                    "type": "string",
                    "enum": ["knowledge", "wisdom", "any"],
                    "description": "Filter by question type"
                },
                "limit": {
                    "type": "integer",
                    "description": "Number of recent attempts to retrieve (default: 10)"
                }
            },
            "required": ["student_id"]
        }
    },
    {
        "name": "fetch_mnemonic",
        "description": """Get a mnemonic (memory trick) for a specific question. Use this when a
        student gets a Knowledge question wrong and needs help remembering the fact. Mnemonics
        include rhymes ('Columbus sailed the ocean blue in 1492'), acronyms, visual associations,
        and memorable stories.""",
        "input_schema": {
            "type": "object",
            "properties": {
                "question_id": {
                    "type": "string",
                    "description": "The question's unique identifier"
                }
            },
            "required": ["question_id"]
        }
    },
    {
        "name": "get_socratic_hints",
        "description": """Retrieve progressive Socratic hints for a Wisdom question. These are
        guiding questions that lead the student toward understanding WITHOUT revealing the answer.

        Level 1: Broad nudge ("Think about what the colonists wanted...")
        Level 2: Narrower focus ("What was happening with taxes? Who decided them?")
        Level 3: Direct scaffold ("If you can't vote for lawmakers, how might that feel?")

        Start with Level 1. Only escalate if the student continues to struggle.""",
        "input_schema": {
            "type": "object",
            "properties": {
                "question_id": {
                    "type": "string",
                    "description": "The question's unique identifier"
                },
                "hint_level": {
                    "type": "integer",
                    "enum": [1, 2, 3],
                    "description": "Which level of hint to retrieve (1=broad, 3=specific)"
                }
            },
            "required": ["question_id"]
        }
    },
    {
        "name": "analyze_distractor",
        "description": """Get detailed information about why a particular wrong answer (distractor)
        is incorrect and why students commonly choose it. Use this to understand the student's
        misconception and address it directly.

        Returns:
        - Why students commonly pick this wrong answer
        - The specific confusion (e.g., "confusing Columbus with Vespucci")
        - How to differentiate the correct answer from this distractor""",
        "input_schema": {
            "type": "object",
            "properties": {
                "option_id": {
                    "type": "string",
                    "description": "The answer option the student selected"
                }
            },
            "required": ["option_id"]
        }
    },
    {
        "name": "get_related_questions",
        "description": """Find questions related to the current one—either by topic, by concept,
        or by common confusion patterns. Use this to understand the broader context of what the
        student is learning and to make connections between concepts.""",
        "input_schema": {
            "type": "object",
            "properties": {
                "question_id": {
                    "type": "string",
                    "description": "The current question's identifier"
                },
                "relationship_type": {
                    "type": "string",
                    "enum": ["same_topic", "same_concept", "commonly_confused"],
                    "description": "What kind of related questions to find"
                }
            },
            "required": ["question_id"]
        }
    },
    {
        "name": "record_misconception",
        "description": """Record a persistent misconception for this student. Use this when you
        notice a pattern—the student keeps making the same type of mistake across multiple
        questions. This information will be used to:
        1. Generate insights for the parent dashboard
        2. Adjust future question selection
        3. Trigger targeted review sessions""",
        "input_schema": {
            "type": "object",
            "properties": {
                "student_id": {
                    "type": "string",
                    "description": "The student's unique identifier"
                },
                "misconception_type": {
                    "type": "string",
                    "description": "Category of misconception (e.g., 'confuses_acts', 'dates', 'cause_effect')"
                },
                "description": {
                    "type": "string",
                    "description": "Detailed description of the misconception"
                },
                "evidence_question_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Question IDs that demonstrate this misconception"
                }
            },
            "required": ["student_id", "misconception_type", "description"]
        }
    },
    {
        "name": "suggest_difficulty_change",
        "description": """Suggest a change to the session's difficulty tier. Use this when you
        observe that the current difficulty is mismatched with the student's ability:

        - Suggest INCREASE when the student is breezing through questions
        - Suggest DECREASE when the student is clearly frustrated or repeatedly failing
        - Include reasoning so the Orchestrator can make an informed decision

        Note: This is a suggestion, not a command. The Orchestrator makes the final decision.""",
        "input_schema": {
            "type": "object",
            "properties": {
                "session_id": {
                    "type": "string",
                    "description": "The current session identifier"
                },
                "direction": {
                    "type": "string",
                    "enum": ["increase", "decrease", "maintain"],
                    "description": "Suggested direction of difficulty change"
                },
                "reasoning": {
                    "type": "string",
                    "description": "Why you're suggesting this change"
                },
                "confidence": {
                    "type": "number",
                    "description": "How confident you are (0.0 to 1.0)"
                }
            },
            "required": ["session_id", "direction", "reasoning"]
        }
    }
]
```

---

## Tool Implementations

```python
class SocratesAgent:
    # ... (previous code)

    async def _tool_get_student_history(self, input: dict) -> dict:
        """Retrieve student's past performance."""
        student_id = input["student_id"]
        topic_slug = input.get("topic_slug")
        question_type = input.get("question_type", "any")
        limit = input.get("limit", 10)

        query = """
            SELECT
                qa.question_id,
                q.question_text,
                q.question_type,
                qa.is_correct,
                qa.feedback_type,
                qa.created_at,
                ao.option_text as selected_answer
            FROM question_attempts qa
            JOIN questions q ON qa.question_id = q.id
            JOIN learning_sessions ls ON qa.session_id = ls.id
            LEFT JOIN answer_options ao ON qa.selected_option_id = ao.id
            WHERE ls.student_id = :student_id
        """

        params = {"student_id": student_id, "limit": limit}

        if topic_slug:
            query += " AND q.topic_id = (SELECT id FROM topics WHERE slug = :topic_slug)"
            params["topic_slug"] = topic_slug

        if question_type != "any":
            query += " AND q.question_type = :question_type"
            params["question_type"] = question_type

        query += " ORDER BY qa.created_at DESC LIMIT :limit"

        results = await self.db.execute(query, params)

        history = []
        correct_count = 0
        for row in results:
            history.append({
                "question_text": row.question_text[:100] + "...",
                "question_type": row.question_type,
                "was_correct": row.is_correct,
                "selected_answer": row.selected_answer,
                "feedback_given": row.feedback_type,
                "when": row.created_at.isoformat()
            })
            if row.is_correct:
                correct_count += 1

        return {
            "total_attempts": len(history),
            "correct_count": correct_count,
            "accuracy": correct_count / len(history) if history else 0,
            "recent_attempts": history,
            "pattern_notes": self._analyze_patterns(history)
        }

    def _analyze_patterns(self, history: list) -> str:
        """Analyze patterns in student history."""
        if not history:
            return "No previous attempts on this topic."

        # Simple pattern detection
        recent_correct = sum(1 for h in history[:5] if h["was_correct"])

        if recent_correct >= 4:
            return "Student is performing well recently on this topic."
        elif recent_correct <= 1:
            return "Student is struggling with this topic - consider simpler approaches."
        else:
            return "Mixed performance - student may benefit from reinforcement."

    async def _tool_fetch_mnemonic(self, input: dict) -> dict:
        """Fetch mnemonic for a question."""
        question_id = input["question_id"]

        result = await self.db.execute("""
            SELECT mnemonic_text, mnemonic_type, effectiveness_score
            FROM mnemonics
            WHERE question_id = :question_id
            ORDER BY effectiveness_score DESC
            LIMIT 1
        """, {"question_id": question_id})

        row = result.fetchone()
        if row:
            return {
                "mnemonic": row.mnemonic_text,
                "type": row.mnemonic_type,
                "effectiveness": row.effectiveness_score
            }
        else:
            return {
                "mnemonic": None,
                "note": "No pre-written mnemonic available. Create one based on the question content."
            }

    async def _tool_get_socratic_hints(self, input: dict) -> dict:
        """Get Socratic hints for a wisdom question."""
        question_id = input["question_id"]
        hint_level = input.get("hint_level", 1)

        result = await self.db.execute("""
            SELECT hint_level, hint_text
            FROM socratic_hints
            WHERE question_id = :question_id AND hint_level <= :hint_level
            ORDER BY hint_level
        """, {"question_id": question_id, "hint_level": hint_level})

        hints = [{"level": row.hint_level, "text": row.hint_text} for row in result]

        return {
            "hints": hints,
            "recommended_level": hint_level,
            "guidance": "Start with the lowest level hint. Only use higher levels if student continues to struggle."
        }

    async def _tool_analyze_distractor(self, input: dict) -> dict:
        """Analyze why a distractor was chosen."""
        option_id = input["option_id"]

        result = await self.db.execute("""
            SELECT
                ao.option_text,
                ao.distractor_type,
                ao.confusion_explanation,
                ao.related_concept,
                q.correct_answer
            FROM answer_options ao
            JOIN questions q ON ao.question_id = q.id
            WHERE ao.id = :option_id
        """, {"option_id": option_id})

        row = result.fetchone()
        if row:
            return {
                "selected_answer": row.option_text,
                "correct_answer": row.correct_answer,
                "distractor_type": row.distractor_type,
                "why_students_pick_this": row.confusion_explanation,
                "related_concept": row.related_concept,
                "teaching_opportunity": f"Help student differentiate between {row.option_text} and {row.correct_answer}"
            }
        return {"error": "Option not found"}

    async def _tool_get_related_questions(self, input: dict) -> dict:
        """Find related questions."""
        question_id = input["question_id"]
        relationship_type = input.get("relationship_type", "same_topic")

        # Get the current question's topic and tags
        current = await self.db.execute("""
            SELECT topic_id, question_type, cognitive_verb
            FROM questions WHERE id = :question_id
        """, {"question_id": question_id})
        current_q = current.fetchone()

        if relationship_type == "same_topic":
            related = await self.db.execute("""
                SELECT id, question_text, question_type, difficulty_tier
                FROM questions
                WHERE topic_id = :topic_id AND id != :question_id
                LIMIT 5
            """, {"topic_id": current_q.topic_id, "question_id": question_id})
        else:
            # Find commonly confused questions
            related = await self.db.execute("""
                SELECT DISTINCT q.id, q.question_text, q.question_type, q.difficulty_tier
                FROM questions q
                JOIN answer_options ao ON q.id = ao.question_id
                WHERE ao.related_concept IN (
                    SELECT related_concept FROM answer_options
                    WHERE question_id = :question_id
                )
                AND q.id != :question_id
                LIMIT 5
            """, {"question_id": question_id})

        return {
            "related_questions": [
                {
                    "id": row.id,
                    "text": row.question_text[:100] + "...",
                    "type": row.question_type,
                    "tier": row.difficulty_tier
                }
                for row in related
            ]
        }

    async def _tool_record_misconception(self, input: dict) -> dict:
        """Record a persistent misconception."""
        await self.db.execute("""
            INSERT INTO learning_insights
            (student_id, insight_type, insight_title, insight_body, supporting_data, confidence_score)
            VALUES (
                :student_id,
                'misconception',
                :misconception_type,
                :description,
                :evidence,
                0.8
            )
        """, {
            "student_id": input["student_id"],
            "misconception_type": input["misconception_type"],
            "description": input["description"],
            "evidence": json.dumps({"question_ids": input.get("evidence_question_ids", [])})
        })

        return {
            "recorded": True,
            "note": "Misconception recorded. Will influence future question selection and parent insights."
        }

    async def _tool_suggest_difficulty_change(self, input: dict) -> dict:
        """Suggest a difficulty adjustment."""
        session_id = input["session_id"]
        direction = input["direction"]
        reasoning = input["reasoning"]
        confidence = input.get("confidence", 0.5)

        # Store suggestion for Orchestrator to consider
        await self.cache.set(
            f"difficulty_suggestion:{session_id}",
            json.dumps({
                "direction": direction,
                "reasoning": reasoning,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat()
            }),
            ex=300  # 5 minute expiry
        )

        return {
            "suggestion_recorded": True,
            "direction": direction,
            "note": "Suggestion submitted to Orchestrator for consideration."
        }
```

---

## Example Interaction Flow

### Scenario: Student gets a Knowledge question wrong

```
Student answers: "B) Amerigo Vespucci" (incorrect)
Correct answer: "A) Christopher Columbus"
Question type: Knowledge
```

**Socrates' Internal Process:**

```
1. [THINKING] Student got this wrong. This is a Knowledge question about
   who discovered America. Let me understand the context better.

2. [TOOL CALL] analyze_distractor(option_id="opt-b-vespucci")
   → Returns: {
       "distractor_type": "common_confusion",
       "why_students_pick_this": "America is named after Vespucci,
        so students often think he discovered it",
       "teaching_opportunity": "Explain that naming ≠ discovering"
     }

3. [TOOL CALL] get_student_history(student_id="...", topic_slug="columbus")
   → Returns: {
       "accuracy": 0.6,
       "pattern_notes": "First time confusing Columbus with Vespucci"
     }

4. [TOOL CALL] fetch_mnemonic(question_id="...")
   → Returns: {
       "mnemonic": "Columbus sailed the ocean blue in 1492!",
       "type": "rhyme"
     }

5. [REASONING] This is their first time making this confusion. The mnemonic
   is good, but I should also address WHY they might have picked Vespucci—
   the naming confusion.

6. [FINAL RESPONSE]
   {
     "feedback_text": "Good try! It's easy to think Vespucci discovered
      America since it's named after him. But actually, Columbus arrived
      first in 1492. Here's a fun rhyme to remember: 'Columbus sailed the
      ocean blue in fourteen hundred ninety-two!'",
     "feedback_type": "mnemonic",
     "avatar_emotion": "encouraging",
     "follow_up_question": null,
     "internal_notes": "First Columbus/Vespucci confusion. Addressed naming
      misconception and provided rhyme mnemonic."
   }
```

### Scenario: Student gets a Wisdom question wrong (repeatedly)

```
Student answers: "A) Colonists couldn't afford the taxes" (incorrect)
Correct answer: "C) Colonists had no voice in tax decisions"
Question type: Wisdom
Previous attempts: Failed similar question twice before
```

**Socrates' Internal Process:**

```
1. [THINKING] Wrong answer on a Wisdom question. They're missing the
   "representation" concept. Let me check if this is a pattern.

2. [TOOL CALL] get_student_history(student_id="...", topic_slug="revolution-causes")
   → Returns: {
       "accuracy": 0.33,
       "pattern_notes": "Student is struggling - missed 2/3 'why' questions
        about taxation"
     }

3. [TOOL CALL] analyze_distractor(option_id="opt-a-afford")
   → Returns: {
       "distractor_type": "plausible_but_wrong",
       "why_students_pick_this": "Focuses on money aspect rather than
        representation principle"
     }

4. [TOOL CALL] get_socratic_hints(question_id="...", hint_level=2)
   → Returns: {
       "hints": [
         {"level": 1, "text": "Think about what 'representation' means..."},
         {"level": 2, "text": "If someone made rules about YOUR allowance
          without asking you, how would that feel?"}
       ]
     }

5. [TOOL CALL] record_misconception(
     student_id="...",
     misconception_type="taxation_principle",
     description="Focuses on monetary aspect of taxes rather than
      representation principle"
   )

6. [REASONING] They keep focusing on the money aspect, not the principle.
   The level 2 hint uses a relatable analogy. Since they've struggled
   before, I'll use the more specific hint.

7. [FINAL RESPONSE]
   {
     "feedback_text": "I see your thinking—taxes do involve money! But
      the colonists actually could afford the taxes. The real issue was
      something else. Think about this: if someone made rules about YOUR
      allowance without asking you, how would that feel?",
     "feedback_type": "socratic_hint",
     "avatar_emotion": "curious",
     "follow_up_question": "Who was making the tax laws, and did the
      colonists get a vote?",
     "internal_notes": "Recurring misconception about taxation. Using
      allowance analogy (level 2 hint). Recorded misconception for
      parent dashboard."
   }
```

---

## Integration with Orchestrator

The Orchestrator coordinates with Socrates but doesn't control the agent's reasoning:

```python
class OrchestratorService:
    def __init__(self, librarian, socrates_agent):
        self.librarian = librarian
        self.socrates = socrates_agent

    async def submit_answer(self, session_id: str, answer: str) -> dict:
        state = await self._load_state(session_id)
        question = await self.librarian.get_question_metadata(state.current_question_id)

        # Determine correctness (simple check)
        is_correct = self._check_answer(question, answer)

        # Let Socrates handle the response (agentic)
        feedback = await self.socrates.respond_to_answer(
            session_context={
                "session_id": session_id,
                "student_id": state.student_id,
                "current_streak": state.current_streak,
                "hearts_remaining": state.hearts_remaining,
                "current_tier": state.current_tier
            },
            question=question,
            student_answer=answer,
            is_correct=is_correct
        )

        # Check if Socrates suggested a difficulty change
        suggestion = await self._get_difficulty_suggestion(session_id)
        if suggestion and suggestion["confidence"] > 0.7:
            # Consider Socrates' suggestion in state update
            pass

        # Update state based on correctness
        new_state = await self._apply_answer_result(state, is_correct, feedback)

        return {
            "feedback": feedback,
            "session_state": self._public_state(new_state),
            "session_ended": self._should_end_session(new_state)
        }
```

---

## Configuration

```python
# config/socrates.py

SOCRATES_CONFIG = {
    # Model settings
    "model": "claude-sonnet-4-20250514",  # Or "claude-opus-4-20250514" for complex reasoning
    "max_tokens": 1024,
    "temperature": 0.3,  # Low for consistency

    # Tool usage limits
    "max_tool_calls_per_response": 5,
    "tool_call_timeout_seconds": 10,

    # Fallback behavior
    "fallback_on_error": True,
    "fallback_responses": {
        "correct": "Great job! You got it right!",
        "incorrect_knowledge": "Not quite, but keep trying! Let me help you remember this.",
        "incorrect_wisdom": "Interesting thinking! Let's explore this a bit more."
    },

    # Caching
    "cache_tool_results": True,
    "cache_ttl_seconds": 300
}
```

---

## Monitoring & Observability

```python
# Track agent performance
METRICS = {
    "socrates_response_time": Histogram,
    "socrates_tool_calls": Counter,
    "socrates_feedback_types": Counter,
    "socrates_errors": Counter
}

async def respond_to_answer(self, ...):
    start_time = time.time()

    try:
        response = await self._agent_loop(...)

        METRICS["socrates_response_time"].observe(time.time() - start_time)
        METRICS["socrates_feedback_types"].inc(response["feedback_type"])

        return response

    except Exception as e:
        METRICS["socrates_errors"].inc()
        logger.error(f"Socrates error: {e}")
        return self._fallback_response(...)
```
