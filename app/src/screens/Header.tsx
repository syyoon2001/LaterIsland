import styles from '../components/IconButton.module.css';
import type { SortOrder, Language } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  searchOpen: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  toggleSearch: () => void;
  closeSearch: () => void;

  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;

  sortSubmenuOpen: boolean;
  toggleSortSubmenu: () => void;
  sortOrder: SortOrder;
  selectSort: (order: SortOrder) => void;

  goSettings: () => void;
  language: Language;

  setShowTrash: (v: boolean) => void;
}

const sortOptionStyle = (active: boolean) => ({
  padding: '8px 6px',
  fontSize: 12.5,
  borderRadius: 6,
  cursor: 'pointer',
  color: active ? '#6E8C6A' : '#3F5240',
  fontWeight: active ? 700 : 400,
});

const menuRowStyle = { padding: '10px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' };

export function Header({
  searchOpen,
  searchQuery,
  setSearchQuery,
  toggleSearch,
  closeSearch,
  menuOpen,
  toggleMenu,
  closeMenu,
  sortSubmenuOpen,
  toggleSortSubmenu,
  sortOrder,
  selectSort,
  goSettings,
  language,
  setShowTrash,
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
          <button type="button" onClick={toggleSearch} aria-label={t.searchPlaceholder} className={styles.iconButton} style={{ width: 36, height: 36 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F5240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button type="button" onClick={toggleMenu} aria-label={t.settings} className={styles.iconButton} style={{ width: 36, height: 36 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F5240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1.25"></circle>
              <circle cx="5" cy="12" r="1.25"></circle>
              <circle cx="19" cy="12" r="1.25"></circle>
            </svg>
          </button>
        </div>
      </div>

      {searchOpen && (
        <>
          <div onClick={closeSearch} style={{ position: 'absolute', inset: 0, zIndex: 8 }} />
          <div
            style={{
              position: 'absolute',
              top: 64,
              right: 52,
              zIndex: 9,
              width: 'min(240px, calc(100% - 24px))',
              background: '#F7F9F2',
              border: '1px solid rgba(63,82,64,0.15)',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(63,82,64,0.15)',
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid rgba(63,82,64,0.3)',
                borderRadius: 10,
                padding: 12,
                fontSize: 14,
                fontFamily: 'inherit',
                background: '#F7F9F2',
                color: '#3F5240',
              }}
            />
            <button
              type="button"
              onClick={() => {}}
              style={{
                alignSelf: 'flex-start',
                border: '1px solid #6E8C6A',
                borderRadius: 8,
                padding: '6px 12px',
                background: '#F7F9F2',
                color: '#6E8C6A',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {t.searchAi}
            </button>
          </div>
        </>
      )}

      {menuOpen && (
        <>
          <div onClick={closeMenu} style={{ position: 'absolute', inset: 0, zIndex: 8 }} />
          <div
            style={{
              position: 'absolute',
              top: 64,
              right: 12,
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
            <div
              onClick={toggleSortSubmenu}
              className={styles.iconButton}
              style={{ ...menuRowStyle, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: 'auto', height: 'auto' }}
            >
              <span>{t.sortBy}</span>
              <span style={{ position: 'absolute', right: 10, display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3F5240" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {sortSubmenuOpen ? (
                    <polyline points="18 15 12 9 6 15"></polyline>
                  ) : (
                    <polyline points="6 9 12 15 18 9"></polyline>
                  )}
                </svg>
              </span>
            </div>
            {sortSubmenuOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 4px 2px 14px' }}>
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
            )}
            <div
              onClick={() => {
                setShowTrash(true);
                closeMenu();
              }}
              className={styles.iconButton}
              style={{ ...menuRowStyle, width: 'auto', height: 'auto' }}
            >
              {t.trash}
            </div>
            <div style={{ height: 1, background: 'rgba(63,82,64,0.12)', margin: '4px 6px' }} />
            <div onClick={goSettings} className={styles.iconButton} style={{ ...menuRowStyle, width: 'auto', height: 'auto' }}>
              {t.settings}
            </div>
          </div>
        </>
      )}
    </>
  );
}

