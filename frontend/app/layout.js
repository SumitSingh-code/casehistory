import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'MediKiosk - Smart Patient Intake',
  description: 'Medical kiosk software for Indian hospitals.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
