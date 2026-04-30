/* RegulonDB MG — Router + Views
   Vanilla JS SPA with hash routing: #/organism/type/id
   All rendering via template strings + DOM events. */

(function () {
  const D = window.REGDB_DATA;
  const ICONS = window.REGDB_ICONS;
  const app = document.getElementById('app');

  // ---------- state ----------
  const state = {
    orgId: localStorage.getItem('regdb.org') || 'ecoli-k12',
    drawerOpen: false,
    theme: localStorage.getItem('regdb.theme') || 'auto',
    tweaks: JSON.parse(localStorage.getItem('regdb.tweaks') || '{}'),
  };
  const tweaksDefault = { genePageLayout: 'tabs', orgSelectorStyle: 'drawer', accentUsage: 'moderate' };
  state.tweaks = Object.assign({}, tweaksDefault, state.tweaks);

  function saveTweaks() { localStorage.setItem('regdb.tweaks', JSON.stringify(state.tweaks)); }
  function saveOrg() { localStorage.setItem('regdb.org', state.orgId); }

  function getOrg(id) { return D.organisms.find(o => o.id === (id || state.orgId)); }

  // ---------- theme ----------
  function applyTheme() {
    if (state.theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('regdb.theme', state.theme);
  }

  // ---------- routing ----------
  // hash patterns:
  //   #/                          → redirect to /<org>/home
  //   #/<org>/home
  //   #/<org>/gene/<id>
  //   #/<org>/tf/<id>
  //   #/<org>/regulon/<id>
  //   #/<org>/search?q=...
  //   #/<org>/compare/tf/<id>
  function parseHash() {
    const h = window.location.hash.replace(/^#\/?/, '');
    if (!h) return { org: state.orgId, view: 'home', id: null, query: '' };
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    // Cross-organism routes don't carry an organism prefix.
    const CROSS_ORG_VIEWS = new Set(['summary-history', 'pan-regulome', 'rri-leaderboard', 'downloads']);
    if (parts[0] && CROSS_ORG_VIEWS.has(parts[0])) {
      return { org: state.orgId, view: parts[0], id: parts.slice(1).join('/') || null, query: qs || '' };
    }
    const org = parts[0] || state.orgId;
    const view = parts[1] || 'home';
    const id = parts.slice(2).join('/') || null;
    return { org, view, id, query: qs || '' };
  }

  function navigate(path) {
    window.location.hash = '#' + path;
  }

  function setOrg(id) {
    state.orgId = id; saveOrg();
    // Stay on the same view type if possible
    const r = parseHash();
    navigate(`/${id}/${r.view === 'home' ? 'home' : r.view}${r.id ? '/' + r.id : ''}${r.query ? '?' + r.query : ''}`);
  }

  // ---------- shell ----------
  function renderShell() {
    const org = getOrg();
    app.innerHTML = `
      <a href="#main" class="skip-link">Skip to content</a>
      <header class="app-header" role="banner">
        <div class="app-header__inner">
          <a href="#/${state.orgId}/home" class="brand" aria-label="RegulonDB home">
            <img class="brand__logo" src="regulondb/logo-on-dark.svg" alt="RegulonDB" />
            <small class="brand__strap">Multi-organism · v12</small>
          </a>
          <button class="org-pill" id="orgPill" aria-haspopup="dialog" aria-expanded="false">
            <span class="org-pill__avatar" style="background:${org.color}">${org.initials}</span>
            <span><em class="taxon">${org.sci}</em><span class="org-pill__strain">${org.strain}</span></span>
            <span class="org-pill__chevron" aria-hidden="true">${ICONS.chevronDown}</span>
            <div class="org-dropdown" id="orgDropdown" role="menu" aria-label="Select organism"></div>
          </button>
          <div class="header-search">
            <span class="header-search__icon" aria-hidden="true">${ICONS.search}</span>
            <input type="search" id="globalSearch" placeholder="Search genes, TFs, operons, regulons…" aria-label="Global search" autocomplete="off" />
            <span class="header-search__kbd">⌘K</span>
            <div id="acMenu"></div>
          </div>
          <div class="header-right">
            <button id="setsIndicator" class="sets-indicator" aria-label="Working set">
              <span class="sets-indicator__icon" aria-hidden="true">⊕</span>
              <span class="sets-indicator__label">Set</span>
              <span class="sets-indicator__count" data-set-count>0</span>
            </button>
            <button class="icon-btn" id="themeBtn" aria-label="Toggle theme" data-tip="Theme">${ICONS.theme}</button>
            <button class="icon-btn" aria-label="Downloads" data-tip="Downloads">${ICONS.download}</button>
            <button class="icon-btn" aria-label="Help" data-tip="Help">${ICONS.help}</button>
            <button class="icon-btn" id="tweaksBtn" aria-label="Tweaks" data-tip="Tweaks" style="display:none">${ICONS.sliders}</button>
          </div>
        </div>
      </header>
      <nav class="app-nav" role="navigation" aria-label="Primary">
        <div class="app-nav__inner" id="primaryNav"></div>
      </nav>
      <main id="main" tabindex="-1"><div id="view" class="container"></div></main>
      <div class="drawer-backdrop" id="drawerBackdrop"></div>
      <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Select organism"></aside>
      <div class="tweaks" id="tweaksPanel" role="dialog" aria-label="Tweaks panel"></div>

      <div class="drawer-backdrop" id="setsBackdrop"></div>
      <aside class="drawer drawer--sets" id="setsDrawer" role="dialog" aria-modal="true" aria-label="Working set">
        <div class="drawer__header">
          <strong>Working set</strong>
          <button class="icon-btn" data-action="close-sets" aria-label="Close working set">×</button>
        </div>
        <div class="drawer__body" id="setsDrawerBody"></div>
      </aside>
    `;
    renderPrimaryNav();
    renderDrawer();
    renderDropdown();
    renderTweaksPanel();
    bindShellEvents();
    updateSetIndicator();
  }

  function renderDropdown() {
    const dd = document.getElementById('orgDropdown');
    dd.innerHTML = `
      <div class="org-dropdown__search">
        <span aria-hidden="true">${ICONS.search}</span>
        <input type="search" placeholder="Filter organisms…" aria-label="Filter organisms" id="orgDDSearch"/>
      </div>
      <div id="orgDDList">
        ${D.organisms.map(o => `
          <button class="org-dd-row ${o.id === state.orgId ? 'is-active' : ''}" data-org-dd="${o.id}" role="menuitemradio" aria-checked="${o.id === state.orgId}">
            <span class="org-dd-row__avatar" style="background:${o.color}">${o.initials}</span>
            <div>
              <div class="org-dd-row__name"><em>${o.sci}</em></div>
              <div class="org-dd-row__strain">${o.strain}</div>
            </div>
            <span class="org-dd-row__count">${o.stats.genes.toLocaleString()} genes</span>
          </button>
        `).join('')}
      </div>
      <div class="org-dropdown__foot">
        <span>3 of 3 shown</span>
        <button type="button" id="orgDDFull">Open full selector →</button>
      </div>
    `;
  }

  function renderPrimaryNav() {
    const items = [
      { id: 'home', label: 'Home', path: `/${state.orgId}/home` },
      { id: 'gene', label: 'Genes', path: `/${state.orgId}/search?type=gene` },
      { id: 'operon', label: 'Operons', path: `/${state.orgId}/search?type=operon` },
      { id: 'regulon', label: 'Regulons', path: `/${state.orgId}/regulon/AraC` },
      { id: 'tf', label: 'Transcription Factors', path: `/${state.orgId}/tf/LexA` },
      { id: 'promoter', label: 'Promoters', path: `/${state.orgId}/search?type=promoter` },
      { id: 'dataset', label: 'Datasets HT', path: `/${state.orgId}/search?type=dataset` },
      { id: 'compare', label: 'Cross-organism', path: `/${state.orgId}/compare/tf/LexA` },
      { id: 'pan-regulome', label: 'Pan-regulome', path: '/pan-regulome' },
      { id: 'rri-leaderboard', label: 'RRI', path: '/rri-leaderboard' },
      { id: 'summary-history', label: 'Updates', path: '/summary-history' },
      { id: 'tools', label: 'Tools', path: `/${state.orgId}/home#tools` },
      { id: 'downloads', label: 'Downloads', path: '/downloads' },
    ];
    const r = parseHash();
    document.getElementById('primaryNav').innerHTML = items.map(i =>
      `<a href="#${i.path}" class="${r.view === i.id ? 'is-active' : ''}">${i.label}</a>`
    ).join('');
  }

  function renderDrawer() {
    const drawer = document.getElementById('drawer');
    drawer.innerHTML = `
      <div class="drawer__header">
        <div>
          <h2>Select organism</h2>
          <p>Current context persists across pages when the target object exists.</p>
        </div>
        <button class="drawer__close" id="drawerClose" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="drawer__search">
        <span aria-hidden="true">${ICONS.search}</span>
        <input type="search" placeholder="Filter organisms…" aria-label="Filter organisms" />
      </div>
      <div class="drawer__list">
        ${D.organisms.map(o => `
          <button class="org-card ${o.id === state.orgId ? 'is-active' : ''}" data-org="${o.id}">
            <div class="org-card__top">
              <span class="org-card__avatar" style="background:${o.color}">${o.initials}</span>
              <div>
                <div class="org-card__name"><em>${o.sci}</em></div>
                <div class="org-card__strain">${o.strain} · NCBI:txid${o.taxid}</div>
              </div>
              ${o.id === state.orgId ? `<span class="org-card__active-badge">Active</span>` : ''}
            </div>
            <div class="org-card__stats">
              <div class="org-card__stat"><div class="org-card__stat-value">${o.stats.genes.toLocaleString()}</div><div class="org-card__stat-label">Genes</div></div>
              <div class="org-card__stat"><div class="org-card__stat-value">${o.stats.tfs}</div><div class="org-card__stat-label">TFs</div></div>
              <div class="org-card__stat"><div class="org-card__stat-value">${o.stats.regulons}</div><div class="org-card__stat-label">Regulons</div></div>
              <div class="org-card__stat"><div class="org-card__stat-value">${o.version}</div><div class="org-card__stat-label">Version</div></div>
            </div>
          </button>
        `).join('')}
        <div class="card card--note" style="margin-top: 1.25rem">
          <div class="hstack" style="margin-bottom: 0.5rem">${ICONS.info} <strong>More organisms incoming</strong></div>
          <p class="tiny muted" style="margin:0">Corynebacterium glutamicum, Pseudomonas aeruginosa and Mycobacterium tuberculosis are in curation pipeline for v13.</p>
        </div>
      </div>
    `;
  }

  function renderTweaksPanel() {
    const panel = document.getElementById('tweaksPanel');
    panel.innerHTML = `
      <div class="tweaks__hd">
        <h4>Tweaks</h4>
        <button class="icon-btn" id="tweaksClose" aria-label="Close">${ICONS.close}</button>
      </div>
      <div class="tweaks__body">
        <div class="tweak-group">
          <span class="tweak-group__label">Gene page layout</span>
          <div class="tweak-opts" data-tweak="genePageLayout">
            <button class="tweak-opt ${state.tweaks.genePageLayout==='tabs'?'is-on':''}" data-val="tabs">Tabs</button>
            <button class="tweak-opt ${state.tweaks.genePageLayout==='longscroll'?'is-on':''}" data-val="longscroll">Long-scroll · TOC</button>
          </div>
        </div>
        <div class="tweak-group">
          <span class="tweak-group__label">Organism selector</span>
          <div class="tweak-opts" data-tweak="orgSelectorStyle">
            <button class="tweak-opt ${state.tweaks.orgSelectorStyle==='drawer'?'is-on':''}" data-val="drawer">Drawer</button>
            <button class="tweak-opt ${state.tweaks.orgSelectorStyle==='dropdown'?'is-on':''}" data-val="dropdown">Dropdown</button>
          </div>
        </div>
        <div class="tweak-group">
          <span class="tweak-group__label">Accent color usage</span>
          <div class="tweak-opts" data-tweak="accentUsage">
            <button class="tweak-opt ${state.tweaks.accentUsage==='restrained'?'is-on':''}" data-val="restrained">Restrained</button>
            <button class="tweak-opt ${state.tweaks.accentUsage==='moderate'?'is-on':''}" data-val="moderate">Moderate</button>
            <button class="tweak-opt ${state.tweaks.accentUsage==='generous'?'is-on':''}" data-val="generous">Generous</button>
          </div>
        </div>
        <div class="tweak-group">
          <span class="tweak-group__label">Theme</span>
          <div class="tweak-opts" data-tweak="theme">
            <button class="tweak-opt ${state.theme==='auto'?'is-on':''}" data-val="auto">Auto</button>
            <button class="tweak-opt ${state.theme==='light'?'is-on':''}" data-val="light">Light</button>
            <button class="tweak-opt ${state.theme==='dark'?'is-on':''}" data-val="dark">Dark</button>
          </div>
        </div>
      </div>
    `;
  }

  function bindShellEvents() {
    document.getElementById('orgPill').addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.tweaks.orgSelectorStyle === 'dropdown') toggleDropdown();
      else openDrawer(true);
    });
    document.getElementById('drawerBackdrop').addEventListener('click', () => openDrawer(false));
    document.getElementById('drawerClose').addEventListener('click', () => openDrawer(false));
    document.querySelectorAll('[data-org]').forEach(btn => {
      btn.addEventListener('click', () => {
        setOrg(btn.dataset.org);
        openDrawer(false);
      });
    });
    // Dropdown wiring
    document.querySelectorAll('[data-org-dd]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setOrg(btn.dataset.orgDd);
        toggleDropdown(false);
      });
    });
    const ddSearch = document.getElementById('orgDDSearch');
    if (ddSearch) {
      ddSearch.addEventListener('click', (e) => e.stopPropagation());
      ddSearch.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('[data-org-dd]').forEach(r => {
          const o = D.organisms.find(x => x.id === r.dataset.orgDd);
          r.style.display = (o.sci + ' ' + o.strain + ' ' + o.short).toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }
    const ddFull = document.getElementById('orgDDFull');
    if (ddFull) ddFull.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(false); openDrawer(true); });
    document.addEventListener('click', () => toggleDropdown(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleDropdown(false); });
    document.getElementById('themeBtn').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(); renderTweaksPanel(); bindTweaksEvents();
    });
    document.getElementById('tweaksClose').addEventListener('click', toggleTweaksPanel);
    document.getElementById('tweaksBtn').addEventListener('click', toggleTweaksPanel);
    bindTweaksEvents();
    bindSearchEvents();
    bindSetEvents();
    bindSetsDrawerEvents();

    // Edit-mode (Tweaks toolbar) protocol
    window.addEventListener('message', (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') document.getElementById('tweaksPanel').classList.add('is-visible');
      if (e.data.type === '__deactivate_edit_mode') document.getElementById('tweaksPanel').classList.remove('is-visible');
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}
  }

  // ----------------------------------------------------------------------
  //  Branded modal dialogs — replace window.prompt / window.confirm with
  //  components that match the design system. Built once on demand, mounted
  //  to <body>, focus-trapped, ESC + click-outside dismiss.
  //
  //  See lib/src/components/organisms/PromptDialog.tsx for the React version
  //  of the same component contract.
  // ----------------------------------------------------------------------

  function ensureDialogHost() {
    let host = document.getElementById('regdb-modal-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'regdb-modal-host';
      document.body.appendChild(host);
    }
    return host;
  }

  function openDialog({ title, description, body, primaryLabel, cancelLabel, tone, onSubmit }) {
    return new Promise((resolve) => {
      const host = ensureDialogHost();
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
          <h3 id="modal-title">${title}</h3>
          ${description ? `<p class="modal-desc">${description}</p>` : ''}
          ${body || ''}
          <div class="modal-actions">
            <button class="btn btn--ghost" data-act="cancel">${cancelLabel || 'Cancel'}</button>
            <button class="btn ${tone === 'destructive' ? 'btn--destructive' : 'btn--primary'}" data-act="primary">${primaryLabel || 'OK'}</button>
          </div>
        </div>
      `;
      host.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const panel = overlay.querySelector('.modal-panel');
      const previouslyFocused = document.activeElement;
      const focusables = () => panel.querySelectorAll('input, button, [tabindex="0"]');
      const firstField = panel.querySelector('input, textarea');
      setTimeout(() => (firstField || panel).focus({ preventScroll: true }), 0);
      if (firstField && firstField.select) firstField.select();

      const cleanup = (val) => {
        overlay.removeEventListener('keydown', onKey);
        overlay.remove();
        document.body.style.overflow = '';
        if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
        resolve(val);
      };
      const onKey = (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); cleanup(null); return; }
        if (e.key === 'Enter' && (e.target.tagName === 'INPUT' || e.target.dataset.act === 'primary')) {
          e.preventDefault();
          const submitted = onSubmit ? onSubmit(panel) : true;
          if (submitted !== false) cleanup(submitted);
          return;
        }
        if (e.key === 'Tab') {
          const list = Array.from(focusables());
          if (!list.length) return;
          const first = list[0], last = list[list.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      overlay.addEventListener('keydown', onKey);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(null);
      });
      panel.querySelector('[data-act="cancel"]').addEventListener('click', () => cleanup(null));
      panel.querySelector('[data-act="primary"]').addEventListener('click', () => {
        const submitted = onSubmit ? onSubmit(panel) : true;
        if (submitted !== false) cleanup(submitted);
      });
    });
  }

  /** Branded `prompt()` replacement. Resolves with string|null. */
  function dialogPrompt({ title, description, label, defaultValue = '', placeholder = '', confirmLabel = 'Save', validate }) {
    return openDialog({
      title, description,
      body: `
        ${label ? `<label class="modal-label" for="modal-input">${label}</label>` : ''}
        <input class="modal-input" id="modal-input" type="text" value="${(defaultValue || '').replace(/"/g, '&quot;')}" placeholder="${placeholder.replace(/"/g, '&quot;')}" autocomplete="off"/>
        <div class="modal-error" id="modal-error" hidden></div>
      `,
      primaryLabel: confirmLabel,
      cancelLabel: 'Cancel',
      onSubmit(panel) {
        const input = panel.querySelector('#modal-input');
        const errBox = panel.querySelector('#modal-error');
        const value = (input.value || '').trim();
        const err = validate ? validate(value) : null;
        if (err) {
          errBox.textContent = err;
          errBox.hidden = false;
          input.setAttribute('aria-invalid', 'true');
          input.focus();
          return false;
        }
        return value;
      },
    });
  }

  /** Branded `confirm()` replacement. Resolves with true/false. */
  function dialogConfirm({ title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone }) {
    return openDialog({
      title, description,
      primaryLabel: confirmLabel, cancelLabel, tone,
      onSubmit() { return true; },
    }).then((v) => v === true);
  }

  // ----------------------------------------------------------------------
  //  Working sets (Add to set + set ops)
  // ----------------------------------------------------------------------
  //  Storage:
  //    regdb.sets.current = [{ organism, type, id, label, addedAt }]
  //    regdb.sets.saved   = { [name]: { items, savedAt } }
  //
  //  Items are organism-scoped (a gene "araC" in E. coli is distinct from
  //  one in S. enterica). Migration: any pre-existing `regdb-set` array of
  //  bare symbols is converted to the new shape on first read.
  //
  //  v1 is localStorage-only. v2 round-trips to a backend.
  // ----------------------------------------------------------------------
  const SETS_KEY = 'regdb.sets.v2';

  function loadSets() {
    // 1) Migrate v1 (regdb-set as string[]) if present.
    const legacy = localStorage.getItem('regdb-set');
    if (legacy && !localStorage.getItem(SETS_KEY)) {
      try {
        const symbols = JSON.parse(legacy);
        if (Array.isArray(symbols)) {
          const migrated = {
            current: symbols.map(s => ({
              organism: state.orgId, type: 'gene', id: String(s),
              label: String(s), addedAt: Date.now(),
            })),
            saved: {},
          };
          localStorage.setItem(SETS_KEY, JSON.stringify(migrated));
          localStorage.removeItem('regdb-set');
          return migrated;
        }
      } catch { /* fall through */ }
    }
    try {
      const parsed = JSON.parse(localStorage.getItem(SETS_KEY) || '{"current":[],"saved":{}}');
      if (!parsed.current) parsed.current = [];
      if (!parsed.saved)   parsed.saved   = {};
      return parsed;
    } catch {
      return { current: [], saved: {} };
    }
  }
  function persistSets(sets) {
    localStorage.setItem(SETS_KEY, JSON.stringify(sets));
    updateSetIndicator();
    // If the drawer is open, re-render its body live.
    const dr = document.getElementById('setsDrawer');
    if (dr && dr.classList.contains('is-open')) renderSetsDrawerBody();
  }

  function setItemKey(it) { return `${it.organism}:${it.type}:${it.id}`; }
  function inCurrent(items, it) { return items.some(x => setItemKey(x) === setItemKey(it)); }

  // Toast (also accepts a "tone" for error / success differentiation)
  function toast(msg, tone) {
    let el = document.getElementById('regdb-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'regdb-toast';
      el.style.cssText = [
        'position:fixed', 'right:20px', 'bottom:20px', 'z-index:9999',
        'background:var(--surface-raised, #fff)',
        'border:1px solid var(--border-default, #d5d5d7)',
        'border-left:3px solid var(--blue-2, #32617D)',
        'border-radius:6px', 'padding:12px 16px',
        'box-shadow:0 2px 6px rgba(31,61,78,0.10)',
        'max-width:360px', 'font-family:Arial,sans-serif',
        'font-size:14px', 'color:var(--text-primary, #373737)',
        'transition:opacity 200ms',
      ].join(';');
      document.body.appendChild(el);
    }
    const color = tone === 'error' ? 'var(--error, #C93A1D)'
               : tone === 'success' ? 'var(--blue-2, #32617D)'
               : 'var(--blue-3, #3D779B)';
    el.style.borderLeftColor = color;
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.style.opacity = '0'; }, 2400);
  }

  // ---------- Add-to-set + bulk-add events ----------
  function bindSetEvents() {
    if (bindSetEvents._bound) return;
    bindSetEvents._bound = true;
    // Single click: data-action="add-to-set" on any element carrying the
    // payload via data attributes.
    document.addEventListener('click', (e) => {
      const single = e.target.closest('[data-action="add-to-set"]');
      if (single) {
        e.preventDefault();
        addToSetFromEl(single);
        return;
      }
      const bulk = e.target.closest('[data-action="add-selected-to-set"]');
      if (bulk) {
        e.preventDefault();
        const root = document.getElementById(bulk.dataset.scope) || document;
        const checks = root.querySelectorAll('[data-action="set-row"]:checked');
        if (!checks.length) { toast('Select rows first', 'error'); return; }
        let added = 0, skipped = 0;
        const sets = loadSets();
        checks.forEach(c => {
          const item = {
            organism: c.dataset.organism, type: c.dataset.type,
            id: c.dataset.id, label: c.dataset.label || c.dataset.id,
            addedAt: Date.now(),
          };
          if (inCurrent(sets.current, item)) { skipped++; return; }
          sets.current.push(item); added++;
        });
        persistSets(sets);
        toast(`Added ${added} item${added === 1 ? '' : 's'}${skipped ? ` · ${skipped} already in set` : ''} · ${sets.current.length} total`, 'success');
        // Uncheck after adding.
        checks.forEach(c => { c.checked = false; });
        const all = root.querySelector('[data-action="set-row-all"]');
        if (all) all.checked = false;
        return;
      }
      const removeBtn = e.target.closest('[data-action="remove-from-set"]');
      if (removeBtn) {
        e.preventDefault();
        const sets = loadSets();
        sets.current = sets.current.filter(x => setItemKey(x) !== removeBtn.dataset.key);
        persistSets(sets);
        return;
      }
      // "Select all" rows toggle inside a table
      const allBox = e.target.closest('[data-action="set-row-all"]');
      if (allBox) {
        const root = document.getElementById(allBox.dataset.scope) || document;
        const rows = root.querySelectorAll('[data-action="set-row"]');
        rows.forEach(r => { r.checked = allBox.checked; });
      }
    });
  }

  function addToSetFromEl(el) {
    // Backwards compat: support old data-target-symbol-only buttons.
    const item = {
      organism: el.dataset.organism || state.orgId,
      type:     el.dataset.type     || 'gene',
      id:       el.dataset.id       || el.dataset.targetSymbol,
      label:    el.dataset.label    || el.dataset.targetSymbol || el.dataset.id,
      addedAt:  Date.now(),
    };
    if (!item.id) { toast('Item missing id', 'error'); return; }
    const sets = loadSets();
    if (inCurrent(sets.current, item)) {
      toast(`${item.label} is already in your set (${sets.current.length} items)`);
      return;
    }
    sets.current.push(item);
    persistSets(sets);
    toast(`Added ${item.label} · ${sets.current.length} item${sets.current.length === 1 ? '' : 's'} total`, 'success');
  }

  // ---------- Header indicator ----------
  function updateSetIndicator() {
    const el = document.getElementById('setsIndicator');
    if (!el) return;
    const n = loadSets().current.length;
    el.querySelector('[data-set-count]').textContent = String(n);
    el.classList.toggle('has-items', n > 0);
    el.setAttribute('aria-label', n ? `Working set · ${n} item${n === 1 ? '' : 's'}` : 'Working set · empty');
  }

  // ---------- Sets drawer ----------
  function renderSetsDrawerBody() {
    const sets = loadSets();
    const items = sets.current;
    const grouped = items.reduce((acc, it) => {
      (acc[it.type] = acc[it.type] || []).push(it);
      return acc;
    }, {});
    const TYPE_LABEL = { gene: 'Genes', tf: 'TFs', regulon: 'Regulons', operon: 'Operons', promoter: 'Promoters', dataset: 'Datasets' };
    const TYPE_ORDER = ['gene', 'operon', 'tf', 'regulon', 'promoter', 'dataset'];

    const savedNames = Object.keys(sets.saved);
    const orgFor = id => (D.organisms.find(o => o.id === id) || { short: id, sci: id, strain: '' });

    const body = document.getElementById('setsDrawerBody');
    if (!body) return;
    body.innerHTML = `
      <div class="sets-drawer__hd">
        <strong>Working set</strong>
        <span class="sets-drawer__counter">${items.length} item${items.length === 1 ? '' : 's'}</span>
      </div>

      ${items.length === 0 ? `
        <div class="sets-drawer__empty">
          <p style="margin:0 0 0.25rem 0; font-weight:700">Your working set is empty.</p>
          <p style="margin:0; color:var(--text-secondary)">Click <strong>Add to set</strong> on any gene, TF, regulon, operon, or table row. Items are scoped per organism so an <em class="gene">araC</em> in <em class="taxon">E. coli</em> is distinct from one in <em class="taxon">S. enterica</em>.</p>
        </div>
      ` : `
        <div class="sets-drawer__toolbar">
          <button class="btn btn--ghost btn--sm" data-action="export-set" data-fmt="tsv">Export TSV</button>
          <button class="btn btn--ghost btn--sm" data-action="export-set" data-fmt="csv">Export CSV</button>
          <button class="btn btn--ghost btn--sm" data-action="export-set" data-fmt="json">Export JSON</button>
          <button class="btn btn--ghost btn--sm" data-action="save-set" style="margin-left:auto">Save as…</button>
          <button class="btn btn--ghost btn--sm" data-action="clear-set">Clear</button>
        </div>

        ${TYPE_ORDER.filter(t => grouped[t]).map(t => `
          <div class="sets-drawer__group">
            <div class="sets-drawer__group-title">
              <span class="obj-tag obj-tag--${t}">${TYPE_LABEL[t] || t}</span>
              <span class="tiny muted">${grouped[t].length}</span>
            </div>
            <ul class="sets-drawer__list">
              ${grouped[t].map(it => {
                const o = orgFor(it.organism);
                const path = it.type === 'gene' ? `#/${it.organism}/gene/${it.id}`
                           : it.type === 'tf' ? `#/${it.organism}/tf/${it.id}`
                           : it.type === 'regulon' ? `#/${it.organism}/regulon/${it.id}`
                           : '#';
                return `
                  <li>
                    <a href="${path}" class="sets-drawer__item">
                      <span class="sets-drawer__item-label">${it.type === 'gene' ? `<em class="gene">${it.label}</em>` : it.label}</span>
                      <span class="sets-drawer__item-meta"><em class="taxon">${o.sci}</em> ${o.strain}</span>
                    </a>
                    <button class="icon-btn icon-btn--sm" data-action="remove-from-set" data-key="${setItemKey(it)}" aria-label="Remove ${it.label}">×</button>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        `).join('')}
      `}

      ${savedNames.length > 0 ? `
        <hr class="divider" style="margin: 1rem 0">
        <div class="sets-drawer__hd">
          <strong>Saved sets</strong>
          <span class="sets-drawer__counter">${savedNames.length}</span>
        </div>
        <ul class="sets-drawer__saved">
          ${savedNames.map(name => `
            <li>
              <div>
                <strong>${name}</strong>
                <span class="tiny muted">${sets.saved[name].items.length} items</span>
              </div>
              <div class="hstack" style="gap:4px">
                <button class="btn btn--ghost btn--sm" data-action="load-set" data-name="${name}">Load</button>
                <button class="btn btn--ghost btn--sm" data-action="delete-saved" data-name="${name}" aria-label="Delete saved set ${name}">Delete</button>
              </div>
            </li>
          `).join('')}
        </ul>

        ${savedNames.length >= 2 ? `
          <div class="sets-drawer__ops">
            <strong style="display:block; margin-bottom:0.5rem">Set operations</strong>
            <p class="tiny muted" style="margin:0 0 0.5rem">Operate on two saved sets — result becomes your working set.</p>
            <div class="hstack" style="gap:6px; flex-wrap:wrap">
              <select id="setOpA">${savedNames.map(n => `<option>${n}</option>`).join('')}</select>
              <select id="setOpB">${savedNames.map((n, i) => `<option ${i === 1 ? 'selected' : ''}>${n}</option>`).join('')}</select>
              <button class="btn btn--ghost btn--sm" data-action="set-op" data-op="intersect">Intersect</button>
              <button class="btn btn--ghost btn--sm" data-action="set-op" data-op="union">Union</button>
              <button class="btn btn--ghost btn--sm" data-action="set-op" data-op="difference">A − B</button>
            </div>
          </div>
        ` : ''}
      ` : ''}
    `;
  }

  function openSetsDrawer(open) {
    const dr = document.getElementById('setsDrawer');
    const bd = document.getElementById('setsBackdrop');
    if (!dr) return;
    const willOpen = open == null ? !dr.classList.contains('is-open') : open;
    dr.classList.toggle('is-open', willOpen);
    bd.classList.toggle('is-open', willOpen);
    if (willOpen) renderSetsDrawerBody();
  }

  // ---------- Set ops + export ----------
  function exportSetItems(items, fmt) {
    const cols = ['organism', 'type', 'id', 'label'];
    const filename = `regulondb-set.${fmt}`;
    let body = '', mime = 'text/plain';
    if (fmt === 'json') {
      body = JSON.stringify(items, null, 2); mime = 'application/json';
    } else {
      const sep = fmt === 'csv' ? ',' : '\t';
      const esc = s => fmt === 'csv' && /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      const lines = [cols.join(sep)];
      items.forEach(r => lines.push(cols.map(c => esc(String(r[c] ?? ''))).join(sep)));
      body = lines.join('\n');
      mime = fmt === 'csv' ? 'text/csv' : 'text/tab-separated-values';
    }
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function bindSetsDrawerEvents() {
    if (bindSetsDrawerEvents._bound) return;
    bindSetsDrawerEvents._bound = true;
    document.addEventListener('click', (e) => {
      const t = e.target;
      const expBtn = t.closest('[data-action="export-set"]');
      if (expBtn) { exportSetItems(loadSets().current, expBtn.dataset.fmt); return; }

      const clear = t.closest('[data-action="clear-set"]');
      if (clear) {
        dialogConfirm({
          title: 'Clear the working set?',
          description: `This removes all ${loadSets().current.length} item(s) from the working set. Saved sets are not affected.`,
          confirmLabel: 'Clear set',
          tone: 'destructive',
        }).then((ok) => {
          if (!ok) return;
          const sets = loadSets(); sets.current = []; persistSets(sets);
          toast('Working set cleared');
        });
        return;
      }
      const save = t.closest('[data-action="save-set"]');
      if (save) {
        dialogPrompt({
          title: 'Name this saved set',
          description: 'Give the working set a name so you can load or operate on it later.',
          label: 'Set name',
          placeholder: 'e.g. SOS targets — confirmed',
          confirmLabel: 'Save',
          validate: (v) => {
            if (!v) return 'Please enter a name.';
            if (v.length < 2)  return 'Name is too short.';
            if (v.length > 60) return 'Name is too long (max 60 characters).';
            return null;
          },
        }).then((name) => {
          if (!name) return;
          const sets = loadSets();
          const overwrite = !!sets.saved[name];
          if (overwrite) {
            dialogConfirm({
              title: `Overwrite "${name}"?`,
              description: 'A saved set with this name already exists. Replacing it cannot be undone.',
              confirmLabel: 'Overwrite',
              tone: 'destructive',
            }).then((ok) => {
              if (!ok) return;
              sets.saved[name] = { items: sets.current.slice(), savedAt: Date.now() };
              persistSets(sets);
              toast(`Saved as "${name}"`, 'success');
            });
          } else {
            sets.saved[name] = { items: sets.current.slice(), savedAt: Date.now() };
            persistSets(sets);
            toast(`Saved as "${name}"`, 'success');
          }
        });
        return;
      }
      const delSaved = t.closest('[data-action="delete-saved"]');
      if (delSaved) {
        const name = delSaved.dataset.name;
        dialogConfirm({
          title: `Delete saved set "${name}"?`,
          description: 'The saved set is removed permanently. This cannot be undone.',
          confirmLabel: 'Delete',
          tone: 'destructive',
        }).then((ok) => {
          if (!ok) return;
          const sets = loadSets();
          delete sets.saved[name];
          persistSets(sets);
        });
        return;
      }
      const load = t.closest('[data-action="load-set"]');
      if (load) {
        const sets = loadSets();
        const s = sets.saved[load.dataset.name];
        if (!s) return;
        sets.current = s.items.slice();
        persistSets(sets);
        toast(`Loaded "${load.dataset.name}" · ${sets.current.length} items`, 'success');
        return;
      }
      const op = t.closest('[data-action="set-op"]');
      if (op) {
        const sets = loadSets();
        const a = sets.saved[document.getElementById('setOpA').value];
        const b = sets.saved[document.getElementById('setOpB').value];
        if (!a || !b) return;
        const keysA = new Set(a.items.map(setItemKey));
        const keysB = new Set(b.items.map(setItemKey));
        let result;
        if (op.dataset.op === 'intersect')      result = a.items.filter(x => keysB.has(setItemKey(x)));
        else if (op.dataset.op === 'union')     result = [...a.items, ...b.items.filter(x => !keysA.has(setItemKey(x)))];
        else if (op.dataset.op === 'difference')result = a.items.filter(x => !keysB.has(setItemKey(x)));
        sets.current = result;
        persistSets(sets);
        toast(`${op.dataset.op}: ${result.length} item${result.length === 1 ? '' : 's'}`, 'success');
        return;
      }

      // Open / close drawer
      const opener = t.closest('#setsIndicator');
      if (opener) { e.preventDefault(); openSetsDrawer(); return; }
      const closer = t.closest('[data-action="close-sets"]');
      if (closer) { e.preventDefault(); openSetsDrawer(false); return; }
    });

    document.getElementById('setsBackdrop')?.addEventListener('click', () => openSetsDrawer(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const dr = document.getElementById('setsDrawer');
        if (dr?.classList.contains('is-open')) openSetsDrawer(false);
      }
    });
  }

  function bindTweaksEvents() {
    document.querySelectorAll('[data-tweak]').forEach(group => {
      group.querySelectorAll('.tweak-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = group.dataset.tweak;
          const val = btn.dataset.val;
          if (key === 'theme') { state.theme = val; applyTheme(); }
          else { state.tweaks[key] = val; saveTweaks(); }
          renderTweaksPanel(); bindTweaksEvents();
          try {
            window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
          } catch (_) {}
          renderRoute();
        });
      });
    });
  }

  function toggleTweaksPanel() {
    document.getElementById('tweaksPanel').classList.toggle('is-visible');
  }

  function openDrawer(open) {
    state.drawerOpen = open;
    document.getElementById('drawer').classList.toggle('is-open', open);
    document.getElementById('drawerBackdrop').classList.toggle('is-open', open);
    document.getElementById('orgPill').setAttribute('aria-expanded', String(open));
  }

  function toggleDropdown(force) {
    const dd = document.getElementById('orgDropdown');
    if (!dd) return;
    const willOpen = force == null ? !dd.classList.contains('is-open') : force;
    dd.classList.toggle('is-open', willOpen);
    document.getElementById('orgPill').setAttribute('aria-expanded', String(willOpen));
    if (willOpen) { const s = document.getElementById('orgDDSearch'); if (s) setTimeout(() => s.focus(), 50); }
  }

  // ---------- search / autocomplete ----------
  function bindSearchEvents() {
    const input = document.getElementById('globalSearch');
    const menu = document.getElementById('acMenu');
    let open = false;

    function close() { menu.innerHTML = ''; menu.className = ''; open = false; }
    function openMenu(q) {
      const results = window.REGDB_SEARCH.suggest(q);
      if (!results.length) { close(); return; }
      const grouped = {};
      results.forEach(r => { (grouped[r.type] = grouped[r.type] || []).push(r); });
      const labels = { gene: 'Genes', tf: 'Transcription factors', operon: 'Operons', regulon: 'Regulons', promoter: 'Promoters', dataset: 'Datasets HT' };
      menu.className = 'ac-menu';
      menu.innerHTML = Object.keys(grouped).map(t =>
        `<div class="ac-group-label">${labels[t] || t}</div>` +
        grouped[t].slice(0, 4).map(r => `
          <button class="ac-item" data-path="${r.path}">
            <span class="obj-tag obj-tag--${r.type}">${r.type}</span>
            <span class="ac-item__name">${r.type === 'gene' ? `<em>${r.name}</em>` : r.name}</span>
            <span class="ac-item__desc">${r.org ? '· ' + getOrg(r.org).short : ''}</span>
          </button>
        `).join('')
      ).join('') + `
        <div class="ac-footer">
          <span>Enter to search all · ⌘/Ctrl+Shift+A to toggle cross-organism</span>
          <span class="tiny">${results.length} hits</span>
        </div>`;
      open = true;
      menu.querySelectorAll('.ac-item').forEach(btn => {
        btn.addEventListener('click', () => { navigate(btn.dataset.path); close(); input.value = ''; });
      });
    }

    input.addEventListener('input', (e) => { const v = e.target.value.trim(); v ? openMenu(v) : close(); });
    input.addEventListener('focus', () => { if (input.value.trim()) openMenu(input.value.trim()); });
    input.addEventListener('blur', () => setTimeout(close, 120));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        if (q) { navigate(`/${state.orgId}/search?q=${encodeURIComponent(q)}`); input.value = ''; close(); }
      }
      if (e.key === 'Escape') close();
    });
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); }
    });
  }

  // ---------- route dispatch ----------
  function renderRoute() {
    const r = parseHash();
    if (!r.org || !getOrg(r.org)) { navigate(`/${state.orgId}/home`); return; }
    if (r.org !== state.orgId) { state.orgId = r.org; saveOrg(); renderShell(); }
    const view = document.getElementById('view');
    if (r.view === 'home') window.REGDB_VIEWS.home(view, r);
    else if (r.view === 'gene') window.REGDB_VIEWS.gene(view, r);
    else if (r.view === 'tf') window.REGDB_VIEWS.tf(view, r);
    else if (r.view === 'regulon') window.REGDB_VIEWS.regulon(view, r);
    else if (r.view === 'search') window.REGDB_VIEWS.search(view, r);
    else if (r.view === 'compare') window.REGDB_VIEWS.compare(view, r);
    else if (r.view === 'summary-history') window.REGDB_VIEWS.summaryHistory(view, r);
    else if (r.view === 'pan-regulome') window.REGDB_VIEWS.panRegulome(view, r);
    else if (r.view === 'rri-leaderboard') window.REGDB_VIEWS.rriLeaderboard(view, r);
    else if (r.view === 'downloads') window.REGDB_VIEWS.downloads(view, r);
    else window.REGDB_VIEWS.home(view, r);
    renderPrimaryNav();
    // focus main for keyboard users when view changes
    document.getElementById('main').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ---------- init ----------
  window.REGDB = {
    state, getOrg, navigate, parseHash,
    setOrg, openDrawer, renderRoute, toast,
  };

  window.addEventListener('hashchange', renderRoute);
  window.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    renderShell();
    if (!window.location.hash) navigate(`/${state.orgId}/home`);
    else renderRoute();
  });
})();
