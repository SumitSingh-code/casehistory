const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWrapper(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { error: true, status: response.status, message: errorText || 'API request failed' };
    }
    
    // Some endpoints might return empty response
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

export const api = {
  createPatient: (data) => fetchWrapper('/api/patients', { method: 'POST', body: JSON.stringify(data) }),
  getPatients: () => fetchWrapper('/api/patients'),
  
  startIntake: (data) => fetchWrapper('/api/intake/start', { method: 'POST', body: JSON.stringify(data) }),
  sendMessage: (sessionId, message, language) => fetchWrapper('/api/intake/message', { 
    method: 'POST', 
    body: JSON.stringify({ session_id: sessionId, message, language }) 
  }),
  
  submitPrakriti: (data) => fetchWrapper('/api/intake/prakriti', { method: 'POST', body: JSON.stringify(data) }),
  
  generateSummary: (sessionId) => fetchWrapper(`/api/summary/generate/${sessionId}`, { method: 'POST' }),
  getSummary: (sessionId) => fetchWrapper(`/api/summary/${sessionId}`),
  updateSummary: (sessionId, data) => fetchWrapper(`/api/summary/${sessionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  confirmSummary: (sessionId) => fetchWrapper(`/api/summary/${sessionId}/confirm`, { method: 'POST' }),
  getQR: (sessionId) => fetchWrapper(`/api/summary/${sessionId}/qr`),
  
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData, // Don't set Content-Type header for FormData, browser does it automatically
      });
      
      if (!response.ok) return { error: true, message: 'Upload failed' };
      return { error: false, data: await response.json() };
    } catch (error) {
      return { error: true, message: error.message || 'Network error' };
    }
  },
  
  analyzeOCR: (data) => fetchWrapper('/api/documents/ocr', { method: 'POST', body: JSON.stringify(data) }),
};
