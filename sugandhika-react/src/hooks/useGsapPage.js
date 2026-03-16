import { useEffect } from 'react';

/**
 * Drop-in GSAP scroll reveal for any page.
 * Animates elements matching `selector` as they enter viewport.
 * Each element can have data-gsap-delay="200" (ms) for custom stagger.
 */
export function useGsapPage() {
  useEffect(() => {
    import('gsap').then(mod => {
      const gsap = mod.gsap || mod.default;
      if (!gsap) return;

      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        // Page-level fade-in already handled by App.jsx RouteTransition
        // Section-level reveals
        const sections = document.querySelectorAll('[data-gsap]');
        sections.forEach(el => {
          const type    = el.dataset.gsap || 'fadeUp';
          const delay   = parseFloat(el.dataset.gsapDelay || 0) / 1000;
          const stagger = parseFloat(el.dataset.gsapStagger || 0) / 1000;

          const fromVars = {
            fadeUp:    { opacity: 0, y: 40 },
            fadeLeft:  { opacity: 0, x: -50 },
            fadeRight: { opacity: 0, x: 50 },
            scaleIn:   { opacity: 0, scale: 0.9 },
            fadeIn:    { opacity: 0 },
          }[type] || { opacity: 0, y: 40 };

          const toVars = {
            opacity: 1, x: 0, y: 0, scale: 1,
            duration: 0.75, ease: 'power2.out', delay,
          };

          if (stagger) {
            const children = el.children;
            ScrollTrigger.create({
              trigger: el, start: 'top 85%', once: true,
              onEnter: () => gsap.fromTo(children, fromVars, { ...toVars, stagger }),
            });
          } else {
            ScrollTrigger.create({
              trigger: el, start: 'top 85%', once: true,
              onEnter: () => gsap.fromTo(el, fromVars, toVars),
            });
          }
        });

        return () => ScrollTrigger.getAll().forEach(t => t.kill());
      }).catch(() => {});
    }).catch(() => {});
  }, []);
}
