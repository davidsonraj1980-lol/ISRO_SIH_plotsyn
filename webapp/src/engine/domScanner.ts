import { BoundingBox, SensitiveEntityType } from '../types';

export class DomScanner {
  /**
   * Scans a container DOM element and its children to detect sensitive input fields and text nodes.
   */
  public static scan(container: HTMLElement): BoundingBox[] {
    const boxes: BoundingBox[] = [];
    const containerRect = container.getBoundingClientRect();

    // 1. Scan Input & Form Elements
    const inputs = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea, select');
    inputs.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const type = el.getAttribute('type')?.toLowerCase() || 'text';
      const name = (el.getAttribute('name') || '').toLowerCase();
      const id = (el.getAttribute('id') || '').toLowerCase();
      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
      const value = el.value || '';

      let detectedType: SensitiveEntityType | null = null;
      let label = 'PII Field';

      // Passwords and security tokens
      if (type === 'password' || name.includes('password') || id.includes('pwd') || name.includes('pin')) {
        detectedType = 'password';
        label = 'PASSWORD / PIN';
      } else if (name.includes('token') || id.includes('secret') || name.includes('apikey')) {
        detectedType = 'secret_token';
        label = 'AUTH TOKEN / API KEY';
      } else if (name.includes('aadhaar') || id.includes('aadhaar') || /\b\d{4}\s\d{4}\s\d{4}\b/.test(value)) {
        detectedType = 'aadhaar_ssn';
        label = 'AADHAAR / SSN';
      } else if (name.includes('card') || /credit|debit|cvv|expiry/.test(name + id) || /\b(?:\d{4}[ -]?){3}\d{4}\b/.test(value)) {
        detectedType = 'credit_card';
        label = 'FINANCIAL / CARD';
      } else if (type === 'email' || name.includes('email') || /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/.test(value)) {
        detectedType = 'email';
        label = 'EMAIL ADDRESS';
      } else if (type === 'tel' || name.includes('phone') || name.includes('mobile') || /\b(?:\+91|0)?[6-9]\d{9}\b/.test(value)) {
        detectedType = 'phone';
        label = 'TELEPHONE / MOBILE';
      }

      if (detectedType) {
        boxes.push({
          id: `dom-input-${index}`,
          x: Math.round(rect.left - containerRect.left),
          y: Math.round(rect.top - containerRect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          label,
          type: detectedType,
          confidence: 0.99,
          selector: el.id ? `#${el.id}` : el.getAttribute('name') ? `[name="${el.getAttribute('name')}"]` : `input:nth-of-type(${index + 1})`,
          textSnippet: type === 'password' ? '••••••••' : value.slice(0, 15)
        });
      }
    });

    // 2. Scan explicitly marked PII containers or badges
    const piiTags = container.querySelectorAll<HTMLElement>('[data-pii]');
    piiTags.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const piiType = el.getAttribute('data-pii') as SensitiveEntityType;
      if (rect.width === 0 || rect.height === 0) return;

      boxes.push({
        id: `dom-tag-${index}`,
        x: Math.round(rect.left - containerRect.left),
        y: Math.round(rect.top - containerRect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        label: (el.getAttribute('data-label') || 'SENSITIVE DATA').toUpperCase(),
        type: piiType || 'aadhaar_ssn',
        confidence: 1.0,
        selector: el.id ? `#${el.id}` : `[data-pii="${piiType}"]`,
        textSnippet: el.innerText.slice(0, 20)
      });
    });

    return boxes;
  }
}
