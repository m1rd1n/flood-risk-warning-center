# AGENTS.md – Community Flood Resilience Hub

## Project Overview

Mobile-first flood relief coordination app for Malaysian communities. Built with TanStack Start (React SSR), Tailwind CSS v4, deployed on Netlify. All UI lives in a single-page React app with client-side screen switching (no additional routes).

## Architecture

```
src/
  routes/
    __root.tsx     – HTML shell, sets fonts/meta, includes styles.css
    index.tsx      – Entire application: all screens, components, data, types
  styles.css       – CSS design system: custom properties, dark mode, utility classes
public/
  hero-map.png    – Splash/map imagery
```

## Key Decisions

- **All code in `src/routes/index.tsx`** – This is a prototype; single-file keeps iteration fast. When extending, split components into `src/components/`.
- **No external state management** – React `useState` with prop drilling. Acceptable for prototype scope.
- **CSS custom properties for theming** – Dark mode toggled by `data-theme="dark"` on `<html>`. Avoids Tailwind dark-mode class complexity at this scale.
- **Inline SVG icons** – Zero network requests, works fully offline. Icons are defined in an `Icon` component at the top of index.tsx.
- **Mock data only** – No database connected. All initial state is defined as `initial*` constants. To add persistence, use `@netlify/database` with Drizzle (see `netlify-database` skill).
- **Low-connection mode** – Simulated via toggle. Real implementation would use Service Workers + IndexedDB for request queuing.

## Screen Map

| Screen ID | Nav Label | Description |
|-----------|-----------|-------------|
| `dashboard` | Papan Pemuka | Hero status, stats, quick actions, recent activity |
| `shelters` | Pusat Pemindahan | Shelter list with search, map preview, share |
| `aid` | Bantuan | Aid request board + 3-step new request form |
| `volunteers` | Sukarelawan | Task board, 10-volunteer slot grid, check-in |
| `alerts` | Amaran | Verified/warning/misinformation feed |
| `settings` | – (gear icon) | Theme, language, connectivity toggles |

## Coding Conventions

- TypeScript interfaces defined at top of file
- Translation object `T` with keys `ms` (Bahasa Malaysia) and `en`
- Components receive `t` (translations) as prop
- Colour palette: `var(--primary)`, `var(--secondary)`, `var(--danger)`, `var(--warning)`, `var(--success)`
- Badge variants: `.badge-danger`, `.badge-warning`, `.badge-success`, `.badge-info`, `.badge-gray`

## Extending

To add Netlify Database persistence:
1. Read `.agents/skills/netlify-database-drizzle/SKILL.md`
2. Define schema in `db/schema.ts`
3. Replace `useState` arrays with server function calls

To add authentication:
1. Read `.agents/skills/tanstack-start-identity/SKILL.md`
