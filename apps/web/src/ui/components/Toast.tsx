import { PropsWithChildren } from 'react';
import '../../styles/design-tokens.css';
import './ui.css';

type ToastProps = PropsWithChildren<{
  tone?: 'info' | 'success' | 'warning' | 'danger';
}>;

function toneIcon(tone: ToastProps['tone']) {
  switch (tone) {
    case 'success':
      return '✓';
    case 'warning':
      return '⚠';
    case 'danger':
      return '!';
    default:
      return 'ℹ';
  }
}

function Toast({ tone = 'info', children }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <span aria-hidden>{toneIcon(tone)}</span>
      <span>{children}</span>
    </div>
  );
}

export default Toast;
