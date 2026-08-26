'use client';
import { useRouter } from 'next/navigation';

export default function ConsentPage() {
  const router = useRouter();

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      const text = "We value your privacy. Your data will only be shared with your doctor for medical purposes. Do you agree to proceed?";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAgree = () => {
    router.push('/intake');
  };

  return (
    <main className="container flex-center animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Data Privacy Consent</h2>
        
        <p style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          हम आपकी निजता का सम्मान करते हैं। आपकी जानकारी केवल आपके इलाज के लिए डॉक्टर के साथ साझा की जाएगी।
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          We value your privacy. Your data will only be shared with your doctor for medical purposes.
        </p>

        <button 
          className="icon-btn" 
          onClick={playAudio} 
          style={{ marginBottom: '2rem', width: '64px', height: '64px', fontSize: '1.5rem' }}
          aria-label="Listen to consent text"
        >
          🔊
        </button>

        <div>
          <button 
            className="btn btn-success" 
            onClick={handleAgree}
            style={{ width: '100%', fontSize: '1.5rem', padding: '1rem' }}
          >
            हाँ, सहमत हूँ ✅
          </button>
        </div>
      </div>
    </main>
  );
}
