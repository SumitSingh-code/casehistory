'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/prakriti');
  }, [router]);

  return (
    <div className="flex-center" style={{ minHeight: '100vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Redirecting...</p>
    </div>
  );
}
