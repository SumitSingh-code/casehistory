'use client';
import { useState, useEffect } from 'react';

export default function RedFlagAlert({ show }) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    let timer;
    if (show) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // 10 seconds auto-dismiss
    }
    return () => clearTimeout(timer);
  }, [show]);

  if (!isVisible) return null;

  return (
    <div 
      className="animate-slide-up"
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--danger)',
        color: '#fff',
        padding: '1rem 2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: '90%',
        width: '600px',
        fontWeight: 'bold'
      }}
    >
      <span style={{ fontSize: '1.5rem' }}>🔴</span>
      <p style={{ margin: 0, flex: 1, color: '#fff' }}>
        Aapke lakshan turant dhyaan dene layak hain. Staff ko soochit kiya ja raha hai.
      </p>
      <button 
        onClick={() => setIsVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '1.5rem',
          padding: '0.5rem'
        }}
      >
        ×
      </button>
    </div>
  );
}
