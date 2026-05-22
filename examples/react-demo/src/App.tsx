import { memo, useEffect, useMemo, useState } from 'react';
import { FiberProfiler, useFiberTrack, type FiberScope } from 'fiberscope';

interface AppProps {
  scope: FiberScope;
}

export function App({ scope }: AppProps): React.JSX.Element {
  const [tick, setTick] = useState(0);
  const [stress, setStress] = useState(true);
  const [themePulse, setThemePulse] = useState(0);
  const shellRef = useFiberTrack<HTMLDivElement>('DemoShell', { scope });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((value) => value + 1);
      setThemePulse((value) => (value + 1) % 120);
    }, 180);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main ref={shellRef} className="app" style={{ '--pulse': themePulse } as React.CSSProperties}>
      <header className="topbar">
        <div>
          <p className="eyebrow">FiberScope MVP</p>
          <h1>Spatial React performance debugging</h1>
        </div>
        <button type="button" className="toggle" onClick={() => setStress((value) => !value)}>
          {stress ? 'Pause stress' : 'Resume stress'}
        </button>
      </header>

      <section className="dashboard">
        <FiberProfiler id="MetricsPanel" scope={scope}>
          <MetricsPanel tick={tick} />
        </FiberProfiler>
        <FiberProfiler id="RapidTicker" scope={scope}>
          <RapidTicker tick={tick} stress={stress} />
        </FiberProfiler>
        <FiberProfiler id="ExpensiveGrid" scope={scope}>
          <ExpensiveGrid tick={tick} stress={stress} />
        </FiberProfiler>
        <FiberProfiler id="NoisyControls" scope={scope}>
          <NoisyControls tick={tick} />
        </FiberProfiler>
      </section>
    </main>
  );
}

function MetricsPanel({ tick }: { tick: number }): React.JSX.Element {
  const ref = useFiberTrack<HTMLDivElement>('MetricsPanel');
  const values = useMemo(
    () => [
      ['Commits', tick.toString()],
      ['Synthetic load', `${36 + (tick % 31)}%`],
      ['Render pressure', tick % 4 === 0 ? 'high' : 'moderate']
    ],
    [tick]
  );

  return (
    <article ref={ref} className="panel metrics">
      <h2>Live render stream</h2>
      <div className="metricGrid">
        {values.map(([label, value]) => (
          <div key={label} className="metric">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function RapidTicker({ tick, stress }: { tick: number; stress: boolean }): React.JSX.Element {
  const ref = useFiberTrack<HTMLDivElement>('RapidTicker');
  const [localTick, setLocalTick] = useState(0);

  useEffect(() => {
    if (!stress) {
      return;
    }

    const timer = window.setInterval(() => setLocalTick((value) => value + 1), 48);
    return () => window.clearInterval(timer);
  }, [stress]);

  return (
    <article ref={ref} className="panel ticker">
      <h2>Rapid updates</h2>
      <div className="tickerValue">{localTick}</div>
      <p>Parent tick {tick}</p>
    </article>
  );
}

function ExpensiveGrid({ tick, stress }: { tick: number; stress: boolean }): React.JSX.Element {
  const ref = useFiberTrack<HTMLDivElement>('ExpensiveGrid');
  const cells = stress ? 90 : 36;
  const data = Array.from({ length: cells }, (_, index) => expensiveCellValue(index, tick));

  return (
    <article ref={ref} className="panel gridPanel">
      <h2>Expensive region</h2>
      <div className="heatGrid">
        {data.map((value, index) => (
          <GridCell key={`${index}-${tick % 7}`} index={index} value={value} />
        ))}
      </div>
    </article>
  );
}

const GridCell = memo(function GridCell({
  index,
  value
}: {
  index: number;
  value: number;
}): React.JSX.Element {
  const ref = useFiberTrack<HTMLDivElement>(`GridCell-${index}`);

  return (
    <div ref={ref} className="cell" style={{ opacity: 0.55 + (value % 40) / 100 }}>
      {value}
    </div>
  );
});

function NoisyControls({ tick }: { tick: number }): React.JSX.Element {
  const ref = useFiberTrack<HTMLDivElement>('NoisyControls');
  const wasted = Array.from({ length: 14 }, (_, index) => ({
    id: index,
    active: (tick + index) % 3 === 0
  }));

  return (
    <article ref={ref} className="panel controls">
      <h2>Unnecessary state churn</h2>
      <div className="controlList">
        {wasted.map((item) => (
          <span key={item.id} className={item.active ? 'chip active' : 'chip'}>
            Worker {item.id + 1}
          </span>
        ))}
      </div>
    </article>
  );
}

function expensiveCellValue(index: number, tick: number): number {
  let value = index + tick;

  for (let i = 0; i < 2600; i += 1) {
    value = Math.abs(Math.sin(value + i) * 1000);
  }

  return Math.round(value);
}
