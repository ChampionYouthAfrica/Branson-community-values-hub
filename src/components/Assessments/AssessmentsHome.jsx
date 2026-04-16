import { Link } from 'react-router-dom';
import { Building2, UtensilsCrossed, ShoppingCart, ArrowRight } from 'lucide-react';

const assessments = [
  {
    to: '/assessments/vendor-dei',
    icon: Building2,
    color: 'bg-branson-blue',
    title: 'Vendor DEI Rubric',
    description: 'Evaluate vendor DEI practices including hiring equity, sustainability, employee benefits, and certifications.',
    cta: 'Start Assessment',
  },
  {
    to: '/assessments/dietary',
    icon: UtensilsCrossed,
    color: 'bg-branson-green',
    title: 'Dietary Equity Assessment',
    description: 'Assess how inclusive your food services are across racial, cultural, religious, and accessibility considerations.',
    cta: 'Start Assessment',
  },
  {
    to: '/assessments/food-purchasing',
    icon: ShoppingCart,
    color: 'bg-branson-blue',
    title: 'Food Purchasing Analysis',
    description: 'Evaluate food purchasing decisions for events to ensure inclusive, sustainable, and equitable sourcing.',
    cta: 'Start Assessment',
  },
];

export default function AssessmentsHome() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Assessment Rubrics</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Interactive rubrics for vendor evaluation, dietary equity, and food purchasing — scored by AI with actionable recommendations.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {assessments.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-branson-blue/30 dark:hover:border-branson-blue/40 transition-all duration-200 no-underline"
          >
            <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon size={22} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {item.description}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-branson-blue group-hover:gap-2 transition-all">
              {item.cta}
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
