'use client';

import { useEffect, useRef } from 'react';

// ─── Turnstile ────────────────────────────────────────────────
// Cloudflare's "are you human" check. Usually just a checkmark that
// ticks itself. Calls onToken(token) when passed, onToken(null) when
// the token expires or fails. Tokens are single-use: re-mount the
// component (change its `key`) to get a fresh one after a submit.

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise = null;

function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        scriptPromise = null; // allow a retry on the next mount
        reject(new Error('Turnstile failed to load'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function Turnstile({ siteKey, language, onToken }) {
  const containerRef = useRef(null);
  // Keep the latest callback without re-rendering the widget
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey) return;
    let widgetId = null;
    let cancelled = false;

    loadScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current || !turnstile) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          language: language === 'Hebrew' ? 'he' : 'en',
          theme: 'light',
          callback: (token) => onTokenRef.current?.(token),
          'expired-callback': () => onTokenRef.current?.(null),
          'error-callback': () => onTokenRef.current?.(null),
        });
      })
      .catch((error) => console.error(error.message));

    return () => {
      cancelled = true;
      if (widgetId !== null) window.turnstile?.remove(widgetId);
    };
  }, [siteKey, language]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="turnstile" />;
}
