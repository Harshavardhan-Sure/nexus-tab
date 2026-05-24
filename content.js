/**
 * Nexus Tab - Gemini Content Script
 * 
 * Google Gemini doesn't currently support passing search queries via URL parameters
 * out of the box (like ChatGPT or Perplexity do). This script bridges that gap by 
 * detecting the ?q= parameter from Nexus Tab, pasting it into the Gemini input 
 * box, and automatically sending the message.
 */

(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');

  if (!query) return; // No search query passed, do nothing

  // Gemini's input box loads asynchronously, so we observe the DOM until it appears
  const observer = new MutationObserver(() => {
    // Look for Gemini's rich text editor class
    const editor = document.querySelector('rich-textarea .ql-editor');
    
    if (editor) {
      observer.disconnect(); // Stop observing once found
      
      // Paste the query into the chat box without treating URL text as markup
      const paragraph = document.createElement('p');
      paragraph.textContent = query;
      editor.replaceChildren(paragraph);
      
      // Dispatch input event so Gemini's React/Angular state registers the typed text
      editor.dispatchEvent(new Event('input', { bubbles: true }));

      // Wait a fraction of a second for the state to update, then click send
      setTimeout(() => {
        // Look for the "Send" icon button
        const sendBtn = document.querySelector('button[aria-label="Send message"], button[mattooltip="Send message"], .send-button');
        if (sendBtn && !sendBtn.disabled) {
          sendBtn.click();
        }

        // Clean up the URL so refreshing the page doesn't re-send the prompt
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      }, 500);
    }
  });

  // Start observing the body for the chat interface to load
  observer.observe(document.body, { childList: true, subtree: true });

  // Timeout safety (stop observing after 10 seconds if site structure changed)
  setTimeout(() => observer.disconnect(), 10000);
})();
