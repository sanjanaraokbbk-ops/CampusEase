import { LogIn, ShieldCheck } from 'lucide-react';

interface GoogleAuthCardProps {
  title: string;
  description: string;
  buttonLabel?: string;
  loading?: boolean;
  error?: string | null;
  onSignIn: () => void;
  compact?: boolean;
}

export function GoogleAuthCard({
  title,
  description,
  buttonLabel = 'Continue with Google',
  loading = false,
  error,
  onSignIn,
  compact = false,
}: GoogleAuthCardProps) {
  return (
    <div
      className={`rounded-2xl bg-[#FAF8FE] border border-[#E4DCF4] ${
        compact ? 'p-5' : 'p-6 sm:p-8 text-center max-w-lg mx-auto'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl bg-white border border-[#E4DCF4] text-[#3B1D6E] inline-flex items-center justify-center ${
          compact ? 'mb-3' : 'mx-auto mb-4'
        }`}
      >
        <ShieldCheck className="w-5 h-5" />
      </div>
      <h2 className="font-display text-lg font-bold text-[#2A1254]">{title}</h2>
      <p className="text-sm text-[#52476A] mt-1.5 leading-relaxed">{description}</p>

      {error && (
        <p className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-left">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={onSignIn}
        className={`mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer ${
          compact ? 'w-full' : ''
        }`}
      >
        <LogIn className="w-4 h-4" />
        <span>{loading ? 'Signing in...' : buttonLabel}</span>
      </button>

      <p className="text-[11px] text-[#6B5E84] mt-3">
        Secured with Firebase Authentication · Syncs your orders &amp; bookings across devices
      </p>
    </div>
  );
}
