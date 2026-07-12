import { BackButton } from '../components/BackButton';
import { ContentCard } from '../components/ContentCard';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { useScrollThumb } from './useScrollThumb';

interface TrashItem {
  id: string;
  type: 'category' | 'tag' | 'content';
  title: string;
  summary?: string;
  categoryName?: string;
  tagNames?: string[];
  url?: string;
}

interface TrashScreenProps {
  language: Language;
  onBack: () => void;
  trashItems: TrashItem[];
  restoreTrashItem: (id: string) => void;
  openConfirmDeletePermanently: (id: string) => void;
}

export function TrashScreen({
  language,
  onBack,
  trashItems,
  restoreTrashItem,
  openConfirmDeletePermanently,
}: TrashScreenProps) {
  const t = translations[language];
  const thumbRef = useScrollThumb('trash-scroll-content');

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F7F9F2', display: 'flex', flexDirection: 'column', zIndex: 15 }}>
      {/* Header */}
      <div
        style={{
          height: 76,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          borderBottom: '1px solid rgba(63,82,64,0.12)',
          background: '#E6F1E3',
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <BackButton onClick={onBack} size={36} />
        <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>{t.trash}</div>
      </div>

      {/* Content */}
      <div
        id="trash-scroll-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
        }}
      >
        {trashItems.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.4, fontSize: 13 }}>
            {language === 'ko' ? '휴지통이 비어 있습니다' : 'Trash is empty'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {trashItems.map((item) => (
              <ContentCard
                key={item.id}
                title={item.title}
                summary={item.summary}
                url={item.url}
                categoryName={item.categoryName}
                tagNames={item.tagNames}
                status="trash"
                onRestore={() => restoreTrashItem(item.id)}
                onDeletePermanently={() => openConfirmDeletePermanently(item.id)}
                language={language}
              />
            ))}
          </div>
        )}
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
