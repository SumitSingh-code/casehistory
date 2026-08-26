'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  // Hide navbar on welcome or kiosk screens
  if (pathname === '/' || pathname === '/welcome' || pathname === '/kiosk') {
    return null;
  }

  return (
    <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--border)', height: '64px', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '1.5rem' }}>
          MediKiosk
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>Home</Link>
          <Link href="/intake" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>Patient Intake</Link>
          <Link href="/doctor" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>Doctor Portal</Link>
        </div>
      </div>
    </nav>
  );
}
