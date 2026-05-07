import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileImage, X, Loader, CheckCircle2,
  AlertCircle, Zap, FileSpreadsheet, RotateCcw
} from 'lucide-react';
import { extractBillData, downloadExcelReport } from '../services/api';
import ResultsPanel from './ResultsPanel';
import './UploadSection.css';

export default function UploadSection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      setError('Invalid file type. Please upload PNG, JPG, PDF, or WebP.');
      return;
    }
    if (accepted.length > 0) {
      const f = accepted[0];
      setFile(f);
      setError('');
      setExtractedData(null);
      setStatus('idle');

      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(f);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 16 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('uploading');
    setError('');

    try {
      const data = await extractBillData(file);
      setExtractedData(data);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setStatus('error');
    }
  };

  const handleDownloadExcel = async () => {
    if (!extractedData) return;
    setExcelLoading(true);
    try {
      await downloadExcelReport(extractedData, extractedData.consumer_name);
    } catch (err) {
      setError(err.message || 'Excel download failed');
    } finally {
      setExcelLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setError('');
    setExtractedData(null);
  };

  return (
    <section className="upload-section" id="upload">
      <div className="upload-section__container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-header__tag">Analyze</span>
          <h2 className="section-header__title">
            Upload Your <span className="text-gradient">Electricity Bill</span>
          </h2>
          <p className="section-header__desc">
            Drop your MSEDCL bill below and let our AI do the heavy lifting.
          </p>
        </motion.div>

        <div className="upload-section__grid">
          {/* Left: Upload area */}
          <motion.div
            className="upload-panel"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Dropzone */}
            {!file ? (
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}
                id="dropzone"
              >
                <input {...getInputProps()} id="file-input" />
                <div className="dropzone__icon-wrap">
                  <Upload size={36} className="dropzone__icon" />
                </div>
                <h3 className="dropzone__title">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop your bill'}
                </h3>
                <p className="dropzone__hint">
                  or <span className="dropzone__browse">browse files</span>
                </p>
                <p className="dropzone__formats">
                  PNG, JPG, WebP, BMP, PDF • Max 16MB
                </p>
              </div>
            ) : (
              <div className="upload-preview">
                {/* Preview */}
                <div className="upload-preview__file">
                  {preview ? (
                    <img src={preview} alt="Bill preview" className="upload-preview__img" />
                  ) : (
                    <div className="upload-preview__placeholder">
                      <FileImage size={48} />
                      <span>{file.name}</span>
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="upload-preview__info">
                  <div className="upload-preview__name">
                    <FileImage size={16} />
                    <span>{file.name}</span>
                  </div>
                  <span className="upload-preview__size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                {/* Actions */}
                <div className="upload-preview__actions">
                  {status === 'idle' && (
                    <>
                      <button
                        className="btn btn--primary btn--lg"
                        onClick={handleAnalyze}
                        id="analyze-btn"
                      >
                        <Zap size={18} />
                        Analyze Bill
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={handleReset}
                        id="reset-btn"
                      >
                        <X size={16} />
                        Remove
                      </button>
                    </>
                  )}

                  {status === 'uploading' && (
                    <div className="upload-status upload-status--loading">
                      <Loader size={22} className="spin" />
                      <span>AI is analyzing your bill...</span>
                      <p className="upload-status__sub">
                        This may take 10-30 seconds
                      </p>
                    </div>
                  )}

                  {status === 'success' && (
                    <div className="upload-status upload-status--success">
                      <CheckCircle2 size={22} />
                      <span>Analysis Complete!</span>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="upload-status upload-status--error">
                      <AlertCircle size={22} />
                      <span>{error}</span>
                      <button className="btn btn--outline btn--sm" onClick={handleReset}>
                        <RotateCcw size={14} />
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right: Results panel */}
          <motion.div
            className="results-wrapper"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {extractedData ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <ResultsPanel
                    data={extractedData}
                    onDownload={handleDownloadExcel}
                    excelLoading={excelLoading}
                    onReset={handleReset}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  className="results-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="results-placeholder__icon">
                    <FileSpreadsheet size={48} />
                  </div>
                  <h3>Your Results Will Appear Here</h3>
                  <p>Upload and analyze a bill to see extracted data, solar calculations, and download your report.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
