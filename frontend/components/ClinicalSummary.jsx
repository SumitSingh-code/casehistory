'use client';
import { useState } from 'react';

export default function ClinicalSummary({ summaryData }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!summaryData) return <div className="card">No summary data available.</div>;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button 
          className={`btn ${activeTab === 'overview' ? '' : 'btn-outline'}`}
          style={{ 
            borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : 'none',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            backgroundColor: activeTab === 'overview' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)',
            border: 'none',
            minHeight: '48px'
          }}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`btn ${activeTab === 'ayush' ? '' : 'btn-outline'}`}
          style={{ 
            borderBottom: activeTab === 'ayush' ? '3px solid var(--primary)' : 'none',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            backgroundColor: activeTab === 'ayush' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'ayush' ? 'var(--primary)' : 'var(--text-secondary)',
            border: 'none',
            minHeight: '48px'
          }}
          onClick={() => setActiveTab('ayush')}
        >
          AYUSH Details
        </button>
        <button 
          className={`btn ${activeTab === 'documents' ? '' : 'btn-outline'}`}
          style={{ 
            borderBottom: activeTab === 'documents' ? '3px solid var(--primary)' : 'none',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            backgroundColor: activeTab === 'documents' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'documents' ? 'var(--primary)' : 'var(--text-secondary)',
            border: 'none',
            minHeight: '48px'
          }}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
      </div>

      <div>
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Chief Complaints</h3>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              {summaryData.chiefComplaints?.map((cc, i) => (
                <li key={i}>{cc}</li>
              )) || <li>No complaints recorded.</li>}
            </ul>

            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>History of Present Illness</h3>
            <p style={{ color: 'var(--text-primary)' }}>{summaryData.hpi || 'Not available.'}</p>
          </div>
        )}

        {activeTab === 'ayush' && (
          <div className="animate-fade-in">
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>AYUSH specific indicators</h3>
            <div className="grid-2">
              <div className="card" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h4>Prakriti</h4>
                <p>{summaryData.ayush?.prakriti || 'Pending evaluation'}</p>
              </div>
              <div className="card" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h4>Dosha Imbalance</h4>
                <p>{summaryData.ayush?.dosha || 'Not recorded'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="animate-fade-in">
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Uploaded Documents</h3>
            {summaryData.documents?.length > 0 ? (
              <ul style={{ paddingLeft: '1.5rem' }}>
                {summaryData.documents.map((doc, i) => (
                  <li key={i}>{doc.name} - <span style={{ color: 'var(--text-secondary)' }}>{doc.type}</span></li>
                ))}
              </ul>
            ) : (
              <p>No documents uploaded yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
