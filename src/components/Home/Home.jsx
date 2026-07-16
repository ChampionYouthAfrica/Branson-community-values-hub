import { Link } from 'react-router-dom';
import { BookOpen, MessageCircle, ClipboardList, ArrowRight, Sparkles, FileCheck, NotebookPen } from 'lucide-react';
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
    to: '/assessments',
    icon: FileCheck,
    color: 'bg-branson-green',
    title: 'Assessment Rubrics',
    badge: 'AI-Scored',
    description: 'Interactive rubrics for vendor evaluation, dietary equity, and food purchasing — scored by AI with actionable recommendations.',
    cta: 'Start an Assessment',
  },
  {
    to: '/notes',
    icon: NotebookPen,
    color: 'bg-slate-700',
    title: 'Case Notes',
    badge: 'Staff Only',
    description: 'Passcode-protected collaborative notes for documenting situations. Real-time editing between teachers, with file upload support.',
    cta: 'Open Notes',
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
      <div className="relative overflow-hidden hero-animated">
        {/* Floating orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl animate-float" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-branson-green/25 blur-2xl animate-float-slow" />
        <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-sky-400/15 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-10 right-1/3 w-24 h-24 rounded-full bg-white/10 blur-xl animate-float" style={{ animationDelay: '1s' }} />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-16 lg:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-medium mb-6 backdrop-blur-sm ring-1 ring-white/20 animate-fade-up">
            <Sparkles size={14} className="animate-glow-pulse" />
            2025–2026 Academic Year
          </div>

          <div className="flex justify-center mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-2xl px-6 py-3 shadow-xl shadow-black/20 hover:scale-105 transition-transform duration-300">
              <img
                src={bransonLogo}
                alt="Branson"
                className="h-10 lg:h-12 w-auto"
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight animate-fade-up text-shimmer" style={{ animationDelay: '0.2s' }}>
            Community Values Hub
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Your one-stop resource for Branson's community values policies, reporting guidance, and practical tools for teachers, staff, and students.
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {features.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group card-lift bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-branson-blue/40 dark:hover:border-branson-blue/50 no-underline"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-6 shadow-lg shadow-branson-blue/10 transition-transform duration-300`}>
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
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-branson-blue group-hover:gap-2.5 transition-all duration-300">
                {feature.cta}
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
