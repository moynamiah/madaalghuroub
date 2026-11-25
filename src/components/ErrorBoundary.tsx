import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application Render Error:', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A1F44] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white text-[#0A1F44] rounded-[8px] border-t-4 border-t-[#00B8D4] p-6 shadow-xl space-y-4">
            <div className="text-xs font-mono font-semibold text-[#1E4FD8] uppercase">
              MADA AL-GHUROUB GENERAL CONTRACTING COMPANY
            </div>
            <h1 className="font-display text-xl font-bold text-[#0A1F44]">
              Moyna Miah — Business Development Manager
            </h1>
            <p className="text-sm text-[#44464e] leading-relaxed">
              The portfolio encountered an unexpected display error. Please reload the page or contact our executive desk directly:
            </p>
            <div className="text-xs font-mono space-y-1 text-[#0A1F44] bg-[#F4F6F9] p-3 rounded-[4px]">
              <div>Email: moyna@madaalghuroub.com</div>
              <div>Phone: +966 506425705</div>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 text-xs font-display font-bold text-white bg-[#1E4FD8] hover:bg-[#0A1F44] rounded-[4px] transition-colors cursor-pointer"
            >
              Reload Portfolio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
