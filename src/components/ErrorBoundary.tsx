import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    this.handleReset = this.handleReset.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  private handleReload() {
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-950 text-white font-sans">
          <div className="w-full max-w-lg bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black font-display text-white uppercase tracking-wider">
                  {this.props.fallbackTitle || 'Module Execution Error'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  An unexpected error occurred in this section. The application caught it safely.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 font-mono text-xs text-amber-300/90 overflow-x-auto space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Error Details:
                </div>
                <p className="text-xs text-slate-200">{this.state.error.message || 'Unknown error'}</p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2 text-[10px] text-slate-400 cursor-pointer">
                    <summary className="hover:text-slate-200 transition-colors font-sans">View Component Stack</summary>
                    <pre className="mt-1 p-2 bg-black/40 rounded-lg overflow-x-auto text-[9px] text-slate-400">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry Section</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Home className="h-4 w-4" />
                <span>Reload App</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
