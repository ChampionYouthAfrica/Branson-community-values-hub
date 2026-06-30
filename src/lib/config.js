// ─── Auto-resolving Claude model ─────────────────────────────────────────────
// Fetches the latest available Sonnet model from Anthropic's /v1/models API.
// Falls back to a known-good model if the request fails.
// Result is cached in sessionStorage for 1 hour so it isn't fetched every message.

const FALLBACK_MODEL = 'claude-opus-4-8';
const CACHE_KEY = 'branson_claude_model_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getLatestModel(apiKey) {
  // 1. Return from cache if fresh
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
    if (cached.model && cached.ts && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.model;
    }
  } catch { /* ignore parse errors */ }

  // 2. Fetch available models from Anthropic
  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
    });

    if (!res.ok) return FALLBACK_MODEL;

    const { data: models } = await res.json();

    // Pick the newest available model — prefer opus then sonnet, skip haiku & suspended models
    const SUSPENDED = ['fable', 'mythos']; // Anthropic suspended these June 2025
    const available = models
      .filter((m) => !SUSPENDED.some((s) => m.id.toLowerCase().includes(s)))
      .filter((m) => m.id.includes('opus') || m.id.includes('sonnet'))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const model = available[0]?.id || FALLBACK_MODEL;

    // 3. Cache result
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ model, ts: Date.now() }));
    console.info(`[Branson] Using Claude model: ${model}`);
    return model;
  } catch {
    return FALLBACK_MODEL;
  }
}
