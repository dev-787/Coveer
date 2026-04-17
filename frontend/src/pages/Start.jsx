import { useState } from 'react';
import { ArrowRight, Mail, Lock, User, Calendar, Briefcase, MapPin, IndianRupee, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Start.css';

// ── Constants — single source of truth ────────────────────────────────────────
const STEPS = [
  { number: 1, label: 'Account' },
  { number: 2, label: 'Work'    },
  { number: 3, label: 'Plan'    },
];

const PLATFORMS = [
  { value: 'zomato',   label: 'Zomato'   },
  { value: 'swiggy',   label: 'Swiggy'   },
  { value: 'blinkit',  label: 'Blinkit'  },
  { value: 'zepto',    label: 'Zepto'    },
  { value: 'amazon',   label: 'Amazon'   },
  { value: 'flipkart', label: 'Flipkart' },
];

const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

// ── Dynamic pricing (same logic as Pricing section) ───────────────────────────
const EARN_MIN = 300;
const EARN_MAX = 2000;

function lerp(min, max, t) {
  return Math.round(min + (max - min) * Math.min(Math.max(t, 0), 1));
}

function calcPlan(earnings, type) {
  const e = Math.max(0, Number(earnings) || 0);
  const t = e === 0 ? 0.5 : (e - EARN_MIN) / (EARN_MAX - EARN_MIN);
  if (type === 'basic') {
    const price     = e === 0 ? 25 : lerp(20, 30, t);
    const maxPayout = e === 0 ? 600 : lerp(300, 600, t);
    return { price, maxPayout, hourly: Math.round(maxPayout / 8) };
  }
  const price     = e === 0 ? 40 : lerp(40, 50, t);
  const maxPayout = e === 0 ? 1000 : lerp(600, 1000, t);
  return { price, maxPayout, hourly: Math.round(maxPayout / 8) };
}

const PLAN_FEATURES = {
  basic:   ['Weather & AQI protection', 'Hourly automatic payout', 'UPI withdrawal anytime'],
  premium: ['Everything in Basic', 'Priority payouts', 'Curfew & disruption cover', 'Higher payout cap'],
};

// ── Validation ─────────────────────────────────────────────────────────────────
const validateStep = (step, formData) => {
  const errors = {};

  if (step === 1) {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = 'Enter a valid email address';
    if (!formData.password || formData.password.length < 8)
      errors.password = 'Password must be at least 8 characters';
    if (!formData.firstName || formData.firstName.trim().length < 2)
      errors.firstName = 'Enter your first name';
    if (!formData.lastName || formData.lastName.trim().length < 2)
      errors.lastName = 'Enter your last name';
    if (!formData.dob)
      errors.dob = 'Enter your date of birth';
    else {
      const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
      if (age < 18 || age > 60) errors.dob = 'Age must be between 18 and 60';
    }
  }

  if (step === 2) {
    if (!formData.platform)
      errors.platform = 'Select your delivery platform';
    if (!formData.city)
      errors.city = 'Select your primary city';
    if (!formData.dailyEarnings || isNaN(formData.dailyEarnings) || Number(formData.dailyEarnings) < EARN_MIN)
      errors.dailyEarnings = `Enter daily earnings between ₹${EARN_MIN} and ₹${EARN_MAX}`;
    else if (Number(formData.dailyEarnings) > EARN_MAX)
      errors.dailyEarnings = `We support earnings up to ₹${EARN_MAX}/day`;
  }

  if (step === 3) {
    if (!formData.plan)
      errors.plan = 'Select a plan to continue';
    if (!formData.agreedToTerms)
      errors.agreedToTerms = 'Please accept the terms';
  }

  return errors;
};

// ── Field — defined OUTSIDE Start so React never remounts it on re-render ──────
// This is the fix for the focus-loss bug.
const Field = ({ name, icon: Icon, type = 'text', placeholder, children,
                 formData, errors, focused, handleChange, setFocused }) => (
  <div className="sf-field">
    <div className={`sf-input-wrap ${focused === name ? 'focused' : ''} ${errors[name] ? 'error' : ''}`}>
      {Icon && <Icon className="sf-input-icon" />}
      {children || (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          className="sf-input"
          value={formData[name]}
          onChange={handleChange}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused('')}
          autoComplete="off"
        />
      )}
    </div>
    {errors[name] && <p className="sf-error">{errors[name]}</p>}
  </div>
);

// ── Reusable sub-components — also outside Start ───────────────────────────────
const SubmitBtn = ({ label, flex, disabled }) => (
  <button type="submit" className={`sf-btn-primary ${flex ? 'flex' : ''}`} disabled={disabled}>
    <span className="sf-btn-arrow-enter"><ArrowRight className="sf-btn-icon" /></span>
    <span className="sf-btn-arrow-wrap">
      <span className="sf-btn-arrow-exit"><ArrowRight className="sf-btn-icon" /></span>
      {label}
    </span>
  </button>
);

const BackBtn = ({ onClick }) => (
  <button type="button" className="sf-btn-back" onClick={onClick}>
    <ChevronLeft size={16} /> Back
  </button>
);

const Divider = () => (
  <div className="sf-divider">
    <span className="sf-divider-line" />
    <span className="sf-divider-text">Or continue with</span>
    <span className="sf-divider-line" />
  </div>
);

const GoogleBtn = () => (
  <button type="button" className="sf-btn-google">
    <svg className="sf-google-icon" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Continue with Google
  </button>
);

const Footnote = ({ onClick, text }) => (
  <p className="sf-footnote" onClick={onClick}>{text}</p>
);

// ── Main component ─────────────────────────────────────────────────────────────
const Start = () => {
  const [step, setStep]         = useState(1);
  const [success, setSuccess]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [focused, setFocused]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', dob: '',
    platform: '', city: '', dailyEarnings: '',
    plan: 'premium', autoRenew: true, agreedToTerms: false,
  });

  const navigate = useNavigate();
  const { setUser } = useAuth();

 const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
};

// now fieldProps can safely reference handleChange
const fieldProps = { formData, errors, focused, handleChange, setFocused };

  const handleNext = (e) => {
    e.preventDefault();
    const stepErrors = validateStep(step, formData);
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep(3, formData);
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }

    setLoading(true);
    try {
      const response = await axios.post('https://coveer-backend.onrender.com/auth/register', {
        email:         formData.email,
        password:      formData.password,
        fullName:      { firstName: formData.firstName, lastName: formData.lastName },
        dob:           formData.dob,
        platform:      formData.platform,
        city:          formData.city,
        dailyEarnings: Number(formData.dailyEarnings),
        plan:          formData.plan,
        autoRenew:     formData.autoRenew,
      }, { withCredentials: true });

      if (response.status === 200 || response.status === 201) {
        // Fetch full user and set in context so ProtectedRoute works immediately
        const meRes = await axios.get('https://coveer-backend.onrender.com/auth/me', { withCredentials: true });
        setUser(meRes.data);
        navigate('/verify');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exist')) {
        setStep(1);
        setErrors({ email: 'This email is already registered. Please sign in instead.' });
      } else {
        setErrors({ submit: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sf-container">
      <div className="sf-glow" />

      {success && (
        <div className="sf-card sf-success-card">
          <div className="sf-success-icon">
            <CheckCircle2 size={56} strokeWidth={1.5} />
          </div>
          <h1 className="sf-brand-name sf-success-heading">Account Created!</h1>
          <p className="sf-success-sub">Welcome to Coveer. Your account is ready.</p>
          <button className="sf-btn-primary sf-success-btn" onClick={() => navigate('/auth')}>
            Go to Login
          </button>
        </div>
      )}

      {!success && (
      <div className="sf-card">

        {/* Brand */}
        <div className="sf-brand">
          <p className="sf-brand-sub">Create your</p>
          <h1 className="sf-brand-name">Coveer Account</h1>
        </div>

        {/* Step indicator */}
        <div className="sf-steps">
          {STEPS.map((s, i) => (
            <div key={s.number} className="sf-step-item">
              <div className={`sf-step-dot ${step === s.number ? 'active' : step > s.number ? 'done' : ''}`}>
                {step > s.number ? <CheckCircle2 size={14} /> : s.number}
              </div>
              <span className={`sf-step-label ${step === s.number ? 'active' : ''}`}>{s.label}</span>
              {i < STEPS.length - 1 && (
                <div className={`sf-step-line ${step > s.number ? 'done' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 — Account ── */}
        {step === 1 && (
          <form className="sf-form" onSubmit={handleNext}>
            <div className="sf-row">
              <Field name="firstName" icon={User} placeholder="First name" {...fieldProps} />
              <Field name="lastName"  placeholder="Last name"              {...fieldProps} />
            </div>
            <Field name="email"    icon={Mail}     type="email"    placeholder="Email address"        {...fieldProps} />
            <Field name="password" icon={Lock}     type="password" placeholder="Password (min 8 chars)" {...fieldProps} />

            {/* DOB — custom children to add max date */}
            <Field name="dob" icon={Calendar} {...fieldProps}>
              <input
                type="date"
                name="dob"
                className="sf-input"
                value={formData.dob}
                onChange={handleChange}
                onFocus={() => setFocused('dob')}
                onBlur={() => setFocused('')}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString().split('T')[0]}
              />
            </Field>

            <SubmitBtn label="Continue" />
            <Divider />
            <GoogleBtn />
            <Footnote onClick={() => navigate('/auth')} text="Already have an account? Sign in" />
          </form>
        )}

        {/* ── STEP 2 — Work details ── */}
        {step === 2 && (
          <form className="sf-form" onSubmit={handleNext}>

            {/* Platform select */}
            <Field name="platform" icon={Briefcase} {...fieldProps}>
              <select
                name="platform"
                className="sf-input sf-select"
                value={formData.platform}
                onChange={handleChange}
                onFocus={() => setFocused('platform')}
                onBlur={() => setFocused('')}
              >
                <option value="">Select your platform…</option>
                {PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>

            {/* City select */}
            <Field name="city" icon={MapPin} {...fieldProps}>
              <select
                name="city"
                className="sf-input sf-select"
                value={formData.city}
                onChange={handleChange}
                onFocus={() => setFocused('city')}
                onBlur={() => setFocused('')}
              >
                <option value="">Select your city…</option>
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field
              name="dailyEarnings"
              icon={IndianRupee}
              type="number"
              placeholder={`Avg. daily earnings (₹${EARN_MIN}–₹${EARN_MAX})`}
              {...fieldProps}
            />

            <p className="sf-hint">Your earnings are used only to calculate your payout. Never shared.</p>

            <div className="sf-btn-row">
              <BackBtn onClick={handleBack} />
              <SubmitBtn label="Continue" flex />
            </div>
          </form>
        )}

        {/* ── STEP 3 — Plan ── */}
        {step === 3 && (
          <form className="sf-form" onSubmit={handleSubmit}>

            <div className="sf-plans">
              {['basic', 'premium'].map(planId => {
                const calc = calcPlan(formData.dailyEarnings, planId);
                const isRecommended = planId === 'premium';
                return (
                  <label
                    key={planId}
                    className={`sf-plan-card ${formData.plan === planId ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={planId}
                      checked={formData.plan === planId}
                      onChange={handleChange}
                      className="sf-plan-radio"
                    />
                    {isRecommended && <span className="sf-plan-badge">Recommended</span>}
                    <div className="sf-plan-header">
                      <span className="sf-plan-name">{planId.charAt(0).toUpperCase() + planId.slice(1)}</span>
                      <span className="sf-plan-price">
                        ₹{calc.price}<span className="sf-plan-period">/week</span>
                      </span>
                    </div>
                    <div className="sf-plan-payouts">
                      <div className="sf-plan-payout-pill">
                        <span className="sf-plan-payout-label">Max payout/day</span>
                        <span className="sf-plan-payout-value">₹{calc.maxPayout}</span>
                      </div>
                      <div className="sf-plan-payout-sep" />
                      <div className="sf-plan-payout-pill">
                        <span className="sf-plan-payout-label">Payout/hour</span>
                        <span className="sf-plan-payout-value">₹{calc.hourly}</span>
                      </div>
                    </div>
                    <ul className="sf-plan-features">
                      {PLAN_FEATURES[planId].map(f => (
                        <li key={f}><CheckCircle2 size={12} /> {f}</li>
                      ))}
                    </ul>
                  </label>
                );
              })}
            </div>
            {errors.plan && <p className="sf-error">{errors.plan}</p>}

            {/* Auto-renew toggle */}
            <label className="sf-toggle-row">
              <span className="sf-toggle-label">Auto-renew weekly</span>
              <div
                className={`sf-toggle ${formData.autoRenew ? 'on' : ''}`}
                onClick={() => setFormData(p => ({ ...p, autoRenew: !p.autoRenew }))}
              >
                <div className="sf-toggle-knob" />
              </div>
            </label>

            {/* T&C */}
            <label className="sf-checkbox-row">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="sf-checkbox"
              />
              <span className="sf-checkbox-label">
                I agree to the <span className="sf-link">Terms of Service</span> and <span className="sf-link">Privacy Policy</span>
              </span>
            </label>
            {errors.agreedToTerms && <p className="sf-error">{errors.agreedToTerms}</p>}

            {errors.submit && <p className="sf-error sf-error--center">{errors.submit}</p>}

            <div className="sf-btn-row">
              <BackBtn onClick={handleBack} />
              <SubmitBtn label={loading ? 'Creating account…' : 'Create my Account'} flex disabled={loading} />
            </div>
          </form>
        )}

      </div>
      )}

    </div>
  );
};

export default Start;