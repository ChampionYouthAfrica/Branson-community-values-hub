import { useState, useRef } from 'react';
import { ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DIETARY_QUESTIONS } from './assessmentData';
import MatrixQuestion from './MatrixQuestion';
import AutoResearch from './AutoResearch';
import ScoreCard from './ScoreCard';
import useAIScoring from './useAIScoring';

export default function DietaryEquity() {
  const [answers, setAnswers] = useState({});
  const [confidence, setConfidence] = useState({});
  const [autoFilled, setAutoFilled] = useState(false);
  const resultRef = useRef(null);
  const { isScoring, scoreResult, scoreError, scoreForm } = useAIScoring();

  const answered = Object.keys(answers).length;
  const total = DIETARY_QUESTIONS.length;
  const progress = Math.round((answered / total) * 100);

  const handleAutoFill = (result) => {
    if (result.answers) setAnswers(result.answers);
    if (result.confidence) setConfidence(result.confidence);
    setAutoFilled(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await scoreForm('Vendor Equity Dietary Considerations', DIETARY_QUESTIONS, answers);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/assessments" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-branson-blue mb-6 no-underline">
        <ArrowLeft size={16} /> Back to Assessments
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Vendor Equity Dietary Considerations</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        This form is designed to assist in identifying how to be most inclusive to all people when providing nutrition.
        Once completed, the form will be scored by AI with recommendations.
      </p>

      <AutoResearch
        formType="dietary"
        questions={DIETARY_QUESTIONS}
        onAutoFill={handleAutoFill}
      />

      {autoFilled && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-branson-green/10 border border-branson-green/30 text-branson-green text-sm font-medium mb-6">
          <CheckCircle size={16} />
          Auto-filled by AI research. Review answers before submitting for final scoring.
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
        <div className="space-y-3 mb-8">
          {DIETARY_QUESTIONS.map((q, i) => (
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
