/**
 * ISRO NetraVision - Background Service Worker
 * Handles tab capture, coordination, and VLM network relay.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('ISRO NetraVision Service Worker Installed.');
});

// Relay tab capture requests if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CAPTURE_VISIBLE_TAB') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ dataUrl });
    });
    return true;
  }
});
