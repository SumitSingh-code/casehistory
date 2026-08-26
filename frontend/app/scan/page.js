'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ScanPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    // Simulating document upload and OCR for now
    setTimeout(() => {
      setOcrResult({ text: 'Patient previously prescribed Paracetamol 500mg, Amoxicillin.' });
      setLoading(false);
    }, 2000);
  };

  const skipToSummary = () => {
    router.push('/summary');
  };

  const confirmOcr = () => {
    router.push('/summary');
  };

  return (
    <main className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Purani Parchi ya Report?</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          Do you have any old prescriptions or lab reports to scan?
        </p>

        {!preview ? (
          <div className="grid-2" style={{ gap: '1rem' }}>
            <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: 'auto', padding: '2rem 1rem' }}>
              <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</span>
              <span>हाँ, है मेरे पास (Scan)</span>
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            <button className="btn btn-skip" onClick={skipToSummary} style={{ display: 'flex', flexDirection: 'column', height: 'auto', padding: '2rem 1rem' }}>
              <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏭️</span>
              <span>नहीं, Skip करें</span>
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              {file.type.startsWith('image/') ? (
                <img src={preview} alt="Document preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)' }} />
              ) : (
                <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  Document selected: {file.name}
                </div>
              )}
            </div>

            {!ocrResult ? (
              <div className="grid-2" style={{ gap: '1rem' }}>
                <button className="btn btn-outline" onClick={() => { setFile(null); setPreview(null); }} disabled={loading}>
                  Retake 🔄
                </button>
                <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
                  {loading ? 'Processing...' : 'Upload & Scan ⬆️'}
                </button>
              </div>
            ) : (
              <div className="animate-slide-up" style={{ textAlign: 'left', backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Scan Result (Kya ye sahi hai?):</h4>
                <p style={{ marginBottom: '1.5rem' }}>{ocrResult.text}</p>
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => { setFile(null); setPreview(null); setOcrResult(null); }}>
                    Nahi, phir se karein ❌
                  </button>
                  <button className="btn btn-success" onClick={confirmOcr}>
                    Haan, theek hai ✅
                  </button>
                </div>
              </div>
            )}
            
            {!ocrResult && (
              <div style={{ marginTop: '2rem' }}>
                <button className="btn btn-skip" onClick={skipToSummary} style={{ width: '100%' }}>
                  Skip to Summary ⏭️
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
