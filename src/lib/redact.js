import { getLatestModel } from './config';

// Replace personal names in case-note text with initials, via the AI proxy.
// Defense-in-depth on top of encryption: even if a note were ever decrypted or
// exposed, the names of individuals would not be present in plain form.
// Returns the redacted text, or the original text if redaction is unavailable.
export async function redactNames(text) {
  const input = (text || '').trim();
  if (!input) return input;
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: await getLatestModel('server-managed'),
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `You are a privacy redactor for confidential school case notes. Rewrite the text below, replacing the full names of any individuals (students, staff, parents, family members) with just their initials — for example "John Smith" becomes "J.S.", and a lone first name "Sarah" becomes "S." Keep roles and titles (e.g. "the Dean", "her teacher"), dates, and everything else exactly as written. If you are unsure whether something is a personal name, redact it. Return ONLY the redacted text with no preamble, quotes, or commentary.\n\nTEXT:\n${input}`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`redaction failed (${res.status})`);
    const data = await res.json();
    const out = data.content?.find((b) => b.type === 'text')?.text;
    return (out && out.trim()) || input;
  } catch (err) {
    console.warn('[redact] falling back to original text:', err.message);
    return input;
  }
}
