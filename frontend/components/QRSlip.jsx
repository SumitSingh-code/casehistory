'use client';
import { useRef } from 'react';

export default function QRSlip({ patientInfo, qrCodeUrl, qrCodeBase64 }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  if (!patientInfo) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        ref={printRef}
        className="bg-white text-black p-8 rounded-xl shadow-2xl max-w-sm w-full mx-auto relative overflow-hidden"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">VaidyaAI OPD</h2>
          <p className="text-sm text-gray-500 mt-1">Digital Patient Slip</p>
        </div>

        {/* Patient Info */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Name:</span>
            <span className="font-bold text-gray-900">{patientInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Age/Sex:</span>
            <span className="font-bold text-gray-900">{patientInfo.age} / {patientInfo.gender}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Date:</span>
            <span className="font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Token No:</span>
            <span className="font-bold text-indigo-600">{patientInfo.token || Math.floor(Math.random() * 100) + 1}</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
          {(qrCodeBase64 || qrCodeUrl) ? (
             <img src={qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : qrCodeUrl} alt="Patient Summary QR" className="w-48 h-48 object-contain" />
          ) : (
             <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-400 rounded-lg">
                QR Loading...
             </div>
          )}
          <p className="text-xs text-center text-gray-500 mt-4 max-w-[200px]">
            Scan to view complete clinical history and AYUSH assessment
          </p>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500 transform translate-x-8 -translate-y-8 rotate-45"></div>
      </div>

      <button 
        onClick={handlePrint}
        className="glass-button w-full max-w-sm flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print OPD Slip
      </button>
    </div>
  );
}
