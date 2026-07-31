// Base Quick Reference content. Admin-published additions are merged on top
// of these at render time (see QuickReference.jsx).

export const contacts = [
  { name: 'Christina Mazzola', title: 'Head of School', email: 'chris_mazzola@branson.org' },
  { name: 'JuanCarlos Arauz', title: 'Director of Diversity, Equity & Inclusion', email: 'juancarlos_arauz@branson.org' },
  { name: 'Kelsey Acevedo-Soto, LMFT', title: 'Director of Counseling', email: 'kelsey_acevedo-soto@branson.org' },
  { name: 'Whitney Livermore', title: 'Dean of Student Life', email: 'whitney_livermore@branson.org' },
  { name: 'Arthur Lee', title: 'Director of Human Development & Wellness', email: 'arthur_lee@branson.org' },
];

export const classDeans = ['Neha Kamdar', 'Charlotte King', 'Gisella Petrone', 'Maura Vaughn'];

export const calendarEvents = [
  { month: 'Aug', event: 'All-school orientation + community values overview' },
  { month: 'Sep', event: 'Staff training on supportive environment practices' },
  { month: 'Oct', event: 'Student leadership workshop' },
  { month: 'Nov', event: 'Community dialogue sessions' },
  { month: 'Jan', event: 'Reinforcement training for faculty and staff' },
  { month: 'Feb', event: 'Student-led awareness week' },
  { month: 'Mar', event: 'Spring semester checkpoint and assessment' },
  { month: 'May', event: 'Year-end program review and planning' },
];

export const resources = [
  { name: 'RAINN National Sexual Assault Hotline', detail: '1-800-656-4673', url: 'https://www.rainn.org' },
  { name: 'Community Violence Solutions', detail: '(415) 420-0800', url: null },
  { name: 'Crisis Text Line', detail: 'Text HOME to 741741', url: 'https://www.crisistextline.org' },
  { name: 'National Suicide Prevention Lifeline', detail: '988 (call or text)', url: 'https://988lifeline.org' },
  { name: 'StopBullying.gov', detail: 'Federal anti-bullying resources', url: 'https://www.stopbullying.gov' },
  { name: 'Trevor Project (LGBTQ+ Youth)', detail: '1-866-488-7386', url: 'https://www.thetrevorproject.org' },
];

// Merge published 'quick-reference' additions into the three base lists.
export function mergeQuickRefAdditions(rows) {
  const c = [...contacts];
  const e = [...calendarEvents];
  const r = [...resources];
  for (const row of rows || []) {
    const d = row.data || {};
    if (d.kind === 'contact') c.push({ name: d.name || '', title: d.role || '', email: d.email || '' });
    else if (d.kind === 'event') e.push({ month: d.month || '', event: d.detail || '' });
    else if (d.kind === 'resource') r.push({ name: d.name || '', detail: d.detail || '', url: d.url || null });
  }
  return { contacts: c, calendarEvents: e, resources: r };
}
