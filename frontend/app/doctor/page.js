'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [clinicalData, setClinicalData] = useState(null);
  const [search, setSearch] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPatients = async () => {
    const res = await api.getPatients();
    if (!res.error && res.data) {
      setPatients(res.data);
    }
  };

  const handleSelectPatient = async (p) => {
    setSelectedPatient(p);
    setLoadingSummary(true);
    setClinicalData(null);

    // Fetch full patient data with clinical history
    const res = await api.getPatientFull(p.id);
    if (!res.error && res.data) {
      setClinicalData(res.data.clinical_history || []);
    } else {
      setClinicalData([]);
    }
    setLoadingSummary(false);
  };

  const filteredPatients = patients.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.abha_id || '').includes(search)
  );

  const latestRecord = clinicalData && clinicalData.length > 0 ? clinicalData[0] : null;

  return (
    <div className="doctor-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: 'var(--doc-surface)',
        borderBottom: '1px solid var(--doc-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>👨‍⚕️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>VaidyaAI Dashboard</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Doctor Portal</p>
          </div>
        </div>
        <div style={{
          background: 'rgba(99, 102, 241, 0.2)',
          color: '#818CF8',
          padding: '0.375rem 0.875rem',
          borderRadius: 'var(--radius-full)',
          fontWeight: '700',
          fontSize: '0.875rem',
        }}>
          {patients.length} Patients
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: '340px',
          backgroundColor: 'var(--doc-surface)',
          borderRight: '1px solid var(--doc-border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--doc-border)' }}>
            <input
              type="text"
              className="input"
              placeholder="🔍 Search by name or ABHA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minHeight: '44px', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {patients.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>🏥</div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No patients yet</p>
              </div>
            ) : (
              filteredPatients.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPatient(p)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderBottom: '1px solid var(--doc-border)',
                    backgroundColor: selectedPatient?.id === p.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: 'none',
                    borderLeft: selectedPatient?.id === p.id ? '3px solid var(--doc-accent)' : '3px solid transparent',
                    color: 'var(--doc-text)',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                      {p.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {p.age || '--'}y • {p.gender || '--'}
                      {p.abha_id && ` • ABHA: ${p.abha_id.slice(0, 4)}...`}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#818CF8' }}>
                    {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', backgroundColor: 'var(--doc-bg)' }}>
          {selectedPatient ? (
            <div className="animate-fade-in">
              {/* Patient Header */}
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--doc-border)' }}>
                <h2 style={{ marginBottom: '0.25rem' }}>{selectedPatient.name || 'Unknown Patient'}</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span>🪪 ID: {selectedPatient.id?.slice(0, 8)}...</span>
                  <span>📅 Age: {selectedPatient.age || '--'}</span>
                  <span>⚤ {selectedPatient.gender || '--'}</span>
                  <span>🌐 {selectedPatient.language === 'hi' ? 'Hindi' : 'English'}</span>
                  {selectedPatient.abha_id && <span>🔑 ABHA: {selectedPatient.abha_id}</span>}
                  {selectedPatient.phone && <span>📞 {selectedPatient.phone}</span>}
                </div>
              </div>

              {loadingSummary ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <div className="animate-bounce" style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                  <p style={{ color: 'var(--text-muted)' }}>Loading clinical data...</p>
                </div>
              ) : latestRecord ? (
                <div>
                  {/* Chief Complaint */}
                  <SummaryCard title="🩺 Chief Complaint" color="#6366F1">
                    <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--doc-text)', margin: 0 }}>
                      {latestRecord.chief_complaint || 'Not recorded'}
                    </p>
                  </SummaryCard>

                  {/* HPI */}
                  <SummaryCard title="📝 History of Present Illness" color="#8B5CF6">
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      color: '#CBD5E1',
                      margin: 0,
                      lineHeight: '1.7',
                      fontSize: '0.9375rem',
                    }}>
                      {latestRecord.hpi || 'No details available'}
                    </pre>
                  </SummaryCard>

                  {/* Past History + Allergies */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <SummaryCard title="📚 Past History" color="#22C55E" compact>
                      <p style={{ color: '#CBD5E1', margin: 0 }}>{latestRecord.past_history || 'None reported'}</p>
                    </SummaryCard>
                    <SummaryCard title="⚠️ Allergies" color="#EF4444" compact>
                      <p style={{ color: latestRecord.allergies && latestRecord.allergies !== 'None reported' ? '#F87171' : '#CBD5E1', margin: 0, fontWeight: latestRecord.allergies && latestRecord.allergies !== 'None reported' ? '700' : '400' }}>
                        {latestRecord.allergies || 'None reported'}
                      </p>
                    </SummaryCard>
                  </div>

                  {/* Medications + Family */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <SummaryCard title="💊 Medications" color="#F59E0B" compact>
                      <p style={{ color: '#CBD5E1', margin: 0 }}>{latestRecord.medications || 'None reported'}</p>
                    </SummaryCard>
                    <SummaryCard title="👨‍👩‍👧 Family History" color="#06B6D4" compact>
                      <p style={{ color: '#CBD5E1', margin: 0 }}>{latestRecord.family_history || 'None reported'}</p>
                    </SummaryCard>
                  </div>

                  {/* Prakriti */}
                  {latestRecord.prakriti && latestRecord.prakriti !== 'Not assessed' && (
                    <SummaryCard title="🧘 AYUSH Prakriti" color="#8B5CF6">
                      <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#A78BFA', margin: 0 }}>
                        Dominant Dosha: {latestRecord.prakriti.toUpperCase()}
                      </p>
                    </SummaryCard>
                  )}

                  {/* Documents */}
                  {latestRecord.documents_text && (
                    <SummaryCard title="📄 Scanned Documents (OCR)" color="#64748B">
                      <p style={{ color: '#CBD5E1', margin: 0 }}>{latestRecord.documents_text}</p>
                    </SummaryCard>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📋</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>No clinical data recorded yet</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Patient data will appear here after they complete the intake flow</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ fontSize: '4rem', opacity: 0.3 }}>👨‍⚕️</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                Select a patient from the list
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Summary Card Component ───
function SummaryCard({ title, color, children, compact = false }) {
  return (
    <div style={{
      backgroundColor: 'var(--doc-surface)',
      border: '1px solid var(--doc-border)',
      borderLeft: `4px solid ${color}`,
      borderRadius: 'var(--radius-md)',
      padding: compact ? '1rem' : '1.25rem',
      marginBottom: compact ? 0 : '1rem',
    }}>
      <h4 style={{
        margin: 0,
        marginBottom: '0.75rem',
        fontSize: compact ? '0.875rem' : '1rem',
        color: color,
        fontWeight: '600',
      }}>
        {title}
      </h4>
      {children}
    </div>
  );
}
