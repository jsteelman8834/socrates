# Security Documentation
## Virtual Socratic University

This document outlines all security layers implemented in the Virtual Socratic University platform, how they work, and how to configure them properly.

---

## Table of Contents

1. [Security Architecture Overview](#1-security-architecture-overview)
2. [Authentication (Clerk)](#2-authentication-clerk)
3. [Authorization & Access Control](#3-authorization--access-control)
4. [Database Security (Supabase RLS)](#4-database-security-supabase-rls)
5. [Input Validation](#5-input-validation)
6. [API Security](#6-api-security)
7. [Secrets Management](#7-secrets-management)
8. [Background Job Security](#8-background-job-security)
9. [Content Safety](#9-content-safety)
10. [Security Checklist](#10-security-checklist)

---

## 1. Security Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLERK AUTHENTICATION                          │
│  • JWT token validation                                          │
│  • Session management                                            │
│  • OAuth providers (Google, etc.)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES                                  │
│  • auth() middleware                                             │
│  • Zod input validation                                          │
│  • Authorization checks                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                              │
│  • Row Level Security (RLS)                                      │
│  • Parameterized queries                                         │
│  • Service role for admin operations                             │
└─────────────────────────────────────────────────────────────────┘
```

### Defense in Depth

We implement multiple security layers so that if one fails, others still protect the system:

| Layer | Protection | Failure Mode |
|-------|------------|--------------|
| Clerk Auth | Identity verification | Unauthenticated access blocked |
| API Authorization | Role-based access | Unauthorized access blocked |
| Zod Validation | Input sanitization | Malformed data rejected |
| Supabase RLS | Database-level access | Even with API bypass, data protected |

---

## 2. Authentication (Clerk)

### Overview

All authentication is handled by [Clerk](https://clerk.com), a complete user management platform.

### Setup

1. **Create Clerk Application**
   ```
   1. Go to https://clerk.com
   2. Create new application
   3. Configure sign-in methods (email, Google, etc.)
   4. Copy API keys to .env
   ```

2. **Environment Variables**
   ```env
   # .env.local
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   ```

3. **Webhook Secret** (for user sync)
   ```env
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

### Usage in API Routes

```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  // Get authenticated user ID
  const { userId } = await auth();

  // Reject unauthenticated requests
  if (!userId) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  // userId is the Clerk user ID (e.g., "user_2abc123...")
  // Map to internal user ID via database lookup
}
```

### Protected Pages (Middleware)

```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

## 3. Authorization & Access Control

### Role-Based Access Control (RBAC)

The system defines three roles:

| Role | Access Level |
|------|--------------|
| `student` | Own data only |
| `parent` | Own data + children's data |
| `admin` | All data |

### User Roles in Database

```sql
-- users table includes role field
CREATE TABLE users (
    id UUID PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    parent_id UUID REFERENCES users(id),  -- For parent-child relationship
    ...
);
```

### Authorization Pattern

```typescript
// Standard authorization check pattern
async function checkAccess(
  requestingUser: { id: string; role: string },
  targetStudentId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  // Self-access always allowed
  if (requestingUser.id === targetStudentId) {
    return true;
  }

  // Admins can access all
  if (requestingUser.role === 'admin') {
    return true;
  }

  // Parents can access their children
  if (requestingUser.role === 'parent') {
    const { data: student } = await supabase
      .from('users')
      .select('parent_id')
      .eq('id', targetStudentId)
      .single();

    return student?.parent_id === requestingUser.id;
  }

  return false;
}
```

### Implementation in Routes

```typescript
// Example: /api/aristotle/profile/[studentId]/route.ts

// 1. Authenticate
const { userId } = await auth();
if (!userId) return 401;

// 2. Get requesting user's role
const { data: requestingUser } = await supabase
  .from('users')
  .select('id, role')
  .eq('clerk_id', userId)
  .single();

// 3. Check authorization
let hasAccess = requestingUser.id === studentId ||
                requestingUser.role === 'admin';

// 4. Parent-specific check
if (!hasAccess && requestingUser.role === 'parent') {
  const { data: student } = await supabase
    .from('users')
    .select('parent_id')
    .eq('id', studentId)
    .single();

  hasAccess = student?.parent_id === requestingUser.id;
}

// 5. Reject unauthorized access
if (!hasAccess) return 403;
```

---

## 4. Database Security (Supabase RLS)

### Overview

Row Level Security (RLS) provides database-level access control. Even if an attacker bypasses API authorization, RLS prevents unauthorized data access.

### Enabling RLS

```sql
-- Enable RLS on a table
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
```

### Policy Types

#### 1. Student Self-Access
```sql
-- Students can only see their own sessions
CREATE POLICY "Students view own sessions"
    ON learning_sessions FOR SELECT
    USING (student_id = auth.uid());

-- Students can create their own sessions
CREATE POLICY "Students create own sessions"
    ON learning_sessions FOR INSERT
    WITH CHECK (student_id = auth.uid());
```

#### 2. Service Role Full Access
```sql
-- Service role (used by API) can do everything
CREATE POLICY "Service role full access"
    ON learning_sessions FOR ALL
    USING (auth.role() = 'service_role');
```

#### 3. Public Read (for lookup tables)
```sql
-- Anyone can read prompts
CREATE POLICY "Public read prompts"
    ON writing_prompts FOR SELECT
    USING (is_active = TRUE);
```

### Tables with RLS Enabled

| Table | Policies |
|-------|----------|
| `users` | Self-access, service role |
| `learning_sessions` | Own sessions, service role |
| `session_answers` | Via session ownership, service role |
| `cognitive_fingerprints` | Own data, service role |
| `virtue_progress` | Own data, service role |
| `parent_insights` | Own data, service role |
| `writer_profiles` | Own data, service role |
| `writing_sessions` | Own sessions, service role |
| `story_drafts` | Via session ownership, service role |
| `writing_prompts` | Public read, service role write |

### Supabase Client Configuration

```typescript
// For user-context operations (respects RLS)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For admin operations (bypasses RLS)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // NEVER expose to client!
);
```

---

## 5. Input Validation

### Zod Schema Validation

All API inputs are validated using [Zod](https://zod.dev) before processing.

### Pattern

```typescript
import { z } from 'zod';

// Define schema
const answerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionId: z.string().uuid(),
});

// Validate in route
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = answerSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_INPUT', message: validation.error.message } },
      { status: 400 }
    );
  }

  // validation.data is now typed and safe
  const { questionId, selectedOptionId } = validation.data;
}
```

### Common Validation Patterns

```typescript
// UUID validation
z.string().uuid()

// Enum validation
z.enum(['history', 'math', 'writing'])

// Number range
z.number().min(1).max(100)

// Optional with default
z.string().default('')

// Array of strings
z.array(z.string())

// Nested object
z.object({
  content: z.string().min(1),
  metadata: z.object({
    timeSpent: z.number()
  })
})
```

### Validated Routes

| Route | Schema |
|-------|--------|
| `/api/sessions` | `topicId: uuid` |
| `/api/sessions/[id]/answer` | `questionId: uuid, selectedOptionId: uuid` |
| `/api/writing/sessions` | `promptId?: uuid, challengeLevel?: 1-8` |
| `/api/writing/sessions/[id]/draft` | `content: string, draftType: enum, timeSpentSeconds: number` |
| `/api/writing/sessions/[id]/scaffold` | `stuckType: enum, currentContent: string` |
| `/api/aristotle/process` | `batch: 1-100` (query param) |

---

## 6. API Security

### Error Handling

Never expose internal errors to clients:

```typescript
try {
  // ... operation
} catch (error) {
  // Log full error internally
  console.error('Operation failed:', error);

  // Return generic message to client
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } },
    { status: 500 }
  );
}
```

### Rate Limiting

For production, add rate limiting:

```typescript
// Using Vercel's built-in rate limiting
// vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}

// Or use a library like @upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

// In route
const { success } = await ratelimit.limit(userId);
if (!success) {
  return NextResponse.json(
    { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    { status: 429 }
  );
}
```

### SQL Injection Prevention

Supabase SDK automatically parameterizes queries:

```typescript
// SAFE - parameterized
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userInput);  // userInput is safely escaped

// NEVER do this - vulnerable to injection
// const { data } = await supabase.rpc('raw_query', {
//   query: `SELECT * FROM users WHERE id = '${userInput}'`
// });
```

---

## 7. Secrets Management

### Environment Variables

All secrets are stored in environment variables, never in code.

```env
# .env.local (never commit this file!)

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Safe to expose (RLS protects)
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # NEVER expose!

# Authentication
CLERK_SECRET_KEY=sk_test_...          # NEVER expose!
CLERK_WEBHOOK_SECRET=whsec_...

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...          # NEVER expose!
OPENAI_API_KEY=sk-...                 # NEVER expose!

# Payments
STRIPE_SECRET_KEY=sk_test_...         # NEVER expose!
STRIPE_WEBHOOK_SECRET=whsec_...

# Background Jobs
CRON_SECRET=your_random_secret        # NEVER expose!
```

### .gitignore

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Never commit these
*.pem
*.key
credentials.json
```

### Secret Rotation

1. **API Keys**: Rotate every 90 days
2. **Webhook Secrets**: Rotate when suspected compromise
3. **Service Role Key**: Rotate immediately if exposed

### Vercel Deployment

```bash
# Set secrets via Vercel CLI
vercel secrets add ANTHROPIC_API_KEY sk-ant-...
vercel secrets add SUPABASE_SERVICE_ROLE_KEY eyJ...
```

---

## 8. Background Job Security

### CRON Endpoint Protection

Background jobs (like Aristotle queue processing) are protected by a secret:

```typescript
// /api/aristotle/process/route.ts

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  // Allow in development OR with valid secret
  const isDev = process.env.NODE_ENV === 'development';
  const hasValidSecret = authHeader === `Bearer ${CRON_SECRET}`;

  if (!isDev && !hasValidSecret) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
      { status: 401 }
    );
  }

  // Process queue...
}
```

### Configuring CRON Jobs

**Vercel Cron:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/aristotle/process",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**External CRON Service:**
```bash
# Call with authorization header
curl -X POST https://your-app.vercel.app/api/aristotle/process \
  -H "Authorization: Bearer your_cron_secret"
```

### Input Validation for CRON

```typescript
// Validate batch size parameter
const batchParam = request.nextUrl.searchParams.get('batch');
let batchSize = 10;

if (batchParam) {
  const parsed = parseInt(batchParam, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 100) {
    return NextResponse.json(
      { error: { code: 'INVALID_BATCH_SIZE', message: 'Batch size must be 1-100' } },
      { status: 400 }
    );
  }
  batchSize = parsed;
}
```

---

## 9. Content Safety

### AI Content Filtering

Shakespeare Agent includes content safety rules:

```typescript
const SHAKESPEARE_SYSTEM_PROMPT = `
## Safety
- No sexual content, graphic violence, self-harm, or adult themes
- Gently redirect unsafe content toward creativity
- Never request personal identifying information
`;
```

### User Content Validation

For student-generated content:

```typescript
// Check for PII patterns (basic example)
function containsPII(text: string): boolean {
  const patterns = [
    /\b\d{3}-\d{2}-\d{4}\b/,  // SSN
    /\b\d{10}\b/,              // Phone
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,  // Email
  ];
  return patterns.some(p => p.test(text));
}

// In writing draft submission
if (containsPII(content)) {
  // Log and optionally reject or redact
  console.warn('PII detected in student submission');
}
```

---

## 10. Security Checklist

### Before Deployment

- [ ] All environment variables set in production
- [ ] `.env.local` not committed to git
- [ ] CRON_SECRET is a strong random string
- [ ] Clerk webhooks configured with secret
- [ ] Stripe webhooks configured with secret
- [ ] RLS enabled on all tables
- [ ] Service role key only used server-side

### Route Security Audit

For each API route, verify:

- [ ] `auth()` called and userId checked
- [ ] User lookup maps Clerk ID to internal ID
- [ ] Authorization check for resource access
- [ ] Input validation with Zod schema
- [ ] Error messages don't leak sensitive data
- [ ] Supabase queries use parameterization

### Database Security Audit

For each table, verify:

- [ ] RLS enabled
- [ ] Self-access policy exists
- [ ] Service role policy exists
- [ ] No overly permissive policies
- [ ] Indexes on foreign keys

### Monitoring

Set up alerts for:

- [ ] Failed authentication attempts (> 10/min)
- [ ] Authorization failures (> 5/min)
- [ ] API errors (> 1% error rate)
- [ ] Database connection failures

---

## Quick Reference

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Reporting Security Issues

If you discover a security vulnerability, please email security@yourdomain.com rather than opening a public issue.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-12 | Initial security documentation |
