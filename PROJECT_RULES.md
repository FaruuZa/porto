# PROJECT RULES & DESIGN MANDATES

## 1. Zero Blur Effects (Strict Ban)
- **NEVER** use `backdrop-filter: blur(...)` or `filter: blur(...)`.
- **NEVER** use Tailwind classes `backdrop-blur-*` or `blur-*`.
- Background overlays must use solid or semi-opaque hex/rgba colors (e.g. `bg-[var(--bg-color)]/95`), without blur filters. This preserves GPU performance and adheres to the retro pen-and-paper indie aesthetic.

## 2. Zero Neon / Cyberpunk Glow (Strict Ban)
- **NEVER** use neon glow effects, neon text shadows (`text-shadow: 0 0 10px #...`), or glowing cyberpunk matrix themes.
- Omori aesthetic is purely analog sketchbook, monochrome pen-and-paper, with psychological dark horror (dried blood reds, black-out redactions, ASCII corruptions).

## 3. Zero Native OS Emojis (Strict Ban)
- **NEVER** use OS/system emojis (e.g. 📂, 🔪, 🔊, 💀, etc.).
- Always use vector icons (Lucide React) or crisp ASCII text (e.g. `[ ! ]`, `->`, `[ SELECT ]`, `[ WAKE UP ]`).

## 4. Black Space Psychological Immersion
- **NEVER** show intrusive banners or indicators announcing that Black Space is active.
- The player must explore and sense the corruption through ambient changes, scrambled text, redacted memory blocks, and subtle audio cues.
- Do NOT use cringey fantasy terms like "THE ABYSS". Use raw corrupted markers: `???`, `[REDACTED]`, or scrambled psychological text.

## 5. Puzzle Completion Integrity
- Waking up from Black Space **MUST ONLY** be possible after all 3 required anomalies have been solved/uncovered.
- Never provide premature wake-up shortcuts or bypasses.

## 6. Language Consistency & Toggle
- Provide a clean language toggle (`ID` | `EN`).
- When `ID` is active, all visible text across the site must be consistent Indonesian.
- When `EN` is active, all visible text must be consistent English.
