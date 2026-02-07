import Modal from './Modal';
import AvatarBadge from './AvatarBadge';
import TagChip from './TagChip';
import { NearbyUser } from '../../state/mockNearby';

export type ProfileCardOverlayProps = {
  open: boolean;
  user: NearbyUser | null;
  onClose: () => void;
  muted?: boolean;
  blocked?: boolean;
  reported?: boolean;
  onToggleMute?: (id: string) => void;
  onToggleBlock?: (id: string) => void;
  onToggleReport?: (id: string) => void;
};

function ProfileCardOverlay({
  open,
  user,
  onClose,
  muted = false,
  blocked = false,
  reported = false,
  onToggleMute,
  onToggleBlock,
  onToggleReport,
}: ProfileCardOverlayProps) {
  if (!open || !user) return null;

  const sharedInterests = user.sharedInterests;

  return (
    <Modal open={open} onClose={onClose} title="Profile">
      <div style={{ display: 'grid', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <AvatarBadge name={user.displayName} subtitle={`Region: ${user.region}`} />
          <span className="badge" aria-label={`Activity score ${user.affinityScore}`}>
            Activity {user.affinityScore}
          </span>
        </div>

        <div>
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Shared interests</div>
          {sharedInterests.length ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {sharedInterests.map((interest) => (
                <TagChip key={interest} label={interest} />
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)' }}>No shared interests yet.</div>
          )}
        </div>

        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          This is a mocked profile card for demo purposes.
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => onToggleMute?.(user.id)}
            aria-label={muted ? 'Unmute user' : 'Mute user'}
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => onToggleBlock?.(user.id)}
            aria-label={blocked ? 'Unblock user' : 'Block user'}
          >
            {blocked ? 'Unblock' : 'Block'}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => onToggleReport?.(user.id)}
            aria-label={reported ? 'Unreport user' : 'Report user'}
          >
            {reported ? 'Reported' : 'Report'}
          </button>
        </div>

        {(muted || blocked || reported) && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {muted ? <span className="badge">Muted</span> : null}
            {blocked ? <span className="badge">Blocked</span> : null}
            {reported ? <span className="badge">Reported</span> : null}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ProfileCardOverlay;
