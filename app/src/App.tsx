import { useEffect, useState } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { CoverScreen } from './screens/CoverScreen';
import { LaterIslandApp } from './screens/LaterIslandApp';
import { SimulationPanel } from './components/SimulationPanel';

type Screen = 'cover' | 'auth' | 'app';

export default function App() {
  const [screen, setScreen] = useState<Screen>('cover');

  useEffect(() => {
    const handleJump = (e: any) => {
      const { target } = e.detail;
      if (target === 'cover') setScreen('cover');
      else if (target === 'auth') setScreen('auth');
      else setScreen('app'); // all other tabs/settings are handled in LaterIslandApp
    };
    window.addEventListener('simulation-jump', handleJump);
    return () => window.removeEventListener('simulation-jump', handleJump);
  }, []);

  useEffect(() => {
    // We only dispatch cover and auth from here since app delegates to useLaterIslandState
    if (screen === 'cover' || screen === 'auth') {
      window.dispatchEvent(new CustomEvent('simulation-sync', { detail: { screen } }));
    }
  }, [screen]);

  let content = null;
  if (screen === 'cover') {
    content = <CoverScreen onEnter={() => setScreen('auth')} />;
  } else if (screen === 'auth') {
    content = <AuthScreen onAuthenticated={() => setScreen('app')} />;
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
