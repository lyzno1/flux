---
name: flux-design-system
description: Flux monochrome design system specification. Pure grayscale oklch tokens, pill-shaped interactive elements, rounded container panels, deep dark mode, and elevation surfaces. Use when building, modifying, or reviewing any UI component, page, or style in the Flux web app. Triggers on tasks involving colors, spacing, border radius, dark mode, theming, design tokens, component styling, or visual consistency. Also use when asked to review whether UI matches the design system.
---

# Flux Design System

Minimalist monochrome design language for AI-native product interfaces. Pure grayscale palette, pill-shaped interactives, rounded panels, deep dark mode, oklch color space throughout.

## Core Principles

1. **Monochrome-first** — All structural elements use pure grayscale `oklch(L 0 0)`. Chromatic color is reserved for semantic states only (destructive, success, warning, info).
2. **Shape = function** — Fully rounded (`rounded-full`) = interactive. Large radius (`rounded-xl`) = container. This creates instant visual grammar.
3. **Depth via luminance** — Elevation is conveyed through stacked lightness levels, not heavy shadows. Surface tokens provide three progressive tiers.
4. **No `dark:` prefix** — All color switching is handled via CSS custom properties that auto-switch between `:root` and `.dark`. Components should never use the `dark:` Tailwind variant for colors. Exceptions: visual effects like `mix-blend-mode` or third-party integrations (e.g., Shiki syntax highlighting).

## Color Tokens

All tokens use oklch with chroma `0` for perceptual grayscale. `L` ranges 0 (black) to 1 (white).

### Light Mode (`:root`)

```
--background:          oklch(1 0 0)        /* pure white page */
--foreground:          oklch(0.13 0 0)      /* near-black text */
--primary:             oklch(0.15 0 0)      /* strong CTA */
--primary-foreground:  oklch(0.985 0 0)     /* text on primary */
--secondary:           oklch(0.955 0 0)     /* subtle fill */
--muted:               oklch(0.955 0 0)     /* subdued bg */
--muted-foreground:    oklch(0.50 0 0)      /* placeholder text */
--accent:              oklch(0.95 0 0)      /* hover/active */
--card:                oklch(1 0 0)         /* card bg */
--popover:             oklch(1 0 0)         /* floating panels */
--border:              oklch(0.91 0 0)      /* structural borders */
--input:               oklch(0.91 0 0)      /* input borders */
--ring:                oklch(0.65 0 0)      /* focus ring */
--surface-1:           oklch(0.985 0 0)     /* elevation 1 */
--surface-2:           oklch(0.97 0 0)      /* elevation 2 */
--surface-3:           oklch(0.955 0 0)     /* elevation 3 */
--radius:              0.75rem              /* 12px base */
```

### Dark Mode (`.dark`)

```
--background:          oklch(0.10 0 0)      /* deep black ~#0a0a0a */
--foreground:          oklch(0.93 0 0)      /* reduced glare */
--primary:             oklch(0.93 0 0)      /* bright CTA */
--primary-foreground:  oklch(0.10 0 0)      /* text on primary */
--secondary:           oklch(0.18 0 0)      /* deeper fill */
--muted:               oklch(0.18 0 0)      /* subdued bg */
--muted-foreground:    oklch(0.58 0 0)      /* subdued text (AA on muted) */
--accent:              oklch(0.22 0 0)      /* subtle accent */
--card:                oklch(0.14 0 0)      /* elevated from bg */
--popover:             oklch(0.16 0 0)      /* above card level */
--border:              oklch(1 0 0 / 8%)    /* frosted borders */
--input:               oklch(1 0 0 / 12%)   /* input borders */
--ring:                oklch(0.50 0 0)      /* focus ring */
--surface-1:           oklch(0.14 0 0)      /* card level */
--surface-2:           oklch(0.18 0 0)      /* secondary level */
--surface-3:           oklch(0.22 0 0)      /* accent level */
--sidebar:             oklch(0.10 0 0)      /* flush with bg */
```

Dark mode elevation stack: `bg 0.10 → surface-1 0.14 → popover 0.16 → surface-2 0.18 → surface-3 0.22`

### Subtle Tokens (auto-switch light/dark)

These tokens replace `dark:` prefix patterns. They provide reduced-opacity or variant fills that auto-switch.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--input-subtle` | transparent | `oklch(1 0 0 / 12%)` | Input/select/checkbox background fill |
| `--input-subtle-hover` | `oklch(0.955 0 0)` | `oklch(1 0 0 / 20%)` | Hover state for outline buttons, select triggers |
| `--input-subtle-disabled` | `oklch(0.91 0 0 / 50%)` | `oklch(1 0 0 / 32%)` | Disabled input/switch unchecked fill |
| `--muted-subtle` | `oklch(0.955 0 0 / 50%)` | `oklch(0.18 0 0 / 50%)` | Ghost button/badge hover |
| `--accent-subtle` | `oklch(0.95 0 0 / 50%)` | `oklch(0.22 0 0 / 50%)` | Attachment hover, subtle accent |
| `--destructive-muted` | `oklch(0.58 0.22 27 / 10%)` | `oklch(0.704 0.191 22.216 / 20%)` | Destructive button/badge/dropdown bg |
| `--destructive-muted-hover` | `oklch(0.58 0.22 27 / 20%)` | `oklch(0.704 0.191 22.216 / 30%)` | Destructive hover state |
| `--destructive-border` | `oklch(0.58 0.22 27)` | `oklch(0.704 0.191 22.216 / 50%)` | Invalid input border |
| `--destructive-ring` | `oklch(0.58 0.22 27 / 20%)` | `oklch(0.704 0.191 22.216 / 40%)` | Invalid input ring |
| `--overlay` | `oklch(0 0 0 / 40%)` | `oklch(0 0 0 / 60%)` | Dialog/sheet backdrop |

### Semantic Colors (only non-grayscale tokens)

- **Destructive**: hue 27 (red) — `oklch(0.58 0.22 27)` + muted/border/ring tiers
- **Success**: hue 145 (green) — base + foreground + muted tiers
- **Warning**: hue 85 (yellow) — base + foreground + muted tiers
- **Info**: hue 250 (blue) — base + foreground + muted tiers

### Chart Colors (grayscale ramp)

`chart-1: 0.80` → `chart-2: 0.65` → `chart-3: 0.50` → `chart-4: 0.35` → `chart-5: 0.20`

## Border Radius System

Base `--radius: 0.75rem` (12px). Tailwind derives:

| Class | Value | Assigned to |
|---|---|---|
| `rounded-full` | 9999px | Button, Badge, Progress, ScrollArea thumb, ButtonGroup, Switch |
| `rounded-xl` | 16px | Card, Dialog, Popover, Dropdown, HoverCard, Select, Command, Input, Textarea, InputGroup, InputOTP, Tabs list, Alert |
| `rounded-lg` | 12px | Dropdown/Select/Command items, Tabs trigger, Accordion trigger, Nav links |
| `rounded-md` | 10px | Tooltip, Skeleton |
| `rounded-sm` | 8px | Checkbox (soft square) |

**Rule: never use `rounded-2xl` for popup containers.** It clips items near edges. All floating panels use `rounded-xl` with `p-1` inner padding for list-style containers.

**Rule: never use `rounded-[Xpx]` arbitrary values.** Always use the token-derived classes above.

## Typography

- Font: `"Inter Variable", sans-serif` (variable font, 100-900 weights)
- Base size: `text-sm` (14px) on desktop, `text-base` (16px) on small screens
- Body line-height: `text-sm/relaxed` (~1.6)
- Heading weight: `font-medium` (500)
- Smoothing: `antialiased` on body

## Spacing

### Buttons

| Size | Height | Padding |
|---|---|---|
| `xs` | h-6 | px-3 |
| `sm` | h-8 | px-3.5 |
| `default` | h-9 | px-4 |
| `lg` | h-10 | px-5 |
| `icon` | size-9 | — |

### Inputs

All text inputs and select triggers: `h-9 px-3 rounded-xl`.

### Containers

- Card: `py-4`, content `px-4`, `gap-4`
- Popover/HoverCard: `p-2.5 gap-2.5`
- Dropdown/Select/Command: `p-1` (list padding)
- Dialog: `p-4 gap-4`

## Interactions

- Press: `active:scale-[0.98]` on all buttons (2% scale-down)
- Transitions: `transition-[color,background-color,border-color,box-shadow]`
- Popup animations: `duration-100`, directional `slide-in-from-*` based on placement side
- Focus: `focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50`
- Motion: always include `motion-reduce:transition-none motion-reduce:animate-none`

## Component Patterns

### Popup containers (dropdown, select, popover, hover card, command, dialog)

```
bg-popover text-popover-foreground
ring-1 ring-foreground/10
shadow-lg rounded-xl
```

List-style get `p-1`. Content-style get `p-2.5`.

### List items (inside popups)

```
rounded-lg px-2 py-2 text-xs
focus:bg-accent focus:text-accent-foreground
data-disabled:pointer-events-none data-disabled:opacity-50
```

### Cards

```
rounded-xl bg-card ring-1 ring-border
```

First-child images: `rounded-t-xl`. Last-child: `rounded-b-xl`.

### Sidebar

Flush with page background in dark mode (`--sidebar` = `--background`). Light mode: `oklch(0.985 0 0)`.

### Invalid state pattern (inputs, checkboxes, switches)

```
aria-invalid:border-destructive-border
aria-invalid:ring-1
aria-invalid:ring-destructive-ring
```

Never use `dark:aria-invalid:*` — the tokens auto-switch.

### Destructive variant pattern (buttons, badges, dropdown items)

```
bg-destructive-muted text-destructive
hover:bg-destructive-muted-hover
focus-visible:ring-destructive-ring
```

## Accessibility

- All light mode text pairs pass WCAG AA 4.5:1
- Dark `muted-foreground` is set to `oklch(0.58 0 0)` to clear AA on muted surfaces
- All animations respect `prefers-reduced-motion`
- Focus uses `focus-visible:` (keyboard only, not mouse)
- No hardcoded colors — always use design tokens

## Rules

- Never use chromatic colors for structural/decorative purposes
- Never use `rounded-2xl` on popup containers
- Never use `dark:` prefix for color-related classes — use auto-switching CSS tokens instead
- Never use hardcoded Tailwind colors (e.g., `gray-500`, `blue-600`, `indigo-700`) — use semantic tokens
- Always pair foreground tokens with their background counterparts
- Always include `motion-reduce:` variants on animated elements
- Always use `focus-visible:` not `focus:` for focus rings
- Use `ring-1 ring-foreground/10` for container borders, not `border`
- Chart visualizations must use the grayscale `chart-1..5` ramp
- Token file: `apps/web/src/index.css`
- Component files: `apps/web/src/components/ui/*.tsx`

## Extended Reference

For full token tables, contrast ratio analysis, and per-component file index, see [references/tokens.md](references/tokens.md).
