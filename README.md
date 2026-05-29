# 🪐 Nexus Tab

> A premium, distraction-free search dashboard for your browser's new tab page.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Manifest Version](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Version](https://img.shields.io/badge/Version-1.1.0-purple.svg)](manifest.json)

**Nexus Tab** is a beautiful, distraction-free dashboard that replaces your default new tab page. It helps you search faster and stay organized with built-in productivity tools like a Pomodoro timer, quick notes, and a checklist.

---

## ✨ Features

- **🔍 Multi-Engine Prefix Search:** Switch between Google, GitHub, DuckDuckGo, YouTube, or your own custom engines on the fly using simple keyboard prefixes (e.g. type `gh react` to search React on GitHub).
- **⏱️ Integrated Productivity Dock:** A sleek slide-out dock on the right of the screen containing:
  - **Pomodoro Timer:** Stay in flow with 25-minute focus intervals and preset break timers.
  - **Sticky Notes:** Quick text pad that auto-saves your thoughts and scratch ideas.
  - **To-Do List:** Interactive task tracker to check off your daily goals.
- **🎨 Premium Customization & Aesthetics:**
  - **Curated Accents:** Color coordinate your dashboard (Emerald, Blue, Purple, Amber, Rose, or Cyan).
  - **Light/Dark Theme:** Flawless transition between themes.
  - **Custom Backgrounds:** Upload any image and dial in the visual aesthetic with interactive **blur** and **dim (opacity)** controls.
  - **Layout Density:** Switch between Compact, Balanced, or Spacious views.
- **⌨️ Keyboard-Centric Control:** Search, change engines, and execute operations purely with keyboard shortcuts.
- **⚡ Command Palette:** Press `Ctrl` + `K` to launch a command center to quickly trigger settings, change engines, or navigate dashboard options.
- **🔒 Privacy & Portability:** Import and export your entire setup configuration as a JSON file. All settings and data are stored locally in your browser storage.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| `/` | Focus search box |
| `←` / `→` | Switch active search engine |
| `↑` / `↓` | Select autocomplete suggestion |
| `Esc` | Clear active search |
| `Enter` | Perform search using the active engine |
| `Ctrl` + `K` | Open command palette |
| `[prefix] [query]` | Quick search with specific engine (e.g., `gh typescript`) |
| `set [prefix]` | Set active engine as the default (e.g., `set ddg`) |

---

## 🛠️ Installation (Developer Mode)

To run Nexus Tab locally or customize it to your liking:

1. Clone or download this repository to your local system:
   ```bash
   git clone https://github.com/yourusername/nexus-tab.git
   ```
2. Open your Google Chrome (or any Chromium-based browser like Brave, Edge, Opera).
3. Navigate to `chrome://extensions/` by typing it in the URL bar.
4. Enable **Developer mode** using the toggle switch in the top-right corner of the Extensions page.
5. Click the **Load unpacked** button in the top-left corner.
6. Select the `nexus-tab` directory (the folder containing `manifest.json`).
7. Open a new tab and start enjoying Nexus Tab! 🚀

---

## 📂 Project Structure

```
nexus-tab/
├── manifest.json       # Extension configuration & permissions
├── newtab.html         # Main dashboard layout
├── styles.css          # Premium layout styling & animations
├── script.js           # Core application & interaction logic
├── config.js           # Engine and links configuration managers
├── background.js       # Background service worker
├── content.js          # Injected helper scripts
├── engine-icons.js     # Search engine visual assets
├── quotes.js           # Curated collection of daily wisdom
├── popup.html/.css/.js # Extension toolbar popup interface
└── LICENSE             # MIT License
```

---

## 🔒 Permissions & Security

Nexus Tab values your privacy. It operates entirely locally and uses minimal permissions:
- `bookmarks`: To quickly query your bookmarks in the search bar.
- `history`: To show your recent history queries.
- `topSites`: To display your most frequently visited sites in the Quick Links panel.
- `contextMenus`: Adds browser context menu options.
- `https://suggestqueries.google.com/*`: Fetches search suggestions securely on your behalf.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
