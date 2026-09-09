import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Check,
  Type,
  Maximize2,
} from 'lucide-react';
import { api } from '../api/client.ts';
import type { SolvedQuestion } from '../types/index.ts';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSolutionGenerated: (solution: SolvedQuestion) => void;
}

type ScanMode = 'camera' | 'upload' | 'type';

export const ScanModal: React.FC<ScanModalProps> = ({ isOpen, onClose, onSolutionGenerated }) => {
  const [mode, setMode] = useState<ScanMode>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [typedQuestion, setTypedQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const analysisStages = [
    'Reading and validating question...',
    'Detecting subject & academic topic...',
    'Formulating step-by-step derivation...',
    'Finalizing educational explanations...',
  ];

  // Camera start/stop lifecycle
  useEffect(() => {
    if (isOpen && mode === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, capturedImage]);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setMode('upload');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable, switching to file upload:', err.message);
      setCameraActive(false);
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage('Image is too large. Please select an image under 12MB.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setCapturedImage(null);
    setErrorMessage(null);
    if (mode === 'camera') {
      startCamera();
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage && !typedQuestion.trim()) {
      setErrorMessage('Please provide a question image or type a question text.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);
    setErrorMessage(null);

    // Staged progress ticker
    const timer1 = setTimeout(() => setAnalysisStep(1), 700);
    const timer2 = setTimeout(() => setAnalysisStep(2), 1600);
    const timer3 = setTimeout(() => setAnalysisStep(3), 2500);

    try {
      const res = await api.solveQuestion({
        questionText: typedQuestion.trim() || undefined,
        imageBase64: capturedImage || undefined,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsAnalyzing(false);
      onClose();
      onSolutionGenerated(res.question);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'AI failed to analyze the question. Please retake or type it directly.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="scan-modal-title">
      <div className="modal-dialog modal-dialog-large">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <h3 id="scan-modal-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Smart Question Scanner
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Instant AI step-by-step solver
              </p>
            </div>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {!isAnalyzing && (
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              gap: '4px',
              marginBottom: 'var(--space-4)',
            }}
          >
            <button
              className={`btn btn-sm ${mode === 'camera' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1 }}
              onClick={() => {
                setMode('camera');
                setCapturedImage(null);
              }}
            >
              <Camera size={14} /> Camera
            </button>
            <button
              className={`btn btn-sm ${mode === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1 }}
              onClick={() => {
                setMode('upload');
                stopCamera();
              }}
            >
              <Upload size={14} /> Upload Image
            </button>
            <button
              className={`btn btn-sm ${mode === 'type' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1 }}
              onClick={() => {
                setMode('type');
                stopCamera();
              }}
            >
              <Type size={14} /> Type Question
            </button>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div
            className="badge badge-danger"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              marginBottom: 'var(--space-4)',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading AI State */}
        {isAnalyzing ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)' }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
              }}
              className="pulsing-glow"
            >
              <Sparkles size={32} />
            </div>

            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              Solvo AI is Solving Your Problem
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600, minHeight: '24px' }}>
              {analysisStages[analysisStep]}
            </p>

            <div
              style={{
                maxWidth: '280px',
                margin: 'var(--space-5) auto 0',
                height: '6px',
                background: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${((analysisStep + 1) / analysisStages.length) * 100}%`,
                  background: 'var(--color-primary)',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Camera View Mode */}
            {mode === 'camera' && (
              <div>
                {capturedImage ? (
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
                    <img
                      src={capturedImage}
                      alt="Captured question"
                      style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', background: '#000' }}
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={retake}
                      style={{ position: 'absolute', top: 12, right: 12 }}
                    >
                      <RefreshCw size={14} /> Retake
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      position: 'relative',
                      background: '#000',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      height: '320px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Viewfinder Target Frame */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '80%',
                        height: '70%',
                        border: '2px dashed rgba(255, 255, 255, 0.75)',
                        borderRadius: 'var(--radius-md)',
                        pointerEvents: 'none',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                      }}
                    />

                    <div style={{ position: 'absolute', bottom: 16, display: 'flex', gap: 'var(--space-3)' }}>
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={capturePhoto}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: 'var(--radius-full)',
                          padding: 0,
                          boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                        }}
                        aria-label="Capture photo"
                      >
                        <Camera size={26} />
                      </button>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}

            {/* Upload Mode */}
            {mode === 'upload' && (
              <div>
                {capturedImage ? (
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
                    <img
                      src={capturedImage}
                      alt="Uploaded question preview"
                      style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', background: '#000' }}
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={retake}
                      style={{ position: 'absolute', top: 12, right: 12 }}
                    >
                      <RefreshCw size={14} /> Change Image
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-8) var(--space-4)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'var(--bg-surface-subtle)',
                      marginBottom: 'var(--space-4)',
                      transition: 'border-color var(--transition-fast)',
                    }}
                  >
                    <Upload size={38} style={{ margin: '0 auto 12px', color: 'var(--color-primary)' }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
                      Click or drop question photo here
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Supports PNG, JPG, WebP up to 12MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Type/Text Mode */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="input-label" htmlFor="question-input">
                {mode === 'type' ? 'Enter or Paste Question Statement' : 'Additional context / specific sub-part (optional)'}
              </label>
              <textarea
                id="question-input"
                className="input-field"
                rows={mode === 'type' ? 4 : 2}
                placeholder={
                  mode === 'type'
                    ? 'e.g. Solve for x: 2x² - 7x + 3 = 0, or paste an entire physics problem statement...'
                    : 'Optional: specify which part you want solved (e.g. "solve part b only")'
                }
                value={typedQuestion}
                onChange={(e) => setTypedQuestion(e.target.value)}
              />
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAnalyze}
                disabled={!capturedImage && !typedQuestion.trim()}
              >
                <Sparkles size={18} />
                <span>Solve with AI</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
