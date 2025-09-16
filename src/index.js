import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Dev-only console de-duplication to reduce spammy repeated logs
if (process.env.NODE_ENV !== 'production') {
  const seen = new Map();
  const original = {
    log: console.log,
    info: console.info,
    debug: console.debug
  };
  const makeWrapper = (fnName) => (...args) => {
    try {
      const key = JSON.stringify(args);
      const now = Date.now();
      const last = seen.get(key) || 0;
      // Only log identical messages if at least 2 seconds passed
      if (now - last > 2000) {
        seen.set(key, now);
        original[fnName](...args);
      }
    } catch {
      // Fallback to original if args not serializable
      original[fnName](...args);
    }
  };
  console.log = makeWrapper('log');
  console.info = makeWrapper('info');
  console.debug = makeWrapper('debug');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
