import styles from '../components/IconButton.module.css';
import type { Language } from '../types';
import { translations } from '../data/translations';

// Height of the bar itself (excluding the 76px header above it). Kept as a
// named export so the scroll container below can shift its own top offset
// by exactly this much while the bar is open.
export const SEARCH_BAR_HEIGHT = 64;

interface SearchBarProps {
  searchOpen: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  performAiSearch: () => void;
  isAiSearching: boolean;
  closeSearch: () => void;
  language: Language;
}

export function SearchBar({
  searchOpen,
  searchQuery,
  setSearchQuery,
  performAiSearch,
  isAiSearching,
  closeSearch,
  language,
}: SearchBarProps) {
  if (!searchOpen) return null;

  const t = translations[language];
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div
      style={{
        position: 'absolute',
        top: 76,
        left: 0,
        right: 0,
        height: SEARCH_BAR_HEIGHT,
        boxSizing: 'border-box',
        zIndex: 2,
        background: '#E6F1E3',
        borderBottom: '1px solid rgba(63,82,64,0.12)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          autoFocus
          style={{
            width: '100%',
            height: 36,
            boxSizing: 'border-box',
            border: '1px solid rgba(63,82,64,0.3)',
            borderRadius: 10,
            padding: '0 40px 0 12px',
            fontSize: 14,
            fontFamily: 'inherit',
            background: '#F7F9F2',
            color: '#3F5240',
          }}
        />
        <button
          type="button"
          onClick={closeSearch}
          aria-label={language === 'ko' ? '검색 닫기' : 'Close search'}
          className={styles.iconButton}
          style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3F5240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <button
        type="button"
        onClick={performAiSearch}
        disabled={isAiSearching || !searchQuery.trim()}
        style={{
          flexShrink: 0,
          whiteSpace: 'nowrap',
          height: 36,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #9CB5B1',
          borderRadius: 8,
          padding: '0 12px',
          background: hasSearchQuery ? '#9CB5B1' : '#F7F9F2',
          color: hasSearchQuery ? '#fff' : '#9CB5B1',
          fontSize: 12,
          fontWeight: 600,
          cursor: isAiSearching || !searchQuery.trim() ? 'default' : 'pointer',
          fontFamily: 'inherit',
          opacity: hasSearchQuery ? 1 : 0.7,
        }}
      >
        {isAiSearching ? (language === 'ko' ? '검색 중...' : 'Searching...') : t.searchAi}
      </button>
    </div>
  );
}
