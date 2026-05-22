import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initFiberScope, mountFiberScopeOverlay, setFiberScope } from 'fiberscope';

import { App } from './App';
import './styles.css';

const scope = initFiberScope({ debug: true, fpsDropThresholdMs: 45 });
setFiberScope(scope);

if (import.meta.env.DEV) {
  mountFiberScopeOverlay(scope, { showFps: true });
  Object.assign(window, { fiberScope: scope });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App scope={scope} />
  </StrictMode>
);
