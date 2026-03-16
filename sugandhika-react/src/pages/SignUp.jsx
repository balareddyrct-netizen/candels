import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useToast } from '../context/AppContext';
import './Auth.css';

export default function SignUp() {
  const [form, setForm]             = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd]       = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [verifyScreen, setVerifyScreen] = useState(false);

  const { signUp, signInGoogle, resendEmail, isLoggedIn, user } = useAuth();
  const showToast = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();
  const cardRef   = useRef(null);
  const from      = location.state?.from || '/';

  // If already verified, redirect
  useEffect(() => {
    if (isLoggedIn && user?.emailVerified) navigate(from, { replace: true });
  }, [isLoggedIn, user]);

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

  const validate = () => {
    if (!form.name.trim())               return 'Please enter your full name.';
    if (!form.email.trim())              return 'Please enter your email address.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.';
    if (form.password.length < 6)        return 'Password must be at least 6 characters.';
    if (form.password !== form.confirm)  return 'Passwords do not match.';
    return null;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    const res = await signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setVerifyScreen(true);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const res = await signInGoogle();
    setLoading(false);
    if (res?.error) { setError(res.error); return; }
    showToast('Account created with Google! 🕯️');
  };

  const handleResend = async () => {
    const res = await resendEmail();
    if (res.success) showToast('Verification email resent!');
    else showToast(res.error || 'Could not resend. Try again.');
  };

  // Password strength
  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#E8485A', '#E8923A', '#C9A454', '#4A6741', '#2C6B2F'][strength];

  // ── Verify email screen ──
  if (verifyScreen) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <img src="/images/hero-bg.jpg" alt="" aria-hidden />
          <div className="auth-bg-overlay" />
        </div>
        <div className="auth-card verify-card">
          <div className="verify-icon">✉️</div>
          <h1 className="auth-title">Check your email</h1>
          <p className="verify-text">
            We sent a verification link to<br />
            <strong>{form.email}</strong>
          </p>
          <p className="verify-sub">
            Click the link in the email to verify your account. Once verified, you can sign in.
          </p>
          <Link to="/signin" className="auth-submit" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', marginTop: 8 }}>
            Go to Sign In
          </Link>
          <button className="resend-btn" style={{ marginTop: 16 }} onClick={handleResend}>
            Didn't receive it? Resend email
          </button>
          <Link to="/" className="auth-back" style={{ marginTop: 16 }}>← Back to shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <img src="/images/hero-bg.jpg" alt="" aria-hidden />
        <div className="auth-bg-overlay" />
      </div>

      <div className="auth-card" ref={cardRef} style={{ opacity: 0 }}>
        <Link to="/" className="auth-logo">
          <img src="/images/logo.jpg" alt="Sugandhika" />
        </Link>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join the Sugandhika community</p>

        {/* Google */}
        <button className="social-btn google-btn" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="auth-divider"><span>or sign up with email</span></div>

        <form className="auth-form" onSubmit={handleSignUp} noValidate>
          <div className="auth-field">
            <label>Full Name</label>
            <input
              type="text" placeholder="Your full name"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoComplete="name" autoFocus
            />
          </div>
          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <div className="auth-pwd-wrap">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(s => !s)} tabIndex={-1}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div className="strength-bar">
                <div className="strength-track">
                  <div className="strength-fill" style={{ width: `${strength * 20}%`, background: strengthColor }} />
                </div>
                <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <div className="auth-field">
            <label>Confirm Password</label>
            <div className="auth-pwd-wrap">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                autoComplete="new-password"
              />
              {form.confirm && (
                <span className="pwd-match-icon" style={{ color: form.password === form.confirm ? '#4A6741' : '#E8485A' }}>
                  {form.password === form.confirm ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className={`auth-submit ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/signin" state={{ from }}>Sign in</Link>
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
