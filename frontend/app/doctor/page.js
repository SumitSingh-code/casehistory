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

  useEffect(() => {
    // Dummy data fetching
    const fetchPatients = async () => {
      // In real app: const res = await api.getPatients();
      setPatients([
        { id: '1', name: 'Ramesh Kumar', age: 45, gender: 'Male', priority: 'high', token: '4512' },
        { id: '2', name: 'Sita Devi', age: 32, gender: 'Female', priority: 'medium', token: '8791' },
        { id: '3', name: 'Arun Singh', age: 28, gender: 'Male', priority: 'low', token: '1023' }
      ]);
    };
    fetchPatients();
  }, []);

  const handleSelectPatient = async (p) => {
    setSelectedPatient(p);
    setLoadingSummary(true);
    // Simulating API call: api.generateSummary(p.id)
    setTimeout(() => {
      setSummaryData({
        chiefComplaints: ['Severe chest pain', 'Sweating'],
        hpi: 'Patient reports severe squeezing chest pain for the last 2 hours. Accompanied by sweating and shortness of breath.',
        ayush: { prakriti: 'Pitta', dosha: 'Pitta aggravated' },
        documents: [{ name: 'ECG_Previous.pdf', type: 'PDF' }]
      });
      setLoadingSummary(false);
    }, 1000);
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.token.includes(search));

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'var(--danger)';
    if (priority === 'medium') return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="doctor-theme" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem 2rem', backgroundColor: 'var(--doc-surface)', borderBottom: '1px solid var(--doc-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>👨‍⚕️ MediKiosk Doctor Dashboard</h1>
        <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
          {patients.length} in Queue
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '350px', backgroundColor: 'var(--doc-surface)', borderRight: '1px solid var(--doc-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--doc-border)' }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Search patients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ backgroundColor: 'var(--doc-bg)', color: 'var(--doc-text)', borderColor: 'var(--doc-border)' }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredPatients.map(p => (
              <div 
                key={p.id} 
                onClick={() => handleSelectPatient(p)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--doc-border)',
                  backgroundColor: selectedPatient?.id === p.id ? 'var(--doc-border)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{p.age}y • {p.gender}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                   <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: getPriorityColor(p.priority) }}></div>
                   <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--doc-text)' }}>#{p.token}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: 'var(--doc-bg)' }}>
          {selectedPatient ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2>{selectedPatient.name}</h2>
                  <p style={{ margin: 0 }}>ID: {selectedPatient.id} • {selectedPatient.age} years • {selectedPatient.gender}</p>
                </div>
                <div className="flex-center" style={{ gap: '1rem' }}>
                  <button className="btn btn-outline" style={{ borderColor: 'var(--doc-border)', color: 'var(--doc-text)' }}>Edit Summary</button>
                  <button className="btn btn-success">Accept Patient</button>
                </div>
              </div>

              {loadingSummary ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading clinical summary...</div>
              ) : (
                <div className="doctor-theme">
                  <ClinicalSummary summaryData={summaryData} />
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '1.25rem' }}>
              Select a patient from the queue to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
