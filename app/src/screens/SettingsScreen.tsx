import { BackButton } from '../components/BackButton';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { useScrollThumb } from './useScrollThumb';

interface SettingsScreenProps {
  settingsLanguage: Language;
  setSettingsLanguage: (lang: Language) => void;
  backFromSettings: () => void;
  openLogoutConfirm: () => void;
  openDeleteConfirm: () => void;
  userDisplayName: string;
  userEmail: string;
}

export function SettingsScreen({
  settingsLanguage,
  setSettingsLanguage,
  backFromSettings,
  openLogoutConfirm,
  openDeleteConfirm,
  userDisplayName,
  userEmail,
}: SettingsScreenProps) {
  const isKo = settingsLanguage === 'ko';
  const isEn = settingsLanguage === 'en';
  const t = translations[settingsLanguage];
  const thumbRef = useScrollThumb('settings-scroll-content');
  const displayName = userDisplayName || userEmail.split('@')[0] || t.profileName;

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
          zIndex: 2,
        }}
      >
        <BackButton onClick={backFromSettings} size={36} />
        <div style={{ fontSize: 18, fontWeight: 700 }}>{t.settings}</div>
      </div>

      <div
        id="settings-scroll-content"
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
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{displayName}</div>
            {userEmail && <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{userEmail}</div>}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 10 }}>{t.settingsLanguageLabel}</div>
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
            {t.logout}
          </div>
          <div
            onClick={openDeleteConfirm}
            style={{ padding: '16px 4px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#B15C4A' }}
          >
            {t.deleteAccount}
          </div>
        </div>
      </div>
      <div
        ref={thumbRef}
        style={{
          position: 'absolute',
          right: 3,
          width: 4,
          borderRadius: 4,
          background: '#E0E8E1',
          top: 76,
          height: '20%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

