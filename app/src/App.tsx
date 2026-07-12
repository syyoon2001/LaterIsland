import { useEffect, useState } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { CoverScreen } from './screens/CoverScreen';
import { LaterIslandApp } from './screens/LaterIslandApp';
import { SimulationPanel } from './components/SimulationPanel';
import type { Language } from './types';

type Screen = 'cover' | 'auth' | 'app';
type AuthMode = 'login' | 'signup';

// Cover screen must stay visible at least this long, and never longer than
// this, regardless of how fast/slow the (currently mocked) session check is.
const MIN_COVER_MS = 800;
const MAX_COVER_MS = 1500;
// Opacity fade tone matches the app's existing 0.3s-ease transitions (e.g. useScrollThumb).
const FADE_MS = 350;

export default function App() {
  const [screen, setScreen] = useState<Screen>('cover');
  const [language, setLanguage] = useState<Language>('ko');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  // Mock authentication flag used only to decide where the cover screen hands
  // off to. Toggleable from the SimulationPanel's "로그인 상태 시뮬레이션" switch.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coverOpacity, setCoverOpacity] = useState(1);

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

  useEffect(() => {
    const handleSetLogin = (e: any) => {
      setIsLoggedIn(!!e.detail?.isLoggedIn);
    };
    window.addEventListener('simulation-set-login', handleSetLogin);
    return () => window.removeEventListener('simulation-set-login', handleSetLogin);
  }, []);

  // Lets the SimulationPanel mirror the current mock login state (e.g. on mount).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('simulation-login-sync', { detail: { isLoggedIn } }));
  }, [isLoggedIn]);

  useEffect(() => {
    // We only dispatch cover and auth from here since app delegates to useLaterIslandState
    if (screen === 'cover' || screen === 'auth') {
      window.dispatchEvent(
        new CustomEvent('simulation-sync', { detail: { screen, settingsLanguage: language, authMode } })
      );
    }
  }, [screen, language, authMode]);

  // Auto-advances the cover screen: waits for the (mock) session check AND the
  // minimum exposure time, fades the cover out, then reveals login or home.
  useEffect(() => {
    if (screen !== 'cover') return;

    let sessionCheckDone = false;
    let minTimeElapsed = false;
    let settled = false;

    const advance = () => {
      if (settled) return;
      settled = true;
      setCoverOpacity(0);
      window.setTimeout(() => {
        setScreen(isLoggedIn ? 'app' : 'auth');
      }, FADE_MS);
    };

    const minTimer = window.setTimeout(() => {
      minTimeElapsed = true;
      if (sessionCheckDone) advance();
    }, MIN_COVER_MS);

    const maxTimer = window.setTimeout(advance, MAX_COVER_MS);

    // TODO: Supabase 인증 연동 시 실제 세션 체크로 교체.
    // 세션 체크가 최소 노출 시간(0.8초)보다 빨리 끝나도 0.8초까지 대기 후 전환,
    // 세션 체크가 늦어져도 최대 1.5초에서 강제 전환.
    // Mock: isLoggedIn is already known synchronously, so the "check" resolves
    // immediately and the min/max timers alone govern the actual timing.
    sessionCheckDone = true;
    if (minTimeElapsed) advance();

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
  }, [screen, isLoggedIn]);

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
