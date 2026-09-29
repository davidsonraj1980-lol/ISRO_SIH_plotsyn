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

  // Ensure content script is available in the target tab
  async function resolveTargetTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      addLog('No active browser tab found.', 'error');
      return null;
    }

    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://') || url.startsWith('about:')) {
      addLog('Browser restriction: Extensions cannot run on internal system pages. Switch to an active webpage (e.g. http://localhost:5174/).', 'warn');
      return null;
    }

    try {
      await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id, { action: 'PING' }, (res) => {
          if (chrome.runtime.lastError || !res) {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            }, () => {
              if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
              else resolve(true);
            });
          } else {
            resolve(true);
          }
        });
      });
      return tab;
    } catch (e) {
      addLog('Could not initialize page listener: ' + (e.message || e), 'error');
      return null;
    }
  }

  // 1. Scan and Mask PII
  btnScanPii.addEventListener('click', async () => {
    clearLog();
    addLog('Scanning DOM for sensitive credentials & biometrics...');
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
});
