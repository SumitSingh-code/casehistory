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
    if (abhaId.replace(/\D/g, '').length !== 14) {
      setError('Kripya 14-digit ABHA number darj karein');
      return;
    }
    setError('');
    setLoading(true);
    // Simulating API call for ABHA
    localStorage.setItem('patientData', JSON.stringify({ abhaId }));
    router.push('/consent');
  };

  const handleNewPatientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await api.createPatient(formData);
    setLoading(false);
    if (!res.error) {
      localStorage.setItem('patientData', JSON.stringify(res.data || formData));
      router.push('/consent');
    } else {
      setError('Registration failed: ' + res.message);
    }
  };

  return (
    <main className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2>Identity Details</h2>
          <button 
            className="btn btn-outline" 
            onClick={() => setIsNewPatient(!isNewPatient)}
          >
            {isNewPatient ? 'Use ABHA ID' : 'New Patient'}
          </button>
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--danger-light)', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        {!isNewPatient ? (
          <form onSubmit={handleAbhaSubmit}>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                ABHA ID (14 digits)
              </label>
              <input
                type="text"
                className="input input-large"
                placeholder="14-digit number"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value.replace(/\D/g, '').slice(0, 14))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Processing...' : 'Aage Badhein ➡️'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNewPatientSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
              <input
                type="text"
                className="input input-large"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Age</label>
              <input
                type="number"
                className="input input-large"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Gender</label>
              <div className="grid-3">
                {['Male', 'Female', 'Other'].map(g => (
                  <button
                    type="button"
                    key={g}
                    className={`btn ${formData.gender === g ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFormData({ ...formData, gender: g })}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Mobile Number</label>
              <input
                type="tel"
                className="input input-large"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !formData.gender}>
              {loading ? 'Processing...' : 'Register & Continue ➡️'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
