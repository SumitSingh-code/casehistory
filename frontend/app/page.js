'use client';
import { useRouter } from 'next/navigation';
import { LANGUAGES } from '@/lib/constants';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function WelcomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Wake up Render backend (free tier sleeps after inactivity)
    api.wakeUp();
  }, []);

  const handleLanguageSelect = (langCode) => {
    localStorage.setItem('preferredLanguage', langCode);
    router.push('/register');
  };

  return (
    <main className="flex-center" style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--primary-light) 100%)',
      padding: '2rem',
    }}>
      <div className={mounted ? 'animate-scale-in' : ''} style={{ textAlign: 'center', maxWidth: '560px', width: '100%' }}>
        {/* Logo Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--gradient-hero)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '3rem',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          }}>
            🏥
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            background: 'var(--gradient-hero)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
          }}>
            VaidyaAI
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            marginBottom: 0,
          }}>
            AI-Powered Patient History Taking
          </p>
        </div>

        {/* Language Selection */}
        <div className="card-glass" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>
            भाषा चुनें / Select Language
          </h3>
          <div className="grid-2" style={{ gap: '1rem' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className="btn btn-outline"
                onClick={() => handleLanguageSelect(lang.code)}
                style={{
                  fontSize: '1.375rem',
                  padding: '1.25rem',
                  height: 'auto',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Start */}
        <button
          className="btn btn-primary"
          onClick={() => handleLanguageSelect('hi')}
          style={{
            width: '100%',
            fontSize: '1.375rem',
            padding: '1.25rem',
            height: 'auto',
          }}
        >
          🎙️ शुरू करें / Start
        </button>

        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}>
          Ministry of Ayush • SIH 2024
        </p>

        <button
          onClick={() => router.push('/doctor')}
          style={{
            marginTop: '0.75rem',
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.9375rem',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
        >
          👨‍⚕️ Doctor Portal
        </button>
      </div>
    </main>
  );
}
