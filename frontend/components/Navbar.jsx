'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  // Hide specific links for patient-facing views
  const isDoctorView = pathname.includes('/doctor');

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass z-50 flex items-center px-6 lg:px-12">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/30 group-hover:animate-pulse-glow">
            V
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">
            VaidyaAI
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          {isDoctorView ? (
            <>
              <Link href="/doctor" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">
                Patient Intake
              </Link>
              <Link href="/doctor" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">
                Doctor Portal
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
