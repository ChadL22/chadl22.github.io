/**
 * Enhanced Navigation for Portfolio Site
 * Adds a reading progress bar and back-to-top
 * WITHOUT changing existing layout or design
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    backToTopThreshold: 500,
    scrollOffset: 80,
    accentColor: '#d97706',
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.scrollPaddingTop = config.scrollOffset + 'px';

    injectStyles();
    createBackToTop();
    createProgressBar();
    setupScrollHandlers();
  }

  function injectStyles() {
    const styles = `
      <style id="enhanced-nav-styles">
        /* Back to Top Button */
        #back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 48px;
          height: 48px;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transform: translateY(20px) scale(0.9);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        #back-to-top.visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }

        #back-to-top:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
        }

        /* Reading Progress Bar */
        #progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, ${config.accentColor}, #f59e0b);
          width: 0%;
          z-index: 99999;
          transition: width 0.1s ease;
        }


      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  function createBackToTop() {
    const button = document.createElement('button');
    button.id = 'back-to-top';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Back to top');
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(button);
  }

  function createProgressBar() {
    const bar = document.createElement('div');
    bar.id = 'progress-bar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Reading progress');
    document.body.appendChild(bar);
  }


  function setupScrollHandlers() {
    const backToTop = document.getElementById('back-to-top');
    const progressBar = document.getElementById('progress-bar');

    function update() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Show/hide back to top
      if (scrollTop > config.backToTopThreshold) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }

      // Update progress bar
      const scrollable = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
      progressBar.style.width = Math.min(100, scrolled) + '%';
      progressBar.setAttribute('aria-valuenow', Math.round(scrolled));
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
