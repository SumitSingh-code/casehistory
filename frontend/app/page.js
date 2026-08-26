import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-10 pb-20 px-4 overflow-hidden">
      
      {/* Hero Section */}
      <div className="relative w-full max-w-6xl mx-auto text-center z-10 animate-fade-in mt-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[100px] -z-10" />
        
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-sm font-semibold tracking-wide backdrop-blur-md">
          🚀 Next-Gen AI Healthcare
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          Intelligent Clinical <br className="hidden md:block" />
          <span className="text-gradient">History Taking</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          VaidyaAI bridges modern medicine and AYUSH. Talk naturally in your language, and let AI build a comprehensive clinical profile in 2 minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/register" className="glass-button text-lg px-8 py-4 w-full sm:w-auto text-center flex items-center justify-center gap-2">
            Start Patient Intake 
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link href="/doctor" className="px-8 py-4 w-full sm:w-auto text-center text-lg font-medium rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-500 transition-all backdrop-blur-sm text-slate-200">
            Doctor Portal
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-7xl mx-auto mt-32 z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100">Key Capabilities</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-8 group">
            <div className="w-14 h-14 bg-teal-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-teal-500/20 group-hover:scale-110 transition-transform">🎙️</div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Multilingual Voice AI</h3>
            <p className="text-slate-400">Speak naturally in Hindi or English. The AI understands medical context and dialects.</p>
          </div>
          
          <div className="glass-card p-8 group">
            <div className="w-14 h-14 bg-emerald-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">🌿</div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">AYUSH Integration</h3>
            <p className="text-slate-400">Built-in Prakriti assessment seamlessly combined with modern allopathic history.</p>
          </div>
          
          <div className="glass-card p-8 group">
            <div className="w-14 h-14 bg-indigo-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">📄</div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Document OCR</h3>
            <p className="text-slate-400">Scan old lab reports and prescriptions to instantly extract relevant clinical data.</p>
          </div>
          
          <div className="glass-card p-8 group">
            <div className="w-14 h-14 bg-amber-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-amber-500/20 group-hover:scale-110 transition-transform">🚨</div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">Smart Triage</h3>
            <p className="text-slate-400">Automatically detects red flag symptoms and alerts the emergency desk instantly.</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="w-full max-w-7xl mx-auto mt-32 mb-20 z-10">
        <div className="glass p-10 md:p-16 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px]" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-12 text-center">The Patient Journey</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start relative gap-10 md:gap-4">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-teal-500/20 via-emerald-500/50 to-teal-500/20 -z-10" />
            
            {[
              { step: '1', title: 'Register', icon: '📝', desc: 'Basic details & consent' },
              { step: '2', title: 'Chat', icon: '💬', desc: 'AI voice conversation' },
              { step: '3', title: 'Assess', icon: '🧘', desc: 'Prakriti questionnaire' },
              { step: '4', title: 'Scan', icon: '📷', desc: 'Upload past records' },
              { step: '5', title: 'Review', icon: '👨‍⚕️', desc: 'Doctor dashboard' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center max-w-[150px] relative">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-4xl shadow-xl mb-4 z-10 hover:border-teal-400 transition-colors">
                  {item.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-lg z-20">
                  {item.step}
                </div>
                <h4 className="text-lg font-bold text-slate-200 mb-1">{item.title}</h4>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full text-center py-8 text-slate-500 border-t border-white/5 mt-auto z-10">
        <p>Built for Smart India Hackathon. VaidyaAI Prototype.</p>
      </footer>
    </div>
  );
}
