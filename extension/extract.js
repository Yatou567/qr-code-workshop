// Self-contained: Chrome serializes this function into the active page.
function extractPageLinks() {
  const links = new Map();
  const roots = [document];
  const seen = new Set();
  let truncated = false;
  for (let i = 0; i < roots.length; i++) {
    const root = roots[i];
    if (seen.has(root)) continue;
    seen.add(root);
    for (const el of root.querySelectorAll('a[href], area[href]')) {
      const raw = el.getAttribute('href');
      if (!raw || !raw.trim()) continue;
      let url;
      try { url = new URL(raw, el.ownerDocument.baseURI); } catch { continue; }
      if (!['http:', 'https:', 'mailto:', 'tel:', 'ftp:', 'file:'].includes(url.protocol)) continue;
      if (links.has(url.href)) continue;
      if (links.size >= 5000) { truncated = true; break; }
      const title = (el.innerText || el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || el.querySelector('img[alt]')?.alt || '').replace(/\s+/g, ' ').trim().slice(0, 180);
      links.set(url.href, {url: url.href, title: title || url.href});
    }
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) roots.push(el.shadowRoot);
      if (el.tagName === 'IFRAME') {
        try { if (el.contentDocument) roots.push(el.contentDocument); } catch { /* Cross-origin frames are not readable. */ }
      }
    }
  }
  return {title: document.title, url: location.href, links: [...links.values()], truncated};
}
