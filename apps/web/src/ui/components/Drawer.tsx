import { PropsWithChildren } from 'react';
import '../../styles/design-tokens.css';
import './ui.css';

type DrawerProps = PropsWithChildren<{
  open: boolean;
  title?: string;
  onClose?: () => void;
}>;

function Drawer({ open, title, onClose, children }: DrawerProps) {
  if (!open) return null;

  return (
    <aside className="drawer" aria-label={title ?? 'Drawer'}>
      {title ? <h3 className="page-title" style={{ marginTop: 0 }}>{title}</h3> : null}
      <div>{children}</div>
      {onClose ? (
        <div style={{ marginTop: '16px' }}>
          <button className="btn btn-ghost" onClick={onClose} type="button">
            Close
          </button>
        </div>
      ) : null}
    </aside>
  );
}

export default Drawer;
