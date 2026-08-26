'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const language = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') || 'hi' : 'hi';
  const isHi = language === 'hi';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
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
    // Simulating OCR for demo — in production, call api.uploadDocument
    setTimeout(() => {
      setOcrResult({ text: 'Patient previously prescribed Paracetamol 500mg, Amoxicillin 250mg. Last visit: 15/07/2024.' });
      setLoading(false);
    }, 2000);
  };

  const skipToSummary = () => {
    router.push('/summary');
  };

  const confirmOcr = () => {
    if (ocrResult) {
      const existing = localStorage.getItem('scannedDocuments');
      const docs = existing ? JSON.parse(existing) : [];
      docs.push({ name: file.name, text: ocrResult.text });
      localStorage.setItem('scannedDocuments', JSON.stringify(docs));
    }
    router.push('/summary');
  };

  return (
    <main className="animate-fade-in" style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      padding: '1.5rem',
    }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Step 5 of 7</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>
              {isHi ? 'दस्तावेज़' : 'Documents'}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '71%' }} />
          </div>
        </div>

        <div className="card-elevated" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📄</div>
          <h2 style={{ marginBottom: '0.5rem' }}>
            {isHi ? 'पुरानी रिपोर्ट / पर्ची?' : 'Old Reports / Prescriptions?'}
          </h2>
          <p style={{ marginBottom: '2rem' }}>
            {isHi ? 'पुराने डॉक्यूमेंट स्कैन करें या स्किप करें' : 'Scan old documents or skip'}
          </p>

          {!preview ? (
            <div className="grid-2" style={{ gap: '1rem' }}>
              <label className="btn btn-primary" style={{
                cursor: 'pointer',
                flexDirection: 'column',
                height: 'auto',
                padding: '2rem 1rem',
                gap: '0.75rem',
              }}>
                <span style={{ fontSize: '2.5rem' }}>📸</span>
                <span style={{ fontSize: '1rem' }}>
                  {isHi ? 'हाँ, स्कैन करें' : 'Yes, Scan'}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                className="btn btn-skip"
                onClick={skipToSummary}
                style={{
                  flexDirection: 'column',
                  height: 'auto',
                  padding: '2rem 1rem',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>⏭️</span>
                <span style={{ fontSize: '1rem' }}>
                  {isHi ? 'नहीं, Skip करें' : 'No, Skip'}
                </span>
              </button>
            </div>
          ) : (
            <div>
              {/* Preview */}
              <div style={{ marginBottom: '1.5rem' }}>
                {file && file.type && file.type.startsWith('image/') ? (
                  <img
                    src={preview}
                    alt="Document preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '280px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  />
                ) : (
                  <div style={{
                    padding: '2rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}>
                    📎 {file?.name || 'Document selected'}
                  </div>
                )}
              </div>

              {!ocrResult ? (
                <div>
                  <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => { setFile(null); setPreview(null); }}
                      disabled={loading}
                    >
                      🔄 {isHi ? 'दोबारा' : 'Retake'}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleUpload}
                      disabled={loading}
                    >
                      {loading ? (isHi ? 'प्रोसेसिंग...' : 'Processing...') : (isHi ? 'स्कैन करें ⬆️' : 'Scan ⬆️')}
                    </button>
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={skipToSummary}
                    style={{ width: '100%' }}
                  >
                    {isHi ? 'Skip करें ⏭️' : 'Skip ⏭️'}
                  </button>
                </div>
              ) : (
                <div className="animate-slide-up" style={{
                  textAlign: 'left',
                  backgroundColor: 'var(--success-light)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--success)',
                  marginBottom: '1.5rem',
                }}>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--success-hover)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ✅ {isHi ? 'स्कैन रिज़ल्ट' : 'Scan Result'}
                  </h4>
                  <p style={{ marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>{ocrResult.text}</p>
                  <div className="grid-2" style={{ gap: '0.75rem' }}>
                    <button className="btn btn-outline" onClick={() => { setFile(null); setPreview(null); setOcrResult(null); }}>
                      ❌ {isHi ? 'फिर से' : 'Redo'}
                    </button>
                    <button className="btn btn-success" onClick={confirmOcr}>
                      ✅ {isHi ? 'सही है' : 'Correct'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
