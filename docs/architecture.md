# FiberScope Architecture

FiberScope is split into three small packages:

- `@rohan0420/fiberscope-core` owns render metrics, subscriptions, recent render events, and FPS sampling.
- `@rohan0420/fiberscope-react` provides hooks and React Profiler wrappers that report commits to the core.
- `@rohan0420/fiberscope-overlay` renders a browser-only Canvas overlay from core snapshots.

The packages communicate through a simple in-process subscription model. No events leave the browser,
and no backend, upload, replay, or analytics infrastructure is included.

## Data Flow

1. React components call `useFiberTrack()` or render inside `FiberProfiler`.
2. The React package records render duration and DOM bounds after commit.
3. Core updates aggregate component metrics and emits a snapshot.
4. Overlay consumes render events, paints heat rectangles, and fades them over time.
5. The FPS monitor samples `requestAnimationFrame` and reports drops in the same snapshot stream.

This keeps the MVP local, debuggable, and easy to replace piece by piece.
