import { useState, useRef } from 'react';
import { ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FOOD_PURCHASING_CHECKBOXES } from './assessmentData';
import AutoResearch from './AutoResearch';
import ScoreCard from './ScoreCard';
import useAIScoring from './useAIScoring';

export default function FoodPurchasing() {
  const [checked, setChecked] = useState([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const [fields, setFields] = useState({
    budgetManager: '',
    vendorName: '',
    totalCost: '',
    eventName: '',
    targetAudience: '',
    additionalExplanation: '',
  });
  const resultRef = useRef(null);
  const { isScoring, scoreResult, scoreError, scoreCheckboxForm } = useAIScoring();

  const progress = Math.round((checked.length / FOOD_PURCHASING_CHECKBOXES.length) * 100);

  const toggleCheck = (idx) => {
    setChecked(checked.includes(idx) ? checked.filter((i) => i !== idx) : [...checked, idx]);
  };

  const handleAutoFill = (result) => {
    // For checkbox forms, auto-research maps answers to checked items
    if (result.answers) {
      const newChecked = [];
      Object.entries(result.answers).forEach(([key, val]) => {
        const idx = parseInt(key.replace('q', '')) - 1;
        if (val === 'policy' || val === 'practice' || val === 'working') {
          newChecked.push(idx);
        }
      });
      setChecked(newChecked);
    }
    if (result.companyInfo) {
      setFields((prev) => ({
        ...prev,
        vendorName: result.companyInfo.description ? prev.vendorName : prev.vendorName,
      }));
    }
    setAutoFilled(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const extra = `Vendor: ${fields.vendorName}\nEvent: ${fields.eventName}\nAudience: ${fields.targetAudience}\nAdditional context: ${fields.additionalExplanation}`;
    await scoreCheckboxForm('Food Purchasing Analysis', FOOD_PURCHASING_CHECKBOXES, checked, extra);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/assessments" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-branson-blue mb-6 no-underline">
        <ArrowLeft size={16} /> Back to Assessments
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Food Purchasing Analysis</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Branson strives to use sustainable practices, inclusive to people and planet, in the vendors we work with and the food we provide on campus and at school events.
      </p>

      <AutoResearch
        formType="food-purchasing"
        questions={FOOD_PURCHASING_CHECKBOXES}
        onAutoFill={handleAutoFill}
      />

      {autoFilled && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-branson-green/10 border border-branson-green/30 text-branson-green text-sm font-medium mb-6">
          <CheckCircle size={16} />
          Auto-filled by AI research. Review answers before submitting for final scoring.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Info fields */}
        <div className="space-y-4 mb-8 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Event & Vendor Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Vendor Business Name *</label>
              <input type="text" required value={fields.vendorName} onChange={(e) => setFields({ ...fields, vendorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Total Cost *</label>
              <input type="text" required value={fields.totalCost} onChange={(e) => setFields({ ...fields, totalCost: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Event Name *</label>
              <input type="text" required value={fields.eventName} onChange={(e) => setFields({ ...fields, eventName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Target Audience *</label>
              <input type="text" required value={fields.targetAudience} onChange={(e) => setFields({ ...fields, targetAudience: e.target.value })}
                placeholder="families, students, educators, etc." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Budget Manager</label>
              <input type="text" value={fields.budgetManager} onChange={(e) => setFields({ ...fields, budgetManager: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">Dietary Considerations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            In planning and sourcing the food for this event, have you considered the following for all participants? Check all that apply.
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Considerations checked</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{checked.length}/{FOOD_PURCHASING_CHECKBOXES.length}</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-branson-green rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            {FOOD_PURCHASING_CHECKBOXES.map((item, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  checked.includes(i)
                    ? 'border-branson-green/40 bg-branson-green/5 dark:border-branson-green/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                  checked.includes(i)
                    ? 'border-branson-green bg-branson-green'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {checked.includes(i) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={checked.includes(i)} onChange={() => toggleCheck(i)} className="sr-only" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional explanation */}
        <div className="mb-8 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
            Additional explanation of your answers above *
          </label>
          <textarea
            required
            rows={4}
            value={fields.additionalExplanation}
            onChange={(e) => setFields({ ...fields, additionalExplanation: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none"
            placeholder="Provide any additional context about your food sourcing decisions..."
          />
        </div>

        <button
          type="submit"
          disabled={isScoring}
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
