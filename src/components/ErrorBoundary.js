import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Keep diagnostics in console for developers.
    console.error('Unhandled UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          padding: 24,
        }}>
          <div className="card glass" style={{ maxWidth: 520, width: '100%', padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>⚠️</div>
            <h1 style={{ margin: 0, fontSize: '1.3rem' }}>Something went wrong</h1>
            <p style={{ marginTop: 10, color: 'var(--text-muted)' }}>
              We ran into an unexpected problem while loading this page.
            </p>
            <button className="btn btn-primary" onClick={this.handleReload} style={{ marginTop: 12 }}>
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
