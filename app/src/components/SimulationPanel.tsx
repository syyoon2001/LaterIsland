import { useEffect, useState } from 'react';

export function SimulationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('ko-cover'); // e.g. ko-home, en-settings

  useEffect(() => {
    const handleSync = (e: any) => {
      const { screen, activeTab, showSettings, settingsLanguage } = e.detail;
      const langPrefix = settingsLanguage === 'en' ? 'en' : 'ko';

      if (screen === 'cover') {
        setActiveId(langPrefix + '-cover');
      } else if (screen === 'auth') {
        setActiveId(langPrefix + '-auth');
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

  const jumpTo = (target: string, lang: 'ko' | 'en') => {
    setActiveId(lang + '-' + target);
    window.dispatchEvent(new CustomEvent('simulation-jump', { detail: { target, lang } }));
  };

  const koGroup = [
    { id: 'cover', label: '커버' },
    { id: 'home', label: '홈' },
    { id: 'category', label: '카테고리' },
    { id: 'add', label: '추가' },
    { id: 'tags', label: '태그' },
    { id: 'done', label: '완료' },
    { id: 'settings', label: '설정' },
  ];

  const enGroup = [
    { id: 'cover', label: 'Cover' },
    { id: 'home', label: 'Home' },
    { id: 'category', label: 'Category' },
    { id: 'add', label: 'Add' },
    { id: 'tags', label: 'Tag' },
    { id: 'done', label: 'Done' },
    { id: 'settings', label: 'Settings' },
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
            TransitionShowcase
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            {koGroup.map((item) => {
              const isActive = activeId === 'ko-' + item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => jumpTo(item.id, 'ko')}
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
                  {item.label}
                </button>
              );
            })}
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 'bold', color: '#3F5240', margin: '0 0 12px 0' }}>
            TransitionShowcase EN
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {enGroup.map((item) => {
              const isActive = activeId === 'en-' + item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => jumpTo(item.id, 'en')}
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
                  {item.label}
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
