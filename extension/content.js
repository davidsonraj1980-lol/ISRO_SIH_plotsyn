/**
 * ISRO Netra-Vision - In-Browser Content Script
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
    const avatars = document.querySelectorAll('img[alt*="avatar"], img[class*="avatar"], img[class*="profile"], [data-vision-sensitive="true"]');
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

  // 2. Clean Institutional Privacy Shield Overlay (Zero Neon Cyberpunk Slop)
  function renderShieldOverlays(entities, mode) {
    document.querySelectorAll('.netra-extension-overlay').forEach(el => el.remove());

    entities.forEach(item => {
      const overlay = document.createElement('div');
      overlay.className = 'netra-extension-overlay';
      overlay.style.position = 'absolute';
      overlay.style.left = `${item.rect.x}px`;
      overlay.style.top = `${item.rect.y}px`;
      overlay.style.width = `${item.rect.width}px`;
      overlay.style.height = `${item.rect.height}px`;
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '999999';
      overlay.style.borderRadius = '4px';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.overflow = 'hidden';

      if (mode === 'gaussian_blur') {
        overlay.style.backdropFilter = 'blur(16px)';
        overlay.style.background = 'rgba(15, 23, 42, 0.45)';
        overlay.style.border = '1px solid rgba(148, 163, 184, 0.6)';
        overlay.innerHTML = `<span style="font-family: -apple-system, sans-serif; font-size: 10px; font-weight: 600; color: #f8fafc; background: rgba(15, 23, 42, 0.7); padding: 1px 6px; border-radius: 3px;">BLURRED</span>`;
      } else if (mode === 'pixelate') {
        overlay.style.background = 'repeating-linear-gradient(45deg, #1e293b, #1e293b 6px, #0f172a 6px, #0f172a 12px)';
        overlay.style.border = '1px solid #475569';
        overlay.innerHTML = `<span style="font-family: -apple-system, sans-serif; font-size: 10px; font-weight: 600; color: #94a3b8; background: #0f172a; padding: 1px 6px; border-radius: 3px;">PIXELATED</span>`;
      } else if (mode === 'synthetic_token') {
        overlay.style.background = '#f1f5f9';
        overlay.style.border = '1px dashed #64748b';
        overlay.innerHTML = `<span style="font-family: monospace; font-size: 11px; font-weight: 600; color: #0284c7;">[SYNTHETIC_DECOY]</span>`;
      } else {
        // Solid Blackout (Default)
        overlay.style.background = '#0f172a';
        overlay.style.border = '1px solid #334155';
        overlay.innerHTML = `<span style="font-family: -apple-system, sans-serif; font-size: 10px; font-weight: 600; color: #86efac; background: #14532d; padding: 1px 6px; border-radius: 3px;">MASKED: ${item.label}</span>`;
      }

      document.body.appendChild(overlay);
    });
  }

  // 3. Autonomous Browser Agent Targeting
  async function executeActionOnPage(goal) {
    // 1. Consent checkbox if present
    const checkbox = document.querySelector('input[type="checkbox"]');
    if (checkbox && !checkbox.checked) {
      checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 400));
    }

    // 2. Submit / clearance button
    const target = document.querySelector('#authorize-telemetry-btn, button[type="submit"], input[type="submit"], button.gov-submit-btn, button');
    if (!target) return false;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const originalOutline = target.style.outline;
    const originalBoxShadow = target.style.boxShadow;

    target.style.outline = '3px solid #0070ba';
    target.style.boxShadow = '0 0 0 4px rgba(0, 112, 186, 0.25)';

    await new Promise(r => setTimeout(r, 650));
    target.click();

    await new Promise(r => setTimeout(r, 600));
    target.style.outline = originalOutline;
    target.style.boxShadow = originalBoxShadow;
    return true;
  }

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'PING') {
      sendResponse({ status: 'PONG' });
      return;
    }

    if (request.action === 'SCAN_PII') {
      const found = scanDomForPii();
      renderShieldOverlays(found, request.mode || 'blackout');
      sendResponse({ count: found.length });
      return;
    }

    if (request.action === 'RUN_AGENT') {
      const found = scanDomForPii();
      renderShieldOverlays(found, request.mode || 'blackout');

      executeActionOnPage(request.goal).then(success => {
        sendResponse({ 
          success, 
          entitiesCount: found.length,
          actionsExecuted: success ? 1 : 0 
        });
      });
      return true; // asynchronous response
    }
  });
})();
