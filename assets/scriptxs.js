document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('header-component');
  if (!header) return;

  const row = header.querySelector('.header__row');
  if (!row) return;

  // Detect touch support
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ✅ Desktop hover behavior
  if (!isTouch) {
    header.addEventListener('mouseenter', () => {
      header.classList.add('is_active');
      row.classList.add('header-active');
    });

    header.addEventListener('mouseleave', () => {
      header.classList.remove('is_active');

      if (header.getAttribute('data-scroll-direction') === 'up') {
        row.classList.add('header-active');
      } else {
        row.classList.remove('header-active');
      }
    });
  }

  // ✅ Scroll direction tracking (works on both desktop & mobile)
  const observer = new MutationObserver(() => {
    if (header.getAttribute('data-scroll-direction') === 'up') {
      row.classList.add('header-active');
    } else {
      row.classList.remove('header-active');
    }
  });

  observer.observe(header, {
    attributes: true,
    attributeFilter: ['data-scroll-direction']
  });
});





// Function to handle submenu height animation
function initSubmenuAnimation() {
  const menuItems = document.querySelectorAll('.menu-list__list-item');
  
  menuItems.forEach(item => {
    const trigger = item.querySelector('[aria-expanded]');
    const submenu = item.querySelector('.menu-list__submenu');
    
    if (!trigger || !submenu) return;
    
    // Set initial state
    if (trigger.getAttribute('aria-expanded') !== 'true') {
      submenu.style.height = '0px';
    }
    
    // Listen for aria-expanded changes (adjust based on how you toggle)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'aria-expanded') {
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          animateSubmenu(submenu, isExpanded);
        }
      });
    });
    
    observer.observe(trigger, { attributes: true });
    
    // Alternative: If you're using click events
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      animateSubmenu(submenu, isExpanded);
    });
  });
}

// Function to handle submenu height animation
function initSubmenuAnimation() {
  const menuItems = document.querySelectorAll('.menu-list__list-item');

  menuItems.forEach(item => {
    const trigger = item.querySelector('.menu-list__link[aria-expanded]') || item.querySelector('[aria-expanded]');
    const submenu = item.querySelector('.menu-list__submenu');

    if (!trigger || !submenu) return;

    // Ensure collapsed visuals initially (do not calculate heights on load)
    if (trigger.getAttribute('aria-expanded') === 'true') {
      // if some item is initially expanded, set to auto/0 until measured on expand event
      submenu.style.setProperty('height', '0px', 'important');
      submenu.dataset.calculatedHeight = 0;
    } else {
      submenu.style.setProperty('height', '0px', 'important');
      submenu.dataset.calculatedHeight = 0;
    }

    // MutationObserver: watch aria-expanded *on the trigger* and measure only on true
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'aria-expanded') {
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          if (isExpanded) {
            // When expanding: measure (with delay for submenu-2), then animate
            measureThenAnimate(submenu, trigger);
          } else {
            // When collapsing: animate closed using cached or measured height
            animateSubmenu(submenu, false);
          }
        }
      });
    });

    observer.observe(trigger, { attributes: true });

    // Optional: if you also toggle via click on the trigger, let it request a re-measure after toggling.
    // We don't rely on this for the measurement (observer handles it), but it keeps a responsive UX if aria
    // is toggled by click handlers elsewhere.
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        measureThenAnimate(submenu, trigger);
      } else {
        animateSubmenu(submenu, false);
      }
    });
  });
}

// Measure the content height (with special 1s delay for #submenu-2) then animate open
function measureThenAnimate(submenu, trigger) {
  // Find the content node (explicit submenu id or first child)
  const submenuContent = submenu.querySelector('[id^="submenu-"]') || submenu.firstElementChild;
  const contentId = submenuContent ? submenuContent.id : null;

  // Helper to actually measure and animate
  const doMeasure = () => {
    // Re-query content (in case DOM changed)
    const refreshedContent = submenu.querySelector('[id^="submenu-"]') || submenu.firstElementChild;
    let measuredHeight = 0;

    if (refreshedContent) {
      // offsetHeight reads layout height including padding & rendered content
      measuredHeight = refreshedContent.offsetHeight;
      // If offsetHeight is 0 (hidden content/images not loaded), fallback to scrollHeight
      if (!measuredHeight) measuredHeight = refreshedContent.scrollHeight || submenu.scrollHeight || 0;
    } else {
      measuredHeight = submenu.scrollHeight || 0;
    }

    // Cache measured height
    submenu.dataset.calculatedHeight = measuredHeight;

    // Animate open using the measured height
    animateSubmenu(submenu, true, measuredHeight);
  };

  // If this is submenu-2, delay measurement by 1s to allow late-loading content to render
  if (contentId === 'submenu-2') {
    setTimeout(doMeasure, 500);
  } else {
    // Measure on next animation frame to avoid layout thrashing
    requestAnimationFrame(doMeasure);
  }
}

// animateSubmenu accepts an optional forcedHeight when opening
function animateSubmenu(submenu, isExpanded, forcedHeight) {
  // Remove any old transitionend handler
  const oldHandler = submenu._transitionHandler;
  if (oldHandler) {
    submenu.removeEventListener('transitionend', oldHandler);
    submenu._transitionHandler = null;
  }

  // Save and clear any inline clip-path that could clip content during height animation
  const prevClip = submenu.style.clipPath || submenu.style.webkitClipPath || '';
  const hadClip = prevClip !== '';
  const clearClip = () => {
    submenu.style.clipPath = 'none';
    submenu.style.webkitClipPath = 'none';
  };
  const restoreClip = () => {
    if (hadClip) {
      submenu.style.clipPath = prevClip;
      submenu.style.webkitClipPath = prevClip;
    } else {
      submenu.style.removeProperty('clip-path');
      submenu.style.removeProperty('-webkit-clip-path');
    }
  };

  if (isExpanded) {
    // Opening
    submenu.style.overflow = 'hidden';
    clearClip(); // prevent visual clipping while expanding

    // use forcedHeight (passed from measure) if present, otherwise compute now
    let contentHeight = (typeof forcedHeight === 'number' && forcedHeight >= 0) ? forcedHeight : null;
    const submenuContent = submenu.querySelector('[id^="submenu-"]') || submenu.firstElementChild;

    if (contentHeight === null) {
      if (submenuContent) {
        contentHeight = submenuContent.offsetHeight || submenuContent.scrollHeight || submenu.scrollHeight || 0;
      } else {
        contentHeight = submenu.scrollHeight || 0;
      }
      submenu.dataset.calculatedHeight = contentHeight;
    }

    // Start from 0 then expand to measured height
    submenu.style.setProperty('height', '0px', 'important');

    // Two RAFs to ensure browser registers starting 0 height before transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        submenu.style.setProperty('height', contentHeight + 'px', 'important');
      });
    });

    // When transition completes, remove explicit height to allow natural resizing
    const onEnd = () => {
      // Only clear height if it's still the same as contentHeight
      const currentHeight = parseFloat(getComputedStyle(submenu).height) || 0;
      if (Math.abs(currentHeight - contentHeight) < 1) {
        submenu.style.removeProperty('height'); // allow auto height
      }
      submenu.style.removeProperty('overflow');
      restoreClip(); // put clip-path back (or remove it)
      submenu.removeEventListener('transitionend', onEnd);
      submenu._transitionHandler = null;
    };
    submenu._transitionHandler = onEnd;
    submenu.addEventListener('transitionend', onEnd);

  } else {
    // Closing: animate from actual height -> 0
    const cached = parseFloat(submenu.dataset.calculatedHeight) || submenu.scrollHeight || 0;
    submenu.style.overflow = 'hidden';
    // ensure clip won't re-appear mid-close
    clearClip();

    submenu.style.setProperty('height', cached + 'px', 'important');

    // Force reflow
    // eslint-disable-next-line no-unused-expressions
    submenu.offsetHeight;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        submenu.style.setProperty('height', '0px', 'important');
      });
    });

    // Clean up after transition
    const onEndClose = () => {
      // keep height 0 and remove overflow after close
      submenu.style.setProperty('height', '0px', 'important');
      submenu.style.removeProperty('overflow');
      restoreClip();
      submenu.removeEventListener('transitionend', onEndClose);
      submenu._transitionHandler = null;
    };
    submenu._transitionHandler = onEndClose;
    submenu.addEventListener('transitionend', onEndClose);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSubmenuAnimation);
} else {
  initSubmenuAnimation();
}




document.addEventListener('DOMContentLoaded', () => {

    const headerGroup = document.querySelector('#header-group');
    const slideshowSlides = document.querySelector(
        'slideshow-slides[size="slideshow_full_height"], .full_hero_section, .full_split_section'
    );

    if (!headerGroup || !slideshowSlides) {
        console.error("Header or Slideshow element not found.");
        return;
    }

    function getStickyHeaderHeight() {
        const stickyHeaderComponent = document.querySelector('#header-component[sticky="always"]') ||
                                      document.querySelector('#header-component[sticky="scroll-up"]');

        if (!stickyHeaderComponent || !headerGroup.contains(stickyHeaderComponent)) return null;

        const sectionGroup = document.querySelector('div.shopify-section-group-header-group');
        const headerSection = document.querySelector('header.shopify-section-group-header-group');

        if (!headerSection) return null;

        let totalHeight = 0;

        // If div.shopify-section-group-header-group exists, include its height
        if (sectionGroup) {
            totalHeight += sectionGroup.getBoundingClientRect().height || 0;
        }

        // Always add header.shopify-section-group-header-group height
        totalHeight += headerSection.getBoundingClientRect().height || 0;

        return totalHeight;
    }

    function updateSlideshowHeight() {

        const isNotSticky = headerGroup.getAttribute('transparent') === 'not-sticky';
        if (isNotSticky) {
            slideshowSlides.style.height = '';
            console.log("Reset: transparent='not-sticky'");
            return;
        }

        const stickyHeight = getStickyHeaderHeight();
        if (stickyHeight !== null) {
            // Use 100vh on mobile to prevent recalculation when browser bar collapses
            const isMobile = window.matchMedia('(max-width: 767px)').matches;
            const viewportUnit = isMobile ? 'svh' : 'dvh';
            const newHeight = `calc(100${viewportUnit} - ${stickyHeight}px)`;
            slideshowSlides.style.height = newHeight;

            console.log(`Sticky Header Height = ${stickyHeight}px → Applied ${newHeight}`);
            return;
        }

        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        const viewportUnit = isMobile ? 'svh' : 'dvh';
        
        const normalHeaderHeight = headerGroup.getBoundingClientRect().height;
        const newHeight = `calc(100${viewportUnit} - ${normalHeaderHeight}px)`;

        slideshowSlides.style.height = newHeight;

        console.log(`Normal Header Height = ${normalHeaderHeight}px → Applied ${newHeight}`);
    }

    updateSlideshowHeight();

    // Only recalculate on actual window resize (orientation change, browser resize)
    let windowWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        // Only update if width changed (not just height from browser bar)
        if (window.innerWidth !== windowWidth) {
            windowWidth = window.innerWidth;
            updateSlideshowHeight();
        }
    });
});