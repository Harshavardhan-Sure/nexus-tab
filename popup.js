/* ============================================
   Nexus Tab — Toolbar Popup
   ============================================ */

const popupDom = {
  form: document.getElementById('popupSearchForm'),
  input: document.getElementById('popupSearchInput'),
  engineSelect: document.getElementById('popupEngineSelect'),
  quickLinks: document.getElementById('popupQuickLinks'),
  topSites: document.getElementById('popupTopSites'),
  openNewTabBtn: document.getElementById('openNewTabBtn'),
  openSettingsBtn: document.getElementById('openSettingsBtn'),
  openHelpBtn: document.getElementById('openHelpBtn'),
  
  // Timer Elements
  timerSection: document.getElementById('popupTimerSection'),
  timerDisplay: document.getElementById('popupTimerDisplay'),
  timerLabel: document.getElementById('popupTimerLabel'),
  timerStartBtn: document.getElementById('popupTimerStartBtn'),
  timerResetBtn: document.getElementById('popupTimerResetBtn'),
  
  // Recent Searches Elements
  recentSection: document.getElementById('popupRecentSection'),
  recentItems: document.getElementById('popupRecentItems'),
  clearRecentBtn: document.getElementById('popupClearRecentBtn'),
};

const POPUP_ENGINES = ENGINE_CATEGORIES.flatMap(category => category.engines);
let timerCheckInterval = null;
let currentTimerState = null;

function popupGetJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function popupGetRaw(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function openUrl(url) {
  chrome.tabs.create({ url });
  window.close();
}

function getPopupEngineList() {
  const customEngines = popupGetJSON(STORAGE_KEYS.customEngines, []);
  return [
    ...POPUP_ENGINES,
    ...customEngines.map(engine => ({
      id: `custom-${engine.prefix}`,
      label: engine.name,
      prefix: engine.prefix,
      url: engine.url,
    })),
  ];
}

function renderPopupEngines() {
  const selectedEngineId = popupGetRaw(STORAGE_KEYS.engine, DEFAULT_ENGINE);
  const engines = getPopupEngineList();

  popupDom.engineSelect.innerHTML = '';
  engines.forEach(engine => {
    const option = document.createElement('option');
    option.value = engine.id;
    option.textContent = `${engine.label} (${engine.prefix})`;
    popupDom.engineSelect.appendChild(option);
  });

  popupDom.engineSelect.value = engines.some(engine => engine.id === selectedEngineId)
    ? selectedEngineId
    : DEFAULT_ENGINE;
}

function getSelectedPopupEngine() {
  const engines = getPopupEngineList();
  return engines.find(engine => engine.id === popupDom.engineSelect.value) || engines[0];
}

function renderPopupQuickLinks() {
  const links = popupGetJSON(STORAGE_KEYS.quickLinks, DEFAULT_QUICK_LINKS).slice(0, 6);
  popupDom.quickLinks.innerHTML = '';

  links.forEach(link => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'popup-link';

    const icon = document.createElement('img');
    icon.alt = '';
    try { icon.src = FAVICON_BASE + new URL(link.url).hostname; } catch {}

    const label = document.createElement('span');
    label.textContent = link.name;

    item.append(icon, label);
    item.addEventListener('click', () => openUrl(link.url));
    popupDom.quickLinks.appendChild(item);
  });
}

function renderPopupTopSites() {
  popupDom.topSites.innerHTML = '';
  // Show placeholder skeletons to prevent popup height jump/flicker
  for (let i = 0; i < 5; i++) {
    const placeholder = document.createElement('div');
    placeholder.className = 'popup-site-skeleton';
    placeholder.style.height = '34px';
    placeholder.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
    placeholder.style.borderRadius = '8px';
    placeholder.style.border = '1px solid transparent';
    popupDom.topSites.appendChild(placeholder);
  }

  try {
    chrome.topSites.get(sites => {
      popupDom.topSites.innerHTML = '';
      (sites || []).slice(0, 5).forEach(site => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'popup-site';

        const icon = document.createElement('img');
        icon.alt = '';
        try { icon.src = FAVICON_BASE + new URL(site.url).hostname; } catch {}

        const label = document.createElement('span');
        label.textContent = site.title || site.url;

        item.append(icon, label);
        item.addEventListener('click', () => openUrl(site.url));
        popupDom.topSites.appendChild(item);
      });
    });
  } catch {
    popupDom.topSites.innerHTML = '';
  }
}

/* ============================================
   Popup Recent Searches
   ============================================ */
function renderPopupRecentSearches() {
  const recent = popupGetJSON(STORAGE_KEYS.recentSearches, []);
  if (recent.length === 0) {
    popupDom.recentSection.style.display = 'none';
    return;
  }
  
  popupDom.recentSection.style.display = 'block';
  popupDom.recentItems.innerHTML = '';
  
  recent.slice(0, 4).forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'popup-recent-item';
    
    // Icon
    const icon = document.createElement('img');
    icon.alt = '';
    
    // Find engine
    const engines = getPopupEngineList();
    const engine = engines.find(e => e.id === item.engineId) || engines[0];
    try {
      icon.src = FAVICON_BASE + new URL(engine.url).hostname;
    } catch {
      icon.src = '';
    }
    
    // Query text
    const querySpan = document.createElement('span');
    querySpan.className = 'popup-recent-query';
    querySpan.textContent = item.query;
    
    // Engine label badge
    const badge = document.createElement('span');
    badge.className = 'popup-recent-engine';
    badge.textContent = engine.label;
    
    btn.append(icon, querySpan, badge);
    btn.addEventListener('click', () => {
      openUrl(engine.url + encodeURIComponent(item.query));
    });
    
    popupDom.recentItems.appendChild(btn);
  });
}

function handleClearRecentSearches() {
  localStorage.removeItem(STORAGE_KEYS.recentSearches);
  renderPopupRecentSearches();
}

/* ============================================
   Popup Timer Widget
   ============================================ */
function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function updatePopupTimerUI() {
  const raw = localStorage.getItem('nexus-timer');
  if (!raw) {
    if (popupDom.timerSection.style.display !== 'none') {
      popupDom.timerSection.style.display = 'none';
    }
    return;
  }
  
  if (popupDom.timerSection.style.display !== 'block') {
    popupDom.timerSection.style.display = 'block';
  }
  
  const parsed = JSON.parse(raw);
  currentTimerState = parsed;
  
  let remaining = 0;
  if (parsed.running && parsed.targetTime) {
    remaining = Math.max(0, Math.ceil((parsed.targetTime - Date.now()) / 1000));
  } else {
    remaining = parsed.secondsLeft !== undefined ? parsed.secondsLeft : parsed.preset * 60;
  }
  
  const clockText = formatTime(remaining);
  if (popupDom.timerDisplay.textContent !== clockText) {
    popupDom.timerDisplay.textContent = clockText;
  }
  
  const startText = parsed.running ? 'Pause' : 'Start';
  if (popupDom.timerStartBtn.textContent !== startText) {
    popupDom.timerStartBtn.textContent = startText;
  }
  
  // Determine preset type label
  let typeLabel = 'Idle';
  if (parsed.preset === 25) typeLabel = 'Focusing';
  else if (parsed.preset === 5) typeLabel = 'Short Break';
  else if (parsed.preset === 15) typeLabel = 'Long Break';
  else typeLabel = `Timer (${parsed.preset}m)`;
  
  const labelText = parsed.running ? `${typeLabel} (Active)` : `${typeLabel} (Paused)`;
  if (popupDom.timerLabel.textContent !== labelText) {
    popupDom.timerLabel.textContent = labelText;
  }
}

function startPopupTimerLoop() {
  updatePopupTimerUI();
  timerCheckInterval = setInterval(updatePopupTimerUI, 1000);
}

function handlePopupTimerToggle() {
  if (!currentTimerState) return;
  
  const now = Date.now();
  let remaining = 0;
  if (currentTimerState.running && currentTimerState.targetTime) {
    remaining = Math.max(0, Math.ceil((currentTimerState.targetTime - now) / 1000));
  } else {
    remaining = currentTimerState.secondsLeft !== undefined ? currentTimerState.secondsLeft : currentTimerState.preset * 60;
  }
  
  if (currentTimerState.running) {
    // Pause it
    currentTimerState.running = false;
    currentTimerState.secondsLeft = remaining;
    currentTimerState.targetTime = null;
  } else {
    // Start it
    if (remaining === 0) remaining = currentTimerState.preset * 60; // reset if completed
    currentTimerState.running = true;
    currentTimerState.secondsLeft = remaining;
    currentTimerState.targetTime = now + remaining * 1000;
  }
  
  localStorage.setItem('nexus-timer', JSON.stringify(currentTimerState));
  updatePopupTimerUI();
}

function handlePopupTimerReset() {
  if (!currentTimerState) return;
  currentTimerState.running = false;
  currentTimerState.secondsLeft = currentTimerState.preset * 60;
  currentTimerState.targetTime = null;
  localStorage.setItem('nexus-timer', JSON.stringify(currentTimerState));
  updatePopupTimerUI();
}

/* ============================================
   Popup Initializer & Bindings
   ============================================ */
function bindPopupEvents() {
  popupDom.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = popupDom.input.value.trim();
    if (!query) return;
    const engine = getSelectedPopupEngine();
    openUrl(engine.url + encodeURIComponent(query));
  });

  popupDom.openNewTabBtn.addEventListener('click', () => openUrl(chrome.runtime.getURL('newtab.html')));
  popupDom.openSettingsBtn.addEventListener('click', () => openUrl(chrome.runtime.getURL('newtab.html#settings')));
  popupDom.openHelpBtn.addEventListener('click', () => openUrl(chrome.runtime.getURL('newtab.html#help')));

  // Timer controls
  popupDom.timerStartBtn.addEventListener('click', handlePopupTimerToggle);
  popupDom.timerResetBtn.addEventListener('click', handlePopupTimerReset);
  
  // Recent searches clear
  popupDom.clearRecentBtn.addEventListener('click', handleClearRecentSearches);
}

function initPopup() {
  renderPopupEngines();
  renderPopupRecentSearches(); // Render recent searches synchronously first to layout size
  updatePopupTimerUI();       // Update timer section visibility synchronously to layout size
  renderPopupQuickLinks();
  renderPopupTopSites();       // Async top sites (now uses placeholders to avoid height jump)
  startPopupTimerLoop();       // Start dynamic timer ticks
  bindPopupEvents();
  popupDom.input.focus();
}

document.addEventListener('DOMContentLoaded', initPopup);
