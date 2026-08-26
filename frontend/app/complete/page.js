'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TokenDisplay from '@/components/TokenDisplay';
import QRSlip from '@/components/QRSlip';

export default function CompletePage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(15);
  const [token, setToken] = useState('0000');
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    // Generate a dummy token if real one not fetched
    setToken(Math.floor(1000 + Math.random() * 9000).toString());
    const data = localStorage.getItem('patientData');
    if (data) {
      setPatientName(JSON.parse(data).name || '');
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '1rem', color: 'var(--success)' }}>धन्यवाद! (Thank You!)</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Data doctor ko bhej diya gaya hai.</p>

      <TokenDisplay tokenNumber={token} patientName={patientName} />
      
      <div style={{ marginTop: '2rem' }}>
        <QRSlip title="Doctor Access QR" data={token} />
      </div>

      <div style={{ marginTop: '3rem', color: 'var(--text-secondary)' }}>
        Returning to welcome screen in {timeLeft} seconds...
      </div>
    </main>
  );
}
