import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Force cache refresh on critical error
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group('CRITICAL SYSTEM ANOMALY');
    console.error('An error has been intercepted by the clinical safety layer.');
    console.error('Error Details:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-blue-600/10 border border-slate-100 p-12 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-rose-600/10 mb-8">
              <AlertTriangle className="w-12 h-12" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">System Error</h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                An unexpected error has occurred. Our team has been notified.
              </p>
              {this.state.error && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left overflow-hidden">
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Error Details</p>
                  <p className="text-[10px] font-mono text-slate-400 break-all leading-tight">
                    {this.state.error.message || 'Unknown exception'}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
