import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useToast } from '../context/AppContext';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { getOrdersByUser } from '../services/firestore';
import './Account.css';

export default function Account() {
  const { user, signOut, resendEmail, isLoggedIn } = useAuth();
  const showToast = useToast();
  const navigate  = useNavigate();
  const [tab, setTab]         = useState('profile');
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [orders, setOrders]   = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const pageRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/signin', { replace: true }); return; }
    setName(user.displayName || '');
    // Fetch orders
    getOrdersByUser(user.uid)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    import('gsap').then(mod => {
      const gsap = mod.gsap || mod.default;
      if (!gsap || !pageRef.current) return;
      gsap.fromTo(pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }).catch(() => {});
  }, []);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out. See you soon!');
    navigate('/');
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      showToast('Name updated!');
      setEditing(false);
    } catch {
      showToast('Could not update. Try again.');
    }
    setSaving(false);
  };

  const handleResend = async () => {
    const res = await resendEmail();
    showToast(res.success ? 'Verification email sent!' : (res.error || 'Try again later.'));
  };

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const initials    = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const provider    = user.providerData?.[0]?.providerId || 'email';
  const isGoogle    = provider === 'google.com';
  const isPhone     = provider === 'phone';
  const joined      = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : '—';

  return (
    <div className="account-page" ref={pageRef} style={{ opacity: 0 }}>
      <div className="account-hero">
        <div className="account-avatar">
          {user.photoURL
            ? <img src={user.photoURL} alt={displayName} className="avatar-photo" />
            : <div className="avatar-circle">{initials}</div>
          }
        </div>
        <div className="account-hero-info">
          <span className="sec-eyebrow">My Account</span>
          <h1 className="account-name">{displayName}</h1>
          <p className="account-meta">
            {user.email || user.phoneNumber}
            {' · '}
            <span className={`provider-badge ${isGoogle ? 'google' : isPhone ? 'phone' : 'email'}`}>
              {isGoogle ? '🔵 Google' : isPhone ? '📱 Phone' : '📧 Email'}
            </span>
            {' · '}
            Joined {joined}
          </p>
          {/* Email verification warning */}
          {!user.emailVerified && !isGoogle && !isPhone && (
            <div className="verify-warning">
              ⚠️ Email not verified.{' '}
              <button className="resend-btn" onClick={handleResend}>Resend verification</button>
            </div>
          )}
        </div>
        <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
      </div>

      <div className="account-tabs">
        {[
          { key: 'profile',  label: 'Profile'  },
          { key: 'orders',   label: 'Orders'   },
          { key: 'wishlist', label: 'Wishlist' },
        ].map(t => (
          <button
            key={t.key}
            className={`account-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="account-body">

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div className="account-section">
            <div className="section-head">
              <h2>Personal Information</h2>
              {!editing && !isGoogle && (
                <button className="edit-btn" onClick={() => setEditing(true)}>Edit</button>
              )}
            </div>

            {editing ? (
              <form className="profile-form" onSubmit={handleSaveName}>
                <div className="prof-field">
                  <label>Display Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} autoFocus />
                </div>
                <div className="prof-actions">
                  <button type="submit" className="btn-solid" style={{ padding: '12px 32px' }} disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn-outline cancel-btn" onClick={() => { setEditing(false); setName(user.displayName || ''); }}>
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-val">{displayName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{isPhone ? 'Phone' : 'Email'}</span>
                  <span className="info-val">{user.email || user.phoneNumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Sign-in Method</span>
                  <span className="info-val">{isGoogle ? 'Google' : isPhone ? 'Phone (OTP)' : 'Email & Password'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email Verified</span>
                  <span className="info-val" style={{ color: user.emailVerified || isGoogle || isPhone ? '#4A6741' : '#C03040' }}>
                    {user.emailVerified || isGoogle || isPhone ? '✓ Verified' : '✗ Not verified'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Member Since</span>
                  <span className="info-val">{joined}</span>
                </div>
              </div>
            )}

            <div className="account-section" style={{ marginTop: 40 }}>
              <div className="section-head"><h2>Quick Links</h2></div>
              <div className="quick-links">
                {[
                  { to: '/collection', label: 'Browse Collection',    icon: '🕯️' },
                  { to: '/customize',  label: 'Build a Custom Candle', icon: '✨' },
                  { to: '/cart',       label: 'View My Cart',          icon: '🛍️' },
                  { to: '/ritual',     label: 'Candle Ritual Guide',   icon: '📖' },
                ].map(l => (
                  <Link to={l.to} key={l.to} className="quick-link">
                    <span className="quick-link-icon">{l.icon}</span>
                    <span>{l.label}</span>
                    <span className="quick-link-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div className="account-section">
            <div className="section-head"><h2>Order History</h2></div>
            {ordersLoading ? (
              <p style={{ color: 'var(--smoke)', fontStyle: 'italic' }}>Loading orders…</p>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🕯️</div>
                <h3>No orders yet</h3>
                <p>Your candle orders will appear here once you make a purchase.</p>
                <Link to="/collection" className="btn-solid" style={{ marginTop: 20, display: 'inline-block' }}>Shop Now</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div className="order-card" key={order.id}>
                    <div className="order-card-head">
                      <div>
                        <span className="order-id">#{order.id.slice(-8).toUpperCase()}</span>
                        <span className={`order-status status-${order.status || 'paid'}`}>
                          {order.status === 'paid' ? '✓ Paid' : order.status || 'Paid'}
                        </span>
                      </div>
                      <span className="order-date">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </span>
                    </div>
                    <div className="order-items-list">
                      {order.items?.map((item, i) => (
                        <div className="order-item-row" key={i}>
                          <span>{item.name} × {item.qty}</span>
                          <span>₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-card-footer">
                      <span className="order-addr">📍 {order.address}</span>
                      <span className="order-total">₹{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WISHLIST ── */}
        {tab === 'wishlist' && (
          <div className="account-section">
            <div className="section-head"><h2>Saved Items</h2></div>
            <div className="empty-state">
              <div className="empty-icon">♡</div>
              <h3>Your wishlist is empty</h3>
              <p>Save candles you love and come back to them anytime.</p>
              <Link to="/collection" className="btn-solid" style={{ marginTop: 20, display: 'inline-block' }}>Explore Collection</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
