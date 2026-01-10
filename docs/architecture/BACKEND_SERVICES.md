# Virtual Socratic University - Backend Services Specification

## Overview

The backend consists of three core services that work together to create the agentic tutoring experience. This document specifies each service's responsibilities, interfaces, and implementation details.

---

## Service 1: The Librarian (Deterministic Logic)

### Role
The Librarian is the **cataloger and content manager**. It handles all question retrieval, categorization, and composite question generation. This service MUST be deterministic - it should never hallucinate or generate unpredictable content.

### Responsibilities

1. **Question Retrieval**: Fetch questions based on difficulty tier, topic, and type
2. **Question Categorization**: Maintain and apply Knowledge/Wisdom classification
3. **Composite Generation**: Create "Both A and B" and "All of the Above" questions
4. **Deduplication**: Ensure students don't see repeated questions within a session
5. **Hash Caching**: Maintain consistent options for composite questions

### Class Design

```python
# backend/services/librarian.py

from dataclasses import dataclass
from enum import Enum
from typing import List, Optional
import hashlib
import json

class QuestionType(Enum):
    KNOWLEDGE = "knowledge"
    WISDOM = "wisdom"

class DifficultyTier(Enum):
    BASIC = 1           # Simple recall: "Who discovered America?"
    INTERMEDIATE = 2    # Contextual recall: "Which explorer sailed for Spain?"
    HARD = 3            # Single application: "Why did Columbus sail west?"
    EXTRA_HARD = 4      # Multi-concept: "Both the Stamp Act AND Tea Act caused..."

@dataclass
class QuestionRequest:
    topic_id: str
    difficulty_tier: DifficultyTier
    question_type: Optional[QuestionType] = None  # None = either type
    exclude_question_ids: List[str] = None        # Already asked this session
    prefer_composite: bool = False                 # Request "Both A and B" style

@dataclass
class QuestionPayload:
    question_id: str
    question_text: str
    question_type: QuestionType
    difficulty_tier: DifficultyTier
    options: List[dict]  # [{"id": "...", "label": "A", "text": "..."}]
    topic_id: str
    is_composite: bool
    composite_hash: Optional[str] = None  # For caching


class LibrarianService:
    """
    The Librarian: Deterministic question management.

    Design Principles:
    - NO randomness in option ordering for returning questions
    - Hash-based caching for composite questions
    - Strict separation from LLM logic
    """

    def __init__(self, db_session, redis_client):
        self.db = db_session
        self.cache = redis_client

    async def get_question(self, request: QuestionRequest) -> QuestionPayload:
        """
        Fetch a single question matching the criteria.

        Algorithm:
        1. Query questions table with filters
        2. Exclude already-asked questions
        3. If prefer_composite and tier >= 3, generate composite
        4. Return formatted payload
        """
        pass

    async def generate_composite_question(
        self,
        topic_id: str,
        source_questions: List[str],  # 2-3 question IDs to combine
    ) -> QuestionPayload:
        """
        Create a "Both A and B" or "All of the Above" question.

        Algorithm:
        1. Fetch the source questions
        2. Combine correct answers into one option
        3. Select 2-3 distractors from wrong answers
        4. Create hash of option set
        5. Check cache - if hash exists, return cached version
        6. If not, create new composite and cache it

        Example Output:
        Q: "Which of the following are true about the Boston Tea Party?"
        A) Colonists dumped tea into the harbor
        B) It was a protest against the Tea Act
        C) Both A and B ← Correct
        D) Neither A nor B
        """
        pass

    def _generate_composite_hash(self, question_ids: List[str], options: List[dict]) -> str:
        """
        Create deterministic hash for composite question caching.

        Ensures that if a student sees this composite again,
        the options are in the exact same order.
        """
        payload = {
            "sources": sorted(question_ids),
            "options": [{"label": o["label"], "text": o["text"]} for o in options]
        }
        return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:16]

    async def get_question_metadata(self, question_id: str) -> dict:
        """
        Fetch full question data including correct answer.
        INTERNAL USE ONLY - never expose to client.
        """
        pass

    async def get_distractor_info(self, option_id: str) -> dict:
        """
        Get information about why a wrong answer is wrong.
        Used by Tutor to explain mistakes.

        Returns:
        {
            "distractor_type": "common_confusion",
            "confusion_explanation": "Students often confuse Columbus with Vespucci because...",
            "related_concept": "Multiple explorers sailed for Spain"
        }
        """
        pass

    async def get_mnemonic(self, question_id: str) -> Optional[str]:
        """
        Retrieve memory aid for Knowledge questions.
        Returns None if no mnemonic exists.
        """
        pass

    async def get_socratic_hints(self, question_id: str) -> List[dict]:
        """
        Retrieve progressive hints for Wisdom questions.

        Returns list ordered by hint_level (1, 2, 3).
        """
        pass
```

### Question Selection Algorithm

```python
async def select_next_question(
    session_state: SessionState,
    librarian: LibrarianService
) -> QuestionPayload:
    """
    Main question selection algorithm.

    Factors:
    1. Current difficulty tier (based on streak)
    2. Balance K/W questions (alternate types)
    3. Topic coverage (don't over-test one area)
    4. Avoid repeats within session
    """

    # Determine target difficulty
    if session_state.current_streak >= 3:
        target_tier = min(session_state.current_tier + 1, 4)
    elif session_state.current_streak <= -2:  # 2 wrong in a row
        target_tier = max(session_state.current_tier - 1, 1)
    else:
        target_tier = session_state.current_tier

    # Determine question type (alternate K/W)
    last_type = session_state.last_question_type
    prefer_type = QuestionType.WISDOM if last_type == QuestionType.KNOWLEDGE else QuestionType.KNOWLEDGE

    # Should we try composite?
    prefer_composite = target_tier >= 3 and session_state.questions_answered >= 5

    request = QuestionRequest(
        topic_id=session_state.topic_id,
        difficulty_tier=DifficultyTier(target_tier),
        question_type=prefer_type,
        exclude_question_ids=session_state.asked_questions,
        prefer_composite=prefer_composite
    )

    return await librarian.get_question(request)
```

---

## Service 2: The Socrates Agent (Claude-Powered AI Tutor)

> **Full Specification**: See [SOCRATES_AGENT.md](./SOCRATES_AGENT.md) for complete implementation details.

### Role
The Socrates Agent is an **autonomous AI tutor** powered by Claude via the Anthropic SDK. Unlike a simple LLM wrapper, Socrates is a true agent that reasons about student performance, decides which tools to use, and crafts personalized educational responses.

### Key Difference from Traditional Approach

**Old (Rule-Based):**
```python
if wrong and question_type == "knowledge":
    return get_mnemonic()  # Always the same response
```

**New (Agentic):**
```python
# Socrates autonomously decides what to do
response = socrates_agent.respond_to_answer(context, question, answer)
# Socrates might:
# 1. Check student history to see if this is a pattern
# 2. Analyze why they picked that specific wrong answer
# 3. Decide between mnemonic, explanation, or Socratic question
# 4. Record a misconception if pattern detected
```

### Anthropic SDK Integration

```python
import anthropic

class SocratesAgent:
    def __init__(self):
        self.client = anthropic.Anthropic()
        self.model = "claude-sonnet-4-20250514"

    async def respond_to_answer(self, context, question, answer, is_correct):
        messages = [{"role": "user", "content": self._build_context(...)}]

        # Agentic loop - Claude may call tools multiple times
        while True:
            response = self.client.messages.create(
                model=self.model,
                system=SOCRATES_SYSTEM_PROMPT,
                tools=SOCRATES_TOOLS,
                messages=messages
            )

            if response.stop_reason == "tool_use":
                # Execute tools Claude requested
                tool_results = await self._process_tool_calls(response.content)
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})
            else:
                return self._extract_feedback(response.content)
```

### Tools Available to Socrates

| Tool | Purpose |
|------|---------|
| `get_student_history` | Check past performance to personalize response |
| `fetch_mnemonic` | Get memory trick for Knowledge questions |
| `get_socratic_hints` | Get progressive guiding questions for Wisdom questions |
| `analyze_distractor` | Understand why the student chose a specific wrong answer |
| `record_misconception` | Track patterns for parent dashboard insights |
| `suggest_difficulty_change` | Recommend tier adjustment to Orchestrator |

### System Prompt Overview

```python
SOCRATES_SYSTEM_PROMPT = """
You are Socrates, a wise and encouraging tutor helping 5th-grade students
learn American History.

## Your Core Philosophy
- Celebrate effort, not just correctness
- For Knowledge gaps: Provide memorable tricks
- For Wisdom gaps: NEVER give answers directly; ask guiding questions
- Recognize patterns: Use tools to check if this is a recurring struggle

## Your Voice
- Warm and encouraging, like a favorite teacher
- Simple, age-appropriate language (5th grade level)
- Short sentences—don't lecture
- Shows genuine enthusiasm
...
"""
```

For complete system prompt, tool definitions, and implementation details, see [SOCRATES_AGENT.md](./SOCRATES_AGENT.md).

---

## Service 3: The Orchestrator (State Machine)

### Role
The Orchestrator is the **game master**. It manages session state, controls difficulty progression, and coordinates between the Librarian and Tutor.

### Responsibilities

1. **Session Management**: Create, update, and close learning sessions
2. **Streak Tracking**: Monitor consecutive correct/incorrect answers
3. **Difficulty Adjustment**: Signal tier changes based on performance
4. **Hearts/Lives System**: Track remaining lives
5. **End Conditions**: Determine when session completes

### State Machine Design

```python
# backend/services/orchestrator.py

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional
from datetime import datetime

class SessionStatus(Enum):
    INITIALIZING = "initializing"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"  # Ran out of hearts

class GameEvent(Enum):
    SESSION_START = "session_start"
    QUESTION_PRESENTED = "question_presented"
    ANSWER_SUBMITTED = "answer_submitted"
    STREAK_ACHIEVED = "streak_achieved"
    TIER_UP = "tier_up"
    TIER_DOWN = "tier_down"
    HEART_LOST = "heart_lost"
    SESSION_COMPLETE = "session_complete"
    SESSION_FAILED = "session_failed"

@dataclass
class SessionState:
    """Immutable session state - each action creates new state."""
    session_id: str
    student_id: str
    topic_id: str
    status: SessionStatus

    # Progress
    current_tier: int = 1
    questions_answered: int = 0
    questions_correct: int = 0
    knowledge_correct: int = 0
    wisdom_correct: int = 0

    # Streak
    current_streak: int = 0
    max_streak: int = 0
    last_question_type: Optional[str] = None

    # Lives
    hearts_remaining: int = 3

    # Tracking
    asked_questions: List[str] = field(default_factory=list)
    current_question_id: Optional[str] = None
    question_presented_at: Optional[datetime] = None

    # XP
    total_xp: int = 0

    # Rating changes (calculated at end)
    knowledge_rating_delta: int = 0
    wisdom_rating_delta: int = 0


class OrchestratorService:
    """
    The Orchestrator: Game flow state machine.

    Design Principles:
    - Immutable state transitions
    - Event-driven architecture
    - Clear end conditions
    """

    def __init__(self, db_session, redis_client, librarian, socrates_agent):
        self.db = db_session
        self.cache = redis_client
        self.librarian = librarian
        self.socrates = socrates_agent  # The Claude-powered Socrates Agent

    async def start_session(
        self,
        student_id: str,
        topic_id: str
    ) -> SessionState:
        """
        Initialize a new learning session.

        1. Create session in DB
        2. Load student's current rating to set starting tier
        3. Initialize Redis state
        4. Emit SESSION_START event
        """
        # Get student profile for starting tier
        student = await self._get_student_profile(student_id)
        starting_tier = self._calculate_starting_tier(student.overall_rating)

        state = SessionState(
            session_id=generate_uuid(),
            student_id=student_id,
            topic_id=topic_id,
            status=SessionStatus.ACTIVE,
            current_tier=starting_tier
        )

        await self._persist_state(state)
        await self._emit_event(GameEvent.SESSION_START, state)

        return state

    async def get_next_question(
        self,
        session_id: str
    ) -> dict:
        """
        Request next question for the session.

        1. Load current state
        2. Determine target difficulty and type
        3. Call Librarian for question
        4. Update state with current question
        5. Return question payload (without correct answer)
        """
        state = await self._load_state(session_id)

        question = await self.librarian.get_question(
            QuestionRequest(
                topic_id=state.topic_id,
                difficulty_tier=DifficultyTier(state.current_tier),
                exclude_question_ids=state.asked_questions,
                prefer_composite=(state.current_tier >= 3)
            )
        )

        # Update state
        new_state = self._transition(state, {
            "current_question_id": question.question_id,
            "question_presented_at": datetime.utcnow(),
            "asked_questions": state.asked_questions + [question.question_id]
        })

        await self._persist_state(new_state)
        await self._emit_event(GameEvent.QUESTION_PRESENTED, new_state)

        return {
            "question": question,
            "session_state": self._public_state(new_state)
        }

    async def submit_answer(
        self,
        session_id: str,
        answer: str
    ) -> dict:
        """
        Process student's answer submission.

        1. Load state and validate
        2. Determine correctness (simple DB check)
        3. Let Socrates Agent handle feedback (agentic reasoning)
        4. Update streak, hearts, tier
        5. Check end conditions
        6. Return feedback and updated state
        """
        state = await self._load_state(session_id)
        question_id = state.current_question_id

        # Get question metadata
        question_data = await self.librarian.get_question_metadata(question_id)
        question_type = QuestionType(question_data["question_type"])

        # Simple correctness check (deterministic)
        is_correct = self._check_answer(question_data, answer)

        # Let Socrates Agent handle feedback generation (agentic)
        # Socrates will autonomously decide:
        # - Whether to check student history
        # - Whether to fetch mnemonics or hints
        # - How to phrase the feedback
        # - Whether to record a misconception
        feedback = await self.socrates.respond_to_answer(
            session_context={
                "session_id": session_id,
                "student_id": state.student_id,
                "current_streak": state.current_streak,
                "hearts_remaining": state.hearts_remaining,
                "current_tier": state.current_tier
            },
            question=question_data,
            student_answer=answer,
            is_correct=is_correct
        )

        # Check if Socrates suggested a difficulty change
        difficulty_suggestion = await self._get_socrates_difficulty_suggestion(session_id)

        # Calculate state changes
        new_state = await self._apply_answer_result(
            state, is_correct, question_type, feedback.get("xp_earned", 10)
        )

        # Check end conditions
        if self._should_end_session(new_state):
            new_state = self._transition(new_state, {
                "status": SessionStatus.COMPLETED if new_state.hearts_remaining > 0 else SessionStatus.FAILED
            })
            await self._emit_event(
                GameEvent.SESSION_COMPLETE if new_state.status == SessionStatus.COMPLETED else GameEvent.SESSION_FAILED,
                new_state
            )

        await self._persist_state(new_state)
        await self._record_attempt(state, answer, grading_result, feedback)

        return {
            "feedback": feedback,
            "session_state": self._public_state(new_state),
            "session_ended": new_state.status in [SessionStatus.COMPLETED, SessionStatus.FAILED]
        }

    async def _apply_answer_result(
        self,
        state: SessionState,
        is_correct: bool,
        question_type: QuestionType,
        xp_earned: int
    ) -> SessionState:
        """Apply answer result to session state."""

        changes = {
            "questions_answered": state.questions_answered + 1,
            "total_xp": state.total_xp + xp_earned,
            "last_question_type": question_type.value,
            "current_question_id": None,
            "question_presented_at": None
        }

        if is_correct:
            changes["questions_correct"] = state.questions_correct + 1
            changes["current_streak"] = state.current_streak + 1
            changes["max_streak"] = max(state.max_streak, state.current_streak + 1)

            if question_type == QuestionType.KNOWLEDGE:
                changes["knowledge_correct"] = state.knowledge_correct + 1
            else:
                changes["wisdom_correct"] = state.wisdom_correct + 1

            # Tier up on streak
            if changes["current_streak"] >= 3 and state.current_tier < 4:
                changes["current_tier"] = state.current_tier + 1
                await self._emit_event(GameEvent.TIER_UP, state)
        else:
            changes["current_streak"] = 0
            changes["hearts_remaining"] = state.hearts_remaining - 1
            await self._emit_event(GameEvent.HEART_LOST, state)

            # Tier down after losing heart
            if state.current_tier > 1:
                changes["current_tier"] = state.current_tier - 1
                await self._emit_event(GameEvent.TIER_DOWN, state)

        return self._transition(state, changes)

    def _should_end_session(self, state: SessionState) -> bool:
        """Determine if session should end."""
        # Out of hearts
        if state.hearts_remaining <= 0:
            return True

        # Completed all tiers (3 Extra Hard questions answered)
        if state.current_tier == 4 and state.questions_answered >= 15:
            return True

        # Time limit (handled elsewhere)
        return False

    def _transition(self, state: SessionState, changes: dict) -> SessionState:
        """Create new state with changes applied."""
        return SessionState(**{**state.__dict__, **changes})

    def _public_state(self, state: SessionState) -> dict:
        """Return only client-safe state fields."""
        return {
            "current_tier": state.current_tier,
            "current_streak": state.current_streak,
            "max_streak": state.max_streak,
            "hearts_remaining": state.hearts_remaining,
            "questions_answered": state.questions_answered,
            "total_xp": state.total_xp,
            "knowledge_progress": state.knowledge_correct,
            "wisdom_progress": state.wisdom_correct,
            "status": state.status.value
        }
```

### Session Flow Diagram

```
                    ┌──────────────┐
                    │ START_SESSION│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
         ┌─────────│   ACTIVE     │◄─────────────────────┐
         │         └──────┬───────┘                      │
         │                │                              │
         │                ▼                              │
         │         ┌──────────────┐                      │
         │         │GET_NEXT_     │                      │
         │         │QUESTION      │                      │
         │         └──────┬───────┘                      │
         │                │                              │
         │                ▼                              │
         │         ┌──────────────┐                      │
         │         │QUESTION_     │                      │
         │         │PRESENTED     │                      │
         │         └──────┬───────┘                      │
         │                │                              │
         │                ▼                              │
         │         ┌──────────────┐                      │
         │         │SUBMIT_ANSWER │                      │
         │         └──────┬───────┘                      │
         │                │                              │
         │        ┌───────┴───────┐                      │
         │        │               │                      │
         │        ▼               ▼                      │
         │  ┌──────────┐   ┌──────────┐                  │
         │  │ CORRECT  │   │ INCORRECT│                  │
         │  └────┬─────┘   └────┬─────┘                  │
         │       │              │                        │
         │       │              ▼                        │
         │       │       ┌──────────────┐                │
         │       │       │HEARTS > 0?   │                │
         │       │       └──────┬───────┘                │
         │       │        YES   │   NO                   │
         │       │      ┌───────┴───────┐                │
         │       │      │               │                │
         │       │      │               ▼                │
         │       │      │        ┌──────────────┐        │
         │       │      │        │ GAME_OVER    │        │
         │       │      │        │ (FAILED)     │        │
         │       │      │        └──────────────┘        │
         │       │      │                                │
         │       ▼      ▼                                │
         │  ┌─────────────────┐                          │
         │  │UPDATE_STREAK &  │                          │
         │  │DIFFICULTY       │                          │
         │  └────────┬────────┘                          │
         │           │                                   │
         │           ▼                                   │
         │  ┌─────────────────┐    NO                    │
         │  │END_CONDITIONS?  │──────────────────────────┘
         │  └────────┬────────┘
         │       YES │
         │           ▼
         │  ┌─────────────────┐
         │  │  COMPLETED      │
         │  └─────────────────┘
         │
    PAUSE│
         ▼
  ┌──────────────┐
  │   PAUSED     │
  └──────────────┘
```

---

## Inter-Service Communication

### Request Flow

```
Client                API Gateway        Orchestrator        Librarian          Tutor
  │                       │                   │                  │                │
  │  POST /session/start  │                   │                  │                │
  │──────────────────────>│                   │                  │                │
  │                       │ start_session()   │                  │                │
  │                       │──────────────────>│                  │                │
  │                       │                   │ get_student()    │                │
  │                       │                   │─────────────────>│                │
  │                       │<──────────────────│                  │                │
  │<──────────────────────│                   │                  │                │
  │                       │                   │                  │                │
  │  GET /session/question│                   │                  │                │
  │──────────────────────>│                   │                  │                │
  │                       │ get_next_question()                  │                │
  │                       │──────────────────>│                  │                │
  │                       │                   │ get_question()   │                │
  │                       │                   │─────────────────>│                │
  │                       │                   │<─────────────────│                │
  │                       │<──────────────────│                  │                │
  │<──────────────────────│                   │                  │                │
  │                       │                   │                  │                │
  │  POST /session/answer │                   │                  │                │
  │──────────────────────>│                   │                  │                │
  │                       │ submit_answer()   │                  │                │
  │                       │──────────────────>│                  │                │
  │                       │                   │ grade_answer()   │                │
  │                       │                   │─────────────────────────────────>│
  │                       │                   │<─────────────────────────────────│
  │                       │                   │                  │                │
  │                       │                   │ [if wrong]       │                │
  │                       │                   │ diagnose_failure()               │
  │                       │                   │─────────────────────────────────>│
  │                       │                   │<─────────────────────────────────│
  │                       │                   │                  │                │
  │                       │                   │ generate_feedback()              │
  │                       │                   │─────────────────────────────────>│
  │                       │                   │<─────────────────────────────────│
  │                       │                   │                  │                │
  │                       │<──────────────────│                  │                │
  │<──────────────────────│                   │                  │                │
```

---

## Error Handling

### Service-Specific Errors

```python
class SocratesError(Exception):
    """Base error for all services."""
    pass

class LibrarianError(SocratesError):
    """Errors from the Librarian service."""
    pass

class NoQuestionsAvailableError(LibrarianError):
    """No questions match the criteria (all asked or none exist)."""
    pass

class TutorError(SocratesError):
    """Errors from the Tutor service."""
    pass

class LLMTimeoutError(TutorError):
    """LLM took too long to respond."""
    pass

class OrchestratorError(SocratesError):
    """Errors from the Orchestrator service."""
    pass

class SessionNotFoundError(OrchestratorError):
    """Session ID doesn't exist or expired."""
    pass

class InvalidSessionStateError(OrchestratorError):
    """Action not allowed in current state."""
    pass
```

### Fallback Strategies

1. **LLM Timeout**: Use pre-written generic feedback templates
2. **No Questions Available**: Complete session early with bonus XP
3. **Redis Failure**: Fall back to database for state (slower but functional)
