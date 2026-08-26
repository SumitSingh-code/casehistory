'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrakritiRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/history');
  }, [router]);

  return <div style={{ padding: '2rem', textAlign: 'center' }}>Redirecting...</div>;
}
