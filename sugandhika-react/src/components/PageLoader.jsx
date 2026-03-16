import { useEffect, useRef } from 'react';
import './PageLoader.css';

export default function PageLoader({ onComplete }) {
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const nameRef = useRef(null);
  const lineRef = useRef(null);
  const taglineRef = useRef(null);
  const progressRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    // Use GSAP from CDN via window if bundled gsap unavailable, else import
    const run = (gsap) => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(overlayRef.current, {
            yPercent: -100,
            duration: 0.9,
            ease: 'power3.inOut',
            delay: 0.2,
            onComplete,
          });
        },
      });

      // Logo scales in with glow
      tl.fromTo(logoRef.current,
        { scale: 0.4, opacity: 0, filter: 'blur(12px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' }
      )
      // Name slides up
      .fromTo(nameRef.current,
        { yPercent: 40, opacity: 0, letterSpacing: '20px' },
        { yPercent: 0, opacity: 1, letterSpacing: '8px', duration: 0.8, ease: 'power2.out' },
        '-=0.4'
      )
      // Gold line expands
      .fromTo(lineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power2.inOut' },
        '-=0.3'
      )
      // Tagline fades
      .fromTo(taglineRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.2'
      )
      // Progress bar fills
      .fromTo(fillRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.0, ease: 'power1.inOut', transformOrigin: 'left center' },
        '-=0.4'
      );
    };

    // Try bundled gsap first, fallback to dynamic import
    import('gsap').then(m => run(m.gsap || m.default)).catch(() => {
      if (window.gsap) run(window.gsap);
      else setTimeout(onComplete, 2000);
    });
  }, []);

  return (
    <div className="loader-overlay" ref={overlayRef}>
      {/* Background matches hero bg */}
      <div className="loader-bg" />

      <div className="loader-content">
        <div className="loader-logo-wrap" ref={logoRef}>
          <img src="/images/logo.jpg" alt="Sugandhika" className="loader-logo" />
        </div>
        <h1 className="loader-name" ref={nameRef}>SUGANDHIKA</h1>
        <div className="loader-line" ref={lineRef} />
        <p className="loader-tagline" ref={taglineRef}>Handcrafted Candles · Nellore</p>
        <div className="loader-progress" ref={progressRef}>
          <div className="loader-fill" ref={fillRef} />
        </div>
      </div>
    </div>
  );
}
