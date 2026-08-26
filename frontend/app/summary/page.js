'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClinicalSummary from '@/components/ClinicalSummary';
import { api } from '@/lib/api';

export default function SummaryPage() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('hi');

  useEffect(() => {
    const lang = localStorage.getItem('preferredLanguage') || 'hi';
    setLanguage(lang);
    const sessionId = localStorage.getItem('sessionId');

    const fetchSummary = async () => {
      if (!sessionId) {
        // Build summary from localStorage for demo
        buildLocalSummary();
        setLoading(false);
        return;
      }

      try {
        await api.generateSummary(sessionId);
        const res = await api.getSummary(sessionId);
        if (!res.error && res.data) {
          setSummaryData(res.data);
        } else {
          buildLocalSummary();
        }
      } catch {
        buildLocalSummary();
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const buildLocalSummary = () => {
    // Build a local summary from stored data
    const historyData = safeJsonParse(localStorage.getItem('medicalHistory'));
    const docs = safeJsonParse(localStorage.getItem('scannedDocuments'));
    const intakeData = safeJsonParse(localStorage.getItem('intakeData'));

    // Build chief complaints from intake data
    let complaints = [];
    let hpiParts = [];
    if (intakeData) {
      complaints = [intakeData.complaint || 'Not recorded'];
      // Build HPI from Q&A
      if (intakeData.answers && intakeData.answers.length > 0) {
        hpiParts = intakeData.answers.map(a => `${a.questionHi || a.question}: ${a.answer}`);
      }
      if (intakeData.extras && intakeData.extras.length > 0) {
        hpiParts.push('Additional: ' + intakeData.extras.join(', '));
      }
    }

    setSummaryData({
      chiefComplaints: complaints.length > 0 ? complaints : ['Not recorded'],
      hpi: hpiParts.length > 0 ? hpiParts.join('\n') : 'No details collected.',
      pastHistory: historyData?.pastIllness?.filter(x => x !== 'none').join(', ') || null,
      medications: historyData?.medications || null,
      allergies: historyData?.allergies || null,
      ayush: {
        prakriti: historyData?.prakriti ? `Dominant: ${historyData.prakriti}` : 'Pending',
        dosha: historyData?.prakriti || 'Not assessed',
      },
      documents: docs?.map(d => ({ name: d.name, type: 'Scanned Document' })) || [],
    });
  };

  const safeJsonParse = (str) => {
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  };

  const playAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !summaryData) return;

    const isHi = language === 'hi';
    const text = isHi
      ? `आपकी शिकायत: ${(summaryData.chiefComplaints || []).join(', ')}. ${summaryData.hpi || ''}. क्या यह सही है?`
      : `Your complaints: ${(summaryData.chiefComplaints || []).join(', ')}. ${summaryData.hpi || ''}. Is this correct?`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHi ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleConfirm = () => {
    router.push('/complete');
  };

  const handleEdit = () => {
    router.push('/intake');
  };

  const isHi = language === 'hi';

  if (loading) {
    return (
      <main className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
        <div className="animate-scale-in" style={{ textAlign: 'center' }}>
          <div className="animate-bounce" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ color: 'var(--primary)' }}>
            {isHi ? 'समरी तैयार हो रही है...' : 'Generating Summary...'}
          </h3>
        </div>
      </main>
    );
  }

  return (
    <main className="animate-fade-in" style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      padding: '1.5rem',
    }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Step 6 of 7</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>
              {isHi ? 'समरी जांचें' : 'Review Summary'}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>
            {isHi ? '📋 जानकारी जांच लें' : '📋 Review Summary'}
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            {isHi ? 'कृपया अपनी जानकारी जांचें और कन्फर्म करें' : 'Please verify your information'}
          </p>
          <button
            className="icon-btn"
            onClick={playAudio}
            style={{ margin: '0 auto' }}
            aria-label="Listen to summary"
          >
            🔊
          </button>
        </div>

        {/* Summary */}
        <ClinicalSummary summaryData={summaryData || {}} />

        {/* Actions */}
        <div className="grid-2" style={{ maxWidth: '500px', margin: '2rem auto 0', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handleEdit} style={{ fontSize: '1.125rem' }}>
            {isHi ? 'बदलाव करें ✏️' : 'Edit ✏️'}
          </button>
          <button className="btn btn-success" onClick={handleConfirm} style={{ fontSize: '1.125rem' }}>
            {isHi ? 'सब सही है ✅' : 'Confirm ✅'}
          </button>
        </div>
      </div>
    </main>
  );
}
