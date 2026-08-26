'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ClinicalSummary from '@/components/ClinicalSummary';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const res = await api.getPatients();
      if (!res.error && res.data) {
        setPatients(res.data);
      }
    };
    fetchPatients();
    // Poll every 30 seconds for new patients
    const interval = setInterval(fetchPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPatient = async (p) => {
    setSelectedPatient(p);
    setLoadingSummary(true);
    setSummaryData(null);

    const sessionId = p.session_id || p.id;

    try {
      await api.generateSummary(sessionId);
      const res = await api.getSummary(sessionId);
      if (!res.error && res.data) {
        setSummaryData(res.data);
      }
    } catch {
      setSummaryData(null);
    }

    setLoadingSummary(false);
  };

  const filteredPatients = patients.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.token || '').toString().includes(search)
  );

  const getPriorityColor = (priority) => {
    if (priority === 'high' || priority === 'flagged') return 'var(--danger)';
    if (priority === 'medium') return 'var(--warning)';
    return 'var(--success)';
  };

  const getPriorityLabel = (priority) => {
    if (priority === 'high' || priority === 'flagged') return '🔴 Urgent';
    if (priority === 'medium') return '🟡 Medium';
    return '🟢 Normal';
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#818CF8',
            padding: '0.375rem 0.875rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: '700',
            fontSize: '0.875rem',
          }}>
            {patients.length} in Queue
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar - Patient Queue */}
        <div style={{
          width: sidebarOpen ? '340px' : '0px',
          backgroundColor: 'var(--doc-surface)',
          borderRight: '1px solid var(--doc-border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Search */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--doc-border)' }}>
            <input
              type="text"
              className="input"
              placeholder="🔍 Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minHeight: '44px', fontSize: '0.875rem' }}
            />
          </div>

          {/* Patient List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {patients.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>🏥</div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No patients in queue</p>
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
                      {p.name || 'Unknown Patient'}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {p.age || '--'}y • {p.gender || '--'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: getPriorityColor(p.priority),
                    }} />
                    <div style={{
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: 'var(--doc-text)',
                      opacity: 0.8,
                    }}>
                      #{p.token || '---'}
                    </div>
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
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}>
                <div>
                  <h2 style={{ marginBottom: '0.25rem' }}>{selectedPatient.name || 'Unknown Patient'}</h2>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      ID: {selectedPatient.id}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {selectedPatient.age || '--'} years
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {selectedPatient.gender || '--'}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: selectedPatient.priority === 'flagged' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: selectedPatient.priority === 'flagged' ? '#F87171' : '#4ADE80',
                      fontWeight: '600',
                    }}>
                      {getPriorityLabel(selectedPatient.priority)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-outline" style={{
                    minHeight: '44px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                  }}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-success" style={{
                    minHeight: '44px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                  }}>
                    ✅ Accept
                  </button>
                </div>
              </div>

              {/* Summary Content */}
              {loadingSummary ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <div className="animate-bounce" style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                  Loading clinical summary...
                </div>
              ) : summaryData ? (
                <div className="doctor-theme">
                  <ClinicalSummary summaryData={summaryData} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>📋</div>
                  No clinical summary available for this patient.
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
                Select a patient from the queue
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
