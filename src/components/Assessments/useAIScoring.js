import { useState } from 'react';
import { useAPIKey } from '../../context/APIKeyContext';
import { calculateScore } from './assessmentData';

export default function useAIScoring() {
  const { apiKey } = useAPIKey();
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);

  const scoreForm = async (formTitle, questions, answers, extraContext = '') => {
    setIsScoring(true);
    setScoreError(null);

    try {
      const { score, grade, earned, maxPoints } = calculateScore(answers, questions.length);

      const answersText = questions.map((q, i) => {
        const val = answers[`q${i + 1}`] || 'unknown';
        const labels = {
          unknown: 'We do not know',
          working: 'Working towards the change',
          policy: 'Policy in place',
          practice: 'Practice & evaluation process',
        };
        return `${i + 1}. ${q}\n   Answer: ${labels[val] || val}`;
      }).join('\n\n');

      const prompt = `You are scoring a "${formTitle}" assessment for Branson School's DEI program.

The assessment scored ${score}/100 (${earned}/${maxPoints} points), grade: ${grade}.

Scoring: "We do not know" = 0pts, "Working towards change" = 1pt, "Policy in place" = 2pts, "Practice & evaluation process" = 3pts.

${extraContext}

Here are the responses:

${answersText}

Respond with ONLY valid JSON:
{
  "summary": "2-3 sentence overall assessment",
  "improvements": ["specific actionable recommendation 1", "specific actionable recommendation 2", "specific actionable recommendation 3"],
  "strengths": ["strength 1", "strength 2"]
}

Be specific in recommendations — suggest concrete actions, not vague advice. If most answers are "unknown", recommend starting with the most impactful areas first.`;

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
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) throw new Error(`API error (${response.status})`);

      const data = await response.json();
      const text = data.content.find((b) => b.type === 'text')?.text || '';
      let jsonStr = text;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/) || jsonStr.match(/(\{[\s\S]*\})/);
      if (jsonMatch) jsonStr = jsonMatch[1];

      const aiResult = JSON.parse(jsonStr.trim());
      setScoreResult({ score, grade, ...aiResult });
    } catch (err) {
      setScoreError(err.message);
    } finally {
      setIsScoring(false);
    }
  };

  const scoreCheckboxForm = async (formTitle, checkboxes, checked, freeResponses) => {
    setIsScoring(true);
    setScoreError(null);

    try {
      const total = checkboxes.length;
      const checkedCount = checked.length;
      const score = Math.round((checkedCount / total) * 100);
      const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

      const checkedText = checkboxes.map((cb, i) => `${checked.includes(i) ? '[x]' : '[ ]'} ${cb}`).join('\n');

      const prompt = `You are scoring a "${formTitle}" assessment for Branson School's DEI program.

${checkedCount} out of ${total} considerations were checked (${score}%), grade: ${grade}.

Considerations:
${checkedText}

${freeResponses ? `Additional context provided:\n${freeResponses}` : ''}

Respond with ONLY valid JSON:
{
  "summary": "2-3 sentence overall assessment",
  "improvements": ["specific actionable recommendation 1", "specific actionable recommendation 2", "specific actionable recommendation 3"],
  "strengths": ["strength 1", "strength 2"]
}

Be specific — for unchecked items, recommend concrete steps to address them.`;

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
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) throw new Error(`API error (${response.status})`);

      const data = await response.json();
      const text = data.content.find((b) => b.type === 'text')?.text || '';
      let jsonStr = text;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/) || jsonStr.match(/(\{[\s\S]*\})/);
      if (jsonMatch) jsonStr = jsonMatch[1];

      const aiResult = JSON.parse(jsonStr.trim());
      setScoreResult({ score, grade, ...aiResult });
    } catch (err) {
      setScoreError(err.message);
    } finally {
      setIsScoring(false);
    }
  };

  return { isScoring, scoreResult, scoreError, scoreForm, scoreCheckboxForm };
}
