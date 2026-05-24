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
};

const POPUP_ENGINES = ENGINE_CATEGORIES.flatMap(category => category.engines);

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
  try {
    chrome.topSites.get(sites => {
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
    popupDom.topSites.textContent = '';
  }
}

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
}

function initPopup() {
  renderPopupEngines();
  renderPopupQuickLinks();
  renderPopupTopSites();
  bindPopupEvents();
  popupDom.input.focus();
}

document.addEventListener('DOMContentLoaded', initPopup);
