import { API_URL } from '../config';

/**
 * Upload a bill image and extract data via AI.
 * @param {File} file – The bill image/PDF file.
 * @returns {Promise<Object>} Extracted bill data.
 */
export async function extractBillData(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/extract`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (HTTP ${response.status})`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Extraction failed');
  }
  return result.data;
}

/**
 * Generate and download the Solar Analysis Excel report.
 * @param {Object} data – The extracted bill data.
 * @param {string} [consumerName] – Optional name for the filename.
 */
export async function downloadExcelReport(data, consumerName = 'Customer') {
  const response = await fetch(`${API_URL}/api/generate-excel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Excel generation failed (HTTP ${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${consumerName.replace(/\s+/g, '_')}_Solar_Analysis.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Check backend health.
 */
export async function checkHealth() {
  const response = await fetch(`${API_URL}/api/health`);
  return response.json();
}
