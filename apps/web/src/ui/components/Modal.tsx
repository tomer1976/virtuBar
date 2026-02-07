import { PropsWithChildren } from 'react';
import '../../styles/design-tokens.css';
import './ui.css';

type ModalProps = PropsWithChildren<{
  open: boolean;
  title?: string;
  onClose?: () => void;
}>;

function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Modal'}
    >
      <div className="modal">
        {title ? <h3 className="page-title">{title}</h3> : null}
        <div>{children}</div>
        {onClose ? (
          <div style={{ marginTop: '16px' }}>
            <button className="btn btn-ghost" onClick={onClose} type="button">
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Modal;
