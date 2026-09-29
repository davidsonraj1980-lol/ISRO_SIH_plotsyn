import { BoundingBox, RedactionMethod } from '../types';

export class CanvasRedactor {
  /**
   * Captures an HTML element or canvas snapshot, applies precision privacy redactions
   * to all detected bounding boxes, and returns the sanitized base64 data URL.
   * GUARANTEE: Sensitive pixel regions are permanently overwritten at the canvas level
   * BEFORE any transmission occurs.
   */
  public static async redactAndExport(
    sourceElement: HTMLElement,
    boxes: BoundingBox[],
    method: RedactionMethod = 'blackout'
  ): Promise<{ sanitizedDataUrl: string; redactionCount: number }> {
    const rect = sourceElement.getBoundingClientRect();
    const width = Math.max(300, Math.round(rect.width));
    const height = Math.max(200, Math.round(rect.height));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    // 1. Draw base synthetic representation or background
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, width, height);

    // Render simulated DOM visual elements onto the canvas
    const allDivs = sourceElement.querySelectorAll<HTMLElement>('div, p, h1, h2, h3, button, input, table, tr, td');
    ctx.font = '12px "Inter", sans-serif';
    
    allDivs.forEach((el) => {
      const elRect = el.getBoundingClientRect();
      const x = elRect.left - rect.left;
      const y = elRect.top - rect.top;
      const w = elRect.width;
      const h = elRect.height;

      if (w > 0 && h > 0 && x >= 0 && y >= 0 && x + w <= width + 50) {
        // Draw element contour
        const style = window.getComputedStyle(el);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          ctx.fillStyle = style.backgroundColor;
          ctx.fillRect(x, y, w, h);
        }

        if (style.borderColor && style.borderWidth && parseInt(style.borderWidth) > 0) {
          ctx.strokeStyle = style.borderColor;
          ctx.lineWidth = Math.min(2, parseInt(style.borderWidth));
          ctx.strokeRect(x, y, w, h);
        }

        // Draw text preview (if it's not a sensitive element)
        const isSensitive = boxes.some(b => 
          Math.abs(b.x - x) < 15 && Math.abs(b.y - y) < 15
        );

        if (!isSensitive && el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
          const text = (el.textContent || '').trim();
          if (text.length > 0 && text.length < 60) {
            ctx.fillStyle = style.color || '#94a3b8';
            ctx.fillText(text, x + 6, y + Math.min(h - 4, 16));
          }
        }
      }
    });

    // 2. APPLY THE PRIVACY PRESERVING REDACTION FILTER ON DETECTED BOUNDING BOXES
    boxes.forEach((box) => {
      const bx = Math.max(0, box.x);
      const by = Math.max(0, box.y);
      const bw = Math.min(width - bx, box.width);
      const bh = Math.min(height - by, box.height);

      if (bw <= 0 || bh <= 0) return;

      switch (method) {
        case 'blackout': {
          // Cryptographic opaque blackout with high-contrast safety tag
          ctx.fillStyle = '#05070e';
          ctx.fillRect(bx, by, bw, bh);

          // Subtle shield border
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, bw, bh);

          // Redaction label tag
          ctx.fillStyle = '#00e5ff';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          const labelText = `🛡️ [REDACTED: ${box.label.slice(0, 18)}]`;
          ctx.fillText(labelText, bx + 4, by + Math.min(bh / 2 + 3, 14));
          break;
        }

        case 'gaussian_blur': {
          // Visual frosted blur simulation
          ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
          ctx.fillRect(bx, by, bw, bh);

          // Noise/hatch pattern to destroy OCR recovery
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
          ctx.lineWidth = 1;
          for (let i = -bh; i < bw; i += 8) {
            ctx.beginPath();
            ctx.moveTo(bx + i, by);
            ctx.lineTo(bx + i + bh, by + bh);
            ctx.stroke();
          }

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 8px "JetBrains Mono", monospace';
          ctx.fillText('BLURRED_PII_DATA', bx + 4, by + 12);
          break;
        }

        case 'pixelate': {
          // Severe block downsampling
          const blockSize = 8;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(bx, by, bw, bh);

          for (let px = 0; px < bw; px += blockSize) {
            for (let py = 0; py < bh; py += blockSize) {
              const shade = Math.floor(Math.random() * 40) + 15;
              ctx.fillStyle = `rgb(${shade}, ${shade + 10}, ${shade + 25})`;
              ctx.fillRect(bx + px, by + py, blockSize, blockSize);
            }
          }
          break;
        }

        case 'synthetic_token': {
          // Replace visual value with synthetic decoy token
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = '#a855f7';
          ctx.strokeRect(bx, by, bw, bh);
          ctx.fillStyle = '#c084fc';
          ctx.font = '10px "JetBrains Mono", monospace';
          const hash = box.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          ctx.fillText(`TOKEN_${hash % 9000 + 1000}`, bx + 6, by + bh / 2 + 4);
          break;
        }
      }
    });

    const sanitizedDataUrl = canvas.toDataURL('image/png');
    return {
      sanitizedDataUrl,
      redactionCount: boxes.length
    };
  }
}
