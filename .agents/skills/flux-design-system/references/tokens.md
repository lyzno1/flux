# Flux Design Tokens — Extended Reference

## Complete Token Table

### Core Tokens (Light / Dark)

| Token | Light | Dark |
|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.10 0 0)` |
| `--foreground` | `oklch(0.13 0 0)` | `oklch(0.93 0 0)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.14 0 0)` |
| `--card-foreground` | `oklch(0.13 0 0)` | `oklch(0.93 0 0)` |
| `--popover` | `oklch(1 0 0)` | `oklch(0.16 0 0)` |
| `--popover-foreground` | `oklch(0.13 0 0)` | `oklch(0.93 0 0)` |
| `--primary` | `oklch(0.15 0 0)` | `oklch(0.93 0 0)` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.10 0 0)` |
| `--secondary` | `oklch(0.955 0 0)` | `oklch(0.18 0 0)` |
| `--secondary-foreground` | `oklch(0.15 0 0)` | `oklch(0.93 0 0)` |
| `--muted` | `oklch(0.955 0 0)` | `oklch(0.18 0 0)` |
| `--muted-foreground` | `oklch(0.50 0 0)` | `oklch(0.55 0 0)` |
| `--accent` | `oklch(0.95 0 0)` | `oklch(0.22 0 0)` |
| `--accent-foreground` | `oklch(0.15 0 0)` | `oklch(0.93 0 0)` |
| `--destructive` | `oklch(0.58 0.22 27)` | `oklch(0.704 0.191 22.216)` |
| `--destructive-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` |
| `--border` | `oklch(0.91 0 0)` | `oklch(1 0 0 / 8%)` |
| `--input` | `oklch(0.91 0 0)` | `oklch(1 0 0 / 12%)` |
| `--ring` | `oklch(0.65 0 0)` | `oklch(0.50 0 0)` |
| `--surface-1` | `oklch(0.985 0 0)` | `oklch(0.14 0 0)` |
| `--surface-2` | `oklch(0.97 0 0)` | `oklch(0.18 0 0)` |
| `--surface-3` | `oklch(0.955 0 0)` | `oklch(0.22 0 0)` |
| `--radius` | `0.75rem` | `0.75rem` |

### Semantic Tokens (Light / Dark)

| Token | Light | Dark |
|---|---|---|
| `--success` | `oklch(0.59 0.16 145)` | `oklch(0.64 0.17 150)` |
| `--success-foreground` | `oklch(0.36 0.12 145)` | `oklch(0.74 0.15 150)` |
| `--success-muted` | `oklch(0.94 0.05 145)` | `oklch(0.27 0.06 150)` |
| `--warning` | `oklch(0.75 0.15 85)` | `oklch(0.75 0.15 85)` |
| `--warning-foreground` | `oklch(0.47 0.12 85)` | `oklch(0.8 0.12 85)` |
| `--warning-muted` | `oklch(0.94 0.05 85)` | `oklch(0.3 0.06 85)` |
| `--info` | `oklch(0.62 0.15 250)` | `oklch(0.62 0.15 250)` |
| `--info-foreground` | `oklch(0.42 0.15 250)` | `oklch(0.72 0.12 250)` |
| `--info-muted` | `oklch(0.94 0.05 250)` | `oklch(0.28 0.06 250)` |

### Sidebar Tokens (Light / Dark)

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.10 0 0)` |
| `--sidebar-foreground` | `oklch(0.13 0 0)` | `oklch(0.93 0 0)` |
| `--sidebar-primary` | `oklch(0.15 0 0)` | `oklch(0.93 0 0)` |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.10 0 0)` |
| `--sidebar-accent` | `oklch(0.95 0 0)` | `oklch(0.22 0 0)` |
| `--sidebar-accent-foreground` | `oklch(0.15 0 0)` | `oklch(0.93 0 0)` |
| `--sidebar-border` | `oklch(0.91 0 0)` | `oklch(1 0 0 / 8%)` |
| `--sidebar-ring` | `oklch(0.65 0 0)` | `oklch(0.50 0 0)` |

### Chart Tokens (same both modes)

| Token | Value |
|---|---|
| `--chart-1` | `oklch(0.80 0 0)` |
| `--chart-2` | `oklch(0.65 0 0)` |
| `--chart-3` | `oklch(0.50 0 0)` |
| `--chart-4` | `oklch(0.35 0 0)` |
| `--chart-5` | `oklch(0.20 0 0)` |

## Radius Derivation

| Tailwind | Formula | Computed |
|---|---|---|
| `rounded-sm` | `--radius - 4px` | 8px |
| `rounded-md` | `--radius - 2px` | 10px |
| `rounded-lg` | `--radius` | 12px |
| `rounded-xl` | `--radius + 4px` | 16px |
| `rounded-2xl` | `--radius + 8px` | 20px |
| `rounded-3xl` | `--radius + 12px` | 24px |
| `rounded-4xl` | `--radius + 16px` | 28px |

## Contrast Ratios (approximate)

| Text | Background | Light | Dark | WCAG AA |
|---|---|---|---|---|
| foreground | background | ~18:1 | ~12:1 | Pass |
| muted-foreground | background | ~5.5:1 | ~4.2:1 | Pass |
| muted-foreground | muted | ~5.2:1 | ~3.9:1 | Borderline |
| primary-foreground | primary | ~14:1 | ~12:1 | Pass |
| destructive-foreground | destructive | ~12:1 | ~8:1 | Pass |

## File Index

| File | Description |
|---|---|
| `apps/web/src/index.css` | CSS custom properties, theme registration, base layer |
| `apps/web/src/components/ui/button.tsx` | Pill buttons, CVA variants, active:scale |
| `apps/web/src/components/ui/badge.tsx` | Pill badges, CVA variants |
| `apps/web/src/components/ui/card.tsx` | Rounded card container, ring border |
| `apps/web/src/components/ui/dialog.tsx` | Modal with blur overlay |
| `apps/web/src/components/ui/dropdown-menu.tsx` | Context/dropdown menus, rounded-xl + p-1 |
| `apps/web/src/components/ui/popover.tsx` | Floating content panels |
| `apps/web/src/components/ui/hover-card.tsx` | Hover preview cards |
| `apps/web/src/components/ui/select.tsx` | Styled select with scroll arrows |
| `apps/web/src/components/ui/command.tsx` | Command palette / combobox |
| `apps/web/src/components/ui/input.tsx` | Text input, rounded-xl h-9 |
| `apps/web/src/components/ui/textarea.tsx` | Multi-line input |
| `apps/web/src/components/ui/input-group.tsx` | Input with addons |
| `apps/web/src/components/ui/input-otp.tsx` | OTP code input |
| `apps/web/src/components/ui/checkbox.tsx` | Soft-square checkbox (rounded-[5px]) |
| `apps/web/src/components/ui/tabs.tsx` | Tab navigation, rounded-xl list |
| `apps/web/src/components/ui/tooltip.tsx` | Hover tooltips, rounded-md |
| `apps/web/src/components/ui/alert.tsx` | Alert banners |
| `apps/web/src/components/ui/skeleton.tsx` | Loading placeholders |
| `apps/web/src/components/ui/accordion.tsx` | Collapsible sections |
| `apps/web/src/components/ui/button-group.tsx` | Grouped button strips |
| `apps/web/src/components/ui/progress.tsx` | Progress bars, rounded-full |
| `apps/web/src/components/ui/scroll-area.tsx` | Custom scrollbars |
| `apps/web/src/components/header.tsx` | App header / navigation bar |
