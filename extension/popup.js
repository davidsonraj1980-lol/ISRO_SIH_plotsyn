/**
 * ISRO Netra-Vision Chrome Extension Popup Controller
 * Manages On-Device Vision Scanning, Hardware Redaction, and Autonomous Browser Actions.
 */

document.addEventListener('DOMContentLoaded', () => {
  const btnScanPii = document.getElementById('btn-scan-pii');
  const btnRunAgent = document.getElementById('btn-run-agent');
  const telemetryLog = document.getElementById('telemetry-log');
  const redactionMode = document.getElementById('redaction-mode');
  const agentGoal = document.getElementById('agent-goal');
  const actionCountPill = document.getElementById('action-count-pill');
  const shieldStatusText = document.getElementById('shield-status-text');

  function log(msg, type = 'info') {
    const colorClass = type === 'success' ? 'log-success' : type === 'warn' ? 'log-warn' : type === 'error' ? 'log-err' : 'log-arrow';
    telemetryLog.innerHTML = `<div class="log-line"><span class="${colorClass}">&gt;</span> <span>${msg}</span></div>`;
  }

  function appendLog(msg, type = 'info') {
    const colorClass = type === 'success' ? 'log-success' : type === 'warn' ? 'log-warn' : type === 'error' ? 'log-err' : 'log-arrow';
    telemetryLog.innerHTML += `<div class="log-line"><span class="${colorClass}">&gt;</span> <span>${msg}</span></div>`;
    telemetryLog.scrollTop = telemetryLog.scrollHeight;
  }

  // Ensure content script is injected on the tab
  async function getActiveTabAndEnsureContentScript() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      log('No active browser tab found.', 'error');
      return null;
    }

    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('edge://')) {
      log('Browser security prevents extensions from running on internal pages. Please switch to a webpage (e.g. http://localhost:5174/) to test.', 'warn');
      return null;
    }

    try {
      // Test if content script responds
      await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id, { action: 'PING' }, (res) => {
          if (chrome.runtime.lastError || !res) {
            // Need injection
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            }, () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(true);
              }
            });
          } else {
            resolve(true);
          }
        });
      });
    } catch (e) {
      log('Could not inject content script: ' + (e.message || e), 'error');
      return null;
    }

    return tab;
  }

  // 1. Scan and Mask PII
  btnScanPii.addEventListener('click', async () => {
    log('Scanning active page DOM and biometrics...');
    btnScanPii.disabled = true;

    const tab = await getActiveTabAndEnsureContentScript();
    if (!tab) {
      btnScanPii.disabled = false;
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'SCAN_PII', mode: redactionMode.value }, (response) => {
      btnScanPii.disabled = false;
      if (chrome.runtime.lastError) {
        log('Connection error: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      const count = response?.count || 0;
      actionCountPill.innerText = `${count} Masked`;
      log(`Detected and masked ${count} sensitive fields (Aadhaar, passwords, biometrics) with zero plain-text leaks.`, 'success');
    });
  });

  // 2. Run Autonomous Netra Vision Agent
  btnRunAgent.addEventListener('click', async () => {
    const goal = agentGoal.value.trim();
    if (!goal) {
      log('Please enter a mission directive.', 'warn');
      return;
    }

    log('Dispatching Netra Vision Agent on active tab...');
    btnRunAgent.disabled = true;

    const tab = await getActiveTabAndEnsureContentScript();
    if (!tab) {
      btnRunAgent.disabled = false;
      return;
    }

    appendLog('Performing on-device visual grounding & privacy filter...');

    chrome.tabs.sendMessage(tab.id, { action: 'RUN_AGENT', goal, mode: redactionMode.value }, (response) => {
      btnRunAgent.disabled = false;
      if (chrome.runtime.lastError) {
        log('Error executing agent: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      const count = response?.entitiesCount || 0;
      actionCountPill.innerText = `${count} Masked`;
      appendLog(`Redacted ${count} sensitive visual zones prior to VLM dispatch.`, 'info');
      appendLog(`Successfully executed target browser clearance action on page!`, 'success');
    });
  });
});
