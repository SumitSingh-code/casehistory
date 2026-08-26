'use client';
import { useState, useEffect, useRef } from 'react';

export default function VoiceRecorder({ onResult, language = 'hi-IN', placeholder = 'Type here...' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('Tap mic to speak');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language;

        recognitionRef.current.onstart = () => {
          setIsRecording(true);
          setStatus('Listening...');
        };

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setText(transcript);
          if (onResult) onResult(transcript);
          setStatus('Tap mic to speak');
          setIsRecording(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            setStatus('Mic permission denied - type below');
          } else {
            setStatus('Error occurred - please type');
          }
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          if (status === 'Listening...') {
             setStatus('Tap mic to speak');
          }
        };
      } else {
        setIsSupported(false);
        setStatus('Mic not available - type below');
      }
    }
  }, [language, onResult, status]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Could not start recognition:", e);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && onResult) {
      onResult(text);
      setText('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex-center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
        <button 
          onClick={toggleRecording} 
          disabled={!isSupported}
          className={`icon-btn ${isRecording ? 'animate-pulse' : ''}`}
          style={{ 
            width: '80px', height: '80px', fontSize: '2rem', 
            backgroundColor: isRecording ? 'var(--danger)' : (isSupported ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'),
            color: isRecording ? 'white' : 'inherit'
          }}
          type="button"
        >
          {isRecording ? '🛑' : '🎙️'}
        </button>
        <p style={{ fontWeight: '500', color: isRecording ? 'var(--danger)' : 'var(--text-secondary)' }}>
          {status}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          className="input input-large" 
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  );
}
