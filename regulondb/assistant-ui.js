/* RegulonDB MG — Assistant UI
   ========================================================================
   Chat panel (slide-in right drawer), floating launcher button, per-page
   explainer rendering, and keyboard shortcuts. Wired to window.REGDB_ASSIST
   for the actual answers. The DOM markup mirrors the React design-system
   components in lib/src/components/ — same class names, same structure.

   Two surfaces:
     - ChatPanel : RAG chat with citations + follow-ups
     - ExplainerPanel : per-page explainer

   The panel scaffold is built once when the user opens it; subsequent
   message activity mutates only the messages container (or a single
   message node by id) so the composer never loses focus or scroll
   position mid-conversation.
   ======================================================================== */

(function () {
  const A = window.REGDB_ASSIST;

  const SUGGESTIONS = [
    'What is LexA and the SOS response?',
    'Compare LexA across organisms',
    'How does araC work?',
    'How is evidence classified?',
  ];

  // ----------------------------------------------------------------------
  //  State (single live chat thread)
  // ----------------------------------------------------------------------
  const state = {
    open: false,
    busy: false,
    history: [], // [{ id, role, html, cites, followups }]
    nextId: 1,
  };

  function uid() { return 'm' + (state.nextId++); }

  // Live DOM refs — populated by mount(), cleared by unmount().
  const refs = {
    host: null,
    panel: null,
    msgsEl: null,
    textarea: null,
    sendBtn: null,
    suggBtns: [],
  };

  // ----------------------------------------------------------------------
  //  Mount points
  // ----------------------------------------------------------------------
  function ensureHost() {
    let host = document.getElementById('regdb-assist-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'regdb-assist-host';
      document.body.appendChild(host);
    }
    return host;
  }

  function ensureFAB() {
    let fab = document.getElementById('regdb-assist-fab');
    if (fab) return fab;
    fab = document.createElement('button');
    fab.id = 'regdb-assist-fab';
    fab.className = 'assistant-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open RegulonDB assistant');
    fab.innerHTML = `
      <span class="assistant-fab__sparkle" aria-hidden="true">✦</span>
      <span>Ask RegulonDB</span>
      <span class="assistant-fab__kbd" aria-hidden="true">⌘J</span>
    `;
    fab.addEventListener('click', () => open(true));
    document.body.appendChild(fab);
    return fab;
  }

  // ----------------------------------------------------------------------
  //  Mount / unmount the panel scaffold (built once per open)
  // ----------------------------------------------------------------------
  function mount() {
    const host = ensureHost();
    host.innerHTML = `
      <div class="chat-panel-overlay" data-act="close" aria-hidden="true"></div>
      <aside class="chat-panel" role="dialog" aria-modal="true" aria-labelledby="regdb-assist-title" tabindex="-1">
        <header class="chat-panel__header">
          <h3 id="regdb-assist-title">
            <span aria-hidden="true">✦</span>
            RegulonDB Assistant
            <small>scripted answers</small>
          </h3>
          <button type="button" class="chat-panel__close" data-act="close" aria-label="Close assistant">×</button>
        </header>
        <div class="chat-panel__messages" id="regdb-assist-msgs"></div>
        <div class="chat-composer">
          <div class="chat-composer__suggestions" id="regdb-assist-sugs"></div>
          <div class="chat-composer__row">
            <textarea id="regdb-assist-input" class="chat-composer__input" rows="1"
                      placeholder="Ask about a gene, TF, regulon, or any concept…"></textarea>
            <button type="button" class="btn btn--primary btn--sm" id="regdb-assist-send" disabled>Send</button>
          </div>
          <div class="chat-composer__hint">
            <span class="kbd">↵</span> send · <span class="kbd">Shift</span>+<span class="kbd">↵</span> newline · <span class="kbd">Esc</span> close
          </div>
        </div>
      </aside>
    `;
    refs.host = host;
    refs.panel = host.querySelector('.chat-panel');
    refs.msgsEl = host.querySelector('#regdb-assist-msgs');
    refs.textarea = host.querySelector('#regdb-assist-input');
    refs.sendBtn = host.querySelector('#regdb-assist-send');

    // Suggestions row
    const sugsEl = host.querySelector('#regdb-assist-sugs');
    refs.suggBtns = SUGGESTIONS.map((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat-composer__suggestion';
      b.dataset.sugg = s;
      b.textContent = s;
      sugsEl.appendChild(b);
      return b;
    });

    // Composer behaviour: auto-grow + Enter-to-send + send-button enable.
    const updateSendEnabled = () => {
      refs.sendBtn.disabled = state.busy || !refs.textarea.value.trim();
    };
    refs.textarea.addEventListener('input', () => {
      refs.textarea.style.height = 'auto';
      refs.textarea.style.height = Math.min(refs.textarea.scrollHeight, 180) + 'px';
      updateSendEnabled();
    });
    refs.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(refs.textarea.value);
      }
    });
    refs.sendBtn.addEventListener('click', () => send(refs.textarea.value));

    // Replay any prior history into the freshly-mounted panel.
    if (state.history.length === 0) {
      appendSystemHint('Ask anything about the database. Answers come from the prototype\'s curated mock corpus and link back to the relevant pages.');
    } else {
      state.history.forEach(renderMessageInto);
    }

    setTimeout(() => refs.textarea.focus(), 50);
  }

  function unmount() {
    if (refs.host) refs.host.innerHTML = '';
    refs.host = refs.panel = refs.msgsEl = refs.textarea = refs.sendBtn = null;
    refs.suggBtns = [];
  }

  // ----------------------------------------------------------------------
  //  Incremental DOM ops (no full re-render)
  // ----------------------------------------------------------------------
  function buildMessageEl(m) {
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg--${m.role}`;
    el.dataset.msgId = m.id;
    if (m.role === 'system') {
      el.innerHTML = `<div class="chat-msg__body"><div class="chat-msg__bubble">${m.html}</div></div>`;
      return el;
    }
    const avatar = m.role === 'user' ? 'U' : 'RDB';
    el.innerHTML = `
      <span class="chat-msg__avatar" aria-hidden="true">${avatar}</span>
      <div class="chat-msg__body">
        <div class="chat-msg__bubble" data-slot="bubble">${m.html}</div>
        <div data-slot="cites"></div>
        <div data-slot="followups"></div>
      </div>
    `;
    if (m.cites && m.cites.length) {
      el.querySelector('[data-slot="cites"]').outerHTML =
        `<div class="chat-msg__cites">${A.chipsHTMLInner ? A.chipsHTMLInner(m.cites) : citesInnerHTML(m.cites)}</div>`;
    }
    if (m.followups && m.followups.length) {
      el.querySelector('[data-slot="followups"]').outerHTML = `
        <div class="chat-msg__followups">
          ${m.followups.map(f => `<button type="button" class="chat-msg__followup" data-sugg="${A.escapeHTML(f)}">${A.escapeHTML(f)}</button>`).join('')}
        </div>
      `;
    }
    return el;
  }

  // Inline copy of A.chipsHTML's body without the wrapping div, used when
  // we want to set innerHTML on a wrapper we've already built.
  function citesInnerHTML(refs_) {
    const D = window.REGDB_DATA;
    return refs_.map(r => `
      <a href="${r.href}" class="citation-chip" data-cite-type="${r.type}">
        <span class="obj-tag obj-tag--${r.type}">${r.type}</span>
        <span class="citation-chip__label">${r.type === 'gene' ? `<em>${r.label}</em>` : r.label}</span>
        ${r.org ? `<span class="citation-chip__meta">${(D.organisms.find(o => o.id === r.org) || {}).short || ''}</span>` : ''}
      </a>
    `).join('');
  }

  function renderMessageInto(m) {
    if (!refs.msgsEl) return;
    refs.msgsEl.appendChild(buildMessageEl(m));
    scrollToBottom();
  }

  function scrollToBottom() {
    if (!refs.msgsEl) return;
    refs.msgsEl.scrollTop = refs.msgsEl.scrollHeight;
  }

  function appendMessage(msg) {
    msg.id = msg.id || uid();
    state.history.push(msg);
    renderMessageInto(msg);
    return msg.id;
  }

  function updateMessage(id, patch) {
    const i = state.history.findIndex(m => m.id === id);
    if (i < 0) return;
    state.history[i] = { ...state.history[i], ...patch };
    if (!refs.msgsEl) return;
    const oldEl = refs.msgsEl.querySelector(`[data-msg-id="${id}"]`);
    if (!oldEl) return;
    const newEl = buildMessageEl(state.history[i]);
    oldEl.replaceWith(newEl);
    scrollToBottom();
  }

  function appendSystemHint(text) {
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--system';
    el.dataset.systemHint = '1';
    el.innerHTML = `<div class="chat-msg__body"><div class="chat-msg__bubble">${text}</div></div>`;
    refs.msgsEl.appendChild(el);
  }

  function setBusy(busy) {
    state.busy = busy;
    if (!refs.textarea) return;
    refs.textarea.disabled = busy;
    refs.sendBtn.disabled = busy || !refs.textarea.value.trim();
    refs.suggBtns.forEach(b => { b.disabled = busy; });
  }

  // ----------------------------------------------------------------------
  //  Send pipeline — RAG (typing indicator → answer card with citations)
  // ----------------------------------------------------------------------
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function send(value) {
    const v = (value || '').trim();
    if (!v || state.busy) return;
    setBusy(true);
    refs.textarea.value = '';
    refs.textarea.style.height = 'auto';

    // Drop the initial "ask anything" hint as soon as the user sends.
    const hint = refs.msgsEl && refs.msgsEl.querySelector('[data-system-hint]');
    if (hint) hint.remove();

    appendMessage({ role: 'user', html: A.escapeHTML(v) });

    const typingId = appendMessage({
      role: 'assistant',
      html: `<span class="typing-indicator" role="status" aria-label="Assistant is thinking"><span></span><span></span><span></span></span>`,
    });
    await delay(550);
    const ans = A.answer(v);
    updateMessage(typingId, {
      html: ans.body,
      cites: ans.cites,
      followups: ans.followups,
    });

    setBusy(false);
    refs.textarea.focus();
  }

  // ----------------------------------------------------------------------
  //  Open / close
  // ----------------------------------------------------------------------
  function open(o) {
    const willOpen = o == null ? !state.open : o;
    if (willOpen === state.open) return;
    state.open = willOpen;
    if (state.open) {
      mount();
      document.addEventListener('keydown', onKey);
    } else {
      document.removeEventListener('keydown', onKey);
      unmount();
    }
  }

  function ask(prefill) {
    open(true);
    setTimeout(() => {
      if (!refs.textarea) return;
      refs.textarea.value = prefill || '';
      refs.textarea.dispatchEvent(new Event('input'));
      refs.textarea.focus();
    }, 80);
  }

  function onKey(e) {
    if (e.key === 'Escape' && state.open) { open(false); return; }
  }

  // Delegated clicks (close / suggestions / page-side ask buttons)
  document.addEventListener('click', (e) => {
    const close = e.target.closest('[data-act="close"]');
    if (close) { e.preventDefault(); open(false); return; }
    const sugg = e.target.closest('[data-sugg]');
    if (sugg && refs.textarea) {
      e.preventDefault();
      refs.textarea.value = sugg.dataset.sugg;
      refs.textarea.dispatchEvent(new Event('input'));
      refs.textarea.focus();
      return;
    }
    const askBtn = e.target.closest('[data-action="ask-assistant"]');
    if (askBtn) {
      e.preventDefault();
      ask(askBtn.dataset.prompt || '');
      return;
    }
  });

  // ----------------------------------------------------------------------
  //  Per-page explainer (c) — render into [data-explainer-root] elements.
  // ----------------------------------------------------------------------
  const EXPLAINER_KEY = 'regdb.assist.level';

  function getLevel() {
    return localStorage.getItem(EXPLAINER_KEY) || 'postdoc';
  }
  function setLevel(level) {
    localStorage.setItem(EXPLAINER_KEY, level);
    document.querySelectorAll('[data-explainer-root]').forEach(renderExplainerInto);
  }

  function explainerHTML(data, level) {
    const body = data.levels[level] || data.levels.postdoc || '';
    const cites = data.cites && data.cites.length ? A.chipsHTML(data.cites) : '';
    const tabs = ['pi', 'postdoc', 'undergrad', 'public'].map(l => {
      const labels = { pi: 'PI', postdoc: 'Postdoc', undergrad: 'Undergrad', public: 'Public' };
      return `<button role="tab" aria-selected="${l===level}" data-explainer-level="${l}">${labels[l]}</button>`;
    }).join('');
    return `
      <div class="explainer-panel__head">
        <div class="explainer-panel__title">
          <span class="explainer-panel__sparkle" aria-hidden="true">✦</span>
          ${data.title || 'About this page'}
        </div>
        <div style="display:flex; gap:8px; align-items:center">
          <div class="level-picker tabs tabs--segmented" role="tablist" aria-label="Explanation level">${tabs}</div>
          <button class="btn btn--ghost btn--sm" data-action="ask-assistant"
                  data-prompt="Explain this page in detail">Open in chat</button>
        </div>
      </div>
      <div class="explainer-panel__body">${body}</div>
      ${cites ? `<div class="explainer-panel__cites">${cites}</div>` : ''}
    `;
  }

  function renderExplainerInto(el) {
    const data = JSON.parse(el.dataset.explainerData || 'null');
    if (!data) { el.innerHTML = ''; return; }
    el.innerHTML = explainerHTML(data, getLevel());
  }

  /**
   * Public: mount an explainer panel for the current route into a host element.
   * The host should be an empty <section class="explainer-panel" data-explainer-root>
   * placed wherever the page wants the panel.
   */
  function mountExplainer(hostEl, route) {
    const data = A.explainPage(route);
    if (!data) { hostEl.style.display = 'none'; return; }
    hostEl.style.display = '';
    hostEl.dataset.explainerData = JSON.stringify(data);
    hostEl.dataset.explainerRoot = '1';
    renderExplainerInto(hostEl);
  }

  document.addEventListener('click', (e) => {
    const lvl = e.target.closest('[data-explainer-level]');
    if (lvl) { e.preventDefault(); setLevel(lvl.dataset.explainerLevel); }
  });

  // ----------------------------------------------------------------------
  //  Boot — install FAB + ⌘J shortcut on DOM ready.
  // ----------------------------------------------------------------------
  function boot() {
    ensureFAB();
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        open();
      }
    });
    // Drop any persisted mode preference from earlier multi-flavor builds.
    localStorage.removeItem('regdb.assist.mode');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Public API
  window.REGDB_ASSIST_UI = { open, ask, mountExplainer };
})();
