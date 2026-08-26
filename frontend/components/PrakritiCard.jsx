'use client';

export default function PrakritiCard({ question, selectedOption, onSelect }) {
  return (
    <div className="glass-card p-6 md:p-8 animate-fade-in w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-4xl bg-slate-800/80 p-4 rounded-2xl shadow-inner border border-white/5">
          {question.icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-100">{question.title}</h3>
      </div>
      
      <div className="space-y-4">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                isSelected 
                  ? 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'bg-slate-800/40 border-slate-700 hover:border-teal-500/50 hover:bg-slate-700/50'
              }`}
            >
              <span className={`text-[17px] font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-300 group-hover:text-slate-100'}`}>
                {option.label}
              </span>
              <div className={`w-6 h-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors ${
                isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-500 group-hover:border-teal-400'
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
