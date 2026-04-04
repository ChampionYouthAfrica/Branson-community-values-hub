import { useState } from 'react';
import {
  Phone, ClipboardCheck, UtensilsCrossed, GitBranch,
  Calendar, ExternalLink, ChevronDown, ChevronUp, Mail,
  Check, Circle
} from 'lucide-react';
import clsx from 'clsx';

function Card({ icon: Icon, title, preview, children, open, onToggle, accent = 'blue' }) {
  const accentBg = accent === 'green' ? 'bg-branson-green/10' : 'bg-branson-blue/10';
  const accentText = accent === 'green' ? 'text-branson-green' : 'text-branson-blue';
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-branson-blue/30 dark:hover:border-branson-blue/30 hover:shadow-md transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center shrink-0`}>
            <Icon size={20} className={accentText} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h3>
            {!open && <p className="text-xs text-slate-500 mt-0.5">{preview}</p>}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400 dark:text-slate-500" /> : <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-200 dark:border-slate-800 pt-4">{children}</div>}
    </div>
  );
}

function ContactItem({ name, title, email }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
      </div>
      {email && (
        <a href={`mailto:${email}`} className="flex items-center gap-1 text-xs text-branson-blue hover:underline shrink-0">
          <Mail size={12} /> Email
        </a>
      )}
    </div>
  );
}

function ChecklistGroup({ title, items, accent = 'blue' }) {
  const dotColor = accent === 'green' ? 'text-branson-green' : 'text-branson-blue';
  const bgColor = accent === 'green' ? 'bg-branson-green/5' : 'bg-branson-blue/5';
  const borderColor = accent === 'green' ? 'border-branson-green/20' : 'border-branson-blue/20';
  return (
    <div className="mb-4 last:mb-0">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{title}</p>
      )}
      <div className="grid gap-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 px-3 py-2 rounded-lg ${bgColor} border ${borderColor}`}
          >
            <Circle size={14} className={`${dotColor} shrink-0 mt-0.5`} />
            <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const vendorCategories = [
  {
    title: 'People & Culture',
    items: [
      'Team composition reflects varied backgrounds',
      'Transparent hiring and labor practices',
      'Fair wage and benefits documentation',
      'Willingness to participate in training',
    ],
  },
  {
    title: 'Policies & Compliance',
    items: [
      'Anti-discrimination policies in place',
      'Data privacy and security compliance',
      'Insurance and liability coverage',
      'Conflict of interest disclosure',
      'Complaint resolution process documented',
    ],
  },
  {
    title: 'Community & Values',
    items: [
      'Community partnerships and local sourcing',
      'Cultural responsiveness in products/services',
      'Environmental responsibility practices',
      'Accessible facilities and services',
      'References from similar institutions',
      'Pricing transparency and fairness',
      'Commitment to continuous improvement',
    ],
  },
];

const foodCategories = [
  {
    title: 'Dietary Needs',
    items: [
      'Dietary restriction accommodations (allergies, religious, medical)',
      'Vegetarian/vegan options always available',
      'Halal and kosher options when possible',
      'Nutritional information clearly displayed',
    ],
  },
  {
    title: 'Access & Equity',
    items: [
      'Culturally varied menu options',
      'Budget fairness across school events',
      'Accommodations for students with food insecurity',
      'Student input on menu planning',
    ],
  },
  {
    title: 'Sourcing',
    items: [
      'Local and sustainable sourcing preferred',
      'Vendor diversity in food procurement',
    ],
  },
];

export default function QuickReference() {
  const [openCard, setOpenCard] = useState(null);

  const toggle = (id) => setOpenCard(prev => prev === id ? null : id);

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quick Reference</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Key contacts, checklists, and resources — everything you need at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Reporting Contacts */}
        <Card icon={Phone} title="Reporting Contacts" preview="Key personnel and contact info" open={openCard === 'contacts'} onToggle={() => toggle('contacts')}>
          <div className="space-y-0">
            <ContactItem name="Christina Mazzola" title="Head of School" email="chris_mazzola@branson.org" />
            <ContactItem name="Kelsey Acevedo-Soto, LMFT" title="Director of Counseling" email="kelsey_acevedo-soto@branson.org" />
            <ContactItem name="Whitney Livermore" title="Dean of Student Life" email="whitney_livermore@branson.org" />
            <ContactItem name="Arthur Lee" title="Director of Human Development and Wellness" email="arthur_lee@branson.org" />
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 font-medium mb-1">Class Deans</p>
            <p className="text-xs text-slate-400">Neha Kamdar, Charlotte King, Gisella Petrone, Maura Vaughn</p>
          </div>
        </Card>

        {/* Vendor Assessment Checklist */}
        <Card icon={ClipboardCheck} title="Vendor Assessment Checklist" preview="16 criteria across 3 categories" accent="green" open={openCard === 'vendor'} onToggle={() => toggle('vendor')}>
          {vendorCategories.map((cat, i) => (
            <ChecklistGroup key={i} title={cat.title} items={cat.items} accent="green" />
          ))}
        </Card>

        {/* Food Equity Checklist */}
        <Card icon={UtensilsCrossed} title="Food Equity Checklist" preview="10 considerations across 3 categories" open={openCard === 'food'} onToggle={() => toggle('food')}>
          {foodCategories.map((cat, i) => (
            <ChecklistGroup key={i} title={cat.title} items={cat.items} accent="blue" />
          ))}
        </Card>

        {/* Reporting Flowchart */}
        <Card icon={GitBranch} title="Reporting Flowchart" preview="Step-by-step: When to report and to whom" accent="green" open={openCard === 'flowchart'} onToggle={() => toggle('flowchart')}>
          <div className="space-y-3 text-sm">
            <div className="text-center p-3 bg-branson-blue/5 border border-branson-blue/15 rounded-xl text-slate-900 dark:text-white font-medium">
              "I need to report something"
            </div>
            <div className="flex justify-center">
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
            </div>
            <div className="text-center text-slate-500 text-xs font-medium uppercase tracking-wider">What type of issue?</div>
            <div className="space-y-2">
              {[
                { issue: 'Bullying or harassment', contact: 'Whitney Livermore', email: 'whitney_livermore@branson.org' },
                { issue: 'Sexual misconduct', contact: 'Kelsey Acevedo-Soto', email: 'kelsey_acevedo-soto@branson.org' },
                { issue: 'Student wellbeing concern', contact: 'Arthur Lee', email: 'arthur_lee@branson.org' },
                { issue: 'Other / Unsure', contact: 'Christina Mazzola (Head of School)', email: 'chris_mazzola@branson.org' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-branson-green/5 border border-branson-green/15">
                  <div className="w-2 h-2 rounded-full bg-branson-green shrink-0" />
                  <div className="flex-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item.issue}</span>
                  </div>
                  <a href={`mailto:${item.email}`} className="text-branson-blue hover:underline text-xs font-medium whitespace-nowrap">
                    {item.contact} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Training Calendar */}
        <Card icon={Calendar} title="2025-2026 Training & Events" preview="Upcoming prevention events..." open={openCard === 'calendar'} onToggle={() => toggle('calendar')}>
          <div className="space-y-1.5">
            {[
              { month: 'Aug', event: 'All-school orientation + community values overview' },
              { month: 'Sep', event: 'Staff training on supportive environment practices' },
              { month: 'Oct', event: 'Student leadership workshop' },
              { month: 'Nov', event: 'Community dialogue sessions' },
              { month: 'Jan', event: 'Reinforcement training for faculty and staff' },
              { month: 'Feb', event: 'Student-led awareness week' },
              { month: 'Mar', event: 'Spring semester checkpoint and assessment' },
              { month: 'May', event: 'Year-end program review and planning' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-branson-blue/5 border border-branson-blue/10 text-sm">
                <span className="w-10 shrink-0 font-bold text-branson-blue text-xs">{item.month}</span>
                <div className="w-px h-4 bg-branson-blue/20" />
                <span className="text-slate-600 dark:text-slate-300">{item.event}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* External Resources */}
        <Card icon={ExternalLink} title="External Resources & Support" preview="Crisis hotlines and community services..." accent="green" open={openCard === 'resources'} onToggle={() => toggle('resources')}>
          <div className="space-y-2 text-sm">
            {[
              { name: 'RAINN National Sexual Assault Hotline', detail: '1-800-656-4673', url: 'https://www.rainn.org' },
              { name: 'Community Violence Solutions', detail: '(415) 420-0800', url: null },
              { name: 'Crisis Text Line', detail: 'Text HOME to 741741', url: 'https://www.crisistextline.org' },
              { name: 'National Suicide Prevention Lifeline', detail: '988 (call or text)', url: 'https://988lifeline.org' },
              { name: 'StopBullying.gov', detail: 'Federal anti-bullying resources', url: 'https://www.stopbullying.gov' },
              { name: 'Trevor Project (LGBTQ+ Youth)', detail: '1-866-488-7386', url: 'https://www.thetrevorproject.org' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-branson-green/5 border border-branson-green/15">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{item.detail}</p>
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-branson-green hover:underline shrink-0 ml-3 font-medium"
                  >
                    Visit <ExternalLink size={10} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
