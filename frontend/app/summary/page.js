'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClinicalSummary from '@/components/ClinicalSummary';

export default function SummaryPage() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    // In a real app, this would be a fetch using api.getSummary(sessionId)
    setSummaryData({
      chiefComplaints: ['Fever for 3 days', 'Mild headache'],
      hpi: 'Patient reports having a continuous fever for the past 3 days along with mild headache. No history of vomiting or nausea.',
      ayush: { prakriti: 'Vata-Pitta', dosha: 'Vata aggravated' },
      documents: []
    });
  }, []);

  const playAudio = () => {
    if ('speechSynthesis' in window && summaryData) {
      const text = `Aapki shikayat hai: ${summaryData.chiefComplaints.join(', ')}. Details: ${summaryData.hpi}. Kya yeh jankari sahi hai?`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleConfirm = () => {
    router.push('/complete');
  };

  const handleEdit = () => {
    router.push('/intake');
  };

  return (
    <main className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Review Summary</h2>
        <p>Kripya jankari check karein (Please review your details)</p>
        <button 
          className="icon-btn" 
          onClick={playAudio} 
          style={{ marginTop: '1rem', width: '56px', height: '56px', fontSize: '1.5rem' }}
          aria-label="Listen to summary"
        >
          🔊
        </button>
      </div>

      <ClinicalSummary summaryData={summaryData} />

      <div className="grid-2" style={{ maxWidth: '800px', margin: '2rem auto 0', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={handleEdit} style={{ fontSize: '1.25rem', padding: '1rem' }}>
          बदलाव करें ✏️ (Edit)
        </button>
        <button className="btn btn-success" onClick={handleConfirm} style={{ fontSize: '1.25rem', padding: '1rem' }}>
          सब सही है ✅ (Confirm)
        </button>
      </div>
    </main>
  );
}
