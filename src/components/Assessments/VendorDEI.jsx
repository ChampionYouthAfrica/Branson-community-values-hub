import { useState, useRef } from 'react';
import { ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VENDOR_DEI_QUESTIONS, VENDOR_SERVICES } from './assessmentData';
import MatrixQuestion from './MatrixQuestion';
import AutoResearch from './AutoResearch';
import ScoreCard from './ScoreCard';
import useAIScoring from './useAIScoring';

export default function VendorDEI() {
  const [answers, setAnswers] = useState({});
  const [confidence, setConfidence] = useState({});
  const [autoFilled, setAutoFilled] = useState(false);
  const [sources, setSources] = useState([]);
  const [fields, setFields] = useState({
    email: '',
    vendorName: '',
    vendorEmail: '',
    vendorDescription: '',
    budgetManager: '',
    otherService: '',
  });
  const [services, setServices] = useState([]);
  const resultRef = useRef(null);
  const { isScoring, scoreResult, scoreError, scoreForm } = useAIScoring();

  const answered = Object.keys(answers).length;
  const total = VENDOR_DEI_QUESTIONS.length;
  const progress = Math.round((answered / total) * 100);

  const handleAutoFill = (result) => {
    if (result.answers) {
      setAnswers(result.answers);
    }
    if (result.confidence) {
      setConfidence(result.confidence);
    }
    if (result.sources) {
      setSources(result.sources);
    }
    if (result.companyInfo) {
      setFields((prev) => ({
        ...prev,
        vendorEmail: result.companyInfo.email || prev.vendorEmail,
        vendorDescription: result.companyInfo.description || prev.vendorDescription,
      }));
    }
    setAutoFilled(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await scoreForm('Vendor DEI Rubric', VENDOR_DEI_QUESTIONS, answers,
      `Vendor: ${fields.vendorName}\nDescription: ${fields.vendorDescription}`);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/assessments" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-branson-blue mb-6 no-underline">
        <ArrowLeft size={16} /> Back to Assessments
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">RFP for Vendors DEI Rubric</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Evaluate vendor DEI practices. Complete the form and receive an AI-powered score with recommendations.
      </p>

      <AutoResearch
        formType="vendor-dei"
        questions={VENDOR_DEI_QUESTIONS}
        onAutoFill={handleAutoFill}
      />

      {autoFilled && (
        <div className="rounded-xl border border-branson-green/30 bg-branson-green/5 p-4 mb-6 space-y-2">
          <div className="flex items-center gap-2 text-branson-green text-sm font-semibold">
            <CheckCircle size={16} />
            DEI questions auto-filled by AI research
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 ml-6">
            The assessment questions below were filled based on web research. Questions marked with a <span className="inline-block w-3 h-3 rounded border-2 border-yellow-400 align-middle mx-0.5" /> yellow border had low confidence — please double-check those.
          </p>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 ml-6">
            &#9998; <strong>You still need to fill in the Vendor Information section manually.</strong>
          </p>
        </div>
      )}

      {/* Vendor info — manual input required */}
      {autoFilled && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">&#9998; Manual Input Required</span>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Progress</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{answered}/{total} questions</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-branson-green rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Info fields */}
        <div className="space-y-4 mb-8 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Vendor Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Vendor Business Name *</label>
              <input type="text" required value={fields.vendorName} onChange={(e) => setFields({ ...fields, vendorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Vendor Email Contact *</label>
              <input type="email" required value={fields.vendorEmail} onChange={(e) => setFields({ ...fields, vendorEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Vendor Service Description *</label>
              <input type="text" required value={fields.vendorDescription} onChange={(e) => setFields({ ...fields, vendorDescription: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Budget Manager</label>
              <input type="text" value={fields.budgetManager} onChange={(e) => setFields({ ...fields, budgetManager: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Your Email *</label>
              <input type="email" required value={fields.email} onChange={(e) => setFields({ ...fields, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Vendor Business Service</label>
            <div className="flex flex-wrap gap-2">
              {VENDOR_SERVICES.map((svc) => (
                <label key={svc} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${services.includes(svc) ? 'border-branson-blue bg-branson-blue/10 text-branson-blue font-medium' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  <input type="checkbox" checked={services.includes(svc)} onChange={() => setServices(services.includes(svc) ? services.filter((s) => s !== svc) : [...services, svc])} className="sr-only" />
                  {svc}
                </label>
              ))}
              <div className="flex items-center gap-2">
                <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${services.includes('Other') ? 'border-branson-blue bg-branson-blue/10 text-branson-blue font-medium' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                  <input type="checkbox" checked={services.includes('Other')} onChange={() => setServices(services.includes('Other') ? services.filter((s) => s !== 'Other') : [...services, 'Other'])} className="sr-only" />
                  Other:
                </label>
                {services.includes('Other') && (
                  <input type="text" value={fields.otherService} onChange={(e) => setFields({ ...fields, otherService: e.target.value })}
                    placeholder="Specify..." className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-32" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Questions */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">DEI Assessment</h2>
          {autoFilled && (
            <span className="text-xs font-medium text-branson-green bg-branson-green/10 px-2 py-0.5 rounded-full">Auto-filled by AI</span>
          )}
        </div>
        <div className="space-y-3 mb-8">
          {VENDOR_DEI_QUESTIONS.map((q, i) => (
            <MatrixQuestion
              key={i}
              index={i}
              question={q}
              value={answers[`q${i + 1}`]}
              confidence={confidence[`q${i + 1}`]}
              onChange={(val) => setAnswers({ ...answers, [`q${i + 1}`]: val })}
            />
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={answered < total || isScoring}
          className="w-full py-3 bg-branson-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 transition-opacity"
        >
          {isScoring ? (
            <><Loader2 size={18} className="animate-spin" /> Scoring...</>
          ) : (
            <><Send size={16} /> Submit for AI Scoring</>
          )}
        </button>

        {scoreError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-sm">{scoreError}</div>
        )}

        <div ref={resultRef}>
          <ScoreCard result={scoreResult} />
        </div>
      </form>
    </div>
  );
}
