import clsx from 'clsx';
import { MATRIX_OPTIONS } from './assessmentData';

export default function MatrixQuestion({ index, question, value, onChange, confidence }) {
  return (
    <div
      className={clsx(
        'rounded-xl border p-4 transition-all',
        confidence === 'low'
          ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-600'
          : value
          ? 'border-branson-green/30 bg-branson-green/5 dark:border-branson-green/20 dark:bg-branson-green/5'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="shrink-0 w-7 h-7 rounded-full bg-branson-blue/10 text-branson-blue text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {question}
        </p>
      </div>
      {confidence === 'low' && (
        <div className="ml-10 mb-2 text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
          <span>&#9888;</span> Low confidence — please verify this answer
        </div>
      )}
      <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {MATRIX_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all',
              value === opt.value
                ? 'border-branson-blue bg-branson-blue/10 text-branson-blue font-medium dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            <input
              type="radio"
              name={`q-${index}`}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              className={clsx(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                value === opt.value ? 'border-branson-blue' : 'border-slate-300 dark:border-slate-600'
              )}
            >
              {value === opt.value && (
                <span className="w-2 h-2 rounded-full bg-branson-blue" />
              )}
            </span>
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
