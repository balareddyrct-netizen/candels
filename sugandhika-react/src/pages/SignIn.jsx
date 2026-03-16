import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useToast } from '../context/AppContext';
import { setupRecaptcha, sendOTP } from '../firebase';
import './Auth.css';

const TABS = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
];

export default function SignIn() {
  const [tab, setTab]           = useState('email');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const { signIn, signInGoogle, isLoggedIn } = useAuth();
  const showToast = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();
  const cardRef   = useRef(null);
  const from      = location.state?.from || '/';

  useEffect(() => { if (isLoggedIn) navigate(from, { replace: true }); }, [isLoggedIn]);

  useEffect(() => {
    import('gsap').then(mod => {
      const gsap = mod.gsap || mod.default;
      if (!gsap || !cardRef.current) return;
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 36, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
      );
    }).catch(() => {});
  }, []);

  // ── Email sign in ──
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const res = await signIn({ email, password });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    showToast('Welcome back! 🕯️');
    navigate(from, { replace: true });
  };

  // ── Google sign in ──
  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const res = await signInGoogle();
    setLoading(false);
    if (res?.error) { setError(res.error); return; }
    showToast('Signed in with Google! 🕯️');
  };

  // ── Send OTP ──
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    const cleaned = phone.trim();
    if (!cleaned || cleaned.length < 10) { setError('Enter a valid phone number with country code (e.g. +91 98765 43210)'); return; }
    setOtpLoading(true);
    try {
      setupRecaptcha('recaptcha-container');
      const confirm = await sendOTP(cleaned);
      setConfirmResult(confirm);
      setOtpSent(true);
      showToast('OTP sent to ' + cleaned);
    } catch (err) {
      setError(err.message || 'Could not send OTP. Check the number and try again.');
    }
    setOtpLoading(false);
  };

  // ── Verify OTP ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length < 6) { setError('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    try {
      await confirmResult.confirm(otp);
      showToast('Phone verified! Welcome 🕯️');
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <img src="/images/hero-bg.jpg" alt="" aria-hidden />
        <div className="auth-bg-overlay" />
      </div>
      <div id="recaptcha-container" />

      <div className="auth-card" ref={cardRef} style={{ opacity: 0 }}>
        <Link to="/" className="auth-logo">
          <img src="/images/logo.jpg" alt="Sugandhika" />
        </Link>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your Sugandhika account</p>

        {/* Google button */}
        <button className="social-btn google-btn" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="auth-divider"><span>or sign in with</span></div>

        {/* Tabs */}
        <div className="auth-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`auth-tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => { setTab(t.key); setError(''); setOtpSent(false); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Email form */}
        {tab === 'email' && (
          <form className="auth-form" onSubmit={handleEmailSignIn} noValidate>
            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" autoFocus
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <div className="auth-pwd-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(s => !s)} tabIndex={-1}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className={`auth-submit ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Sign In'}
            </button>
          </form>
        )}

        {/* Phone form */}
        {tab === 'phone' && (
          <form className="auth-form" onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} noValidate>
            {!otpSent ? (
              <div className="auth-field">
                <label>Phone Number</label>
                <input
                  type="tel" placeholder="+91 98765 43210"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  autoFocus
                />
                <span className="auth-hint">Include country code, e.g. +91 for India</span>
              </div>
            ) : (
              <div className="auth-field">
                <label>Enter OTP</label>
                <div className="otp-inputs">
                  <input
                    type="text" inputMode="numeric" maxLength={6}
                    placeholder="6-digit code"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="otp-input" autoFocus
                  />
                </div>
                <span className="auth-hint">
                  OTP sent to {phone}.{' '}
                  <button type="button" className="resend-btn" onClick={() => { setOtpSent(false); setOtp(''); }}>
                    Change number
                  </button>
                </span>
              </div>
            )}
            {error && <div className="auth-error">{error}</div>}
            <button
              type="submit"
              className={`auth-submit ${(loading || otpLoading) ? 'loading' : ''}`}
              disabled={loading || otpLoading}
            >
              {loading || otpLoading
                ? <span className="auth-spinner" />
                : otpSent ? 'Verify OTP' : 'Send OTP'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" state={{ from }}>Create one</Link>
        </p>
        <Link to="/" className="auth-back">← Back to shop</Link>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
