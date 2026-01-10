# Virtual Socratic University

An adaptive, agentic tutoring system that teaches 5th-grade American History through the Socratic method.

## Vision

The Virtual Socratic University distinguishes between **Knowledge** (factual recall) and **Wisdom** (synthesis and understanding), providing personalized feedback that nurtures both. Unlike traditional quiz applications, Socrates—our AI tutor—adapts to each student's needs, offering memory tricks for forgotten facts and guiding questions for conceptual gaps.

## Target Audience

- **Primary**: 5th Grade Students
- **Secondary**: Parents/Guardians (Observer/Admin role)

## Core Principles

1. **Feel like a game, not a test** - Build confidence through celebration and encouragement
2. **Knowledge vs. Wisdom** - Distinguish memorization from understanding
3. **Adaptive difficulty** - Questions get harder with streaks, easier after mistakes
4. **Socratic method** - Never give answers directly for "why" questions; guide discovery

## Documentation

### Architecture
- [Architecture Overview](docs/architecture/ARCHITECTURE.md) - System design and technology stack
- [**Socrates Agent**](docs/architecture/SOCRATES_AGENT.md) - Claude-powered autonomous tutor specification
- [Data Models](docs/architecture/DATA_MODELS.md) - Database schemas and relationships
- [Backend Services](docs/architecture/BACKEND_SERVICES.md) - Librarian, Orchestrator, and Agent integration
- [API Specification](docs/architecture/API_SPECIFICATION.md) - REST endpoints and contracts
- [Frontend & UX](docs/architecture/FRONTEND_UX.md) - Components, pages, and user experience

### Planning
- [Implementation Phases](docs/planning/IMPLEMENTATION_PHASES.md) - Phased development approach

### Content
- [Content Structure Guide](content/questions/CONTENT_STRUCTURE.md) - How questions are organized
- [Sample Content](content/questions/sample-content.json) - Example question format

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│              CLIENT (Next.js)                     │
│  Student View │ Parent Dashboard │ Socrates Avatar│
└──────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────┐
│           AGENT SWARM (FastAPI)                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ LIBRARIAN  │ │ORCHESTRATOR│ │  SOCRATES  │   │
│  │(Questions) │ │(Game State)│ │  (Claude)  │   │
│  └────────────┘ └────────────┘ └────────────┘   │
│                                      │           │
│                        ┌─────────────▼─────────┐ │
│                        │    TOOL SUITE         │ │
│                        │ • get_student_history │ │
│                        │ • fetch_mnemonic      │ │
│                        │ • get_socratic_hints  │ │
│                        │ • analyze_distractor  │ │
│                        └───────────────────────┘ │
└──────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────┐
│               VAULT (Data)                        │
│  PostgreSQL (Content) │ Redis (Sessions)          │
└──────────────────────────────────────────────────┘
```

### Socrates Agent

The heart of the system is the **Socrates Agent**—an autonomous AI tutor powered by Claude that reasons about student performance and decides how to respond. Unlike simple LLM wrappers, Socrates uses tools to:

- Check student history for patterns
- Fetch appropriate mnemonics or hints
- Record misconceptions for parent insights
- Suggest difficulty adjustments

## Key Features

### For Students
- **Gamified learning** with XP, streaks, and achievements
- **Adaptive difficulty** that matches their skill level
- **Two progress bars** - Knowledge (Blue) and Wisdom (Gold)
- **Friendly avatar** (Wise Owl, Colonial Scholar, or Explorer)
- **Hearts/Lives system** with encouraging recovery

### For Parents
- **Learning profile** classification (Encyclopedist, Strategist, Balanced)
- **Weekly activity** tracking
- **Topic breakdown** with Knowledge/Wisdom split
- **AI-generated insights** and recommendations

## Content Coverage (5th Grade History)

| Topic | Questions | Knowledge | Wisdom |
|-------|-----------|-----------|--------|
| Age of Exploration | 25 | 14 | 11 |
| American Revolution | 30 | 16 | 14 |
| The Acts | 25 | 12 | 13 |
| **Total** | **80** | **42** | **38** |

## Technology Stack

### Backend
- Python 3.11+
- FastAPI
- **Anthropic Claude SDK** (direct API integration)
- PostgreSQL 15
- Redis 7

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand

### AI/Agent
- **Claude claude-sonnet-4-20250514** (via Anthropic SDK)
- **Native tool use** for agentic reasoning
- Low temperature (0.3) for consistent persona
- Structured JSON output for frontend integration

## Getting Started

*Coming soon - implementation in progress*

```bash
# Clone the repository
git clone https://github.com/jsteelman8834/socrates.git

# Install dependencies
# Backend
cd backend && pip install -r requirements.txt

# Frontend
cd frontend && npm install

# Start development servers
# See docs for detailed setup instructions
```

## Project Status

📋 **Phase 1: Planning Complete**

See [Implementation Phases](docs/planning/IMPLEMENTATION_PHASES.md) for detailed roadmap.

## Contributing

This project is in early development. Contributions welcome after initial architecture is stable.

## License

*To be determined*

---

*"Education is the kindling of a flame, not the filling of a vessel."* — Socrates (attributed)
