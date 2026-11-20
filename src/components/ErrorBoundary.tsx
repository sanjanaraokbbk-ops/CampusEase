import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FIREBASE_PROJECT_ID, FIRESTORE_DATABASE_ID } from '../lib/firebase';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  isQuotaError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
    isQuotaError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const raw = error?.message || 'An unexpected error occurred.';
    let friendly = raw;
    let isQuotaError = raw.toLowerCase().includes('quota exceeded');

    try {
      const parsed = JSON.parse(raw) as { error?: string; operationType?: string; path?: string };
      if (parsed && typeof parsed.error === 'string') {
        isQuotaError = parsed.error.toLowerCase().includes('quota exceeded');
        if (parsed.error.toLowerCase().includes('permission')) {
          friendly = `Access was denied while performing "${parsed.operationType}" on "${parsed.path}". Please verify you are signed in with the right account.`;
        } else {
          friendly = parsed.error;
        }
      }
    } catch {
      // Non-JSON error message
    }

    return {
      hasError: true,
      message: friendly,
      isQuotaError,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CampusEase ErrorBoundary caught error:', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const upgradeLink = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data?openUpgradeDialog=true`;

    return (
      <div className="min-h-screen bg-[#FAF8FE] flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl bg-white border border-[#E4DCF4] p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="font-display text-xl font-bold text-[#2A1254]">
            {this.state.isQuotaError ? 'Firestore Daily Quota Reached' : 'Something went wrong'}
          </h1>
          <p className="text-sm text-[#52476A] mt-2 leading-relaxed">{this.state.message}</p>

          {this.state.isQuotaError && (
            <p className="text-xs text-[#6B5E84] mt-3 leading-relaxed">
              Free-tier daily quota resets the next day. You can review or upgrade your database in
              the{' '}
              <a
                href={upgradeLink}
                target="_blank"
                rel="noreferrer"
                className="text-[#3B1D6E] underline font-semibold"
              >
                Firebase Console
              </a>
              .
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, message: '', isQuotaError: false });
              window.location.reload();
            }}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload CampusEase</span>
          </button>
        </div>
      </div>
    );
  }
}
