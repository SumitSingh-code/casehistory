'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setExtractedData(null);
    }
  };

  const handleScan = () => {
    if (!file) return;
    setIsScanning(true);
    
    // Simulate OCR delay
    setTimeout(() => {
      setIsScanning(false);
      setExtractedData({
        type: 'Blood Test Report',
        date: '2023-10-15',
        findings: [
          'Hemoglobin: 11.2 g/dL (Low)',
          'WBC Count: 8,500 /cumm (Normal)',
          'Platelets: 150,000 /cumm (Borderline)'
        ]
      });
    }, 2500);
  };

  const handleFinish = () => {
    router.push('/summary');
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-indigo-400 mb-2">Scan Past Records</h1>
        <p className="text-slate-400">Upload old prescriptions or lab reports to extract vital information automatically.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[400px]">
          {!preview ? (
            <div 
              className="border-2 border-dashed border-indigo-500/50 rounded-2xl w-full h-full flex flex-col items-center justify-center p-8 bg-indigo-900/10 cursor-pointer hover:bg-indigo-900/20 transition-colors group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-indigo-900/50 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                📄
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Tap to Upload or Capture</h3>
              <p className="text-sm text-slate-400 text-center">Supports JPG, PNG, PDF</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-black">
                {isScanning && (
                  <div className="absolute inset-0 bg-indigo-500/20 z-10">
                    <div className="w-full h-1 bg-indigo-400 shadow-[0_0_15px_#818cf8] animate-[slideDown_2s_ease-in-out_infinite]" />
                  </div>
                )}
                <img src={preview} alt="Document preview" className="w-full h-auto max-h-72 object-contain opacity-80" />
              </div>
              
              <div className="flex gap-4 mt-6 w-full">
                <button 
                  onClick={() => { setFile(null); setPreview(null); setExtractedData(null); }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                >
                  Retake
                </button>
                <button 
                  onClick={handleScan}
                  disabled={isScanning || extractedData}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-colors"
                >
                  {isScanning ? 'Scanning...' : extractedData ? 'Scanned' : 'Analyze Text'}
                </button>
              </div>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,.pdf" 
            capture="environment"
          />
        </div>

        {/* Results Section */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-xl font-bold text-slate-100 mb-4 border-b border-white/10 pb-4">Extracted Information</h2>
          
          <div className="flex-1 flex items-center justify-center">
            {!extractedData ? (
              <div className="text-center text-slate-500">
                <div className="text-4xl mb-3 opacity-50">🔍</div>
                <p>Upload and analyze a document to see extracted data here.</p>
              </div>
            ) : (
              <div className="w-full space-y-4 animate-fade-in">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-indigo-400 font-bold">{extractedData.type}</span>
                    <span className="text-slate-400">{extractedData.date}</span>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {extractedData.findings.map((finding, idx) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Data synced with clinical profile
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button 
          onClick={handleFinish}
          className="glass-button text-lg px-12 py-4"
        >
          View Complete Summary
        </button>
      </div>
    </div>
  );
}
