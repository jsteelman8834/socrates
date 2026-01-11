# Virtual Socratic University

An adaptive, agentic tutoring system for grades 5-7 that teaches American History, Math (Pythagoras), and Storytelling/Writing (Shakespeare) through the Socratic method.

## Why it exists

The Virtual Socratic University distinguishes between **Knowledge** (factual recall) and **Wisdom** (synthesis and understanding), giving students feedback that builds both. The AI tutor, Socrates, adapts to each learner and treats each student uniquely with memory aids for missed facts and guiding questions for conceptual gaps.

## Target audience

- **Primary**: Grades 5-7 students
- **Secondary**: Parents/Guardians (observer/admin role)

## Core principles

1. **Feel like a game, not a test** - Build confidence through celebration and encouragement
2. **Knowledge vs. Wisdom** - Distinguish memorization from understanding
3. **Adaptive difficulty** - Questions get harder with streaks, easier after mistakes
4. **Socratic method** - Never give answers directly for "why" questions; guide discovery

## Subjects and grade levels

- **American History** (grade-appropriate, inquiry-based)
- **Math** (Pythagoras and geometry reasoning)
- **Storytelling/Writing** (Shakespeare-inspired language and craft)

## Documentation

### Architecture
- [Architecture Overview](docs/architecture/ARCHITECTURE.md) - System design and technology stack
- [Socrates Agent](docs/architecture/SOCRATES_AGENT.md) - Claude-powered autonomous tutor specification
- [Data Models](docs/architecture/DATA_MODELS.md) - Database schemas and relationships
- [Backend Services](docs/architecture/BACKEND_SERVICES.md) - Librarian, Orchestrator, and Agent integration
- [API Specification](docs/architecture/API_SPECIFICATION.md) - REST endpoints and contracts
- [Frontend & UX](docs/architecture/FRONTEND_UX.md) - Components, pages, and user experience

### Planning
- [Implementation Phases](docs/planning/IMPLEMENTATION_PHASES.md) - Phased development approach

### Content
- [Content Structure Guide](content/questions/CONTENT_STRUCTURE.md) - How questions are organized
- [Sample Content](content/questions/sample-content.json) - Example question format

## Architecture overview

```text
Client (Next.js)
  - Student view
  - Parent dashboard
  - Socrates avatar

Agent swarm (FastAPI)
  - Librarian (questions)
  - Orchestrator (game state)
  - Socrates (Claude)
  - Tool suite:
      - get_student_history
      - fetch_mnemonic
      - get_socratic_hints
      - analyze_distractor

Vault (Data)
  - PostgreSQL (content)
  - Redis (sessions)
```

## Socrates agent

The heart of the system is the **Socrates Agent**: an autonomous AI tutor powered by Claude that reasons about student performance and decides how to respond. It uses tools to:

- Check student history for patterns
- Fetch appropriate mnemonics or hints
- Record misconceptions for parent insights
- Suggest difficulty adjustments

## Key features

### For students
- **Gamified learning** with XP, streaks, and achievements
- **Adaptive difficulty** that matches their skill level
- **Two progress bars**: Knowledge (Blue) and Wisdom (Gold)
- **Friendly avatar** (Wise Owl, Colonial Scholar, or Explorer)
- **Hearts/Lives system** with encouraging recovery

### For parents
- **Learning profile** classification (Encyclopedist, Strategist, Balanced)
- **Weekly activity** tracking
- **Topic breakdown** with Knowledge/Wisdom split
- **AI-generated insights** and recommendations

## Subject focus (initial modules)

- American History (Age of Exploration, American Revolution, The Acts)
- Math (Pythagoras and foundational geometry)
- Storytelling/Writing (Shakespeare-focused prompts and analysis)

## Technology stack

### Backend
- Python 3.11+
- FastAPI
- Anthropic Claude SDK (direct API integration)
- PostgreSQL 15
- Redis 7

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand

### AI/Agent
- Claude `claude-sonnet-4-20250514` (via Anthropic SDK)
- Native tool use for agentic reasoning
- Low temperature (0.3) for consistent persona
- Structured JSON output for frontend integration

## Getting started

### Prerequisites
- Node.js 18+
- Supabase account and project (for database and auth)
- API keys for providers you plan to use (see `.env.example`)

### Setup
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

Update `.env.local` with your Supabase, Clerk, and AI provider keys.

### Run the app
```bash
npm run dev
```

Open `http://localhost:3000`.

### Database (optional)
If you are using Supabase locally, you can run:
```bash
npm run db:reset
```

## Project status

**Phase 1: Planning complete.** See [Implementation Phases](docs/planning/IMPLEMENTATION_PHASES.md) for the detailed roadmap.

## Roadmap

- **Phase 1: Stocking the Library of Truth** - Content infrastructure and data foundation
- **Phase 2: Awakening Socrates** - AI tutor personality and diagnostic engine
- **Phase 3: Building the Classroom** - Student-facing experience and gamification
- **Phase 4: The Parent's Window** - Parent dashboard and insights
- **Phase 5: The Dress Rehearsal** - Testing, refinement, and launch preparation

## Contributing

This project is in early development. Contributions are welcome after the architecture stabilizes.

## License

To be determined.

---

"Education is the kindling of a flame, not the filling of a vessel." - Socrates (attributed)
