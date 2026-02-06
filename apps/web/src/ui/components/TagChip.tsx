import '../../styles/design-tokens.css';
import './ui.css';

type TagChipProps = {
  label: string;
  onRemove?: () => void;
};

function TagChip({ label, onRemove }: TagChipProps) {
  return (
    <span className="tag-chip">
      <span>{label}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          className="btn btn-ghost"
          style={{ padding: '4px 8px', fontSize: '0.85rem' }}
          onClick={onRemove}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}

export default TagChip;
