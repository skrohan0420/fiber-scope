export { CanvasOverlay } from './CanvasOverlay';
export type { CanvasOverlayOptions } from './CanvasOverlay';

import type { FiberScope } from '../core';

import { CanvasOverlay, type CanvasOverlayOptions } from './CanvasOverlay';

export function createFiberScopeOverlay(
  scope: FiberScope,
  options: CanvasOverlayOptions = {}
): CanvasOverlay {
  return new CanvasOverlay(scope, options);
}

export function mountFiberScopeOverlay(
  scope: FiberScope,
  options: CanvasOverlayOptions = {}
): CanvasOverlay {
  const overlay = createFiberScopeOverlay(scope, options);
  overlay.mount();
  return overlay;
}
