import { useState, useEffect } from 'react';
import PageHero from '../Shared/PageHero';
import { useNavigate } from 'react-router-dom';
import { Lock, Plus, FileText, Copy, Check, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateSalt, hashPasscode } from '../../lib/notesCrypto';
import { redactNames } from '../../lib/redact';

const MASTER_CODE = import.meta.env.VITE_NOTES_MASTER_CODE || '1234';

export default function Notes() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false); // always locked on page load — must enter from memory
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewCase, setShowNewCase] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCasePasscode, setNewCasePasscode] = useState('');
  const [newCaseCustomCode, setNewCaseCustomCode] = useState('');
  const [newCaseId, setNewCaseId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [copied, setCopied] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (unlocked) loadCases();
  }, [unlocked]);

  const loadCases = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    setCases(data || []);
    setLoading(false);
  };

  const handleMasterCode = (e) => {
    e.preventDefault();
    if (input === MASTER_CODE) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect code. Try again.');
      setInput('');
    }
  };

  const handleNewCase = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    if (newCaseCustomCode.length !== 4 || !/^\d{4}$/.test(newCaseCustomCode)) {
      setCodeError('Passcode must be exactly 4 digits.');
      return;
    }
    setCodeError('');
    setCreating(true);
    // Never store the passcode in plaintext: store only a validation hash + salt.
    // The passcode itself becomes the encryption key and is shared out-of-band.
    const salt = generateSalt();
    const passcode_hash = await hashPasscode(newCaseCustomCode, salt);
    // Strip personal names from the title (it is shown in the case list).
    const safeTitle = await redactNames(newCaseTitle);
    const { data, error: insertError } = await supabase
      .from('cases')
      .insert([{ title: safeTitle, passcode: null, passcode_hash, salt, content: '' }])
      .select()
      .single();
    if (!insertError && data) {
      setCases((prev) => [data, ...prev]);
      setNewCasePasscode(newCaseCustomCode);
      setNewCaseId(data.id);
    } else if (insertError) {
      setCodeError(insertError.message || 'Could not create the case.');
    }
    setCreating(false);
  };

  const handleDeleteCase = async (id) => {
    if (!supabase) return;
    await supabase.from('cases').delete().eq('id', id);
    setCases((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const openNewCaseModal = () => {
    setShowNewCase(true);
    setNewCasePasscode('');
    setNewCaseTitle('');
    setNewCaseCustomCode('');
    setNewCaseId(null);
    setCodeError('');
  };

  const closeNewCaseModal = () => {
    setShowNewCase(false);
    setNewCasePasscode('');
    setNewCaseTitle('');
    setNewCaseCustomCode('');
    setNewCaseId(null);
    setCodeError('');
  };

  /* ── Lock screen ── */
  if (!unlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-branson-blue/10 dark:bg-branson-blue/20 mb-4">
              <Lock size={28} className="text-branson-blue" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Case Notes</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter the master access code to continue
            </p>
          </div>
          <form onSubmit={handleMasterCode} className="space-y-4" autoComplete="off">
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter master code"
              className="w-full px-4 py-3 text-center text-xl tracking-widest font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-branson-blue"
              maxLength={8}
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore
              autoFocus
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-branson-blue text-white rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Access Notes
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Case list ── */
  return (
    <div>
      <PageHero
        title="Case Notes"
        subtitle="Collaborative, passcode-protected case documentation"
      />
      <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-end mb-6">
        <button
          onClick={openNewCaseModal}
          className="flex items-center gap-2 px-4 py-2 bg-branson-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus size={16} /> New Case
        </button>
      </div>

      {/* New Case Modal */}
      {showNewCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            {!newCasePasscode ? (
              <>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Case</h2>
                <form onSubmit={handleNewCase} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                      Case Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCaseTitle}
                      onChange={(e) => setNewCaseTitle(e.target.value)}
                      placeholder="e.g. Incident Report – May 2025"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-branson-blue"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                      4-Digit Case Passcode *
                    </label>
                    <p className="text-xs text-slate-400 mb-2">Choose a code to share only with teachers who need access to this case.</p>
                    <input
                      type="password"
                      required
                      value={newCaseCustomCode}
                      onChange={(e) => { setNewCaseCustomCode(e.target.value.replace(/\D/g, '').slice(0, 4)); setCodeError(''); }}
                      placeholder="• • • •"
                      className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-branson-blue ${codeError ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                      maxLength={4}
                    />
                    {codeError && <p className="text-red-500 text-xs mt-1">{codeError}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeNewCaseModal}
                      className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 py-2 bg-branson-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                    >
                      {creating ? 'Creating…' : 'Create'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-branson-green/10 mb-3">
                  <Check size={24} className="text-branson-green" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Case Created!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                  Share this passcode with teachers who need access
                </p>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="text-4xl font-mono font-bold text-branson-blue tracking-widest">
                    {newCasePasscode}
                  </div>
                  <button
                    onClick={() => copyToClipboard(newCasePasscode, 'new-passcode')}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copied === 'new-passcode'
                      ? <Check size={16} className="text-branson-green" />
                      : <Copy size={16} className="text-slate-500" />}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeNewCaseModal}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => { closeNewCaseModal(); navigate(`/notes/${newCaseId}`); }}
                    className="flex-1 py-2 bg-branson-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Open Case
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cases list */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading cases…</div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No cases yet. Create your first case above.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-branson-blue/40 hover:shadow-sm transition-all group"
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => navigate(`/notes/${c.id}`)}
              >
                <div className="w-10 h-10 rounded-xl bg-branson-blue/10 dark:bg-branson-blue/20 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-branson-blue" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{c.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={11} className="text-slate-400" />
                    <span className="text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                    <Lock size={11} className="text-slate-400" />
                    <span className="text-xs text-slate-400">Passcode protected</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                {deleteConfirm === c.id ? (
                  <>
                    <span className="text-xs text-red-500 mr-1">Delete?</span>
                    <button
                      onClick={() => handleDeleteCase(c.id)}
                      className="px-2.5 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(c.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ArrowRight
                  size={16}
                  className="text-slate-300 dark:text-slate-600 group-hover:text-branson-blue transition-colors cursor-pointer"
                  onClick={() => navigate(`/notes/${c.id}`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
