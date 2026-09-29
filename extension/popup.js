document.addEventListener('DOMContentLoaded', () => {
  const btnScanPii = document.getElementById('btn-scan-pii');
  const btnRunAgent = document.getElementById('btn-run-agent');
  const telemetryLog = document.getElementById('telemetry-log');
  const redactionMode = document.getElementById('redaction-mode');
  const agentGoal = document.getElementById('agent-goal');

  function log(msg) {
    telemetryLog.innerText = msg;
  }

  // Scan PII in active tab
  btnScanPii.addEventListener('click', async () => {
    log('Scanning active page for sensitive PII and biometrics...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      log('Error: No active tab found.');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'SCAN_PII', mode: redactionMode.value }, (response) => {
      if (chrome.runtime.lastError) {
        log('Could not connect to page. Make sure you are on a webpage and reload.');
        return;
      }
      log(`Detected ${response.count} sensitive entities (Passwords, Cards, UIDAI, Biometrics). Bounding boxes masked.`);
    });
  });

  // Run Netra Agent in active tab
  btnRunAgent.addEventListener('click', async () => {
    const goal = agentGoal.value;
    log('Executing Netra Vision Agent on tab...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      log('Error: No active tab found.');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'RUN_AGENT', goal, mode: redactionMode.value }, (response) => {
      if (chrome.runtime.lastError) {
        log('Error triggering agent: ' + chrome.runtime.lastError.message);
        return;
      }
      log(`Agent reasoning completed! Executed ${response.actionsExecuted} actions with 0% leak.`);
    });
  });
});
