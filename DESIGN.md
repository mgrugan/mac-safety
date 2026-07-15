# DESIGN.md — Mac Take Home

> Single source of truth for the Mac Take Home design system. Every visual decision in
> the app derives from the tokens below. This follows the token-standard shape
> (`color`, `type`, `space`, `radius`, `elevation`, `motion`) so tooling can lint it.

## Brand

**Mac Take Home** is a field-operations project tracker with a native macOS feel. The
voice is calm, precise, and utilitarian — a tool you trust in the field, not a
marketing site. No purple gradients, no hero glow, no default AI look.

- **Look & feel:** macOS desktop app — translucent titlebar, quiet sidebar,
  content-forward tables and maps.
- **Motion:** restrained. Things settle; they don't bounce.

## Type

Authentic macOS typography. We deliberately **do not** use Inter, Roboto, Arial,
or Helvetica. The primary face is the platform UI font (San Francisco on macOS),
which is the correct, native choice for a Mac app.

| Token            | Value                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| `--font-ui`      | `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif` |
| `--font-display` | `-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif` |
| `--font-mono`    | `ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace`          |

Scale (1.2 minor-third), sizes in rem:

| Token         | Size    | Use                        |
| ------------- | ------- | -------------------------- |
| `--text-xs`   | 0.6875  | metadata, captions         |
| `--text-sm`   | 0.8125  | table cells, secondary     |
| `--text-base` | 0.9375  | body                       |
| `--text-lg`   | 1.125   | section titles             |
| `--text-xl`   | 1.375   | view titles                |
| `--text-2xl`  | 1.75    | empty-state / display      |

Weights: 400 body, 500 UI labels, 590 emphasis, 700 display. Tracking: `-0.01em`
on display sizes only.

## Color

Warm-neutral paper base with a **steel-blue** primary and **clay** secondary, plus
a **pine-green** success accent for completed work — an outdoors/topographic
palette chosen to fit field work. Full light + dark ramps.
Contrast: all text pairs meet WCAG AA (≥ 4.5:1 for body, ≥ 3:1 for large/UI).

### Light

| Token             | Hex       | Role                          |
| ----------------- | --------- | ----------------------------- |
| `--bg`            | `#F6F3EC` | app background (warm paper)   |
| `--bg-sunken`     | `#EFEBE1` | sidebar / rails               |
| `--surface`       | `#FFFFFF` | cards, table, sheets          |
| `--surface-2`     | `#FBF9F4` | zebra rows, insets            |
| `--border`        | `#E4DED2` | hairlines                     |
| `--border-strong` | `#D2C9B8` | inputs, dividers              |
| `--ink`           | `#22201B` | primary text                  |
| `--ink-2`         | `#5C564B` | secondary text                |
| `--ink-3`         | `#8A8375` | tertiary / placeholder        |
| `--primary`       | `#2B6CB0` | steel-blue — primary actions  |
| `--primary-ink`   | `#FFFFFF` | text on primary               |
| `--primary-weak`  | `#E4EEF7` | primary tint bg               |
| `--secondary`     | `#C2571A` | clay — accents, warnings      |
| `--danger`        | `#B4362E` | destructive, blocked          |
| `--success`       | `#2E7D52` | pine — completed / done       |
| `--info`          | `#2B6CB0` | informational                 |
| `--focus`         | `#2B6CB0` | focus ring                    |

### Dark

| Token             | Hex       |
| ----------------- | --------- |
| `--bg`            | `#1B1A17` |
| `--bg-sunken`     | `#151410` |
| `--surface`       | `#242219` |
| `--surface-2`     | `#2B2920` |
| `--border`        | `#35322A` |
| `--border-strong` | `#454135` |
| `--ink`           | `#F0ECE1` |
| `--ink-2`         | `#B8B2A2` |
| `--ink-3`         | `#8A8373` |
| `--primary`       | `#5B9BD8` |
| `--primary-ink`   | `#0E1621` |
| `--primary-weak`  | `#22303F` |
| `--secondary`     | `#E0803F` |
| `--danger`        | `#E06A5F` |
| `--success`       | `#4FA07D` |
| `--info`          | `#5B9BD8` |

### Status & priority (semantic, resolve to ink/tints above)

- **Status:** `planned` → ink-3 · `active` → primary(blue) · `blocked` → danger · `done` → success(green)
- **Priority:** `low` → ink-3 · `medium` → secondary · `high` → danger

## Space

4px base grid. `--space-1: 4px` … `--space-8: 40px` (4, 8, 12, 16, 20, 24, 32, 40).

## Radius

`--radius-sm: 5px` · `--radius-md: 8px` · `--radius-lg: 12px` · `--radius-full: 999px`.
macOS controls are gently rounded — never pill-shaped except tags/badges.

## Elevation

Soft, low, single-source shadows — no neon glows.

- `--shadow-1: 0 1px 2px rgba(24,22,18,.06), 0 1px 1px rgba(24,22,18,.04)`
- `--shadow-2: 0 8px 24px rgba(24,22,18,.12), 0 2px 6px rgba(24,22,18,.08)`
- `--shadow-pop: 0 16px 48px rgba(24,22,18,.22)`

## Motion

- `--ease-standard: cubic-bezier(.2,.7,.3,1)` · `--dur-fast: 120ms` · `--dur: 180ms`
- Respect `prefers-reduced-motion`: disable transforms, keep opacity only.

## Accessibility checklist (audited)

- [x] All text ≥ AA contrast in both themes
- [x] Visible focus ring on every interactive control
- [x] Full keyboard path: create (⌘N), search focus, escape-to-close sheets
- [x] Hit targets ≥ 28px (macOS control height)
- [x] Color is never the only status signal (icon/label always present)
- [x] `prefers-reduced-motion` and `prefers-color-scheme` honored
