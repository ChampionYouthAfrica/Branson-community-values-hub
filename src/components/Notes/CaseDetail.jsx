import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Lock, Wifi, WifiOff, Upload, Copy, Check,
  Users, Send, Pencil, Trash2, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* ── Helpers ── */
const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-600',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
  'bg-red-500', 'bg-indigo-500',
];
function authorColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}
function parseContent(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  // Legacy plain-text fallback
  return raw.trim()
    ? [{ id: 'legacy', author: 'Prior notes', text: raw, timestamp: new Date().toISOString() }]
    : [];
}
function fmtTime(ts) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
}

export default function CaseDetail() {
  const { id } = useParams();

  /* ── Case data ── */
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Passcode gate ── */
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(`case_${id}`) === 'true'
  );

  /* ── Name gate ── */
  const [nameInput, setNameInput] = useState('');
  const [authorName, setAuthorName] = useState(
    () => sessionStorage.getItem(`case_${id}_name`) || ''
  );
  const [nameConfirmed, setNameConfirmed] = useState(
    () => !!sessionStorage.getItem(`case_${id}_name`)
  );

  /* ── Entries ── */
  const [entries, setEntries] = useState([]);
  const [draftText, setDraftText] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  /* ── Status ── */
  const [connected, setConnected] = useState(false);
  const [collaborators, setCollaborators] = useState(0);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);
  const feedEndRef = useRef(null);
  const isLocalChange = useRef(false);
  const channelRef = useRef(null);

  /* ── Load case ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('cases').select('*').eq('id', id).single();
      if (data) {
        setCaseData(data);
        setEntries(parseContent(data.content));
      }
      setLoading(false);
    };
    load();
  }, [id]);

  /* ── Polling — guaranteed sync every 2s ── */
  useEffect(() => {
    if (!unlocked || !nameConfirmed) return;

    const poll = setInterval(async () => {
      if (isLocalChange.current) return; // skip while we're mid-save
      const { data } = await supabase
        .from('cases').select('content').eq('id', id).single();
      if (data) setEntries(parseContent(data.content));
    }, 2000);

    return () => clearInterval(poll);
  }, [unlocked, nameConfirmed, id]);

  /* ── Realtime broadcast (bonus — instant when websocket is alive) ── */
  useEffect(() => {
    if (!unlocked || !nameConfirmed || !caseData) return;

    const channel = supabase
      .channel(`case-${id}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'entries_update' }, ({ payload }) => {
        if (!isLocalChange.current) setEntries(payload.entries);
      })
      .on('presence', { event: 'sync' }, () => {
        setCollaborators(Object.keys(channel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          await channel.track({ user: authorName });
        } else {
          setConnected(false);
        }
      });

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [unlocked, nameConfirmed, caseData?.id, id, authorName]);

  /* ── Scroll to bottom when new entries arrive ── */
  useEffect(() => {
    if (nameConfirmed) {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries.length, nameConfirmed]);

  /* ── Save + broadcast ── */
  const saveEntries = useCallback(
    async (next) => {
      // 1. Broadcast instantly over websocket — other users see it immediately
      channelRef.current?.send({
        type: 'broadcast',
        event: 'entries_update',
        payload: { entries: next },
      });
      // 2. Persist to DB (async, doesn't block the UI)
      isLocalChange.current = true;
      await supabase
        .from('cases')
        .update({ content: JSON.stringify(next), updated_at: new Date().toISOString() })
        .eq('id', id);
      setTimeout(() => { isLocalChange.current = false; }, 600);
    },
    [id]
  );

  /* ── Handlers ── */
  const handlePasscode = (e) => {
    e.preventDefault();
    if (caseData && passcodeInput === caseData.passcode) {
      sessionStorage.setItem(`case_${id}`, 'true');
      setUnlocked(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Incorrect passcode. Try again.');
      setPasscodeInput('');
    }
  };

  const handleNameConfirm = (e) => {
    e.preventDefault();
    const name = nameInput.trim();
    if (!name) return;
    sessionStorage.setItem(`case_${id}_name`, name);
    setAuthorName(name);
    setNameConfirmed(true);
  };

  const handlePost = async () => {
    if (!draftText.trim() || posting) return;
    setPosting(true);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      author: authorName,
      text: draftText.trim(),
      timestamp: new Date().toISOString(),
    };
    const next = [...entries, entry];
    setEntries(next);
    setDraftText('');
    await saveEntries(next);
    setPosting(false);
  };

  const handleEditSave = async (entryId) => {
    const next = entries.map((e) =>
      e.id === entryId
        ? { ...e, text: editingText, editedAt: new Date().toISOString() }
        : e
    );
    setEntries(next);
    setEditingId(null);
    await saveEntries(next);
  };

  const handleDeleteEntry = async (entryId) => {
    const next = entries.filter((e) => e.id !== entryId);
    setEntries(next);
    await saveEntries(next);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const entry = {
        id: `${Date.now()}-upload`,
        author: authorName,
        text: ev.target.result,
        timestamp: new Date().toISOString(),
        uploadedFile: file.name,
      };
      const next = [...entries, entry];
      setEntries(next);
      await saveEntries(next);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyPasscode = () => {
    if (!caseData) return;
    navigator.clipboard.writeText(caseData.passcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Render: loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        Loading…
      </div>
    );
  }

  /* ── Render: not found ── */
  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link to="/notes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-branson-blue mb-6 no-underline">
          <ArrowLeft size={16} /> Back to Cases
        </Link>
        <p className="text-slate-500 dark:text-slate-400">Case not found.</p>
      </div>
    );
  }

  /* ── Render: passcode gate ── */
  if (!unlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <Link to="/notes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-branson-blue mb-6 no-underline">
            <ArrowLeft size={16} /> Back to Cases
          </Link>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-branson-blue/10 dark:bg-branson-blue/20 mb-4">
              <Lock size={28} className="text-branson-blue" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{caseData.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter the 4-digit case passcode</p>
          </div>
          <form onSubmit={handlePasscode} className="space-y-4" autoComplete="off">
            <input
              type="password"
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="• • • •"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-branson-blue"
              maxLength={4}
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore
              autoFocus
            />
            {passcodeError && <p className="text-red-500 text-sm text-center">{passcodeError}</p>}
            <button type="submit" className="w-full py-3 bg-branson-blue text-white rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer">
              Access Case
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Render: name gate ── */
  if (!nameConfirmed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-branson-green/10 dark:bg-branson-green/20 mb-4">
              <Users size={28} className="text-branson-green" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{caseData.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              What's your name? It will be attached to everything you write.
            </p>
          </div>
          <form onSubmit={handleNameConfirm} className="space-y-4">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Ms. Smith"
              className="w-full px-4 py-3 text-center text-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-branson-green"
              autoFocus
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full py-3 bg-branson-green text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
            >
              Join Case
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Render: main feed ── */
  return (
    <div
      className="max-w-3xl mx-auto px-6 py-6 flex flex-col"
      style={{ minHeight: 'calc(100vh - 80px)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <Link to="/notes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-branson-blue mb-1 no-underline">
            <ArrowLeft size={16} /> Back to Cases
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{caseData.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {collaborators > 1 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-branson-green/10 text-branson-green text-xs font-medium">
              <Users size={12} /> {collaborators} active
            </div>
          )}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${connected ? 'bg-branson-green/10 text-branson-green' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'Live' : 'Offline'}
          </div>
          <button onClick={copyPasscode} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:text-branson-blue hover:border-branson-blue/40 transition-colors cursor-pointer">
            {copied ? <><Check size={12} className="text-branson-green" /> Copied!</> : <><Copy size={12} /> Share Passcode</>}
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:text-branson-blue hover:border-branson-blue/40 transition-colors cursor-pointer">
            <Upload size={12} /> Upload Notes
          </button>
          <input ref={fileInputRef} type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {/* Document body */}
      <div className="flex-1 mb-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          {entries.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">No notes yet — add the first entry below.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {entries.map((entry) => {
                const isMe = entry.author === authorName;
                const color = authorColor(entry.author);
                const dotColors = {
                  'bg-blue-500': 'bg-blue-500',
                  'bg-purple-500': 'bg-purple-500',
                  'bg-emerald-600': 'bg-emerald-600',
                  'bg-orange-500': 'bg-orange-500',
                  'bg-pink-500': 'bg-pink-500',
                  'bg-teal-500': 'bg-teal-500',
                  'bg-red-500': 'bg-red-500',
                  'bg-indigo-500': 'bg-indigo-500',
                };
                return (
                  <div key={entry.id} className="group px-6 py-4">
                    {/* Author line */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {entry.author}
                        </span>
                        <span className="text-xs text-slate-400">{fmtTime(entry.timestamp)}</span>
                        {entry.editedAt && (
                          <span className="text-xs text-slate-400 italic">(edited)</span>
                        )}
                        {entry.uploadedFile && (
                          <span className="text-xs text-branson-blue font-medium">📎 {entry.uploadedFile}</span>
                        )}
                      </div>
                      {/* Edit/delete — only on your own entries */}
                      {isMe && entry.id !== 'legacy' && editingId !== entry.id && (
                        <div className="hidden group-hover:flex items-center gap-1">
                          <button
                            onClick={() => { setEditingId(entry.id); setEditingText(entry.text); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-branson-blue hover:bg-branson-blue/10 transition-colors cursor-pointer"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    {editingId === entry.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-branson-blue/50 rounded-lg text-sm text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-branson-blue/30 leading-relaxed"
                          rows={4}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <X size={12} /> Cancel
                          </button>
                          <button
                            onClick={() => handleEditSave(entry.id)}
                            className="px-3 py-1.5 text-xs bg-branson-blue text-white rounded-lg hover:opacity-90 cursor-pointer"
                          >
                            Save changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-slate-100 dark:border-slate-700">
                        {entry.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div ref={feedEndRef} />
        </div>
      </div>

      {/* Write area */}
      <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-950 pt-2 pb-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          {/* Author badge */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className={`w-2.5 h-2.5 rounded-full ${authorColor(authorName)}`} />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Writing as {authorName}
            </span>
          </div>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost();
            }}
            placeholder="Add your notes here…"
            className="w-full px-4 py-2 bg-transparent text-sm text-slate-700 dark:text-slate-300 resize-none focus:outline-none leading-relaxed min-h-[80px] max-h-[200px]"
            rows={3}
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-xs text-slate-400">⌘↵ to add · syncs live</span>
            <button
              onClick={handlePost}
              disabled={!draftText.trim() || posting}
              className="flex items-center gap-1.5 px-4 py-2 bg-branson-blue text-white rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
            >
              <Send size={13} /> Add to Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
