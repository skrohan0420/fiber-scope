import type { FpsStats } from './types';

const defaultStats: FpsStats = {
  currentFps: 0,
  averageFps: 0,
  frameDrops: 0,
  lastFrameDuration: 0
};

export class FpsMonitor {
  private frameHandle = 0;
  private running = false;
  private lastFrameTime = 0;
  private frames = 0;
  private totalFps = 0;
  private stats: FpsStats = { ...defaultStats };

  constructor(
    private readonly onUpdate: (stats: FpsStats) => void,
    private readonly dropThresholdMs: number
  ) {}

  start(): void {
    if (this.running || typeof window === 'undefined') {
      return;
    }

    this.running = true;
    this.lastFrameTime = performance.now();
    this.frameHandle = window.requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (typeof window !== 'undefined' && this.frameHandle > 0) {
      window.cancelAnimationFrame(this.frameHandle);
    }
    this.frameHandle = 0;
  }

  getStats(): FpsStats {
    return { ...this.stats };
  }

  reset(): void {
    this.frames = 0;
    this.totalFps = 0;
    this.stats = { ...defaultStats };
  }

  private readonly tick = (timestamp: number): void => {
    if (!this.running) {
      return;
    }

    const delta = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    if (delta > 0) {
      const currentFps = 1000 / delta;
      this.frames += 1;
      this.totalFps += currentFps;
      this.stats = {
        currentFps,
        averageFps: this.totalFps / this.frames,
        frameDrops:
          delta > this.dropThresholdMs ? this.stats.frameDrops + 1 : this.stats.frameDrops,
        lastFrameDuration: delta
      };
      this.onUpdate(this.getStats());
    }

    this.frameHandle = window.requestAnimationFrame(this.tick);
  };
}
