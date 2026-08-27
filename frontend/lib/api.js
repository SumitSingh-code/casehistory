const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://casehistory-e69e.onrender.com';

async function fetchWrapper(endpoint, options = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for Render cold start

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      return { error: true, status: response.status, message: errorText || 'API request failed' };
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      return { error: false, data };
    }
    return { error: false, data: null };
  } catch (error) {
    return { error: true, message: error.message || 'Network error' };
  }
}

// Wake up Render backend (call on first page load)
async function wakeUpBackend() {
  try {
    await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(60000) });
  } catch {
    // Ignore — just warming up
  }
}

// Retry wrapper — tries up to 3 times
async function fetchWithRetry(endpoint, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetchWrapper(endpoint, options);
    if (!res.error) return res;
    if (i < retries - 1) {
      await new Promise(r => setTimeout(r, 2000)); // wait 2s before retry
    }
  }
  return { error: true, message: 'Failed after retries' };
}

export const api = {
  // Wake up backend
  wakeUp: () => wakeUpBackend(),

  // Patient CRUD
  createPatient: (data) => fetchWithRetry('/api/patients', { method: 'POST', body: JSON.stringify(data) }),
  getPatients: () => fetchWrapper('/api/patients'),
  saveAllPatientData: (data) => fetchWithRetry('/api/patients/save-all', { method: 'POST', body: JSON.stringify(data) }, 3),
  getPatientFull: (patientId) => fetchWrapper(`/api/patients/${patientId}/full`),
  
  // Intake
  startIntake: (data) => fetchWrapper('/api/intake/start', { method: 'POST', body: JSON.stringify(data) }),
  sendMessage: (sessionId, message, language) => fetchWrapper('/api/intake/message', { 
    method: 'POST', 
    body: JSON.stringify({ session_id: sessionId, message, language }) 
  }),
  
  // Prakriti
  submitPrakriti: (data) => fetchWrapper('/api/intake/prakriti', { method: 'POST', body: JSON.stringify(data) }),
  
  // Summary
  generateSummary: (sessionId) => fetchWrapper(`/api/summary/generate/${sessionId}`, { method: 'POST' }),
  getSummary: (sessionId) => fetchWrapper(`/api/summary/${sessionId}`),
  updateSummary: (sessionId, data) => fetchWrapper(`/api/summary/${sessionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  confirmSummary: (sessionId) => fetchWrapper(`/api/summary/${sessionId}/confirm`, { method: 'POST' }),
  getQR: (sessionId) => fetchWrapper(`/api/summary/${sessionId}/qr`),
  
  // Documents
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${BASE_URL}/api/documents/upload`, { method: 'POST', body: formData });
      if (!response.ok) return { error: true, message: 'Upload failed' };
      return { error: false, data: await response.json() };
    } catch (error) {
      return { error: true, message: error.message || 'Network error' };
    }
  },
  analyzeOCR: (data) => fetchWrapper('/api/documents/ocr', { method: 'POST', body: JSON.stringify(data) }),
};
