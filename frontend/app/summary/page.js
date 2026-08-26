'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SummaryPage() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    buildSummaryFromLocalData();
  }, []);

  // Build summary ONLY from localStorage (actual patient data)
  function buildSummaryFromLocalData() {
    const intakeData = safeJsonParse(localStorage.getItem('intakeData'));
    const historyData = safeJsonParse(localStorage.getItem('medicalHistory'));
    const docs = safeJsonParse(localStorage.getItem('scannedDocuments'));
    const patientData = safeJsonParse(localStorage.getItem('patientData'));

    // Chief complaint from intake
    let complaint = 'Not recorded';
    if (intakeData && intakeData.complaint) {
      complaint = intakeData.complaint;
    }

    // HPI from Q&A answers
    let hpiParts = [];
    if (intakeData && intakeData.answers && intakeData.answers.length > 0) {
      intakeData.answers.forEach(a => {
        const q = a.questionHi || a.question || '';
        const ans = a.answer || '';
        if (q && ans) hpiParts.push(`${q}: ${ans}`);
      });
    }
    if (intakeData && intakeData.extras && intakeData.extras.length > 0) {
      hpiParts.push('अतिरिक्त: ' + intakeData.extras.join(', '));
    }

    // Past history
    let pastHistory = null;
    if (historyData && historyData.pastIllness) {
      const filtered = historyData.pastIllness.filter(x => x && x !== 'none');
      pastHistory = filtered.length > 0 ? filtered.join(', ') : null;
    }

    setSummaryData({
      patientName: patientData?.name || '',
      chiefComplaints: [complaint],
      hpi: hpiParts.length > 0 ? hpiParts.join('\n') : 'No details collected',
      pastHistory: pastHistory,
      medications: historyData?.medications || null,
      allergies: historyData?.allergies || null,
      familyHistory: historyData?.familyHistory?.filter(x => x && x !== 'none')?.join(', ') || null,
      ayush: {
        prakriti: historyData?.prakriti ? `Dominant Dosha: ${historyData.prakriti.toUpperCase()}` : null,
      },
      documents: docs?.map(d => ({ name: d.name })) || [],
    });
    setLoading(false);
  }

  function safeJsonParse(str) {
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  }

  function speakSummary() {
    if (!summaryData || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const lang = localStorage.getItem('preferredLanguage') || 'hi';
    const text = `शिकायत: ${summaryData.chiefComplaints[0]}. ${summaryData.hpi}`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }

  const language = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') || 'hi' : 'hi';
  const isHi = language === 'hi';

  if (loading) {
    return (
      <main className="flex-center" style={{ minHeight: '100vh' }}>
        <p>{isHi ? 'लोड हो रहा है...' : 'Loading...'}</p>
      </main>
    );
  }

  return (
    <main className="animate-fade-in" style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '1.5rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Step 6 of 7</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>
              {isHi ? 'समरी जांचें' : 'Review Summary'}
            </span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: '85%' }} /></div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
          📋 {isHi ? 'जानकारी जांच लें' : 'Review Your Information'}
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isHi ? 'कृपया अपनी जानकारी जांचें और कन्फर्म करें' : 'Please verify and confirm'}
        </p>

        {/* TTS Button */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <button onClick={speakSummary} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
            🔊
          </button>
        </div>

        {summaryData && (
          <div className="card" style={{ padding: '1.5rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem', gap: '0.5rem' }}>
              {[
                { id: 'overview', label: '📋 Overview' },
                { id: 'ayush', label: '🧘 AYUSH' },
                { id: 'documents', label: '📄 Documents' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                    background: 'none',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: activeTab === tab.id ? '600' : '400',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <SectionBlock icon="🩺" title={isHi ? 'मुख्य शिकायत' : 'Chief Complaints'}>
                  {summaryData.chiefComplaints.map((c, i) => (
                    <p key={i} style={{ margin: 0, fontSize: '1.0625rem', fontWeight: '600' }}>{c}</p>
                  ))}
                </SectionBlock>

                <SectionBlock icon="📝" title={isHi ? 'विवरण' : 'History of Present Illness'}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: '1.7' }}>
                    {summaryData.hpi}
                  </pre>
                </SectionBlock>

                {summaryData.pastHistory && (
                  <SectionBlock icon="📚" title={isHi ? 'पुरानी बीमारी' : 'Past History'}>
                    <p style={{ margin: 0 }}>{summaryData.pastHistory}</p>
                  </SectionBlock>
                )}

                {summaryData.medications && (
                  <SectionBlock icon="💊" title={isHi ? 'दवाइयां' : 'Medications'}>
                    <p style={{ margin: 0 }}>{summaryData.medications}</p>
                  </SectionBlock>
                )}

                {summaryData.allergies && (
                  <SectionBlock icon="⚠️" title={isHi ? 'एलर्जी' : 'Allergies'}>
                    <p style={{ margin: 0, color: 'var(--danger)', fontWeight: '600' }}>{summaryData.allergies}</p>
                  </SectionBlock>
                )}

                {summaryData.familyHistory && (
                  <SectionBlock icon="👨‍👩‍👧" title={isHi ? 'पारिवारिक इतिहास' : 'Family History'}>
                    <p style={{ margin: 0 }}>{summaryData.familyHistory}</p>
                  </SectionBlock>
                )}
              </div>
            )}

            {/* AYUSH Tab */}
            {activeTab === 'ayush' && (
              <div>
                <SectionBlock icon="🧘" title="Prakriti Assessment">
                  <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--secondary)' }}>
                    {summaryData.ayush?.prakriti || (isHi ? 'मूल्यांकन नहीं किया गया' : 'Not assessed')}
                  </p>
                </SectionBlock>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                {summaryData.documents.length > 0 ? (
                  summaryData.documents.map((doc, i) => (
                    <div key={i} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                      📄 {doc.name}
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                    {isHi ? 'कोई दस्तावेज़ नहीं' : 'No documents uploaded'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => router.push('/prakriti')}
            style={{ flex: 1 }}
          >
            {isHi ? 'बदलाव करें ✏️' : 'Edit ✏️'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/complete')}
            style={{ flex: 1, background: 'var(--success)', borderColor: 'var(--success)' }}
          >
            {isHi ? 'सब सही है ☑️' : 'Confirm ☑️'}
          </button>
        </div>
      </div>
    </main>
  );
}

function SectionBlock({ icon, title, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '1rem' }}>
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}
