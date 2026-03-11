import { apply } from '@directus/visual-editing';

// ── Visual Editing ────────────────────────────────────────────────────────────
// Initialise Directus Visual Editing — scans for data-directus attributes and
// sets up the postMessage bridge so Directus can highlight and edit elements.
// The directus URL is injected server-side into window.__DIRECTUS_URL__ on page views.
const w = window as Window & { __DIRECTUS_URL__?: string };
if (w.__DIRECTUS_URL__) {
  apply({ directusUrl: w.__DIRECTUS_URL__ });
}

// ── Web Components ───────────────────────────────────────────────────────────

/**
 * <brick-text content="<url-encoded-html>">
 * Renders HTML rich-text content from a brick_texts item.
 */
class BrickTextElement extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ['content'];
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    const encoded = this.getAttribute('content') ?? '';
    const html = decodeURIComponent(encoded);

    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .brick-text { line-height: 1.7; }
        .brick-text p { margin-bottom: 0.75em; }
        .brick-text h1, .brick-text h2, .brick-text h3,
        .brick-text h4, .brick-text h5, .brick-text h6 {
          margin-top: 1em;
          margin-bottom: 0.4em;
          font-weight: 600;
        }
        .brick-text a { color: #6644ff; }
        .brick-text img { max-width: 100%; height: auto; }
        .brick-text ul, .brick-text ol { padding-left: 1.5em; margin-bottom: 0.75em; }
      </style>
      <div class="brick-text">${html}</div>
    `;
  }
}

/**
 * <brick-image src="<url>" alt="<alt>">
 * Renders an image from a brick_images item.
 */
class BrickImageElement extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ['src', 'alt'];
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    const src = this.getAttribute('src') ?? '';
    const alt = this.getAttribute('alt') ?? '';

    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .brick-image img {
          display: block;
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
      </style>
      <div class="brick-image">
        <img src="${src}" alt="${alt}" loading="lazy" />
      </div>
    `;
  }
}

customElements.define('brick-text', BrickTextElement);
customElements.define('brick-image', BrickImageElement);

console.debug('[app] client bundle loaded');
