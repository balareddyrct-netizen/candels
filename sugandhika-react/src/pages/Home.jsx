import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '../data/products';
import { useProducts } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { useRevealAll } from '../hooks/useReveal';
import './Home.css';

export default function Home() {
  const heroRef    = useRef(null);
  const logoRef    = useRef(null);
  const eyebrowRef = useRef(null);
  const titleRef   = useRef(null);
  const ruleRef    = useRef(null);
  const taglineRef = useRef(null);
  const actionsRef = useRef(null);
  const scrollRef  = useRef(null);
  const bokehs     = useRef([]);
  const { products, loadingProducts } = useProducts();

  useRevealAll();

  useEffect(() => {
    let mouseMoveHandler;
    let mouseLeaveHandler;
    let heroEl = heroRef.current;

    import('gsap').then(mod => {
      const gsap = mod.gsap || mod.default;
      if (!gsap) return;

      import('gsap/ScrollTrigger').then(stMod => {
        const { ScrollTrigger } = stMod;
        gsap.registerPlugin(ScrollTrigger);

        // Hero entrance timeline
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl
          .fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
          .fromTo(logoRef.current,
            { scale: 0.55, opacity: 0, filter: 'blur(10px)' },
            { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.1 }, '-=0.2')
          .fromTo(eyebrowRef.current,
            { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.5')
          .fromTo(titleRef.current,
            { opacity: 0, y: 28, letterSpacing: '22px' },
            { opacity: 1, y: 0, letterSpacing: '8px', duration: 0.85 }, '-=0.35')
          .fromTo(ruleRef.current,
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.55, ease: 'power2.inOut', transformOrigin: 'center' }, '-=0.3')
          .fromTo(taglineRef.current,
            { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.28')
          .fromTo(actionsRef.current,
            { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.5)' }, '-=0.28')
          .fromTo(scrollRef.current,
            { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2');

        // Scroll cue bounce
        gsap.to(scrollRef.current, {
          y: 9, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4,
        });

        // Hero background multi-layer scroll parallax
        gsap.to('.hero-bg-img', {
          yPercent: 25, ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1.2 },
        });
        
        // Hero foreground pop scroll parallax
        gsap.to('.hero-inner', {
          yPercent: -15, ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
        });

        // 3D Mouse tracking parallax
        mouseMoveHandler = (e) => {
          if (!heroEl) return;
          const { left, top, width, height } = heroEl.getBoundingClientRect();
          const x = e.clientX - left;
          const y = e.clientY - top;
          const xNorm = (x / width) - 0.5; // -0.5 to 0.5
          const yNorm = (y / height) - 0.5;

          gsap.to(logoRef.current, { rotateX: yNorm * -20, rotateY: xNorm * 20, x: xNorm * 40, y: yNorm * 40, duration: 0.8, ease: 'power2.out' });
          gsap.to(titleRef.current, { rotateX: yNorm * -10, rotateY: xNorm * 10, x: xNorm * 80, y: yNorm * 80, duration: 0.8, ease: 'power2.out' });
          gsap.to('.hero-bg-img', { x: xNorm * -60, y: yNorm * -60, duration: 1.2, ease: 'power2.out' });
        };

        mouseLeaveHandler = () => {
          gsap.to([logoRef.current, titleRef.current], { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 1, ease: 'power2.out' });
          gsap.to('.hero-bg-img', { x: 0, y: 0, duration: 1, ease: 'power2.out' });
        };

        if (heroEl) {
          heroEl.addEventListener('mousemove', mouseMoveHandler);
          heroEl.addEventListener('mouseleave', mouseLeaveHandler);
        }

        // Floating bokeh
        bokehs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            y: `random(-28, 28)`, x: `random(-18, 18)`,
            opacity: `random(0.04, 0.22)`,
            duration: `random(4, 9)`,
            ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.5,
          });
        });

        // Intro strip
        ScrollTrigger.create({ trigger: '.intro-strip', start: 'top 80%', once: true,
          onEnter: () => {
            gsap.fromTo('.intro-number', { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' });
            gsap.fromTo('.intro-text',   { opacity: 0, x: 50  }, { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out', delay: 0.1 });
          }
        });

        // Pre-hide featured cards so GSAP can animate them in
        gsap.set('.feat-grid .prod-card', { opacity: 0, y: 36 });

        // Featured cards
        ScrollTrigger.create({ trigger: '.feat-grid', start: 'top 85%', once: true,
          onEnter: () => gsap.fromTo('.feat-grid .prod-card',
            { opacity: 0, y: 36 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', clearProps: 'all' })
        });

        // Pillars
        ScrollTrigger.create({ trigger: '.pillars', start: 'top 80%', once: true,
          onEnter: () => gsap.fromTo('.pillar',
            { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power2.out' })
        });

        // Banner
        ScrollTrigger.create({ trigger: '.banner', start: 'top 82%', once: true,
          onEnter: () => {
            gsap.fromTo('.banner-left', { opacity: 0, x: -48 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' });
            gsap.fromTo('.btn-cream',   { opacity: 0, x: 48  }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: 0.12 });
          }
        });

        // Testimonials
        ScrollTrigger.create({ trigger: '.testi-grid', start: 'top 85%', once: true,
          onEnter: () => gsap.fromTo('.testi-card',
            { opacity: 0, y: 40, rotateX: 6 },
            { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.14, ease: 'power2.out' })
        });

      }).catch(() => {});
    }).catch(() => {});

    // Cleanup event listeners
    return () => {
      if (heroEl) {
        if (mouseMoveHandler) heroEl.removeEventListener('mousemove', mouseMoveHandler);
        if (mouseLeaveHandler) heroEl.removeEventListener('mouseleave', mouseLeaveHandler);
      }
    };
  }, [loadingProducts]); // Re-run animations if products wait to load

  const featured = products ? products.filter(p => p.featured).slice(0, 3) : [];
  const bokehData = [
    { s: 8,  l: '14%', t: '28%', op: .10 },
    { s: 12, l: '72%', t: '18%', op: .07 },
    { s: 5,  l: '42%', t: '62%', op: .13 },
    { s: 16, l: '88%', t: '44%', op: .05 },
    { s: 9,  l: '26%', t: '72%', op: .09 },
    { s: 6,  l: '60%', t: '78%', op: .08 },
    { s: 11, l: '50%', t: '34%', op: .06 },
    { s: 7,  l: '82%', t: '60%', op: .10 },
  ];

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero" ref={heroRef} style={{ opacity: 0 }}>
        <div className="hero-bg">
          <img src="/images/hero-bg.jpg" alt="" className="hero-bg-img" aria-hidden />
          <div className="hero-bg-overlay" />
        </div>

        {/* Bokeh particles */}
        {bokehData.map((b, i) => (
          <div key={i} className="bokeh"
            ref={el => bokehs.current[i] = el}
            style={{ width: b.s, height: b.s, left: b.l, top: b.t, opacity: b.op }}
          />
        ))}

        <div className="hero-inner">
          <div className="hero-logo-wrap" ref={logoRef} style={{ opacity: 0 }}>
            <img src="/images/logo.jpg" alt="Sugandhika" className="hero-logo-img" />
          </div>
          <p className="hero-eyebrow" ref={eyebrowRef} style={{ opacity: 0 }}>
            Handcrafted in Nellore, Andhra Pradesh · Est. 2020
          </p>
          <h1 className="hero-title" ref={titleRef} style={{ opacity: 0, letterSpacing: '22px' }}>
            Sugandhika
          </h1>
          <div className="hero-rule" ref={ruleRef} style={{ opacity: 0, transform: 'scaleX(0)' }}>
            <div className="hero-diamond" />
          </div>
          <p className="hero-tagline" ref={taglineRef} style={{ opacity: 0 }}>
            Sculptural candles born from the sacred art of flame
          </p>
          <div className="hero-actions" ref={actionsRef} style={{ opacity: 0 }}>
            <Link to="/collection" className="btn-outline hero-btn"><span>Explore Collection</span></Link>
            <Link to="/customize" className="btn-solid hero-btn">Build Your Candle</Link>
          </div>
        </div>

        <div className="scroll-cue" ref={scrollRef} style={{ opacity: 0 }}>
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* INTRO */}
      <div className="intro-strip">
        <div className="intro-number">01</div>
        <div className="intro-text">
          <span className="sec-eyebrow">Our Origin</span>
          <h2 className="sec-title">Born on the <em>Telugu coast</em></h2>
          <div className="divider" />
          <p>Every Sugandhika candle carries the memory of Nellore's temple courtyards at dawn — incense smoke rising through the sea-salt air of the Andhra coast. We started in a small home in Nellore, blending fragrances rooted in Telugu tradition with clean, natural craft.</p>
          <br />
          <Link to="/story" className="btn-outline" style={{ marginTop: 8 }}><span>Read Our Story</span></Link>
        </div>
      </div>

      {/* FEATURED */}
      <section className="featured">
        <div className="featured-header">
          <div>
            <span className="sec-eyebrow">Handcrafted Selection</span>
            <h2 className="sec-title">Featured <em>Candles</em></h2>
          </div>
          <Link to="/collection" className="btn-outline" style={{ borderColor: 'var(--deep)', color: 'var(--deep)' }}>
            <span>View All</span>
          </Link>
        </div>
        <div className="feat-grid">
          {loadingProducts ? (
            <div className="coll-loading">Loading featured candles...</div>
          ) : (
            featured.map(p => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </section>

      {/* PILLARS */}
      <div className="pillars">
        {[
          { icon: '🕯️', title: 'Pure Wax',    body: '100% natural soy and beeswax blend. No paraffin, no synthetic fillers. What you breathe is only fragrance.' },
          { icon: '🌸', title: 'Botanicals',  body: 'Rose, lavender, sandalwood, turmeric — sourced from trusted Indian fragrance partners. Every ingredient tested.' },
          { icon: '🤲', title: 'Handpoured',  body: 'Each candle is poured by hand in small batches in our Nellore workshop. Every vessel individually inspected.' },
          { icon: '⭐', title: 'Ritual Grade', body: 'Cotton wicks, 20–60hr burn times, recyclable vessels. Designed for ceremony, not just ambience.' },
        ].map((p, i) => (
          <div className="pillar" key={i}>
            <div className="pillar-icon">{p.icon}</div>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </div>

      {/* BANNER */}
      <div className="banner">
        <div className="banner-left">
          <h2>Build your own signature candle.</h2>
          <p>Choose your wax colour, fragrance, size, and vessel. We'll pour it and ship within 3 days.</p>
        </div>
        <Link to="/customize" className="btn-cream">Customize Now</Link>
      </div>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <span className="sec-eyebrow">From our community</span>
        <h2 className="sec-title">What people <em>feel</em></h2>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testi-card" key={i}>
              <div className="testi-stars">{'★'.repeat(t.stars)}</div>
              <p className="testi-quote">"{t.quote}"</p>
              <span className="testi-author">— {t.author}, {t.location}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
