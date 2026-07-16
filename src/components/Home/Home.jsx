import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageCircle, ClipboardList, ArrowRight, Sparkles, FileCheck, NotebookPen, ChevronDown } from 'lucide-react';
import bransonLogo from '../../assets/branson-logo.svg';
import bransonBull from '../../assets/branson-bull.svg';
import IntroSequence from './IntroSequence';

const portals = [
  {
    to: '/bylaws',
    icon: BookOpen,
    title: 'Bylaws Browser',
    description: 'Search and browse all 12 articles of the Community Values bylaws. Toggle between standard and plain language.',
    cta: 'Browse Bylaws',
    span: 'lg:col-span-3',
    gradient: 'from-[#003a6b] via-[#004B87] to-[#0a6aa8]',
    glow: '#38bdf8',
  },
  {
    to: '/advisor',
    icon: MessageCircle,
    title: 'Policy Advisor',
    badge: 'Chat with me!',
    description: "Describe any situation and get instant, bylaws-based guidance with specific section citations. It's like chatting with a colleague who knows every policy.",
    cta: 'Start a Conversation',
    span: 'lg:col-span-3',
    gradient: 'from-[#00512f] via-[#00734a] to-[#00A651]',
    glow: '#4ade80',
  },
  {
    to: '/assessments',
    icon: FileCheck,
    title: 'Assessment Rubrics',
    badge: 'AI-Scored',
    description: 'Interactive rubrics for vendor evaluation, dietary equity, and food purchasing — scored by AI.',
    cta: 'Start an Assessment',
    span: 'lg:col-span-2',
    gradient: 'from-[#134e4a] via-[#0f766e] to-[#14b8a6]',
    glow: '#2dd4bf',
  },
  {
    to: '/notes',
    icon: NotebookPen,
    title: 'Case Notes',
    badge: 'Staff Only',
    description: 'Passcode-protected collaborative notes with real-time editing and file uploads.',
    cta: 'Open Notes',
    span: 'lg:col-span-2',
    gradient: 'from-[#1e293b] via-[#334155] to-[#475569]',
    glow: '#94a3b8',
  },
  {
    to: '/quick-reference',
    icon: ClipboardList,
    title: 'Quick Reference',
    description: 'Reporting contacts, checklists, training calendar, and crisis hotlines — all in one place.',
    cta: 'View Resources',
    span: 'lg:col-span-2',
    gradient: 'from-[#312e81] via-[#3730a3] to-[#4f46e5]',
    glow: '#818cf8',
  },
];

function PortalTile({ portal, index }) {
  const handleMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    e.currentTarget.style.setProperty('--ry', `${px * 10}deg`);
    e.currentTarget.style.setProperty('--rx', `${-py * 10}deg`);
  }, []);

  const handleLeave = useCallback((e) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  }, []);

  return (
    <Link
      to={portal.to}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ '--tile-glow': portal.glow, animationDelay: `${0.1 + index * 0.12}s` }}
      className={`portal-tile group animate-fade-up bg-gradient-to-br ${portal.gradient} ${portal.span} p-7 lg:p-8 flex flex-col no-underline min-h-[220px]`}
    >
      {/* faint bull watermark */}
      <img
        src={bransonBull}
        alt=""
        className="absolute -right-8 -bottom-8 w-40 opacity-[0.08] group-hover:opacity-[0.14] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none"
      />

      <div className="portal-icon-orbit w-14 h-14 rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur flex items-center justify-center mb-5 group-hover:bg-white/25 transition-colors duration-300" style={{ animationDelay: `${index * 0.7}s` }}>
        <portal.icon size={26} className="text-white" />
      </div>

      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
        <h3 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight">
          {portal.title}
        </h3>
        {portal.badge && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 ring-1 ring-white/30 text-white text-xs font-semibold backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {portal.badge}
          </span>
        )}
      </div>

      <p className="text-sm text-white/75 leading-relaxed mb-6 max-w-md">
        {portal.description}
      </p>

      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-white group-hover:gap-3 transition-all duration-300">
        {portal.cta}
        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
      </span>
    </Link>
  );
}

export default function Home() {
  const [introDone, setIntroDone] = useState(() => sessionStorage.getItem('introPlayed') === '1');
  const finishIntro = useCallback(() => {
    sessionStorage.setItem('introPlayed', '1');
    setIntroDone(true);
  }, []);

  const headline = ['Community', 'Values', 'Hub'];

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {!introDone && <IntroSequence onDone={finishIntro} />}

      {/* Hero */}
      <div className="hero-aurora">
        {/* Floating orbs */}
        <div className="absolute top-16 right-[12%] w-64 h-64 rounded-full bg-sky-400/10 blur-3xl animate-float" />
        <div className="absolute bottom-24 left-[8%] w-72 h-72 rounded-full bg-branson-green/15 blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-white/5 blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 72%)',
          }}
        />

        {/* Giant rotating bull watermark */}
        <img
          src={bransonBull}
          alt=""
          className="absolute -right-32 -top-32 w-[34rem] opacity-[0.06] animate-float-slow pointer-events-none"
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-28 lg:pt-28 lg:pb-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sky-100 text-xs font-semibold mb-8 backdrop-blur-sm ring-1 ring-white/20 animate-fade-up">
            <Sparkles size={14} className="animate-glow-pulse text-branson-green" />
            2025–2026 Academic Year
          </div>

          <div className="flex justify-center mb-8 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="bg-white rounded-2xl px-6 py-3 shadow-2xl shadow-sky-900/50 hover:scale-105 hover:-rotate-1 transition-transform duration-300">
              <img src={bransonLogo} alt="Branson" className="h-10 lg:h-12 w-auto" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-none" style={{ perspective: '600px' }}>
            {headline.map((word, i) => (
              <span
                key={word}
                className={`hero-word mr-3 lg:mr-5 last:mr-0 ${i === 1 ? 'text-shimmer' : 'text-white'}`}
                style={{ animationDelay: `${0.3 + i * 0.18}s` }}
              >
                {word}
              </span>
            ))}
          </h1>

          <p className="text-lg sm:text-xl text-sky-100/90 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.9s' }}>
            Your one-stop resource for Branson's community values policies, reporting guidance, and practical tools for teachers, staff, and students.
          </p>

          <div className="mt-12 animate-fade-up flex justify-center" style={{ animationDelay: '1.2s' }}>
            <ChevronDown size={26} className="text-sky-200/70 animate-bounce" />
          </div>
        </div>

        {/* Fade into page */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-950" />
      </div>

      {/* Portal bento grid */}
      <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-10 pb-20">
        <div className="grid gap-5 lg:grid-cols-6">
          {portals.map((portal, i) => (
            <PortalTile key={portal.to} portal={portal} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
