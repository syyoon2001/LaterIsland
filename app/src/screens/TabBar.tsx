import type { Tab, Language } from '../types';
import { translations } from '../data/translations';

interface TabBarProps {
  activeTab: Tab;
  setTab: (tab: Tab) => void;
  language: Language;
}

const tabIds: Tab[] = ['home', 'category', 'add', 'tags', 'done'];

export function TabBar({ activeTab, setTab, language }: TabBarProps) {
  const t = translations[language];
  const tabLabels: Record<Tab, string> = {
    home: t.tabHome,
    category: t.tabCategory,
    add: t.tabAdd,
    tags: t.tabTags,
    done: t.tabDone,
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 76,
        borderTop: '1px solid rgba(63,82,64,0.12)',
        background: '#E6F1E3',
        display: 'flex',
      }}
    >
      {tabIds.map((tabId) => {
        const active = activeTab === tabId;
        return (
          <div
            key={tabId}
            data-testid={`tab-${tabId}`}
            onClick={() => setTab(tabId)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: active ? '#6E8C6A' : 'rgba(63,82,64,0.25)',
              }}
            />
            <div style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#6E8C6A' : '#3F5240' }}>
              {tabLabels[tabId]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

