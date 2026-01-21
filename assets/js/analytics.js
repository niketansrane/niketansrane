/**
 * Google Analytics 4 (GA4) Integration
 *
 * SETUP REQUIRED:
 * 1. Go to https://analytics.google.com/
 * 2. Create a property for your website
 * 3. Get your Measurement ID (format: G-XXXXXXXXXX)
 * 4. Replace 'G-XXXXXXXXXX' below with your actual Measurement ID
 */
(function() {
  'use strict';

  // CONFIGURATION - Google Analytics Measurement ID
  var GA_MEASUREMENT_ID = 'G-CCRC9R5SEV';

  // Don't track if running locally
  function isLocalhost() {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
  }

  // Load Google Analytics
  function loadGoogleAnalytics() {
    if (isLocalhost()) {
      console.log('[Analytics] Skipping tracking on localhost');
      return;
    }

    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      console.warn('[Analytics] Please set your GA_MEASUREMENT_ID in analytics.js');
      return;
    }

    // Load gtag.js
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      'anonymize_ip': true,  // Privacy: anonymize IP addresses
      'cookie_flags': 'SameSite=None;Secure'
    });
  }

  // Initialize
  function init() {
    loadGoogleAnalytics();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
