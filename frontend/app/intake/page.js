'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createChatEngine } from '@/lib/chatEngine';
import { COMPLAINT_ICONS } from '@/lib/constants';
import ComplaintIcons from '@/components/ComplaintIcons';
import VoiceRecorder from '@/components/VoiceRecorder';
import ChatBubble from '@/components/ChatBubble';
import RedFlagAlert from '@/components/RedFlagAlert';

// ─── TTS: Speak AI response aloud ───
function speakText(text, lang = 'hi') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
  utter.rate = 0.9;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

export default function IntakePage() {
  const router = useRouter();
  const [phase, setPhase] = useState(1); // 1: Select Complaint, 2: Chat
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [redFlags, setRedFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('hi');
  const chatEngineRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const lang = localStorage.getItem('preferredLanguage') || 'hi';
    setLanguage(lang);
    chatEngineRef.current = createChatEngine(lang);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Get human-readable label for complaint
  function getComplaintLabel(idOrText) {
    const icon = COMPLAINT_ICONS.find(c => c.id === idOrText);
    if (icon) return language === 'hi' ? icon.labelHi : icon.label;
    return idOrText;
  }

  // Add AI message with delay + TTS
  function addAiResponse(text, callback) {
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text }]);
      setLoading(false);
      speakText(text, language);
      if (callback) callback();
    }, 600);
  }

  // ─── Complaint selection (icon click or voice/text in phase 1) ───
  function handleComplaintSelect(idOrText) {
    setComplaint(idOrText);
    setPhase(2);

    const label = getComplaintLabel(idOrText);
    setMessages([{ role: 'user', text: label }]);

    if (!chatEngineRef.current) {
      chatEngineRef.current = createChatEngine(language);
    }

    const response = chatEngineRef.current.processMessage(idOrText);
    addAiResponse(response.text);
  }

  // ─── User message in chat (phase 2) ───
  function handleUserMessage(text) {
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);

    if (!chatEngineRef.current) {
      chatEngineRef.current = createChatEngine(language);
    }

    const response = chatEngineRef.current.processMessage(text);
    addAiResponse(response.text, () => {
      if (response.isDone) {
        // Save collected data
        const data = chatEngineRef.current.getCollectedData();
        localStorage.setItem('intakeData', JSON.stringify(data));
        // Auto-redirect after thank you
        setTimeout(() => router.push('/prakriti'), 2000);
      }
    });
  }

  const isHi = language === 'hi';
  const quickReplies = isHi
    ? ['हाँ', 'नहीं', 'और बताना है']
    : ['Yes', 'No', 'More to say'];

  return (
    <main className="animate-fade-in" style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <RedFlagAlert flags={redFlags} />

      {/* Progress Bar */}
      <div style={{ padding: '1rem 1.5rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Step 3 of 7</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>
              {isHi ? 'शिकायत बताएं' : 'Chief Complaint'}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '42%' }} />
          </div>
        </div>
      </div>

      <div className="container" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '1.5rem',
        paddingBottom: '2rem',
        maxWidth: '800px',
      }}>

        {/* ─── PHASE 1: Complaint Selection ─── */}
        {phase === 1 && (
          <div className="animate-scale-in" style={{ flex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>
                {isHi ? 'आज कैसी तकलीफ है?' : 'What brings you here today?'}
              </h2>
              <p style={{ marginBottom: 0 }}>
                {isHi ? 'नीचे से चुनें या बोलकर बताएं' : 'Select below or use voice'}
              </p>
            </div>

            <ComplaintIcons onSelect={handleComplaintSelect} selectedId={complaint} language={language} />

            <div style={{
              marginTop: '2.5rem',
              padding: '1.5rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}>
              <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {isHi ? 'या बोलकर/लिखकर बताएं 🎙️' : 'Or tell us using voice/text 🎙️'}
              </h4>
              <VoiceRecorder
                onResult={(text) => handleComplaintSelect(text)}
                language={isHi ? 'hi-IN' : 'en-US'}
                placeholder={isHi ? 'यहाँ टाइप करें...' : 'Type your complaint...'}
              />
            </div>
          </div>
        )}

        {/* ─── PHASE 2: Chat Conversation ─── */}
        {phase === 2 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Chat Messages */}
            <div className="card" style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '1rem',
              maxHeight: '50vh',
              padding: '1rem',
            }}>
              <div className="chat-container">
                {messages.map((m, i) => (
                  <ChatBubble
                    key={i}
                    role={m.role}
                    message={m.text}
                    timestamp={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                ))}
                {loading && (
                  <div style={{
                    alignSelf: 'flex-start',
                    padding: '0.75rem 1rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <span className="animate-bounce" style={{ fontSize: '1.25rem' }}>🤖</span>
                    {isHi ? 'सोच रहा है...' : 'Thinking...'}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Quick Reply Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              {quickReplies.map(reply => (
                <button
                  key={reply}
                  className="btn btn-outline"
                  style={{ minHeight: '40px', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  onClick={() => handleUserMessage(reply)}
                  disabled={loading}
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Voice / Text Input */}
            <VoiceRecorder
              onResult={handleUserMessage}
              language={isHi ? 'hi-IN' : 'en-US'}
              placeholder={isHi ? 'जवाब यहाँ टाइप करें...' : 'Type answer here...'}
            />

            {/* Skip */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => router.push('/prakriti')} style={{ fontSize: '0.875rem' }}>
                {isHi ? 'आगे बढ़ें ⏭️' : 'Skip to History ⏭️'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
