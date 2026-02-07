/**
 * Theme Switcher
 * Supports: light, dark (default), sublime
 */
(function() {
  'use strict';

  const THEME_KEY = 'preferred-theme';
  const THEMES = ['light', 'dark', 'sublime'];

  // SVG icons for theme buttons
  const ICONS = {
    light: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>',
    dark: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>',
    sublime: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>'
  };

  // Get current theme from localStorage or default to 'dark'
  function getCurrentTheme() {
    try {
      var theme = localStorage.getItem(THEME_KEY);
      return THEMES.includes(theme) ? theme : 'dark';
    } catch(e) {
      return 'dark';
    }
  }

  // Set theme on document
  function setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch(e) {}

    // Update button active states
    var buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Update syntax highlighting theme if hljs is available
    updateHighlightTheme(theme);
  }

  // Update highlight.js theme based on current theme
  function updateHighlightTheme(theme) {
    var existingLink = document.querySelector('link[data-highlight-theme]');
    if (!existingLink) return;

    var themeFile;
    switch(theme) {
      case 'dark':
        themeFile = 'highlight-github-dark.min.css';
        break;
      case 'sublime':
        themeFile = 'highlight-monokai.min.css';
        break;
      default:
        themeFile = 'highlight-github.min.css';
    }

    // Replace just the filename in the existing href
    var currentHref = existingLink.getAttribute('href');
    var newHref = currentHref.replace(/highlight-[^/]+\.min\.css/, themeFile);
    existingLink.setAttribute('href', newHref);
  }

  // Create theme switcher UI
  function createThemeSwitcher() {
    var switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', 'Theme switcher');

    THEMES.forEach(function(theme) {
      var btn = document.createElement('button');
      btn.className = 'theme-btn';
      btn.dataset.theme = theme;
      btn.innerHTML = ICONS[theme];
      btn.setAttribute('aria-label', theme.charAt(0).toUpperCase() + theme.slice(1) + ' theme');
      btn.setAttribute('title', theme.charAt(0).toUpperCase() + theme.slice(1) + ' theme');

      if (theme === getCurrentTheme()) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', function() {
        setTheme(theme);
      });

      switcher.appendChild(btn);
    });

    return switcher;
  }

  // Inject theme switcher into navigation
  function injectThemeSwitcher() {
    // Try to find the navigation element
    var nav = document.querySelector('.contact-links') ||
              document.querySelector('.blog-nav') ||
              document.querySelector('nav');

    if (nav) {
      var switcher = createThemeSwitcher();
      nav.appendChild(switcher);
    }
  }

  // Initialize
  function init() {
    // Mark highlight.js stylesheet for dynamic swapping
    var highlightLink = document.querySelector('link[href*="highlight-"]');
    if (highlightLink) {
      highlightLink.setAttribute('data-highlight-theme', 'true');
    }

    // Apply saved theme (this might already be done by inline script, but ensure buttons are synced)
    var currentTheme = getCurrentTheme();
    setTheme(currentTheme);

    // Inject theme switcher
    injectThemeSwitcher();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
