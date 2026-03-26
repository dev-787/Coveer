import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, Upload, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Verify.css';

// ── Upload Card ────────────────────────────────────────────────────────────────
const UploadCard = ({ label, accepted, subtext, fieldName, file, onFileChange, error }) => {
  const inputRef = useRef(null);

  return (
    <div className="vf-card">
      <div className="vf-card-header">
        <span className="vf-card-label">{label}</span>
        <span className="vf-card-accepted">{accepted}</span>
      </div>
      <p className="vf-card-sub">{subtext}</p>

      <div
        className={`vf-upload-area ${file ? 'vf-upload-area--selected' : ''} ${error ? 'vf-upload-area--error' : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="vf-file-input"
          onChange={(e) => onFileChange(fieldName, e.target.files[0])}
        />
        {file ? (
          <>
            <CheckCircle2 className="vf-upload-icon vf-upload-icon--done" size={22} />
            <span className="vf-upload-filename">{file.name}</span>
          </>
        ) : (
          <>
            <Upload className="vf-upload-icon" size={22} />
            <span className="vf-upload-prompt">Click to upload</span>
            <span className="vf-upload-hint">JPEG, PNG or WebP · max 5MB</span>
          </>
        )}
      </div>
      {error && <p className="vf-field-error">{error}</p>}
    </div>
  );
};

// ── Pending Screen ─────────────────────────────────────────────────────────────
const PendingScreen = ({ onRejected }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('under_review');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await axios.get('http://localhost:3000/verify/status', { withCredentials: true });
        const s = res.data.status;
        setStatus(s);
        if (s === 'verified') {
          clearInterval(poll);
          navigate('/dashboard');
        } else if (s === 'rejected') {
          clearInterval(poll);
          setReason(res.data.rejectionReason || '');
        }
      } catch {
        // silently retry
      }
    }, 10000);

    return () => clearInterval(poll);
  }, [navigate]);

  if (status === 'rejected') {
    return (
      <div className="vf-pending">
        <div className="vf-rejected-icon">✕</div>
        <h2 className="vf-pending-heading">Verification Failed</h2>
        {reason && <p className="vf-pending-sub">{reason}</p>}
        <p className="vf-pending-sub">Please re-upload clear, valid documents.</p>
        <button className="vf-btn-primary" onClick={onRejected}>
          <span className="vf-btn-arrow-enter"><ArrowRight size={15} /></span>
          <span className="vf-btn-arrow-wrap">
            <span className="vf-btn-arrow-exit"><ArrowRight size={15} /></span>
            Re-upload Documents
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="vf-pending">
      <div className="vf-spinner" />
      <h2 className="vf-pending-heading">Verifying your documents</h2>
      <p className="vf-pending-sub">This usually takes 1–2 minutes. Please don't close this page.</p>
      <p className="vf-pending-note">You'll be redirected automatically once verified.</p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
function Verify() {
  const [files, setFiles]     = useState({ identityProof: null, platformProof: null });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (field, file) => {
    setFiles(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!files.identityProof) newErrors.identityProof = 'Please upload your identity document';
    if (!files.platformProof) newErrors.platformProof = 'Please upload your platform screenshot';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('identityProof', files.identityProof);
      form.append('platformProof', files.platformProof);

      await axios.post('http://localhost:3000/verify/upload', form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFiles({ identityProof: null, platformProof: null });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="vf-container">
      <div className="vf-glow" />

      {submitted ? (
        <PendingScreen onRejected={handleReset} />
      ) : (
        <div className="vf-wrapper">
          <div className="vf-brand">
            <h1 className="vf-brand-name">Coveer</h1>
            <p className="vf-heading">One last step</p>
            <p className="vf-subtext">Verify your identity to activate income protection</p>
          </div>

          <form className="vf-form" onSubmit={handleSubmit}>
            <div className="vf-cards-row">
              <UploadCard
                label="Identity Document"
                accepted="Aadhaar Card or PAN Card"
                subtext="Upload a clear photo of your Aadhaar or PAN card"
                fieldName="identityProof"
                file={files.identityProof}
                onFileChange={handleFileChange}
                error={errors.identityProof}
              />
              <UploadCard
                label="Platform Screenshot"
                accepted="Swiggy / Zomato / any partner app"
                subtext="Screenshot of your delivery app showing your name and active status"
                fieldName="platformProof"
                file={files.platformProof}
                onFileChange={handleFileChange}
                error={errors.platformProof}
              />
            </div>

            {errors.submit && <p className="vf-submit-error">{errors.submit}</p>}

            <button type="submit" className="vf-btn-primary" disabled={loading}>
              <span className="vf-btn-arrow-enter"><ArrowRight size={15} /></span>
              <span className="vf-btn-arrow-wrap">
                <span className="vf-btn-arrow-exit"><ArrowRight size={15} /></span>
                {loading ? 'Uploading…' : 'Submit Documents'}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Verify;
