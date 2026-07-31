import { useState, useEffect, useRef } from 'react';
import { Lock, Upload, FileText, Trash2, Loader2, CheckCircle, AlertCircle, Sparkles, Eye } from 'lucide-react';
import PageHero from '../Shared/PageHero';
import { extractTextFromFile } from '../../lib/extractText';
import {
  KNOWLEDGE_TARGETS,
  TARGET_LABELS,
  fetchAllKnowledge,
  addKnowledge,
  deleteKnowledge,
} from '../../lib/knowledge';
import { structureBylaws, structureQuickReference, structureVendorRubric } from '../../lib/aiStructure';
import { fetchAdditions, fetchAllAdditions, addAddition, deleteAddition } from '../../lib/contentAdditions';
import bylawsData from '../../data/bylaws-content.json';
import { contacts, calendarEvents, resources } from '../../data/quickReferenceData';
import { VENDOR_DEI_QUESTIONS } from '../Assessments/assessmentData';

const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || '2008';

// Targets that make physical, structured changes to the site (with an
// AI-generated preview you approve) rather than just storing AI context.
const STRUCTURED_TARGETS = {
  bylaws: 'the Bylaws page',
  'quick-reference': 'the Quick Reference page',
  vendor: 'the Vendor DEI Rubric',
};

// Shared input styling for preview editors.
const inp = 'w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm';

// Header label for a preview item, by target kind.
function previewLabel(kind, s) {
  if (kind === 'bylaws') {
    return s.placement === 'new-article'
      ? `New article: ${s.newArticleTitle || '(untitled)'}`
      : `Add to Article ${s.articleNumber} — ${s.articleTitle}`;
  }
  if (kind === 'quick-reference') {
    const map = { contact: 'New reporting contact', event: 'New calendar event', resource: 'New external resource' };
    return map[s.kind] || 'New entry';
  }
  if (kind === 'vendor') return 'New rubric criterion';
  return 'New item';
}

// Label for a published addition in the list, by target.
function additionLabel(a) {
  const d = a.data || {};
  if (a.target === 'bylaws') return `${d.number || ''} ${d.title || ''}`.trim() || 'Bylaw section';
  if (a.target === 'quick-reference') return d.name || d.detail || 'Quick Reference entry';
  if (a.target === 'vendor') return d.question || 'Rubric criterion';
  return d.title || 'Addition';
}

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

  // Bylaws (structured) preview → publish flow
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null); // { sections:[...], skipped:[...] }
  const [publishing, setPublishing] = useState(false);
  const [additions, setAdditions] = useState([]);

  const isStructured = !!STRUCTURED_TARGETS[target];

  useEffect(() => {
    if (unlocked) { loadDocs(); loadAdditions(); }
  }, [unlocked]);

  // Clear a stale preview when the target changes.
  useEffect(() => { setPreview(null); }, [target]);

  const loadDocs = async () => {
    setLoadingDocs(true);
    setDocs(await fetchAllKnowledge());
    setLoadingDocs(false);
  };

  const loadAdditions = async () => {
    setAdditions(await fetchAllAdditions());
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

  const validate = () => {
    if (!title.trim()) {
      setStatus({ type: 'error', msg: 'Please add a title.' });
      return false;
    }
    if (!content.trim()) {
      setStatus({
        type: 'error',
        msg: filename
          ? `No text could be read from "${filename}". Paste the content into the box below, then continue.`
          : 'Add some content — either paste text or choose a file to read it in.',
      });
      return false;
    }
    return true;
  };

  // AI-context targets (advisor, vendor, etc.): store raw text.
  const handleSaveKnowledge = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setStatus(null);
    try {
      await addKnowledge({ title: title.trim(), content: content.trim(), target, filename });
      setStatus({ type: 'success', msg: 'Uploaded. This information is now available to the selected part(s) of the site.' });
      resetForm();
      loadDocs();
    } catch (err) {
      const hint = /relation .* does not exist|schema cache/i.test(err.message || '')
        ? ' — the "knowledge_uploads" table may not exist yet in Supabase.'
        : '';
      setStatus({ type: 'error', msg: (err.message || 'Upload failed.') + hint });
    } finally {
      setSaving(false);
    }
  };

  // Structured targets: AI drafts deduped items for you to review before publishing.
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setGenerating(true);
    setStatus(null);
    setPreview(null);
    try {
      let items = [];
      let skipped = [];
      if (target === 'bylaws') {
        const r = await structureBylaws(content.trim(), bylawsData);
        items = r.sections; skipped = r.skipped;
      } else if (target === 'quick-reference') {
        const r = await structureQuickReference(content.trim(), { contacts, calendarEvents, resources });
        items = r.items; skipped = r.skipped;
      } else if (target === 'vendor') {
        const r = await structureVendorRubric(content.trim(), VENDOR_DEI_QUESTIONS);
        items = r.items; skipped = r.skipped;
      }
      if (!items.length) {
        setStatus({ type: 'success', msg: 'The AI found nothing new to add — everything in this document appears to already be covered.' });
      }
      setPreview({ kind: target, items, skipped });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Could not generate a preview.' });
    } finally {
      setGenerating(false);
    }
  };

  const updatePreviewField = (idx, field, value) => {
    setPreview((p) => {
      const items = p.items.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
      return { ...p, items };
    });
  };

  const toggleInclude = (idx) => {
    setPreview((p) => {
      const items = p.items.map((s, i) => (i === idx ? { ...s, _exclude: !s._exclude } : s));
      return { ...p, items };
    });
  };

  const handlePublish = async () => {
    const toPublish = preview.items.filter((s) => !s._exclude);
    if (!toPublish.length) {
      setStatus({ type: 'error', msg: 'Nothing selected to publish.' });
      return;
    }
    setPublishing(true);
    setStatus(null);
    try {
      for (const s of toPublish) {
        const { _exclude, note, ...data } = s;
        await addAddition({ target: preview.kind, data, source_title: title.trim() });
      }
      setStatus({ type: 'success', msg: `Published ${toPublish.length} item(s) to ${STRUCTURED_TARGETS[preview.kind]}.` });
      setPreview(null);
      resetForm();
      loadAdditions();
    } catch (err) {
      const hint = /relation .* does not exist|schema cache/i.test(err.message || '')
        ? ' — the "content_additions" table may not exist yet in Supabase.'
        : '';
      setStatus({ type: 'error', msg: (err.message || 'Publish failed.') + hint });
    } finally {
      setPublishing(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setFilename('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDeleteAddition = async (id) => {
    await deleteAddition(id);
    loadAdditions();
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
        <form onSubmit={isStructured ? handleGenerate : handleSaveKnowledge} className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
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
              accept=".txt,.md,.markdown,.csv,.json,.html,.pdf,.docx"
              onChange={handleFile}
              className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-branson-blue/10 file:text-branson-blue hover:file:bg-branson-blue/20 cursor-pointer"
            />
            <p className="text-xs text-slate-400 mt-1">
              .txt, .md, .csv, .json, .pdf, or .docx. The text is extracted into the box below — you can also just paste content directly instead of uploading a file.
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
            <p className="text-xs text-slate-400 mt-2">
              {isStructured
                ? `This target makes real changes to ${STRUCTURED_TARGETS[target]}. The AI will draft new, de-duplicated sections and show you a preview to edit and publish.`
                : 'This information is stored as context for the AI (e.g. the Policy Advisor or assessment grader) — it does not change the visible pages.'}
            </p>
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
            disabled={saving || reading || generating}
            className="w-full py-3 bg-branson-blue text-white rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isStructured ? (
              generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />
            ) : saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {isStructured
              ? generating ? 'Generating preview…' : 'Generate preview'
              : saving ? 'Saving…' : 'Upload'}
          </button>
        </form>

        {/* Structured preview → publish */}
        {isStructured && preview && preview.items.length > 0 && (
          <div className="mt-6 bg-white dark:bg-slate-900 border-2 border-branson-blue/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Eye size={18} className="text-branson-blue" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Preview — new additions</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Review and edit below. Uncheck anything you don't want. When you publish, these render on {STRUCTURED_TARGETS[preview.kind]} just like existing content.
            </p>

            {preview.skipped?.length > 0 && (
              <div className="mb-5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <span className="font-semibold">Skipped as already covered:</span>
                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                  {preview.skipped.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {preview.items.map((s, i) => (
                <div key={i} className={`rounded-xl border p-4 transition-all ${s._exclude ? 'border-slate-200 dark:border-slate-700 opacity-50' : 'border-branson-blue/30 bg-branson-blue/[0.03]'}`}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white cursor-pointer mb-3">
                    <input type="checkbox" checked={!s._exclude} onChange={() => toggleInclude(i)} className="accent-branson-blue" />
                    {previewLabel(preview.kind, s)}
                  </label>

                  {preview.kind === 'bylaws' && (
                    <>
                      <div className="grid sm:grid-cols-[5rem_1fr] gap-2 mb-2">
                        <input value={s.number || ''} onChange={(e) => updatePreviewField(i, 'number', e.target.value)} placeholder="No." className={inp} />
                        <input value={s.title || ''} onChange={(e) => updatePreviewField(i, 'title', e.target.value)} placeholder="Section title" className={`${inp} font-semibold`} />
                      </div>
                      {['technical', 'standard', 'simplePlain'].map((f) => (
                        <div key={f} className="mb-2">
                          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{f === 'simplePlain' ? 'plain language' : f}</label>
                          <textarea value={s[f] || ''} onChange={(e) => updatePreviewField(i, f, e.target.value)} rows={f === 'simplePlain' ? 2 : 3} className={`${inp} leading-relaxed`} />
                        </div>
                      ))}
                    </>
                  )}

                  {preview.kind === 'quick-reference' && (
                    <div className="space-y-2">
                      {s.kind === 'contact' && (
                        <div className="grid sm:grid-cols-3 gap-2">
                          <input value={s.name || ''} onChange={(e) => updatePreviewField(i, 'name', e.target.value)} placeholder="Name" className={inp} />
                          <input value={s.role || ''} onChange={(e) => updatePreviewField(i, 'role', e.target.value)} placeholder="Role / title" className={inp} />
                          <input value={s.email || ''} onChange={(e) => updatePreviewField(i, 'email', e.target.value)} placeholder="Email" className={inp} />
                        </div>
                      )}
                      {s.kind === 'event' && (
                        <div className="grid sm:grid-cols-[5rem_1fr] gap-2">
                          <input value={s.month || ''} onChange={(e) => updatePreviewField(i, 'month', e.target.value)} placeholder="Mon" className={inp} />
                          <input value={s.detail || ''} onChange={(e) => updatePreviewField(i, 'detail', e.target.value)} placeholder="Event" className={inp} />
                        </div>
                      )}
                      {s.kind === 'resource' && (
                        <div className="grid sm:grid-cols-3 gap-2">
                          <input value={s.name || ''} onChange={(e) => updatePreviewField(i, 'name', e.target.value)} placeholder="Name" className={inp} />
                          <input value={s.detail || ''} onChange={(e) => updatePreviewField(i, 'detail', e.target.value)} placeholder="Phone / detail" className={inp} />
                          <input value={s.url || ''} onChange={(e) => updatePreviewField(i, 'url', e.target.value)} placeholder="URL (optional)" className={inp} />
                        </div>
                      )}
                    </div>
                  )}

                  {preview.kind === 'vendor' && (
                    <textarea value={s.question || ''} onChange={(e) => updatePreviewField(i, 'question', e.target.value)} rows={2} placeholder="Rubric criterion" className={`${inp} leading-relaxed`} />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="mt-5 w-full py-3 bg-branson-green text-white rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {publishing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {publishing ? 'Publishing…' : `Publish to ${STRUCTURED_TARGETS[preview.kind]}`}
            </button>
          </div>
        )}

        {/* Published additions (all structured targets) */}
        {additions.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Published Additions</h2>
            <div className="space-y-2">
              {additions.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{additionLabel(a)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-branson-blue/10 text-branson-blue font-medium">{STRUCTURED_TARGETS[a.target] || a.target}</span>
                    </p>
                  </div>
                  <button onClick={() => handleDeleteAddition(a.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer shrink-0" title="Remove from site">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
