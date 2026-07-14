import styles from '../components/IconButton.module.css';
import type { SortOrder, Language } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  openSearch: () => void;

  sortMenuOpen: boolean;
  toggleSortMenu: () => void;
  closeSortMenu: () => void;
  sortOrder: SortOrder;
  selectSort: (order: SortOrder) => void;

  goSettings: () => void;
  language: Language;
}

const sortOptionStyle = (active: boolean) => ({
  padding: '8px 6px',
  fontSize: 12.5,
  borderRadius: 6,
  cursor: 'pointer',
  color: active ? '#6E8C6A' : '#3F5240',
  fontWeight: active ? 700 : 400,
});

export function Header({
  openSearch,
  sortMenuOpen,
  toggleSortMenu,
  closeSortMenu,
  sortOrder,
  selectSort,
  goSettings,
  language,
}: HeaderProps) {
  const t = translations[language];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 76,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          padding: '0 12px 0 16px',
          borderBottom: '1px solid rgba(63,82,64,0.12)',
          background: '#E6F1E3',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src="/assets/logo-book.png" alt="" style={{ width: 52, height: 52, objectFit: 'contain', marginLeft: -4 }} />
          <img src="/assets/logo-wordmark.png" alt="Later Island" style={{ height: 22, objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" onClick={openSearch} aria-label={t.searchPlaceholder} className={styles.iconButton} style={{ width: 36, height: 36 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F5240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button type="button" onClick={toggleSortMenu} aria-label={t.sortBy} className={styles.iconButton} style={{ width: 36, height: 36 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F5240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 16-4 4-4-4"></path>
              <path d="M17 20V4"></path>
              <path d="m3 8 4-4 4 4"></path>
              <path d="M7 4v16"></path>
            </svg>
          </button>
          <button type="button" onClick={goSettings} aria-label={t.settings} className={styles.iconButton} style={{ width: 36, height: 36 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F5240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>

      {sortMenuOpen && (
        <>
          <div onClick={closeSortMenu} style={{ position: 'absolute', inset: 0, zIndex: 8 }} />
          <div
            style={{
              position: 'absolute',
              top: 64,
              right: 52,
              zIndex: 9,
              background: '#F7F9F2',
              border: '1px solid rgba(63,82,64,0.15)',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(63,82,64,0.15)',
              minWidth: 130,
              padding: 6,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '6px 10px 4px', fontSize: 11, fontWeight: 700, opacity: 0.5 }}>{t.sortBy}</div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 4px 4px' }}>
              <div
                onClick={() => selectSort('latest')}
                className={styles.iconButton}
                style={{
                  ...sortOptionStyle(sortOrder === 'latest'),
                  width: 'auto',
                  height: 'auto',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {t.sortLatest}
                {sortOrder === 'latest' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6E8C6A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 6, flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <div
                onClick={() => selectSort('oldest')}
                className={styles.iconButton}
                style={{
                  ...sortOptionStyle(sortOrder === 'oldest'),
                  width: 'auto',
                  height: 'auto',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {t.sortOldest}
                {sortOrder === 'oldest' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6E8C6A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 6, flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <div
                onClick={() => selectSort('alpha')}
                className={styles.iconButton}
                style={{
                  ...sortOptionStyle(sortOrder === 'alpha'),
                  width: 'auto',
                  height: 'auto',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {t.sortAlpha}
                {sortOrder === 'alpha' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6E8C6A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 6, flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
