import type { ContentForm, Language } from '../../types';
import { translations } from '../../data/translations';

interface FormCategoryRow {
  id: string;
  name: string;
  bg: string;
  fg: string;
  onSelect: () => void;
}

interface FormTagRow {
  id: string;
  name: string;
  mark: string;
  onToggle: () => void;
}

interface FormTagChip {
  id: string;
  name: string;
  onRemove: () => void;
}

interface AddTabProps {
  form: ContentForm;
  setFormTitle: (v: string) => void;
  setFormUrl: (v: string) => void;
  setFormSummary: (v: string) => void;

  categoryDropdownOpen: boolean;
  toggleCategoryDropdown: () => void;
  selectedCategoryLabel: string;
  formCategoryRows: FormCategoryRow[];
  newCategoryInput: string;
  setNewCategoryInput: (v: string) => void;
  addNewCategory: () => void;

  tagDropdownOpen: boolean;
  toggleTagDropdown: () => void;
  selectedFormTagChips: FormTagChip[];
  formTagRows: FormTagRow[];
  newTagInput: string;
  setNewTagInput: (v: string) => void;
  addNewTag: () => void;

  generateAI: () => void;
  aiLoadingStatus?: 'idle' | 'fetching' | 'generating';
  saveContent: () => void;
  language: Language;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  border: '1px solid rgba(63,82,64,0.3)',
  borderRadius: 10,
  padding: 12,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#F7F9F2',
  color: '#3F5240',
};

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 };

export function AddTab({
  form,
  setFormTitle,
  setFormUrl,
  setFormSummary,
  categoryDropdownOpen,
  toggleCategoryDropdown,
  selectedCategoryLabel,
  formCategoryRows,
  newCategoryInput,
  setNewCategoryInput,
  addNewCategory,
  tagDropdownOpen,
  toggleTagDropdown,
  selectedFormTagChips,
  formTagRows,
  newTagInput,
  setNewTagInput,
  addNewTag,
  generateAI,
  aiLoadingStatus = 'idle',
  saveContent,
  language,
  isEditing = false,
  onCancelEdit,
}: AddTabProps) {
  const t = translations[language];
  const pageTitle = isEditing
    ? (language === 'ko' ? '콘텐츠 수정' : 'Edit Content')
    : (language === 'ko' ? '콘텐츠 추가' : 'Add Content');

  return (
    <div data-screen-label={pageTitle}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={labelStyle}>{t.formLinkLabel}</label>
          <input
            value={form.url}
            onChange={(e) => setFormUrl(e.target.value)}
            placeholder={t.formLinkPlaceholder}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>{t.formTitleLabel}</label>
          <input
            value={form.title}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder={t.formTitlePlaceholder}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>{t.formSummaryLabel}</label>
          <textarea
            value={form.summary}
            onChange={(e) => setFormSummary(e.target.value)}
            placeholder={t.formSummaryPlaceholder}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>

        <div>
          <label style={labelStyle}>{t.formCategoryLabel}</label>
          <div
            onClick={toggleCategoryDropdown}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid rgba(63,82,64,0.3)',
              borderRadius: 10,
              padding: 12,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 14 }}>{selectedCategoryLabel}</span>
            <span style={{ display: 'flex', color: '#3F5240' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {categoryDropdownOpen ? (
                  <polyline points="18 15 12 9 6 15"></polyline>
                ) : (
                  <polyline points="6 9 12 15 18 9"></polyline>
                )}
              </svg>
            </span>
          </div>
          {categoryDropdownOpen && (
            <div
              style={{
                border: '1px solid rgba(63,82,64,0.3)',
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {formCategoryRows.map((cat) => (
                <div
                  key={cat.id}
                  onClick={cat.onSelect}
                  style={{
                    padding: 10,
                    border: '1px solid rgba(63,82,64,0.25)',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                    background: cat.bg,
                    color: cat.fg,
                  }}
                >
                  {cat.name}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder={t.formCategoryAddNew}
                  style={{
                    flex: 1,
                    boxSizing: 'border-box',
                    border: '1px solid rgba(63,82,64,0.3)',
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    background: '#F7F9F2',
                    color: '#3F5240',
                  }}
                />
                <button
                  type="button"
                  onClick={addNewCategory}
                  style={{
                    border: '1px solid #6E8C6A',
                    borderRadius: 8,
                    padding: '10px 14px',
                    background: '#6E8C6A',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {t.formCategoryAddBtn}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>{t.formTagLabel}</label>
          {selectedFormTagChips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {selectedFormTagChips.map((chip) => (
                <div
                  key={chip.id}
                  onClick={chip.onRemove}
                  style={{
                    border: '1px solid rgba(156,181,177,0.6)',
                    background: 'rgba(156,181,177,0.25)',
                    borderRadius: 20,
                    color: '#3F5240',
                    padding: '5px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  #{chip.name} <span>×</span>
                </div>
              ))}
            </div>
          )}
          <div
            onClick={toggleTagDropdown}
            style={{
              border: '1px solid rgba(63,82,64,0.3)',
              borderRadius: 10,
              padding: 12,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.formTagSelectPlaceholder}
          </div>
          {tagDropdownOpen && (
            <div
              style={{
                border: '1px solid rgba(63,82,64,0.3)',
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                maxHeight: 200,
                overflowY: 'auto',
              }}
            >
              {formTagRows.map((tag) => (
                <div
                  key={tag.id}
                  onClick={tag.onToggle}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 10,
                    border: '1px solid rgba(63,82,64,0.25)',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                    background: '#F7F9F2',
                  }}
                >
                  <span>#{tag.name}</span>
                  <span>{tag.mark}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 4, width: '100%', boxSizing: 'border-box' }}>
                <input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder={t.formTagAddNew}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    boxSizing: 'border-box',
                    border: '1px solid rgba(63,82,64,0.3)',
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    background: '#F7F9F2',
                    color: '#3F5240',
                  }}
                />
                <button
                  type="button"
                  onClick={addNewTag}
                  style={{
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box',
                    border: '1px solid #6E8C6A',
                    borderRadius: 8,
                    padding: '10px 14px',
                    background: '#6E8C6A',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {t.formTagAddBtn}
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={generateAI}
          disabled={aiLoadingStatus !== 'idle'}
          style={{
            width: '100%',
            border: '1px solid #6E8C6A',
            borderRadius: 10,
            padding: 12,
            background: aiLoadingStatus !== 'idle' ? '#6E8C6A' : '#F7F9F2',
            color: aiLoadingStatus !== 'idle' ? '#fff' : '#6E8C6A',
            fontSize: 14,
            fontWeight: 700,
            cursor: aiLoadingStatus !== 'idle' ? 'default' : 'pointer',
            opacity: aiLoadingStatus !== 'idle' ? 0.8 : 1,
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          {aiLoadingStatus === 'fetching'
            ? (language === 'ko' ? '페이지 불러오는 중...' : 'Fetching page...')
            : aiLoadingStatus === 'generating'
              ? (language === 'ko' ? '요약 생성 중...' : 'Generating...')
              : t.formAiAutofill}
        </button>

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                flex: 1,
                border: '1px solid rgba(63,82,64,0.3)',
                borderRadius: 10,
                padding: 12,
                background: '#F7F9F2',
                color: '#3F5240',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {language === 'ko' ? '취소' : 'Cancel'}
            </button>
          )}
          <button
            type="button"
            onClick={saveContent}
            style={{
              flex: 1,
              border: '1px solid #6E8C6A',
              borderRadius: 10,
              padding: 12,
              background: '#6E8C6A',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
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

