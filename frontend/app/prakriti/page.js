'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PAST_ILLNESS_OPTIONS, PRAKRITI_QUESTIONS } from '@/lib/constants';
import VoiceRecorder from '@/components/VoiceRecorder';

export default function PrakritiPage() {
  const router = useRouter();
  const [pastIllness, setPastIllness] = useState([]);
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [prakritiAnswers, setPrakritiAnswers] = useState({});
  const [section, setSection] = useState(1); // 1: Medical History, 2: AYUSH Prakriti

  const language = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') || 'hi' : 'hi';
  const isHi = language === 'hi';

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

  const handlePrakritiAnswer = (questionId, dosha) => {
    setPrakritiAnswers(prev => ({ ...prev, [questionId]: dosha }));
  };

  const getDominantDosha = () => {
    const counts = { vata: 0, pitta: 0, kapha: 0 };
    Object.values(prakritiAnswers).forEach(d => {
      if (counts[d] !== undefined) counts[d]++;
    });
    const max = Math.max(...Object.values(counts));
    const dominant = Object.entries(counts).filter(([, v]) => v === max).map(([k]) => k);
    return dominant.join('-');
  };

  const handleNext = () => {
    if (section === 1) {
      setSection(2);
      return;
    }
    // Save all data
    const historyData = {
      pastIllness,
      medications,
      allergies,
      familyHistory,
      prakriti: getDominantDosha(),
      prakritiAnswers,
    };
    localStorage.setItem('medicalHistory', JSON.stringify(historyData));
    router.push('/scan');
  };

  const handleSkipAyush = () => {
    const historyData = { pastIllness, medications, allergies, familyHistory };
    localStorage.setItem('medicalHistory', JSON.stringify(historyData));
    router.push('/scan');
  };

  const progress = section === 1 ? '57%' : '71%';
  const stepLabel = section === 1 ? 'Medical History' : 'AYUSH Assessment';

  return (
    <main className="animate-fade-in" style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      padding: '1.5rem',
    }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Step {section === 1 ? '4' : '5'} of 7</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>{stepLabel}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: progress }} />
          </div>
        </div>

        {/* Section 1: Medical History */}
        {section === 1 && (
          <div className="card-elevated">
            <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
              {isHi ? '🏥 चिकित्सा इतिहास' : '🏥 Medical History'}
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {isHi ? 'अपनी पुरानी बीमारियों की जानकारी दें' : 'Tell us about your medical history'}
            </p>

            {/* Past Illness */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📋</span>
                {isHi ? 'पहले की बीमारियाँ' : 'Past Illnesses'}
              </h4>
              <div className="grid-3 stagger-children" style={{ gap: '0.75rem' }}>
                {PAST_ILLNESS_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`complaint-icon ${pastIllness.includes(opt.id) ? 'selected' : ''}`}
                    onClick={() => togglePastIllness(opt.id)}
                    style={{ padding: '1rem' }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{opt.emoji}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                      {isHi ? (opt.labelHi || opt.label) : opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Medications */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>💊</span>
                {isHi ? 'चल रही दवाइयाँ' : 'Current Medications'}
              </h4>
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}>
                <VoiceRecorder
                  onResult={(text) => setMedications(prev => prev ? `${prev}, ${text}` : text)}
                  placeholder={isHi ? 'कौन सी दवाई ले रहे हैं?' : 'What medications are you taking?'}
                  language={isHi ? 'hi-IN' : 'en-US'}
                />
                {medications && (
                  <div className="animate-slide-up" style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--primary-light)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9375rem',
                  }}>
                    <strong>Added:</strong> {medications}
                  </div>
                )}
              </div>
            </section>

            {/* Allergies */}
            <section style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                {isHi ? 'एलर्जी' : 'Allergies'}
              </h4>
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}>
                <VoiceRecorder
                  onResult={(text) => setAllergies(prev => prev ? `${prev}, ${text}` : text)}
                  placeholder={isHi ? 'किसी चीज़ से एलर्जी है?' : 'Any allergies?'}
                  language={isHi ? 'hi-IN' : 'en-US'}
                />
                {allergies && (
                  <div className="animate-slide-up" style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--warning-light)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9375rem',
                  }}>
                    <strong>Added:</strong> {allergies}
                  </div>
                )}
              </div>
            </section>

            {/* Family History */}
            <section style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>👨‍👩‍👧</span>
                {isHi ? 'परिवार में बीमारियाँ' : 'Family History'}
              </h4>
              <div className="grid-3 stagger-children" style={{ gap: '0.75rem' }}>
                {PAST_ILLNESS_OPTIONS.map(opt => (
                  <button
                    key={`fam_${opt.id}`}
                    type="button"
                    className={`complaint-icon ${familyHistory.includes(opt.id) ? 'selected' : ''}`}
                    onClick={() => toggleFamilyHistory(opt.id)}
                    style={{ padding: '1rem' }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{opt.emoji}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                      {isHi ? (opt.labelHi || opt.label) : opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <button
              className="btn btn-primary"
              onClick={handleNext}
              style={{ width: '100%', fontSize: '1.25rem', padding: '1rem' }}
            >
              {isHi ? 'AYUSH मूल्यांकन करें 🧘' : 'Proceed to AYUSH Assessment 🧘'}
            </button>
          </div>
        )}

        {/* Section 2: AYUSH Prakriti Assessment */}
        {section === 2 && (
          <div className="card-elevated">
            <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
              {isHi ? '🧘 प्रकृति मूल्यांकन' : '🧘 Prakriti Assessment'}
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {isHi ? 'दशविध परीक्षा के अनुसार' : 'As per Dashavidha Pariksha'}
            </p>

            {PRAKRITI_QUESTIONS.map((q, idx) => (
              <section key={q.id} className="animate-slide-up" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: prakritiAnswers[q.id] ? '2px solid var(--primary)' : '1px solid var(--border)',
                animationDelay: `${idx * 0.1}s`,
              }}>
                <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>
                  {idx + 1}. {isHi ? q.questionHi : q.questionEn}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map(opt => (
                    <button
                      key={opt.dosha}
                      type="button"
                      className={`btn ${prakritiAnswers[q.id] === opt.dosha ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handlePrakritiAnswer(q.id, opt.dosha)}
                      style={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        padding: '0.875rem 1rem',
                        minHeight: '48px',
                      }}
                    >
                      {isHi ? opt.labelHi : opt.labelEn}
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '0.75rem',
                        opacity: 0.7,
                      }}>
                        {isHi ? opt.labelEn : opt.labelHi}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}

            {/* Prakriti Result Preview */}
            {Object.keys(prakritiAnswers).length === PRAKRITI_QUESTIONS.length && (
              <div className="animate-scale-in" style={{
                padding: '1.25rem',
                background: 'var(--secondary-light)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}>
                <p style={{ margin: 0, color: 'var(--secondary)', fontWeight: '700' }}>
                  {isHi ? 'आपकी प्रकृति:' : 'Your Prakriti:'} {getDominantDosha().toUpperCase()}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-outline"
                onClick={handleSkipAyush}
                style={{ flex: 1 }}
              >
                {isHi ? 'स्किप करें ⏭️' : 'Skip ⏭️'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                style={{ flex: 2 }}
              >
                {isHi ? 'आगे बढ़ें ➡️' : 'Continue ➡️'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
