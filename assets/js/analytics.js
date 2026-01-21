/**
 * Page View Analytics using Goat Counter
 * - Tracks page views
 * - Displays view count on page
 *
 * SETUP: Replace 'YOUR_SITE_CODE' with your Goat Counter subdomain
 * e.g., if your dashboard is at niketansrane.goatcounter.com, use 'niketansrane'
 */
(function() {
  'use strict';

  // CONFIGURATION - Update this with your Goat Counter site code
  var SITE_CODE = 'niketansrane'; // Change this to your goatcounter subdomain

  // Don't track if running locally
  function isLocalhost() {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
  }

  // Load Goat Counter tracking script
  function loadTrackingScript() {
    if (isLocalhost()) {
      console.log('[Analytics] Skipping tracking on localhost');
      return;
    }

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://' + SITE_CODE + '.goatcounter.com/count.js';
    script.dataset.goatcounter = 'https://' + SITE_CODE + '.goatcounter.com/count';
    document.head.appendChild(script);
  }

  // Get the current page path for the API
  function getPagePath() {
    var path = window.location.pathname;
    // Normalize: remove trailing slash, handle index
    if (path.endsWith('/')) {
      path = path + 'index.html';
    }
    if (path === '/') {
      path = '/index.html';
    }
    return path;
  }

  // Fetch and display view count
  function displayViewCount() {
    var container = document.querySelector('.view-count');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<span class="view-count-label">Views:</span> <span class="view-count-number">...</span>';

    if (isLocalhost()) {
      container.innerHTML = '<span class="view-count-label">Views:</span> <span class="view-count-number">--</span>';
      return;
    }

    var path = getPagePath();
    var apiUrl = 'https://' + SITE_CODE + '.goatcounter.com/counter/' + encodeURIComponent(path) + '.json';

    fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('API error');
        }
        return response.json();
      })
      .then(function(data) {
        var count = data.count || 0;
        var formattedCount = formatNumber(count);
        container.innerHTML = '<span class="view-count-label">Views:</span> <span class="view-count-number">' + formattedCount + '</span>';
      })
      .catch(function(error) {
        console.log('[Analytics] Could not fetch view count:', error);
        container.innerHTML = '<span class="view-count-label">Views:</span> <span class="view-count-number">--</span>';
      });
  }

  // Format large numbers (1000 -> 1K, etc.)
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  // Create view count element and inject into footer
  function injectViewCounter() {
    var footer = document.querySelector('footer') || document.querySelector('.blog-footer');
    if (!footer) return;

    // Check if view count already exists
    if (footer.querySelector('.view-count')) return;

    var viewCountEl = document.createElement('span');
    viewCountEl.className = 'view-count';
    viewCountEl.innerHTML = '<span class="view-count-label">Views:</span> <span class="view-count-number">...</span>';

    // Find or create a container for footer content
    var footerContent = footer.querySelector('p');
    if (footerContent) {
      // Insert separator and view count after copyright
      var separator = document.createTextNode(' · ');
      footerContent.appendChild(separator);
      footerContent.appendChild(viewCountEl);
    } else {
      footer.appendChild(viewCountEl);
    }
  }

  // Initialize
  function init() {
    loadTrackingScript();
    injectViewCounter();

    // Small delay to ensure Goat Counter has registered the view
    setTimeout(displayViewCount, 500);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
