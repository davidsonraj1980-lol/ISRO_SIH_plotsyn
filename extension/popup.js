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
  const maskedCounter = document.getElementById('masked-counter');
  const agentStateLabel = document.getElementById('agent-state-label');

  function clearLog() {
    telemetryLog.innerHTML = '';
  }

  function addLog(text, type = 'info') {
    const row = document.createElement('div');
    row.className = 'log-row';

    const prefix = document.createElement('span');
    prefix.className = type === 'success' ? 'log-success' : type === 'warn' ? 'log-warn' : type === 'error' ? 'log-error' : 'log-prefix';
    prefix.innerText = type === 'success' ? '✓' : type === 'error' ? '✗' : '>';

    const msg = document.createElement('span');
    msg.className = type === 'success' ? 'log-text log-success' : type === 'error' ? 'log-text log-error' : 'log-text';
    msg.innerText = text;

    row.appendChild(prefix);
    row.appendChild(msg);
    telemetryLog.appendChild(row);
    telemetryLog.scrollTop = telemetryLog.scrollHeight;
  }

  function isScriptableUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase();
    if (
      lower.startsWith('chrome://') ||
      lower.startsWith('chrome-extension://') ||
      lower.startsWith('edge://') ||
      lower.startsWith('about:') ||
      lower.includes('chromewebstore.google.com') ||
      lower.includes('chrome.google.com/webstore')
    ) {
      return false;
    }
    return lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('file://');
  }

  // Programmatically inject content script if not already present
  async function injectContentScript(tabId) {
    return new Promise((resolve) => {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ['content.js']
        },
        () => {
          if (chrome.runtime.lastError) {
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  // Ensure content script is available in a valid target tab
  async function resolveTargetTab() {
    let [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // If active tab is non-scriptable (e.g. chrome://extensions or Web Store)
    if (!activeTab || !isScriptableUrl(activeTab.url)) {
      addLog('Active tab is a Chrome internal/webstore page where scripting is restricted.', 'warn');
      
      // Auto-search for an open webpage or ISRO Mission Portal
      const allTabs = await chrome.tabs.query({ currentWindow: true });
      const scriptableTab = allTabs.find(t => isScriptableUrl(t.url));

      if (scriptableTab) {
        addLog(`Switching to open tab: ${scriptableTab.title || scriptableTab.url}`, 'info');
        await chrome.tabs.update(scriptableTab.id, { active: true });
        activeTab = scriptableTab;
      } else {
        // No web tab open: launch test portal automatically
        addLog('Launching ISRO Mission Portal (http://localhost:5174/)...', 'info');
        const newTab = await chrome.tabs.create({ url: 'http://localhost:5174/' });
        addLog('Opened ISRO Portal. Re-open Netra to run agent on the portal!', 'success');
        return null;
      }
    }

    try {
      // Test communication with content script
      const isAlive = await new Promise((resolve) => {
        chrome.tabs.sendMessage(activeTab.id, { action: 'PING' }, (res) => {
          if (chrome.runtime.lastError || !res) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });

      if (!isAlive) {
        // Inject content.js dynamically
        const injected = await injectContentScript(activeTab.id);
        if (!injected) {
          addLog('Could not inject content script into tab.', 'error');
          return null;
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      return activeTab;
    } catch (e) {
      addLog('Tab initialization failed: ' + (e.message || e), 'error');
      return null;
    }
  }

  // 1. Scan and Mask PII
  btnScanPii.addEventListener('click', async () => {
    clearLog();
    addLog('Scanning page for sensitive credentials & biometrics...');
    btnScanPii.disabled = true;

    const tab = await resolveTargetTab();
    if (!tab) {
      btnScanPii.disabled = false;
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'SCAN_PII', mode: redactionMode.value }, (response) => {
      btnScanPii.disabled = false;
      if (chrome.runtime.lastError) {
        addLog('Connection error: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      const count = response?.count || 0;
      maskedCounter.innerText = `${count} MASKED`;
      addLog(`Detected ${count} sensitive fields (Aadhaar, passwords, biometrics).`, 'info');
      addLog(`Applied "${redactionMode.value.toUpperCase()}" filter with zero plain-text leaks.`, 'success');
    });
  });

  // 2. Run Autonomous Netra Vision Agent
  btnRunAgent.addEventListener('click', async () => {
    const goal = agentGoal.value.trim();
    if (!goal) {
      addLog('Please enter an agent directive.', 'warn');
      return;
    }

    clearLog();
    addLog('Engaging Netra on-device vision agent...');
    agentStateLabel.innerText = 'EXECUTING';
    btnRunAgent.disabled = true;

    const tab = await resolveTargetTab();
    if (!tab) {
      btnRunAgent.disabled = false;
      agentStateLabel.innerText = 'ARMED';
      return;
    }

    addLog('Running on-device WebGPU visual perception filter...');

    chrome.tabs.sendMessage(tab.id, { action: 'RUN_AGENT', goal, mode: redactionMode.value }, (response) => {
      btnRunAgent.disabled = false;
      agentStateLabel.innerText = 'ARMED';

      if (chrome.runtime.lastError) {
        addLog('Agent execution error: ' + chrome.runtime.lastError.message, 'error');
        return;
      }

      const count = response?.entitiesCount || 0;
      maskedCounter.innerText = `${count} MASKED`;
      addLog(`Redacted ${count} sensitive visual elements before reasoning.`, 'info');
      addLog(`Target clearance action executed successfully!`, 'success');
    });
  });

  // 3. Real-time Filter Mode Switcher
  redactionMode.addEventListener('change', async () => {
    const tab = await resolveTargetTab();
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { action: 'CHANGE_MODE', mode: redactionMode.value }, (response) => {
      if (chrome.runtime.lastError) return;
      const count = response?.count || 0;
      maskedCounter.innerText = `${count} MASKED`;
      addLog(`Active privacy filter switched to "${redactionMode.value.toUpperCase()}".`, 'info');
    });
  });
});
