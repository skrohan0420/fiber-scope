import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initFiberScope } from '@rohan0420/fiberscope-core';
import { mountFiberScopeOverlay } from '@rohan0420/fiberscope-overlay';
import { setFiberScope } from '@rohan0420/fiberscope-react';

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
