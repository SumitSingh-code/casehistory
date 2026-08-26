'use client';
import { useState, useRef, useCallback } from 'react';

export default function VoiceRecorder({ onResult, language = 'hi-IN', placeholder = 'Type here...' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const initializedRef = useRef(false);

  const initRecognition = useCallback(() => {
    if (initializedRef.current) return;
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setStatus('Voice not available');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsRecording(true);
      setStatus('🎤 Listening...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      if (onResult) onResult(transcript);
      setStatus('');
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        setStatus('Mic blocked — type below');
      } else if (event.error === 'no-speech') {
        setStatus('No speech detected — try again');
      } else {
        setStatus('Error — please type instead');
      }
      setTimeout(() => setStatus(''), 3000);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    initializedRef.current = true;
  }, [language, onResult]);

  const toggleRecording = () => {
    initRecognition();
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Could not start recognition:', e);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && onResult) {
      onResult(text.trim());
      setText('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      {/* Mic Button */}
      <div className="flex-center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={toggleRecording}
          disabled={!isSupported}
          className={isRecording ? 'animate-mic-pulse' : ''}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '2rem',
            cursor: isSupported ? 'pointer' : 'not-allowed',
            background: isRecording
              ? 'var(--danger)'
              : isSupported
                ? 'var(--gradient-hero)'
                : 'var(--bg-tertiary)',
            color: isRecording || isSupported ? '#fff' : 'var(--text-muted)',
            boxShadow: isRecording
              ? '0 0 0 0 rgba(239, 68, 68, 0.5)'
              : isSupported
                ? '0 4px 14px rgba(99, 102, 241, 0.3)'
                : 'none',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          type="button"
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? '⏹️' : '🎙️'}
        </button>
        {status && (
          <p style={{
            fontWeight: '500',
            fontSize: '0.875rem',
            color: isRecording ? 'var(--danger)' : 'var(--text-secondary)',
            margin: 0,
          }}>
            {status}
          </p>
        )}
      </div>

      {/* Text Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="input"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!text.trim()}
          style={{ minWidth: '80px' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
