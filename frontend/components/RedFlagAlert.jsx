'use client';
import { useState, useEffect } from 'react';

export default function RedFlagAlert({ flags }) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayFlags, setDisplayFlags] = useState([]);

  useEffect(() => {
    if (flags && flags.length > 0) {
      setDisplayFlags(flags);
      setIsVisible(true);
    }
  }, [flags]);

  if (!isVisible || displayFlags.length === 0) return null;

  return (
    <div
      className="animate-slide-down"
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--danger)',
        color: '#fff',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '90%',
        width: '550px',
      }}
      role="alert"
    >
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🚨</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, color: '#fff', fontWeight: '700', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
          Emergency Alert
        </p>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.8125rem' }}>
          {displayFlags.map(f => f.display || f.message || f.category).join(' • ')}
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '1.25rem',
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
        }}
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  );
}
