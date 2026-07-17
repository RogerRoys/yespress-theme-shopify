/*
  Yespress premium motion engine (GSAP + ScrollTrigger + Lenis).
  Progressive enhancement: everything is visible without JS; animations
  use gsap.from()/gsap.set at runtime so a failed load never hides content.

  Hooks:
    [data-ys-reveal="up|down|left|right|scale"]  – blur-fade reveal on scroll (data-ys-delay="0.2")
    [data-ys-words]                              – headline splits into words, staggered blur-up
    [data-ys-stagger]                            – reveal direct children with stagger
    [data-ys-parallax="60"]                      – scrubbed parallax by ±N px
    [data-ys-float]                              – gentle infinite float (decor)
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Lenis smooth scroll ---- */
  function initLenis() {
    if (reduced || !window.Lenis || window.__ysLenis) return;
    if (window.Shopify && window.Shopify.designMode) return; /* keep editor scrolling native */
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    window.__ysLenis = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
  }

  /* ---- Word splitting for staggered headlines ---- */
  function splitWords(el) {
    if (el.dataset.ysSplit) return el.querySelectorAll('.ys-word');
    el.dataset.ysSplit = 'true';
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'ys-word';
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, opacity, filter';
      span.textContent = word;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return el.querySelectorAll('.ys-word');
  }

  function init() {
    if (!window.gsap) return;
    if (reduced) return;

    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    initLenis();

    var EASE = 'power4.out';

    /* Hero intro (on load) */
    document.querySelectorAll('.yespress-hero').forEach(function (hero) {
      if (hero.dataset.ysBound) return;
      hero.dataset.ysBound = 'true';
      var tl = gsap.timeline({ defaults: { ease: EASE } });
      var media = hero.querySelector('.yespress-hero__media');
      var aura = hero.querySelector('.yespress-hero__aura');
      if (media) tl.from(media, { autoAlpha: 0, scale: 1.08, duration: 1.8 }, 0);
      if (aura) {
        tl.from(aura, { autoAlpha: 0, scale: 0.7, duration: 2 }, 0.2);
        gsap.to(aura, { opacity: 0.75, scale: 1.05, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.2 });
      }
      var brand = hero.querySelector('.yespress-hero__brand');
      if (brand) tl.from(brand, { y: 34, autoAlpha: 0, filter: 'blur(10px)', duration: 0.9 }, 0.4);
      var heading = hero.querySelector('.yespress-hero__heading');
      if (heading) {
        tl.from(splitWords(heading), {
          y: 56,
          autoAlpha: 0,
          filter: 'blur(14px)',
          duration: 1.1,
          stagger: 0.09
        }, 0.55);
      }
      var offer = hero.querySelector('.yespress-hero__offer');
      if (offer) tl.from(offer, { y: 24, autoAlpha: 0, filter: 'blur(8px)', duration: 0.8 }, 0.95);
    });

    /* Header slide-down on load */
    document.querySelectorAll('.yespress-header').forEach(function (el) {
      if (el.dataset.ysBound) return;
      el.dataset.ysBound = 'true';
      gsap.from(el, { y: -60, autoAlpha: 0, duration: 1, ease: EASE });
    });

    if (!window.ScrollTrigger) return;

    /* Word-stagger headlines on scroll */
    document.querySelectorAll('[data-ys-words]').forEach(function (el) {
      if (el.dataset.ysBound) return;
      el.dataset.ysBound = 'true';
      gsap.from(splitWords(el), {
        y: 44,
        autoAlpha: 0,
        filter: 'blur(12px)',
        duration: 0.9,
        ease: EASE,
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });

    /* Generic blur-fade reveals */
    document.querySelectorAll('[data-ys-reveal]').forEach(function (el) {
      if (el.dataset.ysBound) return;
      el.dataset.ysBound = 'true';
      var dir = el.getAttribute('data-ys-reveal') || 'up';
      var vars = {
        autoAlpha: 0,
        filter: 'blur(14px)',
        duration: 1.25,
        ease: EASE,
        delay: parseFloat(el.dataset.ysDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      };
      if (dir === 'up') vars.y = 64;
      else if (dir === 'down') vars.y = -64;
      else if (dir === 'left') vars.x = 80;
      else if (dir === 'right') vars.x = -80;
      else if (dir === 'scale') { vars.scale = 0.93; vars.y = 40; }
      gsap.from(el, vars);
    });

    /* Staggered children */
    document.querySelectorAll('[data-ys-stagger]').forEach(function (wrap) {
      if (wrap.dataset.ysBound) return;
      wrap.dataset.ysBound = 'true';
      gsap.from(wrap.children, {
        y: 40,
        autoAlpha: 0,
        filter: 'blur(10px)',
        duration: 1,
        ease: EASE,
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
