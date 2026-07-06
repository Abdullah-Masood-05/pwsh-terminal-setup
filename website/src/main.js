// main.js — progressive enhancement only. The site is fully readable without it.
(() => {
  'use strict';

  /* ---- theme toggle (default dark; choice persisted) ------------------- */
  (function () {
    var root = document.documentElement;
    var btn = document.getElementById('theme-toggle');
    var label = function (t) { return t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'; };
    function set(theme) {
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem('theme', theme); } catch (_) {}
      if (btn) btn.setAttribute('aria-label', label(theme));
    }
    if (btn) {
      // sync the label with the theme the inline head script already applied
      btn.setAttribute('aria-label', label(root.getAttribute('data-theme') || 'dark'));
      btn.addEventListener('click', function () {
        set(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
      });
    }
  })();

  /* ---- copy buttons ---------------------------------------------------- */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* fall through */ }
    }
    // Fallback for file:// / insecure contexts.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  document.querySelectorAll('.cmd__copy').forEach((btn) => {
    const label = btn.querySelector('.cmd__copy-text');
    const original = label ? label.textContent : 'Copy';
    let timer;
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      const ok = await copyText(text);
      if (label) label.textContent = ok ? 'Copied' : 'Press Ctrl+C';
      btn.classList.toggle('is-copied', ok);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (label) label.textContent = original;
        btn.classList.remove('is-copied');
      }, 1500);
    });
  });

  /* ---- before / after terminal toggle ---------------------------------- */
  document.querySelectorAll('[data-demo]').forEach((demo) => {
    const tabs = demo.querySelectorAll('.demo__tab');
    const panels = demo.querySelectorAll('.demo__panel');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        const target = tab.getAttribute('data-target');
        panels.forEach((p) => { p.hidden = p.getAttribute('data-panel') !== target; });
      });
    });
  });

  /* ---- mobile top-nav toggle ------------------------------------------- */
  const navToggle = document.querySelector('.topnav__toggle');
  const topnav = document.getElementById('topnav');
  if (navToggle && topnav) {
    navToggle.addEventListener('click', () => {
      const open = topnav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---- docs sidebar drawer --------------------------------------------- */
  const sideToggle = document.querySelector('.sidebar__toggle');
  const sidebar = document.getElementById('sidebar');
  if (sideToggle && sidebar) {
    sideToggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('is-open');
      sideToggle.setAttribute('aria-expanded', String(open));
    });
    // close the drawer after picking a link on mobile
    sidebar.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 1024px)').matches) {
          sidebar.classList.remove('is-open');
          sideToggle.setAttribute('aria-expanded', 'false');
        }
      })
    );
  }

  /* ---- elevate the top bar on scroll (the one allowed shadow) ---------- */
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- screenshot lightbox (click any .shot to view it full size) ------ */
  (function () {
    var imgs = document.querySelectorAll('.shot img');
    if (!imgs.length) return;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<button class="lightbox__close" type="button" aria-label="Close">×</button><img alt="">';
    document.body.appendChild(box);
    var full = box.querySelector('img');
    var closeBtn = box.querySelector('.lightbox__close');
    var opener = null;
    function open(im) {
      opener = im;
      full.src = im.currentSrc || im.src;
      full.alt = im.alt || '';
      box.classList.add('is-open');
      closeBtn.focus();
    }
    function close() {
      box.classList.remove('is-open');
      full.src = '';
      if (opener) { opener.focus(); opener = null; }
    }
    imgs.forEach(function (im) {
      im.addEventListener('click', function () { open(im); });
    });
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target === closeBtn) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });
  })();

  /* ---- scroll-spy: highlight TOC + sidebar sub-item for the section ---- */
  const headings = Array.from(document.querySelectorAll('.prose h2[id]'));
  if (headings.length) {
    const tocLinks = new Map();
    document.querySelectorAll('.toc a[data-toc]').forEach((a) => tocLinks.set(a.getAttribute('data-toc'), a));
    const spyLinks = new Map();
    document.querySelectorAll('.sidebar__link[data-spy]').forEach((a) => spyLinks.set(a.getAttribute('data-spy'), a));

    let current = null;
    const setActive = (id) => {
      if (id === current) return;
      current = id;
      tocLinks.forEach((a, key) => a.classList.toggle('is-active', key === id));
      spyLinks.forEach((a, key) => a.classList.toggle('is-spy', key === id));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-72px 0px -70% 0px', threshold: 0 }
    );
    headings.forEach((h) => observer.observe(h));
  }
})();
