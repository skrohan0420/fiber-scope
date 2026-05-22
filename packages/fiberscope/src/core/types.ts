export interface FiberScopeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderEvent {
  componentId: string;
  componentName: string;
  renderCount: number;
  duration: number;
  timestamp: number;
  rect?: FiberScopeRect;
}

export interface TrackRenderInput {
  componentId?: string;
  componentName: string;
  duration: number;
  timestamp?: number;
  rect?: FiberScopeRect;
}

export interface ComponentMetric {
  componentId: string;
  componentName: string;
  renderCount: number;
  totalDuration: number;
  averageDuration: number;
  maxDuration: number;
  lastDuration: number;
  lastTimestamp: number;
  rect?: FiberScopeRect;
}

export interface FpsStats {
  currentFps: number;
  averageFps: number;
  frameDrops: number;
  lastFrameDuration: number;
}

export interface FiberScopeSnapshot {
  components: ReadonlyMap<string, ComponentMetric>;
  recentEvents: readonly RenderEvent[];
  fps: FpsStats;
}

export interface FiberScopeOptions {
  enabled?: boolean;
  debug?: boolean;
  maxRecentEvents?: number;
  fpsDropThresholdMs?: number;
}

export type FiberScopeListener = (snapshot: FiberScopeSnapshot, event?: RenderEvent) => void;

export interface FiberScope {
  readonly enabled: boolean;
  trackRender(input: TrackRenderInput): RenderEvent | undefined;
  getSnapshot(): FiberScopeSnapshot;
  subscribe(listener: FiberScopeListener): () => void;
  clear(): void;
  destroy(): void;
}
