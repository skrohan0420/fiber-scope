export { FiberScopeCore } from './FiberScopeCore';
export type {
  ComponentMetric,
  FiberScope,
  FiberScopeListener,
  FiberScopeOptions,
  FiberScopeRect,
  FiberScopeSnapshot,
  FpsStats,
  RenderEvent,
  TrackRenderInput
} from './types';

import { FiberScopeCore } from './FiberScopeCore';
import type { FiberScope, FiberScopeOptions } from './types';

export function initFiberScope(options: FiberScopeOptions = {}): FiberScope {
  return new FiberScopeCore(options);
}
