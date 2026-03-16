import { useState, useRef, useEffect } from 'react';
import { FRAGRANCES } from '../data/products';
import { useCart } from '../context/AppContext';
import { useToast } from '../context/AppContext';
import './Customize.css';

const COLORS = [
  { hex: '#F8F2E8', name: 'Ivory' },
  { hex: '#F5D0D8', name: 'Blush' },
  { hex: '#E8485A', name: 'Rose Red' },
  { hex: '#A8D8E8', name: 'Ocean' },
  { hex: '#C4A882', name: 'Caramel' },
  { hex: '#D8F0C8', name: 'Sage' },
  { hex: '#F5E870', name: 'Lemon' },
  { hex: '#2A1F14', name: 'Noir' },
];

const SIZES = [
  { code: 'S', weight: '100g', burn: '25hr', price: 399 },
  { code: 'M', weight: '180g', burn: '40hr', price: 649 },
  { code: 'L', weight: '280g', burn: '60hr', price: 899 },
];

export default function Customize() {
  const [selColor, setSelColor] = useState(COLORS[0]);
  const [selScent, setSelScent] = useState(FRAGRANCES[0]);
  const [selSize, setSelSize] = useState(SIZES[1]);
  const [labelText, setLabelText] = useState('');
  const [soundOn, setSoundOn] = useState(false);
  const [rotY, setRotY] = useState(-12);
  const dragRef = useRef({ dragging: false, lastX: 0 });
  const audioRef = useRef({ ctx: null, brown: null, gain: null, crackleTimer: null });
  const { addToCart } = useCart();
  const showToast = useToast();

  // Drag to rotate
  const onMouseDown = (e) => { dragRef.current = { dragging: true, lastX: e.clientX }; };
  const onMouseMove = (e) => {
    if (!dragRef.current.dragging) return;
    setRotY(r => r + (e.clientX - dragRef.current.lastX) * 0.45);
    dragRef.current.lastX = e.clientX;
  };
  const onMouseUp = () => { dragRef.current.dragging = false; };
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, []);

  // WebAudio fire crackle
  const toggleSound = () => {
    const a = audioRef.current;
    if (!a.ctx) a.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (soundOn) {
      if (a.gain) a.gain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.3);
      setTimeout(() => { try { a.brown?.disconnect(); } catch {} }, 500);
      clearTimeout(a.crackleTimer);
      setSoundOn(false);
    } else {
      const buf = 4096;
      const bn = a.ctx.createScriptProcessor(buf, 1, 1);
      let last = 0;
      bn.onaudioprocess = e => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < buf; i++) { const w = (Math.random() * 2 - 1) * 0.02; out[i] = (last + w) * 0.99; last = out[i]; out[i] *= 3.8; }
      };
      a.gain = a.ctx.createGain(); a.gain.gain.value = 0.15;
      bn.connect(a.gain); a.gain.connect(a.ctx.destination); a.brown = bn;
      const crackle = () => {
        const osc = a.ctx.createOscillator(); const g = a.ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.value = 180 + Math.random() * 350;
        g.gain.setValueAtTime(0.05 + Math.random() * 0.09, a.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.ctx.currentTime + 0.05 + Math.random() * 0.09);
        osc.connect(g); g.connect(a.ctx.destination); osc.start(); osc.stop(a.ctx.currentTime + 0.12);
        a.crackleTimer = setTimeout(crackle, 60 + Math.random() * 280);
      };
      crackle(); setSoundOn(true);
    }
  };

  const handleAddToCart = () => {
    const total = selSize.price;
    addToCart({ id: 'custom_' + Date.now(), name: `Custom ${selSize.code} — ${selScent.label}`, price: total, img: null, color: selColor.hex }, selSize.code);
    showToast(`Custom ${selSize.code} · ${selScent.label} added — ₹${total}`);
  };

  const meltColor = selColor.hex === '#2A1F14' ? '#5A3A20' : '#EDE4D3';
  const labelColor = selColor.hex === '#2A1F14' ? '#3A2A1A' : '#EDE4D3';
  const displayName = labelText || 'Sugandhika';

  return (
    <div className="cust-page page-enter">
      <div className="cust-header">
        <span className="sec-eyebrow">Real-time Builder</span>
        <h1 className="sec-title">Design your <em>signature</em> candle</h1>
      </div>

      <div className="cust-layout">
        {/* 3D Candle Preview */}
        <div className="cust-visual">
          <div className="glow-ring" style={{ background: `radial-gradient(circle, ${selColor.hex}44, transparent 70%)` }} />
          <div className="candle-scene">
            <div
              className="candle-3d"
              style={{ transform: `rotateY(${rotY}deg) rotateX(4deg)` }}
              onMouseDown={onMouseDown}
            >
              <svg viewBox="0 0 220 420" width="190" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 16px 32px rgba(160,120,40,.2))' }}>
                <ellipse cx="110" cy="388" rx="56" ry="14" fill={selColor.hex} opacity=".2"/>
                <ellipse cx="110" cy="62" rx="20" ry="30" fill="#FFD580" opacity=".15"/>
                <ellipse cx="110" cy="56" rx="13" ry="22" fill="#FFD580" opacity=".9"/>
                <ellipse cx="110" cy="63" rx="8" ry="14" fill="#E8923A"/>
                <ellipse cx="110" cy="70" rx="5" ry="8" fill="#C94520"/>
                <line x1="110" y1="77" x2="110" y2="88" stroke="#2A1F14" strokeWidth="2.5"/>
                <rect x="72" y="88" width="76" height="278" rx="10" fill={selColor.hex}/>
                <rect x="76" y="88" width="16" height="278" rx="8" fill="white" opacity=".12"/>
                <path d={`M72 113 Q110 124 148 113`} stroke={meltColor} strokeWidth="2" fill="none"/>
                <rect x="72" y="228" width="76" height="80" fill={labelColor} opacity=".72"/>
                <text x="110" y="254" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="11" fill="#2A1F14" fontStyle="italic">{displayName.slice(0, 14)}</text>
                <line x1="84" y1="263" x2="136" y2="263" stroke="#C9A454" strokeWidth=".7"/>
                <text x="110" y="280" textAnchor="middle" fontFamily="Josefin Sans,sans-serif" fontSize="7.5" fill="#8B7355" letterSpacing="2">{selScent.notes}</text>
                <text x="110" y="295" textAnchor="middle" fontFamily="Josefin Sans,sans-serif" fontSize="7" fill="#8B7355" letterSpacing="1">{selSize.weight} · {selSize.burn} burn</text>
                <rect x="62" y="366" width="96" height="12" rx="6" fill="#D4B896"/>
                <rect x="56" y="376" width="108" height="10" rx="5" fill="#C9A454" opacity=".45"/>
              </svg>
            </div>
          </div>
          <p className="drag-hint">Drag to rotate</p>
          {soundOn && (
            <div className="sound-viz">
              {[6,16,10,18,8,14].map((h, i) => (
                <span key={i} className="sound-bar" style={{ height: h, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="cust-controls">
          <div className="ctrl-section">
            <div className="ctrl-heading">Custom Label Name</div>
            <input
              className="name-input" maxLength={18}
              placeholder="e.g. For Mama, with love"
              value={labelText}
              onChange={e => setLabelText(e.target.value)}
            />
          </div>

          <div className="ctrl-section">
            <div className="ctrl-heading">Wax Colour</div>
            <div className="color-grid">
              {COLORS.map(c => (
                <div key={c.hex} style={{ textAlign: 'center' }}>
                  <div
                    className={`c-swatch ${selColor.hex === c.hex ? 'active' : ''}`}
                    style={{ background: c.hex, border: `3px solid ${selColor.hex === c.hex ? 'var(--gold)' : 'rgba(0,0,0,.08)'}` }}
                    onClick={() => setSelColor(c)}
                  />
                  <div className="c-swatch-name">{c.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="ctrl-section">
            <div className="ctrl-heading">Fragrance</div>
            <div className="scent-grid">
              {FRAGRANCES.map(f => (
                <button
                  key={f.label}
                  className={`s-pill ${selScent.label === f.label ? 'active' : ''}`}
                  onClick={() => setSelScent(f)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ctrl-section">
            <div className="ctrl-heading">Size</div>
            <div className="size-grid">
              {SIZES.map(s => (
                <div
                  key={s.code}
                  className={`sz-btn ${selSize.code === s.code ? 'active' : ''}`}
                  onClick={() => setSelSize(s)}
                >
                  <div className="sz-btn-size">{s.code}</div>
                  <div className="sz-btn-info">{s.weight} · {s.burn}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="ctrl-section">
            <div className="ctrl-heading">Ambience Sound</div>
            <div className="sound-row">
              <button className={`sound-toggle ${soundOn ? 'on' : ''}`} onClick={toggleSound}>
                <span className="toggle-thumb" />
              </button>
              <span className="sound-label">{soundOn ? 'Crackling Fire — Playing' : 'Crackling Fire'}</span>
            </div>
            <div className="sound-note">Synthesized ambient audio via Web Audio API</div>
          </div>

          <div className="ctrl-section">
            <div className="ctrl-heading">Order Summary</div>
            <div className="order-summary">
              <div className="sum-row"><span>Wax</span><span>{selColor.name}</span></div>
              <div className="sum-row"><span>Fragrance</span><span>{selScent.label}</span></div>
              <div className="sum-row"><span>Size</span><span>{selSize.code} · {selSize.weight} · {selSize.burn}</span></div>
              <div className="sum-row"><span>Label</span><span>{labelText || 'Standard'}</span></div>
              <div className="sum-total">
                <span>Total</span>
                <span className="sum-price">₹{selSize.price}</span>
              </div>
            </div>
            <button className="add-custom-btn" onClick={handleAddToCart}>Add Custom Candle to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
