import { useState } from 'react';
import type { Language } from '../types';
import { translations } from '../data/translations';

export interface RenameDialogProps {
  title: string;
  initialValue: string;
  onCancel: () => void;
  onSave: (value: string) => void;
  language: Language;
}

// Visually mirrors ConfirmDialog's modal chrome (same overlay/box/button
// layout) but for renaming instead of confirming a destructive action —
// kept as a separate component so ConfirmDialog itself (and the delete
// confirmation flows using it) stays untouched.
export function RenameDialog({ title, initialValue, onCancel, onSave, language }: RenameDialogProps) {
  const t = translations[language];
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();

  const save = () => {
    if (trimmed) onSave(trimmed);
  };

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
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{title}</div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          autoFocus
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid rgba(63,82,64,0.3)',
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            fontFamily: 'inherit',
            background: '#fff',
            color: '#3F5240',
            marginBottom: 20,
          }}
        />
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
            onClick={save}
            disabled={!trimmed}
            style={{
              flex: 1,
              border: '1px solid #6E8C6A',
              borderRadius: 10,
              padding: 10,
              background: '#6E8C6A',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: trimmed ? 'pointer' : 'default',
              opacity: trimmed ? 1 : 0.6,
              fontFamily: 'inherit',
            }}
          >
            {t.formSave}
          </button>
        </div>
      </div>
    </div>
  );
}
