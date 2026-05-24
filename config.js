/* ============================================
   Nexus Tab — Static Configuration
   ============================================ */

const ENGINE_CATEGORIES = [
  {
    category: 'Core',
    engines: [
      { id: 'google',      label: 'Google',      prefix: 'g',    url: 'https://www.google.com/search?q=' },
      { id: 'duckduckgo',  label: 'DuckDuckGo',  prefix: 'ddg',  url: 'https://duckduckgo.com/?q=' },
      { id: 'brave',       label: 'Brave',       prefix: 'b',    url: 'https://search.brave.com/search?q=' },
      { id: 'startpage',   label: 'Startpage',   prefix: 'sp',   url: 'https://www.startpage.com/do/search?q=' },
      { id: 'gdrive',      label: 'Google Drive', prefix: 'gd',   url: 'https://drive.google.com/drive/search?q=' },
      { id: 'translate',   label: 'Translate',    prefix: 'tr',   url: 'https://translate.google.com/?sl=auto&tl=en&text=' },
    ],
  },
  {
    category: 'AI',
    engines: [
      { id: 'chatgpt',    label: 'ChatGPT',    prefix: 'ai',  url: 'https://chat.openai.com/?q=' },
      { id: 'perplexity', label: 'Perplexity',  prefix: 'pp',  url: 'https://www.perplexity.ai/search?q=' },
      { id: 'claude',     label: 'Claude',      prefix: 'cl',  url: 'https://claude.ai/new?q=' },
      { id: 'gemini',     label: 'Gemini',      prefix: 'gem', url: 'https://gemini.google.com/app?q=' },
      { id: 'grok',       label: 'Grok',        prefix: 'gr',  url: 'https://grok.x.ai/?q=' },
      { id: 'you',        label: 'You.com',     prefix: 'you', url: 'https://you.com/search?q=' },
      { id: 'googleai',   label: 'AI Mode',     prefix: 'gai', url: 'https://www.google.com/search?udm=50&q=' },
    ],
  },
  {
    category: 'Dev',
    engines: [
      { id: 'stackoverflow', label: 'StackOverflow', prefix: 'so',  url: 'https://stackoverflow.com/search?q=' },
      { id: 'github',        label: 'GitHub',        prefix: 'gh',  url: 'https://github.com/search?q=' },
      { id: 'mdn',           label: 'MDN',           prefix: 'mdn', url: 'https://developer.mozilla.org/en-US/search?q=' },
      { id: 'devdocs',       label: 'DevDocs',       prefix: 'dd',  url: 'https://devdocs.io/#q=' },
      { id: 'npm',           label: 'NPM',           prefix: 'npm', url: 'https://www.npmjs.com/search?q=' },
    ],
  },
  {
    category: 'Knowledge',
    engines: [
      { id: 'wikipedia',     label: 'Wikipedia',     prefix: 'w',    url: 'https://en.wikipedia.org/wiki/Special:Search?search=' },
      { id: 'googlescholar', label: 'Google Scholar', prefix: 'gs',   url: 'https://scholar.google.com/scholar?q=' },
      { id: 'wolframalpha',  label: 'WolframAlpha',   prefix: 'wa',   url: 'https://www.wolframalpha.com/input?i=' },
      { id: 'pubmed',        label: 'PubMed',         prefix: 'pm',   url: 'https://pubmed.ncbi.nlm.nih.gov/?term=' },
      { id: 'quora',         label: 'Quora',          prefix: 'qr',   url: 'https://www.quora.com/search?q=' },
    ],
  },
  {
    category: 'Media',
    engines: [
      { id: 'youtube',   label: 'YouTube',   prefix: 'yt',   url: 'https://www.youtube.com/results?search_query=' },
      { id: 'gimages',   label: 'Google Img', prefix: 'gi',   url: 'https://www.google.com/search?tbm=isch&q=' },
      { id: 'spotify',   label: 'Spotify',   prefix: 'spot', url: 'https://open.spotify.com/search/' },
      { id: 'pinterest', label: 'Pinterest',  prefix: 'pin',  url: 'https://www.pinterest.com/search/pins/?q=' },
      { id: 'medium',    label: 'Medium',    prefix: 'med',  url: 'https://medium.com/search?q=' },
      { id: 'x',         label: 'X',         prefix: 'x',    url: 'https://twitter.com/search?q=' },
      { id: 'jiocinema', label: 'JioCinema', prefix: 'jio',  url: 'https://www.jiocinema.com/search/' },
      { id: 'hotstar',   label: 'Hotstar',   prefix: 'hs',   url: 'https://www.hotstar.com/in/search/phrases/' },
    ],
  },
  {
    category: 'Shopping',
    engines: [
      { id: 'amazon',   label: 'Amazon',   prefix: 'am',   url: 'https://www.amazon.in/s?k=' },
      { id: 'flipkart', label: 'Flipkart', prefix: 'fk',   url: 'https://www.flipkart.com/search?q=' },
      { id: 'myntra',   label: 'Myntra',   prefix: 'myn',  url: 'https://www.myntra.com/' },
      { id: 'ajio',     label: 'Ajio',     prefix: 'aj',   url: 'https://www.ajio.com/search/?text=' },
      { id: 'meesho',   label: 'Meesho',   prefix: 'msh',  url: 'https://www.meesho.com/search?q=' },
      { id: 'ebay',     label: 'eBay',     prefix: 'eb',   url: 'https://www.ebay.com/sch/i.html?_nkw=' },
    ],
  },
  {
    category: 'Food',
    engines: [
      { id: 'zomato',     label: 'Zomato',     prefix: 'zo',  url: 'https://www.zomato.com/search?q=' },
      { id: 'swiggy',     label: 'Swiggy',     prefix: 'sw',  url: 'https://www.swiggy.com/search?query=' },
      { id: 'eatsure',    label: 'EatSure',    prefix: 'es',  url: 'https://www.eatsure.com/search?q=' },
      { id: 'magicpin',   label: 'Magicpin',   prefix: 'mp',  url: 'https://magicpin.in/search/?q=' },
      { id: 'bigbasket',  label: 'BigBasket',  prefix: 'bb',  url: 'https://www.bigbasket.com/ps/?q=' },
      { id: 'blinkit',    label: 'Blinkit',    prefix: 'bl',  url: 'https://blinkit.com/s/?q=' },
    ],
  },
  {
    category: 'Community',
    engines: [
      { id: 'reddit',      label: 'Reddit',      prefix: 'rd',   url: 'https://www.reddit.com/search/?q=' },
      { id: 'producthunt', label: 'ProductHunt', prefix: 'pht',  url: 'https://www.producthunt.com/search?q=' },
      { id: 'hackernews',  label: 'HackerNews',  prefix: 'hn',   url: 'https://hn.algolia.com/?q=' },
      { id: 'imdb',        label: 'IMDb',        prefix: 'imdb', url: 'https://www.imdb.com/find?q=' },
      { id: 'linkedin',    label: 'LinkedIn',    prefix: 'li',   url: 'https://www.linkedin.com/search/results/all/?keywords=' },
      { id: 'maps',        label: 'Maps',        prefix: 'maps', url: 'https://www.google.com/maps/search/' },
    ],
  },
  {
    category: 'Jobs',
    engines: [
      { id: 'naukri', label: 'Naukri',  prefix: 'nk',  url: 'https://www.naukri.com/jobapi/v3/search?searchType=adv&keyword=' },
      { id: 'indeed', label: 'Indeed',  prefix: 'ind', url: 'https://www.indeed.co.in/jobs?q=' },
    ],
  },
];

const STORAGE_KEYS = {
  engine: 'nexus-engine',
  settings: 'nexus-settings',
  quickLinks: 'nexus-quick-links',
  recentSearches: 'nexus-recent',
  notes: 'nexus-notes',
  usage: 'nexus-usage',
  customEngines: 'nexus-custom-engines',
  todos: 'nexus-todos',
};

const LEGACY_ENGINE_KEY = 'nexus-tab-engine';
const DEFAULT_ENGINE = 'google';
const FAVICON_BASE = 'https://www.google.com/s2/favicons?sz=32&domain=';

const DEFAULT_QUICK_LINKS = [
  { name: 'Google',  url: 'https://www.google.com' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'GitHub',  url: 'https://github.com' },
  { name: 'Reddit',  url: 'https://www.reddit.com' },
  { name: 'Gmail',   url: 'https://mail.google.com' },
  { name: 'Twitter', url: 'https://twitter.com' },
];

const DEFAULT_SETTINGS = {
  accentColor: 'emerald',
  accentHex: '#3ecf8e',
  showGreeting: true,
  showQuickLinks: true,
  showRecentSearches: true,
  showSuggestions: true,
  showQuote: true,
  showEngineChips: true,
  showWidgetDock: true,
  showHistoryResults: true,
  showTopSitesResults: true,
  lightMode: false,
  hasBackground: false,
  backgroundDim: 72,
  backgroundBlur: 8,
  backgroundPosition: 'center',
  layoutDensity: 'balanced',
  hasSeenOnboarding: false,
};

const ACCENT_COLORS = {
  emerald: '#3ecf8e',
  blue: '#60a5fa',
  purple: '#a78bfa',
  amber: '#f0c674',
  rose: '#f472b6',
  cyan: '#22d3ee',
};

const BACKGROUND_DB = {
  name: 'NexusDB',
  version: 1,
  store: 'bgStore',
  key: 'bgImage',
  backupKey: '__nexus-background-image',
};

globalThis.NEXUS_CONFIG = {
  ENGINE_CATEGORIES,
  STORAGE_KEYS,
  LEGACY_ENGINE_KEY,
  DEFAULT_ENGINE,
  FAVICON_BASE,
  DEFAULT_QUICK_LINKS,
  DEFAULT_SETTINGS,
  ACCENT_COLORS,
  BACKGROUND_DB,
};
