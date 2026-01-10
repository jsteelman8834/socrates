# Virtual Socratic University - Frontend & UX Specification

## Design Philosophy

The Virtual Socratic University should feel like a **game, not a test**. Every interaction is designed to:
1. Build confidence, not anxiety
2. Celebrate effort, not just correctness
3. Make learning feel like exploration
4. Provide clear, visual progress

---

## Visual Design System

### Color Palette

```css
/* Primary Colors */
--color-knowledge-blue: #3B82F6;     /* Blue for Knowledge progress */
--color-wisdom-gold: #F59E0B;        /* Gold for Wisdom progress */

/* Feedback Colors */
--color-success: #10B981;            /* Correct answers */
--color-encouragement: #8B5CF6;      /* Hints and guidance */
--color-caution: #EF4444;            /* Hearts/lives lost */

/* Neutrals */
--color-parchment: #FEF3C7;          /* Background - old paper feel */
--color-ink: #1F2937;                /* Primary text */
--color-muted: #6B7280;              /* Secondary text */

/* Tier Indicators */
--tier-1: #10B981;                   /* Green - Easy */
--tier-2: #3B82F6;                   /* Blue - Medium */
--tier-3: #8B5CF6;                   /* Purple - Hard */
--tier-4: #F59E0B;                   /* Gold - Extra Hard */
```

### Typography

```css
/* Headers - Playful but readable */
--font-display: 'Quicksand', sans-serif;

/* Body - Clear and accessible */
--font-body: 'Inter', sans-serif;

/* For historical quotes/flavor text */
--font-historical: 'Merriweather', serif;
```

### Avatar Options

Students can choose their Socrates avatar:

1. **The Wise Owl** - Default
   - Friendly owl with reading glasses
   - Perches on a book
   - Expressions: Happy, Thinking, Encouraging, Curious

2. **The Colonial Scholar**
   - Benjamin Franklin-inspired character
   - Holds a quill pen
   - More "serious" but still warm

3. **The Explorer**
   - Young explorer with a map
   - Gender-neutral design
   - Adventurous expressions

---

## Page Structure

### 1. Home Screen (Student)

```
┌─────────────────────────────────────────────────────────────┐
│  🦉 "Welcome back, Tommy!"                    [Settings] ⚙️  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Level 5 Explorer    ⭐ 2,340 XP                    │   │
│   │  ████████████████░░░░░░░░  160 XP to Level 6       │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   📚 Your Learning Journey                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 🧭 Age of Exploration          ✅ Mastered          │   │
│   │    K: ████████████ 95%   W: ████████░░ 70%         │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ 🏛️ American Revolution         🔄 In Progress       │   │
│   │    K: ████████░░░░ 70%   W: ██████░░░░ 55%         │   │
│   │                                         [Continue →]│   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ 📜 The Acts                     🔒 Locked           │   │
│   │    Complete Revolution to unlock                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   🏆 Recent Achievements                                     │
│   [🔥 Hot Streak] [📚 Bookworm] [🎯 Sharp Shooter]          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Topic Selection

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                    American Revolution              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   🦉 "The Revolution is calling, young patriot!             │
│       Ready to discover how America won its freedom?"        │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    Your Progress                     │   │
│   │                                                      │   │
│   │   Knowledge        Wisdom                            │   │
│   │   [████████░░]     [██████░░░░]                      │   │
│   │      70%              55%                            │   │
│   │                                                      │   │
│   │   Last Session: 85% • Best Streak: 4                │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   What You'll Learn:                                         │
│   • Why colonists wanted independence                        │
│   • Key battles and their outcomes                          │
│   • Important figures like Washington and Jefferson         │
│                                                              │
│              ┌─────────────────────────┐                    │
│              │   🎮 Start Learning     │                    │
│              │      ~15 minutes        │                    │
│              └─────────────────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Learning Session (The Classroom)

```
┌─────────────────────────────────────────────────────────────┐
│  [Pause ⏸]              Tier 2                    [Exit ✕]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ❤️ ❤️ 🖤                    🔥 Streak: 3                  │
│                                                              │
│   ┌──────────────────────────────────────────┐              │
│   │  Knowledge  ████████░░░░░░░░  45%       │              │
│   │  Wisdom     ██████░░░░░░░░░░  35%       │              │
│   └──────────────────────────────────────────┘              │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │   Question 6 of ~15                    [KNOWLEDGE]  │   │
│   │                                                      │   │
│   │   Which act required colonists to pay for           │   │
│   │   official documents with special stamped paper?     │   │
│   │                                                      │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │  A) The Tea Act                             │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │  B) The Stamp Act                  ← hover  │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │  C) The Quartering Act                      │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │  D) The Intolerable Acts                    │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   ┌──────┐                                                   │
│   │ 🦉   │  "Take your time! What do you know              │
│   │      │   about these different Acts?"                   │
│   └──────┘                                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. Correct Answer Feedback

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                      ✨ CORRECT! ✨                          │
│                                                              │
│                       +10 XP                                 │
│                    🔥 Streak: 4!                             │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │   🦉 "Excellent! The Stamp Act of 1765 taxed        │   │
│   │      paper goods. Colonists were so angry they      │   │
│   │      burned the stamps in protest!"                 │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│                 [Next Question →]                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5. Wrong Answer Feedback (Knowledge - Mnemonic)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     Not quite...                            │
│                                                              │
│                       ❤️ → 🖤                                │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │   The correct answer was: B) The Stamp Act          │   │
│   │                                                      │   │
│   │   🦉 "Here's a memory trick!                        │   │
│   │                                                      │   │
│   │      'STAMP it on PAPER' - The Stamp Act            │   │
│   │      was about taxing paper documents!              │   │
│   │                                                      │   │
│   │      The Tea Act was different - that one           │   │
│   │      taxed... you guessed it... tea! 🍵"            │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│                 [Got it! Next Question →]                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6. Wrong Answer Feedback (Wisdom - Socratic Hint)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                  🤔 Let's think about this...               │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │   Question: Why did colonists object to British     │   │
│   │   taxes even though the taxes were relatively small?│   │
│   │                                                      │   │
│   │   Your answer: Because they couldn't afford them    │   │
│   │                                                      │   │
│   │   🦉 "Interesting thought! But the colonists        │   │
│   │      actually could afford the taxes - they         │   │
│   │      weren't that expensive.                        │   │
│   │                                                      │   │
│   │      Here's something to think about:               │   │
│   │                                                      │   │
│   │      💭 The colonists had no representatives        │   │
│   │         in British Parliament. Why might THAT       │   │
│   │         matter when it came to taxes?"              │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   Would you like to try again with this hint?               │
│                                                              │
│       [Try Again]          [Show Answer]                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7. Tier Up Animation

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    ⬆️ LEVEL UP! ⬆️                          │
│                                                              │
│              ┌───────────────────────┐                      │
│              │    TIER 2 → TIER 3    │                      │
│              │   Questions are now   │                      │
│              │      HARDER! 💪       │                      │
│              └───────────────────────┘                      │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │   🦉 "Wow! You're on fire! 🔥                       │   │
│   │                                                      │   │
│   │      You've proven you know the basics.             │   │
│   │      Now let's see if you can handle               │   │
│   │      the trickier questions!"                       │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│                    [Bring it on! →]                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8. Session Complete

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                  🎉 SESSION COMPLETE! 🎉                    │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │   📊 Your Results                                   │   │
│   │                                                      │   │
│   │   Questions: 15        Correct: 12 (80%)            │   │
│   │   Best Streak: 5       Max Tier: 3                  │   │
│   │                                                      │   │
│   │   Knowledge  ████████████░░░  85%  (+5%)           │   │
│   │   Wisdom     ████████░░░░░░░  65%  (+8%)           │   │
│   │                                                      │   │
│   │   XP Earned: +145                                   │   │
│   │   Rating: 1015 → 1028 (+13)                        │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   🏆 Achievement Unlocked!                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  🔥 Hot Streak - Get 5 in a row     +50 XP         │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   🦉 "Fantastic work today! You're really starting          │
│      to understand the Revolution. Come back soon           │
│      to keep building your wisdom!"                         │
│                                                              │
│   [Play Again]    [Choose Topic]    [Go Home]               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 9. Parent Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Parent Dashboard                         [Settings] ⚙️  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 Tommy's Progress                                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📖 Learning Profile: ENCYCLOPEDIST                  │   │
│  │                                                       │   │
│  │  "Tommy excels at memorizing facts and dates         │   │
│  │   (88% Knowledge accuracy), but struggles with       │   │
│  │   understanding cause and effect (65% Wisdom).       │   │
│  │                                                       │   │
│  │   💡 Try asking 'why' questions during dinner        │   │
│  │   conversation to build analytical thinking."        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  📈 This Week's Activity                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sessions: 5      Time: 48 min    Questions: 62     │   │
│  │                                                       │   │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun                   │   │
│  │  ███  ░░░  ███  ███  ░░░  ███  ░░░                   │   │
│  │  12m       8m   15m       13m                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  📚 Topic Breakdown                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Age of Exploration    K: 95% ████████████          │   │
│  │                        W: 70% ████████░░░           │   │
│  │                                                       │   │
│  │  American Revolution   K: 70% ████████░░░░          │   │
│  │                        W: 55% ██████░░░░░           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  💡 Insights                                                │
│  • Tommy confuses Stamp Act and Tea Act frequently         │
│  • Improved 12% on "Why" questions this week!              │
│  • Recommended next topic: The Acts                        │
│                                                              │
│  [View Full Report]                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Library

### Core Components

```typescript
// components/ProgressBar.tsx
interface ProgressBarProps {
  type: 'knowledge' | 'wisdom' | 'xp';
  current: number;
  max: number;
  showLabel?: boolean;
  animated?: boolean;
}

// components/Avatar.tsx
interface AvatarProps {
  character: 'owl' | 'scholar' | 'explorer';
  emotion: 'happy' | 'thinking' | 'encouraging' | 'curious' | 'celebrating';
  size: 'small' | 'medium' | 'large';
  speaking?: boolean;  // Animated speech bubble
}

// components/QuestionCard.tsx
interface QuestionCardProps {
  question: Question;
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  showType?: boolean;  // Show "KNOWLEDGE" or "WISDOM" badge
}

// components/AnswerOption.tsx
interface AnswerOptionProps {
  option: AnswerOption;
  state: 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled';
  onClick: () => void;
}

// components/HeartMeter.tsx
interface HeartMeterProps {
  total: number;
  remaining: number;
  animated?: boolean;  // Shake on loss
}

// components/StreakIndicator.tsx
interface StreakIndicatorProps {
  count: number;
  onFire?: boolean;  // >= 3 streak shows flames
}

// components/TierBadge.tsx
interface TierBadgeProps {
  tier: 1 | 2 | 3 | 4;
  showAnimation?: boolean;  // For tier-up moments
}

// components/FeedbackModal.tsx
interface FeedbackModalProps {
  type: 'correct' | 'incorrect_knowledge' | 'incorrect_wisdom' | 'tier_up';
  feedback: TutorFeedback;
  onContinue: () => void;
  onRetry?: () => void;  // For wisdom hints
}

// components/SocratesSpeechBubble.tsx
interface SpeechBubbleProps {
  text: string;
  emotion: AvatarEmotion;
  isQuestion?: boolean;  // Different styling for Socratic questions
}
```

### Page Components

```typescript
// pages/student/home.tsx
// - Topic list with progress
// - XP/Level display
// - Recent achievements

// pages/student/topic/[topicId].tsx
// - Topic details
// - Start session button
// - Previous session stats

// pages/student/session/[sessionId].tsx
// - Active learning session
// - Question display
// - Real-time state updates

// pages/parent/dashboard.tsx
// - Child overview
// - Weekly activity
// - Insights

// pages/parent/report/[childId].tsx
// - Detailed progress report
// - Topic breakdown
// - Recommendations
```

---

## State Management (Zustand)

```typescript
// stores/sessionStore.ts
interface SessionStore {
  // State
  sessionId: string | null;
  currentQuestion: Question | null;
  sessionState: SessionState;
  feedback: TutorFeedback | null;

  // UI State
  isLoading: boolean;
  showFeedback: boolean;
  showTierUp: boolean;

  // Actions
  startSession: (topicId: string) => Promise<void>;
  fetchNextQuestion: () => Promise<void>;
  submitAnswer: (optionId: string) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  closeFeedback: () => void;
}

// stores/studentStore.ts
interface StudentStore {
  profile: StudentProfile | null;
  topics: Topic[];
  achievements: Achievement[];

  fetchProfile: () => Promise<void>;
  fetchTopics: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
}
```

---

## Animations & Micro-interactions

### Key Animations

1. **Correct Answer**
   - Option turns green with checkmark
   - Confetti burst (subtle)
   - XP counter animates up
   - Streak fire grows

2. **Incorrect Answer**
   - Option turns red with X
   - Heart breaks animation
   - Streak resets (number shrinks)
   - Gentle shake on card

3. **Tier Up**
   - Screen overlay with particles
   - Tier badge morphs (1→2→3→4)
   - Socrates avatar celebrates
   - Sound effect (optional)

4. **Progress Bars**
   - Smooth fill animation
   - Glow effect at milestones
   - Different colors for K vs W

5. **Avatar Expressions**
   - Smooth transitions between emotions
   - Subtle idle animations (blinking, slight movement)
   - Speech bubble appears with typewriter effect

### Animation Durations

```css
--animation-quick: 150ms;     /* Button hovers, selections */
--animation-normal: 300ms;    /* Modals, transitions */
--animation-slow: 500ms;      /* Celebrations, tier-ups */
--animation-speech: 50ms;     /* Per character typewriter */
```

---

## Accessibility

### Requirements

1. **Keyboard Navigation**
   - Tab through options (A, B, C, D)
   - Enter to select
   - Escape to pause

2. **Screen Reader Support**
   - Proper ARIA labels on all interactive elements
   - Question and options read aloud
   - Feedback announcements

3. **Visual Accessibility**
   - High contrast mode option
   - Minimum 4.5:1 contrast ratio
   - No color-only indicators (always include icons/text)

4. **Reading Level**
   - All text at 5th grade reading level
   - Simple sentences
   - No jargon

### ARIA Examples

```html
<div role="region" aria-label="Question area">
  <h2 id="question-text">Which explorer discovered America in 1492?</h2>

  <div role="radiogroup" aria-labelledby="question-text">
    <button
      role="radio"
      aria-checked="false"
      aria-label="Option A: Christopher Columbus"
    >
      A) Christopher Columbus
    </button>
    <!-- ... -->
  </div>
</div>

<div role="status" aria-live="polite" aria-label="Feedback">
  Correct! Columbus sailed the ocean blue in 1492.
</div>
```

---

## Responsive Design

### Breakpoints

```css
--breakpoint-mobile: 375px;   /* Phones */
--breakpoint-tablet: 768px;   /* Tablets */
--breakpoint-desktop: 1024px; /* Laptops */
--breakpoint-wide: 1440px;    /* Large screens */
```

### Mobile Considerations

- Options stack vertically (full width)
- Avatar smaller, positioned at bottom
- Progress bars simplified
- Touch targets minimum 44x44px
- Swipe gestures for navigation (optional)
