import { Component, ErrorInfo, PropsWithChildren } from 'react';
import { useErrorNotifications } from '../providers/ErrorNotificationsProvider';

type BoundaryProps = PropsWithChildren<{ onError?: (error: Error, info: ErrorInfo) => void }>;
type BoundaryState = { error: Error | null };

class Boundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    // eslint-disable-next-line no-console
    console.error('App error boundary caught an error', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <section className="page-card" role="alert">
          <h2 className="page-title">Something went wrong</h2>
          <p className="page-subtitle">A mock provider failed to load. Try reloading.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              Reload app
            </button>
            <button type="button" className="btn btn-ghost" onClick={this.handleReset}>
              Try again
            </button>
          </div>
          <div className="route-chip" style={{ marginTop: '12px' }}>
            Details: {error.message}
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

function ErrorBoundary({ children }: PropsWithChildren) {
  const { notifyError } = useErrorNotifications();
  return (
    <Boundary
      onError={(err) => {
        notifyError(err.message);
      }}
    >
      {children}
    </Boundary>
  );
}

export default ErrorBoundary;
