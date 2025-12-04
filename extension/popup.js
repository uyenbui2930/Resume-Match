// Resume Matcher Extension - Popup Script

// DOM Elements
const statusSection = document.getElementById('statusSection');
const pageStatus = document.getElementById('pageStatus');
const jobSection = document.getElementById('jobSection');
const noJobSection = document.getElementById('noJobSection');
const settingsSection = document.getElementById('settingsSection');
const matchResults = document.getElementById('matchResults');
const resumeScores = document.getElementById('resumeScores');
const keywordsSection = document.getElementById('keywordsSection');
const keywords = document.getElementById('keywords');

// Buttons
const settingsBtn = document.getElementById('settingsBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const saveJobBtn = document.getElementById('saveJobBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const backBtn = document.getElementById('backBtn');
const openAppLink = document.getElementById('openAppLink');

// Settings inputs
const appUrlInput = document.getElementById('appUrl');
const autoAnalyzeInput = document.getElementById('autoAnalyze');
const highlightKeywordsInput = document.getElementById('highlightKeywords');

// State
let currentJobData = null;
let settings = {
  appUrl: 'http://localhost:3000',
  autoAnalyze: false,
  highlightKeywords: true
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  detectJobOnCurrentPage();
});

// Load settings from storage
async function loadSettings() {
  try {
    const stored = await chrome.storage.sync.get(['settings']);
    if (stored.settings) {
      settings = { ...settings, ...stored.settings };
    }
    appUrlInput.value = settings.appUrl;
    autoAnalyzeInput.checked = settings.autoAnalyze;
    highlightKeywordsInput.checked = settings.highlightKeywords;
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Save settings
async function saveSettings() {
  settings.appUrl = appUrlInput.value || 'http://localhost:3000';
  settings.autoAnalyze = autoAnalyzeInput.checked;
  settings.highlightKeywords = highlightKeywordsInput.checked;

  try {
    await chrome.storage.sync.set({ settings });
    showToast('Settings saved!');
    showMainView();
  } catch (error) {
    console.error('Failed to save settings:', error);
    showToast('Failed to save settings', true);
  }
}

// Detect job on current page
async function detectJobOnCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      showNoJobDetected();
      return;
    }

    // Check if we're on a supported job site
    const url = tab.url || '';
    const isJobSite = isOnJobSite(url);

    if (!isJobSite) {
      showNoJobDetected();
      return;
    }

    // Try to extract job data from the page
    updateStatus('Extracting job details...', 'detecting');

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractJobDataFromPage
      });

      if (results && results[0] && results[0].result) {
        currentJobData = results[0].result;
        showJobDetected(currentJobData);

        if (settings.autoAnalyze) {
          analyzeJob();
        }
      } else {
        showNoJobDetected();
      }
    } catch (error) {
      console.error('Script execution failed:', error);
      showNoJobDetected();
    }
  } catch (error) {
    console.error('Tab query failed:', error);
    showNoJobDetected();
  }
}

// Check if URL is a supported job site
function isOnJobSite(url) {
  const jobSites = [
    'linkedin.com/jobs',
    'indeed.com',
    'glassdoor.com/job',
    'glassdoor.com/Job',
    'ziprecruiter.com/jobs',
    'lever.co',
    'greenhouse.io',
    'workday.com',
    'myworkdayjobs.com'
  ];
  return jobSites.some(site => url.includes(site));
}

// Extract job data from page (runs in content script context)
function extractJobDataFromPage() {
  const url = window.location.href;
  let jobData = {
    title: '',
    company: '',
    location: '',
    description: '',
    url: url,
    source: ''
  };

  // LinkedIn
  if (url.includes('linkedin.com')) {
    jobData.source = 'LinkedIn';
    jobData.title = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24')?.textContent?.trim() || '';
    jobData.company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, a.ember-view.t-black.t-normal')?.textContent?.trim() || '';
    jobData.location = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet')?.textContent?.trim() || '';
    jobData.description = document.querySelector('.jobs-description__content, .jobs-box__html-content, #job-details')?.textContent?.trim() || '';
  }

  // Indeed
  else if (url.includes('indeed.com')) {
    jobData.source = 'Indeed';
    jobData.title = document.querySelector('.jobsearch-JobInfoHeader-title, h1[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() || '';
    jobData.company = document.querySelector('[data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating-companyHeader')?.textContent?.trim() || '';
    jobData.location = document.querySelector('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle > div:last-child')?.textContent?.trim() || '';
    jobData.description = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText')?.textContent?.trim() || '';
  }

  // Glassdoor
  else if (url.includes('glassdoor.com')) {
    jobData.source = 'Glassdoor';
    jobData.title = document.querySelector('[data-test="job-title"], .job-title, h1')?.textContent?.trim() || '';
    jobData.company = document.querySelector('[data-test="employer-name"], .employer-name')?.textContent?.trim() || '';
    jobData.location = document.querySelector('[data-test="location"], .location')?.textContent?.trim() || '';
    jobData.description = document.querySelector('.jobDescriptionContent, [data-test="job-description"], .desc')?.textContent?.trim() || '';
  }

  // ZipRecruiter
  else if (url.includes('ziprecruiter.com')) {
    jobData.source = 'ZipRecruiter';
    jobData.title = document.querySelector('h1.job_title, .job-title')?.textContent?.trim() || '';
    jobData.company = document.querySelector('.t-company-name, .hiring-company-link')?.textContent?.trim() || '';
    jobData.location = document.querySelector('.t-location, .job-location')?.textContent?.trim() || '';
    jobData.description = document.querySelector('.job_description, .jobDescriptionSection')?.textContent?.trim() || '';
  }

  // Lever
  else if (url.includes('lever.co')) {
    jobData.source = 'Lever';
    jobData.title = document.querySelector('.posting-headline h2, h1')?.textContent?.trim() || '';
    jobData.company = document.querySelector('.main-header-logo img')?.alt || window.location.hostname.split('.')[0];
    jobData.location = document.querySelector('.posting-categories .location, .workplaceTypes')?.textContent?.trim() || '';
    jobData.description = document.querySelector('[data-qa="job-description"], .posting-page')?.textContent?.trim() || '';
  }

  // Greenhouse
  else if (url.includes('greenhouse.io')) {
    jobData.source = 'Greenhouse';
    jobData.title = document.querySelector('.app-title, h1')?.textContent?.trim() || '';
    jobData.company = document.querySelector('.company-name')?.textContent?.trim() || window.location.hostname.split('.')[0];
    jobData.location = document.querySelector('.location')?.textContent?.trim() || '';
    jobData.description = document.querySelector('#content, .job-description')?.textContent?.trim() || '';
  }

  // Validate we got something useful
  if (!jobData.title && !jobData.description) {
    return null;
  }

  return jobData;
}

// Update status display
function updateStatus(message, type = 'detecting') {
  pageStatus.className = `status ${type}`;

  let icon = '';
  if (type === 'detecting') {
    icon = '<div class="spinner"></div>';
  } else if (type === 'success') {
    icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'error') {
    icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  }

  pageStatus.innerHTML = `
    <div class="status-icon">${icon}</div>
    <span>${message}</span>
  `;
}

// Show job detected view
function showJobDetected(jobData) {
  updateStatus('Job posting detected!', 'success');

  document.getElementById('jobTitle').textContent = jobData.title || 'Unknown Position';
  document.getElementById('jobCompany').textContent = jobData.company || 'Unknown Company';
  document.getElementById('jobLocation').textContent = jobData.location || '';

  jobSection.classList.remove('hidden');
  noJobSection.classList.add('hidden');
  settingsSection.classList.add('hidden');
}

// Show no job detected view
function showNoJobDetected() {
  updateStatus('No job posting found', 'error');

  jobSection.classList.add('hidden');
  noJobSection.classList.remove('hidden');
  settingsSection.classList.add('hidden');
}

// Show settings view
function showSettingsView() {
  statusSection.classList.add('hidden');
  jobSection.classList.add('hidden');
  noJobSection.classList.add('hidden');
  settingsSection.classList.remove('hidden');
}

// Show main view
function showMainView() {
  statusSection.classList.remove('hidden');
  settingsSection.classList.add('hidden');
  detectJobOnCurrentPage();
}

// Analyze job against resumes
async function analyzeJob() {
  if (!currentJobData) {
    showToast('No job data to analyze', true);
    return;
  }

  analyzeBtn.classList.add('loading');
  analyzeBtn.disabled = true;

  try {
    // Load resumes from storage
    const stored = await chrome.storage.local.get(['resumeBank']);
    const resumes = stored.resumeBank || [];

    if (resumes.length === 0) {
      showToast('No resumes in bank. Add resumes in the app first.', true);
      analyzeBtn.classList.remove('loading');
      analyzeBtn.disabled = false;
      return;
    }

    // Analyze each resume against job description
    const scores = resumes.map(resume => {
      const score = calculateMatchScore(resume.content, currentJobData.description);
      return {
        name: resume.name,
        score: score,
        isPrimary: resume.isPrimary
      };
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Display results
    displayMatchResults(scores);

    // Extract and display keywords
    const extractedKeywords = extractKeywords(currentJobData.description, resumes);
    displayKeywords(extractedKeywords);

    // Highlight keywords on page if enabled
    if (settings.highlightKeywords) {
      highlightKeywordsOnPage(extractedKeywords);
    }

  } catch (error) {
    console.error('Analysis failed:', error);
    showToast('Analysis failed. Please try again.', true);
  }

  analyzeBtn.classList.remove('loading');
  analyzeBtn.disabled = false;
}

// Calculate match score between resume and job description
function calculateMatchScore(resumeText, jobDescription) {
  if (!resumeText || !jobDescription) return 0;

  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  // Extract important keywords from job description
  const skillPatterns = [
    /\b(python|java|javascript|typescript|react|angular|vue|node\.?js|sql|nosql|mongodb|postgresql|aws|azure|gcp|docker|kubernetes|git|agile|scrum)\b/gi,
    /\b(machine learning|data science|data analysis|cloud computing|devops|ci\/cd|microservices|api|rest|graphql)\b/gi,
    /\b(leadership|communication|problem.?solving|teamwork|collaboration|project management)\b/gi
  ];

  let totalKeywords = 0;
  let matchedKeywords = 0;

  skillPatterns.forEach(pattern => {
    const matches = jobLower.match(pattern) || [];
    const uniqueMatches = [...new Set(matches.map(m => m.toLowerCase()))];

    uniqueMatches.forEach(keyword => {
      totalKeywords++;
      if (resumeLower.includes(keyword)) {
        matchedKeywords++;
      }
    });
  });

  // Also check for specific words that appear multiple times in job description
  const words = jobLower.match(/\b[a-z]{4,}\b/g) || [];
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Check top frequent words (appearing 3+ times)
  Object.entries(wordFreq)
    .filter(([word, count]) => count >= 3)
    .slice(0, 10)
    .forEach(([word]) => {
      totalKeywords++;
      if (resumeLower.includes(word)) {
        matchedKeywords++;
      }
    });

  if (totalKeywords === 0) return 50; // Default score if no keywords found

  return Math.round((matchedKeywords / totalKeywords) * 100);
}

// Extract keywords from job description
function extractKeywords(jobDescription, resumes) {
  const jobLower = jobDescription.toLowerCase();
  const allResumeText = resumes.map(r => r.content.toLowerCase()).join(' ');

  const skillPatterns = [
    /\b(python|java|javascript|typescript|react|angular|vue|node\.?js|sql|aws|docker|kubernetes|git)\b/gi,
    /\b(machine learning|data analysis|cloud|agile|scrum|ci\/cd|devops)\b/gi
  ];

  const keywords = [];
  const seen = new Set();

  skillPatterns.forEach(pattern => {
    const matches = jobDescription.match(pattern) || [];
    matches.forEach(match => {
      const lower = match.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        keywords.push({
          text: match,
          matched: allResumeText.includes(lower)
        });
      }
    });
  });

  return keywords;
}

// Display match results
function displayMatchResults(scores) {
  matchResults.classList.remove('hidden');
  resumeScores.innerHTML = '';

  scores.forEach((item, index) => {
    const scoreClass = item.score >= 70 ? 'high' : item.score >= 40 ? 'medium' : 'low';
    const isBest = index === 0;

    const div = document.createElement('div');
    div.className = `resume-score-item ${isBest ? 'best-match' : ''}`;
    div.innerHTML = `
      <span class="resume-name" title="${item.name}">${item.name}</span>
      <div class="score-bar-container">
        <div class="score-bar ${scoreClass}" style="width: ${item.score}%"></div>
      </div>
      <span class="score-value ${scoreClass}">${item.score}%</span>
    `;
    resumeScores.appendChild(div);
  });
}

// Display keywords
function displayKeywords(keywordList) {
  keywordsSection.classList.remove('hidden');
  keywords.innerHTML = '';

  keywordList.forEach(kw => {
    const span = document.createElement('span');
    span.className = `keyword ${kw.matched ? 'matched' : 'missing'}`;
    span.innerHTML = `
      <span class="keyword-icon">${kw.matched ? '✓' : '✗'}</span>
      ${kw.text}
    `;
    keywords.appendChild(span);
  });
}

// Highlight keywords on the page
async function highlightKeywordsOnPage(keywordList) {
  const missingKeywords = keywordList.filter(kw => !kw.matched).map(kw => kw.text);

  if (missingKeywords.length === 0) return;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: highlightMissingKeywords,
      args: [missingKeywords]
    });
  } catch (error) {
    console.error('Failed to highlight keywords:', error);
  }
}

// Function to highlight keywords (runs in page context)
function highlightMissingKeywords(keywords) {
  // Remove existing highlights
  document.querySelectorAll('.resume-matcher-highlight').forEach(el => {
    el.outerHTML = el.textContent;
  });

  // Highlight missing keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.match(regex)) {
        textNodes.push(walker.currentNode);
      }
    }

    textNodes.slice(0, 5).forEach(node => {
      const span = document.createElement('span');
      span.innerHTML = node.textContent.replace(regex,
        '<mark class="resume-matcher-highlight" style="background: #fef3c7; padding: 2px 4px; border-radius: 3px;">$1</mark>'
      );
      node.parentNode.replaceChild(span, node);
    });
  });
}

// Save job to application tracker
async function saveJob() {
  if (!currentJobData) {
    showToast('No job data to save', true);
    return;
  }

  saveJobBtn.classList.add('loading');
  saveJobBtn.disabled = true;

  try {
    // Load existing saved jobs
    const stored = await chrome.storage.local.get(['savedJobs']);
    const savedJobs = stored.savedJobs || [];

    // Check for duplicates
    const exists = savedJobs.some(job => job.url === currentJobData.url);
    if (exists) {
      showToast('Job already saved!');
      saveJobBtn.classList.remove('loading');
      saveJobBtn.disabled = false;
      return;
    }

    // Add new job
    savedJobs.push({
      ...currentJobData,
      savedAt: new Date().toISOString(),
      status: 'saved'
    });

    await chrome.storage.local.set({ savedJobs });
    showToast('Job saved successfully!');

  } catch (error) {
    console.error('Failed to save job:', error);
    showToast('Failed to save job', true);
  }

  saveJobBtn.classList.remove('loading');
  saveJobBtn.disabled = false;
}

// Show toast notification
function showToast(message, isError = false) {
  // Remove existing toast
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  if (isError) {
    toast.style.background = '#dc2626';
  }
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// Event Listeners
settingsBtn.addEventListener('click', showSettingsView);
saveSettingsBtn.addEventListener('click', saveSettings);
backBtn.addEventListener('click', showMainView);
analyzeBtn.addEventListener('click', analyzeJob);
saveJobBtn.addEventListener('click', saveJob);

openAppLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: settings.appUrl });
});
