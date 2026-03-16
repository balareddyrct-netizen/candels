import { useRevealAll } from '../hooks/useReveal';
import { useGsapPage } from '../hooks/useGsapPage';
import { Link } from 'react-router-dom';
import './Story.css';

export default function Story() {
  useRevealAll();
  useGsapPage();
  return (
    <div className="story-page page-enter">
      <div className="story-hero">
        <div className="story-hero-text" data-gsap="fadeUp">
          <span className="sec-eyebrow">Nellore · Since 2020</span>
          <h1 className="story-h1">Our <em>Story</em></h1>
          <p>Born in a Nellore home, guided by the fragrance of temple flowers along the Andhra coast.</p>
        </div>
      </div>

      {/* Chapter 1 */}
      <div className="chapter">
        <div className="ch-text">
          <div className="ch-num" data-gsap="fadeLeft">01</div>
          <span className="sec-eyebrow reveal">Origin</span>
          <h2 className="ch-title reveal">Born in a <em>kitchen</em></h2>
          <p className="ch-body reveal">Sugandhika began in 2020 in Nellore, Andhra Pradesh — a small home, a desire to capture the fragrance of the city's temple mornings. The rose garlands at Ranganathaswamy Temple, the turmeric and sandalwood of daily poojas, the sea-salt air of the Penna river coast. Every candle we make reaches back to those streets.</p>
        </div>
        <div className="ch-visual" style={{ background: '#F5EEE0' }}>
          <img src="/images/rose_04.jpg" alt="Sugandhika candle" className="ch-img" />
        </div>
      </div>

      {/* Chapter 2 */}
      <div className="chapter chapter-alt" id="craft">
        <div className="ch-visual" style={{ background: '#EDE8D8' }}>
          <img src="/images/floral_plate_01.jpg" alt="Sugandhika craft" className="ch-img" />
        </div>
        <div className="ch-text">
          <div className="ch-num" data-gsap="fadeRight">02</div>
          <span className="sec-eyebrow reveal">Craft & Materials</span>
          <h2 className="ch-title reveal"><em>Every ingredient</em> matters</h2>
          <p className="ch-body reveal">We source rose absolute and lavender from trusted fragrance partners. Sandalwood and turmeric from Andhra-based suppliers. Our wax is a blend of certified organic soy and beeswax — nothing synthetic, nothing that burns the lung. The wick is braided cotton, trimmed by hand before each vessel is sealed.</p>
        </div>
      </div>

      {/* Chapter 3 */}
      <div className="chapter" id="sustainability">
        <div className="ch-text">
          <div className="ch-num" data-gsap="fadeLeft">03</div>
          <span className="sec-eyebrow reveal">Sustainability</span>
          <h2 className="ch-title reveal">The earth it <em>came from</em></h2>
          <p className="ch-body reveal">Our vessels are reusable glass. Our packaging is minimal and recyclable. When the candle is spent, we take back the vessel, reclean it, and refill it for 40% off. We call it the Return Ritual — because in Andhra homes, nothing of value is ever wasted.</p>
        </div>
        <div className="ch-visual" style={{ background: '#EAF0E8' }}>
          <img src="/images/bubble_colour_01.jpg" alt="Sugandhika sustainability" className="ch-img" />
        </div>
      </div>

      {/* Values */}
      <div className="values-section" data-gsap="fadeUp" data-gsap-stagger="120">
        {[
          { num: '01', title: 'Devotion', body: 'We make candles the way our grandmothers made offerings — with intention, with patience, with care. Every pour is a small ceremony in itself.' },
          { num: '02', title: 'Purity', body: 'No synthetics. No paraffin. No fillers. Only what the earth gives us, carefully extracted, responsibly sourced, and gently refined.' },
          { num: '03', title: 'Continuity', body: 'The fragrance traditions of Telugu households deserve to continue. We are building a living archive of Andhra scent memory, one candle at a time.' },
        ].map((v, i) => (
          <div className="val reveal" key={i} style={{ transitionDelay: `${i * 120}ms` }}>
            <div className="val-num">{v.num}</div>
            <div className="val-title">{v.title}</div>
            <p className="val-body">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="story-cta">
        <h2 className="sec-title reveal" style={{ color: 'var(--cream)' }}>Ready to <em>explore?</em></h2>
        <div className="divider reveal" style={{ margin: '20px auto 28px', opacity: .5 }} />
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }} className="reveal">
          <Link to="/collection" className="btn-outline"><span>Shop Collection</span></Link>
          <Link to="/customize" className="btn-solid">Build Custom Candle</Link>
        </div>
      </div>
    </div>
  );
}
