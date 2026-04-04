import { useLanguage } from '../../context/LanguageContext';
import clsx from 'clsx';

const options = [
  { value: 'technical', label: 'Standard' },
  { value: 'simplePlain', label: 'Plain Language' },
];

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 text-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLanguage(opt.value)}
          className={clsx(
            'px-3 py-1.5 transition-colors cursor-pointer',
            language === opt.value
              ? 'bg-branson-blue text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
