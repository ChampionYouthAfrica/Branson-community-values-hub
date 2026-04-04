import { Link } from 'react-router-dom';
import { BookOpen, MessageCircle, ClipboardList, ArrowRight, Sparkles } from 'lucide-react';
import bransonLogo from '../../assets/branson-logo.svg';

const features = [
  {
    to: '/bylaws',
    icon: BookOpen,
    color: 'bg-branson-blue',
    title: 'Bylaws Browser',
    description: 'Search and browse all 12 articles of the Community Values bylaws. Toggle between standard and plain language.',
    cta: 'Browse Bylaws',
  },
  {
    to: '/advisor',
    icon: MessageCircle,
    color: 'bg-branson-green',
    title: 'Policy Advisor',
    badge: 'Chat with me!',
    description: 'Describe any situation and get instant, bylaws-based guidance with specific section citations. It\'s like chatting with a colleague who knows every policy.',
    cta: 'Start a Conversation',
  },
  {
    to: '/quick-reference',
    icon: ClipboardList,
    color: 'bg-branson-blue',
    title: 'Quick Reference',
    description: 'Reporting contacts, vendor checklists, training calendar, crisis hotlines, and more — all in one place.',
    cta: 'View Resources',
  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-branson-blue via-branson-blue to-sky-800">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-branson-green/10" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 lg:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-medium mb-6 backdrop-blur-sm">
            <Sparkles size={14} />
            2025–2026 Academic Year
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl px-6 py-3 shadow-lg">
              <img
                src={bransonLogo}
                alt="Branson"
                className="h-10 lg:h-12 w-auto"
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Community Values Hub
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Your one-stop resource for Branson's community values policies, reporting guidance, and practical tools for teachers, staff, and students.
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-branson-blue/30 dark:hover:border-branson-blue/40 transition-all duration-200 no-underline"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon size={22} className="text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                {feature.badge && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-branson-green/10 text-branson-green text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-branson-green animate-pulse" />
                    {feature.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {feature.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-branson-blue group-hover:gap-2 transition-all">
                {feature.cta}
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
