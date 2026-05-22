import type { ComponentType } from 'react';

import { useFiberTrack, type UseFiberTrackOptions } from './useFiberTrack';

export function withFiberTracking<TProps extends object>(
  Component: ComponentType<TProps>,
  componentName = Component.displayName ?? Component.name ?? 'TrackedComponent',
  options: UseFiberTrackOptions = {}
): ComponentType<TProps> {
  function Tracked(props: TProps): React.JSX.Element {
    const ref = useFiberTrack<HTMLDivElement>(componentName, options);

    return (
      <div ref={ref} data-fiberscope-wrapper={componentName}>
        <Component {...props} />
      </div>
    );
  }

  Tracked.displayName = `withFiberTracking(${componentName})`;
  return Tracked;
}
