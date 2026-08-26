import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth, AUTH_ENABLED } from '../../context/AuthContext';
import bransonBull from '../../assets/branson-bull-real.png';

// Gates the entire site behind a verified @branson.org Google sign-in.
// No-ops (renders the app) when VITE_AUTH_ENABLED is not "true".
export default function LoginGate({ children }) {
  const { user, loading, domainError, signInWithGoogle } = useAuth();

  if (!AUTH_ENABLED) return children;
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-branson-blue" size={28} />
      </div>
    );
  }
  if (user) return children;

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-[#003a6b] via-[#004B87] to-[#0a6aa8]">
      <div className="w-full max-w-sm text-center">
        <img src={bransonBull} alt="" className="w-20 mx-auto mb-6 drop-shadow-lg" />
        <h1 className="text-2xl font-bold text-white">Community Values Hub</h1>
        <p className="text-sky-100/80 text-sm mt-2 mb-8">
          Sign in with your <strong>@branson.org</strong> account to continue.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 bg-white text-slate-800 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          Sign in with Google
        </button>

        {domainError && (
          <p className="mt-4 text-sm text-red-200 flex items-center justify-center gap-1.5">
            <AlertCircle size={14} /> That account isn't a branson.org address. Please use your school account.
          </p>
        )}

        <p className="mt-8 text-xs text-sky-100/60 flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} /> Access is limited to Branson community members.
        </p>
      </div>
    </div>
  );
}
