import { useId, useLayoutEffect, useRef, type RefObject } from 'react';
import type { FiberScope, FiberScopeRect } from '../core';

import { getFiberScope } from './scope';

export interface UseFiberTrackOptions {
  componentId?: string;
  scope?: FiberScope;
  enabled?: boolean;
}

export function useFiberTrack<TElement extends HTMLElement>(
  componentName: string,
  options: UseFiberTrackOptions = {}
): RefObject<TElement | null> {
  const ref = useRef<TElement | null>(null);
  const reactId = useId();
  const previousCommitAt = useRef(now());
  const componentId = options.componentId ?? `${componentName}:${reactId}`;

  useLayoutEffect(() => {
    if (options.enabled === false) {
      return;
    }

    const element = ref.current;
    const committedAt = now();
    const duration = Math.max(0, committedAt - previousCommitAt.current);
    const rect = element ? toRect(element.getBoundingClientRect()) : undefined;
    previousCommitAt.current = committedAt;

    (options.scope ?? getFiberScope()).trackRender({
      componentId,
      componentName,
      duration,
      ...(rect ? { rect } : {})
    });
  });

  return ref;
}

function toRect(rect: DOMRect): FiberScopeRect {
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  };
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
