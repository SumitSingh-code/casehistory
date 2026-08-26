'use client';

export default function ClinicalSummary({ summary, activeTab = 'overview' }) {
  if (!summary) return null;

  const { allopathic, ayush } = summary;

  const renderSection = (title, content, icon = '📋') => {
    if (!content) return null;
    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h4>
        <p className="text-slate-200 text-sm leading-relaxed pl-6 whitespace-pre-wrap">{content}</p>
      </div>
    );
  };

  const renderJsonSection = (title, data, icon = '📊') => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h4>
        <div className="pl-6 space-y-1">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex gap-2 text-sm">
              <span className="text-slate-500 capitalize min-w-[120px]">{key.replace(/_/g, ' ')}:</span>
              <span className="text-slate-300">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Overview / Allopathic Tab */}
      {(activeTab === 'overview') && allopathic && (
        <div className="glass-card p-6 space-y-1">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🏥 Allopathic Clinical History
          </h3>
          
          {/* Chief Complaint — Highlighted */}
          {allopathic.chief_complaint && (
            <div className="mb-5 p-4 bg-teal-900/20 border border-teal-500/20 rounded-xl">
              <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wide mb-1">Chief Complaint</h4>
              <p className="text-white font-medium">{allopathic.chief_complaint}</p>
            </div>
          )}

          {renderSection('History of Present Illness', allopathic.hpi, '📝')}
          {renderSection('Past Medical History', allopathic.past_medical_history, '🏥')}
          {renderSection('Past Surgical History', allopathic.past_surgical_history, '🔪')}
          {renderSection('Drug History', allopathic.drug_history, '💊')}
          
          {/* Allergy — Red Highlight */}
          {allopathic.allergy_history && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
              <h4 className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-2">
                ⚠️ Allergies
              </h4>
              <p className="text-red-300 text-sm pl-6">{allopathic.allergy_history}</p>
            </div>
          )}

          {renderSection('Family History', allopathic.family_history, '👪')}
          {renderSection('Personal History', allopathic.personal_history, '🧑')}
        </div>
      )}

      {/* AYUSH Tab */}
      {(activeTab === 'ayush') && ayush && (
        <div className="glass-card p-6 space-y-1">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🌿 AYUSH / Ayurvedic Assessment
          </h3>

          {/* Prakriti + Vikriti Highlight */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl text-center">
              <div className="text-xs text-emerald-400 uppercase tracking-wide mb-1">Prakriti</div>
              <div className="text-xl font-bold text-emerald-300">{ayush.prakriti || '—'}</div>
            </div>
            <div className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-xl text-center">
              <div className="text-xs text-amber-400 uppercase tracking-wide mb-1">Vikriti</div>
              <div className="text-sm font-medium text-amber-300">{ayush.vikriti || '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 mb-0.5">Agni Status</div>
              <div className="text-sm font-medium text-slate-200">{ayush.agni_status || '—'}</div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-500 mb-0.5">Koshtha</div>
              <div className="text-sm font-medium text-slate-200">{ayush.koshtha || '—'}</div>
            </div>
          </div>

          {renderSection('Nidana (Causative Factors)', ayush.nidana, '🔍')}
          {renderSection('Samprapti (Pathogenesis)', ayush.samprapti, '🧬')}
          {renderJsonSection('Dosha Assessment', ayush.dosha_assessment, '☯️')}
          {renderJsonSection('Ahara-Vihara (Diet & Lifestyle)', ayush.ahara_vihara, '🍽️')}
          {renderJsonSection('Dashavidha Pariksha', ayush.dashavidha_pariksha, '📊')}
        </div>
      )}

      {/* Documents Tab */}
      {(activeTab === 'documents') && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📄 Uploaded Documents
          </h3>
          <div className="flex flex-col items-center justify-center h-32 text-slate-500">
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm">No documents uploaded for this session.</p>
          </div>
        </div>
      )}
    </div>
  );
}
