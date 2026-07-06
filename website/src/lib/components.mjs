// components.mjs — HTML fragment builders. Every function returns a string.
// Internal links/assets use the {{base}} token, resolved at build time.

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const escAttr = (s = '') => esc(s).replace(/"/g, '&quot;').replace(/\n/g, '&#10;')

const slug = (s) =>
  String(s).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

// ---------------------------------------------------------------------------
// Command / code block. `prompt: true` renders a muted "PS>" per line that is
// excluded from what the copy button copies (design A4). Line numbers appear
// only when the block has more than 6 lines.
// ---------------------------------------------------------------------------
export function cmd(code, opts = {}) {
  const { label = 'PowerShell', prompt = false } = opts
  const lines = String(code).replace(/\n+$/, '').split('\n')
  const copyText = lines.join('\n')
  const numbered = lines.length > 6
  // The prompt prefix marks the first line only, so a multi-line script reads as
  // one block rather than a stack of separate commands. It's never copied.
  const rendered = lines
    .map((l, i) => {
      const body = prompt && i === 0 ? `<span class="pfx">PS&gt;</span> ${esc(l)}` : esc(l)
      return `<span class="cl">${body || '&nbsp;'}</span>`
    })
    .join('')
  return `<figure class="cmd"${numbered ? ' data-numbered' : ''}>
  <figcaption class="cmd__bar">
    <span class="cmd__label">${esc(label)}</span>
    <button class="cmd__copy" type="button" data-copy="${escAttr(copyText)}" aria-label="Copy code">
      <span class="cmd__copy-icon" aria-hidden="true"></span><span class="cmd__copy-text">Copy</span>
    </button>
  </figcaption>
  <pre class="cmd__pre${numbered ? ' cmd__pre--num' : ''}"><code>${rendered}</code></pre>
</figure>`
}

// ---------------------------------------------------------------------------
// Callout — one style. `lead` is the bold lead word (Note / Important / Tip).
// ---------------------------------------------------------------------------
export function callout(bodyHtml, lead = 'Note') {
  return `<aside class="callout" role="note"><p><strong>${esc(lead)}:</strong> ${bodyHtml}</p></aside>`
}

// ---------------------------------------------------------------------------
// Screenshot frame + caption. `alt` describes what the terminal shows.
// ---------------------------------------------------------------------------
export function shot({ src, alt, caption, width }) {
  const w = width ? ` style="max-width:${width}"` : ''
  return `<figure class="shot"${w}>
  <img src="{{base}}${src}" alt="${escAttr(alt)}" loading="lazy" decoding="async">
  <figcaption>${esc(caption)}</figcaption>
</figure>`
}

// ---------------------------------------------------------------------------
// Table. headers: string[]; rows: string[][] (cells may contain HTML).
// ---------------------------------------------------------------------------
export function table(headers, rows) {
  const head = headers.map((h) => `<th scope="col">${h}</th>`).join('')
  const body = rows
    .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`)
    .join('')
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
}

// ---------------------------------------------------------------------------
// Button. variant: 'primary' | 'secondary'. Internal `route` or external `href`.
// ---------------------------------------------------------------------------
export function btn({ label, route, href, variant = 'primary', external = false }) {
  const cls = `btn btn--${variant}`
  if (route !== undefined) return `<a class="${cls}" href="{{base}}${route}${route ? '/' : ''}">${esc(label)}</a>`
  const ext = external ? ' target="_blank" rel="noopener"' : ''
  const arrow = external ? ' <span class="ext" aria-hidden="true">↗</span>' : ''
  return `<a class="${cls}" href="${href}"${ext}>${esc(label)}${arrow}</a>`
}

// Inline external link with the ↗ indicator (design A4).
export function extlink(label, href) {
  return `<a href="${href}" target="_blank" rel="noopener">${esc(label)} <span class="ext" aria-hidden="true">↗</span></a>`
}

// H2 with an id + hover anchor, and it feeds the on-page TOC.
export function h2(text, id = slug(text)) {
  return `<h2 id="${id}"><a class="head-anchor" href="#${id}" aria-label="Link to this section">#</a>${esc(text)}</h2>`
}

export function h3(text, id = slug(text)) {
  return `<h3 id="${id}">${esc(text)}</h3>`
}

// Extract {id, text} for every h2 in a rendered body (for the TOC rail).
export function extractToc(html) {
  const out = []
  const re = /<h2 id="([^"]+)">(?:<a[^>]*>#<\/a>)?([^<]+)<\/h2>/g
  let m
  while ((m = re.exec(html))) out.push({ id: m[1], text: m[2].trim() })
  return out
}

// Small helper for a "kbd" key chip.
export const kbd = (k) => `<kbd>${esc(k)}</kbd>`
