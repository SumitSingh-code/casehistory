'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PAST_ILLNESS_OPTIONS } from '@/lib/constants';
import VoiceRecorder from '@/components/VoiceRecorder';

export default function HistoryPage() {
  const router = useRouter();
  const [pastIllness, setPastIllness] = useState([]);
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);

  const togglePastIllness = (id) => {
    if (id === 'none') {
      setPastIllness(['none']);
      return;
    }
    setPastIllness(prev => {
      const newArr = prev.filter(x => x !== 'none');
      if (newArr.includes(id)) return newArr.filter(x => x !== id);
      return [...newArr, id];
    });
  };

  const toggleFamilyHistory = (id) => {
    if (id === 'none') {
      setFamilyHistory(['none']);
      return;
    }
    setFamilyHistory(prev => {
      const newArr = prev.filter(x => x !== 'none');
      if (newArr.includes(id)) return newArr.filter(x => x !== id);
      return [...newArr, id];
    });
  };

  const handleNext = () => {
    const historyData = {
      pastIllness,
      medications,
      allergies,
      familyHistory
    };
    localStorage.setItem('medicalHistory', JSON.stringify(historyData));
    router.push('/scan');
  };

  return (
    <main className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Medical History</h2>

        <section style={{ marginBottom: '3rem' }}>
          <h3>1. Past Illnesses (Pehlay ki bimariyaan)</h3>
          <div className="grid-3" style={{ marginTop: '1rem' }}>
            {PAST_ILLNESS_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`complaint-icon ${pastIllness.includes(opt.id) ? 'selected' : ''}`}
                onClick={() => togglePastIllness(opt.id)}
                style={{ padding: '1rem' }}
              >
                <span style={{ fontSize: '2rem' }}>{opt.emoji}</span>
                <span style={{ fontWeight: '500' }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h3>2. Current Medications (Abhi chal rahi dawaiyaan)</h3>
          <div style={{ marginTop: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <VoiceRecorder 
              onResult={(text) => setMedications(text)} 
              placeholder="Konsi dawai le rahe hain?" 
            />
            {medications && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)' }}>
                <strong>You added: </strong> {medications}
              </div>
            )}
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h3>3. Allergies (Kisi cheez se allergy)</h3>
          <div style={{ marginTop: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <VoiceRecorder 
              onResult={(text) => setAllergies(text)} 
              placeholder="Koi allergy hai?" 
            />
            {allergies && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)' }}>
                <strong>You added: </strong> {allergies}
              </div>
            )}
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h3>4. Family History (Parivar mein kisi ko bimari)</h3>
          <div className="grid-3" style={{ marginTop: '1rem' }}>
            {PAST_ILLNESS_OPTIONS.map(opt => (
              <button
                key={`fam_${opt.id}`}
                type="button"
                className={`complaint-icon ${familyHistory.includes(opt.id) ? 'selected' : ''}`}
                onClick={() => toggleFamilyHistory(opt.id)}
                style={{ padding: '1rem' }}
              >
                <span style={{ fontSize: '2rem' }}>{opt.emoji}</span>
                <span style={{ fontWeight: '500' }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        <button 
          className="btn btn-primary" 
          onClick={handleNext}
          style={{ width: '100%', fontSize: '1.5rem', padding: '1.5rem' }}
        >
          Next ➡️
        </button>
      </div>
    </main>
  );
}
