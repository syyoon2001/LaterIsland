import { useEffect, useRef, useState } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { CoverScreen } from './screens/CoverScreen';
import { LaterIslandApp } from './screens/LaterIslandApp';
import { SimulationPanel } from './components/SimulationPanel';
import { subscribeToAuthState } from './lib/auth';
import type { Language } from './types';

type Screen = 'cover' | 'auth' | 'app';
type AuthMode = 'login' | 'signup';

// Cover screen must stay visible at least this long, and never longer than
// this, regardless of how fast/slow the real Firebase session check is.
const MIN_COVER_MS = 800;
const MAX_COVER_MS = 1500;
// Opacity fade tone matches the app's existing 0.3s-ease transitions (e.g. useScrollThumb).
const FADE_MS = 350;

export default function App() {
  const [screen, setScreen] = useState<Screen>('cover');
  const [language, setLanguage] = useState<Language>('ko');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  // Real Firebase auth state (see src/lib/auth.ts). `authChecked` flips true
  // once Firebase has resolved the current session (or lack thereof) via
  // onAuthStateChanged, which the cover screen's timer waits on below.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [coverOpacity, setCoverOpacity] = useState(1);

  // Refs mirror the state above so the cover-timer effect (which only
  // depends on `screen`) and the always-on auth subscription can read the
  // latest values without re-running each other's effects.
  const isLoggedInRef = useRef(isLoggedIn);
  const authCheckedRef = useRef(authChecked);
  // Lets the auth subscription nudge the currently-mounted cover timer to
  // re-check whether it can advance, without the timer effect depending on
  // auth state directly (which would reset its min/max timers on change).
  const tryAdvanceCoverRef = useRef<() => void>(() => {});

  useEffect(() => {
    const handleJump = (e: any) => {
      const { target, lang, mode } = e.detail;
      if (lang) setLanguage(lang);
      if (target === 'cover') {
        setCoverOpacity(1);
        setScreen('cover');
      } else if (target === 'auth') {
        setScreen('auth');
        setAuthMode(mode === 'signup' ? 'signup' : 'login');
      } else setScreen('app'); // all other tabs/settings are handled in LaterIslandApp
    };
    window.addEventListener('simulation-jump', handleJump);
    return () => window.removeEventListener('simulation-jump', handleJump);
  }, []);

  useEffect(() => {
    const handleSync = (e: any) => {
      const { settingsLanguage } = e.detail;
      if (settingsLanguage) setLanguage(settingsLanguage);
    };
    window.addEventListener('simulation-sync', handleSync);
    return () => window.removeEventListener('simulation-sync', handleSync);
  }, []);

  // Single source of truth for auth state. Fires once immediately with the
  // resolved session (or null) on mount, and again on every sign-in/sign-out.
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      isLoggedInRef.current = !!user;
      authCheckedRef.current = true;
      setIsLoggedIn(!!user);
      setAuthChecked(true);
      // Once we're past the cover screen, keep the visible screen in sync
      // with real auth changes (e.g. logging out from Settings). While still
      // on the cover, let its own timer decide when/where to reveal.
      setScreen((prev) => (prev === 'cover' ? prev : user ? 'app' : 'auth'));
      tryAdvanceCoverRef.current();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // We only dispatch cover and auth from here since app delegates to useLaterIslandState
    if (screen === 'cover' || screen === 'auth') {
      window.dispatchEvent(
        new CustomEvent('simulation-sync', { detail: { screen, settingsLanguage: language, authMode } })
      );
    }
  }, [screen, language, authMode]);

  // Auto-advances the cover screen: waits for the real Firebase session
  // check (onAuthStateChanged, subscribed above) AND the minimum exposure
  // time, fades the cover out, then reveals home (if logged in) or login.
  //
  // This effect only depends on `screen` so it doesn't reset its min/max
  // timers whenever auth state resolves; it reads the latest auth state via
  // refs instead, and the auth subscription above calls
  // tryAdvanceCoverRef.current() to nudge it the moment the session check
  // completes. If the check finishes before the minimum exposure time, we
  // still wait out the minimum; if it finishes after, we advance
  // immediately; if it never finishes in time, the max timer forces the
  // transition anyway (using whatever auth state is known at that point).
  useEffect(() => {
    if (screen !== 'cover') return;

    let minTimeElapsed = false;
    let settled = false;

    const advance = () => {
      if (settled) return;
      settled = true;
      setCoverOpacity(0);
      window.setTimeout(() => {
        setScreen(isLoggedInRef.current ? 'app' : 'auth');
      }, FADE_MS);
    };

    const tryAdvance = () => {
      if (minTimeElapsed && authCheckedRef.current) advance();
    };
    tryAdvanceCoverRef.current = tryAdvance;

    const minTimer = window.setTimeout(() => {
      minTimeElapsed = true;
      tryAdvance();
    }, MIN_COVER_MS);

    const maxTimer = window.setTimeout(advance, MAX_COVER_MS);

    // In case the session check already resolved before this effect mounted.
    tryAdvance();

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      tryAdvanceCoverRef.current = () => {};
    };
  }, [screen]);

  let content = null;
  if (screen === 'cover') {
    // Render the destination screen underneath so the cover fade reveals it,
    // instead of jumping to a blank frame once the fade finishes.
    const destination = isLoggedIn ? (
      <LaterIslandApp />
    ) : (
      <AuthScreen key={authMode} onAuthenticated={() => setScreen('app')} language={language} initialMode={authMode} />
    );

    content = (
      <div style={{ position: 'relative' }}>
        {destination}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            opacity: coverOpacity,
            transition: `opacity ${FADE_MS}ms ease`,
            pointerEvents: coverOpacity === 0 ? 'none' : 'auto',
          }}
        >
          {/* onEnter is a no-op: the cover advances automatically, not on click. */}
          <CoverScreen onEnter={() => {}} language={language} />
        </div>
      </div>
    );
  } else if (screen === 'auth') {
    content = (
      <AuthScreen
        key={authMode}
        onAuthenticated={() => setScreen('app')}
        language={language}
        initialMode={authMode}
      />
    );
  } else {
    content = <LaterIslandApp />;
  }

  return (
    <>
      {content}
      {import.meta.env.DEV && <SimulationPanel />}
    </>
  );
}
