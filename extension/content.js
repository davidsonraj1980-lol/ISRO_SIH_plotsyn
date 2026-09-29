/**
 * ISRO NetraVision - In-Browser Content Script
 * Implements On-Device DOM/Vision Perception, Canvas Privacy Filter, and Autonomous Action Execution.
 */

(() => {
  let detectedEntities = [];

  // 1. DOM PII Detection Engine
  function scanDomForPii() {
    const sensitive = [];
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach((el, idx) => {
      const type = (el.getAttribute('type') || '').toLowerCase();
      const name = (el.getAttribute('name') || '').toLowerCase();
      const id = (el.id || '').toLowerCase();
      const val = el.value || '';

      let kind = null;
      let label = 'PII Field';

      if (type === 'password' || name.includes('pass') || id.includes('pwd')) {
        kind = 'password';
        label = 'PASSWORD / PIN';
      } else if (name.includes('aadhaar') || /\b\d{4}\s\d{4}\s\d{4}\b/.test(val)) {
        kind = 'aadhaar';
        label = 'AADHAAR / SSN';
      } else if (name.includes('card') || /\b(?:\d{4}[ -]?){3}\d{4}\b/.test(val)) {
        kind = 'credit_card';
        label = 'FINANCIAL / CARD';
      } else if (type === 'email' || name.includes('email')) {
        kind = 'email';
        label = 'EMAIL ADDRESS';
      } else if (type === 'tel' || name.includes('phone') || name.includes('mobile')) {
        kind = 'phone';
        label = 'TELEPHONE / MOBILE';
      }

      if (kind) {
        const rect = el.getBoundingClientRect();
        sensitive.push({
          id: `ext-pii-${idx}`,
          element: el,
          rect: {
            x: Math.round(rect.left + window.scrollX),
            y: Math.round(rect.top + window.scrollY),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          },
          label,
          type: kind
        });
      }
    });

    // Also scan profile pictures and face avatars
    const avatars = document.querySelectorAll('img[alt*="avatar"], img[class*="avatar"], img[class*="profile"]');
    avatars.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      sensitive.push({
        id: `ext-face-${idx}`,
        element: el,
        rect: {
          x: Math.round(rect.left + window.scrollX),
          y: Math.round(rect.top + window.scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        label: 'OFFICER BIOMETRIC / FACE',
        type: 'biometric'
      });
    });

    detectedEntities = sensitive;
    return sensitive;
  }

  // 2. Visual Shield Overlay
  function renderShieldOverlays(entities, mode) {
    // Remove existing
    document.querySelectorAll('.aegis-extension-overlay').forEach(el => el.remove());

    entities.forEach(item => {
      const overlay = document.createElement('div');
      overlay.className = 'aegis-extension-overlay';
      overlay.style.position = 'absolute';
      overlay.style.left = `${item.rect.x}px`;
      overlay.style.top = `${item.rect.y}px`;
      overlay.style.width = `${item.rect.width}px`;
      overlay.style.height = `${item.rect.height}px`;
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '999999';

      if (mode === 'blackout') {
        overlay.style.background = '#05070e';
        overlay.style.border = '1px solid #00e5ff';
        overlay.innerHTML = `<span style="font-family: monospace; font-size: 9px; color: #00e5ff; padding: 2px 4px; display: inline-block;">🛡️ [SHIELDED: ${item.label}]</span>`;
      } else {
        overlay.style.backdropFilter = 'blur(16px)';
        overlay.style.background = 'rgba(15, 23, 42, 0.85)';
        overlay.style.border = '1px solid #a855f7';
        overlay.innerHTML = `<span style="font-family: monospace; font-size: 9px; color: #c084fc; padding: 2px 4px; display: inline-block;">[BLURRED]</span>`;
      }

      document.body.appendChild(overlay);
    });
  }

  // 3. Autonomous Action Execution Beacon
  async function executeActionOnPage(selector, goal) {
    const target = document.querySelector(selector) || document.querySelector('button[type="submit"], input[type="submit"], button');
    if (!target) return false;

    // Highlight beacon
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const originalOutline = target.style.outline;
    target.style.outline = '3px solid #00e5ff';
    target.style.boxShadow = '0 0 20px #00e5ff';

    await new Promise(r => setTimeout(r, 600));
    target.click();

    await new Promise(r => setTimeout(r, 600));
    target.style.outline = originalOutline;
    target.style.boxShadow = '';
    return true;
  }

  // Listen for messages from popup or background service worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SCAN_PII') {
      const found = scanDomForPii();
      renderShieldOverlays(found, request.mode || 'blackout');
      sendResponse({ count: found.length });
    } else if (request.action === 'RUN_AGENT') {
      const found = scanDomForPii();
      renderShieldOverlays(found, request.mode || 'blackout');

      // Simulate autonomous execution on submit/clearance button
      executeActionOnPage('button, input[type="submit"]', request.goal).then(success => {
        sendResponse({ actionsExecuted: success ? 1 : 0 });
      });
      return true; // async response
    }
  });
})();
