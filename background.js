/* ============================================
   Nexus Tab — Background Service Worker
   Context menu for right-click search
   ============================================ */

const CONTEXT_ENGINE_IDS = [
  'google',
  'chatgpt',
  'perplexity',
  'github',
  'stackoverflow',
];

importScripts('config.js');

const CONTEXT_ENGINE_MAP = new Map(
  ENGINE_CATEGORIES
    .flatMap(category => category.engines)
    .map(engine => [engine.id, engine])
);

const CONTEXT_MENU_ENGINES = CONTEXT_ENGINE_IDS
  .map(id => CONTEXT_ENGINE_MAP.get(id))
  .filter(Boolean);

function createContextMenus() {
  chrome.contextMenus.create({
    id: 'nexus-search',
    title: 'Search with Nexus Tab',
    contexts: ['selection'],
  });

  CONTEXT_MENU_ENGINES.forEach((engine) => {
    chrome.contextMenus.create({
      id: `nexus-${engine.id}`,
      parentId: 'nexus-search',
      title: engine.label,
      contexts: ['selection'],
    });
  });
}

// Create context menu on install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(createContextMenus);
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  if (!info.selectionText) return;

  const engineId = info.menuItemId.replace('nexus-', '');
  const engine = CONTEXT_ENGINE_MAP.get(engineId);

  if (engine) {
    const query = encodeURIComponent(info.selectionText.trim());
    chrome.tabs.create({ url: engine.url + query });
  }
});
