/**
 * Enhanced Navigation for Portfolio Site
 * Adds floating navigation, collapsible sections, year filtering, progress bar, and back-to-top
 * WITHOUT changing existing layout or design
 * 
 * Usage: Add <script src="enhanced-navigation.js"></script> before </body> in your HTML
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    navShowThreshold: 300,
    backToTopThreshold: 500,
    scrollOffset: 80,
    accentColor: '#d97706',
    accentColorLight: 'rgba(217, 119, 6, 0.1)',
    siteBackground: '#fafaf8',
    siteBorder: '#d4d4d0'
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

    // Inject styles
    injectStyles();

    // Create navigation elements
    createFloatingNav();
    createBackToTop();
    createProgressBar();

    // Add collapsible functionality to sections
    makeCollapsible();

    // Add year filtering to News section
    addYearFiltering();

    // Set up scroll handlers
    setupScrollHandlers();
  }

  function injectStyles() {
    const styles = `
      <style id="enhanced-nav-styles">
        /* Floating Navigation */
        #enhanced-nav {
          position: fixed;
          top: 100px;
          right: 30px;
          background: ${config.siteBackground};
          border: 1px solid ${config.siteBorder};
          border-radius: 8px;
          padding: 12px;
          width: 140px;
          z-index: 10000;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          opacity: 0;
          transform: translateX(20px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        
        #enhanced-nav.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .nav-item {
          padding: 8px 12px;
          font-size: 13px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
          margin-bottom: 4px;
        }
        
        .nav-item:last-child {
          margin-bottom: 0;
        }
        
        .nav-item:hover {
          color: #1a1a1a;
          background: #f0f0ee;
        }
        
        .nav-item.active {
          color: ${config.accentColor};
          background: ${config.accentColorLight};
          font-weight: 500;
        }
        
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
          transform: translateY(20px) scale(0.9);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        #back-to-top.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        #back-to-top:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
        }
        
        /* Progress Bar */
        #progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, ${config.accentColor}, #f59e0b);
          width: 0%;
          z-index: 99999;
          transition: width 0.1s ease;
        }
        
        /* Collapsible Sections */
        .section-header {
          cursor: pointer;
          user-select: none;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
        }
        
        .section-header h2 {
          margin: 0 !important;
          display: inline-block !important;
        }
        
        .section-header h2:hover {
          color: ${config.accentColor};
        }
        
        .section-toggle {
          font-size: 14px !important;
          color: #999 !important;
          transition: transform 0.2s !important;
          display: inline-block !important;
          line-height: 1 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .section-collapsed .section-toggle {
          transform: rotate(-90deg) !important;
        }
        
        .section-content {
          max-height: 5000px;
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          opacity: 1;
        }
        
        .section-collapsed .section-content {
          max-height: 0;
          opacity: 0;
        }
        
        /* Year Filtering */
        .year {
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .year:hover {
          background: ${config.accentColorLight};
          color: ${config.accentColor};
        }
        
        .year-filter-active {
          position: sticky;
          top: 80px;
          background: ${config.siteBackground};
          border: 1px solid ${config.accentColor};
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          z-index: 100;
        }
        
        .year-filter-text {
          font-size: 14px;
          color: #666;
        }
        
        .year-filter-value {
          font-weight: 600;
          color: ${config.accentColor};
          margin: 0 6px;
        }
        
        .year-filter-clear {
          background: none;
          border: none;
          color: #999;
          font-size: 18px;
          cursor: pointer;
          padding: 0 8px;
          line-height: 1;
          transition: all 0.2s;
        }
        
        .year-filter-clear:hover {
          color: ${config.accentColor};
          transform: scale(1.2);
        }
        
        .news-item.filtered-out {
          max-height: 0 !important;
          opacity: 0 !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
        }
        
        @media (max-width: 768px) {
          #enhanced-nav {
            right: 15px;
            width: 120px;
            top: 80px;
          }
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  function createFloatingNav() {
    const nav = document.createElement('nav');
    nav.id = 'enhanced-nav';
    nav.innerHTML = `
      <div class="nav-item" data-section="about">About</div>
      <div class="nav-item" data-section="news">News</div>
      <div class="nav-item" data-section="education">Education</div>
      <div class="nav-item" data-section="experience">Experience</div>
      <div class="nav-item" data-section="portfolio">Portfolio</div>
    `;
    document.body.appendChild(nav);

    // Add click handlers
    nav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function() {
        const section = this.getAttribute('data-section');
        scrollToSection(section);
      });
    });
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
    document.body.appendChild(bar);
  }

  function makeCollapsible() {
    const sections = ['news', 'education', 'experience', 'portfolio'];
    
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      
      const h2 = section.querySelector('h2');
      if (!h2) return;
      
      // Wrap h2 in a clickable header
      const headerWrapper = document.createElement('div');
      headerWrapper.className = 'section-header';
      h2.parentNode.insertBefore(headerWrapper, h2);
      headerWrapper.appendChild(h2);
      
      // Add toggle icon
      const toggle = document.createElement('span');
      toggle.className = 'section-toggle';
      toggle.textContent = '▼';
      headerWrapper.appendChild(toggle);
      
      // Wrap content
      const content = document.createElement('div');
      content.className = 'section-content';
      let sibling = headerWrapper.nextSibling;
      const children = [];
      while (sibling) {
        children.push(sibling);
        sibling = sibling.nextSibling;
      }
      children.forEach(child => {
        content.appendChild(child);
      });
      headerWrapper.parentNode.appendChild(content);
      
      // Add click handler
      headerWrapper.onclick = function(e) {
        e.preventDefault();
        section.classList.toggle('section-collapsed');
      };
    });
  }

  function addYearFiltering() {
    let activeYearFilter = null;
    let filterBanner = null;

    window.filterNewsByYear = function(year) {
      activeYearFilter = year;
      
      const newsSection = document.getElementById('news');
      if (!newsSection) return;
      
      // Find all news items (look for common patterns)
      const newsItems = Array.from(newsSection.children).filter(child => {
        return child.querySelector('.year') || child.querySelector('h3');
      });
      
      // Filter items
      newsItems.forEach(item => {
        const yearElement = item.querySelector('.year');
        if (yearElement) {
          const itemYear = yearElement.textContent.trim();
          
          if (itemYear.includes(year)) {
            item.classList.remove('filtered-out');
            yearElement.style.display = 'none';
          } else {
            item.classList.add('filtered-out');
          }
        }
      });
      
      // Create or update filter banner
      if (!filterBanner) {
        filterBanner = document.createElement('div');
        filterBanner.className = 'year-filter-active';
        
        const newsHeader = newsSection.querySelector('.section-header');
        if (newsHeader) {
          newsHeader.parentNode.insertBefore(filterBanner, newsHeader.nextSibling);
        }
      }
      
      filterBanner.innerHTML = `
        <div class="year-filter-text">
          Showing news from <span class="year-filter-value">${year}</span>
        </div>
        <button class="year-filter-clear" onclick="clearYearFilter()" title="Clear filter">×</button>
      `;
    };

    window.clearYearFilter = function() {
      activeYearFilter = null;
      
      // Show all items
      const newsSection = document.getElementById('news');
      if (newsSection) {
        const newsItems = Array.from(newsSection.children).filter(child => {
          return child.querySelector('.year') || child.querySelector('h3');
        });
        
        newsItems.forEach(item => {
          item.classList.remove('filtered-out');
        });
      }
      
      // Show year labels again
      document.querySelectorAll('.year').forEach(yearEl => {
        yearEl.style.display = '';
      });
      
      // Remove filter banner
      if (filterBanner) {
        filterBanner.remove();
        filterBanner = null;
      }
    };

    // Add click handlers to year elements in News section
    const newsSection = document.getElementById('news');
    if (newsSection) {
      const yearElements = newsSection.querySelectorAll('.year');
      yearElements.forEach(yearEl => {
        yearEl.addEventListener('click', function(e) {
          e.stopPropagation();
          const yearText = this.textContent.trim();
          const match = yearText.match(/(\d{4})/);
          if (match) {
            window.filterNewsByYear(match[1]);
          }
        });
      });
    }
  }

  function scrollToSection(section) {
    if (section === 'about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const target = document.getElementById(section);
    if (target) {
      target.classList.remove('section-collapsed');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function setupScrollHandlers() {
    const nav = document.getElementById('enhanced-nav');
    const backToTop = document.getElementById('back-to-top');
    const progressBar = document.getElementById('progress-bar');

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Show/hide navigation
      if (scrollTop > config.navShowThreshold) {
        nav.classList.add('visible');
      } else {
        nav.classList.remove('visible');
      }

      // Show/hide back to top
      if (scrollTop > config.backToTopThreshold) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }

      // Update progress bar
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollTop / windowHeight) * 100;
      progressBar.style.width = scrolled + '%';

      // Update active nav item
      const sections = ['news', 'education', 'experience', 'portfolio'];
      let currentSection = 'about';

      sections.forEach(section => {
        const el = document.getElementById(section);
        if (el && scrollTop >= el.offsetTop - 200) {
          currentSection = section;
        }
      });

      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === currentSection) {
          item.classList.add('active');
        }
      });
    });
  }
})();