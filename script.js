/* ============================================
   Nexus Tab — v2.1 Refactored & Optimized
   ============================================ */

// ══════════════════════════════════════════════════════════════════════
//  CONSTANTS & DERIVED DATA
// ══════════════════════════════════════════════════════════════════════
let ALL_ENGINES = ENGINE_CATEGORIES.flatMap(cat => cat.engines);
let PREFIX_MAP = new Map(ALL_ENGINES.map(e => [e.prefix, e]));

const ENGINE_ACCENT_COLORS = {
  google: '#4285F4',
  duckduckgo: '#DE5833',
  brave: '#FB542B',
  startpage: '#6573FF',
  gdrive: '#34A853',
  translate: '#4285F4',
  chatgpt: '#10A37F',
  perplexity: '#20B2AA',
  claude: '#D97757',
  gemini: '#4893FC',
  grok: '#d0cec8',
  you: '#7857FF',
  googleai: '#34A853',
  stackoverflow: '#F48024',
  github: '#d0cec8',
  mdn: '#83d0f2',
  devdocs: '#6DB33F',
  npm: '#CB3837',
  wikipedia: '#d0cec8',
  youtube: '#FF0000',
  amazon: '#FF9900',
  reddit: '#FF4500',
  maps: '#1A73E8',
};

// ══════════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════════
let activeEngineId = '';
let settings = {};
let quickLinks = [];
let recentSearches = [];
let customEngines = [];
let usageData = {};
let detectedPrefix = null;
let dropdownIndex = -1;
let dropdownItems = [];
let suggestDebounceTimer = null;
let isIncognito = false;
let notesInitialized = false;
let todos = [];
let engineCatalogOpen = false;
let commandIndex = -1;
let commandItems = [];

// Timer
let timerInterval = null;
let timerSeconds = 25 * 60;
let timerPreset = 25;
let timerRunning = false;

// ══════════════════════════════════════════════════════════════════════
//  DOM CACHE (populated once)
// ══════════════════════════════════════════════════════════════════════
const $ = (id) => document.getElementById(id);
const el = (tag, className, text) => {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text != null) e.textContent = text;
  return e;
};
let dom;

function cacheDom() {
  dom = {
    searchInput:    $('searchInput'),
    searchWrapper:  $('searchWrapper'),
    enginePrefix:   $('enginePrefix'),
    engineChips:    $('engineChips'),
    engineLabel:    $('engineLabel'),
    dropdown:       $('autocompleteDropdown'),
    hintBar:        $('hintBar'),
    clockSection:   $('clockSection'),
    clockTime:      $('clockTime'),
    clockDate:      $('clockDate'),
    greetingSection: $('greetingSection'),
    greeting:       $('greeting'),
    quickLinks:     $('quickLinks'),
    recentSearches: $('recentSearches'),
    recentItems:    $('recentItems'),
    clearRecent:    $('clearRecent'),
    quoteSection:   $('quoteSection'),
    quoteText:      $('quoteText'),
    quoteAuthor:    $('quoteAuthor'),
    helpBtn:        $('helpBtn'),
    settingsBtn:    $('settingsBtn'),
    settingsPanel:  $('settingsPanel'),
    settingsOverlay:$('settingsOverlay'),
    settingsClose:  $('settingsClose'),
    settingsTabs:   $('settingsTabs'),
    colorPicker:    $('colorPicker'),
    notesToggle:    $('notesToggle'),
    notesPanel:     $('notesPanel'),
    notesTextarea:  $('notesTextarea'),
    timerToggle:    $('timerToggle'),
    timerPanel:     $('timerPanel'),
    timerDisplay:   $('timerDisplay'),
    timerStartBtn:  $('timerStartBtn'),
    timerResetBtn:  $('timerResetBtn'),
    incognitoBadge: $('incognitoBadge'),
    quickLinkModal: $('quickLinkModal'),
    engineModal:    $('engineModal'),
    quickLinksManager:    $('quickLinksManager'),
    customEnginesManager: $('customEnginesManager'),
    usageStats:     $('usageStats'),
    toggleLightMode:$('toggleLightMode'),
    bgInput:        $('bgInput'),
    uploadBgBtn:    $('uploadBgBtn'),
    clearBgBtn:     $('clearBgBtn'),
    bgDimInput:     $('bgDimInput'),
    bgBlurInput:    $('bgBlurInput'),
    bgPositionSelect:$('bgPositionSelect'),
    densityControl: $('densityControl'),
    customBg:       $('customBg'),
    todoToggle:     $('todoToggle'),
    todoPanel:      $('todoPanel'),
    todoList:       $('todoList'),
    todoForm:       $('todoForm'),
    todoInput:      $('todoInput'),
    widgetDock:     $('widgetDock'),
    commandOverlay: $('commandOverlay'),
    commandInput:   $('commandInput'),
    commandResults: $('commandResults'),
    helpOverlay:    $('helpOverlay'),
    helpClose:      $('helpClose'),
    helpStartBtn:   $('helpStartBtn'),
    weatherWidget:              $('weatherWidget'),
    weatherSummary:             $('weatherSummary'),
    weatherIcon:                $('weatherIcon'),
    weatherTemp:                $('weatherTemp'),
    weatherCity:                $('weatherCity'),
    weatherFeels:               $('weatherFeels'),
    weatherHumidity:            $('weatherHumidity'),
    weatherWind:                $('weatherWind'),
    weatherForecast:            $('weatherForecast'),
    toggleWeather:              $('toggleWeather'),
    weatherLocationInput:       $('weatherLocationInput'),
    weatherLocationSearchBtn:   $('weatherLocationSearchBtn'),
    weatherLocationStatus:      $('weatherLocationStatus'),
    weatherUnitControl:         $('weatherUnitControl'),
    customNameInput:            $('customNameInput'),
    bgAttribution:              $('bgAttribution'),
    attributionLink:            $('attributionLink'),
  };
}

// ══════════════════════════════════════════════════════════════════════
//  INITIALIZATION — phased for fast first-paint
// ══════════════════════════════════════════════════════════════════════
function init() {
  cacheDom();
  detectIncognito();
  loadAllData();

  // Phase 1: Critical path — what the user sees immediately
  applyAccentColor();
  applyTheme();
  applyLayoutDensity();
  applyBackgroundControls();
  loadBackground();
  startClock();
  renderGreeting();
  updateLabel();
  updateSearchEnginePrefix();
  renderChips();
  renderQuickLinks();
  renderTodos();
  applyVisibilitySettings();
  initWeather();
  bindEvents();
  dom.searchInput.focus();

  // Phase 2: Deferred — non-critical, off-screen, or lazy
  requestAnimationFrame(() => {
    renderQuote();

    handleInitialHash();
    maybeShowOnboarding();
  });
}

// ══════════════════════════════════════════════════════════════════════
//  DATA PERSISTENCE
// ══════════════════════════════════════════════════════════════════════
function safeGetJSON(key, fallback) {
  if (isIncognito) return fallback;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function safeGetArray(key, fallback) {
  const value = safeGetJSON(key, fallback);
  return Array.isArray(value) ? value : fallback;
}

function safeGetObject(key, fallback) {
  const value = safeGetJSON(key, fallback);
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

function safeGetRaw(key, fallback) {
  if (isIncognito) return fallback;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch { return fallback; }
}

function safeSetJSON(key, value) {
  if (isIncognito) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function safeSetRaw(key, value) {
  if (isIncognito) return;
  try { localStorage.setItem(key, value); } catch {}
}

function removeStoredValue(key) {
  try { localStorage.removeItem(key); } catch {}
}

function loadStoredState() {
  return {
    settings: { ...DEFAULT_SETTINGS, ...safeGetObject(STORAGE_KEYS.settings, {}) },
    quickLinks: safeGetArray(STORAGE_KEYS.quickLinks, DEFAULT_QUICK_LINKS),
    recentSearches: safeGetArray(STORAGE_KEYS.recentSearches, []),
    customEngines: safeGetArray(STORAGE_KEYS.customEngines, []),
    usageData: safeGetObject(STORAGE_KEYS.usage, {}),
    todos: safeGetArray(STORAGE_KEYS.todos, []),
  };
}

function loadSavedEngineId() {
  const savedEngine = safeGetRaw(STORAGE_KEYS.engine, null);
  return savedEngine && ALL_ENGINES.some(e => e.id === savedEngine) ? savedEngine : DEFAULT_ENGINE;
}

function loadAllData() {
  const storedState = loadStoredState();
  settings = storedState.settings;
  quickLinks = storedState.quickLinks.map(link => ({ ...link }));
  recentSearches = storedState.recentSearches;
  customEngines = storedState.customEngines;
  usageData = storedState.usageData;
  todos = storedState.todos;
  loadCustomEngines();
  activeEngineId = loadSavedEngineId();
}

function saveSettings()       { safeSetJSON(STORAGE_KEYS.settings, settings); }
function saveQuickLinks()     { safeSetJSON(STORAGE_KEYS.quickLinks, quickLinks); }
function saveRecentSearches() { safeSetJSON(STORAGE_KEYS.recentSearches, recentSearches); }
function saveUsage()          { safeSetJSON(STORAGE_KEYS.usage, usageData); }
function saveEngine(id)       { safeSetRaw(STORAGE_KEYS.engine, id); }
function saveCustomEngines()  { safeSetJSON(STORAGE_KEYS.customEngines, customEngines); }
function saveTodos()          { safeSetJSON(STORAGE_KEYS.todos, todos); }

// ══════════════════════════════════════════════════════════════════════
//  INCOGNITO DETECTION
// ══════════════════════════════════════════════════════════════════════
function detectIncognito() {
  try {
    if (chrome?.extension?.inIncognitoContext) {
      isIncognito = true;
      dom.incognitoBadge.style.display = 'flex';
    }
  } catch {}
}

// ══════════════════════════════════════════════════════════════════════
//  ACCENT COLOR
// ══════════════════════════════════════════════════════════════════════
function applyAccentColor() {
  const hex = settings.accentHex || ACCENT_COLORS[settings.accentColor] || '#3ecf8e';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const root = document.documentElement.style;
  root.setProperty('--accent', hex);
  root.setProperty('--accent-dim', `rgba(${r},${g},${b},0.12)`);
  root.setProperty('--accent-glow', `rgba(${r},${g},${b},0.25)`);
  root.setProperty('--text-accent', hex);
  root.setProperty('--border-active', hex);

  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === settings.accentColor);
  });
}

function getEngineAccent(engine) {
  return engine?.color
    || ENGINE_ACCENT_COLORS[engine?.id]
    || settings.accentHex
    || ACCENT_COLORS[settings.accentColor]
    || '#d27a57';
}

function getEngineFaviconHost(engine) {
  try {
    return new URL(engine.url).hostname;
  } catch {
    return '';
  }
}

function createEngineIcon(engine, cssClass) {
  const svgMarkup = typeof ENGINE_SVGS !== 'undefined' && ENGINE_SVGS[engine.id];
  if (svgMarkup) {
    const wrap = el('span', cssClass || 'chip-favicon-svg');
    wrap.innerHTML = svgMarkup;
    return wrap;
  }
  const img = document.createElement('img');
  img.className = cssClass === 'engine-prefix-svg' ? 'engine-prefix-favicon' : 'chip-favicon';
  img.alt = '';
  img.loading = 'lazy';
  try { img.src = FAVICON_BASE + new URL(engine.url).hostname; } catch {}
  return img;
}

function updateSearchEnginePrefix() {
  const engine = ALL_ENGINES.find(e => e.id === activeEngineId);
  if (!engine || !dom?.enginePrefix) return;

  document.documentElement.style.setProperty('--engine-color', getEngineAccent(engine));
  dom.searchInput.setAttribute('aria-label', `Search with ${engine.label}`);

  const fallback = (engine.label || engine.prefix || '?').charAt(0).toUpperCase();
  dom.enginePrefix.textContent = '';

  const svgMarkup = typeof ENGINE_SVGS !== 'undefined' && ENGINE_SVGS[engine.id];
  if (svgMarkup) {
    const wrap = el('span', 'engine-prefix-svg');
    wrap.innerHTML = svgMarkup;
    dom.enginePrefix.appendChild(wrap);
    return;
  }

  const host = getEngineFaviconHost(engine);
  if (!host) {
    dom.enginePrefix.textContent = fallback;
    return;
  }

  const img = document.createElement('img');
  img.className = 'engine-prefix-favicon';
  img.alt = '';
  img.decoding = 'async';
  img.src = FAVICON_BASE + host;
  img.addEventListener('error', () => {
    dom.enginePrefix.textContent = fallback;
  }, { once: true });
  dom.enginePrefix.appendChild(img);
}

// ══════════════════════════════════════════════════════════════════════
//  CUSTOM ENGINES
// ══════════════════════════════════════════════════════════════════════
function loadCustomEngines() {
  const idx = ENGINE_CATEGORIES.findIndex(c => c.category === 'Custom');
  if (idx >= 0) ENGINE_CATEGORIES.splice(idx, 1);

  if (customEngines.length > 0) {
    ENGINE_CATEGORIES.push({
      category: 'Custom',
      engines: customEngines.map(ce => ({
        id: `custom-${ce.prefix}`,
        label: ce.name,
        prefix: ce.prefix,
        url: ce.url,
      })),
    });
  }

  ALL_ENGINES = ENGINE_CATEGORIES.flatMap(cat => cat.engines);
  PREFIX_MAP = new Map(ALL_ENGINES.map(e => [e.prefix, e]));
}

// ══════════════════════════════════════════════════════════════════════
//  GREETING
// ══════════════════════════════════════════════════════════════════════
function getGreeting() {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const name = settings.customName || 'Harsha';

  if (Math.random() < 0.2) {
    const generics = [`Welcome, ${name}!`, `What’s on your mind, ${name}?`];
    return generics[Math.floor(Math.random() * generics.length)];
  }

  const greetings = [];

  if (hour >= 5 && hour < 12) {
    greetings.push(`Good morning, ${name}!`);
  } else if (hour >= 12 && hour < 18) {
    greetings.push(`Good afternoon, ${name}!`);
  } else if (hour >= 18 && hour < 23) {
    greetings.push(`Good evening, ${name}!`, `Evening, ${name}!`);
  } else if (hour >= 23) {
    greetings.push('Hello, night owl!');
  } else {
    greetings.push(`Good night, ${name}!`);
  }

  if (day === 1 && hour < 16) greetings.push(`Happy Monday, ${name}!`);
  else if (day === 2) greetings.push(`Happy Tuesday, ${name}!`);
  else if (day === 5 && hour < 16) greetings.push(`Happy Friday, ${name}!`);
  else if (day === 5 && hour >= 16) greetings.push(`Happy Weekend, ${name}!`);
  else if (day === 0 || day === 6) greetings.push(`Happy Weekend, ${name}!`);

  return greetings[Math.floor(Math.random() * greetings.length)];
}

function renderGreeting() {
  dom.greeting.textContent = getGreeting();
}

// ══════════════════════════════════════════════════════════════════════
//  QUICK LINKS
// ══════════════════════════════════════════════════════════════════════
function renderQuickLinks() {
  dom.quickLinks.innerHTML = '';
  const frag = document.createDocumentFragment();

  quickLinks.forEach((link, index) => {
    const a = el('a', 'quick-link');
    a.href = link.url;
    a.title = link.name;

    const iconWrap = el('div', 'quick-link-icon');
    const img = document.createElement('img');
    try { img.src = FAVICON_BASE + new URL(link.url).hostname; } catch { img.src = ''; }
    img.alt = '';
    img.loading = 'lazy';
    iconWrap.appendChild(img);

    const removeBtn = el('button', 'quick-link-remove', '×');
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      quickLinks.splice(index, 1);
      saveQuickLinks();
      renderQuickLinks();
    });

    a.append(removeBtn, iconWrap, el('span', 'quick-link-label', link.name));
    frag.appendChild(a);
  });

  const addBtn = el('button', 'quick-link-add');
  addBtn.innerHTML = '<div class="quick-link-add-icon">+</div><span class="quick-link-add-label">Add</span>';
  addBtn.addEventListener('click', () => openQuickLinkModal());
  frag.appendChild(addBtn);

  dom.quickLinks.appendChild(frag);
}

// ══════════════════════════════════════════════════════════════════════
//  DAILY QUOTE
// ══════════════════════════════════════════════════════════════════════
function renderQuote() {
  const q = getDailyQuote();
  dom.quoteText.textContent = `"${q.text}"`;
  dom.quoteAuthor.textContent = `— ${q.author}`;
}

// ══════════════════════════════════════════════════════════════════════
//  VISIBILITY SETTINGS
// ══════════════════════════════════════════════════════════════════════
const TOGGLE_MAP = {
  toggleClock:           'showClock',
  toggleWeather:          'showWeather',
  toggleGreeting:        'showGreeting',
  toggleQuickLinks:     'showQuickLinks',
  toggleRecentSearches: 'showRecentSearches',
  toggleSuggestions:    'showSuggestions',
  toggleQuote:          'showQuote',
  toggleEngineChips:    'showEngineChips',
  toggleWidgetDock:     'showWidgetDock',
  toggleHistoryResults: 'showHistoryResults',
  toggleTopSitesResults:'showTopSitesResults',
  toggleUnsplash:        'useUnsplash',
};

function applyVisibilitySettings() {
  if (dom.clockSection) {
    dom.clockSection.style.display = settings.showClock ? '' : 'none';
  }
  if (dom.weatherWidget) {
    dom.weatherWidget.style.display = settings.showWeather ? 'flex' : 'none';
  }
  dom.greetingSection.style.display = settings.showGreeting ? '' : 'none';
  dom.quickLinks.style.display   = settings.showQuickLinks ? '' : 'none';
  dom.quoteSection.style.display = settings.showQuote ? '' : 'none';
  dom.engineChips.style.display  = settings.showEngineChips ? '' : 'none';
  dom.widgetDock.style.display   = settings.showWidgetDock ? '' : 'none';

  Object.entries(TOGGLE_MAP).forEach(([elId, key]) => {
    const el = $(elId);
    if (el) el.checked = settings[key];
  });

  if (dom.customNameInput) {
    dom.customNameInput.value = settings.customName || '';
  }

  syncRecentSearchesVisibility();
}

function applyLayoutDensity() {
  document.body.dataset.density = settings.layoutDensity || 'balanced';
  dom.densityControl?.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.density === document.body.dataset.density);
  });
}

function applyBackgroundControls() {
  const dim = Number.isFinite(Number(settings.backgroundDim)) ? Number(settings.backgroundDim) : DEFAULT_SETTINGS.backgroundDim;
  const blur = Number.isFinite(Number(settings.backgroundBlur)) ? Number(settings.backgroundBlur) : DEFAULT_SETTINGS.backgroundBlur;
  const position = settings.backgroundPosition || DEFAULT_SETTINGS.backgroundPosition;

  document.documentElement.style.setProperty('--background-dim', `${dim / 100}`);
  document.documentElement.style.setProperty('--background-blur', `${blur}px`);
  document.documentElement.style.setProperty('--background-position', position);

  if (dom.bgDimInput) dom.bgDimInput.value = dim;
  if (dom.bgBlurInput) dom.bgBlurInput.value = blur;
  if (dom.bgPositionSelect) dom.bgPositionSelect.value = position;
}

// ══════════════════════════════════════════════════════════════════════
//  CHIP RENDERING — with pre-computed maxUsage
// ══════════════════════════════════════════════════════════════════════
const COMPACT_ENGINE_IDS = [
  'google',
  'chatgpt',
  'perplexity',
  'github',
  'youtube',
  'reddit',
  'maps',
];

function createEngineChip(engine, maxCount) {
  const chip = el('button', 'engine-chip');
  chip.setAttribute('role', 'radio');
  chip.setAttribute('data-engine', engine.id);

  const isActive = engine.id === activeEngineId;
  chip.setAttribute('aria-checked', isActive ? 'true' : 'false');
  chip.setAttribute('tabindex', isActive ? '0' : '-1');

  chip.appendChild(createEngineIcon(engine, 'chip-favicon-svg'));
  chip.appendChild(document.createTextNode(engine.label));
  chip.appendChild(el('span', 'chip-prefix', engine.prefix));

  const count = usageData[engine.id] || 0;
  if (count > 0 && maxCount > 0) {
    const bar = el('div', 'chip-usage-bar');
    bar.style.transform = `scaleX(${count / maxCount})`;
    chip.appendChild(bar);
  }

  chip.addEventListener('click', () => selectEngine(engine.id));
  return chip;
}

function getCompactEngines(limit = 7) {
  const byId = new Map(ALL_ENGINES.map(engine => [engine.id, engine]));
  const compact = [];
  const seen = new Set();
  const addEngine = (engine) => {
    if (!engine || seen.has(engine.id) || compact.length >= limit) return;
    compact.push(engine);
    seen.add(engine.id);
  };

  addEngine(byId.get(activeEngineId));

  Object.entries(usageData)
    .sort((a, b) => b[1] - a[1])
    .forEach(([engineId]) => addEngine(byId.get(engineId)));

  COMPACT_ENGINE_IDS.forEach(engineId => addEngine(byId.get(engineId)));
  ALL_ENGINES.forEach(addEngine);

  return compact;
}

function createEngineGroup(category, maxCount) {
  const group = el('div', 'engine-group');
  group.appendChild(el('span', 'category-label', category.category));

  const chipsRow = el('div', 'engine-group-chips');
  category.engines.forEach(engine => {
    chipsRow.appendChild(createEngineChip(engine, maxCount));
  });

  group.appendChild(chipsRow);
  return group;
}

function createMoreButtonIcon(isOpen) {
  const icon = el('span', 'engine-more-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = isOpen
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>';
  return icon;
}

function renderChips() {
  dom.engineChips.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const usageValues = Object.values(usageData);
  const maxCount = usageValues.length > 0 ? Math.max(...usageValues) : 0;

  const compactRow = el('div', 'engine-compact-row');
  getCompactEngines().forEach(engine => {
    compactRow.appendChild(createEngineChip(engine, maxCount));
  });

  const moreBtn = el('button', 'engine-more-btn');
  moreBtn.type = 'button';
  moreBtn.setAttribute('aria-expanded', engineCatalogOpen ? 'true' : 'false');
  moreBtn.append(createMoreButtonIcon(engineCatalogOpen), document.createTextNode(engineCatalogOpen ? 'Less' : 'More'));
  moreBtn.addEventListener('click', () => {
    engineCatalogOpen = !engineCatalogOpen;
    renderChips();
    dom.searchInput.focus();
  });
  compactRow.appendChild(moreBtn);
  fragment.appendChild(compactRow);

  if (engineCatalogOpen) {
    const catalog = el('div', 'engine-catalog visible');
    ENGINE_CATEGORIES.forEach(category => {
      if (category.engines.length > 0) {
        catalog.appendChild(createEngineGroup(category, maxCount));
      }
    });
    fragment.appendChild(catalog);
  }

  document.body.classList.toggle('catalog-open', engineCatalogOpen);
  dom.engineChips.appendChild(fragment);
}

// ══════════════════════════════════════════════════════════════════════
//  ENGINE SELECTION
// ══════════════════════════════════════════════════════════════════════
function selectEngine(engineId) {
  if (activeEngineId === engineId) return;
  activeEngineId = engineId;
  saveEngine(engineId);
  renderChips();
  updateLabel();
  updateSearchEnginePrefix();
  dom.searchInput.focus();
}

function updateLabel() {
  const engine = ALL_ENGINES.find(e => e.id === activeEngineId);
  if (engine) dom.engineLabel.textContent = `SEARCH WITH ${engine.label.toUpperCase()}`;
}

// ══════════════════════════════════════════════════════════════════════
//  RECENT SEARCHES
// ══════════════════════════════════════════════════════════════════════
function addRecentSearch(query, engineId) {
  recentSearches = recentSearches.filter(r => r.query !== query);
  recentSearches.unshift({ query, engineId, time: Date.now() });
  if (recentSearches.length > 8) recentSearches.length = 8;
  saveRecentSearches();
}

function syncRecentSearchesVisibility() {
  if (
    settings.showRecentSearches &&
    recentSearches.length > 0 &&
    dom.searchInput.value.trim() === '' &&
    document.activeElement === dom.searchInput
  ) {
    renderRecentSearches();
  } else {
    hideRecentSearches();
  }
}

function renderRecentSearches() {
  if (!settings.showRecentSearches || recentSearches.length === 0) {
    dom.recentSearches.style.display = 'none';
    return;
  }

  dom.recentItems.innerHTML = '';
  const frag = document.createDocumentFragment();

  recentSearches.forEach((item, index) => {
    const chip = el('div', 'recent-item');

    const engine = ALL_ENGINES.find(e => e.id === item.engineId);
    if (engine) chip.appendChild(el('span', 'recent-item-engine', engine.prefix));

    chip.appendChild(document.createTextNode(item.query));

    const remove = el('button', 'recent-item-remove', '×');
    remove.addEventListener('click', (e) => {
      e.stopPropagation();
      recentSearches.splice(index, 1);
      saveRecentSearches();
      renderRecentSearches();
    });
    chip.appendChild(remove);

    chip.addEventListener('click', () => {
      dom.searchInput.value = item.query;
      if (item.engineId && ALL_ENGINES.some(engine => engine.id === item.engineId)) {
        activeEngineId = item.engineId;
      }
      executeSearch();
    });

    frag.appendChild(chip);
  });

  dom.recentItems.appendChild(frag);
  dom.recentSearches.style.display = '';
}

function hideRecentSearches() {
  dom.recentSearches.style.display = 'none';
}

// ══════════════════════════════════════════════════════════════════════
//  USAGE ANALYTICS
// ══════════════════════════════════════════════════════════════════════
function trackUsage(engineId) {
  usageData[engineId] = (usageData[engineId] || 0) + 1;
  saveUsage();
}

function renderUsageStats() {
  dom.usageStats.innerHTML = '';
  const sorted = Object.entries(usageData).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (sorted.length === 0) {
    dom.usageStats.innerHTML = '<p style="font-size:0.75rem;color:var(--text-muted)">No searches yet.</p>';
    return;
  }

  const maxVal = sorted[0][1];
  const frag = document.createDocumentFragment();

  sorted.forEach(([engineId, count]) => {
    const engine = ALL_ENGINES.find(e => e.id === engineId);
    if (!engine) return;

    const row = el('div', 'usage-stat-row');
    const barInner = el('div', 'usage-stat-bar');
    barInner.style.width = `${(count / maxVal) * 100}%`;
    const barBg = el('div', 'usage-stat-bar-bg');
    barBg.appendChild(barInner);
    row.append(el('span', 'usage-stat-label', engine.label), barBg, el('span', 'usage-stat-count', String(count)));
    frag.appendChild(row);
  });

  dom.usageStats.appendChild(frag);
}

// ══════════════════════════════════════════════════════════════════════
//  GOOGLE SEARCH SUGGESTIONS
// ══════════════════════════════════════════════════════════════════════
function fetchSuggestions(query) {
  if (!settings.showSuggestions || query.length < 2) return;

  clearTimeout(suggestDebounceTimer);
  suggestDebounceTimer = setTimeout(async () => {
    const currentQuery = query;
    const [bookmarks, historyItems, topSites, suggestions] = await Promise.all([
      searchBookmarks(currentQuery),
      searchHistory(currentQuery),
      searchTopSites(currentQuery),
      fetchGoogleSuggestions(currentQuery),
    ]);

    // Only render if input hasn't changed since the request was made
    if (dom.searchInput.value.trim() !== currentQuery) return;
    if (bookmarks.length > 0 || historyItems.length > 0 || topSites.length > 0 || suggestions.length > 0) {
      showCombinedDropdown({ bookmarks, historyItems, topSites, suggestions });
    }
  }, 250);
}

function searchBookmarks(query) {
  return new Promise(resolve => {
    try {
      if (!chrome?.bookmarks?.search) { resolve([]); return; }
      chrome.bookmarks.search(query, results => {
        const filtered = (results || [])
          .filter(b => b.url) // Only actual bookmarks, not folders
          .slice(0, 3);       // Smart limit cap at 3
        resolve(filtered);
      });
    } catch { resolve([]); }
  });
}

function searchHistory(query) {
  return new Promise(resolve => {
    if (!settings.showHistoryResults) { resolve([]); return; }
    try {
      if (!chrome?.history?.search) { resolve([]); return; }
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000; // Smart limit last 7 days
      chrome.history.search({ text: query, maxResults: 3, startTime: sevenDaysAgo }, results => {
        resolve((results || []).filter(item => item.url).slice(0, 3));
      });
    } catch { resolve([]); }
  });
}

function searchTopSites(query) {
  return new Promise(resolve => {
    if (!settings.showTopSitesResults) { resolve([]); return; }
    try {
      if (!chrome?.topSites?.get) { resolve([]); return; }
      const needle = query.toLowerCase();
      chrome.topSites.get(results => {
        const filtered = (results || [])
          .filter(item => item.url && `${item.title} ${item.url}`.toLowerCase().includes(needle))
          .slice(0, 3); // Cap at 3 for blended symmetry
        resolve(filtered);
      });
    } catch { resolve([]); }
  });
}

async function fetchGoogleSuggestions(query) {
  try {
    const resp = await fetch(
      `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data[1]) ? data[1].slice(0, 5) : []; // Cap at 5 suggestions
  } catch { return []; }
}

function createUrlDropdownItem(entry, type, badgeText, badgeClass) {
  const item = el('div', `dropdown-item ${type}-item`);

  // Favicon Wrapper
  const favWrapper = el('span', 'dropdown-favicon');
  const favImg = document.createElement('img');
  favImg.alt = '';
  favImg.loading = 'lazy';
  try {
    favImg.src = FAVICON_BASE + new URL(entry.url).hostname;
  } catch {
    favImg.src = '';
  }
  favWrapper.appendChild(favImg);

  // Soft Badge
  const badgeSpan = el('span', `dropdown-badge ${badgeClass}`, badgeText);

  // Label
  const labelSpan = el('span', 'dropdown-label', entry.title || entry.url);

  // Hostname URL
  const urlSpan = el('span', 'dropdown-url');
  try { urlSpan.textContent = new URL(entry.url).hostname; } catch { urlSpan.textContent = ''; }

  item.append(favWrapper, badgeSpan, labelSpan, urlSpan);
  item.addEventListener('click', () => {
    hideDropdown();
    window.location.href = entry.url;
  });

  dropdownItems.push({ type: 'url', url: entry.url });
  return item;
}

function showCombinedDropdown({ bookmarks = [], historyItems = [], topSites = [], suggestions = [] }) {
  dropdownItems = [];
  dropdownIndex = -1;
  dom.dropdown.innerHTML = '';
  const frag = document.createDocumentFragment();

  // Blended & Prioritized List: Bookmarks -> Top Sites -> History -> Google suggestions
  bookmarks.forEach(item => {
    frag.appendChild(createUrlDropdownItem(item, 'bookmark', 'Bookmark', 'badge-bookmark'));
  });

  topSites.forEach(item => {
    frag.appendChild(createUrlDropdownItem(item, 'top-site', 'Top Site', 'badge-topsite'));
  });

  historyItems.forEach(item => {
    frag.appendChild(createUrlDropdownItem(item, 'history', 'History', 'badge-history'));
  });

  suggestions.forEach(text => {
    const item = el('div', 'dropdown-item suggestion-item');
    
    // Suggestion Search Icon
    const favWrapper = el('span', 'dropdown-favicon');
    favWrapper.textContent = '🔍';
    favWrapper.style.fontSize = '0.7rem';
    
    // Suggestion Badge
    const badgeSpan = el('span', 'dropdown-badge badge-suggest', 'Search');
    
    // Suggestion Text
    const labelSpan = el('span', 'dropdown-label', text);

    item.append(favWrapper, badgeSpan, labelSpan);
    item.addEventListener('click', () => {
      dom.searchInput.value = text;
      hideDropdown();
      executeSearch();
    });

    dropdownItems.push({ type: 'suggestion', text });
    frag.appendChild(item);
  });

  dom.dropdown.appendChild(frag);
  dom.dropdown.classList.add('dropdown-visible');
}

// ══════════════════════════════════════════════════════════════════════
//  COMMAND & PREFIX DETECTION
// ══════════════════════════════════════════════════════════════════════
function parseInput(rawValue) {
  const value = rawValue.trimStart();
  if (!value) return { type: 'plain', query: '' };

  const setMatch = value.match(/^set\s+(\S+)\s*$/i);
  if (setMatch) return { type: 'set-command', prefix: setMatch[1].toLowerCase() };
  if (/^set\s*$/i.test(value)) return { type: 'set-partial' };

  const spaceIndex = value.indexOf(' ');
  if (spaceIndex === -1) {
    const lower = value.toLowerCase();
    if (PREFIX_MAP.has(lower)) return { type: 'prefix-only', prefix: lower, engine: PREFIX_MAP.get(lower) };
    const matches = ALL_ENGINES.filter(e =>
      e.prefix.startsWith(lower) || e.label.toLowerCase().startsWith(lower)
    );
    if (matches.length > 0 && lower.length <= 5) return { type: 'partial-prefix', text: lower, matches };
    return { type: 'plain', query: value };
  }

  const firstWord = value.substring(0, spaceIndex).toLowerCase();
  const restQuery = value.substring(spaceIndex + 1);

  if (PREFIX_MAP.has(firstWord)) {
    return { type: 'prefixed-query', prefix: firstWord, engine: PREFIX_MAP.get(firstWord), query: restQuery };
  }

  return { type: 'plain', query: value };
}

function safeEval(str) {
  let pos = 0;
  const chars = str.replace(/\s+/g, '');
  
  function peek() {
    return pos < chars.length ? chars[pos] : null;
  }
  
  function consume(char) {
    if (peek() === char) {
      pos++;
      return true;
    }
    return false;
  }
  
  function parseExpression() {
    let result = parseTerm();
    while (true) {
      if (consume('+')) {
        result += parseTerm();
      } else if (consume('-')) {
        result -= parseTerm();
      } else {
        break;
      }
    }
    return result;
  }
  
  function parseTerm() {
    let result = parseFactor();
    while (true) {
      if (consume('*')) {
        result *= parseFactor();
      } else if (consume('/')) {
        const divisor = parseFactor();
        if (divisor === 0) throw new Error("Division by zero");
        result /= divisor;
      } else {
        break;
      }
    }
    return result;
  }
  
  function parseFactor() {
    if (consume('(')) {
      const result = parseExpression();
      if (!consume(')')) {
        throw new Error("Missing closing parenthesis");
      }
      return result;
    }
    
    let sign = 1;
    if (consume('-')) {
      sign = -1;
    } else if (consume('+')) {
      sign = 1;
    }
    
    let start = pos;
    while (pos < chars.length && /[\d\.]/.test(chars[pos])) {
      pos++;
    }
    
    if (start === pos) {
      throw new Error("Expected a number");
    }
    
    const numStr = chars.substring(start, pos);
    const value = parseFloat(numStr);
    if (isNaN(value)) {
      throw new Error("Invalid number");
    }
    return sign * value;
  }
  
  const val = parseExpression();
  if (pos < chars.length) {
    throw new Error("Unexpected trailing characters");
  }
  return val;
}

function handleInputChange() {
  const value = dom.searchInput.value;
  
  // V3: Inline Calculator (CSP Safe using safeEval)
  if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(value) && /[+\-*/]/.test(value)) {
    try {
      const result = safeEval(value);
      if (!isNaN(result) && result !== Infinity && value.trim() !== result.toString()) {
        showHint(`= ${result}`, 'success');
        hideDropdown();
        hideRecentSearches();
        clearPrefixHighlight();
        return;
      }
    } catch {}
  }

  const parsed = parseInput(value);

  detectedPrefix = null;

  switch (parsed.type) {
    case 'set-command':
      showHint(
        PREFIX_MAP.has(parsed.prefix)
          ? `Press Enter to set ${PREFIX_MAP.get(parsed.prefix).label} as default`
          : `Unknown prefix "${parsed.prefix}"`,
        PREFIX_MAP.has(parsed.prefix) ? 'command' : 'error'
      );
      hideDropdown();
      hideRecentSearches();
      break;

    case 'set-partial':
      showHint('Type a prefix to set as default (e.g. "set gh")', 'info');
      showDropdown(ALL_ENGINES.slice(0, 8), 'set');
      hideRecentSearches();
      break;

    case 'prefix-only':
      detectedPrefix = parsed.prefix;
      showHint(`Search ${parsed.engine.label}...`, 'prefix');
      hideDropdown();
      updatePrefixHighlight();
      hideRecentSearches();
      break;

    case 'partial-prefix':
      showDropdown(parsed.matches, 'search');
      hideHint();
      hideRecentSearches();
      break;

    case 'prefixed-query':
      detectedPrefix = parsed.prefix;
      showHint(`Press Enter to search ${parsed.engine.label}`, 'prefix');
      hideDropdown();
      updatePrefixHighlight();
      hideRecentSearches();
      break;

    default:
      hideDropdown();
      clearPrefixHighlight();
      if (value.trim().length === 0) {
        hideHint();
        syncRecentSearchesVisibility();
      } else {
        hideHint();
        hideRecentSearches();
        fetchSuggestions(value.trim());
      }
      break;
  }
}

// ── Prefix Highlight ─────────────────────────────────────────────────
function updatePrefixHighlight() {
  dom.searchWrapper.classList.add('has-prefix');
  // Swap the search bar icon to the detected prefix engine
  if (detectedPrefix && PREFIX_MAP.has(detectedPrefix)) {
    const engine = PREFIX_MAP.get(detectedPrefix);
    const savedActive = activeEngineId;
    activeEngineId = engine.id;
    updateSearchEnginePrefix();
    activeEngineId = savedActive;
  }
}

function clearPrefixHighlight() {
  dom.searchWrapper.classList.remove('has-prefix');
  // Restore icon back to the actual default engine
  updateSearchEnginePrefix();
}

// ── Hint Bar ─────────────────────────────────────────────────────────
function showHint(message, type = 'info') {
  dom.hintBar.textContent = message;
  dom.hintBar.className = `hint-bar hint-${type} hint-visible`;
}

function flashHint(message, type = 'info', duration = 2000) {
  showHint(message, type);
  setTimeout(hideHint, duration);
}

function hideHint() {
  dom.hintBar.classList.remove('hint-visible');
}

// ══════════════════════════════════════════════════════════════════════
//  AUTOCOMPLETE DROPDOWN
// ══════════════════════════════════════════════════════════════════════
function showDropdown(engines, mode = 'search') {
  dropdownItems = engines.slice(0, 8);
  dropdownIndex = -1;
  dom.dropdown.innerHTML = '';
  const fragment = document.createDocumentFragment();

  dropdownItems.forEach((engine, index) => {
    const item = el('div', 'dropdown-item');
    item.setAttribute('data-index', index);

    item.append(
      el('span', 'dropdown-prefix', engine.prefix),
      el('span', 'dropdown-label', engine.label),
      el('span', 'dropdown-action', mode === 'set' ? 'set default' : 'search')
    );

    item.addEventListener('click', () => {
      if (mode === 'set') {
        selectEngine(engine.id);
        dom.searchInput.value = '';
        flashHint(`${engine.label} set as default!`, 'success');
      } else {
        dom.searchInput.value = engine.prefix + ' ';
        dom.searchInput.focus();
        handleInputChange();
      }
      hideDropdown();
    });

    fragment.appendChild(item);
  });

  dom.dropdown.appendChild(fragment);
  dom.dropdown.classList.add('dropdown-visible');
}

function hideDropdown() {
  dom.dropdown.classList.remove('dropdown-visible');
  dropdownItems = [];
  dropdownIndex = -1;
}

function navigateDropdown(direction) {
  if (dropdownItems.length === 0) return false;
  const items = dom.dropdown.querySelectorAll('.dropdown-item');
  dropdownIndex = direction === 'down'
    ? (dropdownIndex + 1) % dropdownItems.length
    : (dropdownIndex <= 0 ? dropdownItems.length - 1 : dropdownIndex - 1);
  items.forEach((item, i) => item.classList.toggle('dropdown-item-active', i === dropdownIndex));
  return true;
}

function selectDropdownItem() {
  if (dropdownIndex < 0 || dropdownIndex >= dropdownItems.length) return false;
  const selected = dropdownItems[dropdownIndex];
  if (selected.type === 'url' || selected.type === 'bookmark') {
    hideDropdown();
    window.location.href = selected.url;
  } else if (selected.type === 'suggestion') {
    dom.searchInput.value = selected.text;
    hideDropdown();
    executeSearch();
  } else {
    dom.searchInput.value = selected.prefix + ' ';
    dom.searchInput.focus();
    hideDropdown();
    handleInputChange();
  }
  return true;
}

// ══════════════════════════════════════════════════════════════════════
//  SEARCH EXECUTION
// ══════════════════════════════════════════════════════════════════════
function executeSearch(multiSearch = false) {
  const value = dom.searchInput.value.trimStart();
  if (!value) return;

  const parsed = parseInput(value);

  switch (parsed.type) {
    case 'set-command':
      if (PREFIX_MAP.has(parsed.prefix)) {
        const engine = PREFIX_MAP.get(parsed.prefix);
        selectEngine(engine.id);
        dom.searchInput.value = '';
        flashHint(`✓ ${engine.label} is now your default!`, 'success', 2500);
        hideDropdown();
        clearPrefixHighlight();
      } else {
        flashHint(`Unknown prefix "${parsed.prefix}"`, 'error');
      }
      return;

    case 'prefix-only':
      flashHint(`Type a query after "${parsed.prefix}" to search`, 'info', 3000);
      return;

    case 'prefixed-query': {
      trackUsage(parsed.engine.id);
      addRecentSearch(parsed.query, parsed.engine.id);
      const url = parsed.engine.url + encodeURIComponent(parsed.query);
      multiSearch ? openMultiSearch(parsed.query, parsed.engine.id) : (window.location.href = url);
      return;
    }

    default: {
      const engine = ALL_ENGINES.find(e => e.id === activeEngineId);
      if (!engine) return;
      const query = parsed.query || value;
      trackUsage(engine.id);
      addRecentSearch(query, engine.id);
      const url = engine.url + encodeURIComponent(query);
      multiSearch ? openMultiSearch(query, engine.id) : (window.location.href = url);
      return;
    }
  }
}

// ══════════════════════════════════════════════════════════════════════
//  MULTI-SEARCH
// ══════════════════════════════════════════════════════════════════════
function openMultiSearch(query, primaryEngineId) {
  const q = encodeURIComponent(query);
  const primary = ALL_ENGINES.find(e => e.id === primaryEngineId);
  
  // Find which category the primary engine belongs to
  let categoryEngines = [];
  for (const cat of ENGINE_CATEGORIES) {
    if (cat.engines.some(e => e.id === primaryEngineId)) {
      categoryEngines = cat.engines.map(e => e.id);
      break;
    }
  }

  // Use other engines in the same category
  let secondaryIds = categoryEngines.filter(id => id !== primaryEngineId);

  // Fallback to defaults if the category has no other engines (like a lone Custom engine)
  if (secondaryIds.length === 0) {
    secondaryIds = ['google', 'chatgpt', 'perplexity'].filter(id => id !== primaryEngineId);
  }

  // Open secondaries FIRST (before navigating current tab away)
  secondaryIds.forEach(id => {
    const engine = ALL_ENGINES.find(e => e.id === id);
    if (engine) {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url: engine.url + q, active: false });
      } else {
        window.open(engine.url + q, '_blank');
      }
    }
  });

  // Then navigate current tab
  if (primary) window.location.href = primary.url + q;
}

// ══════════════════════════════════════════════════════════════════════
//  KEYBOARD NAVIGATION
// ══════════════════════════════════════════════════════════════════════
function getActivePosition() {
  for (let c = 0; c < ENGINE_CATEGORIES.length; c++) {
    const engines = ENGINE_CATEGORIES[c].engines;
    for (let e = 0; e < engines.length; e++) {
      if (engines[e].id === activeEngineId) return { catIndex: c, engineIndex: e };
    }
  }
  return { catIndex: 0, engineIndex: 0 };
}

function navigateHorizontal(direction) {
  if (!engineCatalogOpen) {
    const compactEngines = getCompactEngines();
    const index = compactEngines.findIndex(e => e.id === activeEngineId);
    if (index === -1) return;
    const next = direction === 'right'
      ? (index + 1) % compactEngines.length
      : (index - 1 + compactEngines.length) % compactEngines.length;
    selectEngine(compactEngines[next].id);
  } else {
    const pos = getActivePosition();
    const engines = ENGINE_CATEGORIES[pos.catIndex].engines;
    const next = direction === 'right'
      ? (pos.engineIndex + 1) % engines.length
      : (pos.engineIndex - 1 + engines.length) % engines.length;
    selectEngine(engines[next].id);
  }
}

function navigateVertical(direction) {
  if (!engineCatalogOpen) return; // Do nothing if catalog is closed
  const pos = getActivePosition();
  const nextCat = direction === 'down'
    ? (pos.catIndex + 1) % ENGINE_CATEGORIES.length
    : (pos.catIndex - 1 + ENGINE_CATEGORIES.length) % ENGINE_CATEGORIES.length;
  const nextEngines = ENGINE_CATEGORIES[nextCat].engines;
  selectEngine(nextEngines[Math.min(pos.engineIndex, nextEngines.length - 1)].id);
}

// ══════════════════════════════════════════════════════════════════════
//  STICKY NOTES (lazy-initialized on first open)
// ══════════════════════════════════════════════════════════════════════
function initNotes() {
  if (notesInitialized) return;
  notesInitialized = true;

  const saved = safeGetRaw(STORAGE_KEYS.notes, '');
  dom.notesTextarea.value = saved;

  let debounce;
  dom.notesTextarea.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => safeSetRaw(STORAGE_KEYS.notes, dom.notesTextarea.value), 300);
  });
}

function toggleNotes() {
  const isVisible = !dom.notesPanel.classList.contains('visible');
  closeWidgetPanels(isVisible ? 'notes' : '');
  dom.notesPanel.classList.toggle('visible', isVisible);
  dom.notesToggle.classList.toggle('active', isVisible);
  if (isVisible) {
    initNotes();
    dom.notesTextarea.focus();
  }
}

// ══════════════════════════════════════════════════════════════════════
//  POMODORO TIMER
// ══════════════════════════════════════════════════════════════════════
function updateTimerDisplay() {
  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const secs = String(timerSeconds % 60).padStart(2, '0');
  dom.timerDisplay.textContent = `${mins}:${secs}`;
  dom.timerDisplay.classList.toggle('timer-running', timerRunning);
  dom.timerDisplay.classList.toggle('timer-done', timerSeconds === 0 && !timerRunning);
}

function startTimer() {
  if (timerSeconds === 0) return;
  timerRunning = true;
  dom.timerStartBtn.textContent = 'Pause';

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      dom.timerStartBtn.textContent = 'Start';
      playTimerBeep();
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  dom.timerStartBtn.textContent = 'Start';
  updateTimerDisplay();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = timerPreset * 60;
  dom.timerStartBtn.textContent = 'Start';
  updateTimerDisplay();
}

function setTimerPreset(minutes) {
  timerPreset = minutes;
  timerSeconds = minutes * 60;
  clearInterval(timerInterval);
  timerRunning = false;
  dom.timerStartBtn.textContent = 'Start';
  updateTimerDisplay();
  document.querySelectorAll('.timer-preset').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
  });
}

function playTimerBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.2, 0.4].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.15;
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  } catch {}
}

function toggleTimer() {
  const isVisible = !dom.timerPanel.classList.contains('visible');
  closeWidgetPanels(isVisible ? 'timer' : '');
  dom.timerPanel.classList.toggle('visible', isVisible);
  dom.timerToggle.classList.toggle('active', isVisible);
}

// ══════════════════════════════════════════════════════════════════════
//  SETTINGS PANEL
// ══════════════════════════════════════════════════════════════════════
function openSettings() {
  dom.settingsPanel.classList.add('open');
  dom.settingsOverlay.classList.add('visible');
  activateSettingsTab(getActiveSettingsTab() || 'appearance');
  renderSettingsQuickLinks();
  renderSettingsCustomEngines();
  renderUsageStats();
}

function closeSettings() {
  dom.settingsPanel.classList.remove('open');
  dom.settingsOverlay.classList.remove('visible');
}

function getActiveSettingsTab() {
  return dom.settingsTabs?.querySelector('.settings-tab.active')?.dataset.settingsTab;
}

function activateSettingsTab(tabId) {
  if (!tabId) return;

  dom.settingsTabs.querySelectorAll('.settings-tab').forEach(tab => {
    const isActive = tab.dataset.settingsTab === tabId;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  dom.settingsPanel.querySelectorAll('[data-settings-panel]').forEach(panel => {
    panel.hidden = panel.dataset.settingsPanel !== tabId;
  });
}

function moveArrayItem(items, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) return false;

  const [item] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, item);
  return true;
}

function createManagerButton(label, title, onClick, disabled = false) {
  const button = el('button', 'manager-action-btn', label);
  button.type = 'button';
  button.title = title;
  button.setAttribute('aria-label', title);
  button.disabled = disabled;
  button.addEventListener('click', onClick);
  return button;
}

function createManagerActions(actions) {
  const wrapper = el('div', 'manager-actions');
  actions.forEach(action => {
    wrapper.appendChild(createManagerButton(action.label, action.title, action.onClick, action.disabled));
  });
  return wrapper;
}

function bindManagerDrag(row, type, index, onMove) {
  row.draggable = true;
  row.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.setData('application/x-nexus-manager', type);
    row.classList.add('is-dragging');
  });
  row.addEventListener('dragend', () => {
    row.classList.remove('is-dragging');
    row.classList.remove('is-drag-over');
  });
  row.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    row.classList.add('is-drag-over');
  });
  row.addEventListener('dragleave', () => {
    row.classList.remove('is-drag-over');
  });
  row.addEventListener('drop', (e) => {
    e.preventDefault();
    row.classList.remove('is-drag-over');
    if (e.dataTransfer.getData('application/x-nexus-manager') !== type) return;
    const fromIndex = Number(e.dataTransfer.getData('text/plain'));
    onMove(fromIndex, index);
  });
}

function refreshQuickLinksManager() {
  saveQuickLinks();
  renderQuickLinks();
  renderSettingsQuickLinks();
}

function moveQuickLink(fromIndex, toIndex) {
  if (!moveArrayItem(quickLinks, fromIndex, toIndex)) return;
  refreshQuickLinksManager();
}

function refreshCustomEnginesManager() {
  saveCustomEngines();
  loadCustomEngines();
  ensureActiveEngineExists();
  renderChips();
  updateLabel();
  updateSearchEnginePrefix();
  renderSettingsCustomEngines();
}

function moveCustomEngine(fromIndex, toIndex) {
  if (!moveArrayItem(customEngines, fromIndex, toIndex)) return;
  refreshCustomEnginesManager();
}

function ensureActiveEngineExists() {
  if (ALL_ENGINES.some(engine => engine.id === activeEngineId)) return;
  activeEngineId = DEFAULT_ENGINE;
  saveEngine(activeEngineId);
}

function removeCustomEngine(index) {
  const [removed] = customEngines.splice(index, 1);
  if (removed && activeEngineId === `custom-${removed.prefix}`) {
    activeEngineId = DEFAULT_ENGINE;
    saveEngine(activeEngineId);
  }
  refreshCustomEnginesManager();
}

function renderSettingsQuickLinks() {
  dom.quickLinksManager.innerHTML = '';
  const frag = document.createDocumentFragment();

  quickLinks.forEach((link, i) => {
    const row = el('div', 'ql-manager-item');
    bindManagerDrag(row, 'quick-link', i, moveQuickLink);

    const content = el('div', 'manager-item-content');

    try {
      const icon = document.createElement('img');
      icon.src = FAVICON_BASE + new URL(link.url).hostname;
      icon.alt = '';
      icon.loading = 'lazy';
      content.appendChild(icon);
    } catch {}

    content.appendChild(el('span', 'manager-item-name', link.name));

    row.append(
      content,
      createManagerActions([
        { label: 'Edit', title: `Edit ${link.name}`, onClick: () => openQuickLinkModal(i) },
        { label: 'Up', title: `Move ${link.name} up`, onClick: () => moveQuickLink(i, i - 1), disabled: i === 0 },
        { label: 'Down', title: `Move ${link.name} down`, onClick: () => moveQuickLink(i, i + 1), disabled: i === quickLinks.length - 1 },
        {
          label: 'Remove',
          title: `Remove ${link.name}`,
          onClick: () => {
            quickLinks.splice(i, 1);
            refreshQuickLinksManager();
          },
        },
      ])
    );
    frag.appendChild(row);
  });

  dom.quickLinksManager.appendChild(frag);
}

function renderSettingsCustomEngines() {
  dom.customEnginesManager.innerHTML = '';
  const frag = document.createDocumentFragment();

  customEngines.forEach((ce, i) => {
    const row = el('div', 'ce-manager-item');
    bindManagerDrag(row, 'custom-engine', i, moveCustomEngine);

    const content = el('div', 'manager-item-content');
    content.append(el('span', 'ce-prefix', ce.prefix), el('span', 'ce-name', ce.name));
    row.append(
      content,
      createManagerActions([
        { label: 'Edit', title: `Edit ${ce.name}`, onClick: () => openEngineModal(i) },
        { label: 'Up', title: `Move ${ce.name} up`, onClick: () => moveCustomEngine(i, i - 1), disabled: i === 0 },
        { label: 'Down', title: `Move ${ce.name} down`, onClick: () => moveCustomEngine(i, i + 1), disabled: i === customEngines.length - 1 },
        {
          label: 'Remove',
          title: `Remove ${ce.name}`,
          onClick: () => removeCustomEngine(i),
        },
      ])
    );
    frag.appendChild(row);
  });

  dom.customEnginesManager.appendChild(frag);
}

// ══════════════════════════════════════════════════════════════════════
//  MODALS
// ══════════════════════════════════════════════════════════════════════
function openQuickLinkModal(editIndex = -1) {
  const nameInput = $('qlName');
  const urlInput = $('qlUrl');
  const title = $('quickLinkModalTitle');

  if (editIndex >= 0) {
    title.textContent = 'Edit Quick Link';
    nameInput.value = quickLinks[editIndex].name;
    urlInput.value = quickLinks[editIndex].url;
  } else {
    title.textContent = 'Add Quick Link';
    nameInput.value = '';
    urlInput.value = '';
  }

  dom.quickLinkModal.style.display = 'flex';
  nameInput.focus();

  $('qlSave').onclick = () => {
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    if (!name || !url) return;
    if (!url.startsWith('http')) url = 'https://' + url;

    if (editIndex >= 0) {
      quickLinks[editIndex] = { name, url };
    } else {
      quickLinks.push({ name, url });
    }
    saveQuickLinks();
    renderQuickLinks();
    renderSettingsQuickLinks();
    dom.quickLinkModal.style.display = 'none';
  };

  $('qlCancel').onclick = () => { dom.quickLinkModal.style.display = 'none'; };
}

function openEngineModal(editIndex = -1) {
  const nameInput = $('ceName');
  const prefixInput = $('cePrefix');
  const urlInput = $('ceUrl');
  const title = $('engineModalTitle');
  const editingEngine = editIndex >= 0 ? customEngines[editIndex] : null;

  if (editingEngine) {
    title.textContent = 'Edit Custom Engine';
    nameInput.value = editingEngine.name;
    prefixInput.value = editingEngine.prefix;
    urlInput.value = editingEngine.url;
  } else {
    title.textContent = 'Add Custom Engine';
    nameInput.value = '';
    prefixInput.value = '';
    urlInput.value = '';
  }

  dom.engineModal.style.display = 'flex';
  nameInput.focus();

  $('ceSave').onclick = () => {
    const name = nameInput.value.trim();
    const prefix = prefixInput.value.trim().toLowerCase();
    let url = urlInput.value.trim();
    if (!name || !prefix || !url) return;

    const existingEngine = PREFIX_MAP.get(prefix);
    const ownsPrefix = editingEngine && existingEngine?.id === `custom-${editingEngine.prefix}`;
    if (existingEngine && !ownsPrefix) {
      alert(`Prefix "${prefix}" is already in use.`);
      return;
    }
    if (!url.startsWith('http')) url = 'https://' + url;

    if (editingEngine) {
      const oldEngineId = `custom-${editingEngine.prefix}`;
      customEngines[editIndex] = { name, prefix, url };
      if (activeEngineId === oldEngineId) {
        activeEngineId = `custom-${prefix}`;
        saveEngine(activeEngineId);
      }
    } else {
      customEngines.push({ name, prefix, url });
    }

    refreshCustomEnginesManager();
    dom.engineModal.style.display = 'none';
  };

  $('ceCancel').onclick = () => { dom.engineModal.style.display = 'none'; };
}

// ══════════════════════════════════════════════════════════════════════
//  IMPORT / EXPORT
// ══════════════════════════════════════════════════════════════════════
function collectBackupData() {
  const data = {};
  Object.values(STORAGE_KEYS).forEach(storageKey => {
    try {
      const val = localStorage.getItem(storageKey);
      if (val !== null) data[storageKey] = val;  // Store raw to avoid double-encoding
    } catch {}
  });

  return data;
}

function downloadBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nexus-tab-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  flashHint('Settings exported!', 'success');
}

async function exportSettings() {
  try {
    const data = collectBackupData();
    try {
      const backgroundImage = await readBackgroundImage();
      if (backgroundImage) data[BACKGROUND_DB.backupKey] = backgroundImage;
    } catch {}
    downloadBackup(data);
  } catch {
    flashHint('Could not export settings', 'error');
  }
}

function writeImportedSettingsValue(key, value) {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

function readImportedSettingsValue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setImportedBackgroundFlag(hasBackground) {
  const importedSettings = readImportedSettingsValue();
  localStorage.setItem(
    STORAGE_KEYS.settings,
    JSON.stringify({ ...DEFAULT_SETTINGS, ...importedSettings, hasBackground })
  );
}

function importSettings(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const backgroundImage = data[BACKGROUND_DB.backupKey];
      delete data[BACKGROUND_DB.backupKey];

      Object.entries(data).forEach(([key, value]) => {
        writeImportedSettingsValue(key, value);
      });

      if (typeof backgroundImage === 'string' && backgroundImage) {
        await writeBackgroundImage(backgroundImage);
        setImportedBackgroundFlag(true);
      } else if (data[STORAGE_KEYS.settings]) {
        await deleteBackgroundImage();
        setImportedBackgroundFlag(false);
      }

      showHint('Settings imported! Reloading...', 'success');
      setTimeout(() => location.reload(), 1000);
    } catch {
      flashHint('Invalid backup file', 'error');
    }
  };
  reader.readAsText(file);
}

async function clearAllData() {
  if (!confirm('Clear all Nexus Tab data? This cannot be undone.')) return;
  Object.values(STORAGE_KEYS).forEach(removeStoredValue);
  try { await deleteBackgroundImage(); } catch {}
  showHint('All data cleared! Reloading...', 'success');
  setTimeout(() => location.reload(), 1000);
}

// ══════════════════════════════════════════════════════════════════════
//  COMMAND PALETTE & HELP
// ══════════════════════════════════════════════════════════════════════
function getCommandDefinitions() {
  const baseCommands = [
    { label: 'Focus Search', hint: '/', keywords: 'search focus input', action: () => dom.searchInput.focus() },
    { label: 'Open Appearance Settings', hint: 'settings', keywords: 'theme density background appearance', action: () => { openSettings(); activateSettingsTab('appearance'); } },
    { label: 'Open Links Settings', hint: 'settings', keywords: 'quick links shortcuts', action: () => { openSettings(); activateSettingsTab('links'); } },
    { label: 'Open Engine Settings', hint: 'settings', keywords: 'custom engines search stats', action: () => { openSettings(); activateSettingsTab('engines'); } },
    { label: 'Open Data Settings', hint: 'settings', keywords: 'export import backup clear', action: () => { openSettings(); activateSettingsTab('data'); } },
    { label: 'Toggle Engine Catalog', hint: 'engines', keywords: 'more engines catalog', action: () => { engineCatalogOpen = !engineCatalogOpen; renderChips(); } },
    { label: 'Open Notes', hint: 'widget', keywords: 'notes memo', action: () => { if (!dom.notesPanel.classList.contains('visible')) toggleNotes(); } },
    { label: 'Open Timer', hint: 'widget', keywords: 'pomodoro focus timer', action: () => { if (!dom.timerPanel.classList.contains('visible')) toggleTimer(); } },
    { label: 'Open Tasks', hint: 'widget', keywords: 'todo tasks checklist', action: () => { if (!dom.todoPanel.classList.contains('visible')) toggleTodoWidget(); } },
    {
      label: 'Clear Recent Searches',
      hint: 'recent',
      keywords: 'history recent clear',
      action: () => {
        recentSearches = [];
        saveRecentSearches();
        hideRecentSearches();
        flashHint('Recent searches cleared', 'success', 1800);
      },
    },
    { label: 'Export Backup', hint: 'data', keywords: 'export backup settings', action: exportSettings },
    { label: 'Show Help', hint: 'help', keywords: 'onboarding guide shortcuts', action: () => openHelp(false) },
  ];

  const densityCommands = ['compact', 'balanced', 'spacious'].map(density => ({
    label: `Set ${density[0].toUpperCase() + density.slice(1)} Density`,
    hint: 'layout',
    keywords: `layout density ${density}`,
    action: () => {
      settings.layoutDensity = density;
      saveSettings();
      applyLayoutDensity();
      flashHint(`${density[0].toUpperCase() + density.slice(1)} density applied`, 'success', 1800);
    },
  }));

  const engineCommands = ALL_ENGINES.map(engine => ({
    label: `Use ${engine.label}`,
    hint: engine.prefix,
    keywords: `engine search ${engine.label} ${engine.prefix}`,
    action: () => {
      selectEngine(engine.id);
      flashHint(`${engine.label} selected`, 'success', 1800);
    },
  }));

  return [...baseCommands, ...densityCommands, ...engineCommands];
}

function openCommandPalette() {
  commandIndex = -1;
  dom.commandOverlay.style.display = 'flex';
  dom.commandInput.value = '';
  renderCommandPalette();
  setTimeout(() => dom.commandInput.focus(), 0);
}

function closeCommandPalette() {
  dom.commandOverlay.style.display = 'none';
  commandIndex = -1;
  commandItems = [];
  dom.commandResults.innerHTML = '';
}

function renderCommandPalette() {
  const query = dom.commandInput.value.trim().toLowerCase();
  commandItems = getCommandDefinitions()
    .filter(command => !query || `${command.label} ${command.hint} ${command.keywords}`.toLowerCase().includes(query))
    .slice(0, 10);
  commandIndex = commandItems.length > 0 ? Math.max(0, Math.min(commandIndex, commandItems.length - 1)) : -1;

  dom.commandResults.innerHTML = '';
  const frag = document.createDocumentFragment();
  commandItems.forEach((command, index) => {
    const item = el('button', `command-item ${index === commandIndex ? 'active' : ''}`);
    item.type = 'button';
    item.append(el('span', null, command.label), el('kbd', null, command.hint));
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      executeCommand(index);
    });
    frag.appendChild(item);
  });

  if (commandItems.length === 0) {
    frag.appendChild(el('div', 'command-empty', 'No commands found'));
  }

  dom.commandResults.appendChild(frag);
}

function executeCommand(index = commandIndex) {
  const command = commandItems[index];
  if (!command) return;
  closeCommandPalette();
  command.action();
}

function handleCommandKeydown(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      commandIndex = commandItems.length ? (commandIndex + 1) % commandItems.length : -1;
      renderCommandPalette();
      break;
    case 'ArrowUp':
      e.preventDefault();
      commandIndex = commandItems.length ? (commandIndex <= 0 ? commandItems.length - 1 : commandIndex - 1) : -1;
      renderCommandPalette();
      break;
    case 'Enter':
      e.preventDefault();
      executeCommand();
      break;
    case 'Escape':
      e.preventDefault();
      closeCommandPalette();
      break;
  }
}

function openHelp(isFirstRun = false) {
  dom.helpOverlay.style.display = 'flex';
  dom.helpStartBtn.textContent = isFirstRun ? 'Start Using Nexus' : 'Done';
}

function closeHelp() {
  dom.helpOverlay.style.display = 'none';
  if (!settings.hasSeenOnboarding) {
    settings.hasSeenOnboarding = true;
    saveSettings();
  }
  dom.searchInput.focus();
}

function maybeShowOnboarding() {
  if (!settings.hasSeenOnboarding && !isIncognito) {
    openHelp(true);
  }
}

function handleInitialHash() {
  if (location.hash === '#settings') {
    openSettings();
    history.replaceState(null, '', location.pathname);
  } else if (location.hash === '#help') {
    openHelp(false);
    history.replaceState(null, '', location.pathname);
  }
}

// ══════════════════════════════════════════════════════════════════════
//  EVENT BINDING — single consolidated document click handler
// ══════════════════════════════════════════════════════════════════════
function bindEvents() {
  // Search input
  dom.searchInput.addEventListener('input', handleInputChange);
  dom.searchInput.addEventListener('focus', syncRecentSearchesVisibility);

  // Search keyboard
  dom.searchInput.addEventListener('keydown', handleSearchKeydown);

  // Single document click handler for all dismissals
  document.addEventListener('click', handleDocumentClick);

  // Single global keydown for non-search shortcuts
  document.addEventListener('keydown', handleGlobalKeydown);

  // Command palette
  dom.commandInput.addEventListener('input', renderCommandPalette);
  dom.commandInput.addEventListener('keydown', handleCommandKeydown);
  dom.commandOverlay.addEventListener('click', (e) => {
    if (e.target === dom.commandOverlay) closeCommandPalette();
  });

  // Clear recent
  dom.clearRecent.addEventListener('click', () => {
    recentSearches = [];
    saveRecentSearches();
    hideRecentSearches();
  });

  // Settings panel
  dom.settingsBtn.addEventListener('click', openSettings);
  dom.settingsClose.addEventListener('click', closeSettings);
  dom.settingsOverlay.addEventListener('click', closeSettings);
  dom.settingsTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.settings-tab');
    if (tab) activateSettingsTab(tab.dataset.settingsTab);
  });
  dom.helpBtn.addEventListener('click', () => openHelp(false));
  dom.helpClose.addEventListener('click', closeHelp);
  dom.helpStartBtn.addEventListener('click', closeHelp);
  dom.helpOverlay.addEventListener('click', (e) => {
    if (e.target === dom.helpOverlay) closeHelp();
  });

  // Color picker (delegated)
  dom.colorPicker.addEventListener('click', (e) => {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;
    settings.accentColor = swatch.dataset.color;
    settings.accentHex = swatch.dataset.hex;
    saveSettings();
    applyAccentColor();
    updateSearchEnginePrefix();
    renderChips();
  });

  // Display toggles
  Object.entries(TOGGLE_MAP).forEach(([elId, key]) => {
    const el = $(elId);
    if (el) el.addEventListener('change', () => {
      settings[key] = el.checked;
      saveSettings();
      applyVisibilitySettings();
    });
  });

  if (dom.customNameInput) {
    dom.customNameInput.addEventListener('input', () => {
      settings.customName = dom.customNameInput.value.trim();
      saveSettings();
      renderGreeting();
    });
  }

  const unsplashToggle = $('toggleUnsplash');
  if (unsplashToggle) {
    unsplashToggle.addEventListener('change', () => {
      loadBackground();
    });
  }

  dom.densityControl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-density]');
    if (!btn) return;
    settings.layoutDensity = btn.dataset.density;
    saveSettings();
    applyLayoutDensity();
  });

  dom.bgDimInput.addEventListener('input', () => {
    settings.backgroundDim = Number(dom.bgDimInput.value);
    saveSettings();
    applyBackgroundControls();
  });

  dom.bgBlurInput.addEventListener('input', () => {
    settings.backgroundBlur = Number(dom.bgBlurInput.value);
    saveSettings();
    applyBackgroundControls();
  });

  dom.bgPositionSelect.addEventListener('change', () => {
    settings.backgroundPosition = dom.bgPositionSelect.value;
    saveSettings();
    applyBackgroundControls();
  });

  // Settings buttons
  $('addQuickLinkBtn').addEventListener('click', () => openQuickLinkModal());
  $('addCustomEngineBtn').addEventListener('click', () => openEngineModal());
  $('exportBtn').addEventListener('click', exportSettings);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importSettings(e.target.files[0]); });
  $('clearDataBtn').addEventListener('click', clearAllData);

  // Widgets
  dom.notesToggle.addEventListener('click', toggleNotes);
  dom.timerToggle.addEventListener('click', toggleTimer);
  dom.timerStartBtn.addEventListener('click', () => timerRunning ? pauseTimer() : startTimer());
  dom.timerResetBtn.addEventListener('click', resetTimer);
  document.querySelectorAll('.timer-preset').forEach(btn => {
    btn.addEventListener('click', () => setTimerPreset(parseInt(btn.dataset.minutes)));
  });
  updateTimerDisplay();

  // V3 Widget Bindings
  dom.todoToggle.addEventListener('click', toggleTodoWidget);
  dom.todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = dom.todoInput.value.trim();
    if (text) {
      todos.push({ text, completed: false });
      saveTodos();
      dom.todoInput.value = '';
      renderTodos();
    }
  });

  dom.uploadBgBtn.addEventListener('click', () => dom.bgInput.click());
  dom.clearBgBtn.addEventListener('click', clearBackground);
  dom.bgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => saveBackground(ev.target.result);
    reader.readAsDataURL(file);
  });
  dom.toggleLightMode.addEventListener('change', () => {
    settings.lightMode = dom.toggleLightMode.checked;
    saveSettings();
    applyTheme();
  });

  // Modal overlay dismiss
  dom.quickLinkModal.addEventListener('click', (e) => {
    if (e.target === dom.quickLinkModal) dom.quickLinkModal.style.display = 'none';
  });
  dom.engineModal.addEventListener('click', (e) => {
    if (e.target === dom.engineModal) dom.engineModal.style.display = 'none';
  });

  // Weather Settings Bindings
  if (dom.weatherLocationSearchBtn) {
    dom.weatherLocationSearchBtn.addEventListener('click', searchWeatherLocation);
  }
  if (dom.weatherLocationInput) {
    dom.weatherLocationInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchWeatherLocation();
      }
    });
  }
  if (dom.weatherUnitControl) {
    dom.weatherUnitControl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-unit]');
      if (!btn) return;
      settings.weatherUnit = btn.dataset.unit;
      saveSettings();
      
      // Update visual active classes
      dom.weatherUnitControl.querySelectorAll('button').forEach(b => {
        b.classList.toggle('active', b.dataset.unit === settings.weatherUnit);
      });
      
      // Re-render widget using cache
      renderWeatherFromCache();
    });
  }
}

// ── Consolidated click handler ───────────────────────────────────────
function isOverlayOpen(element) {
  return element && window.getComputedStyle(element).display !== 'none';
}

function handleDocumentClick(e) {
  if (isOverlayOpen(dom.commandOverlay) || isOverlayOpen(dom.helpOverlay)) return;

  // Close dropdown + recent searches when clicking outside search area
  if (!dom.searchWrapper.contains(e.target) && !dom.recentSearches.contains(e.target)) {
    hideDropdown();
    hideRecentSearches();
  }

  if (!dom.widgetDock.contains(e.target)) closeWidgetPanels();
}

// ── Search keydown handler ───────────────────────────────────────────
function handleSearchKeydown(e) {
  const inputEmpty = dom.searchInput.value.trim() === '';
  const dropdownVisible = dom.dropdown.classList.contains('dropdown-visible');

  // Dropdown navigation takes priority
  if (dropdownVisible) {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); navigateDropdown('down'); return;
      case 'ArrowUp':   e.preventDefault(); navigateDropdown('up'); return;
      case 'Tab':       e.preventDefault(); selectDropdownItem(); return;
      case 'Escape':    e.preventDefault(); hideDropdown(); return;
      case 'Enter':
        if (dropdownIndex >= 0 && selectDropdownItem()) { e.preventDefault(); return; }
        break;
    }
  }

  // Arrow-key engine navigation (empty input, no dropdown)
  if (inputEmpty && !dropdownVisible) {
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); navigateHorizontal('right'); return;
      case 'ArrowLeft':  e.preventDefault(); navigateHorizontal('left'); return;
      case 'ArrowDown':  e.preventDefault(); navigateVertical('down'); return;
      case 'ArrowUp':    e.preventDefault(); navigateVertical('up'); return;
    }
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    executeSearch(e.shiftKey);
    return;
  }

  if (e.key === 'Escape' && !dropdownVisible) {
    dom.searchInput.value = '';
    hideHint();
    clearPrefixHighlight();
    hideRecentSearches();
    handleInputChange();
  }
}

// ── Global keydown handler ───────────────────────────────────────────
function handleGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCommandPalette();
    return;
  }

  if (e.key === 'Escape') {
    if (isOverlayOpen(dom.commandOverlay)) { closeCommandPalette(); return; }
    if (isOverlayOpen(dom.helpOverlay)) { closeHelp(); return; }
  }

  const isInputElement = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
  if (isInputElement) return;

  if (e.key === '/') {
    e.preventDefault();
    dom.searchInput.focus();
    return;
  }

  switch (e.key) {
    case 'ArrowRight': e.preventDefault(); navigateHorizontal('right'); return;
    case 'ArrowLeft':  e.preventDefault(); navigateHorizontal('left'); return;
    case 'ArrowDown':  e.preventDefault(); navigateVertical('down'); return;
    case 'ArrowUp':    e.preventDefault(); navigateVertical('up'); return;
  }
}

// ══════════════════════════════════════════════════════════════════════
//  V3 FEATURES (THEME, TODO, BACKGROUND)
// ══════════════════════════════════════════════════════════════════════
function applyTheme() {
  document.body.classList.toggle('theme-light', settings.lightMode);
  dom.toggleLightMode.checked = settings.lightMode;
}

// IndexedDB logic for Background Image to bypass 5MB localStorage limit
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BACKGROUND_DB.name, BACKGROUND_DB.version);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(BACKGROUND_DB.store)) {
        db.createObjectStore(BACKGROUND_DB.store);
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e);
  });
}

async function runBackgroundStore(mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BACKGROUND_DB.store, mode);
    const store = tx.objectStore(BACKGROUND_DB.store);
    let result;
    const request = action(store);

    request.onsuccess = () => {
      result = request.result;
    };

    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

function writeBackgroundImage(dataUrl) {
  return runBackgroundStore('readwrite', store => store.put(dataUrl, BACKGROUND_DB.key));
}

function readBackgroundImage() {
  return runBackgroundStore('readonly', store => store.get(BACKGROUND_DB.key));
}

function deleteBackgroundImage() {
  return runBackgroundStore('readwrite', store => store.delete(BACKGROUND_DB.key));
}

async function saveBackground(dataUrl) {
  try {
    await writeBackgroundImage(dataUrl);
    settings.hasBackground = true;
    saveSettings();
    applyBackground(dataUrl);
  } catch (err) { console.error('Error saving background', err); }
}

// Central Digital Clock Logic
function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  
  // Format Time
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  if (dom.clockTime) {
    dom.clockTime.innerHTML = `${hours}:${minutes}<span class="clock-ampm">${ampm}</span>`;
  }
  
  // Format Date (e.g., "Monday, June 1")
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('en-US', options);
  if (dom.clockDate) {
    dom.clockDate.textContent = dateStr;
  }
}

// Curated list of premium Unsplash photo IDs for account-free daily rotation with attribution details
const UNSPLASH_WALLPAPERS = [
  { id: 'photo-1470071459604-3b5ec3a7fe05', name: 'Sergei Akulich', username: 'sergeiakulich' },
  { id: 'photo-1507525428034-b723cf961d3e', name: 'Sean Oulashin', username: 'oulashin' },
  { id: 'photo-1441974231531-c6227db76b6e', name: 'John Towner', username: 'johntowner' },
  { id: 'photo-1447752875215-b2761acb3c5d', name: 'Lukasz Szmigiel', username: 'szmigieldesign' },
  { id: 'photo-1472214222541-d510753a8707', name: 'Elena Kovalenko', username: 'kovalenkoelena' },
  { id: 'photo-1469474968028-56623f02e42e', name: 'Kalen Emsley', username: 'kalenemsley' },
  { id: 'photo-1501854140801-50d01698950b', name: 'Houvine', username: 'houvine' },
  { id: 'photo-1465146344425-f00d5f5c8f07', name: 'Aaron Burden', username: 'aaronburden' },
  { id: 'photo-1513836279014-a89f7a76ae86', name: 'Johannes Plenio', username: 'jplenio' },
  { id: 'photo-1475924156734-496f6cac6ec1', name: 'Quynh Anh Nguyen', username: 'quynhanhnguyen' },
  { id: 'photo-1433832597046-4f10e10ac764', name: 'Sefa Yamak', username: 'sefayamak' },
  { id: 'photo-1506744038136-46273834b3fb', name: 'Anneliese Phillips', username: 'anneliesephillips' },
  { id: 'photo-1443636955827-230f8823b6cf', name: 'Samuel Scrimshaw', username: 'samuelscrimshaw' },
  { id: 'photo-1518173946687-a4c8a383392e', name: 'Aaron Burden', username: 'aaronburden' },
  { id: 'photo-1470770841072-f978cf4d019e', name: 'Luca Bravo', username: 'lucabravo' }
];

function getDailyUnsplashWallpaper() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const photo = UNSPLASH_WALLPAPERS[dayOfYear % UNSPLASH_WALLPAPERS.length];
  return `https://images.unsplash.com/${photo.id}?auto=format&fit=crop&w=1920&q=80`;
}

async function loadBackground() {
  if (settings.useUnsplash) {
    const dailyUrl = getDailyUnsplashWallpaper();
    applyBackground(dailyUrl);
    dom.clearBgBtn.style.display = 'none';
    return;
  }
  if (!settings.hasBackground) {
    clearBackgroundUI();
    return;
  }
  try {
    const backgroundImage = await readBackgroundImage();
    if (backgroundImage) applyBackground(backgroundImage);
  } catch (err) { console.error('Error loading background', err); }
}

async function clearBackground() {
  try {
    await deleteBackgroundImage();
    settings.hasBackground = false;
    saveSettings();
    clearBackgroundUI();
  } catch (err) { console.error('Error clearing background', err); }
}

function clearBackgroundUI() {
  dom.customBg.style.backgroundImage = '';
  dom.customBg.style.opacity = '0';
  document.body.classList.remove('has-bg');
  dom.clearBgBtn.style.display = 'none';
  if (dom.bgAttribution) {
    dom.bgAttribution.style.display = 'none';
  }
}

function applyBackground(dataUrl) {
  dom.customBg.style.backgroundImage = `url("${dataUrl.replace(/"/g, '\\"')}")`;
  dom.customBg.style.opacity = '1';
  document.body.classList.add('has-bg');
  dom.clearBgBtn.style.display = settings.useUnsplash ? 'none' : 'inline-block';

  // Attribution
  if (settings.useUnsplash && dom.bgAttribution && dom.attributionLink) {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const photo = UNSPLASH_WALLPAPERS[dayOfYear % UNSPLASH_WALLPAPERS.length];
    if (photo) {
      dom.attributionLink.textContent = photo.name;
      dom.attributionLink.href = `https://unsplash.com/@${photo.username}?utm_source=nexus_tab&utm_medium=referral`;
      dom.bgAttribution.style.display = 'block';
    }
  } else {
    if (dom.bgAttribution) {
      dom.bgAttribution.style.display = 'none';
    }
  }
}

function closeWidgetPanels(except = '') {
  if (except !== 'notes') {
    dom.notesPanel.classList.remove('visible');
    dom.notesToggle.classList.remove('active');
  }

  if (except !== 'timer') {
    dom.timerPanel.classList.remove('visible');
    dom.timerToggle.classList.remove('active');
  }

  if (except !== 'todo') {
    dom.todoPanel.classList.remove('visible');
    dom.todoToggle.classList.remove('active');
  }
}

function renderTodos() {
  dom.todoList.innerHTML = '';
  const frag = document.createDocumentFragment();
  todos.forEach((task, index) => {
    const div = el('div', `todo-item ${task.completed ? 'completed' : ''}`);

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = task.completed;
    cb.addEventListener('change', () => {
      todos[index].completed = cb.checked;
      saveTodos();
      renderTodos();
    });

    const del = el('button', 'todo-item-remove', '×');
    del.addEventListener('click', () => {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    div.append(cb, el('span', null, task.text), del);
    frag.appendChild(div);
  });
  dom.todoList.appendChild(frag);
}

function toggleTodoWidget() {
  const isVisible = !dom.todoPanel.classList.contains('visible');
  closeWidgetPanels(isVisible ? 'todo' : '');
  dom.todoPanel.classList.toggle('visible', isVisible);
  dom.todoToggle.classList.toggle('active', isVisible);
  if (isVisible) dom.todoInput.focus();
}

// ══════════════════════════════════════════════════════════════════════
//  🌤️ LIVE WEATHER WIDGET FEATURES
// ══════════════════════════════════════════════════════════════════════
function initWeather() {
  if (!dom.weatherWidget) return;
  
  if (dom.weatherLocationInput) {
    dom.weatherLocationInput.value = settings.weatherLocation?.name || '';
  }
  
  if (dom.weatherUnitControl) {
    dom.weatherUnitControl.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.unit === settings.weatherUnit);
    });
  }
  
  updateWeatherWidget();
}

function updateWeatherWidget() {
  if (!settings.showWeather) {
    if (dom.weatherWidget) dom.weatherWidget.style.display = 'none';
    return;
  }
  if (dom.weatherWidget) dom.weatherWidget.style.display = 'flex';
  
  // Read cache
  const cache = safeGetJSON(STORAGE_KEYS.weatherCache, null);
  const cacheDuration = 30 * 60 * 1000; // 30 minutes
  
  const hasValidCache = cache 
    && cache.timestamp 
    && cache.city === settings.weatherLocation?.name
    && (Date.now() - cache.timestamp < cacheDuration);
    
  if (hasValidCache) {
    renderWeather(cache.data, cache.city);
  } else {
    const loc = settings.weatherLocation || DEFAULT_SETTINGS.weatherLocation;
    fetchWeather(loc.latitude, loc.longitude, loc.name);
  }
}

async function fetchWeather(latitude, longitude, name) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Weather API fetch failed');
    const data = await resp.json();
    
    // Parse weather data
    const current = data.current;
    const daily = data.daily;
    
    const weatherData = {
      current: {
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        wind: current.wind_speed_10m,
        code: current.weather_code
      },
      forecast: []
    };
    
    // 3-Day Forecast
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 3; i++) {
      const date = new Date(daily.time[i]);
      const dayName = i === 0 ? 'Today' : days[date.getDay()];
      weatherData.forecast.push({
        day: dayName,
        code: daily.weather_code[i],
        max: daily.temperature_2m_max[i],
        min: daily.temperature_2m_min[i]
      });
    }
    
    // Cache data
    const cache = {
      timestamp: Date.now(),
      city: name,
      data: weatherData
    };
    safeSetJSON(STORAGE_KEYS.weatherCache, cache);
    
    renderWeather(weatherData, name);
  } catch (err) {
    console.error('Failed to load weather', err);
    // If request fails, fallback to rendering last cache if it exists
    const cache = safeGetJSON(STORAGE_KEYS.weatherCache, null);
    if (cache) {
      renderWeather(cache.data, cache.city);
    }
  }
}

function convertTemp(celsius, unit) {
  if (unit === 'fahrenheit') {
    return (celsius * 1.8) + 32;
  }
  return celsius;
}

function getWeatherIcon(code) {
  if (code === 0) return '☀️'; // Clear sky
  if (code >= 1 && code <= 3) return '🌤️'; // Mainly clear, partly cloudy, and overcast
  if (code === 45 || code === 48) return '🌫️'; // Fog and depositing rime fog
  if (code >= 51 && code <= 55) return '🌧️'; // Drizzle: Light, moderate, and dense intensity
  if (code >= 61 && code <= 65) return '🌧️'; // Rain: Slight, moderate and heavy intensity
  if (code >= 71 && code <= 75) return '❄️'; // Snow fall: Slight, moderate, and heavy intensity
  if (code >= 80 && code <= 82) return '🌦️'; // Rain showers: Slight, moderate, and violent
  if (code >= 95 && code <= 99) return '⛈️'; // Thunderstorm: Slight or moderate
  return '☁️';
}

function renderWeather(weatherData, cityName) {
  if (!weatherData || !dom.weatherWidget) return;
  
  const unit = settings.weatherUnit || 'celsius';
  
  // Current stats conversion
  const temp = convertTemp(weatherData.current.temp, unit);
  const feelsLike = convertTemp(weatherData.current.feelsLike, unit);
  const windUnit = 'km/h';
  
  dom.weatherIcon.textContent = getWeatherIcon(weatherData.current.code);
  dom.weatherTemp.textContent = `${Math.round(temp)}°`;
  dom.weatherCity.textContent = cityName;
  dom.weatherFeels.textContent = `${Math.round(feelsLike)}°`;
  dom.weatherHumidity.textContent = `${weatherData.current.humidity}%`;
  dom.weatherWind.textContent = `${Math.round(weatherData.current.wind)} ${windUnit}`;
  
  // Render forecast
  dom.weatherForecast.innerHTML = '';
  const frag = document.createDocumentFragment();
  
  weatherData.forecast.forEach(item => {
    const row = el('div', 'weather-forecast-item');
    
    const daySpan = el('span', 'forecast-day', item.day);
    const iconSpan = el('span', 'forecast-icon', getWeatherIcon(item.code));
    
    const max = Math.round(convertTemp(item.max, unit));
    const min = Math.round(convertTemp(item.min, unit));
    
    const tempSpan = el('span', 'forecast-temp');
    tempSpan.innerHTML = `${max}°<span class="forecast-low">${min}°</span>`;
    
    row.append(daySpan, iconSpan, tempSpan);
    frag.appendChild(row);
  });
  
  dom.weatherForecast.appendChild(frag);
}

function renderWeatherFromCache() {
  const cache = safeGetJSON(STORAGE_KEYS.weatherCache, null);
  if (cache) {
    renderWeather(cache.data, cache.city);
  }
}

async function searchWeatherLocation() {
  if (!dom.weatherLocationInput || !dom.weatherLocationStatus) return;
  
  const query = dom.weatherLocationInput.value.trim();
  if (!query) {
    dom.weatherLocationStatus.textContent = 'Please enter a city name.';
    dom.weatherLocationStatus.style.color = '#ef4444';
    return;
  }
  
  dom.weatherLocationStatus.textContent = 'Searching...';
  dom.weatherLocationStatus.style.color = 'var(--text-secondary)';
  
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Geocoding search failed');
    const data = await resp.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const name = result.name + (result.admin1 ? `, ${result.admin1}` : '') + (result.country_code ? ` [${result.country_code.toUpperCase()}]` : '');
      
      settings.weatherLocation = {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude
      };
      saveSettings();
      
      // Sync input value
      dom.weatherLocationInput.value = result.name;
      dom.weatherLocationStatus.textContent = `Location set to: ${name}`;
      dom.weatherLocationStatus.style.color = 'var(--accent)';
      
      // Clear cache and refetch
      removeStoredValue(STORAGE_KEYS.weatherCache);
      updateWeatherWidget();
    } else {
      dom.weatherLocationStatus.textContent = 'Location not found. Try another city.';
      dom.weatherLocationStatus.style.color = '#ef4444';
    }
  } catch (err) {
    console.error('Geocoding search error', err);
    dom.weatherLocationStatus.textContent = 'Network error. Try again.';
    dom.weatherLocationStatus.style.color = '#ef4444';
  }
}

// ══════════════════════════════════════════════════════════════════════
//  START
// ══════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
