import {
  initFiberScope,
  type FiberScope,
  type FiberScopeOptions
} from '@rohan0420/fiberscope-core';

let globalScope: FiberScope | undefined;

export function getFiberScope(options: FiberScopeOptions = {}): FiberScope {
  if (!globalScope) {
    globalScope = initFiberScope(options);
  }

  return globalScope;
}

export function setFiberScope(scope: FiberScope): void {
  globalScope = scope;
}
