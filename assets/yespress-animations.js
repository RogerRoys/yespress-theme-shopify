/*
  Yespress scroll & load animations (GSAP + ScrollTrigger).
  Progressive enhancement: everything is visible without JS; animations
  use gsap.from() so a failed load never hides content.

  Hooks:
    [data-ys-reveal="up|down|left|right|scale"]  – reveal on scroll (data-ys-delay="0.2")
    [data-ys-stagger]                            – reveal direct children with stagger
    [data-ys-parallax="60"]                      – scrubbed parallax by ±N px
    [data-ys-float]                              – gentle infinite float (decor)
*/
(function () {
  'use strict';

  function init() {
    if (!window.gsap) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    /* Hero intro (on load) */
    document.querySelectorAll('.yespress-hero').forEach(function (hero) {
      if (hero.dataset.ysBound) return;
      hero.dataset.ysBound = 'true';
      var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      var media = hero.querySelector('.yespress-hero__media');
      if (media) tl.from(media, { autoAlpha: 0, scale: 1.06, duration: 1.6 }, 0);
      var text = hero.querySelectorAll('.yespress-hero__brand, .yespress-hero__heading');
      if (text.length) tl.from(text, { y: 44, autoAlpha: 0, duration: 1, stagger: 0.14 }, 0.35);
      var offer = hero.querySelector('.yespress-hero__offer');
      if (offer) tl.from(offer, { y: 24, autoAlpha: 0, duration: 0.8 }, 0.75);
    });

    /* Header slide-down on load */
    document.querySelectorAll('.yespress-header').forEach(function (el) {
      if (el.dataset.ysBound) return;
      el.dataset.ysBound = 'true';
      gsap.from(el, { y: -60, autoAlpha: 0, duration: 0.9, ease: 'power3.out' });
    });

    if (!window.ScrollTrigger) return;

    /* Generic reveals */
    document.querySelectorAll('[data-ys-reveal]').forEach(function (el) {
      if (el.dataset.ysBound) return;
      el.dataset.ysBound = 'true';
      var dir = el.getAttribute('data-ys-reveal') || 'up';
      var vars = {
        autoAlpha: 0,
        duration: 1.1,
        ease: 'power3.out',
        delay: parseFloat(el.dataset.ysDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      };
      if (dir === 'up') vars.y = 56;
      else if (dir === 'down') vars.y = -56;
      else if (dir === 'left') vars.x = 72;
      else if (dir === 'right') vars.x = -72;
      else if (dir === 'scale') { vars.scale = 0.94; vars.y = 32; }
      gsap.from(el, vars);
    });

    /* Staggered children */
    document.querySelectorAll('[data-ys-stagger]').forEach(function (wrap) {
      if (wrap.dataset.ysBound) return;
      wrap.dataset.ysBound = 'true';
      gsap.from(wrap.children, {
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: wrap, start: 'top 85%', once: true }
      });
    });

    /* Scrubbed parallax */
    document.querySelectorAll('[data-ys-parallax]').forEach(function (el) {
      if (el.dataset.ysBound) return;
      el.dataset.ysBound = 'true';
      var amount = parseFloat(el.getAttribute('data-ys-parallax')) || 60;
      gsap.fromTo(
        el,
        { y: amount },
        {
          y: -amount,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    });

    /* Floating decor */
    document.querySelectorAll('[data-ys-float]').forEach(function (el, i) {
      if (el.dataset.ysBound) return;
      el.dataset.ysBound = 'true';
      gsap.to(el, {
        y: -16,
        duration: 2.4 + (i % 3) * 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: (i % 4) * 0.35
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Theme editor support */
  document.addEventListener('shopify:section:load', function () {
    init();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
})();
