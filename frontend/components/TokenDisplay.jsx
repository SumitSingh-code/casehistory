'use client';

export default function TokenDisplay({ tokenNumber, patientName }) {
  const handleCopy = () => {
    if (tokenNumber) {
      navigator.clipboard.writeText(tokenNumber.toString());
      alert('Token copied!');
    }
  };

  return (
    <div className="card-elevated animate-slide-up" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', borderTop: '8px solid var(--success)' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Registration Complete</h2>
      {patientName && <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Thank you, {patientName}</p>}
      
      <div style={{ 
        margin: '2rem 0', 
        padding: '2rem', 
        backgroundColor: 'var(--success-light)', 
        borderRadius: 'var(--radius-lg)',
        border: '2px dashed var(--success)'
      }}>
        <p style={{ color: 'var(--success)', fontWeight: '600', marginBottom: '0.5rem' }}>YOUR TOKEN NUMBER</p>
        <div style={{ fontSize: '4rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '4px' }}>
          {tokenNumber || '----'}
        </div>
      </div>
      
      <div className="flex-center" style={{ gap: '1rem' }}>
        <button className="btn btn-outline" onClick={handleCopy} type="button">
          📋 Copy Token
        </button>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'} type="button">
          Done
        </button>
      </div>
    </div>
  );
}
