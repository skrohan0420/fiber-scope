# fiberscope

FiberScope is a local-first React performance visualization toolkit. It tracks component renders, measures render duration and frequency, monitors FPS drops, and paints a live Canvas heatmap over the page so expensive UI regions are visible where they happen.

One package gives you the complete MVP:

- core render tracking
- React hooks and Profiler helpers
- Canvas heatmap overlay
- FPS monitoring
- debug logging

No backend, database, telemetry upload, replay system, WebGL, or SaaS infrastructure.

## Install

```bash
npm install fiberscope
```

React is a peer dependency, so install React in your app as usual.

## Quick Start

Set up FiberScope once near your app entry point:

```tsx
import { initFiberScope, mountFiberScopeOverlay, setFiberScope } from 'fiberscope';

const fiberScope = initFiberScope({
  debug: true
});

setFiberScope(fiberScope);

if (import.meta.env.DEV) {
  mountFiberScopeOverlay(fiberScope);
}
```

Track a component region:

```tsx
import { useFiberTrack } from 'fiberscope';

export function ProductGrid() {
  const ref = useFiberTrack<HTMLDivElement>('ProductGrid');

  return <div ref={ref}>{/* expensive UI */}</div>;
}
```

Track a subtree with React Profiler:

```tsx
import { FiberProfiler } from 'fiberscope';

export function App() {
  return (
    <FiberProfiler id="Dashboard">
      <Dashboard />
    </FiberProfiler>
  );
}
```

## API

### Core

- `initFiberScope(options?)`
- `FiberScopeCore`
- `scope.trackRender(input)`
- `scope.subscribe(listener)`
- `scope.getSnapshot()`
- `scope.clear()`
- `scope.destroy()`

### React

- `useFiberTrack(componentName, options?)`
- `FiberProfiler`
- `getFiberScope(options?)`
- `setFiberScope(scope)`
- `withFiberTracking(Component, componentName?, options?)`

### Overlay

- `mountFiberScopeOverlay(scope, options?)`
- `createFiberScopeOverlay(scope, options?)`
- `CanvasOverlay`

## Overlay Options

```ts
mountFiberScopeOverlay(scope, {
  zIndex: 2147483000,
  fadeMs: 1400,
  showFps: true
});
```

The overlay creates a fixed fullscreen canvas with `pointer-events: none`, uses heat-style translucent rectangles, and fades stale regions over time.

## Privacy

FiberScope runs locally in the browser. It does not upload, store, replay, or transmit performance data.

## Package Format

FiberScope ships ESM, CommonJS, TypeScript declarations, and sourcemaps.
