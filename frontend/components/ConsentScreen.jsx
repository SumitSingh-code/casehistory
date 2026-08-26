'use client';
import { useState } from 'react';

export default function ConsentScreen({ onConsent }) {
  const [speaking, setSpeaking] = useState(false);

  const speakText = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      
      const text = "Main sehmat hoon ki meri jankari aspatal ke record ke liye istemal ki jaye.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.onend = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  return (
    <div className="card-elevated" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Consent / सहमति</h2>
      
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          मैं अपनी चिकित्सा जानकारी अस्पताल के साथ साझा करने के लिए सहमत हूँ।
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          I consent to sharing my medical information with the hospital for treatment purposes.
        </p>
      </div>
      
      <div className="flex-center" style={{ gap: '1rem', flexDirection: 'column' }}>
        <button 
          className="btn btn-outline" 
          onClick={speakText}
          style={{ width: '100%', maxWidth: '300px' }}
          type="button"
        >
          {speaking ? '🛑 Stop Audio' : '🔊 Padh kar sunayein (Listen)'}
        </button>
        
        <button 
          className="btn btn-success" 
          onClick={onConsent}
          style={{ width: '100%', maxWidth: '300px', fontSize: '1.25rem', height: '64px' }}
          type="button"
        >
          हाँ, सहमत हूँ ✅ (Yes, I Agree)
        </button>
      </div>
    </div>
  );
}
