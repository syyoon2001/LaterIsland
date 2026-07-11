import { BackButton } from '../components/BackButton';
import type { Language } from '../types';

interface SettingsScreenProps {
  profileName: string;
  settingsLanguage: Language;
  setSettingsLanguage: (lang: Language) => void;
  backFromSettings: () => void;
  openLogoutConfirm: () => void;
  openDeleteConfirm: () => void;
}

export function SettingsScreen({
  profileName,
  settingsLanguage,
  setSettingsLanguage,
  backFromSettings,
  openLogoutConfirm,
  openDeleteConfirm,
}: SettingsScreenProps) {
  const isKo = settingsLanguage === 'ko';
  const isEn = settingsLanguage === 'en';

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 76,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          borderBottom: '1px solid rgba(63,82,64,0.12)',
          background: '#E6F1E3',
        }}
      >
        <BackButton onClick={backFromSettings} size={36} />
        <div style={{ fontSize: 18, fontWeight: 700 }}>설정</div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 76,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F7F9F2',
              border: '1px solid rgba(63,82,64,0.15)',
              flexShrink: 0,
            }}
          />
          <div style={{ fontSize: 16, fontWeight: 700 }}>{profileName}</div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 10 }}>언어</div>
          <div style={{ display: 'flex', border: '1px solid rgba(63,82,64,0.25)', borderRadius: 10, overflow: 'hidden' }}>
            <div
              onClick={() => setSettingsLanguage('ko')}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: isKo ? '#6E8C6A' : '#F7F9F2',
                color: isKo ? '#fff' : '#3F5240',
              }}
            >
              한국어
            </div>
            <div
              onClick={() => setSettingsLanguage('en')}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: isEn ? '#6E8C6A' : '#F7F9F2',
                color: isEn ? '#fff' : '#3F5240',
                borderLeft: '1px solid rgba(63,82,64,0.25)',
              }}
            >
              English
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            onClick={openLogoutConfirm}
            style={{
              padding: '16px 4px',
              borderBottom: '1px solid rgba(63,82,64,0.12)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            로그아웃
          </div>
          <div
            onClick={openDeleteConfirm}
            style={{ padding: '16px 4px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#B15C4A' }}
          >
            계정 삭제
          </div>
        </div>
      </div>
    </div>
  );
}
