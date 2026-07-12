import { useEffect, useState } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { CoverScreen } from './screens/CoverScreen';
import { LaterIslandApp } from './screens/LaterIslandApp';
import { SimulationPanel } from './components/SimulationPanel';
import type { Language } from './types';

type Screen = 'cover' | 'auth' | 'app';
type AuthMode = 'login' | 'signup';

export default function App() {
  const [screen, setScreen] = useState<Screen>('cover');
  const [language, setLanguage] = useState<Language>('ko');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    const handleJump = (e: any) => {
      const { target, lang, mode } = e.detail;
      if (lang) setLanguage(lang);
      if (target === 'cover') setScreen('cover');
      else if (target === 'auth') {
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
    // We only dispatch cover and auth from here since app delegates to useLaterIslandState
    if (screen === 'cover' || screen === 'auth') {
      window.dispatchEvent(
        new CustomEvent('simulation-sync', { detail: { screen, settingsLanguage: language, authMode } })
      );
    }
  }, [screen, language, authMode]);

  let content = null;
  if (screen === 'cover') {
    content = (
      <CoverScreen
        onEnter={() => {
          setAuthMode('login');
          setScreen('auth');
        }}
        language={language}
      />
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

