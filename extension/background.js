// Resume Matcher Extension - Background Service Worker

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Resume Matcher Extension installed', details.reason);

  // Set default settings
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({
        settings: {
          appUrl: 'http://localhost:3000',
          autoAnalyze: false,
          highlightKeywords: true
        }
      });
    }
  });

  // Initialize empty resume bank if not exists
  chrome.storage.local.get(['resumeBank'], (result) => {
    if (!result.resumeBank) {
      chrome.storage.local.set({ resumeBank: [] });
    }
  });

  // Initialize empty saved jobs if not exists
  chrome.storage.local.get(['savedJobs'], (result) => {
    if (!result.savedJobs) {
      chrome.storage.local.set({ savedJobs: [] });
    }
  });
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'openPopup':
      // Open the extension popup
      chrome.action.openPopup();
      sendResponse({ success: true });
      break;

    case 'getJobData':
      // Get job data from current tab
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]) {
          try {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: () => {
                // This function runs in the page context
                if (window.resumeMatcherExtractJob) {
                  return window.resumeMatcherExtractJob();
                }
                return null;
              }
            });
            sendResponse({ jobData: results[0]?.result });
          } catch (error) {
            sendResponse({ error: error.message });
          }
        }
      });
      return true; // Will respond asynchronously

    case 'syncResumeBank':
      // Sync resume bank from main app
      syncResumeBankFromApp(request.appUrl)
        .then(resumes => sendResponse({ success: true, resumes }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'saveJob':
      // Save job to local storage
      saveJobToStorage(request.jobData)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'getSavedJobs':
      // Get all saved jobs
      chrome.storage.local.get(['savedJobs'], (result) => {
        sendResponse({ jobs: result.savedJobs || [] });
      });
      return true;

    case 'deleteJob':
      // Delete a saved job
      deleteJobFromStorage(request.jobUrl)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'getResumeBank':
      // Get resume bank
      chrome.storage.local.get(['resumeBank'], (result) => {
        sendResponse({ resumes: result.resumeBank || [] });
      });
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
  }

  return false;
});

// Sync resume bank from the main app
async function syncResumeBankFromApp(appUrl) {
  try {
    const response = await fetch(`${appUrl}/api/resumes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch resumes from app');
    }

    const data = await response.json();
    const resumes = data.resumes || [];

    // Store in local storage
    await chrome.storage.local.set({ resumeBank: resumes });

    return resumes;
  } catch (error) {
    console.error('Failed to sync resume bank:', error);
    throw error;
  }
}

// Save job to storage
async function saveJobToStorage(jobData) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['savedJobs'], (result) => {
      const savedJobs = result.savedJobs || [];

      // Check for duplicates
      const exists = savedJobs.some(job => job.url === jobData.url);
      if (exists) {
        resolve(); // Already saved
        return;
      }

      savedJobs.push({
        ...jobData,
        savedAt: new Date().toISOString(),
        status: 'saved'
      });

      chrome.storage.local.set({ savedJobs }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

// Delete job from storage
async function deleteJobFromStorage(jobUrl) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['savedJobs'], (result) => {
      const savedJobs = (result.savedJobs || []).filter(job => job.url !== jobUrl);

      chrome.storage.local.set({ savedJobs }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

// Handle tab updates to detect job pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isJobSite = isOnJobSite(tab.url);

    // Update extension icon based on whether we're on a job site
    if (isJobSite) {
      chrome.action.setIcon({
        tabId,
        path: {
          16: 'icons/icon16.png',
          48: 'icons/icon48.png',
          128: 'icons/icon128.png'
        }
      });
      chrome.action.setBadgeText({ tabId, text: '' });
    }
  }
});

// Check if URL is a job site
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

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyze-job',
    title: 'Analyze with Resume Matcher',
    contexts: ['page'],
    documentUrlPatterns: [
      '*://*.linkedin.com/jobs/*',
      '*://*.indeed.com/*',
      '*://*.glassdoor.com/*',
      '*://*.ziprecruiter.com/*',
      '*://*.lever.co/*',
      '*://*.greenhouse.io/*'
    ]
  });

  chrome.contextMenus.create({
    id: 'save-job',
    title: 'Save Job to Resume Matcher',
    contexts: ['page'],
    documentUrlPatterns: [
      '*://*.linkedin.com/jobs/*',
      '*://*.indeed.com/*',
      '*://*.glassdoor.com/*',
      '*://*.ziprecruiter.com/*',
      '*://*.lever.co/*',
      '*://*.greenhouse.io/*'
    ]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyze-job') {
    chrome.action.openPopup();
  } else if (info.menuItemId === 'save-job') {
    // Send message to content script to extract and save job
    chrome.tabs.sendMessage(tab.id, { action: 'extractJob' }, (response) => {
      if (response) {
        saveJobToStorage(response).then(() => {
          // Show notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Resume Matcher',
            message: 'Job saved successfully!'
          });
        });
      }
    });
  }
});

// Alarm for periodic sync (if user is logged into app)
chrome.alarms.create('syncResumeBank', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncResumeBank') {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings?.appUrl) {
        syncResumeBankFromApp(result.settings.appUrl).catch(() => {
          // Silently fail if sync doesn't work
        });
      }
    });
  }
});
