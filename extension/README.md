# Resume Matcher Chrome Extension

A Chrome extension that helps you analyze job postings and match them with your resumes directly from job sites.

## Features

- **One-Click Job Capture**: Extract job details from LinkedIn, Indeed, Glassdoor, ZipRecruiter, Lever, and Greenhouse
- **Resume Matching**: Instantly see which of your resumes scores best for the current job
- **Keyword Highlighting**: See which keywords from the job posting are missing from your resume
- **Job Saving**: Save jobs to review later in the Resume Matcher app
- **Floating Action Button**: Quick access to analysis on any supported job page

## Supported Job Sites

- LinkedIn Jobs
- Indeed
- Glassdoor
- ZipRecruiter
- Lever (company career pages)
- Greenhouse (company career pages)
- Workday (company career pages)

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension icon should appear in your browser toolbar

### Creating Icons

The extension requires PNG icons. Convert the SVG or create icons in these sizes:
- `icons/icon16.png` - 16x16 pixels
- `icons/icon48.png` - 48x48 pixels
- `icons/icon128.png` - 128x128 pixels

You can use any online SVG to PNG converter or design tool.

## Usage

### Analyzing a Job

1. Navigate to any job posting on a supported site
2. Click the Resume Matcher extension icon in your toolbar
3. The extension will automatically detect and extract the job details
4. Click "Analyze Match" to compare the job against your resumes
5. View match scores and missing keywords

### Saving Jobs

1. Click "Save Job" to save the current job posting
2. Access saved jobs from the Resume Matcher web app

### Settings

Click the gear icon in the extension popup to configure:
- **App URL**: The URL of your Resume Matcher web app (default: http://localhost:3000)
- **Auto-analyze**: Automatically analyze jobs when opening the extension
- **Highlight keywords**: Highlight missing keywords on the job page

## Syncing with Resume Matcher App

The extension syncs with your Resume Bank from the main Resume Matcher app:

1. Make sure the Resume Matcher app is running
2. Add resumes to your Resume Bank in the app
3. The extension will automatically use those resumes for matching

### Manual Sync via localStorage

If the app is on the same domain, the extension can read from localStorage:
1. Open the Resume Matcher app
2. Add resumes to your Resume Bank
3. The extension will automatically pick them up

## Development

### File Structure

```
extension/
├── manifest.json      # Extension configuration (Manifest V3)
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── content.js         # Content script (runs on job pages)
├── content.css        # Content script styles
├── background.js      # Service worker
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

### Permissions

The extension requires these permissions:
- `activeTab`: Access to the current tab for extracting job data
- `storage`: Store settings and saved jobs
- `scripting`: Execute scripts on job pages

### Adding Support for New Job Sites

1. Add the site URL pattern to `manifest.json` in `host_permissions` and `content_scripts.matches`
2. Add extraction logic in `extractJobDataFromPage()` in `popup.js`
3. Add detection logic in `extractJobData()` in `content.js`
4. Update `isOnJobSite()` in both `popup.js` and `background.js`

## Troubleshooting

### Extension not detecting jobs

- Make sure you're on a job details page, not a search results page
- Try refreshing the page
- Check if the site layout has changed (selectors may need updating)

### Resumes not showing

- Make sure you've added resumes in the Resume Matcher app
- Check that the App URL in settings is correct
- Try reloading the extension

### Icons not showing

- Make sure you've created PNG versions of the icons
- The icon files must be named exactly: icon16.png, icon48.png, icon128.png

## License

MIT License - See main project LICENSE file
