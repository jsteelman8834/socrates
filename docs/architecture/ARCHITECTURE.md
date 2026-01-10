# Virtual Socratic University - Architecture Overview

## Vision Statement

The Virtual Socratic University is an adaptive, agentic tutoring system that teaches 5th-grade American History through the Socratic method. Unlike traditional quiz applications, this system distinguishes between **Knowledge** (factual recall) and **Wisdom** (synthesis and understanding), providing personalized feedback that nurtures both.

## Target Audience

- **Primary User**: 5th Grade Students
- **Secondary User**: Parents/Guardians (Admin/Observer role)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Web Application (React/Next.js)              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │   │
│  │  │ Student View │  │ Parent View  │  │ Socrates Avatar     │   │   │
│  │  │ (Classroom)  │  │ (Dashboard)  │  │ (Animated Feedback) │   │   │
│  │  └──────────────┘  └──────────────┘  └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ REST/WebSocket
┌─────────────────────────────────────────────────────────────────────────┐
│                        AGENT SWARM LAYER (Backend)                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    API Gateway (FastAPI)                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│         ┌──────────────────────────┼──────────────────────────┐         │
│         ▼                          ▼                          ▼         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │   LIBRARIAN     │    │   ORCHESTRATOR  │    │     TUTOR       │     │
│  │  (Deterministic)│    │  (State Machine)│    │  (LLM-Powered)  │     │
│  │                 │    │                 │    │                 │     │
│  │ • Fetch Qs      │    │ • Session State │    │ • Grade Answers │     │
│  │ • Tag/Categorize│    │ • Streak Logic  │    │ • Diagnose Gaps │     │
│  │ • Composite Gen │    │ • Difficulty    │    │ • Generate Hints│     │
│  │ • Hash/Cache    │    │ • Game Flow     │    │ • Persona Voice │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          VAULT LAYER (Data)                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Question Vault  │  │   User State     │  │  Analytics DB    │      │
│  │  (PostgreSQL)    │  │   (Redis/PG)     │  │  (PostgreSQL)    │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend (Python)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | FastAPI | Async support, automatic OpenAPI docs, type hints |
| State Machine | LangGraph | Complex agent orchestration, built-in state management |
| LLM Integration | LangChain + Claude/GPT-4 | Abstraction layer for LLM switching |
| Database ORM | SQLAlchemy 2.0 | Type-safe, async queries |
| Caching | Redis | Session state, streak tracking, real-time data |
| Task Queue | Celery (optional) | Async report generation |

### Frontend (TypeScript)
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14 | SSR, API routes, excellent DX |
| State Management | Zustand | Lightweight, simple for game state |
| Styling | Tailwind CSS | Rapid UI development |
| Animation | Framer Motion | Avatar animations, progress bars |
| Real-time | Socket.io | Live feedback from Socrates |

### Infrastructure
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Database | PostgreSQL 15 | Reliable, JSON support for question metadata |
| Cache | Redis 7 | Sub-millisecond session state |
| Auth | Supabase Auth / Clerk | Simple, secure, parent/child accounts |
| Hosting | Vercel + Railway | Easy deployment, auto-scaling |

---

## Core Design Principles

### 1. Separation of Determinism and Probabilism

The system explicitly separates:
- **Deterministic Logic** (Librarian): Question selection, composite generation, difficulty tiers - these MUST be predictable and reproducible.
- **Probabilistic Logic** (Tutor): LLM-powered feedback, hints, and personality - creative but grounded by strict prompts.

### 2. Knowledge vs. Wisdom Classification

Every piece of content is tagged:
- **Knowledge (K)**: Facts that require memorization
  - Names, dates, locations, definitions
  - Tested with: "Who?", "What?", "When?", "Where?"

- **Wisdom (W)**: Concepts that require synthesis
  - Cause/effect, comparisons, motivations, consequences
  - Tested with: "Why?", "How?", "What if?"

### 3. Adaptive Difficulty via Elo-like Rating

Students have a hidden "skill rating" that adjusts:
- Correct answer on Hard question: Rating increases significantly
- Wrong answer on Easy question: Rating decreases significantly
- The system matches question difficulty to student rating

### 4. Fail-Safe Feedback Loops

When a student fails:
- **K-failure (Memory Slip)**: Tutor provides a mnemonic or memory trick
- **W-failure (Logic Gap)**: Tutor asks a Socratic guiding question, NEVER gives the answer directly

---

## Security Considerations

1. **Content Immutability**: Questions in the vault are versioned; edits create new versions
2. **Answer Protection**: Correct answers are NEVER sent to the client; validation is server-side only
3. **Rate Limiting**: Prevent brute-force answer guessing
4. **Parent Auth**: Parents have read-only access to child progress, not question answers
5. **Session Tokens**: Short-lived JWTs with refresh rotation

---

## Scalability Path

### Phase 1: Single Subject (5th Grade History)
- Monolithic deployment
- Single database
- ~100 concurrent users

### Phase 2: Multiple Subjects
- Microservices extraction (Librarian, Tutor as separate services)
- Content Management System for adding subjects
- ~1,000 concurrent users

### Phase 3: Multi-Tenant School Platform
- Kubernetes deployment
- Multi-region database replication
- Teacher/Admin roles
- ~10,000+ concurrent users
