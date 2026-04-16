// Shared assessment form data and scoring utilities

export const MATRIX_OPTIONS = [
  { value: 'unknown', label: 'We do not know', points: 0 },
  { value: 'working', label: 'No but we are working towards the change', points: 1 },
  { value: 'policy', label: 'We have a policy in place', points: 2 },
  { value: 'practice', label: 'We have a practice & evaluation process', points: 3 },
];

export const VENDOR_DEI_QUESTIONS = [
  'The company is minority owned and/or has equitable hiring practices',
  'The company demonstrates DEI by providing a living wage & retirement benefits',
  'The company demonstrates DEI by providing healthcare and family/sick leave',
  'The company demonstrates DEI by providing opportunities for women & non-binary to advance in the company',
  'The company demonstrates DEI by providing accommodations for those with Physical/Mental Disability',
  'The company demonstrates DEI by providing multilingual translation services for its employees and clients',
  'The company demonstrates DEI by providing an affinity group and/or Employment Resource Group, etc.',
  'The company demonstrates DEI by providing Green certification (LEED, USDA Organic, Energy Star, FairTrade, FSC/MSC)',
  'The company demonstrates DEI by reducing carbon emissions and uses sustainable energy',
  'The company demonstrates DEI by utilizing sustainable waste management practices',
];

export const VENDOR_SERVICES = [
  'Consulting',
  'Photography',
  'Translation',
  'Janitorial',
  'Food Service',
  'Transportation',
];

export const DIETARY_QUESTIONS = [
  'Has there been consideration to the various taste buds for different racial/ethnic groups?',
  'Has there been consideration to the students who rely on food by Branson throughout the day who are on Financial Assistance?',
  'Has there been consideration to the students who may be more selective due to awareness of fair practices for labor and organic food?',
  'Has there been consideration to the students whose food ingredients impact hormonal development?',
  'Has there been consideration to the students whose food preference may exist based on gender?',
  'Has there been consideration to the students whose food preference may exist based on sexual orientation?',
  'Has there been consideration to the students whose food preference may exist based on physical accessibility and/or allergies?',
  'Has there been consideration to the students whose food preference may exist based on religious practices?',
  'Has there been consideration to the students whose food preference may exist based on adolescent development?',
  'Has there been consideration to those whose food preference may exist based on younger age development?',
  'Has there been consideration to those whose food preference may exist based on elder age development?',
  'Has there been consideration to the students whose food preference may exist based on physical activity due to athletics?',
  'Has there been consideration to the students whose food preference & needs may exist based on physical activity due to athletics?',
  'Has there been consideration to the students whose food preference may exist based on national cultural preferences?',
  'Has there been consideration to the students whose food preference may exist based on language limitation in knowing types of food?',
  'Has there been consideration to the students whose food preference may exist based on family dynamics that might have been alerted by the counseling office?',
  'Has there been consideration to the students whose food preference may exist based on it being environmentally sustainable?',
];

export const FOOD_PURCHASING_CHECKBOXES = [
  'Cultural differences or expectations based on race/ethnicity of the participants',
  'Affordable pricing, inclusive for participants of all socio-economic classes',
  'Gender (there may be differences based on biological needs)',
  'Food allergies, sensitivities or other physical reactions to food intake',
  'Dietary considerations based on religious traditions or spiritual beliefs',
  'Dietary considerations and nutrition based on the age(s) of participant(s)',
  'Portion sizes for people of different body types, sizes, or genders',
  'Dietary considerations based on the national culture or nationality of participants',
  'Languages spoken beside English for menu purposes',
  'Environmental practices, including food grown sustainably, raised humanely, organic',
  'Other dietary considerations (vegan, vegetarian, etc.)',
  'Fair labor practices provided by food vendors',
];

export function calculateScore(answers, totalQuestions) {
  const maxPoints = totalQuestions * 3;
  let earned = 0;
  for (const val of Object.values(answers)) {
    const opt = MATRIX_OPTIONS.find((o) => o.value === val);
    if (opt) earned += opt.points;
  }
  const pct = Math.round((earned / maxPoints) * 100);
  let grade;
  if (pct >= 90) grade = 'A';
  else if (pct >= 80) grade = 'B';
  else if (pct >= 70) grade = 'C';
  else if (pct >= 60) grade = 'D';
  else grade = 'F';
  return { score: pct, grade, earned, maxPoints };
}

export function getScoreColor(score) {
  if (score >= 80) return { ring: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' };
  if (score >= 60) return { ring: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' };
  if (score >= 40) return { ring: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' };
  return { ring: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' };
}
