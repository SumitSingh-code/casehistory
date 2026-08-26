'use client';
import { useState, useEffect, useRef } from 'react';

export default function VoiceRecorder({ onTranscript, language = 'en-IN', isListeningProp = false }) {
  const [isListening, setIsListening] = useState(isListeningProp);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      // Ignore some errors like no-speech
      if (event.error !== 'no-speech') {
        setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscript]);

  const toggleRecording = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <button
        onClick={toggleRecording}
        className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse' 
            : 'bg-teal-500 hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]'
        }`}
        disabled={!!error}
      >
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75" />
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isListening ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> // Stop icon approximation
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /> // Mic
          )}
        </svg>
      </button>
      {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
      <p className="text-slate-400 text-sm mt-4 font-medium">
        {isListening ? 'Listening...' : 'Tap to speak'}
      </p>
    </div>
  );
}
