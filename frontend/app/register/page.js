'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    phone: '',
    language: 'en',
    consent: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Please agree to the consent form.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await api.createPatient({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone || null,
        language: formData.language,
      });

      if (!result.error && result.data) {
        const patientId = result.data.id || result.data[0]?.id;
        localStorage.setItem('vaidya_patient_id', patientId);
        localStorage.setItem('vaidya_language', formData.language);
        localStorage.setItem('vaidya_patient_name', formData.name);
        router.push(`/intake?patient=${patientId}`);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 animate-fade-in py-20">
      <div className="glass p-8 md:p-12 w-full max-w-xl rounded-3xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        
        <h1 className="text-3xl font-bold mb-2 text-white">Patient Registration</h1>
        <p className="text-slate-400 mb-8">Enter details to begin the AI consultation.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
              <input 
                required
                type="number" 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                placeholder="Years"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
              <select 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors appearance-none"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Language Preference</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, language: 'en'})}
                className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                  formData.language === 'en' 
                    ? 'bg-teal-900/40 border-teal-500 text-teal-100 shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="text-2xl">🇬🇧</span> English
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, language: 'hi'})}
                className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                  formData.language === 'hi' 
                    ? 'bg-teal-900/40 border-teal-500 text-teal-100 shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="text-2xl">🇮🇳</span> हिंदी (Hindi)
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 rounded border-slate-600 text-teal-500 focus:ring-teal-500 bg-slate-900"
                checked={formData.consent}
                onChange={e => setFormData({...formData, consent: e.target.checked})}
              />
              <span className="text-sm text-slate-300">
                I consent to providing my medical history via audio recording. I understand that AI will process this data to assist the doctor.
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="glass-button w-full py-4 text-lg mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Session...
              </span>
            ) : 'Start Consultation'}
          </button>
        </form>
      </div>
    </div>
  );
}
