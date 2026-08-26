'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClinicalSummary from '../../components/ClinicalSummary';
import { api } from '../../lib/api';

export default function SummaryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const sessionId = localStorage.getItem('vaidya_session_id');
    if (sessionId) {
      loadOrGenerateSummary(sessionId);
    } else {
      setLoading(false);
      setError('No session found. Please complete the intake process first.');
    }
  }, []);

  const loadOrGenerateSummary = async (sessionId) => {
    setLoading(true);
    
    // Try to get existing summary
    const existing = await api.getSummary(sessionId);
    if (!existing.error && existing.data && existing.data.chief_complaint) {
      formatAndSetSummary(existing.data);
      setLoading(false);
      return;
    }

    // Generate new summary from conversation
    setGenerating(true);
    const generated = await api.generateSummary(sessionId);
    setGenerating(false);
    
    if (!generated.error && generated.data) {
      formatAndSetSummary(generated.data);
    } else {
      setError('Could not generate summary. Please try again.');
    }
    setLoading(false);
  };

  const formatAndSetSummary = (data) => {
    setSummaryData({
      allopathic: {
        chief_complaint: data.chief_complaint,
        hpi: data.hpi,
        past_medical_history: data.past_medical_history,
        past_surgical_history: data.past_surgical_history,
        drug_history: data.drug_history,
        allergy_history: data.allergy_history,
        family_history: data.family_history,
        personal_history: data.personal_history,
      },
      ayush: {
        prakriti: data.prakriti,
        vikriti: data.vikriti,
        agni_status: data.agni_status,
        koshtha: data.koshtha,
        nidana: data.nidana,
        samprapti: data.samprapti,
        dosha_assessment: data.dosha_assessment,
        ahara_vihara: data.ahara_vihara,
        dashavidha_pariksha: data.dashavidha_pariksha,
      },
      ai_summary: data.ai_summary,
      ai_summary_hindi: data.ai_summary_hindi,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = () => {
    router.push('/doctor');
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📋 Clinical Summary Review</h1>
          <p className="text-slate-400">Please review the AI-generated history before submission.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition border border-slate-600 flex items-center gap-2">
            🖨️ Print
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 shadow-lg shadow-teal-500/20 transition">
            Go to Doctor Dashboard →
          </button>
        </div>
      </div>

      {/* Tabs */}
      {summaryData && (
        <div className="flex gap-1 mb-6 bg-slate-800/50 p-1 rounded-xl w-fit">
          {['overview', 'ayush'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {tab === 'overview' ? '🏥 Allopathic' : '🌿 AYUSH'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">
            {generating ? '🤖 AI is generating your clinical summary...' : 'Loading summary...'}
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-slate-400 mb-4">{error}</p>
          <button onClick={() => router.push('/register')} className="glass-button">
            Start New Registration
          </button>
        </div>
      ) : summaryData ? (
        <div className="space-y-6">
          <ClinicalSummary summary={summaryData} activeTab={activeTab} />
          
          {summaryData.ai_summary && (
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-3 text-teal-400">🤖 AI Clinical Summary</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                {summaryData.ai_summary}
              </p>
              {summaryData.ai_summary_hindi && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-slate-400 leading-relaxed whitespace-pre-wrap text-sm">
                    {summaryData.ai_summary_hindi}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
