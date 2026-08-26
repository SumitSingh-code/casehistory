import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VaidyaAI - Clinical History Taking',
  description: 'AI-powered clinical history taking and AYUSH Prakriti assessment platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0e1a] text-slate-50 min-h-screen flex flex-col antialiased`}>
        <Navbar />
        <main className="flex-grow flex flex-col mt-16 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
