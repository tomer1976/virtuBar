import '../../styles/design-tokens.css';
import './ui.css';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2) || '?';
}

type AvatarBadgeProps = {
  name: string;
  subtitle?: string;
};

function AvatarBadge({ name, subtitle }: AvatarBadgeProps) {
  return (
    <div className="avatar-badge" role="group" aria-label={name}>
      <span className="avatar-circle" aria-hidden>
        {initials(name)}
      </span>
      <div>
        <div>{name}</div>
        {subtitle ? <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{subtitle}</div> : null}
      </div>
    </div>
  );
}

export default AvatarBadge;
