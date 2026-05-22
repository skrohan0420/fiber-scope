import { describe, expect, it } from 'vitest';

import { initFiberScope } from './index';

describe('FiberScopeCore', () => {
  it('tracks render counts and duration aggregates', () => {
    const scope = initFiberScope({ enabled: true });

    scope.trackRender({ componentId: 'a', componentName: 'Widget', duration: 4, timestamp: 10 });
    scope.trackRender({ componentId: 'a', componentName: 'Widget', duration: 6, timestamp: 20 });

    const metric = scope.getSnapshot().components.get('a');
    expect(metric?.renderCount).toBe(2);
    expect(metric?.averageDuration).toBe(5);
    expect(metric?.maxDuration).toBe(6);

    scope.destroy();
  });
});
