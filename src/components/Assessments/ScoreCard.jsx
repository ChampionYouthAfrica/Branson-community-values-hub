import { ChevronDown, ChevronUp, TrendingUp, AlertTriangle, Award } from 'lucide-react';
import { useState } from 'react';
import { getScoreColor } from './assessmentData';

export default function ScoreCard({ result }) {
  const [showImprovements, setShowImprovements] = useState(true);
  const [showStrengths, setShowStrengths] = useState(false);

  if (!result) return null;

  const colors = getScoreColor(result.score);

  return (
    <div className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 mt-8 transition-all`}>
      {/* Header with score */}
      <div className="flex items-center gap-6 mb-6">
        {/* Score circle */}
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
              className={colors.ring}
              strokeDasharray={`${(result.score / 100) * 264} 264`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colors.ring}`}>{result.score}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-4xl font-black ${colors.ring}`}>{result.grade}</span>
            <Award size={24} className={colors.ring} />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Sources */}
      {result.sources && result.sources.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Research Sources</p>
          <div className="flex flex-wrap gap-2">
            {result.sources.map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="text-xs text-branson-blue hover:underline truncate max-w-[200px]">
                {src.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      <button
        onClick={() => setShowImprovements(!showImprovements)}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-3 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-500" />
          <span className="text-sm font-semibold text-slate-800 dark:text-white">Areas for Improvement</span>
        </div>
        {showImprovements ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {showImprovements && result.improvements && (
        <div className="space-y-2 mb-4 ml-2">
          {result.improvements.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <span className="text-orange-500 font-bold text-sm mt-0.5">{i + 1}.</span>
              <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      )}

      {/* Strengths */}
      <button
        onClick={() => setShowStrengths(!showStrengths)}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-500" />
          <span className="text-sm font-semibold text-slate-800 dark:text-white">Strengths</span>
        </div>
        {showStrengths ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {showStrengths && result.strengths && (
        <div className="space-y-2 mt-3 ml-2">
          {result.strengths.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <span className="text-green-500 mt-0.5">&#10003;</span>
              <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
