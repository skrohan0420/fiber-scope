import { FpsMonitor } from './fps';
import type {
  ComponentMetric,
  FiberScope,
  FiberScopeListener,
  FiberScopeOptions,
  FiberScopeSnapshot,
  FpsStats,
  RenderEvent,
  TrackRenderInput
} from './types';

const defaultOptions: Required<FiberScopeOptions> = {
  enabled: true,
  debug: false,
  maxRecentEvents: 300,
  fpsDropThresholdMs: 50
};

export class FiberScopeCore implements FiberScope {
  readonly enabled: boolean;

  private readonly options: Required<FiberScopeOptions>;
  private readonly components = new Map<string, ComponentMetric>();
  private readonly listeners = new Set<FiberScopeListener>();
  private recentEvents: RenderEvent[] = [];
  private fps: FpsStats = {
    currentFps: 0,
    averageFps: 0,
    frameDrops: 0,
    lastFrameDuration: 0
  };
  private readonly fpsMonitor: FpsMonitor;

  constructor(options: FiberScopeOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    this.enabled = this.options.enabled;
    this.fpsMonitor = new FpsMonitor(this.handleFpsUpdate, this.options.fpsDropThresholdMs);

    if (this.enabled) {
      this.fpsMonitor.start();
    }
  }

  trackRender(input: TrackRenderInput): RenderEvent | undefined {
    if (!this.enabled) {
      return undefined;
    }

    const timestamp = input.timestamp ?? now();
    const componentId = input.componentId ?? input.componentName;
    const previous = this.components.get(componentId);
    const renderCount = (previous?.renderCount ?? 0) + 1;
    const totalDuration = (previous?.totalDuration ?? 0) + input.duration;

    const metric: ComponentMetric = {
      componentId,
      componentName: input.componentName,
      renderCount,
      totalDuration,
      averageDuration: totalDuration / renderCount,
      maxDuration: Math.max(previous?.maxDuration ?? 0, input.duration),
      lastDuration: input.duration,
      lastTimestamp: timestamp,
      ...(input.rect ? { rect: input.rect } : previous?.rect ? { rect: previous.rect } : {})
    };

    const event: RenderEvent = {
      componentId,
      componentName: input.componentName,
      renderCount,
      duration: input.duration,
      timestamp,
      ...(metric.rect ? { rect: metric.rect } : {})
    };

    this.components.set(componentId, metric);
    this.recentEvents = [...this.recentEvents, event].slice(-this.options.maxRecentEvents);

    if (this.options.debug) {
      console.debug('[FiberScope] render', event);
    }

    this.emit(event);
    return event;
  }

  getSnapshot(): FiberScopeSnapshot {
    return {
      components: new Map(this.components),
      recentEvents: [...this.recentEvents],
      fps: { ...this.fps }
    };
  }

  subscribe(listener: FiberScopeListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  clear(): void {
    this.components.clear();
    this.recentEvents = [];
    this.fpsMonitor.reset();
    this.fps = this.fpsMonitor.getStats();
    this.emit();
  }

  destroy(): void {
    this.fpsMonitor.stop();
    this.listeners.clear();
  }

  private readonly handleFpsUpdate = (fps: FpsStats): void => {
    this.fps = fps;
    this.emit();
  };

  private emit(event?: RenderEvent): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot, event);
    }
  }
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
