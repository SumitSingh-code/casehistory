'use client';
// Note: If you need a real QR code, you can use 'qrcode.react' package.
// For now, rendering a dummy styled box representing the QR.

export default function QRSlip({ data = "dummy-data", title = "Scan me" }) {
  return (
    <div className="card" style={{ maxWidth: '300px', margin: '1rem auto', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{title}</h3>
      <div 
        style={{ 
          width: '200px', 
          height: '200px', 
          backgroundColor: '#fff', 
          border: '4px solid var(--text-primary)', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)',
          backgroundPosition: '0 0, 10px 10px',
          backgroundSize: '20px 20px',
          borderRadius: 'var(--radius-sm)'
        }}
      >
        <div style={{ backgroundColor: '#fff', padding: '0.5rem', fontWeight: 'bold' }}>
          QR CODE
        </div>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Show this at the reception
      </p>
    </div>
  );
}
