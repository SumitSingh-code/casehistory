import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'VaidyaAI — Smart Patient Intake | AI Clinical History',
  description: 'AI-powered clinical history taking system for Indian hospitals. Supports AYUSH, multilingual voice input, and smart red-flag detection.',
  keywords: 'medical kiosk, patient intake, AYUSH, AI health, clinical history',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
