'use client';
import { useState, useEffect } from 'react';
import ClinicalSummary from '../../components/ClinicalSummary';
import QRSlip from '../../components/QRSlip';
import { api } from '../../lib/api';

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Seed/fallback demo data
  const seedQueue = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      session_id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Ramesh Kumar', age: 58, gender: 'male',
      status: 'flagged', symptom: 'Chest Burning / Acid Reflux',
      time: '2 hrs ago', priority: 'flagged',
    },
    {
      id: 'demo-2', session_id: null,
      name: 'Sunita Devi', age: 42, gender: 'female',
      status: 'waiting', symptom: 'Chronic Joint Pain',
      time: '45 mins ago', priority: 'normal',
    },
    {
      id: 'demo-3', session_id: null,
      name: 'Arvind Singh', age: 35, gender: 'male',
      status: 'emergency', symptom: 'Severe Chest Pain + Dyspnea',
      time: '5 mins ago', priority: 'emergency',
    },
  ];

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    const result = await api.getPatients();
    if (!result.error && result.data) {
      // Merge real patients with seed data
      const realPatients = result.data.map(p => ({
        id: p.id,
        session_id: null,
        name: p.name,
        age: p.age,
        gender: p.gender,
        status: 'waiting',
        symptom: 'Pending intake',
        time: 'Just now',
        priority: 'normal',
      }));

      // Combine, avoiding duplicates
      const allPatients = [...seedQueue];
      realPatients.forEach(rp => {
        if (!allPatients.find(sp => sp.id === rp.id)) {
          allPatients.push(rp);
        }
      });
      setPatients(allPatients);
    } else {
      setPatients(seedQueue);
    }
    setLoading(false);
  };

  const selectPatient = async (patient) => {
    setSelectedPatient(patient);
    setSummary(null);
    setQrData(null);
    setActiveTab('overview');

    if (patient.session_id) {
      setSummaryLoading(true);
      const result = await api.getSummary(patient.session_id);
      if (!result.error && result.data) {
        setSummary(result.data);
      }
      setSummaryLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedPatient?.session_id) return;
    setSummaryLoading(true);
    const result = await api.generateSummary(selectedPatient.session_id);
    if (!result.error && result.data) {
      setSummary(result.data);
    }
    setSummaryLoading(false);
  };

  const handleConfirm = async () => {
    if (!selectedPatient?.session_id) return;
    await api.confirmSummary(selectedPatient.session_id);
    setSummary(prev => ({ ...prev, is_confirmed: true }));
  };

  const handleGenerateQR = async () => {
    if (!selectedPatient?.session_id) return;
    const result = await api.getQR(selectedPatient.session_id);
    if (!result.error && result.data) {
      setQrData(result.data.qr_code_base64);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500';
      case 'flagged': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'emergency': return { text: '🔴 EMERGENCY', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'flagged': return { text: '🟡 FLAGGED', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      default: return { text: '🟢 Normal', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
  };

  const filteredPatients = patients
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const priorityOrder = { emergency: 0, flagged: 1, normal: 2, waiting: 2 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });

  const summaryData = summary ? {
    allopathic: {
      chief_complaint: summary.chief_complaint,
      hpi: summary.hpi,
      past_medical_history: summary.past_medical_history,
      past_surgical_history: summary.past_surgical_history,
      drug_history: summary.drug_history,
      allergy_history: summary.allergy_history,
      family_history: summary.family_history,
      personal_history: summary.personal_history,
    },
    ayush: {
      prakriti: summary.prakriti,
      vikriti: summary.vikriti,
      agni_status: summary.agni_status,
      koshtha: summary.koshtha,
      nidana: summary.nidana,
      samprapti: summary.samprapti,
      dosha_assessment: summary.dosha_assessment,
      ahara_vihara: summary.ahara_vihara,
      dashavidha_pariksha: summary.dashavidha_pariksha,
    },
    ai_summary: summary.ai_summary,
    ai_summary_hindi: summary.ai_summary_hindi,
  } : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Sidebar / Queue */}
      <div className="w-80 bg-slate-900/80 border-r border-white/5 flex flex-col h-full z-10 backdrop-blur-md shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">👨‍⚕️ Patient Queue</h2>
            <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full border border-teal-500/30">
              {filteredPatients.length} patients
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
            />
            <span className="absolute left-3 top-2.5 opacity-50">🔍</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-500">
              <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </div>
          ) : (
            filteredPatients.map(p => (
              <div
                key={p.id}
                onClick={() => selectPatient(p)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedPatient?.id === p.id
                    ? 'bg-teal-900/30 border-teal-500/50'
                    : 'bg-slate-800/40 border-transparent hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-200">{p.name}</h3>
                  <span className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                    getPriorityColor(p.priority)
                  } ${p.priority === 'emergency' ? 'animate-pulse' : ''}`} />
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  {p.age}y • {p.gender === 'male' ? '♂️' : p.gender === 'female' ? '♀️' : '⚧️'} {p.gender}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="bg-slate-900 px-2 py-1 rounded text-slate-300 truncate max-w-[140px]">
                    {p.symptom}
                  </span>
                  <span className="text-slate-500 shrink-0 ml-2">{p.time}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Queue Stats */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-red-400">
                {patients.filter(p => p.priority === 'emergency').length}
              </div>
              <div className="text-[10px] text-slate-500">Emergency</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-400">
                {patients.filter(p => p.priority === 'flagged').length}
              </div>
              <div className="text-[10px] text-slate-500">Flagged</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400">
                {patients.filter(p => p.priority === 'normal' || p.priority === 'waiting').length}
              </div>
              <div className="text-[10px] text-slate-500">Normal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#0a0e1a] overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
        {!selectedPatient ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <div className="text-7xl mb-6 opacity-20">👨‍⚕️</div>
            <p className="text-xl font-medium mb-2">Welcome, Doctor</p>
            <p className="text-sm">Select a patient from the queue to view their clinical profile.</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto animate-fade-in pb-20">
            {/* Patient Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{selectedPatient.name}</h1>
                  {(() => {
                    const badge = getPriorityBadge(selectedPatient.priority);
                    return (
                      <span className={`${badge.className} px-3 py-1 rounded-full text-xs font-bold uppercase border`}>
                        {badge.text}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-slate-400">
                  {selectedPatient.age} yrs • {selectedPatient.gender} • {selectedPatient.symptom}
                </p>
              </div>
              <div className="flex gap-3">
                {selectedPatient.session_id && !summary && (
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
                  >
                    {summaryLoading ? '⏳ Generating...' : '🤖 Generate AI Summary'}
                  </button>
                )}
                {summary && !summary.is_confirmed && (
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-colors"
                  >
                    ✅ Confirm & Save
                  </button>
                )}
                {summary?.is_confirmed && (
                  <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 text-sm font-medium">
                    ✅ Confirmed
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-slate-800/50 p-1 rounded-xl w-fit">
              {['overview', 'ayush', 'documents'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {tab === 'overview' ? '📋 Overview' : tab === 'ayush' ? '🌿 AYUSH' : '📄 Documents'}
                </button>
              ))}
            </div>

            {summaryLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 text-teal-500 mx-auto mb-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-slate-400">Loading clinical summary...</p>
                </div>
              </div>
            ) : summaryData ? (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <ClinicalSummary summary={summaryData} activeTab={activeTab} />

                  {/* AI Summary */}
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

                <div className="lg:col-span-1 space-y-6">
                  {/* QR Slip */}
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-lg mb-4 text-slate-200">🖨️ OPD Slip</h3>
                    {qrData ? (
                      <QRSlip
                        patientInfo={{
                          name: selectedPatient.name,
                          age: selectedPatient.age,
                          gender: selectedPatient.gender,
                          token: Math.floor(Math.random() * 100) + 1,
                        }}
                        qrCodeBase64={qrData}
                      />
                    ) : (
                      <button
                        onClick={handleGenerateQR}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                      >
                        📱 Generate QR Code
                      </button>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-lg mb-4 text-slate-200">📊 Quick Stats</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Prakriti</span>
                        <span className="text-teal-400 font-medium">{summary?.prakriti || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Agni</span>
                        <span className="text-amber-400 font-medium">{summary?.agni_status || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Koshtha</span>
                        <span className="text-slate-300">{summary?.koshtha || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status</span>
                        <span className={summary?.is_confirmed ? 'text-emerald-400' : 'text-amber-400'}>
                          {summary?.is_confirmed ? 'Confirmed' : 'Pending Review'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-lg mb-2">No clinical summary available</p>
                <p className="text-sm">
                  {selectedPatient.session_id
                    ? 'Click "Generate AI Summary" to create one from the conversation history.'
                    : 'This patient has not completed their AI intake yet.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
