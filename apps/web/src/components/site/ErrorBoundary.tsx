import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="idx-page">
          <div className="idx-eyebrow">Error</div>
          <h1>Something went wrong.</h1>
          <p>The page could not render. Try refreshing.</p>
          <pre
            style={{
              background: 'var(--color-surface-muted)',
              padding: 16,
              borderRadius: 8,
              fontSize: 12,
              overflow: 'auto',
              color: 'var(--color-text-muted)',
              marginTop: 24,
            }}
          >
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
