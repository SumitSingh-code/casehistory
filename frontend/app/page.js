'use client';
import { useRouter } from 'next/navigation';
import { LANGUAGES } from '@/lib/constants';

export default function WelcomePage() {
  const router = useRouter();

  const handleLanguageSelect = (langCode) => {
    localStorage.setItem('preferredLanguage', langCode);
    router.push('/register');
  };

  return (
    <main className="flex-center animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          MediKiosk 🏥
        </h1>
        <p className="animate-bounce" style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          AI-Powered Patient History Taking
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Select Language / भाषा चुनें</h2>
          <div className="grid-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className="btn btn-outline"
                onClick={() => handleLanguageSelect(lang.code)}
                style={{ fontSize: '1.5rem', padding: '1.5rem' }}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => handleLanguageSelect('hi')}
          style={{ width: '100%', fontSize: '1.5rem', padding: '1rem', marginTop: '1rem' }}
        >
          🎙️ शुरू करें / Start
        </button>
      </div>
    </main>
  );
}
