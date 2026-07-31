import { getLatestModel } from './config';

function parseJsonLoose(text) {
  let s = text.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1];
  const brace = s.match(/(\{[\s\S]*\})/);
  if (brace) s = brace[1];
  return JSON.parse(s.trim());
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
  const parsed = parseJsonLoose(text);
  return {
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
  };
}
