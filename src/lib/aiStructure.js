import { getLatestModel } from './config';

function parseJsonLoose(text) {
  let s = text.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1];
  const brace = s.match(/(\{[\s\S]*\})/);
  if (brace) s = brace[1];
  return JSON.parse(s.trim());
}

async function callStructuring(prompt) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: await getLatestModel('server-managed'),
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`AI structuring failed (${res.status}).`);
  const data = await res.json();
  const text = data.content?.find((b) => b.type === 'text')?.text || '';
  return parseJsonLoose(text);
}

// Turn an uploaded document into structured, de-duplicated bylaw sections.
// `outline` is a compact list of the existing articles/sections so the model
// can (a) skip duplicates and (b) place new rules in the right article.
export async function structureBylaws(rawText, bylawsData) {
  const outline = bylawsData.articles
    .map(
      (a) =>
        `Article ${a.number}: ${a.title}\n` +
        a.sections.map((s) => `   - ${s.number} ${s.title}`).join('\n')
    )
    .join('\n');

  const prompt = `You are helping maintain the Branson School Community Values bylaws. Below is the EXISTING bylaws outline, followed by a NEW uploaded document. Convert the new document into properly structured bylaw sections.

RULES:
1. DEDUPLICATE: If information is already covered by an existing section, DO NOT include it. Only produce sections for genuinely new rules or substantially new detail.
2. PLACEMENT: If a new rule fits an existing article, set "placement":"append" and give the matching "articleNumber" and "articleTitle". If it does not fit any existing article, set "placement":"new-article" and give a "newArticleTitle" (and a roman-numeral "newArticleNumber" continuing after the last one).
3. Write each section in THREE variants, matching the house style:
   - "technical": full formal policy language (may use DEI terminology).
   - "standard": same content, softened/neutral wording.
   - "simplePlain": 1-3 short plain-English sentences a student could understand.
4. Give each section a short "number" (e.g. an unused sub-number within its article like "4.12") and a concise "title".
5. Keep sections faithful to the source — do not invent policies that aren't in the document.

EXISTING BYLAWS OUTLINE:
${outline}

NEW UPLOADED DOCUMENT:
${rawText}

Respond with ONLY valid JSON in this exact shape:
{
  "sections": [
    {
      "placement": "append" | "new-article",
      "articleNumber": "IV",
      "articleTitle": "Community Standards and Conduct",
      "newArticleTitle": "",
      "newArticleNumber": "",
      "number": "4.12",
      "title": "Section Title",
      "technical": "...",
      "standard": "...",
      "simplePlain": "...",
      "note": "one short line on why this is new / where it goes"
    }
  ],
  "skipped": ["short reason a duplicate was skipped", "..."]
}`;

  const parsed = await callStructuring(prompt);
  return {
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
  };
}

// Turn an uploaded document into new Quick Reference entries (contacts,
// training-calendar events, or external resources), de-duplicated.
export async function structureQuickReference(rawText, existing) {
  const contacts = (existing.contacts || []).map((c) => `${c.name} — ${c.title}`).join('; ');
  const events = (existing.calendarEvents || []).map((e) => `${e.month}: ${e.event}`).join('; ');
  const resources = (existing.resources || []).map((r) => `${r.name} (${r.detail})`).join('; ');

  const prompt = `You maintain the "Quick Reference" page for Branson School, which has three lists: reporting CONTACTS, a training CALENDAR of events by month, and external RESOURCES/hotlines. Convert the NEW uploaded document into structured entries for those lists.

RULES:
1. DEDUPLICATE against the existing entries below — do not repeat anything already present.
2. Each new item must have a "kind": "contact", "event", or "resource".
   - contact: {"kind":"contact","name":"...","role":"...","email":"..."}
   - event:   {"kind":"event","month":"Aug","detail":"..."}  (month is a 3-letter abbreviation)
   - resource:{"kind":"resource","name":"...","detail":"phone/description","url":"https://... or empty"}
3. Only include genuinely useful, clearly-supported entries from the document. Do not invent.

EXISTING CONTACTS: ${contacts || '(none)'}
EXISTING CALENDAR: ${events || '(none)'}
EXISTING RESOURCES: ${resources || '(none)'}

NEW UPLOADED DOCUMENT:
${rawText}

Respond with ONLY valid JSON:
{ "items": [ { "kind":"contact|event|resource", "name":"", "role":"", "email":"", "month":"", "detail":"", "url":"" } ], "skipped": ["reason", "..."] }`;

  const parsed = await callStructuring(prompt);
  return {
    items: Array.isArray(parsed.items) ? parsed.items : [],
    skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
  };
}

// Turn an uploaded document into new Vendor DEI rubric criteria, de-duplicated.
export async function structureVendorRubric(rawText, existingQuestions) {
  const existing = (existingQuestions || []).map((q, i) => `${i + 1}. ${q}`).join('\n');
  const prompt = `You maintain the Branson School "Vendor DEI Rubric" — a list of criteria a vendor is scored against (each scored: don't know / working toward / policy in place / practice & evaluation). Convert the NEW uploaded document into additional rubric criteria.

RULES:
1. DEDUPLICATE against the existing criteria below — do not repeat anything already covered.
2. Each new criterion is a single clear statement in the same style as the existing ones (a standard the vendor either meets or doesn't).
3. Only include criteria genuinely supported by the document. Do not invent.

EXISTING CRITERIA:
${existing}

NEW UPLOADED DOCUMENT:
${rawText}

Respond with ONLY valid JSON:
{ "items": [ { "question": "..." } ], "skipped": ["reason", "..."] }`;

  const parsed = await callStructuring(prompt);
  return {
    items: Array.isArray(parsed.items) ? parsed.items : [],
    skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
  };
}
