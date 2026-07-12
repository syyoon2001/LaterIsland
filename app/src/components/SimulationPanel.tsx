import { useEffect, useState } from 'react';

export function SimulationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [activeId, setActiveId] = useState<string>('ko-cover'); // e.g. ko-home, en-settings

  useEffect(() => {
    const handleSync = (e: any) => {
      const { screen, activeTab, showSettings, settingsLanguage, authMode } = e.detail;
      const langPrefix = settingsLanguage === 'en' ? 'en' : 'ko';
      setLanguage(langPrefix);

      if (screen === 'cover') {
        setActiveId(langPrefix + '-cover');
      } else if (screen === 'auth') {
        setActiveId(langPrefix + '-auth-' + (authMode === 'signup' ? 'signup' : 'login'));
      } else if (screen === 'app') {
        if (showSettings) {
          setActiveId(langPrefix + '-settings');
        } else {
          setActiveId(langPrefix + '-' + activeTab);
        }
      }
    };

    window.addEventListener('simulation-sync', handleSync);
    return () => window.removeEventListener('simulation-sync', handleSync);
  }, []);

  // Jumps to a screen using the app's current language. Pass `lang` only to
  // force a specific language, and `mode` to pick login vs signup on the
  // auth screen (since the auth screen has no English text yet, login/signup
  // entries always force Korean).
  const jumpTo = (target: string, opts?: { lang?: 'ko' | 'en'; mode?: 'login' | 'signup' }) => {
    const effectiveLang = opts?.lang ?? language;
    const activeSuffix = target === 'auth' && opts?.mode ? `auth-${opts.mode}` : target;
    setActiveId(effectiveLang + '-' + activeSuffix);
    window.dispatchEvent(new CustomEvent('simulation-jump', { detail: { target, lang: opts?.lang, mode: opts?.mode } }));
  };

  // Single unified screen list (no more separate ko/en groups). Each entry's
  // label follows the app's current language; clicking navigates to that
  // screen in the current language. `mode` distinguishes the login/signup
  // entries, which both target the 'auth' screen but should open (and
  // highlight) independently.
  const screenItems: { key: string; id: string; ko: string; en: string; lang?: 'ko' | 'en'; mode?: 'login' | 'signup' }[] = [
    { key: 'cover', id: 'cover', ko: '커버', en: 'Cover' },
    { key: 'home', id: 'home', ko: '홈', en: 'Home' },
    { key: 'category', id: 'category', ko: '카테고리', en: 'Category' },
    { key: 'add', id: 'add', ko: '추가', en: 'Add' },
    { key: 'tags', id: 'tags', ko: '태그', en: 'Tag' },
    { key: 'done', id: 'done', ko: '완료', en: 'Done' },
    { key: 'settings', id: 'settings', ko: '설정', en: 'Settings' },
    // Auth screen has no English text yet, so these always link to the Korean version.
    { key: 'login', id: 'auth', mode: 'login', ko: '로그인', en: 'Login', lang: 'ko' },
    { key: 'signup', id: 'auth', mode: 'signup', ko: '회원가입', en: 'Sign Up', lang: 'ko' },
  ];

  return (
    <>
      {/* Overlay to close panel on outside click if open */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* The side panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 300,
          background: '#F7F9F2',
          borderLeft: '1px solid rgba(63, 82, 64, 0.1)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.05)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Toggle Tab */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute',
            left: -32,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 32,
            height: 48,
            background: '#F7F9F2',
            border: '1px solid rgba(63, 82, 64, 0.1)',
            borderRight: 'none',
            borderRadius: '12px 0 0 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '-4px 0 10px rgba(0,0,0,0.05)',
            color: '#3F5240',
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          {isOpen ? '>' : '<'}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 'bold', color: '#3F5240', margin: '0 0 12px 0' }}>
            시스템 제어판
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {screenItems.map((item) => {
              const effectiveLang = item.lang ?? language;
              const activeSuffix = item.id === 'auth' && item.mode ? `auth-${item.mode}` : item.id;
              const isActive = activeId === effectiveLang + '-' + activeSuffix;
              return (
                <button
                  key={item.key}
                  onClick={() => jumpTo(item.id, { lang: item.lang, mode: item.mode })}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: isActive ? '#6E8C6A' : 'transparent',
                    color: isActive ? '#fff' : '#3F5240',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    transition: 'background 0.2s',
                  }}
                >
                  {language === 'en' ? item.en : item.ko}
                </button>
              );
            })}
          </div>

          <hr style={{ margin: '32px 0 16px 0', border: 'none', borderTop: '1px solid rgba(63, 82, 64, 0.1)' }} />
          <h2 style={{ fontSize: 16, fontWeight: 'bold', color: '#3F5240', margin: '0 0 12px 0' }}>
            테스트 도구
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('simulation-generate-dummy'))}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #6E8C6A',
                background: '#F7F9F2',
                color: '#6E8C6A',
                textAlign: 'center',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(110, 140, 106, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#F7F9F2')}
            >
              무작위 항목 5개 생성
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('simulation-clear-all'))}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #B15C4A',
                background: '#F7F9F2',
                color: '#B15C4A',
                textAlign: 'center',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(177, 92, 74, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#F7F9F2')}
            >
              전체 항목 삭제
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
