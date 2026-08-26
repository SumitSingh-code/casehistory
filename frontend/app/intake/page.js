'use client';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const lang = localStorage.getItem('preferredLanguage') || 'hi';
    setLanguage(lang);
    const startSession = async () => {
      const patientDataStr = localStorage.getItem('patientData');
      const patientData = patientDataStr ? JSON.parse(patientDataStr) : { abhaId: '000' };
      const res = await api.startIntake({ patient_id: patientData.abhaId || patientData.id, language: lang });
      if (!res.error && res.data) {
        setSessionId(res.data.session_id);
      }
    };
    startSession();
  }, []);

  const handleComplaintSelect = async (id) => {
    setComplaint(id);
    setPhase(2);
    setLoading(true);
    
    // Initial AI prompt based on complaint
    const initialText = language === 'hi' ? 'Aapko yeh kab se ho raha hai? Aur kuch batana chahenge?' : 'How long have you had this? Anything else to add?';
    setMessages([{ role: 'ai', text: initialText }]);
    
    await api.sendMessage(sessionId, `Patient selected: ${id}`, language);
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
      
      if (res.data.is_complete) {
        setTimeout(() => {
          router.push('/history');
        }, 3000);
      }
    }
    setLoading(false);
  };

  const skipToHistory = () => {
    router.push('/history');
  };

  const quickReplies = ['हाँ (Yes)', 'नहीं (No)', 'मुझे और कुछ बताना है'];

  return (
    <main className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <RedFlagAlert flags={redFlags} />
      
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
        
        {phase === 1 && (
          <div style={{ flex: 1 }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {language === 'hi' ? 'आप आज किस वजह से आए हैं?' : 'What brings you here today?'}
            </h2>
            <ComplaintIcons onSelect={handleComplaintSelect} selectedId={complaint} />
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                {language === 'hi' ? 'या बोलकर बताएं 🎙️' : 'Or tell us using voice 🎙️'}
              </h3>
              <VoiceRecorder onResult={(text) => handleComplaintSelect(text)} language={language === 'hi' ? 'hi-IN' : 'en-US'} placeholder="Bolkar batayein / Type here..." />
            </div>
          </div>
        )}

        {phase === 2 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="chat-container" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
              {messages.map((m, i) => (
                <ChatBubble key={i} role={m.role} message={m.text} timestamp={new Date().toLocaleTimeString()} />
              ))}
              {loading && <div style={{ alignSelf: 'flex-start', padding: '1rem', color: 'var(--text-secondary)' }}>Type kar raha hai...</div>}
            </div>
            
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
               <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', justifyContent: 'center' }}>
                 {quickReplies.map(reply => (
                   <button 
                     key={reply} 
                     className="btn btn-outline" 
                     style={{ minHeight: '40px', padding: '0.5rem 1rem' }}
                     onClick={() => handleVoiceOrTextSubmit(reply)}
                     disabled={loading}
                   >
                     {reply}
                   </button>
                 ))}
               </div>
               <VoiceRecorder 
                 onResult={handleVoiceOrTextSubmit} 
                 language={language === 'hi' ? 'hi-IN' : 'en-US'} 
                 placeholder="Jawab yahan type karein..." 
               />
            </div>
          </div>
        )}
      </div>
      
      {phase === 2 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-skip" onClick={skipToHistory}>
            Skip to History ⏭️
          </button>
        </div>
      )}
    </main>
  );
}
