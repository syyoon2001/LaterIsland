import styles from './IconButton.module.css';

interface BackButtonProps {
  onClick: () => void;
  size?: number;
}

export function BackButton({ onClick, size = 32 }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="뒤로가기"
      className={styles.iconButton}
      style={{ width: size, height: size }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F5240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </button>
  );
}
