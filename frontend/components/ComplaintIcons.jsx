'use client';
import { COMPLAINT_ICONS } from '@/lib/constants';

export default function ComplaintIcons({ onSelect, selectedId }) {
  return (
    <div className="grid-2" style={{ gap: '1.5rem' }}>
      {COMPLAINT_ICONS.map((complaint) => {
        const isSelected = selectedId === complaint.id;
        return (
          <button
            key={complaint.id}
            className={`complaint-icon ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(complaint.id)}
            type="button"
          >
            <span className="emoji">{complaint.emoji}</span>
            <span className="label">
              <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{complaint.labelHi}</div>
              <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{complaint.label}</div>
            </span>
          </button>
        );
      })}
    </div>
  );
}
