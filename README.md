# FiberScope

FiberScope is a local-first React performance visualization toolkit. It tracks component renders,
measures render duration and frequency, monitors FPS drops, and paints a live Canvas heatmap over the
page so expensive UI regions are visible where they happen.

The MVP is intentionally focused: no backend services, no database, no telemetry uploads, and no replay
system. It is a browser-side developer tool for spatial render debugging.

## Packages

- `@rohan0420/fiberscope-core` - strongly typed render metric store, event subscriptions, recent render history,
  debug logging, and FPS monitoring.
- `@rohan0420/fiberscope-react` - React hooks and Profiler helpers for lightweight component instrumentation.
- `@rohan0420/fiberscope-overlay` - fixed fullscreen Canvas overlay that draws translucent heat regions and FPS
  status from core snapshots.
- `@rohan0420/fiberscope-react-demo` - Vite React app with deliberate rerenders, expensive work, and stress states.

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
import { initFiberScope } from '@rohan0420/fiberscope-core';
import { mountFiberScopeOverlay } from '@rohan0420/fiberscope-overlay';

const scope = initFiberScope({ debug: true });
mountFiberScopeOverlay(scope);
```

Track a React component region:

```tsx
import { useFiberTrack } from '@rohan0420/fiberscope-react';

export function SearchResults() {
  const ref = useFiberTrack<HTMLDivElement>('SearchResults');

  return <section ref={ref}>...</section>;
}
```

Use React's Profiler API for subtree duration tracking:

```tsx
import { FiberProfiler } from '@rohan0420/fiberscope-react';

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
packages/core
packages/react
packages/overlay
examples/react-demo
```

Each library package builds with `tsup` to ESM, CommonJS, declaration files, and sourcemaps.

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
