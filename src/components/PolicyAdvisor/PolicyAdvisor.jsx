import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bot, User, Loader2, AlertCircle, Settings, X, MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAPIKey } from '../../context/APIKeyContext';
import { useLanguage } from '../../context/LanguageContext';
import { getBylawsAsText } from '../../utils/bylaw-helpers';
import bylawsData from '../../data/bylaws-content.json';

const SUGGESTED_PROMPTS = [
  'A student is being bullied on social media by another student',
  'I need to evaluate a new food vendor for campus events',
  'A student wants to use a different name and pronouns',
  'How should I handle a heated classroom discussion about a political topic?',
  'A student disclosed something concerning to me after class',
];

const SYSTEM_PROMPT = `You are the Branson Community Values Policy Advisor. Your role is to help teachers, staff, and administrators understand and apply the Branson Community Values and Fair Practices bylaws to real situations.

RESPONSE FORMAT — YOU MUST FOLLOW THIS EXACT STRUCTURE EVERY TIME:

**1. Summary** (1-2 sentences max)
A brief plain-language overview of the situation and what applies.

**2. Relevant Bylaws** (cite 1-2 sections max)
Name the most relevant bylaw section(s) (e.g., "Section 4.05") and explain in 1-2 sentences each why they apply. Use a short blockquote if helpful.

**3. Recommended Action** (2-4 bullet points max)
What to say or do — be specific and actionable.

**4. Who to Contact**
Name the single most relevant administrator or office and their role. Include email if available in the bylaws.

STYLE RULES:
- Be BRIEF. The entire response should be 8-12 sentences max.
- No preambles, no filler. Get straight to it.
- NEVER ask follow-up or clarifying questions. Always give your best answer with the information provided.
- Do NOT include any "Document the Situation" advice. Skip documentation steps entirely.
- Warm but professional tone — you're a helpful colleague, not a legal document.
- Never make up policies — only reference what's in the bylaws below.
- If a situation isn't covered by the bylaws, say so honestly.

WEB SEARCH:
- Use web search when the user mentions a specific current event, person, or incident you need context on.
- Don't just summarize the news — focus on how Branson's policies apply.

Bylaws are provided below in full. Search them for relevant sections.`;

export default function PolicyAdvisor({ messages, setMessages }) {
  const { apiKey, setApiKey } = useAPIKey();
  const { language } = useLanguage();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    if (!apiKey) {
      setError('Please configure your API key to use the advisor.');
      return;
    }

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const bylawsText = getBylawsAsText(bylawsData, language);
      const languageLabel = language === 'technical' ? 'standard DEI terminology' : 'plain, student-friendly language';

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
          tools: [
            {
              type: 'web_search_20250305',
              name: 'web_search',
              max_uses: 3,
            },
          ],
          system: [
            { type: 'text', text: SYSTEM_PROMPT + `\n\nThe user has selected "${languageLabel}" mode. Use this style in your response.` },
            { type: 'text', text: bylawsText },
          ],
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Invalid API key. Please check your key in Settings.');
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again in a moment.');
        throw new Error(err.error?.message || `API error (${response.status})`);
      }

      const data = await response.json();
      // Extract text from all text blocks (web search responses have multiple content blocks)
      const assistantText = data.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n\n');

      setMessages([...newMessages, { role: 'assistant', content: assistantText }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Render markdown-like content with section links
  const renderMessageContent = (text) => {
    // Split into lines for block-level rendering
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Empty line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Blockquote
      if (line.trim().startsWith('> ')) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith('> ')) {
          quoteLines.push(lines[i].trim().slice(2));
          i++;
        }
        elements.push(
          <blockquote key={`bq-${i}`} className="border-l-3 border-branson-blue/40 pl-3 my-2 text-slate-500 dark:text-slate-400 italic text-[13px]">
            {quoteLines.map((ql, qi) => <span key={qi}>{renderInline(ql)}<br/></span>)}
          </blockquote>
        );
        continue;
      }

      // Numbered list item
      if (/^\d+\.\s/.test(line.trim())) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="list-decimal list-inside my-2 space-y-1">
            {listItems.map((li, idx) => (
              <li key={idx} className="text-sm">{renderInline(li)}</li>
            ))}
          </ol>
        );
        continue;
      }

      // Bullet list item
      if (/^[-*]\s/.test(line.trim())) {
        const listItems = [];
        while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^[-*]\s/, ''));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="list-disc list-inside my-2 space-y-1">
            {listItems.map((li, idx) => (
              <li key={idx} className="text-sm">{renderInline(li)}</li>
            ))}
          </ul>
        );
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${i}`} className="my-1.5 text-sm">{renderInline(line)}</p>
      );
      i++;
    }

    return <div className="space-y-0.5">{elements}</div>;
  };

  // Render inline elements: bold, section links
  const renderInline = (text) => {
    // Process **bold** and Section X.XX links
    const parts = text.split(/(\*\*[^*]+\*\*|Section \d+\.\d+)/g);
    return parts.map((part, i) => {
      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      // Section link
      const sectionMatch = part.match(/^Section (\d+\.\d+)$/);
      if (sectionMatch) {
        return (
          <Link
            key={i}
            to="/bylaws"
            state={{ section: sectionMatch[1] }}
            className="font-mono text-branson-blue hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-branson-green/15 flex items-center justify-center">
            <Bot size={20} className="text-branson-green" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Policy Advisor</h1>
            <p className="text-xs text-branson-green font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-branson-green inline-block animate-pulse" />
              Chat with me — I'm here to help!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowSettings(true); setTempKey(apiKey); }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">API Key Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Your API key is kept in browser memory only and never stored or sent to our servers.
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-branson-blue mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setApiKey(tempKey); setShowSettings(false); }}
                className="flex-1 py-2 bg-branson-blue text-white rounded-lg text-sm font-medium hover:opacity-90 cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => { setApiKey(''); setTempKey(''); }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-branson-green/20 to-branson-blue/20 flex items-center justify-center mx-auto mb-5">
                <MessageCircle size={32} className="text-branson-green" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Hi there! How can I help?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 max-w-md mx-auto">
                I'm your Policy Advisor — think of me as a colleague who's read every bylaw so you don't have to.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-8 max-w-sm mx-auto">
                Just describe what's going on and I'll point you to the right policies, contacts, and next steps.
              </p>

              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Try asking about...</p>
              <div className="grid gap-2 max-w-lg mx-auto">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-sm text-slate-600 dark:text-slate-300 hover:bg-branson-blue/5 dark:hover:bg-branson-blue/10 hover:border-branson-blue/30 dark:hover:border-branson-blue/30 transition-all cursor-pointer group"
                  >
                    <span className="text-branson-blue mr-2 opacity-50 group-hover:opacity-100 transition-opacity">→</span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={clsx(
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="shrink-0 w-8 h-8 rounded-lg bg-branson-blue/20 flex items-center justify-center mt-1">
                  <Bot size={16} className="text-branson-blue" />
                </div>
              )}
              <div
                className={clsx(
                  'max-w-[80%] rounded-xl px-4 py-3 leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-branson-blue text-white text-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                )}
              >
                {msg.role === 'assistant' ? (
                  renderMessageContent(msg.content)
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === 'user' && (
                <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center mt-1">
                  <User size={16} className="text-slate-500 dark:text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-branson-blue/20 flex items-center justify-center mt-1">
                <Bot size={16} className="text-branson-blue" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                <Loader2 size={18} className="animate-spin text-branson-blue" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={apiKey ? 'Describe your situation...' : 'Configure API key in settings to start...'}
            disabled={!apiKey || isLoading}
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-branson-blue disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !apiKey}
            className="px-4 py-3 bg-branson-blue text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
