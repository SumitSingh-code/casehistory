'use client';
import { COMPLAINT_ICONS } from '@/lib/constants';

export default function ComplaintIcons({ onSelect, selectedId, language = 'hi' }) {
  return (
    <div className="grid-3 stagger-children" style={{ gap: '1rem' }}>
      {COMPLAINT_ICONS.map((complaint) => {
        const isSelected = selectedId === complaint.id;
        return (
          <button
            key={complaint.id}
            className={`complaint-icon ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(complaint.id)}
            type="button"
            aria-label={complaint.label}
          >
            <span className="emoji">{complaint.emoji}</span>
            <span className="label">
              <div style={{ fontSize: '1.125rem', marginBottom: '0.125rem' }}>
                {language === 'hi' ? complaint.labelHi : complaint.label}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                {language === 'hi' ? complaint.label : complaint.labelHi}
              </div>
            </span>
          </button>
        );
      })}
    </div>
  );
}
