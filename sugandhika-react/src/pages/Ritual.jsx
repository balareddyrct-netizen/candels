import { useRevealAll } from '../hooks/useReveal';
import { useGsapPage } from '../hooks/useGsapPage';
import { Link } from 'react-router-dom';
import './Ritual.css';

const STEPS = [
  { num: '01', title: 'Set the Space', body: 'Choose a still corner. Remove all drafts — close windows, still the fan. Place the candle on a heat-safe, level surface. Let silence be the first layer of fragrance.' },
  { num: '02', title: 'Trim the Wick', body: 'Before every single burn, trim the wick to exactly 5mm. A long wick creates mushrooming carbon deposits and uneven heat. Use a wick trimmer or sharp scissors.' },
  { num: '03', title: 'First Burn Memory', body: 'On the very first use, allow a complete melt pool from edge to edge — typically 2–3 hours. This sets the candle\'s memory and ensures every subsequent burn is even.' },
  { num: '04', title: 'Never Exceed 4 Hours', body: 'Burn for no more than 4 hours at a time. Beyond this, the vessel overheats, the fragrance burns off rather than diffuses, and the wick may begin tunnelling.' },
  { num: '05', title: 'Use a Snuffer', body: 'Never blow out a Sugandhika candle. Use a brass snuffer or gently press the wick into the melt pool. The fragrance is preserved, the wick stays centred.' },
  { num: '06', title: 'Store with Intention', body: 'Store your candle covered away from direct sunlight, which fades fragrance and yellows wax. Keep upright in a cool, dark space.' },
  { num: '07', title: 'The Return Ritual', body: 'When your candle reaches its final centimetre, return the vessel to us. We\'ll clean it, recure it, and refill it with your chosen fragrance at 40% off.' },
];

const SCENT_TABLE = [
  { color: '#F5D0D8', name: 'Garden Rose',      char: 'Soft, romantic, dewy',      time: 'Morning · Evening', use: 'Pooja room, bedroom, gifting' },
  { color: '#D8D0F0', name: 'English Lavender', char: 'Calm, herbal, clean',       time: 'Night · Afternoon',  use: 'Bedroom, meditation, study' },
  { color: '#D8EDD0', name: 'Lime Fresh',        char: 'Crisp, citrus, energising', time: 'Morning · Daytime',  use: 'Kitchen, workspace, living room' },
  { color: '#F5E8D0', name: 'Vanilla',           char: 'Warm, sweet, comforting',  time: 'Evening · Night',    use: 'Living room, bedroom, winter' },
  { color: '#F0D8A8', name: 'Sandal Turmeric',   char: 'Earthy, sacred, grounding',time: 'Dawn · Evening',     use: 'Pooja, ceremony, yoga' },
];

export default function Ritual() {
  useRevealAll();
  useGsapPage();
  return (
    <div className="ritual-page page-enter">
      <div className="ritual-hero">
        <div className="ritual-hero-text reveal">
          <span className="sec-eyebrow">The Practice</span>
          <h1 className="ritual-h1">The Candle <em>Ritual</em></h1>
          <p>A Sugandhika candle is not merely lit — it is tended. Here is how to honour the flame.</p>
        </div>
      </div>

      <div className="steps-section" data-gsap="fadeUp" data-gsap-stagger="80">
        <div className="steps-header">
          <span className="sec-eyebrow" style={{ color: 'var(--smoke)' }}>Seven steps</span>
          <h2 className="sec-title" style={{ color: 'var(--white)' }}>The Burning <em>Method</em></h2>
        </div>
        {STEPS.map((s, i) => (
          <div className="step-row reveal" key={s.num} style={{ transitionDelay: `${i * 60}ms` }}>
            <div className="step-num">{s.num}</div>
            <div className="step-content">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="care-section">
        <span className="sec-eyebrow">Guidelines</span>
        <h2 className="sec-title" style={{ color: 'var(--deep)' }}>Do's &amp; <em>Don'ts</em></h2>
        <div className="care-grid" data-gsap="scaleIn" data-gsap-stagger="100">
          <div className="care-card care-do reveal">
            <h4>✓ Always Do</h4>
            <p>Trim wick to 5mm before every burn · Burn on a heat-safe surface · Allow full melt pool on first burn · Use a snuffer · Store covered away from sunlight · Return vessel for the Refill Ritual</p>
          </div>
          <div className="care-card care-dont reveal" style={{ transitionDelay: '100ms' }}>
            <h4>✗ Never Do</h4>
            <p>Blow out the flame · Burn near fabrics or in a draft · Burn for more than 4 hours · Move a burning candle · Leave unattended · Burn when less than 1cm of wax remains</p>
          </div>
        </div>
      </div>

      <div className="scent-guide">
        <span className="sec-eyebrow" style={{ color: 'var(--smoke)' }}>Fragrance Guide</span>
        <h2 className="sec-title" style={{ color: 'var(--deep)' }}>Scent <em>Families</em></h2>
        <div className="scent-table-wrap" data-gsap="fadeUp">
          <table className="scent-table">
            <thead>
              <tr><th>Fragrance</th><th>Character</th><th>Best Time</th><th>Pairs with</th></tr>
            </thead>
            <tbody>
              {SCENT_TABLE.map(s => (
                <tr key={s.name}>
                  <td><span className="scent-dot" style={{ background: s.color }} /> {s.name}</td>
                  <td>{s.char}</td>
                  <td>{s.time}</td>
                  <td>{s.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ritual-cta">
        <h2 className="sec-title reveal" style={{ color: 'var(--deep)' }}>Ready to begin <em>your ritual?</em></h2>
        <div className="divider reveal" style={{ margin: '20px auto 28px' }} />
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }} className="reveal">
          <Link to="/collection" className="btn-outline"><span>Shop Collection</span></Link>
          <Link to="/customize" className="btn-solid">Build Custom Candle</Link>
        </div>
      </div>
    </div>
  );
}
