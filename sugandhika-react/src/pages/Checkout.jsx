import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart, useAuth, useToast } from '../context/AppContext';
import { saveUserProfile, saveOrder } from '../services/firestore';
import './Checkout.css';

// ── Load Razorpay script once ──
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Reverse-geocode via Nominatim (free, no key) ──
async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  const a = data.address || {};
  return {
    address: [a.road, a.neighbourhood, a.suburb].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || '',
    city: a.city || a.town || a.village || a.county || '',
    state: a.state || '',
    pincode: a.postcode || '',
    country: a.country || 'India',
  };
}

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.displayName || '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [paying, setPaying] = useState(false);
  const [orderDone, setOrderDone] = useState(null); // order id on success
  const [step, setStep] = useState(1); // 1 = form, 2 = review

  // page animation
  useEffect(() => {
    import('gsap').then(mod => {
      const gsap = mod.gsap || mod.default;
      if (!gsap || !pageRef.current) return;
      gsap.fromTo(pageRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    }).catch(() => {});
  }, []);

  // redirect if cart empty (and no completed order)
  useEffect(() => {
    if (cart.length === 0 && !orderDone) navigate('/cart', { replace: true });
  }, []);

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  /* ── Geolocation ── */
  const detectLocation = async () => {
    setLocating(true);
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setForm(f => ({
            ...f,
            address: geo.address,
            city: geo.city,
            state: geo.state,
            pincode: geo.pincode,
          }));
          showToast('Location detected!');
        } catch {
          setLocError('Could not fetch address. Please enter manually.');
        }
        setLocating(false);
      },
      (err) => {
        const msgs = {
          1: 'Location permission denied. Please enter address manually.',
          2: 'Location unavailable. Please enter address manually.',
          3: 'Location request timed out. Try again.',
        };
        setLocError(msgs[err.code] || 'Could not detect location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ── Form validation ── */
  const isFormValid = () => {
    const { name, phone, address, city, state, pincode } = form;
    return name.trim() && phone.trim() && address.trim() && city.trim() && state.trim() && pincode.trim();
  };

  /* ── Razorpay Payment ── */
  const handlePay = async () => {
    setPaying(true);
    const ok = await loadRazorpay();
    if (!ok) {
      showToast('Payment gateway failed to load. Check your connection.');
      setPaying(false);
      return;
    }

    const options = {
      key: 'rzp_test_SRXwkk4p8UWoUc',
      amount: cartTotal * 100,     // in paise
      currency: 'INR',
      name: 'Sugandhika',
      description: `Order of ${cart.length} item(s)`,
      image: '/images/logo.jpg',
      handler: async (response) => {
        try {
          // Save user profile
          await saveUserProfile(user.uid, {
            name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          });

          // Save order
          const orderId = await saveOrder({
            uid: user.uid,
            userEmail: form.email || user.email,
            userName: form.name,
            phone: form.phone,
            address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
            items: cart.map(i => ({
              id: i.id, name: i.name,
              price: i.price, qty: i.qty,
              size: i.size,
            })),
            total: cartTotal,
            razorpayPaymentId: response.razorpay_payment_id,
          });

          clearCart();
          setOrderDone(orderId);
          showToast('Payment successful! 🎉');
        } catch (err) {
          showToast('Payment received but order save failed. Contact support.');
          console.error(err);
        }
        setPaying(false);
      },
      prefill: {
        name: form.name,
        email: form.email || user.email,
        contact: form.phone,
      },
      theme: { color: '#A07828' },
      modal: {
        ondismiss: () => setPaying(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      showToast('Payment failed. Please try again.');
      console.error(resp.error);
      setPaying(false);
    });
    rzp.open();
  };

  /* ── Order Confirmation View ── */
  if (orderDone) {
    return (
      <div className="checkout-page" ref={pageRef}>
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h1 className="sec-title">Thank <em>You!</em></h1>
          <p className="success-msg">
            Your order has been placed successfully.<br />
            Order ID: <strong>{orderDone}</strong>
          </p>
          <div className="success-actions">
            <Link to="/account" className="btn-solid">View My Orders</Link>
            <Link to="/collection" className="btn-outline"><span>Continue Shopping</span></Link>
          </div>
        </div>
      </div>
    );
  }

  const shipping = cartTotal >= 1000 ? 0 : 99;
  const grandTotal = cartTotal + shipping;

  return (
    <div className="checkout-page" ref={pageRef} style={{ opacity: 0 }}>
      <div className="checkout-header">
        <span className="sec-eyebrow">Secure Checkout</span>
        <h1 className="sec-title">Complete Your <em>Order</em></h1>
        <div className="checkout-steps">
          <span className={`step-dot ${step >= 1 ? 'active' : ''}`}>1. Delivery</span>
          <span className="step-line" />
          <span className={`step-dot ${step >= 2 ? 'active' : ''}`}>2. Review & Pay</span>
        </div>
      </div>

      <div className="checkout-layout">
        {/* ── STEP 1: Delivery Form ── */}
        {step === 1 && (
          <div className="checkout-form-wrap">
            <div className="checkout-section-title">
              <h2>Delivery Information</h2>
              <button
                className="detect-loc-btn"
                onClick={detectLocation}
                disabled={locating}
                type="button"
              >
                <span className="loc-icon">📍</span>
                {locating ? 'Detecting…' : 'Detect My Location'}
              </button>
            </div>
            {locError && <div className="loc-error">{locError}</div>}

            <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); if (isFormValid()) setStep(2); }}>
              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="checkout-name">Full Name *</label>
                  <input id="checkout-name" value={form.name} onChange={update('name')} required autoComplete="name" />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-phone">Phone *</label>
                  <input id="checkout-phone" value={form.phone} onChange={update('phone')} required type="tel" autoComplete="tel" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="checkout-email">Email</label>
                <input id="checkout-email" value={form.email} onChange={update('email')} type="email" autoComplete="email" />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-address">Address *</label>
                <textarea id="checkout-address" value={form.address} onChange={update('address')} required rows="3" placeholder="House / flat no., street, landmark…" />
              </div>

              <div className="form-row three-col">
                <div className="form-group">
                  <label htmlFor="checkout-city">City *</label>
                  <input id="checkout-city" value={form.city} onChange={update('city')} required autoComplete="address-level2" />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-state">State *</label>
                  <input id="checkout-state" value={form.state} onChange={update('state')} required autoComplete="address-level1" />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-pincode">Pincode *</label>
                  <input id="checkout-pincode" value={form.pincode} onChange={update('pincode')} required autoComplete="postal-code" pattern="[0-9]{6}" maxLength="6" placeholder="XXXXXX" />
                </div>
              </div>

              <button type="submit" className="btn-solid checkout-next-btn" disabled={!isFormValid()}>
                Review Order →
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Review & Pay ── */}
        {step === 2 && (
          <div className="checkout-review-wrap">
            <div className="review-address-card">
              <div className="review-card-head">
                <h3>Delivering To</h3>
                <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
              </div>
              <p className="review-name">{form.name}</p>
              <p className="review-addr">{form.address}</p>
              <p className="review-addr">{form.city}, {form.state} — {form.pincode}</p>
              <p className="review-phone">📱 {form.phone}</p>
            </div>

            <div className="review-items">
              <h3>Order Items</h3>
              {cart.map(item => (
                <div className="review-item" key={`${item.id}-${item.size}`}>
                  <div className="ri-img">
                    {item.img
                      ? <img src={item.img} alt={item.name} />
                      : <div style={{ width: '100%', height: '100%', background: item.color || 'var(--sand)' }} />}
                  </div>
                  <div className="ri-info">
                    <span className="ri-name">{item.name}</span>
                    <span className="ri-meta">Size: {item.size} · Qty: {item.qty}</span>
                  </div>
                  <span className="ri-price">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sidebar Summary (always visible) ── */}
        <div className="checkout-summary">
          <div className="cs-title">Payment Summary</div>
          {cart.map(item => (
            <div className="cs-row" key={`${item.id}-${item.size}`}>
              <span>{item.name} × {item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="cs-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? <span className="free-ship">FREE</span> : `₹${shipping}`}</span>
          </div>
          <div className="cs-total">
            <span>Total</span>
            <span className="cs-amount">₹{grandTotal}</span>
          </div>

          {step === 2 && (
            <button
              className="pay-btn"
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? 'Processing…' : `Pay ₹${grandTotal}`}
            </button>
          )}

          <div className="cs-assurances">
            {['Secure Razorpay payments', 'Free shipping above ₹1,000', '100% natural ingredients', 'Ships in 3 business days'].map(a => (
              <div className="cs-assurance" key={a}><span className="cs-dot" />{a}</div>
            ))}
          </div>

          <div className="checkout-secure">
            <span className="secure-icon">🔒</span>
            <span>Secured by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
