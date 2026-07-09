// components.mjs — HTML fragment builders. Every function returns a string.
// Internal links/assets use the {{base}} token, resolved at build time.

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const escAttr = (s = "") =>
  esc(s).replace(/"/g, "&quot;").replace(/\n/g, "&#10;");

const slug = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// ---------------------------------------------------------------------------
// Command / code block. `prompt: true` renders a muted "PS>" per line that is
// excluded from what the copy button copies (design A4). Line numbers appear
// only when the block has more than 6 lines.
// ---------------------------------------------------------------------------
export function cmd(code, opts = {}) {
  const { label = "PowerShell", prompt = false } = opts;
  const lines = String(code).replace(/\n+$/, "").split("\n");
  const copyText = lines.join("\n");
  const numbered = lines.length > 6;
  // The prompt prefix marks the first line only, so a multi-line script reads as
  // one block rather than a stack of separate commands. It's never copied.
  const rendered = lines
    .map((l, i) => {
      const body =
        prompt && i === 0
          ? `<span class="pfx">PS&gt;</span> ${esc(l)}`
          : esc(l);
      return `<span class="cl">${body || "&nbsp;"}</span>`;
    })
    .join("");
  return `<figure class="cmd"${numbered ? " data-numbered" : ""}>
  <figcaption class="cmd__bar">
    <span class="cmd__label">${esc(label)}</span>
    <button class="cmd__copy" type="button" data-copy="${escAttr(copyText)}" aria-label="Copy code">
      <span class="cmd__copy-icon" aria-hidden="true"></span><span class="cmd__copy-text">Copy</span>
    </button>
  </figcaption>
  <pre class="cmd__pre${numbered ? " cmd__pre--num" : ""}"><code>${rendered}</code></pre>
</figure>`;
}

// ---------------------------------------------------------------------------
// Callout — one style. `lead` is the bold lead word (Note / Important / Tip).
// ---------------------------------------------------------------------------
export function callout(bodyHtml, lead = "Note") {
  return `<aside class="callout" role="note"><p><strong>${esc(lead)}:</strong> ${bodyHtml}</p></aside>`;
}

// ---------------------------------------------------------------------------
// Screenshot frame + caption. `alt` describes what the terminal shows.
// Kept for any future real screenshot; the live `demo()` component below is
// the default way to show a terminal on the site.
// ---------------------------------------------------------------------------
export function shot({ src, alt, caption, width }) {
  const w = width ? ` style="max-width:${width}"` : "";
  return `<figure class="shot"${w}>
  <img src="{{base}}${src}" alt="${escAttr(alt)}" loading="lazy" decoding="async">
  <figcaption>${esc(caption)}</figcaption>
</figure>`;
}

// ---------------------------------------------------------------------------
// Terminal demo — the site's signature element (design B4). A fake window with
// traffic-light dots + a "PowerShell 7" label, an accessible tablist (Default /
// After setup, or feature-specific labels), and one panel per tab rendered as
// syntax-highlighted rows using the .tok-* spans. Progressive enhancement in
// main.js turns the tabs into a proper ARIA tablist with roving tabindex +
// arrow-key navigation; without JS, the selected tab's panel is shown by default.
//
// `tabs`: [{ id, label, content }]  — content is an HTML string of .demo__rows.
// `selected`: id of the initially visible tab (defaults to the LAST tab, i.e.
//             the "after" state, per the site convention).
// `caption`: optional line beneath the demo, like a screenshot caption.
// ---------------------------------------------------------------------------
let _demoUid = 0;
const uid = (p) => `${p}-${++_demoUid}`;

export function demo({
  file = "PowerShell 7",
  label = "Terminal demo",
  tabs,
  selected,
  caption,
}) {
  if (!tabs || !tabs.length) return "";
  const base = uid("demo");
  const selId = selected || tabs[tabs.length - 1].id;
  const tabBtns = tabs
    .map((t) => {
      const isSel = t.id === selId;
      const tabId = `${base}__tab--${t.id}`;
      const panelId = `${base}__panel--${t.id}`;
      return `<button class="demo__tab" role="tab" id="${tabId}" aria-selected="${isSel}" aria-controls="${panelId}" tabindex="${isSel ? 0 : -1}" data-target="${t.id}">${esc(t.label)}</button>`;
    })
    .join("");
  const panels = tabs
    .map((t) => {
      const isSel = t.id === selId;
      const tabId = `${base}__tab--${t.id}`;
      const panelId = `${base}__panel--${t.id}`;
      return `<div class="demo__panel" role="tabpanel" id="${panelId}" aria-labelledby="${tabId}" tabindex="0" data-panel="${t.id}"${isSel ? "" : " hidden"}>${t.content}</div>`;
    })
    .join("");
  const cap = caption ? `\n<p class="demo__caption">${esc(caption)}</p>` : "";
  // The window (bar + tabs + screen) carries the black background and border;
  // the caption sits OUTSIDE it, on the page, like a screenshot caption.
  return `<figure class="demo" data-demo>
  <div class="demo__window">
    <div class="demo__bar">
      <span class="demo__wintab">
        <span class="demo__winicon" aria-hidden="true">${winIcon}</span>
        <span class="demo__file">${esc(file)}</span>
      </span>
      <span class="demo__winbtns" aria-hidden="true"><i class="demo__win demo__win--min"></i><i class="demo__win demo__win--max"></i><i class="demo__win demo__win--close"></i></span>
    </div>
    <div class="demo__tabs" role="tablist" aria-label="${escAttr(label)}">${tabBtns}</div>
    <div class="demo__screen">${panels}</div>
  </div>
  ${cap}
</figure>`;
}

// ---------------------------------------------------------------------------
// Shared building blocks for the demo* variants below. Kept together so every
// variant reads the same way: icons/cursor/row first, then the tabs array.
// ---------------------------------------------------------------------------

// Small inline git-branch mark — Nerd Font glyphs won't render in web fonts, so
// demos use this SVG that always renders crisply and inherits tok-branch color.
const branchIcon = `<svg class="branch-ico" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="3.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="11.5" cy="4.5" r="1.5"/><path d="M4.5 5v6"/><path d="M11.5 6c0 3.2-3 3.2-5 4.2"/></svg>`;
const folderIcon = `<svg class="branch-ico" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 4.5a1 1 0 0 1 1-1H6l1.5 1.5h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z"/></svg>`;
const cursor = `<span class="demo__cursor" aria-hidden="true"></span>`;
const tofu = `<span class="demo__tofu" aria-hidden="true"></span>`;

// Small terminal glyph shown in the window tab (a ">_" prompt mark).
const winIcon = `<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4l3 3.5L3 11"/><path d="M8 11h5"/></svg>`;

const row = (html) => `<div class="demo__row">${html}</div>`;

// ---- variant 1: minimal prompt (Default vs After setup) ------------------
export function demoPrompt({ caption } = {}) {
  return demo({
    label: "Prompt comparison",
    caption,
    tabs: [
      {
        id: "before",
        label: "Default",
        content:
          row(`<span class="tok-param">Windows PowerShell</span>`) +
          row(
            `<span class="tok-param">PS C:\\Users\\you\\Desktop\\project&gt;</span> ${cursor}`,
          ),
      },
      {
        id: "after",
        label: "After setup",
        content:
          row(
            `<span class="tok-path">~\\Desktop\\project</span>  ${branchIcon} <span class="tok-branch">main</span>`,
          ) +
          row(
            `<span class="tok-sym">&#10095;</span> <span class="tok-cmd">git</span> <span class="tok-plain">status</span> ${cursor}`,
          ),
      },
    ],
  });
}

// ---- variant 2: ligatures + Nerd Font icons (tofu vs glyphs) -------------
// The "before" tab shows tofu boxes where glyphs would be and un-joined
// operators; the "after" tab shows joined ligatures and the SVG branch/folder
// icons standing in for the Nerd Font glyphs the real terminal renders.
export function demoLigatures({ caption } = {}) {
  return demo({
    label: "Ligatures and icons",
    caption,
    tabs: [
      {
        id: "before",
        label: "Default",
        content:
          row(
            `<span class="tok-comment"># operators not joined, icons are boxes</span>`,
          ) +
          row(
            `<span class="tok-plain">if (a ==&gt; b -&gt; c != d &gt;= e &lt;= f) {</span>`,
          ) +
          row(
            `  ${tofu} <span class="tok-branch">main</span>  ${tofu} <span class="tok-path">src</span>`,
          ) +
          row(`<span class="tok-plain">}</span> ${cursor}`),
      },
      {
        id: "after",
        label: "After setup",
        content:
          row(
            `<span class="tok-comment"># operators joined, icons render</span>`,
          ) +
          row(
            `<span class="tok-plain">if (a ==&gt; b -&gt; c != d &gt;= e &lt;= f) {</span>`,
          ) +
          row(
            `  ${branchIcon} <span class="tok-branch">main</span>  ${folderIcon} <span class="tok-path">src</span>`,
          ) +
          row(`<span class="tok-plain">}</span> ${cursor}`),
      },
    ],
  });
}

// ---- variant 3: history search (recall vs reverse-search overlay) --------
// The "before" tab is plain up-arrow recall; the "after" tab is a
// reverse-search overlay listing matched past commands with the typed
// substring highlighted.
export function demoHistory({
  caption = "Reverse history search that finds matching commands as you type.",
} = {}) {
  return demo({
    label: "History search",
    caption,
    tabs: [
      {
        id: "before",
        label: "Default",
        content:
          row(
            `<span class="tok-comment"># up-arrow recalls the last command, one at a time</span>`,
          ) +
          row(
            `<span class="tok-sym">&#10095;</span> <span class="tok-cmd">git</span> <span class="tok-plain">push origin main</span> ${cursor}`,
          ),
      },
      {
        id: "after",
        label: "After setup",
        content:
          row(
            `<span class="tok-sym">&#10095;</span> <span class="tok-cmd">git</span> ${cursor}`,
          ) +
          `<div class="demo__hist">` +
          row(
            `  <span class="tok-cmd">git</span><span class="tok-plain"> push origin main</span>`,
          ) +
          row(
            `  <span class="tok-cmd">git</span><span class="tok-plain"> pull --rebase</span>`,
          ) +
          row(
            `  <span class="tok-cmd">git</span><span class="tok-plain"> status</span>`,
          ) +
          `</div>`,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Table. headers: string[]; rows: string[][] (cells may contain HTML).
// ---------------------------------------------------------------------------
export function table(headers, rows) {
  const head = headers.map((h) => `<th scope="col">${h}</th>`).join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`,
    )
    .join("");
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

// ---------------------------------------------------------------------------
// Button. variant: 'primary' | 'secondary'. Internal `route` or external `href`.
// ---------------------------------------------------------------------------
export function btn({
  label,
  route,
  href,
  variant = "primary",
  external = false,
}) {
  const cls = `btn btn--${variant}`;
  if (route !== undefined)
    return `<a class="${cls}" href="{{base}}${route}${route ? "/" : ""}">${esc(label)}</a>`;
  const ext = external ? ' target="_blank" rel="noopener"' : "";
  const arrow = external
    ? ' <span class="ext" aria-hidden="true">↗</span>'
    : "";
  return `<a class="${cls}" href="${href}"${ext}>${esc(label)}${arrow}</a>`;
}

// Inline external link with the ↗ indicator (design A4).
export function extlink(label, href) {
  return `<a href="${href}" target="_blank" rel="noopener">${esc(label)} <span class="ext" aria-hidden="true">↗</span></a>`;
}

// H2 with an id + hover anchor, and it feeds the on-page TOC.
export function h2(text, id = slug(text)) {
  return `<h2 id="${id}"><a class="head-anchor" href="#${id}" aria-label="Link to this section">#</a>${esc(text)}</h2>`;
}

export function h3(text, id = slug(text)) {
  return `<h3 id="${id}">${esc(text)}</h3>`;
}

// Extract {id, text} for every h2 in a rendered body (for the TOC rail).
export function extractToc(html) {
  const out = [];
  const re = /<h2 id="([^"]+)">(?:<a[^>]*>#<\/a>)?([^<]+)<\/h2>/g;
  let m;
  while ((m = re.exec(html))) out.push({ id: m[1], text: m[2].trim() });
  return out;
}

// Small helper for a "kbd" key chip.
export const kbd = (k) => `<kbd>${esc(k)}</kbd>`;
