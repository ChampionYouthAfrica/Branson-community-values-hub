import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Wifi, WifiOff, Upload, Copy, Check, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CaseDetail() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(`case_${id}`) === 'true'
  );
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [connected, setConnected] = useState(false);
  const [collaborators, setCollaborators] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef(null);
  const isLocalChange = useRef(false);
  const fileInputRef = useRef(null);

  /* ── Load case data ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();
      if (data) {
        setCaseData(data);
        setContent(data.content || '');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  /* ── Realtime subscription (only after unlock) ── */
  useEffect(() => {
    if (!unlocked || !caseData) return;

    const channel = supabase
      .channel(`case-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cases', filter: `id=eq.${id}` },
        (payload) => {
          if (!isLocalChange.current) {
            setContent(payload.new.content || '');
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCollaborators(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          await channel.track({ user: Math.random().toString(36).substring(2, 9) });
        } else {
          setConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [unlocked, caseData, id]);

  /* ── Save helper (debounced) ── */
  const saveContent = useCallback(
    async (text) => {
      isLocalChange.current = true;
      setSaving(true);
      await supabase
        .from('cases')
        .update({ content: text, updated_at: new Date().toISOString() })
        .eq('id', id);
      setSaving(false);
      setLastSaved(new Date());
      setTimeout(() => {
        isLocalChange.current = false;
      }, 600);
    },
    [id]
  );

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveContent(val), 800);
  };

  /* ── Passcode check ── */
  const handlePasscode = (e) => {
    e.preventDefault();
    if (caseData && input === caseData.passcode) {
      sessionStorage.setItem(`case_${id}`, 'true');
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect passcode. Try again.');
      setInput('');
    }
  };

  /* ── File upload ── */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const uploaded = ev.target.result;
      const separator = `\n\n─── Uploaded from: ${file.name} ───\n\n`;
      const newContent = content ? content + separator + uploaded : uploaded;
      setContent(newContent);
      saveContent(newContent);
    };
    reader.readAsText(file);
    // Reset input so same file can be uploaded again
    e.target.value = '';
  };

  /* ── Copy passcode ── */
  const copyPasscode = () => {
    if (caseData) {
      navigator.clipboard.writeText(caseData.passcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ── States ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        Loading…
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link
          to="/notes"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-branson-blue mb-6 no-underline"
        >
          <ArrowLeft size={16} /> Back to Cases
        </Link>
        <p className="text-slate-500 dark:text-slate-400">Case not found.</p>
      </div>
    );
  }

  /* ── Passcode gate ── */
  if (!unlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <Link
            to="/notes"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-branson-blue mb-6 no-underline"
          >
            <ArrowLeft size={16} /> Back to Cases
          </Link>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-branson-blue/10 dark:bg-branson-blue/20 mb-4">
              <Lock size={28} className="text-branson-blue" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{caseData.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter the 4-digit case passcode
            </p>
          </div>
          <form onSubmit={handlePasscode} className="space-y-4">
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="• • • •"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-branson-blue"
              maxLength={4}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-branson-blue text-white rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Access Case
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Editor ── */
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header row */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <Link
            to="/notes"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-branson-blue mb-1 no-underline"
          >
            <ArrowLeft size={16} /> Back to Cases
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{caseData.title}</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Active collaborators */}
          {collaborators > 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-branson-green/10 text-branson-green text-xs font-medium">
              <Users size={12} />
              {collaborators} editing
            </div>
          )}

          {/* Live indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              connected
                ? 'bg-branson-green/10 text-branson-green'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'Live' : 'Offline'}
          </div>

          {/* Save status */}
          <span className="text-xs text-slate-400 min-w-[80px] text-right">
            {saving
              ? 'Saving…'
              : lastSaved
              ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : ''}
          </span>

          {/* Share passcode */}
          <button
            onClick={copyPasscode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:text-branson-blue hover:border-branson-blue/40 transition-colors cursor-pointer"
          >
            {copied ? (
              <><Check size={12} className="text-branson-green" /> Copied!</>
            ) : (
              <><Copy size={12} /> Share Passcode</>
            )}
          </button>

          {/* Upload notes */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:text-branson-blue hover:border-branson-blue/40 transition-colors cursor-pointer"
          >
            <Upload size={12} /> Upload Notes
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder={`Start taking notes here…\n\nChanges save automatically every second and sync live with anyone else in this case.`}
        className="w-full min-h-[65vh] px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-branson-blue/30 leading-relaxed"
        spellCheck
      />

      <p className="text-xs text-slate-400 mt-2 text-center">
        Auto-saves every second · Syncs live · Upload .txt or .md files to append prior notes
      </p>
    </div>
  );
}
