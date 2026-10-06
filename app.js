/**
 * ============================================================================
 * VORTEX QR — APPLICATION LOGIC
 * Features:
 *  - URL Input & Instant Scannable QR Generation
 *  - Google AI Mode Sample Preset & One-Click Demos
 *  - Smart Website Search & Detection Algorithm (Domain & Site Classifier)
 *  - Saved QR Vault (Title on Left, Generated QR on Right per Wireframe)
 *  - Interactive Zoom Modal / Lightbox for Saved Images & Main QR
 *  - Delete & Inline Edit Capabilities
 *  - Image Scanner (Drop / Paste / Upload QR image -> Decodes site & regenerates QR)
 *  - Dark & Light Mode Theme Support
 * ============================================================================
 */

(function () {
  'use strict';

  // Constants & Keys
  const STORAGE_KEY = 'vortex_qr_vault_v2';
  const THEME_KEY = 'vortex_qr_theme_pref';

  // Default Samples
  const SAMPLE_GOOGLE_AI = {
    title: 'Google AI Mode',
    url: 'https://www.google.com/search?q=Artificial+Intelligence&udm=14',
    domain: 'google.com'
  };

  // Known Websites Directory for Smart Detection Algorithm
  const KNOWN_SERVICES = [
    { pattern: /google\.(?:com|[a-z]{2,3})\/search\?.*udm=(?:14|4)/i, name: 'Google AI Mode' },
    { pattern: /gemini\.google\.com/i, name: 'Google Gemini AI' },
    { pattern: /google\.(?:com|[a-z]{2,3})\/ai/i, name: 'Google AI' },
    { pattern: /google\.(?:com|[a-z]{2,3})/i, name: 'Google' },
    { pattern: /youtube\.com|youtu\.be/i, name: 'YouTube' },
    { pattern: /github\.com/i, name: 'GitHub' },
    { pattern: /reddit\.com/i, name: 'Reddit' },
    { pattern: /x\.com|twitter\.com/i, name: 'X (Twitter)' },
    { pattern: /instagram\.com/i, name: 'Instagram' },
    { pattern: /linkedin\.com/i, name: 'LinkedIn' },
    { pattern: /wikipedia\.org/i, name: 'Wikipedia' },
    { pattern: /amazon\.(?:com|[a-z]{2,3})/i, name: 'Amazon' },
    { pattern: /chatgpt\.com|openai\.com/i, name: 'ChatGPT' },
    { pattern: /netflix\.com/i, name: 'Netflix' },
    { pattern: /spotify\.com/i, name: 'Spotify' },
    { pattern: /discord\.(?:com|gg)/i, name: 'Discord' },
    { pattern: /notion\.so/i, name: 'Notion' },
    { pattern: /figma\.com/i, name: 'Figma' },
    { pattern: /stackoverflow\.com/i, name: 'Stack Overflow' },
    { pattern: /apple\.com/i, name: 'Apple' },
    { pattern: /microsoft\.com/i, name: 'Microsoft' }
  ];

  // Application State
  const state = {
    currentUrl: '',
    currentTitle: '',
    currentFavicon: '',
    currentQrDataUrl: '',
    savedItems: [],
    theme: 'dark',
    activeTab: 'url',
    zoomLevel: 100,
    editingItemId: null
  };

  // DOM Elements Cache
  const DOM = {};

  function initDOMElements() {
    DOM.html = document.documentElement;
    DOM.themeToggleBtn = document.getElementById('theme-toggle-btn');
    DOM.tabBtnUrl = document.getElementById('tab-btn-url');
    DOM.tabBtnImage = document.getElementById('tab-btn-image');
    DOM.urlGenSection = document.getElementById('url-generator-section');
    DOM.imageScannerSection = document.getElementById('image-scanner-section');

    // Input Section
    DOM.urlInput = document.getElementById('url-input');
    DOM.btnPaste = document.getElementById('btn-paste');
    DOM.btnClearUrl = document.getElementById('btn-clear-url');
    DOM.btnGenerate = document.getElementById('btn-generate');
    DOM.siteTitleInput = document.getElementById('site-title-input');
    DOM.siteFaviconPreview = document.getElementById('site-favicon-preview');
    DOM.detectedBadge = document.getElementById('detected-badge');
    DOM.btnQuickSample = document.getElementById('btn-quick-sample');
    DOM.presetChips = document.querySelectorAll('.preset-chip');

    // Generated QR Section
    DOM.qrCanvasHolder = document.getElementById('qr-canvas-holder');
    DOM.qrCodeWrapper = document.getElementById('qr-code-wrapper');
    DOM.activeSiteFavicon = document.getElementById('active-site-favicon');
    DOM.activeSiteTitle = document.getElementById('active-site-title');
    DOM.activeSiteDomain = document.getElementById('active-site-domain');
    DOM.activeSiteUrl = document.getElementById('active-site-url');
    DOM.btnSaveQr = document.getElementById('btn-save-qr');
    DOM.btnZoomActive = document.getElementById('btn-zoom-active');
    DOM.btnTestRedirect = document.getElementById('btn-test-redirect');
    DOM.btnDownloadPng = document.getElementById('btn-download-png');
    DOM.btnCopyUrl = document.getElementById('btn-copy-url');
    DOM.btnShareQr = document.getElementById('btn-share-qr');

    // Saved List Section
    DOM.savedItemsContainer = document.getElementById('saved-items-container');
    DOM.savedEmptyState = document.getElementById('saved-empty-state');
    DOM.savedCountNum = document.getElementById('saved-count-num');
    DOM.searchSavedInput = document.getElementById('search-saved-input');
    DOM.btnClearSearch = document.getElementById('btn-clear-search');
    DOM.btnClearAll = document.getElementById('btn-clear-all');
    DOM.btnEmptySample = document.getElementById('btn-empty-sample');

    // Zoom Lightbox Modal
    DOM.zoomDialog = document.getElementById('zoom-dialog');
    DOM.zoomBackdrop = document.getElementById('zoom-backdrop');
    DOM.btnCloseZoom = document.getElementById('btn-close-zoom');
    DOM.zoomStage = document.getElementById('zoom-stage');
    DOM.zoomImageWrapper = document.getElementById('zoom-image-wrapper');
    DOM.zoomTargetImg = document.getElementById('zoom-target-img');
    DOM.modalSiteTitle = document.getElementById('modal-site-title');
    DOM.modalSiteUrl = document.getElementById('modal-site-url');
    DOM.modalSiteFavicon = document.getElementById('modal-site-favicon');
    DOM.zoomSlider = document.getElementById('zoom-slider');
    DOM.zoomLevelText = document.getElementById('zoom-level-text');
    DOM.btnZoomIn = document.getElementById('btn-zoom-in');
    DOM.btnZoomOut = document.getElementById('btn-zoom-out');
    DOM.btnZoomReset = document.getElementById('btn-zoom-reset');
    DOM.btnModalOpenLink = document.getElementById('btn-modal-open-link');
    DOM.btnModalDownload = document.getElementById('btn-modal-download');

    // Edit Title Modal
    DOM.editTitleDialog = document.getElementById('edit-title-dialog');
    DOM.editBackdrop = document.getElementById('edit-backdrop');
    DOM.editTitleInput = document.getElementById('edit-title-input');
    DOM.btnCloseEdit = document.getElementById('btn-close-edit');
    DOM.btnCancelEdit = document.getElementById('btn-cancel-edit');
    DOM.btnConfirmEdit = document.getElementById('btn-confirm-edit');

    // Image Scanner Elements
    DOM.imageDropzone = document.getElementById('image-dropzone');
    DOM.qrFileInput = document.getElementById('qr-file-input');
    DOM.decodeResultBox = document.getElementById('decode-result-box');
    DOM.decodeSiteName = document.getElementById('decode-site-name');
    DOM.decodeSiteUrl = document.getElementById('decode-site-url');
    DOM.btnUseDecoded = document.getElementById('btn-use-decoded');

    // Toast Container
    DOM.toastContainer = document.getElementById('toast-container');
  }

  // =========================================================================
  // UTILITY & HELPER FUNCTIONS
  // =========================================================================

  /**
   * Displays an elegant toast message.
   */
  function showToast(message, type = 'default') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'danger' ? 'toast-danger' : ''}`;
    toast.textContent = message;

    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /**
   * Ensures URL has a protocol (http/https) so phone scanners open it properly.
   */
  function normalizeUrl(rawUrl) {
    let clean = (rawUrl || '').trim();
    if (!clean) return '';
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }
    return clean;
  }

  /**
   * WEBSITE SEARCH & DETECTION ALGORITHM:
   * Analyzes any link/domain and extracts:
   *  - Recognized brand/site name
   *  - Clean domain
   *  - High-res favicon URL
   */
  function detectWebsiteInfo(url) {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      return {
        title: 'Unknown Website',
        domain: '',
        favicon: 'https://www.google.com/favicon.ico'
      };
    }

    let parsed;
    try {
      parsed = new URL(normalized);
    } catch (e) {
      return {
        title: 'Custom Link',
        domain: normalized,
        favicon: 'https://www.google.com/favicon.ico'
      };
    }

    const fullStr = normalized;
    const hostname = parsed.hostname.toLowerCase();

    // 1. Check known service signatures
    for (const service of KNOWN_SERVICES) {
      if (service.pattern.test(fullStr)) {
        return {
          title: service.name,
          domain: hostname.replace(/^www\./, ''),
          favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
        };
      }
    }

    // 2. Intelligent Domain Title extraction
    let cleanDomain = hostname.replace(/^www\./, '');
    const parts = cleanDomain.split('.');
    let brandName = parts[0] || cleanDomain;
    
    // Capitalize brand name nicely
    brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);

    // If path has meaningful context (e.g. /docs, /blog)
    const pathClean = parsed.pathname.replace(/^\/|\/$/g, '');
    let title = brandName;
    if (pathClean && pathClean.length < 24 && !pathClean.includes('.')) {
      const sub = pathClean.split('/')[0];
      if (sub && sub.length > 2) {
        title += ` — ${sub.charAt(0).toUpperCase() + sub.slice(1)}`;
      }
    }

    return {
      title: title,
      domain: cleanDomain,
      favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    };
  }

  // =========================================================================
  // CORE QR CODE GENERATION ENGINE
  // =========================================================================

  /**
   * Generates a scannable QR code on an offscreen canvas or container,
   * returning a crisp PNG Data URL.
   */
  function generateQrDataUrl(text, size = 400) {
    return new Promise((resolve, reject) => {
      if (!window.QRCode) {
        console.error('QRCode library is not loaded');
        return reject(new Error('QRCode library not loaded'));
      }

      // Temporary offscreen element
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      try {
        new window.QRCode(tempDiv, {
          text: text,
          width: size,
          height: size,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.H
        });

        // Give QRCode.js a microtask tick to render canvas/img
        setTimeout(() => {
          const canvas = tempDiv.querySelector('canvas');
          let dataUrl = '';
          if (canvas) {
            dataUrl = canvas.toDataURL('image/png');
          } else {
            const img = tempDiv.querySelector('img');
            if (img && img.src) {
              dataUrl = img.src;
            }
          }

          tempDiv.remove();
          if (dataUrl) {
            resolve(dataUrl);
          } else {
            reject(new Error('Failed to retrieve QR data URL'));
          }
        }, 60);
      } catch (err) {
        tempDiv.remove();
        reject(err);
      }
    });
  }

  /**
   * Renders the active QR code in the main stage display.
   */
  async function renderActiveQr(url, customTitle = '') {
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    state.currentUrl = normalized;

    // Detect site details
    const siteInfo = detectWebsiteInfo(normalized);
    state.currentTitle = (customTitle || DOM.siteTitleInput.value.trim() || siteInfo.title);
    state.currentFavicon = siteInfo.favicon;

    // Update Meta display in UI
    DOM.activeSiteTitle.textContent = state.currentTitle;
    DOM.activeSiteDomain.textContent = siteInfo.domain || 'Direct Web Link';
    DOM.activeSiteUrl.textContent = normalized;
    DOM.btnTestRedirect.href = normalized;

    // Favicon
    DOM.activeSiteFavicon.src = siteInfo.favicon;
    DOM.activeSiteFavicon.onerror = () => {
      DOM.activeSiteFavicon.src = 'https://www.google.com/favicon.ico';
    };

    DOM.siteFaviconPreview.src = siteInfo.favicon;
    DOM.siteFaviconPreview.style.display = 'inline-block';

    // Auto-update Title input if empty
    if (!DOM.siteTitleInput.value.trim() || DOM.siteTitleInput.value === 'Google AI Mode' || customTitle) {
      DOM.siteTitleInput.value = state.currentTitle;
      DOM.detectedBadge.style.display = 'inline-flex';
    }

    try {
      // Clear holder
      DOM.qrCanvasHolder.innerHTML = '';
      
      // Render using QRCode into holder
      new window.QRCode(DOM.qrCanvasHolder, {
        text: normalized,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.H
      });

      // Generate high-resolution Data URL for downloading/saving
      state.currentQrDataUrl = await generateQrDataUrl(normalized, 512);

    } catch (err) {
      console.error('Error generating active QR:', err);
      showToast('Could not generate QR code: ' + err.message, 'danger');
    }
  }

  // =========================================================================
  // SAVED QR LIST & WIREFRAME LAYOUT IMPLEMENTATION
  // =========================================================================

  /**
   * Loads saved items from localStorage or seeds with default sample.
   */
  function loadSavedVault() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state.savedItems = JSON.parse(raw);
      } else {
        // Seed initial Google AI Mode item matching the user's wireframe requirement!
        state.savedItems = [
          {
            id: 'item_sample_google_ai',
            title: SAMPLE_GOOGLE_AI.title,
            url: SAMPLE_GOOGLE_AI.url,
            domain: SAMPLE_GOOGLE_AI.domain,
            favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64',
            qrDataUrl: '', // Will generate below
            createdAt: Date.now() - 3600000
          }
        ];
        persistSavedVault();
      }
    } catch (e) {
      console.warn('Storage read error:', e);
      state.savedItems = [];
    }

    updateSavedCounter();
    renderSavedList();
  }

  /**
   * Persists vault to localStorage.
   */
  function persistSavedVault() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedItems));
      updateSavedCounter();
    } catch (e) {
      console.error('Storage save error:', e);
      showToast('Error saving to storage', 'danger');
    }
  }

  function updateSavedCounter() {
    if (DOM.savedCountNum) {
      DOM.savedCountNum.textContent = state.savedItems.length;
    }
  }

  /**
   * Saves the currently active QR into the saved list.
   */
  async function saveActiveQrToList() {
    if (!state.currentUrl) {
      showToast('Please enter a valid link first!', 'danger');
      return;
    }

    const title = (DOM.siteTitleInput.value.trim() || state.currentTitle || 'Custom Website');
    const siteInfo = detectWebsiteInfo(state.currentUrl);

    // Make sure we have a fresh high-res data URL
    let qrDataUrl = state.currentQrDataUrl;
    if (!qrDataUrl) {
      qrDataUrl = await generateQrDataUrl(state.currentUrl, 512);
      state.currentQrDataUrl = qrDataUrl;
    }

    // Check if duplicate URL already saved
    const existingIndex = state.savedItems.findIndex(i => i.url === state.currentUrl);
    if (existingIndex !== -1) {
      // Update existing
      state.savedItems[existingIndex].title = title;
      state.savedItems[existingIndex].qrDataUrl = qrDataUrl;
      state.savedItems[existingIndex].createdAt = Date.now();
      showToast(`Updated "${title}" in your saved list!`, 'success');
    } else {
      // Prepend new item
      const newItem = {
        id: 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title: title,
        url: state.currentUrl,
        domain: siteInfo.domain || 'Web Link',
        favicon: siteInfo.favicon,
        qrDataUrl: qrDataUrl,
        createdAt: Date.now()
      };
      state.savedItems.unshift(newItem);
      showToast(`Saved "${title}" to your vault!`, 'success');
    }

    persistSavedVault();
    renderSavedList();

    // Smooth scroll down to saved section if needed
    DOM.savedListSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Deletes a saved item by ID.
   */
  function deleteSavedItem(id) {
    const item = state.savedItems.find(i => i.id === id);
    const title = item ? item.title : 'Item';

    // Animate removal
    const cardEl = document.querySelector(`[data-item-id="${id}"]`);
    if (cardEl) {
      cardEl.style.transform = 'translateX(20px)';
      cardEl.style.opacity = '0';
      cardEl.style.transition = 'all 200ms ease';
      setTimeout(() => {
        state.savedItems = state.savedItems.filter(i => i.id !== id);
        persistSavedVault();
        renderSavedList();
        showToast(`Deleted "${title}" from saved list`, 'default');
      }, 200);
    } else {
      state.savedItems = state.savedItems.filter(i => i.id !== id);
      persistSavedVault();
      renderSavedList();
      showToast(`Deleted "${title}" from saved list`, 'default');
    }
  }

  /**
   * Opens the edit title modal.
   */
  function promptEditTitle(id) {
    const item = state.savedItems.find(i => i.id === id);
    if (!item) return;

    state.editingItemId = id;
    DOM.editTitleInput.value = item.title;
    if (DOM.editTitleDialog.showModal) {
      DOM.editTitleDialog.showModal();
    } else {
      DOM.editTitleDialog.setAttribute('open', '');
    }
    DOM.editTitleInput.focus();
    DOM.editTitleInput.select();
  }

  function confirmEditTitle() {
    const newTitle = DOM.editTitleInput.value.trim();
    if (!newTitle) {
      showToast('Title cannot be empty', 'danger');
      return;
    }

    const item = state.savedItems.find(i => i.id === state.editingItemId);
    if (item) {
      item.title = newTitle;
      persistSavedVault();
      renderSavedList();
      showToast(`Updated website name to "${newTitle}"`, 'success');
    }

    closeEditModal();
  }

  function closeEditModal() {
    if (DOM.editTitleDialog.close) {
      DOM.editTitleDialog.close();
    } else {
      DOM.editTitleDialog.removeAttribute('open');
    }
    state.editingItemId = null;
  }

  /**
   * Renders the saved list following the wireframe layout:
   * Left: The name of the website (user can customize it accordingly) + URL info
   * Right: The generated QR image (clickable to zoom!)
   */
  async function renderSavedList() {
    const container = DOM.savedItemsContainer;
    container.innerHTML = '';

    const query = (DOM.searchSavedInput.value || '').trim().toLowerCase();
    
    // Website Search Algorithm for saved list
    const filtered = state.savedItems.filter(item => {
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query) ||
        (item.domain && item.domain.toLowerCase().includes(query))
      );
    });

    if (filtered.length === 0) {
      DOM.savedEmptyState.classList.remove('hidden');
      return;
    } else {
      DOM.savedEmptyState.classList.add('hidden');
    }

    // Render cards
    for (const item of filtered) {
      const card = document.createElement('div');
      card.className = 'saved-card';
      card.setAttribute('data-item-id', item.id);

      // Format relative or readable date
      const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      card.innerHTML = `
        <!-- Left Column: Website Name, URL, and Controls -->
        <div class="saved-card-left">
          <div class="saved-card-title-row">
            <img class="saved-card-favicon" src="${item.favicon || 'https://www.google.com/favicon.ico'}" alt="Favicon" onerror="this.src='https://www.google.com/favicon.ico'">
            <h3 class="saved-card-title" title="Double click to edit">${escapeHtml(item.title)}</h3>
            <button type="button" class="btn-edit-title-inline" title="Edit website name" data-action="edit" data-id="${item.id}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>

          <div class="saved-card-url-row">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="saved-card-url" title="Open ${item.url}">
              ${escapeHtml(item.url)}
            </a>
          </div>

          <div class="saved-card-meta-row">
            <span class="saved-card-timestamp">Saved on ${dateStr}</span>
            <div class="saved-card-actions">
              <button type="button" class="btn btn-outline btn-xs" data-action="copy" data-url="${escapeHtml(item.url)}" title="Copy link">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy</span>
              </button>
              <button type="button" class="btn btn-outline btn-xs" data-action="load" data-id="${item.id}" title="Load in editor">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 4v6h6"></path>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                <span>Open in Studio</span>
              </button>
              <button type="button" class="btn btn-ghost btn-xs text-danger" data-action="delete" data-id="${item.id}" title="Delete QR link">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: The Generated QR Image with Zoom Thumbnail -->
        <div class="saved-card-right">
          <div class="saved-qr-thumb-box" data-action="zoom" data-id="${item.id}" title="Click to zoom in QR image">
            <img class="saved-thumb-img" src="${item.qrDataUrl || ''}" alt="QR code for ${escapeHtml(item.title)}">
            <div class="saved-thumb-overlay">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </div>
          </div>
        </div>
      `;

      // If the item doesn't have a precomputed dataUrl (e.g. sample seed), generate it asynchronously
      if (!item.qrDataUrl) {
        generateQrDataUrl(item.url, 256).then(dataUrl => {
          item.qrDataUrl = dataUrl;
          persistSavedVault();
          const imgEl = card.querySelector('.saved-thumb-img');
          if (imgEl) imgEl.src = dataUrl;
        });
      }

      container.appendChild(card);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // INTERACTIVE ZOOM LIGHTBOX MODAL
  // =========================================================================

  /**
   * Opens the zoom lightbox for any given QR image & details.
   */
  async function openZoomLightbox({ title, url, favicon, qrDataUrl }) {
    state.zoomLevel = 100;
    DOM.zoomSlider.value = 100;
    DOM.zoomLevelText.textContent = '100%';
    DOM.zoomImageWrapper.style.transform = 'scale(1)';

    DOM.modalSiteTitle.textContent = title || 'Website QR';
    DOM.modalSiteUrl.textContent = url || '';
    DOM.modalSiteFavicon.src = favicon || 'https://www.google.com/favicon.ico';
    DOM.btnModalOpenLink.href = url || '#';

    // If qrDataUrl is not ready, generate it
    let imgSrc = qrDataUrl;
    if (!imgSrc && url) {
      imgSrc = await generateQrDataUrl(url, 600);
    }

    DOM.zoomTargetImg.src = imgSrc;

    // Download handler for modal
    DOM.btnModalDownload.onclick = () => {
      downloadQrImage(imgSrc, (title || 'qr-code').toLowerCase().replace(/\s+/g, '-'));
    };

    // Open native dialog with fallback
    if (DOM.zoomDialog.showModal) {
      DOM.zoomDialog.showModal();
    } else {
      DOM.zoomDialog.setAttribute('open', '');
    }
  }

  function closeZoomLightbox() {
    if (DOM.zoomDialog.close) {
      DOM.zoomDialog.close();
    } else {
      DOM.zoomDialog.removeAttribute('open');
    }
  }

  function setZoomLevel(level) {
    const clamped = Math.max(80, Math.min(400, level));
    state.zoomLevel = clamped;
    DOM.zoomSlider.value = clamped;
    DOM.zoomLevelText.textContent = `${clamped}%`;
    DOM.zoomImageWrapper.style.transform = `scale(${clamped / 100})`;
  }

  // =========================================================================
  // IMAGE SCANNER & "IF JUST IMAGE, GENERATE QR OF WHAT SITE IT BELONGS TO"
  // =========================================================================

  /**
   * Scans an uploaded / pasted image for QR code using jsQR.
   * If detected, decodes URL, determines website, and loads into generator!
   */
  function handleImageForDecode(fileOrBlob) {
    if (!window.jsQR) {
      showToast('QR Scanner engine is initializing, please try again.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        // Draw to an in-memory canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          const decodedUrl = normalizeUrl(code.data);
          const siteInfo = detectWebsiteInfo(decodedUrl);

          // Show decode result box
          DOM.decodeResultBox.classList.remove('hidden');
          DOM.decodeSiteName.textContent = `Identified: ${siteInfo.title}`;
          DOM.decodeSiteUrl.textContent = decodedUrl;

          showToast(`QR Decoded! Identified site: ${siteInfo.title}`, 'success');

          // Action to load into generator
          DOM.btnUseDecoded.onclick = () => {
            switchTab('url');
            DOM.urlInput.value = decodedUrl;
            DOM.siteTitleInput.value = siteInfo.title;
            renderActiveQr(decodedUrl, siteInfo.title);
            saveActiveQrToList();
          };
        } else {
          // Fallback: If not a QR code, inform user clearly
          DOM.decodeResultBox.classList.add('hidden');
          showToast('No scannable QR code found in this image. Please upload a clear QR code image.', 'danger');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileOrBlob);
  }

  // =========================================================================
  // DOWNLOAD & EXPORT UTILITIES
  // =========================================================================

  function downloadQrImage(dataUrl, filename = 'qr-code') {
    if (!dataUrl) {
      showToast('No QR code ready for download', 'danger');
      return;
    }
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('High-resolution QR code downloaded!', 'success');
  }

  async function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg, 'success');
    } catch (err) {
      // Fallback
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      showToast(successMsg, 'success');
    }
  }

  // =========================================================================
  // TAB NAVIGATION & THEMES
  // =========================================================================

  function switchTab(mode) {
    state.activeTab = mode;
    if (mode === 'url') {
      DOM.tabBtnUrl.classList.add('active');
      DOM.tabBtnImage.classList.remove('active');
      DOM.urlGenSection.classList.remove('hidden');
      DOM.imageScannerSection.classList.add('hidden');
    } else {
      DOM.tabBtnUrl.classList.remove('active');
      DOM.tabBtnImage.classList.add('active');
      DOM.urlGenSection.classList.add('hidden');
      DOM.imageScannerSection.classList.remove('hidden');
    }
  }

  function toggleTheme() {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function setTheme(theme) {
    state.theme = theme;
    DOM.html.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    } else {
      setTheme('dark');
    }
  }

  // =========================================================================
  // EVENT LISTENERS & SETUP
  // =========================================================================

  function setupEventListeners() {
    // Theme toggle
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Tab buttons
    DOM.tabBtnUrl.addEventListener('click', () => switchTab('url'));
    DOM.tabBtnImage.addEventListener('click', () => switchTab('image'));

    // Quick Sample: Google AI Mode button in header
    DOM.btnQuickSample.addEventListener('click', () => {
      loadGoogleAiSample();
    });

    // Empty state sample button
    DOM.btnEmptySample.addEventListener('click', () => {
      loadGoogleAiSample();
    });

    // Preset chips
    DOM.presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const url = chip.getAttribute('data-url');
        const title = chip.getAttribute('data-title');
        DOM.urlInput.value = url;
        DOM.siteTitleInput.value = title;
        renderActiveQr(url, title);
        DOM.btnClearUrl.classList.remove('hidden');
      });
    });

    // URL Input interactions
    DOM.urlInput.addEventListener('input', () => {
      const val = DOM.urlInput.value.trim();
      if (val) {
        DOM.btnClearUrl.classList.remove('hidden');
        // Live site detection as user types
        const info = detectWebsiteInfo(val);
        DOM.siteTitleInput.value = info.title;
        DOM.detectedBadge.style.display = 'inline-flex';
        DOM.siteFaviconPreview.src = info.favicon;
        DOM.siteFaviconPreview.style.display = 'inline-block';
      } else {
        DOM.btnClearUrl.classList.add('hidden');
        DOM.detectedBadge.style.display = 'none';
      }
    });

    DOM.urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        DOM.btnGenerate.click();
      }
    });

    // Clear URL button
    DOM.btnClearUrl.addEventListener('click', () => {
      DOM.urlInput.value = '';
      DOM.btnClearUrl.classList.add('hidden');
      DOM.urlInput.focus();
    });

    // Paste button
    DOM.btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          DOM.urlInput.value = text;
          DOM.btnClearUrl.classList.remove('hidden');
          const info = detectWebsiteInfo(text);
          DOM.siteTitleInput.value = info.title;
          renderActiveQr(text, info.title);
          showToast('Pasted link from clipboard!', 'success');
        }
      } catch (e) {
        showToast('Clipboard access was blocked. Please paste manually.', 'default');
      }
    });

    // Main Generate Button
    DOM.btnGenerate.addEventListener('click', () => {
      const val = DOM.urlInput.value.trim();
      if (!val) {
        showToast('Please enter or paste a website link first!', 'danger');
        DOM.urlInput.focus();
        return;
      }
      renderActiveQr(val, DOM.siteTitleInput.value.trim());
      showToast('Scannable QR code generated successfully!', 'success');
    });

    // Save Active QR to List
    DOM.btnSaveQr.addEventListener('click', saveActiveQrToList);

    // Zoom on Active QR (Click on QR or click Zoom In button)
    DOM.qrCodeWrapper.addEventListener('click', () => {
      openZoomLightbox({
        title: state.currentTitle,
        url: state.currentUrl,
        favicon: state.currentFavicon,
        qrDataUrl: state.currentQrDataUrl
      });
    });

    DOM.btnZoomActive.addEventListener('click', () => {
      openZoomLightbox({
        title: state.currentTitle,
        url: state.currentUrl,
        favicon: state.currentFavicon,
        qrDataUrl: state.currentQrDataUrl
      });
    });

    // Download active QR
    DOM.btnDownloadPng.addEventListener('click', () => {
      const safeName = (state.currentTitle || 'qr-code').toLowerCase().replace(/\s+/g, '-');
      downloadQrImage(state.currentQrDataUrl, safeName);
    });

    // Copy link
    DOM.btnCopyUrl.addEventListener('click', () => {
      if (!state.currentUrl) return;
      copyToClipboard(state.currentUrl, 'Redirect link copied to clipboard!');
    });

    // Share QR
    DOM.btnShareQr.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: state.currentTitle,
            text: `Scan QR code for ${state.currentTitle}:`,
            url: state.currentUrl
          });
        } catch (e) {
          // User cancelled
        }
      } else {
        copyToClipboard(state.currentUrl, 'Share link copied to clipboard!');
      }
    });

    // Saved list delegate actions (Edit, Delete, Copy, Zoom, Load)
    DOM.savedItemsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');

      if (action === 'delete') {
        deleteSavedItem(id);
      } else if (action === 'edit') {
        promptEditTitle(id);
      } else if (action === 'copy') {
        const url = btn.getAttribute('data-url');
        copyToClipboard(url, 'Website link copied to clipboard!');
      } else if (action === 'zoom') {
        const item = state.savedItems.find(i => i.id === id);
        if (item) {
          openZoomLightbox({
            title: item.title,
            url: item.url,
            favicon: item.favicon,
            qrDataUrl: item.qrDataUrl
          });
        }
      } else if (action === 'load') {
        const item = state.savedItems.find(i => i.id === id);
        if (item) {
          switchTab('url');
          DOM.urlInput.value = item.url;
          DOM.siteTitleInput.value = item.title;
          renderActiveQr(item.url, item.title);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast(`Loaded "${item.title}" into studio`, 'success');
        }
      }
    });

    // Double-click on saved card title to edit
    DOM.savedItemsContainer.addEventListener('dblclick', (e) => {
      const titleEl = e.target.closest('.saved-card-title');
      if (!titleEl) return;
      const card = titleEl.closest('.saved-card');
      if (card) {
        const id = card.getAttribute('data-item-id');
        promptEditTitle(id);
      }
    });

    // Search input algorithm for saved list
    DOM.searchSavedInput.addEventListener('input', () => {
      const val = DOM.searchSavedInput.value.trim();
      if (val) {
        DOM.btnClearSearch.classList.remove('hidden');
      } else {
        DOM.btnClearSearch.classList.add('hidden');
      }
      renderSavedList();
    });

    DOM.btnClearSearch.addEventListener('click', () => {
      DOM.searchSavedInput.value = '';
      DOM.btnClearSearch.classList.add('hidden');
      renderSavedList();
      DOM.searchSavedInput.focus();
    });

    // Clear all saved items
    DOM.btnClearAll.addEventListener('click', () => {
      if (state.savedItems.length === 0) return;
      if (confirm('Are you sure you want to delete all saved QR codes from your vault?')) {
        state.savedItems = [];
        persistSavedVault();
        renderSavedList();
        showToast('All saved QR codes cleared', 'default');
      }
    });

    // Zoom Lightbox Modal Controls
    DOM.btnCloseZoom.addEventListener('click', closeZoomLightbox);
    DOM.zoomBackdrop.addEventListener('click', closeZoomLightbox);

    DOM.btnZoomIn.addEventListener('click', () => setZoomLevel(state.zoomLevel + 25));
    DOM.btnZoomOut.addEventListener('click', () => setZoomLevel(state.zoomLevel - 25));
    DOM.btnZoomReset.addEventListener('click', () => setZoomLevel(100));

    DOM.zoomSlider.addEventListener('input', (e) => {
      setZoomLevel(parseInt(e.target.value, 10));
    });

    // Mouse wheel zoom inside modal
    DOM.zoomStage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 15 : -15;
      setZoomLevel(state.zoomLevel + delta);
    }, { passive: false });

    // Double click on zoom image to toggle 100% / 200%
    DOM.zoomImageWrapper.addEventListener('dblclick', () => {
      setZoomLevel(state.zoomLevel === 100 ? 200 : 100);
    });

    // Edit Title Modal Controls
    DOM.btnCloseEdit.addEventListener('click', closeEditModal);
    DOM.btnCancelEdit.addEventListener('click', closeEditModal);
    DOM.editBackdrop.addEventListener('click', closeEditModal);
    DOM.btnConfirmEdit.addEventListener('click', confirmEditTitle);

    DOM.editTitleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmEditTitle();
      } else if (e.key === 'Escape') {
        closeEditModal();
      }
    });

    // Keyboard ESC for modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.zoomDialog.hasAttribute('open')) closeZoomLightbox();
        if (DOM.editTitleDialog.hasAttribute('open')) closeEditModal();
      }
    });

    // Image Dropzone & File Input Scanner
    DOM.imageDropzone.addEventListener('click', () => DOM.qrFileInput.click());

    DOM.qrFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageForDecode(e.target.files[0]);
      }
    });

    DOM.imageDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      DOM.imageDropzone.classList.add('drag-over');
    });

    DOM.imageDropzone.addEventListener('dragleave', () => {
      DOM.imageDropzone.classList.remove('drag-over');
    });

    DOM.imageDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      DOM.imageDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageForDecode(e.dataTransfer.files[0]);
      }
    });

    // Clipboard paste anywhere to scan QR image
    window.addEventListener('paste', (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          switchTab('image');
          handleImageForDecode(blob);
          showToast('Image pasted! Scanning for QR code...', 'default');
          break;
        }
      }
    });
  }

  /**
   * Loads the Google AI Mode sample requested by the user.
   */
  function loadGoogleAiSample() {
    switchTab('url');
    DOM.urlInput.value = SAMPLE_GOOGLE_AI.url;
    DOM.siteTitleInput.value = SAMPLE_GOOGLE_AI.title;
    DOM.btnClearUrl.classList.remove('hidden');
    renderActiveQr(SAMPLE_GOOGLE_AI.url, SAMPLE_GOOGLE_AI.title);

    // Set first preset chip active
    DOM.presetChips.forEach(c => c.classList.remove('active'));
    if (DOM.presetChips[0]) DOM.presetChips[0].classList.add('active');

    showToast('Loaded sample: Google AI Mode!', 'success');
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  function init() {
    initDOMElements();
    initTheme();
    setupEventListeners();
    loadSavedVault();

    // Initial load: automatically load Google AI Mode sample as requested!
    DOM.urlInput.value = SAMPLE_GOOGLE_AI.url;
    DOM.siteTitleInput.value = SAMPLE_GOOGLE_AI.title;
    DOM.btnClearUrl.classList.remove('hidden');
    renderActiveQr(SAMPLE_GOOGLE_AI.url, SAMPLE_GOOGLE_AI.title);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
