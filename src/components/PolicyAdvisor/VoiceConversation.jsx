import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, MicOff } from 'lucide-react';

// State machine: idle → listening → thinking → speaking → listening → ...
const STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  ERROR: 'error',
};

const STATE_LABELS = {
  idle: 'Tap the mic to start',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
  error: 'Something went wrong — try again',
};

const stripMarkdown = (text) =>
  text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#+\s/gm, '')
    .replace(/^[-•]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/^>\s/gm, '')
    .replace(/`/g, '')
    .replace(/\n{2,}/g, ' ')
    .trim();

export default function VoiceConversation({ isOpen, onClose, onSend }) {
  const [phase, setPhase] = useState(STATES.IDLE);
  const [transcript, setTranscript] = useState(''); // current interim
  const [turns, setTurns] = useState([]);            // [{role, text}]
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const activeRef = useRef(false);   // stays true while voice session is live
  const turnsEndRef = useRef(null);

  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  // Clean up everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      activeRef.current = false;
      recognitionRef.current?.abort();
      window.speechSynthesis.cancel();
      setPhase(STATES.IDLE);
      setTranscript('');
      setTurns([]);
      setError('');
    }
  }, [isOpen]);

  const speak = useCallback((text, onDone) => {
    window.speechSynthesis.cancel();
    const clean = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google US English'))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => { if (activeRef.current) onDone(); };
    utterance.onerror = () => { if (activeRef.current) onDone(); };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    if (!activeRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError('Speech recognition not supported in this browser. Try Chrome.');
      setPhase(STATES.ERROR);
      return;
    }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalText = '';

    recognition.onstart = () => {
      if (!activeRef.current) { recognition.abort(); return; }
      setPhase(STATES.LISTENING);
      setTranscript('');
    };

    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(finalText || interim);
    };

    recognition.onend = async () => {
      if (!activeRef.current) return;
      const said = finalText.trim();
      setTranscript('');

      if (!said) {
        // Nothing heard — restart listening
        startListening();
        return;
      }

      // Add user turn
      setTurns((prev) => [...prev, { role: 'user', text: said }]);
      setPhase(STATES.THINKING);

      try {
        const reply = await onSend(said);
        if (!activeRef.current) return;
        setTurns((prev) => [...prev, { role: 'assistant', text: reply }]);
        setPhase(STATES.SPEAKING);
        speak(reply, () => {
          if (activeRef.current) startListening();
        });
      } catch {
        setPhase(STATES.ERROR);
        setError('Could not reach the advisor. Check your connection.');
      }
    };

    recognition.onerror = (e) => {
      if (!activeRef.current) return;
      if (e.error === 'no-speech' || e.error === 'aborted') {
        startListening(); // silently restart
      } else {
        setPhase(STATES.ERROR);
        setError(`Mic error: ${e.error}`);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onSend, speak]);

  const startSession = useCallback(() => {
    activeRef.current = true;
    setError('');
    startListening();
  }, [startListening]);

  const stopSession = useCallback(() => {
    activeRef.current = false;
    recognitionRef.current?.abort();
    window.speechSynthesis.cancel();
    setPhase(STATES.IDLE);
    setTranscript('');
  }, []);

  if (!isOpen) return null;

  const isActive = phase !== STATES.IDLE && phase !== STATES.ERROR;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-branson-green animate-pulse" />
          <span className="text-sm font-semibold text-white">Voice Conversation</span>
        </div>
        <button
          onClick={() => { stopSession(); onClose(); }}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Conversation transcript */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {turns.length === 0 && phase === STATES.IDLE && (
          <div className="text-center pt-12 text-slate-500">
            <p className="text-sm">Tap the mic below to start talking with the Policy Advisor.</p>
            <p className="text-xs mt-2">Ask about any situation — it will respond out loud and keep the conversation going.</p>
          </div>
        )}
        {turns.map((turn, i) => (
          <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              turn.role === 'user'
                ? 'bg-branson-blue text-white rounded-br-sm'
                : 'bg-slate-800 text-slate-200 rounded-bl-sm'
            }`}>
              {turn.text}
            </div>
          </div>
        ))}
        {/* Live transcript preview */}
        {phase === STATES.LISTENING && transcript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm text-sm bg-branson-blue/40 text-blue-200 italic border border-branson-blue/30">
              {transcript}
            </div>
          </div>
        )}
        <div ref={turnsEndRef} />
      </div>

      {/* Orb + controls */}
      <div className="pb-12 pt-4 flex flex-col items-center gap-6">
        {/* Status label */}
        <p className={`text-sm font-medium transition-colors ${
          phase === STATES.ERROR ? 'text-red-400' :
          phase === STATES.LISTENING ? 'text-branson-blue' :
          phase === STATES.THINKING ? 'text-amber-400' :
          phase === STATES.SPEAKING ? 'text-branson-green' :
          'text-slate-500'
        }`}>
          {error || STATE_LABELS[phase]}
        </p>

        {/* Orb button */}
        <button
          onClick={isActive ? stopSession : startSession}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
            phase === STATES.LISTENING
              ? 'bg-branson-blue shadow-[0_0_60px_20px_rgba(37,99,235,0.4)] scale-110'
              : phase === STATES.THINKING
              ? 'bg-amber-500 shadow-[0_0_40px_10px_rgba(245,158,11,0.3)] animate-pulse'
              : phase === STATES.SPEAKING
              ? 'bg-branson-green shadow-[0_0_60px_20px_rgba(34,197,94,0.35)] scale-105'
              : 'bg-slate-700 hover:bg-slate-600 hover:scale-105'
          }`}
        >
          {/* Ripple rings when listening */}
          {phase === STATES.LISTENING && (
            <>
              <span className="absolute inset-0 rounded-full bg-branson-blue/30 animate-ping" />
              <span className="absolute inset-[-12px] rounded-full border border-branson-blue/20 animate-ping [animation-delay:0.3s]" />
            </>
          )}
          {phase === STATES.SPEAKING && (
            <span className="absolute inset-0 rounded-full bg-branson-green/20 animate-ping" />
          )}

          {isActive
            ? <MicOff size={32} className="text-white relative z-10" />
            : <Mic size={32} className="text-white relative z-10" />
          }
        </button>

        <p className="text-xs text-slate-600">
          {isActive ? 'Tap to stop' : 'Tap to start'}
        </p>
      </div>
    </div>
  );
}
