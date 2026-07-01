# Clockwise

Clockwise answers one question: **"What is the latest time I need to start each activity in order to arrive somewhere on time?"**

It works backwards from a fixed target arrival time. Add your activities in the order you do them, set their durations and buffers, and Clockwise calculates the schedule.

## Features

- Create, edit, duplicate, delete, and reorder routines
- Add, edit, delete, reorder, and color-code activities
- Live backwards schedule calculation
- Timeline view with start/finish times and durations
- Current-time indicator on each routine view
- Copy schedule as plain text or share via URL
- Soft-delete with trash and restore
- Expandable routine cards on the home page
- Preset activities for quick planning
- Keyboard shortcuts in the routine editor
- System color mode by default, with manual light/dark toggle
- LocalStorage persistence
- Responsive design

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vitest](https://vitest.dev/)
- LocalStorage for persistence

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit tests |

## Project Structure

```
src/
  app/                  # Next.js routes
  components/           # Shared shell components (header, theme provider, share importer)
  features/planner/     # Core domain
    components/         # RoutineList, RoutineEditor, RoutineView, Timeline, TrashList, etc.
    hooks/              # useRoutines provider
    lib/                # time, colors, presets, share, routine helpers
    scheduler.ts        # Pure backwards-scheduling algorithm
    scheduler.test.ts   # Vitest tests
    types.ts            # TypeScript types
  lib/                  # Shared utilities
```

The scheduling algorithm is plain TypeScript and kept separate from React so it is easy to test.

## Sharing

Single routines or your whole active list can be shared as a URL. The receiver's app automatically imports the routines when the link is opened. Routines already stored by ID are skipped; routines with a matching name are imported with a `duplicate-name` flag.

## License

MIT
