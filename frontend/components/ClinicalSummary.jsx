'use client';
import { useState } from 'react';

export default function ClinicalSummary({ summaryData }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!summaryData) return <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>No summary data available.</div>;

  const tabs = [
    { id: 'overview', label: '📋 Overview' },
    { id: 'ayush', label: '🧘 AYUSH' },
    { id: 'documents', label: '📄 Documents' },
  ];

  const renderTabButton = (tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      style={{
        padding: '0.75rem 1.25rem',
        border: 'none',
        borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
        backgroundColor: 'transparent',
        color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
        fontWeight: activeTab === tab.id ? '700' : '500',
        fontSize: '0.9375rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
      }}
      type="button"
    >
      {tab.label}
    </button>
  );

  const SummarySection = ({ title, icon, children }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="section-heading">
        <div className="icon">{icon}</div>
        <h4 style={{ margin: 0 }}>{title}</h4>
      </div>
      {children}
    </div>
  );

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Tabs */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
      }}>
        {tabs.map(renderTabButton)}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'overview' && (
          <div>
            <SummarySection title="Chief Complaints" icon="🩺">
              {summaryData.chiefComplaints?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {summaryData.chiefComplaints.map((cc, i) => (
                    <span key={i} className="badge badge-primary">{cc}</span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No complaints recorded.</p>
              )}
            </SummarySection>

            <SummarySection title="History of Present Illness" icon="📝">
              <p style={{ color: 'var(--text-primary)', lineHeight: '1.7' }}>
                {summaryData.hpi || 'Not available.'}
              </p>
            </SummarySection>

            {summaryData.pastHistory && (
              <SummarySection title="Past History" icon="📚">
                <p style={{ color: 'var(--text-primary)' }}>{summaryData.pastHistory}</p>
              </SummarySection>
            )}

            {summaryData.medications && (
              <SummarySection title="Current Medications" icon="💊">
                <p style={{ color: 'var(--text-primary)' }}>{summaryData.medications}</p>
              </SummarySection>
            )}

            {summaryData.allergies && (
              <SummarySection title="Allergies" icon="⚠️">
                <p style={{ color: 'var(--danger)' }}>{summaryData.allergies}</p>
              </SummarySection>
            )}

            {summaryData.redFlags && summaryData.redFlags.length > 0 && (
              <div style={{
                backgroundColor: 'var(--danger-light)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--danger)',
                marginTop: '1rem',
              }}>
                <strong style={{ color: 'var(--danger)' }}>🚨 Red Flags Detected:</strong>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: 0 }}>
                  {summaryData.redFlags.map((flag, i) => (
                    <li key={i} style={{ color: 'var(--danger-hover)' }}>
                      {flag.display || flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ayush' && (
          <div>
            <SummarySection title="AYUSH Assessment" icon="🧘">
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--secondary-light)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <h5 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Prakriti</h5>
                  <p style={{ color: 'var(--text-primary)', margin: 0 }}>{summaryData.ayush?.prakriti || 'Pending evaluation'}</p>
                </div>
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--info-light)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <h5 style={{ color: 'var(--info)', marginBottom: '0.5rem' }}>Dosha Imbalance</h5>
                  <p style={{ color: 'var(--text-primary)', margin: 0 }}>{summaryData.ayush?.dosha || 'Not recorded'}</p>
                </div>
              </div>
            </SummarySection>

            {summaryData.ayush?.dashavidha && (
              <SummarySection title="Dashavidha Pariksha" icon="📖">
                <p style={{ color: 'var(--text-primary)' }}>{summaryData.ayush.dashavidha}</p>
              </SummarySection>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <SummarySection title="Uploaded Documents" icon="📄">
              {summaryData.documents?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {summaryData.documents.map((doc, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>📎</span>
                      <div>
                        <div style={{ fontWeight: '600' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{doc.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No documents uploaded.</p>
              )}
            </SummarySection>
          </div>
        )}
      </div>
    </div>
  );
}
