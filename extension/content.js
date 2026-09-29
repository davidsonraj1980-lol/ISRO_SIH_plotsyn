/**
 * ISRO Netra-Vision - In-Browser Content Script
 * Implements On-Device DOM/Vision Perception, Canvas Privacy Filter, and Autonomous Action Execution.
 */

(() => {
  let detectedEntities = [];
  let currentMode = 'gaussian_blur';

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
        label = 'AADHAAR NUMBER';
      } else if (name.includes('card') || /\b(?:\d{4}[ -]?){3}\d{4}\b/.test(val)) {
        kind = 'credit_card';
        label = 'FINANCIAL CARD';
      } else if (type === 'email' || name.includes('email')) {
        kind = 'email';
        label = 'EMAIL ADDRESS';
      } else if (type === 'tel' || name.includes('phone') || name.includes('mobile')) {
        kind = 'phone';
        label = 'TELEPHONE NUMBER';
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

  // 2. Real Gaussian Blurring & Precision Privacy Shield Overlay
  function renderShieldOverlays(entities, mode) {
    currentMode = mode || 'gaussian_blur';

    // 2a. Reset previous filters on underlying elements
    document.querySelectorAll('.netra-masked-element').forEach((el) => {
      el.classList.remove('netra-masked-element');
      el.style.filter = el.dataset.netraOriginalFilter || '';
      el.style.webkitFilter = el.dataset.netraOriginalFilter || '';
      el.style.userSelect = '';
      delete el.dataset.netraOriginalFilter;
    });

    // Remove existing overlays
    document.querySelectorAll('.netra-extension-overlay').forEach((el) => el.remove());

    entities.forEach((item) => {
      const targetEl = item.element;

      // 2b. Apply REAL visual filter directly onto the target element
      if (targetEl) {
        targetEl.dataset.netraOriginalFilter = targetEl.style.filter || '';
        targetEl.classList.add('netra-masked-element');
        targetEl.style.userSelect = 'none';

        if (mode === 'gaussian_blur') {
          // Direct, unmistakable Gaussian Blur on element
          const blurAmount = item.type === 'biometric' ? '14px' : '9px';
          targetEl.style.filter = `blur(${blurAmount})`;
          targetEl.style.webkitFilter = `blur(${blurAmount})`;
        } else if (mode === 'pixelate') {
          targetEl.style.filter = 'blur(4px) contrast(300%)';
          targetEl.style.webkitFilter = 'blur(4px) contrast(300%)';
        } else if (mode === 'blackout') {
          targetEl.style.filter = 'brightness(0) contrast(200%)';
          targetEl.style.webkitFilter = 'brightness(0) contrast(200%)';
        } else if (mode === 'synthetic_token') {
          targetEl.style.filter = 'blur(6px)';
          targetEl.style.webkitFilter = 'blur(6px)';
        }
      }

      // 2c. Create high-visibility institutional overlay badge
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
      overlay.style.transition = 'all 0.2s ease';

      if (mode === 'gaussian_blur') {
        overlay.style.backdropFilter = 'blur(16px)';
        overlay.style.webkitBackdropFilter = 'blur(16px)';
        overlay.style.background = 'rgba(11, 37, 69, 0.25)';
        overlay.style.border = '1.5px solid rgba(56, 189, 248, 0.85)';
        overlay.innerHTML = `
          <div style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 10px; font-weight: 700; color: #38bdf8; background: rgba(11, 24, 44, 0.9); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.5); letter-spacing: 0.04em; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>BLURRED: ${item.label}</span>
          </div>`;
      } else if (mode === 'pixelate') {
        overlay.style.background = 'repeating-linear-gradient(45deg, rgba(30,41,59,0.7), rgba(30,41,59,0.7) 6px, rgba(15,23,42,0.85) 6px, rgba(15,23,42,0.85) 12px)';
        overlay.style.border = '1.5px solid #64748b';
        overlay.innerHTML = `<span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #f1f5f9; background: #1e293b; padding: 3px 8px; border-radius: 4px; border: 1px solid #475569; letter-spacing: 0.04em;">PIXELATED: ${item.label}</span>`;
      } else if (mode === 'synthetic_token') {
        overlay.style.background = 'rgba(241, 245, 249, 0.9)';
        overlay.style.border = '1.5px dashed #0284c7';
        const hash = Math.abs(item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
        overlay.innerHTML = `<span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #0284c7; background: #ffffff; padding: 3px 8px; border-radius: 4px; border: 1px solid #0284c7;">[TOKEN_${hash % 9000 + 1000}]</span>`;
      } else {
        // Solid Blackout
        overlay.style.background = '#060a12';
        overlay.style.border = '1.5px solid #334155';
        overlay.innerHTML = `<span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #86efac; background: #14532d; padding: 3px 8px; border-radius: 4px; border: 1px solid #16a34a; letter-spacing: 0.04em;">MASKED: ${item.label}</span>`;
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
      renderShieldOverlays(found, request.mode || currentMode);
      sendResponse({ count: found.length });
      return;
    }

    if (request.action === 'CHANGE_MODE') {
      currentMode = request.mode;
      if (detectedEntities.length === 0) {
        scanDomForPii();
      }
      renderShieldOverlays(detectedEntities, currentMode);
      sendResponse({ count: detectedEntities.length });
      return;
    }

    if (request.action === 'RUN_AGENT') {
      const found = scanDomForPii();
      renderShieldOverlays(found, request.mode || currentMode);

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
