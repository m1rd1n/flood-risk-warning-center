# Community Flood Resilience Hub – MY Bantu

A mobile-first disaster relief coordination platform for Malaysian flood-prone communities. Built for community leaders (Ketua Kampung), NGO coordinators, and volunteers to manage flood response without needing to contact NADMA directly — including under intermittent or low-bandwidth conditions.

## Key Features

- **Dashboard** – Live flood status, displaced resident count, shelter stats, quick-action shortcuts
- **Shelter Directory** – Searchable list of relief centres with occupancy, facilities, road status, and sharable info
- **Aid Request Board** – 3-step form to report displaced residents, request specific aid supplies, track NGO assignment
- **Volunteer Coordination** – Task assignment board, 10-volunteer deployment to 5 distribution points, check-in flow
- **Alerts Feed** – Verified updates, weather warnings, and misinformation flags with one-tap share
- **Settings** – Dark/light mode, Bahasa Malaysia/English toggle, low-data mode, offline simulation

## Technologies

- **Framework:** TanStack Start (React + SSR)
- **Styling:** Tailwind CSS v4 + custom CSS design system tokens
- **Icons:** Inline SVG (zero dependencies, offline-safe)
- **Routing:** TanStack Router (file-based)
- **Deployment:** Netlify

## Design System

Follows `Resilience Hub` design spec from uploaded Stitch assets:
- Primary: `#00236f` (Deep Navy), Secondary: `#006e2d` (Green)
- Inter font, 48px touch targets, bottom-weighted navigation
- Dark mode via CSS `data-theme` attribute on `<html>`

## Running Locally

```bash
npm install
netlify dev --port 8889
```

Or:

```bash
npm run dev
```
