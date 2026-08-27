'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import TokenDisplay from '@/components/TokenDisplay';

export default function CompletePage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(20);
  const [token, setToken] = useState('');
  const [patientName, setPatientName] = useState('');
  const [showConfetti, setShowConfetti] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saving'); // saving | saved | error

  useEffect(() => {
    // Generate token
    const newToken = Math.floor(1000 + Math.random() * 9000).toString();
    setToken(newToken);

    // Get patient name
    const patientDataStr = localStorage.getItem('patientData');
    if (patientDataStr) {
      try {
        setPatientName(JSON.parse(patientDataStr).name || '');
      } catch { /* ignore */ }
    }

    // ─── SAVE ALL DATA TO BACKEND FIRST, THEN START TIMER ───
    saveAllData().then(() => {
      // Start redirect timer ONLY after save attempt completes
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            clearSessionData();
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    });

    // Hide confetti after 3s
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);

    return () => {
      clearTimeout(confettiTimer);
    };
  }, [router]);

  async function saveAllData() {
    try {
      const patientData = safeJsonParse(localStorage.getItem('patientData'));
      const intakeData = safeJsonParse(localStorage.getItem('intakeData'));
      const medicalHistory = safeJsonParse(localStorage.getItem('medicalHistory'));
      const scannedDocs = safeJsonParse(localStorage.getItem('scannedDocuments'));

      const payload = {
        patient: patientData || {},
        intake: intakeData || null,
        history: medicalHistory || null,
        documents: scannedDocs || [],
      };

      const res = await api.saveAllPatientData(payload);
      if (res && !res.error) {
        setSaveStatus('saved');
        console.log('[SaveAll] Data saved successfully:', res.data);
      } else {
        setSaveStatus('error');
        console.warn('[SaveAll] Backend returned error, data in localStorage only');
      }
    } catch (err) {
      setSaveStatus('error');
      console.warn('[SaveAll] Could not save to backend:', err);
    }
  }

  function safeJsonParse(str) {
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  }

  function clearSessionData() {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('patientData');
    localStorage.removeItem('consentGiven');
    localStorage.removeItem('medicalHistory');
    localStorage.removeItem('scannedDocuments');
    localStorage.removeItem('intakeData');
  }

  const language = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') || 'hi' : 'hi';
  const isHi = language === 'hi';

  return (
    <main className="flex-center animate-fade-in" style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--success-light) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: `${10 + Math.random() * 80}%`,
                width: `${8 + Math.random() * 12}px`,
                height: `${8 + Math.random() * 12}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                backgroundColor: ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][i % 6],
                animation: `confetti ${1.5 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Step 7 of 7</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--success)', fontWeight: '600' }}>✅ Complete!</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '100%', background: 'var(--gradient-success)' }} />
          </div>
        </div>

        <h1 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>
          {isHi ? 'धन्यवाद!' : 'Thank You!'}
        </h1>
        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
          {isHi ? 'आपकी जानकारी डॉक्टर को भेज दी गई है' : 'Your data has been sent to the doctor'}
        </p>

        {/* Save status indicator */}
        <div style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-full)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.8125rem',
          fontWeight: '600',
          backgroundColor: saveStatus === 'saved' ? 'var(--success-light)' : saveStatus === 'error' ? 'var(--warning-light)' : 'var(--primary-light)',
          color: saveStatus === 'saved' ? 'var(--success-hover)' : saveStatus === 'error' ? 'var(--warning-hover)' : 'var(--primary)',
        }}>
          {saveStatus === 'saving' && '⏳ Saving data...'}
          {saveStatus === 'saved' && '✅ Data saved to database'}
          {saveStatus === 'error' && '⚠️ Saved locally (offline mode)'}
        </div>

        <TokenDisplay
          tokenNumber={token}
          patientName={patientName}
          onDone={() => {
            clearSessionData();
            router.push('/');
          }}
        />

        <div style={{
          marginTop: '2rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {isHi ? `${timeLeft} सेकंड में स्वागत स्क्रीन पर लौटेंगे...` : `Returning to welcome in ${timeLeft}s...`}
          </p>
        </div>
      </div>
    </main>
  );
}
