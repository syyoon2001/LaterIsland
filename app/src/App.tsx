import { useState } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { CoverScreen } from './screens/CoverScreen';
import { LaterIslandApp } from './screens/LaterIslandApp';

type Screen = 'cover' | 'auth' | 'app';

export default function App() {
  const [screen, setScreen] = useState<Screen>('cover');

  if (screen === 'cover') {
    return <CoverScreen onEnter={() => setScreen('auth')} />;
  }
  if (screen === 'auth') {
    return <AuthScreen onAuthenticated={() => setScreen('app')} />;
  }
  return <LaterIslandApp />;
}
