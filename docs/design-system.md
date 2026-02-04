# Flux Design System

Minimalist monochrome design language for AI-native product interfaces. Pure grayscale palette, pill-shaped interactive elements, rounded container panels, and a deep dark mode built on the oklch color space.

---

## Philosophy

Flux follows three core principles:

1. **Monochrome-first** — Color is information, not decoration. The interface uses pure grayscale (`oklch(L 0 0)`) for all structural elements. Chromatic color is reserved exclusively for semantic states: destructive, success, warning, and info.

2. **Shape communicates function** — Interactive elements (buttons, badges, pills) are fully rounded (`rounded-full`). Container elements (cards, panels, popups) use large but bounded radii (`rounded-xl`). This creates an instant visual grammar: if it's round, you can act on it.

3. **Depth through luminance** — Rather than relying on heavy shadows, elevation is conveyed through stacked luminance levels. Surface tokens (`surface-1`, `surface-2`, `surface-3`) provide three progressive elevation tiers that work seamlessly across light and dark modes.

---

## Color Tokens

All tokens use the [oklch](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) color space with `0` chroma for true perceptual grayscale. The `L` (lightness) channel ranges from `0` (black) to `1` (white).

### Core Palette

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.10 0 0)` | Page background |
| `--foreground` | `oklch(0.13 0 0)` | `oklch(0.93 0 0)` | Primary text |
| `--primary` | `oklch(0.15 0 0)` | `oklch(0.93 0 0)` | CTAs, primary actions |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.10 0 0)` | Text on primary |
| `--secondary` | `oklch(0.955 0 0)` | `oklch(0.18 0 0)` | Secondary backgrounds |
| `--secondary-foreground` | `oklch(0.15 0 0)` | `oklch(0.93 0 0)` | Text on secondary |
| `--muted` | `oklch(0.955 0 0)` | `oklch(0.18 0 0)` | Subdued backgrounds |
| `--muted-foreground` | `oklch(0.50 0 0)` | `oklch(0.55 0 0)` | Subdued text, placeholders |
| `--accent` | `oklch(0.95 0 0)` | `oklch(0.22 0 0)` | Hover/active states |
| `--accent-foreground` | `oklch(0.15 0 0)` | `oklch(0.93 0 0)` | Text on accent |

### Surfaces & Containers

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--card` | `oklch(1 0 0)` | `oklch(0.14 0 0)` | Card backgrounds |
| `--card-foreground` | `oklch(0.13 0 0)` | `oklch(0.93 0 0)` | Card text |
| `--popover` | `oklch(1 0 0)` | `oklch(0.16 0 0)` | Dropdowns, popovers |
| `--popover-foreground` | `oklch(0.13 0 0)` | `oklch(0.93 0 0)` | Popover text |
| `--surface-1` | `oklch(0.985 0 0)` | `oklch(0.14 0 0)` | Elevation level 1 |
| `--surface-2` | `oklch(0.97 0 0)` | `oklch(0.18 0 0)` | Elevation level 2 |
| `--surface-3` | `oklch(0.955 0 0)` | `oklch(0.22 0 0)` | Elevation level 3 |

### Borders & Focus

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--border` | `oklch(0.91 0 0)` | `oklch(1 0 0 / 8%)` | Structural borders |
| `--input` | `oklch(0.91 0 0)` | `oklch(1 0 0 / 12%)` | Input field borders |
| `--ring` | `oklch(0.65 0 0)` | `oklch(0.50 0 0)` | Focus ring color |

### Semantic Colors

These are the only non-grayscale tokens in the system. Each semantic state has three tiers:

| State | Base | Foreground | Muted | Hue |
|---|---|---|---|---|
| **Destructive** | `oklch(0.58 0.22 27)` | `oklch(0.985 0 0)` | — | Red |
| **Success** | `oklch(0.59 0.16 145)` | `oklch(0.36 0.12 145)` | `oklch(0.94 0.05 145)` | Green |
| **Warning** | `oklch(0.75 0.15 85)` | `oklch(0.47 0.12 85)` | `oklch(0.94 0.05 85)` | Yellow |
| **Info** | `oklch(0.62 0.15 250)` | `oklch(0.42 0.15 250)` | `oklch(0.94 0.05 250)` | Blue |

### Chart Colors

Grayscale ramp for data visualization, evenly distributed across the lightness scale:

| Token | Value | Usage |
|---|---|---|
| `--chart-1` | `oklch(0.80 0 0)` | Lightest series |
| `--chart-2` | `oklch(0.65 0 0)` | |
| `--chart-3` | `oklch(0.50 0 0)` | |
| `--chart-4` | `oklch(0.35 0 0)` | |
| `--chart-5` | `oklch(0.20 0 0)` | Darkest series |

---

## Dark Mode

Dark mode is activated via the `.dark` class on an ancestor element. Design decisions for the dark theme:

- **Deep black background** — `oklch(0.10 0 0)` (~`#0a0a0a`) provides a true-dark canvas that reduces eye strain and makes content feel elevated.
- **Reduced foreground glare** — Text lightness caps at `0.93` instead of `0.985` to prevent harsh white-on-black contrast.
- **Transparent borders** — `oklch(1 0 0 / 8%)` gives borders a frosted appearance that adapts to any surface below them.
- **Transparent inputs** — `oklch(1 0 0 / 12%)` for input borders, slightly more prominent than structural borders.
- **Flush sidebar** — `oklch(0.10 0 0)` matches the page background, creating a seamless edge-to-edge feel.
- **Elevated popover** — `oklch(0.16 0 0)` sits above the card level (`0.14`) so dropdowns and menus feel lifted.

### Dark Mode Elevation Stack

```
Background  0.10  ░░░░░░░░░░░░░░
Surface-1   0.14  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒  (card level)
Popover     0.16  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  (floating panels)
Surface-2   0.18  ████████████████  (secondary fills)
Surface-3   0.22  ████████████████  (accent fills)
```

---

## Border Radius

The base radius `--radius` is set to `0.75rem` (12px). Tailwind's radius scale derives from this:

| Tailwind Class | Computed Value | Formula |
|---|---|---|
| `rounded-sm` | 8px | `--radius - 4px` |
| `rounded-md` | 10px | `--radius - 2px` |
| `rounded-lg` | 12px | `--radius` |
| `rounded-xl` | 16px | `--radius + 4px` |
| `rounded-2xl` | 20px | `--radius + 8px` |
| `rounded-full` | 9999px | (CSS intrinsic) |

### Radius Assignment by Component Type

| Shape | Radius | Components |
|---|---|---|
| **Pill** (`rounded-full`) | 9999px | Button, Badge, Progress, ScrollArea thumb, ButtonGroup |
| **Panel** (`rounded-xl`) | 16px | Card, Dialog, Popover, DropdownMenu, HoverCard, Select (content), Command, Input, Textarea, InputGroup, InputOTP, Tabs (list), Alert |
| **Item** (`rounded-lg`) | 12px | DropdownMenu items, Select items, Command items, Tabs trigger, Accordion trigger, Header nav links |
| **Small** (`rounded-md`) | 10px | Tooltip, Skeleton |
| **Soft square** (`rounded-[5px]`) | 5px | Checkbox |

### Why Not `rounded-2xl` for Popups?

Early iterations used `rounded-2xl` (20px) for dropdown menus, selects, and popovers. This caused items near the top and bottom edges to feel visually clipped by the container's large corner radius. The fix was to standardize all popup containers at `rounded-xl` (16px) with `p-1` inner padding to keep list items clear of the rounded corners.

---

## Typography

| Property | Value |
|---|---|
| Font family | `"Inter Variable", sans-serif` |
| Base text size | `text-xs` (0.75rem / 12px) |
| Body line height | `text-xs/relaxed` (12px / ~1.625) |
| Font smoothing | `antialiased` (subpixel rendering disabled) |
| Heading weight | `font-medium` (500) |
| Body weight | `font-normal` (400) — inherited |

Inter Variable is loaded as a variable font, providing smooth weight interpolation from 100 to 900 without additional network requests.

### Text Color Mapping

| Role | Light Token (L) | Dark Token (L) | Tailwind Class |
|---|---|---|---|
| Primary text | 0.13 | 0.93 | `text-foreground` |
| Subdued text | 0.50 | 0.55 | `text-muted-foreground` |
| On-primary text | 0.985 | 0.10 | `text-primary-foreground` |

---

## Spacing & Sizing

### Button Sizes

| Size | Height | Padding | Icon Size |
|---|---|---|---|
| `xs` | 24px (`h-6`) | `px-3` | 12px (`size-3`) |
| `sm` | 32px (`h-8`) | `px-3.5` | 14px (`size-3.5`) |
| `default` | 36px (`h-9`) | `px-4` | 16px (`size-4`) |
| `lg` | 40px (`h-10`) | `px-5` | 16px (`size-4`) |
| `icon` | 36px (`size-9`) | — | 16px |
| `icon-xs` | 24px (`size-6`) | — | 12px |
| `icon-sm` | 32px (`size-8`) | — | 16px |
| `icon-lg` | 40px (`size-10`) | — | 16px |

### Input Sizes

| Element | Height | Padding |
|---|---|---|
| Input | 36px (`h-9`) | `px-3` |
| Select trigger | 36px (`h-9`) | `pl-2.5 pr-2` |
| InputGroup | 36px (`h-9`) | inherits from children |

### Container Spacing

| Component | Padding | Gap |
|---|---|---|
| Card | `py-4`, content `px-4` | `gap-4` |
| Card (sm) | `py-3`, content `px-3` | `gap-2` |
| Dialog content | `p-4` | `gap-4` |
| Popover content | `p-2.5` | `gap-2.5` |
| Dropdown menu | `p-1` | — |
| Header | `px-4 py-2.5` | `gap-1` (nav), `gap-2` (actions) |

---

## Micro-interactions

### Press Feedback

All buttons include `active:scale-[0.98]` — a subtle 2% scale-down on press that provides tactile feedback without layout reflow. Combined with `motion-reduce:transition-none` for accessibility.

### Transitions

- Default transition: `transition-[color,background-color,border-color,box-shadow]`
- Duration: inherited from Tailwind defaults (~150ms)
- Popup enter/exit: `duration-100` with `animate-in` / `animate-out`
- Popup transforms: `fade-in-0`, `zoom-in-95`, `slide-in-from-top-2` (varies by placement side)
- Reduced motion: all animations disabled via `motion-reduce:animate-none motion-reduce:transition-none`

### Focus Rings

Focus-visible states use a combination of border and ring:
```
focus-visible:border-ring
focus-visible:ring-1
focus-visible:ring-ring/50
```

This produces a two-layer effect: a solid border change plus a translucent outer ring, providing both WCAG-compliant focus indication and visual refinement.

---

## Component Patterns

### Popup Containers

All floating panels (dropdown menu, select, popover, hover card, command, dialog) share a consistent structure:

- Background: `bg-popover text-popover-foreground`
- Border: `ring-1 ring-foreground/10`
- Shadow: `shadow-lg`
- Radius: `rounded-xl`
- Inner padding: `p-1` for list-style containers (dropdown, select, command), `p-2.5` for content-style (popover, hover card)
- Z-index: `z-50`
- Animations: directional slide-in based on `data-[side=*]`

### List Items (within popups)

Interactive list items in dropdown menus, selects, and command palettes:

- Radius: `rounded-lg`
- Padding: `px-2 py-2`
- Text: `text-xs`
- Hover/focus: `focus:bg-accent focus:text-accent-foreground`
- Disabled: `data-disabled:pointer-events-none data-disabled:opacity-50`

### Cards

Cards use a subtle ring border rather than a solid border:

```
rounded-xl bg-card ring-1 ring-border
```

Image handling: first child images get `rounded-t-xl`, last child images get `rounded-b-xl`, and the card removes top padding when an image leads.

### Sidebar

The sidebar is flush with the page background (`--sidebar` matches `--background` in dark mode) to create a seamless panel feel. In light mode, `--sidebar` is `oklch(0.985 0 0)`, slightly off-white to differentiate from the pure white page background.

---

## Accessibility Notes

### Contrast Ratios

All text/background combinations target WCAG AA compliance (4.5:1 for normal text):

| Pair | Light Mode | Dark Mode | Status |
|---|---|---|---|
| `foreground` on `background` | ~18:1 | ~12:1 | Pass |
| `muted-foreground` on `background` | ~5.5:1 | ~4.2:1 | Pass |
| `muted-foreground` on `muted` | ~5.2:1 | ~3.9:1 | Borderline |
| `primary-foreground` on `primary` | ~14:1 | ~12:1 | Pass |

> **Note:** `muted-foreground` on `muted` in dark mode is borderline (~3.9:1). Consider bumping dark `--muted-foreground` to `oklch(0.58 0 0)` if strict AA compliance is required for all muted text contexts.

### Motion

All components include `motion-reduce:transition-none` and `motion-reduce:animate-none` to respect the user's `prefers-reduced-motion` system setting.

### Focus Visibility

All interactive elements use `focus-visible:` (not `focus:`) to avoid showing focus rings on mouse clicks while maintaining keyboard navigation visibility.

### Semantic Structure

- Header uses semantic `<header>` element with `<nav>` for navigation
- Body applies `antialiased` font smoothing
- Global border and outline colors are set in the base layer for consistency

---

## File Reference

Design tokens and component implementations:

| File | Role |
|---|---|
| `apps/web/src/index.css` | All CSS custom properties, theme registration, base layer |
| `apps/web/src/components/ui/button.tsx` | Pill buttons with CVA variants |
| `apps/web/src/components/ui/badge.tsx` | Pill badges with CVA variants |
| `apps/web/src/components/ui/card.tsx` | Rounded card container |
| `apps/web/src/components/ui/dialog.tsx` | Modal dialog with overlay |
| `apps/web/src/components/ui/dropdown-menu.tsx` | Context/dropdown menus |
| `apps/web/src/components/ui/popover.tsx` | Floating content panels |
| `apps/web/src/components/ui/hover-card.tsx` | Hover-triggered preview cards |
| `apps/web/src/components/ui/select.tsx` | Styled select dropdowns |
| `apps/web/src/components/ui/command.tsx` | Command palette / combobox |
| `apps/web/src/components/ui/input.tsx` | Text inputs |
| `apps/web/src/components/ui/textarea.tsx` | Multi-line text inputs |
| `apps/web/src/components/ui/input-group.tsx` | Input with addons |
| `apps/web/src/components/ui/input-otp.tsx` | OTP code input |
| `apps/web/src/components/ui/checkbox.tsx` | Soft-square checkbox |
| `apps/web/src/components/ui/tabs.tsx` | Tab navigation |
| `apps/web/src/components/ui/tooltip.tsx` | Hover tooltips |
| `apps/web/src/components/ui/alert.tsx` | Alert banners |
| `apps/web/src/components/ui/skeleton.tsx` | Loading placeholders |
| `apps/web/src/components/ui/accordion.tsx` | Collapsible sections |
| `apps/web/src/components/ui/button-group.tsx` | Grouped button strips |
| `apps/web/src/components/ui/progress.tsx` | Progress bars |
| `apps/web/src/components/ui/scroll-area.tsx` | Custom scrollbars |
| `apps/web/src/components/header.tsx` | App header / navigation |
