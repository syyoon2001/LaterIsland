import type { Language } from '../types';
import { translations } from '../data/translations';

export interface ConfirmDialogProps {
  title: string;
  body: string;
  actionLabel: string;
  color: string;
  onCancel: () => void;
  onConfirm: () => void;
  language: Language;
  error?: string;
  confirming?: boolean;
}

export function ConfirmDialog({
  title,
  body,
  actionLabel,
  color,
  onCancel,
  onConfirm,
  language,
  error,
  confirming,
}: ConfirmDialogProps) {
  const t = translations[language];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        background: 'rgba(63,82,64,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '80%',
          background: '#F7F9F2',
          borderRadius: 16,
          padding: '24px 20px',
          boxShadow: '0 12px 30px rgba(63,82,64,0.25)',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: body ? 8 : 20 }}>{title}</div>
        {body && (
          <div style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.5, marginBottom: 20 }}>
            {body === t.confirmDeleteHint ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                <span>{t.confirmDeleteHintBefore}</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3F5240"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>{t.confirmDeleteHintAfter}</span>
              </span>
            ) : (
              body
            )}
          </div>
        )}
        {error && (
          <div style={{ fontSize: 12, fontWeight: 600, color: '#B15C4A', marginTop: -10, marginBottom: 20 }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              border: '1px solid rgba(63,82,64,0.3)',
              borderRadius: 10,
              padding: 10,
              background: '#F7F9F2',
              color: '#3F5240',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t.confirmCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            style={{
              flex: 1,
              border: `1px solid ${color}`,
              borderRadius: 10,
              padding: 10,
              background: color,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: confirming ? 'default' : 'pointer',
              opacity: confirming ? 0.7 : 1,
              fontFamily: 'inherit',
            }}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

