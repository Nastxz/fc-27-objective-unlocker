import { openObjectives } from './page.js';

const openButton = document.querySelector('#open');
const retryButton = document.querySelector('#retry');
const status = document.querySelector('#status');

async function run(retry) {
  openButton.disabled = retryButton.disabled = true;
  retryButton.hidden = true;
  status.textContent = 'Loading an Ultimate Team objective category. Keep this popup open for up to 10 seconds…';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No selected tab');
    const url = new URL(tab.url || '');
    if (url.protocol !== 'https:' || !['ea.com', 'www.ea.com'].includes(url.hostname) ||
        !/^\/ea-sports-fc\/ultimate-team\/web-app(?:\/|$)/.test(url.pathname)) {
      status.textContent = 'Select your EA FC Web App tab, then reopen this extension.';
      return;
    }
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id }, world: 'MAIN', func: openObjectives, args: [retry]
    });
    const result = results[0]?.result;
    status.textContent = result?.message || 'No response from the page. Refresh the Web App and try again.';
    retryButton.hidden = result?.code !== 'disabled';
  } catch {
    status.textContent = 'Could not access the selected page. Select the EA Web App tab and reopen this extension. If needed, refresh the page first.';
  } finally {
    openButton.disabled = retryButton.disabled = false;
  }
}
openButton.addEventListener('click', () => run(false));
retryButton.addEventListener('click', () => run(true));
