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
        {body && <div style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.5, marginBottom: 20 }}>{body}</div>}
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

