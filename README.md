# FiberScope

FiberScope is a local-first React performance visualization toolkit. It tracks component renders,
measures render duration and frequency, monitors FPS drops, and paints a live Canvas heatmap over the
page so expensive UI regions are visible where they happen.

The MVP is intentionally focused: no backend services, no database, no telemetry uploads, and no replay
system. It is a browser-side developer tool for spatial render debugging.

## Packages

- `fiberscope` - the single publishable package. It includes core render metrics, React hooks,
  React Profiler helpers, FPS monitoring, and the Canvas heatmap overlay.
- `@fiberscope/react-demo` - Vite React app with deliberate rerenders, expensive work, and stress states.

## Quick Start

```bash
npm install
npm run dev
```

The demo starts a Vite app and mounts the FiberScope overlay automatically in development.

Build every package and the demo:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

## Usage

Create a scope and mount the overlay:

```ts
import { initFiberScope, mountFiberScopeOverlay } from 'fiberscope';

const scope = initFiberScope({ debug: true });
mountFiberScopeOverlay(scope);
```

Track a React component region:

```tsx
import { useFiberTrack } from 'fiberscope';

export function SearchResults() {
  const ref = useFiberTrack<HTMLDivElement>('SearchResults');

  return <section ref={ref}>...</section>;
}
```

Use React's Profiler API for subtree duration tracking:

```tsx
import { FiberProfiler } from 'fiberscope';

<FiberProfiler id="ResultsPane">
  <ResultsPane />
</FiberProfiler>;
```

## Architecture

FiberScope uses an in-process event stream:

1. React instrumentation records render commits and DOM rectangles.
2. Core aggregates render counts, durations, timestamps, and FPS stats.
3. Overlay subscribes to snapshots and paints heatmap rectangles with intensity based on rerender
   frequency and render cost.
4. Heat fades over time so current hotspots stay visually prominent.

See [docs/architecture.md](docs/architecture.md) for the package data flow.

## Workspace

This repository uses npm workspaces:

```text
packages/fiberscope
examples/react-demo
```

The `fiberscope` package builds with `tsup` to ESM, CommonJS, declaration files, and sourcemaps.

## Development Commands

- `npm run dev` - start the React demo.
- `npm run build` - build all workspaces.
- `npm run clean` - remove package build output.
- `npm run test` - run Vitest.
- `npm run lint` - run ESLint.
- `npm run format` - format the repository with Prettier.

## Browser Notes

The overlay creates a fixed canvas with `pointer-events: none`, high z-index, and viewport-sized
rendering. It uses the Canvas 2D API only. It does not use WebGL.
