'use client';
import { Suspense } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VoiceRecorder from '../../components/VoiceRecorder';
import ChatBubble from '../../components/ChatBubble';
import RedFlagAlert from '../../components/RedFlagAlert';
import { api } from '../../lib/api';

function IntakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState('en');
  const [langCode, setLangCode] = useState('en-IN');
  const [redFlags, setRedFlags] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [ayushMode, setAyushMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const lang = localStorage.getItem('vaidya_language') || 'en';
    const patientId = searchParams.get('patient') || localStorage.getItem('vaidya_patient_id');
    setLanguage(lang);
    setLangCode(lang === 'hi' ? 'hi-IN' : 'en-IN');

    if (patientId) {
      startSession(patientId, lang);
    } else {
      const greeting = lang === 'hi'
        ? 'नमस्ते! मैं VaidyaAI हूँ। कृपया पहले रजिस्टर करें।'
        : 'Hello! I am VaidyaAI. Please register first.';
      setMessages([{ text: greeting, isAI: true, quickReplies: [] }]);
    }
  }, []);

  const startSession = async (patientId, lang) => {
    const result = await api.startIntake({ patient_id: patientId, session_type: 'opd' });
    if (!result.error && result.data) {
      const sid = result.data.session_id;
      setSessionId(sid);
      localStorage.setItem('vaidya_session_id', sid);

      const quickReplies = lang === 'hi'
        ? ['बुखार है', 'पेट दर्द', 'सिरदर्द', 'छाती में दर्द', 'सांस में तकलीफ']
        : ['I have a fever', 'Stomach pain', 'Headache', 'Chest pain', 'Breathing difficulty'];

      setMessages([{
        text: result.data.message,
        isAI: true,
        quickReplies,
      }]);
    } else {
      const fallback = lang === 'hi'
        ? 'नमस्ते! मैं VaidyaAI हूँ। आज आपको क्या परेशानी है?'
        : 'Hello! I am VaidyaAI. What brings you here today?';
      setMessages([{
        text: fallback,
        isAI: true,
        quickReplies: ['Fever', 'Stomach ache', 'Headache', 'Body pain'],
      }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleUserInput = async (text) => {
    if (!text.trim() || isProcessing) return;

    setMessages(prev => [...prev, { text, isAI: false }]);
    setIsProcessing(true);
    setTextInput('');

    if (sessionId) {
      const result = await api.sendMessage(sessionId, text, language === 'hi' ? 'hi' : 'en');
      setIsProcessing(false);

      if (!result.error && result.data) {
        const aiText = result.data.response;
        const flags = result.data.red_flags || [];

        if (flags.length > 0) {
          setRedFlags(prev => [...prev, ...flags.map(f => f.display || f.keyword)]);
        }

        const completionPhrases = [
          'history is complete', 'your history is complete',
          'doctor will see you', 'history taking is complete',
          'assessment is complete', 'इतिहास पूरा'
        ];
        const isHistoryDone = completionPhrases.some(phrase =>
          aiText.toLowerCase().includes(phrase)
        );

        if (isHistoryDone) {
          setIsComplete(true);
        }

        const quickReplies = generateQuickReplies(aiText, language);

        setMessages(prev => [...prev, {
          text: aiText,
          isAI: true,
          quickReplies,
        }]);
      } else {
        setMessages(prev => [...prev, {
          text: language === 'hi'
            ? 'AI response abhi generate nahi ho paaya. Kripya phir se batayen ya touch options use karein.'
            : 'Could not generate response. Please try again or use the options below.',
          isAI: true,
          quickReplies: ['Yes', 'No', 'I\'m not sure'],
        }]);
      }
    } else {
      setIsProcessing(false);
      setMessages(prev => [...prev, {
        text: language === 'hi'
          ? 'कृपया पहले रजिस्टर करें ताकि आपका सेशन शुरू हो सके।'
          : 'Please register first to start your session.',
        isAI: true,
        quickReplies: [],
      }]);
    }
  };

  const generateQuickReplies = (aiText, lang) => {
    const lower = aiText.toLowerCase();
    if (lang === 'hi') {
      if (lower.includes('दर्द') || lower.includes('pain')) return ['हल्का', 'तेज़', 'बहुत तेज़', 'रुक-रुक कर'];
      if (lower.includes('कब से') || lower.includes('when')) return ['कल से', '1 हफ्ते से', '1 महीने से', '3 महीने से'];
      if (lower.includes('बुखार') || lower.includes('fever')) return ['हाँ', 'नहीं', 'पहले था अब नहीं'];
      if (lower.includes('दवा') || lower.includes('medicine')) return ['हाँ दवा ले रहा', 'नहीं', 'पहले ली थी'];
      if (lower.includes('एलर्जी') || lower.includes('allergy')) return ['नहीं कोई एलर्जी नहीं', 'हाँ है', 'पता नहीं'];
      return ['हाँ', 'नहीं', 'और कुछ बताना है'];
    }
    if (lower.includes('pain') || lower.includes('hurt')) return ['Mild', 'Moderate', 'Severe', 'Comes and goes'];
    if (lower.includes('when') || lower.includes('how long')) return ['Since yesterday', '1 week', '1 month', '3+ months'];
    if (lower.includes('fever') || lower.includes('temperature')) return ['Yes', 'No', 'Had it earlier'];
    if (lower.includes('medication') || lower.includes('medicine')) return ['Yes, currently taking', 'No', 'Previously took'];
    if (lower.includes('allergy') || lower.includes('allergic')) return ['No allergies', 'Yes', 'Not sure'];
    if (lower.includes('family') || lower.includes('relative')) return ['Diabetes', 'Heart disease', 'Hypertension', 'None'];
    return ['Yes', 'No', 'I\'m not sure'];
  };

  const handleFinish = () => {
    if (sessionId) {
      localStorage.setItem('vaidya_session_id', sessionId);
    }
    router.push('/prakriti');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(textInput);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(newLang);
    setLangCode(newLang === 'hi' ? 'hi-IN' : 'en-IN');
    localStorage.setItem('vaidya_language', newLang);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      <RedFlagAlert symptoms={redFlags} />

      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            💬 AI Consultation
            {ayushMode && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">AYUSH Mode</span>}
          </h2>
          <p className="text-sm text-slate-400">
            {language === 'hi' ? 'बोलिए या टाइप कीजिए — मैं सुन रहा हूँ' : 'Speak naturally or type — I am listening'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {language === 'hi' ? '🇮🇳 हिंदी → EN' : '🇬🇧 EN → हिंदी'}
          </button>

          <button
            onClick={() => setAyushMode(!ayushMode)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              ayushMode
                ? 'border-emerald-500/50 bg-emerald-900/30 text-emerald-400'
                : 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            🌿 AYUSH
          </button>

          <button
            onClick={handleFinish}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isComplete
                ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)] animate-pulse-glow'
                : 'bg-slate-800 hover:bg-teal-900/50 text-teal-400 border border-teal-500/30'
            }`}
          >
            {isComplete ? '✅ Proceed to Assessment →' : 'Skip to Assessment →'}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            message={msg.text}
            isAI={msg.isAI}
            quickReplies={msg.quickReplies}
            onQuickReply={handleUserInput}
          />
        ))}
        {isProcessing && (
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-900/50 border border-teal-500/30 flex items-center justify-center text-lg shrink-0">🤖</div>
            <div className="glass-card px-5 py-4 rounded-2xl rounded-tl-sm max-w-[75%]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-20" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-slate-900/80 backdrop-blur-lg border-t border-white/5">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={language === 'hi' ? 'यहाँ टाइप करें या माइक बटन दबाएं...' : 'Type here or press the mic button...'}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-5 py-3.5 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all text-base"
              disabled={isProcessing}
            />
            {textInput.trim() && (
              <button
                onClick={() => handleUserInput(textInput)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-teal-600 hover:bg-teal-500 rounded-lg flex items-center justify-center transition-colors"
                disabled={isProcessing}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}
          </div>

          <VoiceRecorder onTranscript={handleUserInput} language={langCode} />
        </div>
      </div>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading consultation...</p>
        </div>
      </div>
    }>
      <IntakeContent />
    </Suspense>
  );
}
