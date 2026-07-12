import { useEffect, useState } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { CoverScreen } from './screens/CoverScreen';
import { LaterIslandApp } from './screens/LaterIslandApp';
import { SimulationPanel } from './components/SimulationPanel';
import type { Language } from './types';

type Screen = 'cover' | 'auth' | 'app';

export default function App() {
  const [screen, setScreen] = useState<Screen>('cover');
  const [language, setLanguage] = useState<Language>('ko');

  useEffect(() => {
    const handleJump = (e: any) => {
      const { target, lang } = e.detail;
      if (lang) setLanguage(lang);
      if (target === 'cover') setScreen('cover');
      else if (target === 'auth') setScreen('auth');
      else setScreen('app'); // all other tabs/settings are handled in LaterIslandApp
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
      window.dispatchEvent(new CustomEvent('simulation-sync', { detail: { screen, settingsLanguage: language } }));
    }
  }, [screen, language]);

  let content = null;
  if (screen === 'cover') {
    content = <CoverScreen onEnter={() => setScreen('auth')} language={language} />;
  } else if (screen === 'auth') {
    content = <AuthScreen onAuthenticated={() => setScreen('app')} language={language} />;
  } else {
    content = <LaterIslandApp />;
  }

  return (
    <>
      {content}
      <SimulationPanel />
    </>
  );
}

