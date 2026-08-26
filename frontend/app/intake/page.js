'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ComplaintIcons from '@/components/ComplaintIcons';
import VoiceRecorder from '@/components/VoiceRecorder';
import ChatBubble from '@/components/ChatBubble';
import RedFlagAlert from '@/components/RedFlagAlert';

export default function IntakePage() {
  const router = useRouter();
  const [phase, setPhase] = useState(1); // 1: Select Complaint, 2: Chat Follow-up
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [redFlags, setRedFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('hi');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const lang = localStorage.getItem('preferredLanguage') || 'hi';
    setLanguage(lang);

    const startSession = async () => {
      const patientDataStr = localStorage.getItem('patientData');
      let patientId = '000';
      if (patientDataStr) {
        try {
          const patientData = JSON.parse(patientDataStr);
          patientId = patientData.abhaId || patientData.id || '000';
        } catch {
          // ignore parse error
        }
      }

      const res = await api.startIntake({ patient_id: patientId, session_type: 'opd' });
      if (!res.error && res.data) {
        setSessionId(res.data.session_id);
        localStorage.setItem('sessionId', res.data.session_id);
      }
    };
    startSession();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleComplaintSelect = async (id) => {
    setComplaint(id);
    setPhase(2);
    setLoading(true);

    const userMsg = { role: 'user', text: id };
    setMessages([userMsg]);

    const res = await api.sendMessage(sessionId, id, language);
    if (!res.error && res.data) {
      if (res.data.red_flags && res.data.red_flags.length > 0) {
        setRedFlags(res.data.red_flags);
      }
      const aiMsg = { role: 'ai', text: res.data.response };
      setMessages((prev) => [...prev, aiMsg]);
    }
    setLoading(false);
  };

  const handleVoiceOrTextSubmit = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const res = await api.sendMessage(sessionId, text, language);
    if (!res.error && res.data) {
      if (res.data.red_flags && res.data.red_flags.length > 0) {
        setRedFlags(res.data.red_flags);
      }

      const aiMsg = { role: 'ai', text: res.data.response };
      setMessages((prev) => [...prev, aiMsg]);

      // Check if conversation is complete
      if (res.data.is_complete || res.data.response.includes('Thank you') || res.data.response.includes('धन्यवाद')) {
        setTimeout(() => {
          router.push('/prakriti');
        }, 2500);
      }
    }
    setLoading(false);
  };

  const goToHistory = () => {
    router.push('/prakriti');
  };

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

      {/* Progress */}
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

      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '1.5rem', paddingBottom: '2rem', maxWidth: '800px' }}>
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

            {/* Quick Replies */}
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
                  onClick={() => handleVoiceOrTextSubmit(reply)}
                  disabled={loading}
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Voice / Text Input */}
            <VoiceRecorder
              onResult={handleVoiceOrTextSubmit}
              language={isHi ? 'hi-IN' : 'en-US'}
              placeholder={isHi ? 'जवाब यहाँ टाइप करें...' : 'Type answer here...'}
            />

            {/* Skip */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={goToHistory} style={{ fontSize: '0.875rem' }}>
                {isHi ? 'आगे बढ़ें ⏭️' : 'Skip to History ⏭️'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
