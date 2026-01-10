# Virtual Socratic University - API Specification

## Overview

This document defines all REST API endpoints for the Virtual Socratic University platform. The API follows RESTful conventions with JSON request/response bodies.

**Base URL**: `https://api.socratic-university.com/v1`

---

## Authentication

All endpoints (except `/auth/*`) require a valid JWT token in the Authorization header.

```
Authorization: Bearer <jwt_token>
```

### Roles
- `student`: Can access learning endpoints
- `parent`: Can access dashboard endpoints + child's progress
- `admin`: Full access (future use)

---

## API Endpoints

### 1. Authentication

#### POST `/auth/register`
Create a new account.

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "securePassword123",
  "display_name": "Sarah",
  "role": "parent"
}
```

**Response (201):**
```json
{
  "user_id": "uuid",
  "email": "parent@example.com",
  "display_name": "Sarah",
  "role": "parent",
  "access_token": "jwt...",
  "refresh_token": "jwt..."
}
```

#### POST `/auth/register/child`
Register a child account (requires parent auth).

**Request:**
```json
{
  "display_name": "Tommy",
  "avatar_choice": "owl",
  "grade_level": 5
}
```

**Response (201):**
```json
{
  "user_id": "uuid",
  "display_name": "Tommy",
  "role": "student",
  "parent_id": "parent-uuid",
  "avatar_choice": "owl",
  "access_code": "TOMMY-1234"  // For child to login
}
```

#### POST `/auth/login`
Authenticate user.

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user_id": "uuid",
  "access_token": "jwt...",
  "refresh_token": "jwt...",
  "role": "parent",
  "children": [
    {"id": "child-uuid", "display_name": "Tommy"}
  ]
}
```

#### POST `/auth/login/child`
Child login with access code.

**Request:**
```json
{
  "access_code": "TOMMY-1234"
}
```

**Response (200):**
```json
{
  "user_id": "uuid",
  "access_token": "jwt...",
  "display_name": "Tommy",
  "avatar_choice": "owl"
}
```

---

### 2. Topics & Content

#### GET `/topics`
List all available topics for the student's grade level.

**Query Parameters:**
- `grade_level` (optional): Filter by grade (default: student's grade)
- `subject` (optional): Filter by subject

**Response (200):**
```json
{
  "topics": [
    {
      "id": "uuid",
      "name": "The Age of Exploration",
      "slug": "age-of-exploration",
      "description": "Learn about the brave explorers who discovered new worlds",
      "icon": "compass",
      "question_count": 20,
      "estimated_time_minutes": 15,
      "student_progress": {
        "completed": false,
        "knowledge_mastery": 0.45,
        "wisdom_mastery": 0.30,
        "last_attempted": "2024-01-10T14:30:00Z"
      }
    },
    {
      "id": "uuid",
      "name": "The American Revolution",
      "slug": "american-revolution",
      "description": "Discover how America fought for independence",
      "icon": "flag",
      "question_count": 30,
      "estimated_time_minutes": 25,
      "student_progress": null  // Not started
    }
  ]
}
```

#### GET `/topics/:topic_id`
Get detailed information about a topic.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "The Age of Exploration",
  "description": "Learn about the brave explorers...",
  "subtopics": [
    {"name": "Christopher Columbus", "question_count": 8},
    {"name": "Other Spanish Explorers", "question_count": 6},
    {"name": "English & French Explorers", "question_count": 6}
  ],
  "learning_objectives": [
    "Identify key explorers and their sponsoring nations",
    "Explain motivations for exploration",
    "Analyze the impact of exploration on native peoples"
  ],
  "prerequisites": [],
  "student_stats": {
    "attempts": 3,
    "best_score": 85,
    "average_time_minutes": 12,
    "mastery_level": "intermediate"
  }
}
```

---

### 3. Learning Sessions

#### POST `/sessions`
Start a new learning session.

**Request:**
```json
{
  "topic_id": "uuid"
}
```

**Response (201):**
```json
{
  "session_id": "uuid",
  "topic": {
    "id": "uuid",
    "name": "The Age of Exploration"
  },
  "initial_state": {
    "current_tier": 1,
    "hearts_remaining": 3,
    "current_streak": 0,
    "total_xp": 0,
    "knowledge_progress": 0,
    "wisdom_progress": 0
  },
  "socrates_greeting": "Welcome, young historian! Today we explore the Age of Exploration. Ready to discover who sailed the ocean blue?"
}
```

#### GET `/sessions/:session_id/question`
Get the next question for the session.

**Response (200):**
```json
{
  "question": {
    "id": "uuid",
    "text": "Which explorer is credited with discovering America in 1492?",
    "type": "knowledge",
    "difficulty_tier": 1,
    "options": [
      {"id": "opt-a", "label": "A", "text": "Christopher Columbus"},
      {"id": "opt-b", "label": "B", "text": "Amerigo Vespucci"},
      {"id": "opt-c", "label": "C", "text": "Ferdinand Magellan"},
      {"id": "opt-d", "label": "D", "text": "Hernán Cortés"}
    ],
    "topic_context": "The Age of Exploration - Spanish Explorers"
  },
  "session_state": {
    "current_tier": 1,
    "hearts_remaining": 3,
    "current_streak": 0,
    "questions_answered": 0,
    "total_xp": 0
  },
  "time_limit_seconds": null  // No time limit for this tier
}
```

#### POST `/sessions/:session_id/answer`
Submit an answer to the current question.

**Request:**
```json
{
  "question_id": "uuid",
  "selected_option_id": "opt-a",
  "time_spent_seconds": 8
}
```

**Response (200) - Correct Answer:**
```json
{
  "is_correct": true,
  "feedback": {
    "type": "celebration",
    "text": "Excellent! Columbus did indeed reach the Americas in 1492. Fun fact: He actually thought he had reached Asia!",
    "avatar_emotion": "happy"
  },
  "xp_earned": 10,
  "streak_bonus": false,
  "session_state": {
    "current_tier": 1,
    "hearts_remaining": 3,
    "current_streak": 1,
    "questions_answered": 1,
    "total_xp": 10,
    "knowledge_progress": 1,
    "wisdom_progress": 0
  },
  "session_ended": false
}
```

**Response (200) - Incorrect Answer (Knowledge):**
```json
{
  "is_correct": false,
  "feedback": {
    "type": "mnemonic",
    "text": "Not quite! Remember this rhyme: 'Columbus sailed the ocean blue in fourteen hundred ninety-two!' He was the one who made that famous voyage.",
    "avatar_emotion": "encouraging"
  },
  "correct_answer": {
    "option_id": "opt-a",
    "text": "Christopher Columbus"
  },
  "xp_earned": 5,
  "session_state": {
    "current_tier": 1,
    "hearts_remaining": 2,
    "current_streak": 0,
    "questions_answered": 1,
    "total_xp": 5
  },
  "session_ended": false
}
```

**Response (200) - Incorrect Answer (Wisdom):**
```json
{
  "is_correct": false,
  "feedback": {
    "type": "socratic_hint",
    "text": "Hmm, let's think about this together. If the colonists were upset about taxes, what does that tell us about what they wanted?",
    "avatar_emotion": "curious",
    "follow_up_question": "What do you think 'no taxation without representation' really means?"
  },
  "xp_earned": 5,
  "session_state": {
    "current_tier": 2,
    "hearts_remaining": 2,
    "current_streak": 0,
    "questions_answered": 5
  },
  "session_ended": false,
  "retry_allowed": true  // For Wisdom questions, allow retry after hint
}
```

**Response (200) - Session Ended:**
```json
{
  "is_correct": true,
  "feedback": {
    "type": "celebration",
    "text": "Wonderful! You've completed this session brilliantly!"
  },
  "session_state": {
    "current_tier": 4,
    "hearts_remaining": 2,
    "current_streak": 5,
    "questions_answered": 15,
    "total_xp": 180
  },
  "session_ended": true,
  "session_summary": {
    "total_questions": 15,
    "correct_answers": 12,
    "knowledge_accuracy": 0.85,
    "wisdom_accuracy": 0.70,
    "max_streak": 5,
    "xp_earned": 180,
    "rating_change": {
      "knowledge": "+15",
      "wisdom": "+8"
    },
    "achievements_unlocked": ["First Perfect Streak", "Explorer Apprentice"]
  }
}
```

#### POST `/sessions/:session_id/pause`
Pause the current session.

**Response (200):**
```json
{
  "status": "paused",
  "resume_token": "token...",
  "expires_at": "2024-01-15T16:00:00Z"
}
```

#### POST `/sessions/:session_id/resume`
Resume a paused session.

**Response (200):**
```json
{
  "status": "active",
  "session_state": { ... },
  "socrates_message": "Welcome back! Let's pick up where we left off."
}
```

---

### 4. Student Profile

#### GET `/students/me`
Get current student's profile.

**Response (200):**
```json
{
  "id": "uuid",
  "display_name": "Tommy",
  "avatar_choice": "owl",
  "grade_level": 5,
  "ratings": {
    "knowledge": 1050,
    "wisdom": 980,
    "overall": 1015
  },
  "stats": {
    "total_sessions": 12,
    "total_questions_answered": 156,
    "total_xp": 2340,
    "current_level": 5,
    "xp_to_next_level": 160
  },
  "learning_profile": "encyclopedist",
  "badges": [
    {"id": "streak-5", "name": "Hot Streak", "earned_at": "2024-01-10"},
    {"id": "explorer-master", "name": "Explorer Master", "earned_at": "2024-01-08"}
  ],
  "recent_activity": [
    {
      "date": "2024-01-14",
      "topic": "American Revolution",
      "score": 85,
      "time_spent_minutes": 12
    }
  ]
}
```

#### GET `/students/me/progress`
Get detailed progress across all topics.

**Response (200):**
```json
{
  "overall_mastery": 0.72,
  "topics": [
    {
      "topic_id": "uuid",
      "topic_name": "Age of Exploration",
      "knowledge_mastery": 0.90,
      "wisdom_mastery": 0.65,
      "status": "mastered",
      "last_session": "2024-01-10"
    },
    {
      "topic_id": "uuid",
      "topic_name": "American Revolution",
      "knowledge_mastery": 0.70,
      "wisdom_mastery": 0.55,
      "status": "in_progress",
      "last_session": "2024-01-14"
    }
  ],
  "weak_areas": [
    {
      "concept": "Causes of the Revolution",
      "mastery": 0.45,
      "recommended_action": "Review the Acts and their effects"
    }
  ],
  "strong_areas": [
    {
      "concept": "Explorer Names and Dates",
      "mastery": 0.95
    }
  ]
}
```

---

### 5. Parent Dashboard

#### GET `/parents/dashboard`
Get parent's overview dashboard.

**Response (200):**
```json
{
  "children": [
    {
      "id": "uuid",
      "display_name": "Tommy",
      "learning_profile": "encyclopedist",
      "profile_description": "Tommy excels at memorizing facts but could use more practice with understanding cause and effect.",
      "this_week": {
        "sessions_completed": 5,
        "time_spent_minutes": 48,
        "questions_answered": 62,
        "knowledge_accuracy": 0.88,
        "wisdom_accuracy": 0.65
      },
      "trend": {
        "direction": "improving",
        "knowledge_change": "+5%",
        "wisdom_change": "+12%"
      },
      "current_topic": {
        "name": "American Revolution",
        "progress": 0.60
      }
    }
  ]
}
```

#### GET `/parents/children/:child_id/report`
Get detailed report for a specific child.

**Response (200):**
```json
{
  "child": {
    "id": "uuid",
    "display_name": "Tommy"
  },
  "report_period": {
    "start": "2024-01-08",
    "end": "2024-01-14"
  },
  "summary": {
    "learning_profile": "encyclopedist",
    "interpretation": "Your student is an Encyclopedist. They know every date and name (High Knowledge: 88%), but struggle to understand why events happened (Low Wisdom: 65%). Consider asking them 'why' questions during everyday conversations to build this skill."
  },
  "daily_activity": [
    {"date": "2024-01-14", "minutes": 12, "questions": 15, "accuracy": 0.80},
    {"date": "2024-01-13", "minutes": 8, "questions": 10, "accuracy": 0.90},
    // ...
  ],
  "topic_breakdown": [
    {
      "topic": "Age of Exploration",
      "knowledge_score": 95,
      "wisdom_score": 70,
      "common_mistakes": [
        "Confuses motivations of Spanish vs. English explorers"
      ]
    }
  ],
  "insights": [
    {
      "type": "struggle_pattern",
      "title": "Cause & Effect Challenges",
      "body": "Tommy often misses questions that ask 'why' something happened. He knows the facts but connecting them is challenging.",
      "recommendation": "Try asking 'why do you think that happened?' after reading historical stories together."
    },
    {
      "type": "breakthrough",
      "title": "Improvement in Dates",
      "body": "Tommy's accuracy on date-related questions improved 20% this week!",
      "recommendation": "Keep up the great work with memory tricks."
    }
  ],
  "recommended_topics": [
    {
      "topic": "The Acts",
      "reason": "Builds on Revolution knowledge with focus on cause/effect"
    }
  ]
}
```

#### GET `/parents/children/:child_id/sessions`
Get child's session history.

**Query Parameters:**
- `limit` (default: 10)
- `offset` (default: 0)
- `topic_id` (optional): Filter by topic

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "topic_name": "American Revolution",
      "started_at": "2024-01-14T15:30:00Z",
      "duration_minutes": 12,
      "questions_answered": 15,
      "accuracy": 0.80,
      "max_tier_reached": 3,
      "xp_earned": 145
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 6. Achievements & Gamification

#### GET `/achievements`
Get all available achievements.

**Response (200):**
```json
{
  "achievements": [
    {
      "id": "streak-5",
      "name": "Hot Streak",
      "description": "Get 5 questions correct in a row",
      "icon": "fire",
      "xp_reward": 50,
      "rarity": "common",
      "earned": true,
      "earned_at": "2024-01-10T14:30:00Z"
    },
    {
      "id": "wisdom-master",
      "name": "Wisdom Master",
      "description": "Answer 10 Wisdom questions correctly in one session",
      "icon": "brain",
      "xp_reward": 200,
      "rarity": "rare",
      "earned": false,
      "progress": {
        "current": 7,
        "required": 10
      }
    }
  ]
}
```

#### GET `/leaderboard`
Get weekly leaderboard (optional feature).

**Query Parameters:**
- `topic_id` (optional): Filter by topic
- `period`: `weekly` | `monthly` | `all_time`

**Response (200):**
```json
{
  "period": "weekly",
  "leaderboard": [
    {"rank": 1, "display_name": "HistoryHero", "xp": 580, "is_current_user": false},
    {"rank": 2, "display_name": "Tommy", "xp": 520, "is_current_user": true},
    {"rank": 3, "display_name": "ExplorerKid", "xp": 490, "is_current_user": false}
  ],
  "current_user_rank": 2
}
```

---

## WebSocket Events

For real-time feedback during sessions, clients can connect to WebSocket.

**Connection:** `wss://api.socratic-university.com/ws?session_id={session_id}&token={jwt}`

### Server → Client Events

```typescript
// Socrates speaks (can happen anytime)
{
  "event": "socrates_message",
  "data": {
    "text": "You're doing great! Keep it up!",
    "emotion": "encouraging",
    "trigger": "streak_milestone"
  }
}

// Tier change notification
{
  "event": "tier_change",
  "data": {
    "new_tier": 3,
    "direction": "up",
    "message": "The questions are getting harder! You've leveled up!"
  }
}

// Achievement unlocked
{
  "event": "achievement_unlocked",
  "data": {
    "achievement_id": "streak-5",
    "name": "Hot Streak",
    "xp_reward": 50
  }
}

// Session timeout warning
{
  "event": "session_warning",
  "data": {
    "type": "inactivity",
    "message": "Are you still there? Your session will pause in 2 minutes."
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "The requested session does not exist or has expired.",
    "details": {
      "session_id": "uuid"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | User doesn't have permission |
| `SESSION_NOT_FOUND` | 404 | Session ID doesn't exist |
| `SESSION_EXPIRED` | 410 | Session timed out |
| `INVALID_STATE` | 409 | Action not allowed in current state |
| `NO_QUESTIONS_AVAILABLE` | 404 | No more questions for criteria |
| `RATE_LIMITED` | 429 | Too many requests |
| `LLM_ERROR` | 503 | AI service temporarily unavailable |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/*` | 10 req/min |
| `/sessions/*/answer` | 60 req/min |
| All other endpoints | 120 req/min |

---

## Versioning

The API is versioned via URL path (`/v1/`). Breaking changes will result in a new version. Non-breaking additions (new fields, new endpoints) may be added to existing versions.
