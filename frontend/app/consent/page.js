'use client';
import { useRouter } from 'next/navigation';
import ConsentScreen from '@/components/ConsentScreen';

export default function ConsentPage() {
  const router = useRouter();

  const handleConsent = () => {
    localStorage.setItem('consentGiven', 'true');
    router.push('/intake');
  };

  return (
    <main className="flex-center" style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'var(--bg-secondary)',
    }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>
        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Step 2 of 7</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>Consent</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '28%' }} />
          </div>
        </div>

        <ConsentScreen onConsent={handleConsent} />
      </div>
    </main>
  );
}
