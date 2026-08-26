'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [abhaId, setAbhaId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    mobile: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAbhaSubmit = async (e) => {
    e.preventDefault();
    const digits = abhaId.replace(/\D/g, '');
    if (digits.length !== 14) {
      setError('कृपया 14-digit ABHA number दर्ज करें');
      return;
    }
    setError('');
    setLoading(true);

    const lang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') || 'hi' : 'hi';

    // Send ABHA patient to backend
    const patientPayload = {
      abha_id: digits,
      name: 'ABHA Patient',
      age: 0,
      gender: 'Unknown',
      language: lang,
    };

    try {
      const res = await api.createPatient(patientPayload);
      if (!res.error && res.data) {
        localStorage.setItem('patientData', JSON.stringify(res.data));
      } else {
        localStorage.setItem('patientData', JSON.stringify({ abhaId: digits }));
      }
    } catch {
      localStorage.setItem('patientData', JSON.stringify({ abhaId: digits }));
    }

    setLoading(false);
    router.push('/consent');
  };

  const handleNewPatientSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gender) {
      setError('Please select gender');
      return;
    }
    setError('');
    setLoading(true);

    const lang = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') || 'hi' : 'hi';

    // Map frontend fields to backend model fields
    const patientPayload = {
      name: formData.name,
      age: parseInt(formData.age, 10) || 0,
      gender: formData.gender,
      phone: formData.mobile || null,
      language: lang,
    };

    try {
      const res = await api.createPatient(patientPayload);
      if (!res.error && res.data) {
        localStorage.setItem('patientData', JSON.stringify(res.data));
      } else {
        localStorage.setItem('patientData', JSON.stringify(patientPayload));
      }
    } catch {
      localStorage.setItem('patientData', JSON.stringify(patientPayload));
    }

    setLoading(false);
    router.push('/consent');
  };

  const language = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') || 'hi' : 'hi';
  const isHi = language === 'hi';

  return (
    <main className="flex-center animate-fade-in" style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'var(--bg-secondary)',
    }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {/* Progress indicator */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Step 1 of 7</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>Registration</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '14%' }} />
          </div>
        </div>

        <div className="card-elevated">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>
                {isHi ? '🪪 पहचान विवरण' : '🪪 Identity Details'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                {isHi ? 'ABHA ID या नया रजिस्ट्रेशन' : 'ABHA ID or new registration'}
              </p>
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => { setIsNewPatient(!isNewPatient); setError(''); }}
              style={{ minHeight: '40px', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            >
              {isNewPatient ? '🔑 Use ABHA' : '➕ New Patient'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="animate-slide-down" style={{
              color: 'var(--danger)',
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9375rem',
              fontWeight: '500',
            }}>
              {error}
            </div>
          )}

          {/* ABHA Form */}
          {!isNewPatient ? (
            <form onSubmit={handleAbhaSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9375rem' }}>
                  ABHA ID (14 digits)
                </label>
                <input
                  type="text"
                  className="input input-large"
                  placeholder="XX-XXXX-XXXX-XXXX"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value.replace(/\D/g, '').slice(0, 14))}
                  required
                  autoFocus
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 0 }}>
                  Ayushman Bharat Health Account number
                </p>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Processing...' : isHi ? 'आगे बढ़ें ➡️' : 'Continue ➡️'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleNewPatientSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9375rem' }}>
                  {isHi ? 'पूरा नाम' : 'Full Name'}
                </label>
                <input
                  type="text"
                  className="input input-large"
                  placeholder={isHi ? 'नाम लिखें' : 'Enter full name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9375rem' }}>
                  {isHi ? 'उम्र' : 'Age'}
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder={isHi ? 'उम्र लिखें' : 'Enter age'}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  min="0"
                  max="150"
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9375rem' }}>
                  {isHi ? 'लिंग' : 'Gender'}
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { value: 'Male', emoji: '👨', labelHi: 'पुरुष' },
                    { value: 'Female', emoji: '👩', labelHi: 'महिला' },
                    { value: 'Other', emoji: '🧑', labelHi: 'अन्य' }
                  ].map(g => (
                    <button
                      type="button"
                      key={g.value}
                      className={`btn ${formData.gender === g.value ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setFormData({ ...formData, gender: g.value })}
                      style={{ flex: 1, flexDirection: 'column', height: 'auto', padding: '0.75rem', gap: '0.25rem' }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{g.emoji}</span>
                      <span style={{ fontSize: '0.875rem' }}>{isHi ? g.labelHi : g.value}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9375rem' }}>
                  {isHi ? 'मोबाइल नंबर' : 'Mobile Number'}
                </label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+91 XXXXXXXXXX"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !formData.gender}>
                {loading ? 'Processing...' : isHi ? 'रजिस्टर करें ➡️' : 'Register & Continue ➡️'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
