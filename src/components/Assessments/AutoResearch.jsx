import { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { useAPIKey } from '../../context/APIKeyContext';

export default function AutoResearch({ formType, questions, onAutoFill, extraFields }) {
  const { apiKey } = useAPIKey();
  const [companyName, setCompanyName] = useState('');
  const [eventName, setEventName] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState(null);

  const buildPrompt = () => {
    const questionList = questions.map((q, i) => `q${i + 1}: "${q}"`).join('\n');
    const extraContext = formType === 'food-purchasing' && eventName ? `\nEvent context: "${eventName}"` : '';

    return `Research this company/vendor: "${companyName}".${extraContext}

Search the web for information about their DEI practices, sustainability initiatives, hiring practices, certifications, food sourcing, employee benefits, environmental policies, and any other relevant information.

Based on your research, evaluate them against each of the following questions and select the most appropriate answer for each.

Questions:
${questionList}

For each question, respond with one of these values:
- "unknown" = We do not know / no information found
- "working" = No but they are working towards the change
- "policy" = They have a policy in place
- "practice" = They have a practice & evaluation process

You MUST respond with ONLY a valid JSON object in this exact format, nothing else:
{
  "answers": { "q1": "unknown", "q2": "working", ... },
  "confidence": { "q1": "high", "q2": "low", ... },
  "sources": ["https://example.com", ...],
  "companyInfo": {
    "email": "contact email if found or empty string",
    "description": "brief description of what the company does"
  }
}

For each confidence value, use "high" if you found direct evidence, "medium" if you inferred from related info, or "low" if you're mostly guessing. Include source URLs where you found information.`;
  };

  const handleResearch = async () => {
    if (!companyName.trim() || !apiKey) return;
    setIsResearching(true);
    setError(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          tools: [
            { type: 'web_search_20250305', name: 'web_search', max_uses: 5 },
          ],
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error (${response.status})`);
      }

      const data = await response.json();
      const textBlock = data.content.find((b) => b.type === 'text');
      if (!textBlock) throw new Error('No response from AI');

      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = textBlock.text;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/) || jsonStr.match(/(\{[\s\S]*\})/);
      if (jsonMatch) jsonStr = jsonMatch[1];

      const result = JSON.parse(jsonStr.trim());
      onAutoFill(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-branson-blue to-branson-green p-[2px] mb-8">
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-branson-blue to-branson-green flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Auto-Research</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enter a company name and AI will research & fill the form</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company or vendor name..."
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-branson-blue"
          />
          {formType === 'food-purchasing' && (
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Event name (optional)..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-branson-blue"
            />
          )}
          <button
            onClick={handleResearch}
            disabled={!companyName.trim() || isResearching || !apiKey}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-branson-blue to-branson-green text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-40 cursor-pointer transition-opacity shrink-0"
          >
            {isResearching ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search size={16} />
                Research & Auto-Fill
              </>
            )}
          </button>
        </div>

        {isResearching && (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-branson-blue/5 dark:bg-branson-blue/10 border border-branson-blue/20">
            <Loader2 size={18} className="animate-spin text-branson-blue" />
            <span className="text-sm text-branson-blue font-medium">
              Researching {companyName}... This may take a moment.
            </span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
