import { useState } from 'react';
import { Loader2, ShieldCheck, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { useAuth, AUTH_ENABLED } from '../../context/AuthContext';
import bransonBull from '../../assets/branson-bull-real.png';

// Gates the entire site behind an emailed login link sent only to @branson.org
// addresses. No-ops (renders the app) when VITE_AUTH_ENABLED is not "true".
export default function LoginGate({ children }) {
  const { user, loading, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!AUTH_ENABLED) return children;
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-branson-blue" size={28} />
      </div>
    );
  }
  if (user) return children;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    const { error: err } = await signInWithEmail(email);
    setSending(false);
    if (err) setError(err);
    else setSent(true);
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-[#003a6b] via-[#004B87] to-[#0a6aa8]">
      <div className="w-full max-w-sm text-center">
        <img src={bransonBull} alt="" className="w-20 mx-auto mb-6 drop-shadow-lg" />
        <h1 className="text-2xl font-bold text-white">Community Values Hub</h1>

        {sent ? (
          <div className="mt-8 bg-white/10 ring-1 ring-white/20 rounded-2xl p-6 backdrop-blur">
            <CheckCircle size={32} className="text-branson-green mx-auto mb-3" />
            <p className="text-white font-semibold">Check your inbox</p>
            <p className="text-sky-100/80 text-sm mt-2">
              We sent a login link to <strong className="text-white break-all">{email.trim().toLowerCase()}</strong>.
              Open it on this device to sign in.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="mt-4 text-xs text-sky-200/80 underline hover:text-white"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <p className="text-sky-100/80 text-sm mt-2 mb-8">
              Enter your <strong>@branson.org</strong> email to receive a secure login link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@branson.org"
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-800 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer shadow-lg disabled:opacity-60"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                {sending ? 'Sending…' : 'Send login link'}
              </button>
            </form>
            {error && (
              <p className="mt-4 text-sm text-red-200 flex items-center justify-center gap-1.5">
                <AlertCircle size={14} /> {error}
              </p>
            )}
          </>
        )}

        <p className="mt-8 text-xs text-sky-100/60 flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} /> Access is limited to Branson community members.
        </p>
      </div>
    </div>
  );
}
