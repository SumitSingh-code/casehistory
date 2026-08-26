'use client';
import { useState } from 'react';

export default function ConsentScreen({ onConsent, language = 'hi' }) {
  const [speaking, setSpeaking] = useState(false);

  const speakText = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const text = language === 'hi'
      ? 'मैं सहमत हूँ कि मेरी जानकारी अस्पताल के रिकॉर्ड और इलाज के लिए इस्तेमाल की जाए।'
      : 'I consent to sharing my medical information with the hospital for treatment purposes.';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div className="card-glass animate-scale-in" style={{ maxWidth: '550px', margin: '2rem auto', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
      <h2 style={{ marginBottom: '1.5rem' }}>
        {language === 'hi' ? 'सहमति / Consent' : 'Consent'}
      </h2>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '2rem',
        border: '1px solid var(--border)',
      }}>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: '1.7' }}>
          मैं अपनी चिकित्सा जानकारी अस्पताल के साथ साझा करने के लिए सहमत हूँ।
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 0 }}>
          I consent to sharing my medical information with the hospital for treatment purposes.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
        <button
          className="btn btn-outline"
          onClick={speakText}
          style={{ width: '100%', maxWidth: '320px' }}
          type="button"
        >
          {speaking ? '⏹️ Stop' : '🔊 Sunayein (Listen)'}
        </button>

        <button
          className="btn btn-success"
          onClick={onConsent}
          style={{ width: '100%', maxWidth: '320px', fontSize: '1.25rem', height: '64px' }}
          type="button"
        >
          हाँ, सहमत हूँ ✅
        </button>
      </div>
    </div>
  );
}
