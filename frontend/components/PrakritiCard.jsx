'use client';

export default function PrakritiCard({ prakriti, doshaDetails }) {
  const doshaColors = {
    vata: { bg: '#EDE9FE', text: '#7C3AED', emoji: '💨' },
    pitta: { bg: '#FEE2E2', text: '#DC2626', emoji: '🔥' },
    kapha: { bg: '#DBEAFE', text: '#2563EB', emoji: '💧' },
  };

  const currentDosha = doshaColors[prakriti] || doshaColors.vata;

  return (
    <div className="card" style={{
      background: currentDosha.bg,
      borderColor: currentDosha.text,
      textAlign: 'center',
      padding: '1.5rem',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{currentDosha.emoji}</div>
      <h4 style={{ color: currentDosha.text, marginBottom: '0.25rem' }}>
        Prakriti: {(prakriti || 'Unknown').toUpperCase()}
      </h4>
      {doshaDetails && (
        <p style={{ color: currentDosha.text, opacity: 0.8, fontSize: '0.875rem', margin: 0 }}>
          {doshaDetails}
        </p>
      )}
    </div>
  );
}
