'use client';
import { useState, useEffect } from 'react';

export default function RedFlagAlert({ symptoms = [] }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!symptoms || symptoms.length === 0 || !isVisible) return null;

  return (
    <div className="w-full bg-red-900/90 border-l-4 border-red-500 p-4 shadow-[0_4px_20px_rgba(239,68,68,0.3)] animate-slide-up sticky top-16 z-40 backdrop-blur-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-bold text-red-100 uppercase tracking-wider">Emergency Protocol Activated</h3>
          <div className="mt-2 text-sm text-red-200">
            <p className="font-semibold mb-1">Detected severe symptoms:</p>
            <ul className="list-disc pl-5 space-y-1">
              {symptoms.map((sym, idx) => (
                <li key={idx}>{sym}</li>
              ))}
            </ul>
            <p className="mt-3 font-bold bg-red-950/50 inline-block px-3 py-1 rounded">
              Alert Sent to Triage immediately. Please proceed to the emergency desk.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-auto text-red-300 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
