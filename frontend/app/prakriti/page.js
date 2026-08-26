'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRAKRITI_QUESTIONS } from '../../lib/constants';
import PrakritiCard from '../../components/PrakritiCard';

export default function PrakritiPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const handleSelect = (optionId) => {
    const questionId = PRAKRITI_QUESTIONS[currentIndex].id;
    setAnswers({ ...answers, [questionId]: optionId });
    
    // Auto advance after short delay
    setTimeout(() => {
      if (currentIndex < PRAKRITI_QUESTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsComplete(true);
      }
    }, 400);
  };

  const progress = ((currentIndex + (isComplete ? 1 : 0)) / PRAKRITI_QUESTIONS.length) * 100;

  const handleSubmit = () => {
    // Mock save, proceed to scan
    router.push('/scan');
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">AYUSH Prakriti Assessment</h1>
        <p className="text-slate-400">Understanding your body constitution helps in personalized holistic care.</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto mb-10">
        <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
          <span>Question {Math.min(currentIndex + 1, PRAKRITI_QUESTIONS.length)} of {PRAKRITI_QUESTIONS.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questionnaire */}
      {!isComplete ? (
        <div className="flex-1 w-full">
          <PrakritiCard 
            question={PRAKRITI_QUESTIONS[currentIndex]}
            selectedOption={answers[PRAKRITI_QUESTIONS[currentIndex].id]}
            onSelect={handleSelect}
          />
          
          <div className="flex justify-between max-w-2xl mx-auto mt-8">
            <button 
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-2 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-colors font-medium"
            >
              ← Previous
            </button>
            <button 
              onClick={() => setCurrentIndex(Math.min(PRAKRITI_QUESTIONS.length - 1, currentIndex + 1))}
              disabled={!answers[PRAKRITI_QUESTIONS[currentIndex].id]}
              className="px-6 py-2 bg-slate-800 rounded-lg text-white disabled:opacity-50 hover:bg-slate-700 transition-colors font-medium border border-slate-600"
            >
              Skip
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center max-w-2xl mx-auto animate-slide-up">
          <div className="w-24 h-24 bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500 text-5xl">
            🌿
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Assessment Complete</h2>
          <p className="text-slate-300 mb-8">
            Thank you. Your Prakriti profile has been generated and integrated into your clinical history.
          </p>
          <button 
            onClick={handleSubmit}
            className="glass-button w-full text-lg py-4"
          >
            Continue to Document Upload
          </button>
        </div>
      )}
    </div>
  );
}
