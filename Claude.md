# Socrates Home Page Style and Theme Guide

This guide codifies the visual language used on the current home page. It is a "studio of the mind": dark, atmospheric, classical, and deliberate, with subtle glows and mechanical/astrolabe motifs.

## 1) Core Mood
- Scholarly, ancient, and precise, but modern in execution.
- Dim-lit workshop: brass, ember light, slate metal.
- A sense of ceremony, not a generic SaaS vibe.
- UI should feel like an artifact: crafted, not assembled.

## 2) Color System
The home page leans on slate/charcoal for the canvas and amber for the flame.

Primary palette (use as CSS variables or tailwind equivalents):
- Ink: #0b0f14 (deep slate/black base)
- Slate 900: #0f172a
- Slate 800: #1f2937
- Slate 700: #334155
- Slate 500: #64748b
- Amber 500: #f59e0b (primary accent)
- Amber 400: #fbbf24 (glow edge)
- Amber 100: #fef3c7 (soft highlight)

Supporting accents (sparingly):
- Emerald 400: #34d399
- Sky 400: #38bdf8
- Violet 400: #a78bfa
- Rose 400: #fb7185

Guidelines:
- Use amber for highlights, CTAs, and glow.
- Avoid saturated blues/purples for primary actions.
- Backgrounds should stay near-black/slate; no white pages.

## 3) Typography
Pairing on the page:
- Serif: "classical headline" (use a real serif; avoid system defaults)
- Mono: "ritual text" (small caps, wide tracking)

Rules:
- Headlines: serif, large, elegant, high contrast.
- UI labels: mono, small, uppercase or tracked.
- Body: mono or restrained sans; keep line lengths moderate.
- Emphasis via italics on serif, not bold on body.

## 4) Layout and Spacing
Structure:
- Centered hero with a single strong statement.
- Sections separated by borders or subtle texture shifts.
- Use large vertical spacing (80-120px) between sections.

Spacing tokens:
- Tight: 8-12px
- Normal: 16-24px
- Section: 80-120px

## 5) Signature Motifs
Astrolabe / instrument circle:
- Concentric rings, slow rotation.
- Small icon medallions pinned to rings.
- Thin strokes, subtle ticks, faint grid.

Flame:
- Warm amber core, soft pulse.
- Used as a symbol of learning.

Texture:
- Subtle pattern overlays (e.g., faint dots or cube grid).
- Keep opacity low (5-15%).

## 6) Components
Nav:
- Fixed top, translucent slate with blur.
- Mono nav links, uppercase, subtle hover glow.

Buttons:
- Outline or glassy fills.
- Primary: amber glow, low saturation, not neon.
- Secondary: dark border, gentle hover.

Feature cards:
- Dark panels, thin border.
- Icon corner watermark, top-right.
- Hover: border warms to amber, background deepens.

## 7) Motion and Effects
- Slow rotation for decorative rings (30-60s).
- Ambient pulse on flame/glow.
- Hover: tiny scale (1.02) and border warm-up.
- Avoid busy micro-motion; keep it ceremonial.

## 8) Iconography
- Use consistent stroke-based icons.
- Size: 16-24 in buttons, 40-60 for feature glyphs.
- Colors: match accent palette (amber, emerald, etc).
- Icons should read as "disciplines" or "tools."

## 9) Copy Voice
- Elevated, poetic, confident.
- Short declarative statements.
- A sense of invitation and ritual.

Examples:
- "Education is not something you have. It is something you are."
- "Surviving the Wilderness."
- "Tools for the intellectual journey."

## 10) Do and Don't
Do:
- Use deep slate backgrounds with amber highlights.
- Lean on serif headlines and mono UI text.
- Keep textures subtle and layered.
- Use animated instruments sparingly.

Don't:
- Use flat, bright backgrounds.
- Default to generic modern SaaS gradients.
- Overuse blur or neon glow.
- Mix too many icon sets or font families.

## 11) Implementation Notes
- Keep contrast accessible: amber text on slate works well.
- Use borders instead of heavy shadows.
- Reserve bold colors for focal points only.

