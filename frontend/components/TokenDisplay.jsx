'use client';
import { useState, useEffect } from 'react';

export default function TokenDisplay({ tokenNumber, patientName, onDone }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!tokenNumber) return;
    try {
      await navigator.clipboard.writeText(tokenNumber.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      setCopied(false);
    }
  };

  return (
    <div className="card-elevated animate-scale-in" style={{
      maxWidth: '480px',
      margin: '0 auto',
      textAlign: 'center',
      borderTop: '6px solid var(--success)',
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎉</div>
      <h2 style={{ marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Registration Complete!</h2>
      {patientName && (
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Thank you, <strong>{patientName}</strong>
        </p>
      )}

      <div style={{
        margin: '1.5rem 0',
        padding: '1.5rem',
        background: 'var(--success-light)',
        borderRadius: 'var(--radius-lg)',
        border: '2px dashed var(--success)',
      }}>
        <p style={{ color: 'var(--success-hover)', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your Token Number
        </p>
        <div style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '6px',
          lineHeight: 1.2,
        }}>
          {tokenNumber || '----'}
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
        Data doctor ko bhej diya gaya hai 📨
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={handleCopy} type="button" style={{ minWidth: '140px' }}>
          {copied ? '✅ Copied!' : '📋 Copy Token'}
        </button>
        {onDone && (
          <button className="btn btn-primary" onClick={onDone} type="button" style={{ minWidth: '140px' }}>
            Done ✓
          </button>
        )}
      </div>
    </div>
  );
}
