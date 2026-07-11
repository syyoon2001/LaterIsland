import type { Tab } from '../types';

interface TabBarProps {
  activeTab: Tab;
  setTab: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'home', label: '홈' },
  { id: 'category', label: '카테고리' },
  { id: 'add', label: '추가' },
  { id: 'tags', label: '태그' },
  { id: 'done', label: '완료' },
];

export function TabBar({ activeTab, setTab }: TabBarProps) {
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
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <div
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => setTab(tab.id)}
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
              {tab.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
