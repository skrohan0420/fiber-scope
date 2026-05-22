import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from 'react';
import type { FiberScope } from '../core';

import { getFiberScope } from './scope';

export interface FiberProfilerProps {
  id: string;
  children: ReactNode;
  scope?: FiberScope;
}

export function FiberProfiler({ id, children, scope }: FiberProfilerProps): React.JSX.Element {
  const targetScope = scope ?? getFiberScope();
  const onRender: ProfilerOnRenderCallback = (
    profilerId,
    _phase,
    actualDuration,
    _baseDuration,
    _startTime,
    commitTime
  ) => {
    targetScope.trackRender({
      componentId: `profiler:${profilerId}`,
      componentName: profilerId,
      duration: actualDuration,
      timestamp: commitTime
    });
  };

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}
