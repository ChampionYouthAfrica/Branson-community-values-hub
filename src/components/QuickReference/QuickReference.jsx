import PageHero from '../Shared/PageHero';
import { Phone, Calendar, ExternalLink, Mail } from 'lucide-react';

function SectionHeader({ icon: Icon, title, accent = 'blue' }) {
  const bg = accent === 'green' ? 'bg-branson-green/10' : 'bg-branson-blue/10';
  const text = accent === 'green' ? 'text-branson-green' : 'text-branson-blue';
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={text} />
      </div>
      <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{title}</h2>
    </div>
  );
}

const contacts = [
  { name: 'Christina Mazzola', title: 'Head of School', email: 'chris_mazzola@branson.org' },
  { name: 'JuanCarlos Arauz', title: 'Director of Diversity, Equity & Inclusion', email: 'juancarlos_arauz@branson.org' },
  { name: 'Kelsey Acevedo-Soto, LMFT', title: 'Director of Counseling', email: 'kelsey_acevedo-soto@branson.org' },
  { name: 'Whitney Livermore', title: 'Dean of Student Life', email: 'whitney_livermore@branson.org' },
  { name: 'Arthur Lee', title: 'Director of Human Development & Wellness', email: 'arthur_lee@branson.org' },
];

const classDeans = ['Neha Kamdar', 'Charlotte King', 'Gisella Petrone', 'Maura Vaughn'];

const calendarEvents = [
  { month: 'Aug', event: 'All-school orientation + community values overview' },
  { month: 'Sep', event: 'Staff training on supportive environment practices' },
  { month: 'Oct', event: 'Student leadership workshop' },
  { month: 'Nov', event: 'Community dialogue sessions' },
  { month: 'Jan', event: 'Reinforcement training for faculty and staff' },
  { month: 'Feb', event: 'Student-led awareness week' },
  { month: 'Mar', event: 'Spring semester checkpoint and assessment' },
  { month: 'May', event: 'Year-end program review and planning' },
];

const resources = [
  { name: 'RAINN National Sexual Assault Hotline', detail: '1-800-656-4673', url: 'https://www.rainn.org' },
  { name: 'Community Violence Solutions', detail: '(415) 420-0800', url: null },
  { name: 'Crisis Text Line', detail: 'Text HOME to 741741', url: 'https://www.crisistextline.org' },
  { name: 'National Suicide Prevention Lifeline', detail: '988 (call or text)', url: 'https://988lifeline.org' },
  { name: 'StopBullying.gov', detail: 'Federal anti-bullying resources', url: 'https://www.stopbullying.gov' },
  { name: 'Trevor Project (LGBTQ+ Youth)', detail: '1-866-488-7386', url: 'https://www.thetrevorproject.org' },
];

export default function QuickReference() {
  return (
    <div>
      <PageHero
        title="Quick Reference"
        subtitle="Key contacts, training events, and crisis resources — all in one place"
      />
      <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Reporting Contacts ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <SectionHeader icon={Phone} title="Reporting Contacts" accent="blue" />
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.email} className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{c.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.title}</p>
                </div>
                <a
                  href={`mailto:${c.email}`}
                  className="flex items-center gap-1 text-xs text-branson-blue hover:underline shrink-0 mt-0.5"
                >
                  <Mail size={11} /> Email
                </a>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Class Deans</p>
            <div className="flex flex-wrap gap-1.5">
              {classDeans.map((d) => (
                <span key={d} className="text-xs bg-branson-blue/8 dark:bg-branson-blue/15 text-branson-blue px-2 py-0.5 rounded-full font-medium">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Training Calendar ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <SectionHeader icon={Calendar} title="2025–2026 Training & Events" accent="green" />
          <div className="space-y-2">
            {calendarEvents.map((item) => (
              <div
                key={item.month}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-branson-green/5 border border-branson-green/15"
              >
                <span className="w-8 shrink-0 font-bold text-branson-green text-xs pt-0.5">{item.month}</span>
                <div className="w-px self-stretch bg-branson-green/20 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── External Resources ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <SectionHeader icon={ExternalLink} title="External Resources & Support" accent="blue" />
          <div className="space-y-2">
            {resources.map((r) => (
              <div
                key={r.name}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-branson-blue/5 border border-branson-blue/10"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-white leading-snug">{r.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.detail}</p>
                </div>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-branson-blue hover:underline shrink-0 font-medium mt-0.5"
                  >
                    Visit →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>


      </div>
    </div>
  );
}
