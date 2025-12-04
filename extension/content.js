// Resume Matcher Extension - Content Script
// This script runs on job posting pages

(function() {
  'use strict';

  // Avoid multiple injections
  if (window.resumeMatcherInjected) return;
  window.resumeMatcherInjected = true;

  console.log('Resume Matcher: Content script loaded');

  // Create floating action button
  function createFloatingButton() {
    const existing = document.getElementById('resume-matcher-fab');
    if (existing) return;

    const fab = document.createElement('div');
    fab.id = 'resume-matcher-fab';
    fab.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
      <span class="fab-tooltip">Analyze with Resume Matcher</span>
    `;

    fab.addEventListener('click', () => {
      // Send message to open popup or trigger analysis
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });

    document.body.appendChild(fab);
  }

  // Detect when job content is loaded (for SPAs)
  function observeJobChanges() {
    const observer = new MutationObserver((mutations) => {
      // Check if job content has changed
      const hasJobContent = detectJobContent();
      const fab = document.getElementById('resume-matcher-fab');

      if (hasJobContent && !fab) {
        createFloatingButton();
      } else if (!hasJobContent && fab) {
        fab.remove();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Detect if page has job content
  function detectJobContent() {
    const url = window.location.href;

    // LinkedIn
    if (url.includes('linkedin.com/jobs')) {
      return !!document.querySelector('.jobs-description__content, .jobs-box__html-content, #job-details');
    }

    // Indeed
    if (url.includes('indeed.com')) {
      return !!document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');
    }

    // Glassdoor
    if (url.includes('glassdoor.com')) {
      return !!document.querySelector('.jobDescriptionContent, [data-test="job-description"]');
    }

    // ZipRecruiter
    if (url.includes('ziprecruiter.com')) {
      return !!document.querySelector('.job_description, .jobDescriptionSection');
    }

    // Lever
    if (url.includes('lever.co')) {
      return !!document.querySelector('[data-qa="job-description"], .posting-page');
    }

    // Greenhouse
    if (url.includes('greenhouse.io')) {
      return !!document.querySelector('#content, .job-description');
    }

    return false;
  }

  // Extract job data from current page
  function extractJobData() {
    const url = window.location.href;
    let jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      url: url,
      source: '',
      extractedAt: new Date().toISOString()
    };

    // LinkedIn
    if (url.includes('linkedin.com')) {
      jobData.source = 'LinkedIn';
      jobData.title = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24')?.textContent?.trim() || '';
      jobData.company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name')?.textContent?.trim() || '';
      jobData.location = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet')?.textContent?.trim() || '';
      jobData.description = document.querySelector('.jobs-description__content, .jobs-box__html-content, #job-details')?.innerText?.trim() || '';
    }

    // Indeed
    else if (url.includes('indeed.com')) {
      jobData.source = 'Indeed';
      jobData.title = document.querySelector('.jobsearch-JobInfoHeader-title, h1[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() || '';
      jobData.company = document.querySelector('[data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating-companyHeader')?.textContent?.trim() || '';
      jobData.location = document.querySelector('[data-testid="job-location"]')?.textContent?.trim() || '';
      jobData.description = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText')?.innerText?.trim() || '';
    }

    // Glassdoor
    else if (url.includes('glassdoor.com')) {
      jobData.source = 'Glassdoor';
      jobData.title = document.querySelector('[data-test="job-title"], .job-title, h1')?.textContent?.trim() || '';
      jobData.company = document.querySelector('[data-test="employer-name"], .employer-name')?.textContent?.trim() || '';
      jobData.location = document.querySelector('[data-test="location"], .location')?.textContent?.trim() || '';
      jobData.description = document.querySelector('.jobDescriptionContent, [data-test="job-description"]')?.innerText?.trim() || '';
    }

    // ZipRecruiter
    else if (url.includes('ziprecruiter.com')) {
      jobData.source = 'ZipRecruiter';
      jobData.title = document.querySelector('h1.job_title, .job-title')?.textContent?.trim() || '';
      jobData.company = document.querySelector('.t-company-name, .hiring-company-link')?.textContent?.trim() || '';
      jobData.location = document.querySelector('.t-location, .job-location')?.textContent?.trim() || '';
      jobData.description = document.querySelector('.job_description, .jobDescriptionSection')?.innerText?.trim() || '';
    }

    // Lever
    else if (url.includes('lever.co')) {
      jobData.source = 'Lever';
      jobData.title = document.querySelector('.posting-headline h2, h1')?.textContent?.trim() || '';
      const logoImg = document.querySelector('.main-header-logo img');
      jobData.company = logoImg?.alt || window.location.hostname.split('.')[0];
      jobData.location = document.querySelector('.posting-categories .location, .workplaceTypes')?.textContent?.trim() || '';
      jobData.description = document.querySelector('[data-qa="job-description"], .posting-page')?.innerText?.trim() || '';
    }

    // Greenhouse
    else if (url.includes('greenhouse.io')) {
      jobData.source = 'Greenhouse';
      jobData.title = document.querySelector('.app-title, h1')?.textContent?.trim() || '';
      jobData.company = document.querySelector('.company-name')?.textContent?.trim() || window.location.hostname.split('.')[0];
      jobData.location = document.querySelector('.location')?.textContent?.trim() || '';
      jobData.description = document.querySelector('#content, .job-description')?.innerText?.trim() || '';
    }

    return jobData;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJob') {
      const jobData = extractJobData();
      sendResponse(jobData);
    } else if (request.action === 'highlightKeywords') {
      highlightKeywords(request.keywords);
      sendResponse({ success: true });
    } else if (request.action === 'removeHighlights') {
      removeHighlights();
      sendResponse({ success: true });
    }
    return true;
  });

  // Highlight keywords on page
  function highlightKeywords(keywords) {
    removeHighlights();

    if (!keywords || keywords.length === 0) return;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${escapeRegex(keyword)})\\b`, 'gi');
      highlightTextNodes(document.body, regex);
    });
  }

  // Escape special regex characters
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Highlight matching text nodes
  function highlightTextNodes(element, regex) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script, style, and already highlighted elements
          const parent = node.parentNode;
          if (parent.tagName === 'SCRIPT' ||
              parent.tagName === 'STYLE' ||
              parent.classList?.contains('resume-matcher-highlight')) {
            return NodeFilter.FILTER_REJECT;
          }
          return regex.test(node.textContent)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodesToHighlight = [];
    while (walker.nextNode()) {
      nodesToHighlight.push(walker.currentNode);
    }

    // Only highlight first 20 occurrences to avoid performance issues
    nodesToHighlight.slice(0, 20).forEach(node => {
      const fragment = document.createDocumentFragment();
      const parts = node.textContent.split(regex);
      const matches = node.textContent.match(regex) || [];

      parts.forEach((part, index) => {
        fragment.appendChild(document.createTextNode(part));
        if (matches[index]) {
          const mark = document.createElement('mark');
          mark.className = 'resume-matcher-highlight';
          mark.textContent = matches[index];
          fragment.appendChild(mark);
        }
      });

      node.parentNode.replaceChild(fragment, node);
    });
  }

  // Remove all highlights
  function removeHighlights() {
    document.querySelectorAll('.resume-matcher-highlight').forEach(el => {
      const text = document.createTextNode(el.textContent);
      el.parentNode.replaceChild(text, el);
    });
  }

  // Initialize
  function init() {
    if (detectJobContent()) {
      createFloatingButton();
    }
    observeJobChanges();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
