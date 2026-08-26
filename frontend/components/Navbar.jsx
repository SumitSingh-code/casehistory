'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Hide navbar on patient-facing kiosk screens
  const hideOn = ['/', '/register', '/consent', '/intake', '/prakriti', '/scan', '/summary', '/complete', '/history'];
  if (hideOn.includes(pathname)) {
    return null;
  }

  return (
    <nav style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid var(--border)',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏥</span>
          <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
            VaidyaAI
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            href="/doctor"
            style={{
              textDecoration: 'none',
              color: pathname === '/doctor' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.9375rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: pathname === '/doctor' ? 'var(--primary-light)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            👨‍⚕️ Doctor Portal
          </Link>
        </div>
      </div>
    </nav>
  );
}
