import { useState, useEffect, useRef } from 'react';
import { Lock, Upload, FileText, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import PageHero from '../Shared/PageHero';
import { extractTextFromFile } from '../../lib/extractText';
import {
  KNOWLEDGE_TARGETS,
  TARGET_LABELS,
  fetchAllKnowledge,
  addKnowledge,
  deleteKnowledge,
} from '../../lib/knowledge';

const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || '2008';

export default function AdminUpload() {
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('advisor');
  const [filename, setFilename] = useState('');
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // {type, msg}

  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (unlocked) loadDocs();
  }, [unlocked]);

  const loadDocs = async () => {
    setLoadingDocs(true);
    setDocs(await fetchAllKnowledge());
    setLoadingDocs(false);
  };

  const handleCode = (e) => {
    e.preventDefault();
    if (codeInput === ADMIN_CODE) {
      setUnlocked(true);
      setCodeError('');
    } else {
      setCodeError('Incorrect code. Please try again.');
      setCodeInput('');
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReading(true);
    setStatus(null);
    try {
      const text = await extractTextFromFile(file);
      setContent(text);
      setFilename(file.name);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
      if (!text.trim()) {
        setStatus({ type: 'error', msg: 'No text could be read from that file. You can paste the content manually below.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setReading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setStatus({ type: 'error', msg: 'A title and some content are required.' });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await addKnowledge({ title: title.trim(), content: content.trim(), target, filename });
      setStatus({ type: 'success', msg: 'Uploaded. This information is now available to the selected part(s) of the site.' });
      setTitle('');
      setContent('');
      setFilename('');
      if (fileRef.current) fileRef.current.value = '';
      loadDocs();
    } catch (err) {
      const hint = /relation .* does not exist|schema cache/i.test(err.message || '')
        ? ' — the "knowledge_uploads" table may not exist yet in Supabase. Ask your developer to create it.'
        : '';
      setStatus({ type: 'error', msg: (err.message || 'Upload failed.') + hint });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteKnowledge(id);
    loadDocs();
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Upload</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter the access code to manage site knowledge
            </p>
          </div>
          <form onSubmit={handleCode} className="space-y-4" autoComplete="off">
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Enter access code"
              className="w-full px-4 py-3 text-center text-xl tracking-widest font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-branson-blue"
              autoComplete="new-password"
              autoFocus
            />
            {codeError && <p className="text-red-500 text-sm text-center">{codeError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-branson-blue text-white rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Upload UI ── */
  return (
    <div>
      <PageHero
        title="Admin Upload"
        subtitle="Add information the site's tools will use — bylaws context, Policy Advisor knowledge, vendor guidance, and more."
      />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block uppercase tracking-wider">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DEI Philosophy Statement — J. Arauz"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-branson-blue"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block uppercase tracking-wider">Upload a file (optional)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.markdown,.csv,.json,.html,.pdf"
              onChange={handleFile}
              className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-branson-blue/10 file:text-branson-blue hover:file:bg-branson-blue/20 cursor-pointer"
            />
            <p className="text-xs text-slate-400 mt-1">
              .txt, .md, .csv, .json, or .pdf. The text is extracted below — review or edit it before saving.
              {reading && <span className="text-branson-blue"> Reading file…</span>}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block uppercase tracking-wider">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Paste or edit the information here…"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-branson-blue"
            />
            <p className="text-xs text-slate-400 mt-1">{content.length.toLocaleString()} characters</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block uppercase tracking-wider">Where should this be used? *</label>
            <div className="grid sm:grid-cols-2 gap-2">
              {KNOWLEDGE_TARGETS.map((t) => (
                <label
                  key={t.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${
                    target === t.value
                      ? 'border-branson-blue bg-branson-blue/10 text-branson-blue font-medium'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="target"
                    value={t.value}
                    checked={target === t.value}
                    onChange={() => setTarget(t.value)}
                    className="accent-branson-blue"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          {status && (
            <div className={`flex items-start gap-2 text-sm rounded-lg p-3 ${
              status.type === 'success'
                ? 'bg-branson-green/10 text-branson-green'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600'
            }`}>
              {status.type === 'success' ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
              {status.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || reading}
            className="w-full py-3 bg-branson-blue text-white rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {saving ? 'Saving…' : 'Upload'}
          </button>
        </form>

        {/* Existing uploads */}
        <div className="mt-10">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Uploaded Documents</h2>
          {loadingDocs ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 size={16} className="animate-spin" /> Loading…</div>
          ) : docs.length === 0 ? (
            <p className="text-sm text-slate-400">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-branson-blue shrink-0" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{d.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-branson-blue/10 text-branson-blue font-medium">{TARGET_LABELS[d.target] || d.target}</span>
                      <span className="ml-2">{(d.content || '').length.toLocaleString()} chars</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
