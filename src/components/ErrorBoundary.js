import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-4xl mb-4">💥</p>
          <h2 className="text-xl font-black text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 mb-6">An unexpected error occurred. Try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition"
          >
            Reload app
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-6 text-left text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 overflow-auto max-h-40">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
