import type { FiberScope, FiberScopeRect, FiberScopeSnapshot, RenderEvent } from '../core';

import { heatColor } from './color';

export interface CanvasOverlayOptions {
  zIndex?: number;
  fadeMs?: number;
  showFps?: boolean;
}

interface HeatRegion {
  rect: FiberScopeRect;
  intensity: number;
  lastSeen: number;
  label: string;
  renderCount: number;
  duration: number;
}

const defaults: Required<CanvasOverlayOptions> = {
  zIndex: 2147483000,
  fadeMs: 1400,
  showFps: true
};

export class CanvasOverlay {
  private readonly options: Required<CanvasOverlayOptions>;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly regions = new Map<string, HeatRegion>();
  private unsubscribe: (() => void) | undefined;
  private animationFrame = 0;
  private snapshot?: FiberScopeSnapshot;

  constructor(
    private readonly scope: FiberScope,
    options: CanvasOverlayOptions = {}
  ) {
    if (typeof document === 'undefined') {
      throw new Error('FiberScope overlay requires a browser document.');
    }

    this.options = { ...defaults, ...options };
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');

    if (!context) {
      throw new Error('FiberScope overlay could not acquire a 2D canvas context.');
    }

    this.context = context;
    this.configureCanvas();
  }

  mount(): void {
    if (this.canvas.isConnected) {
      return;
    }

    document.body.appendChild(this.canvas);
    window.addEventListener('resize', this.resize, { passive: true });
    window.addEventListener('scroll', this.resize, { passive: true });
    this.resize();
    this.unsubscribe = this.scope.subscribe(this.handleScopeUpdate);
    this.animationFrame = window.requestAnimationFrame(this.draw);
  }

  unmount(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('scroll', this.resize);

    if (this.animationFrame > 0) {
      window.cancelAnimationFrame(this.animationFrame);
    }

    this.canvas.remove();
  }

  private configureCanvas(): void {
    Object.assign(this.canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: String(this.options.zIndex)
    });
    this.canvas.dataset.fiberscopeOverlay = 'true';
  }

  private readonly resize = (): void => {
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(window.innerWidth * ratio);
    this.canvas.height = Math.round(window.innerHeight * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  private readonly handleScopeUpdate = (
    snapshot: FiberScopeSnapshot,
    event?: RenderEvent
  ): void => {
    this.snapshot = snapshot;

    if (!event?.rect || event.rect.width <= 0 || event.rect.height <= 0) {
      return;
    }

    const existing = this.regions.get(event.componentId);
    const durationBoost = Math.min(event.duration / 24, 1);
    const frequencyBoost = Math.min(event.renderCount / 16, 1);

    this.regions.set(event.componentId, {
      rect: event.rect,
      intensity: Math.min(
        1,
        (existing?.intensity ?? 0) + 0.2 + durationBoost * 0.35 + frequencyBoost * 0.2
      ),
      lastSeen: performance.now(),
      label: event.componentName,
      renderCount: event.renderCount,
      duration: event.duration
    });
  };

  private readonly draw = (timestamp: number): void => {
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.drawRegions(timestamp);

    if (this.options.showFps && this.snapshot) {
      this.drawFps(this.snapshot);
    }

    this.animationFrame = window.requestAnimationFrame(this.draw);
  };

  private drawRegions(timestamp: number): void {
    for (const [key, region] of this.regions) {
      const age = timestamp - region.lastSeen;
      const fade = Math.max(0, 1 - age / this.options.fadeMs);
      const intensity = region.intensity * fade;

      if (intensity <= 0.02) {
        this.regions.delete(key);
        continue;
      }

      const { rect } = region;
      this.context.fillStyle = heatColor(intensity);
      this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
      this.context.strokeStyle = `rgba(255, 255, 255, ${0.28 + intensity * 0.45})`;
      this.context.lineWidth = 1;
      this.context.strokeRect(
        rect.x + 0.5,
        rect.y + 0.5,
        Math.max(0, rect.width - 1),
        Math.max(0, rect.height - 1)
      );

      if (rect.width > 72 && rect.height > 28) {
        this.drawLabel(region, intensity);
      }
    }
  }

  private drawLabel(region: HeatRegion, intensity: number): void {
    const text = `${region.label} x${region.renderCount} ${region.duration.toFixed(1)}ms`;
    const x = region.rect.x + 6;
    const y = region.rect.y + 17;

    this.context.font =
      '12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const width = this.context.measureText(text).width + 10;
    this.context.fillStyle = `rgba(18, 24, 38, ${0.5 + intensity * 0.35})`;
    this.context.fillRect(region.rect.x + 4, region.rect.y + 4, width, 20);
    this.context.fillStyle = 'rgba(255, 255, 255, 0.94)';
    this.context.fillText(text, x + 4, y);
  }

  private drawFps(snapshot: FiberScopeSnapshot): void {
    const fps = snapshot.fps.currentFps || 0;
    const average = snapshot.fps.averageFps || 0;
    const text = `FiberScope ${fps.toFixed(0)} FPS avg ${average.toFixed(0)} drops ${snapshot.fps.frameDrops}`;
    const padding = 10;
    const width = this.context.measureText(text).width + padding * 2;

    this.context.font =
      '12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.context.fillStyle = 'rgba(8, 13, 23, 0.72)';
    this.context.fillRect(12, 12, width, 30);
    this.context.fillStyle = fps < 45 ? '#ff8a80' : '#9be7c2';
    this.context.fillText(text, 12 + padding, 31);
  }
}
