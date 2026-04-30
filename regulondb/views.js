/* RegulonDB MG — Views (home, gene, tf, regulon, search, compare) */

(function () {
  const D = window.REGDB_DATA;
  const I = window.REGDB_ICONS;

  // ---------- helpers ----------
  const e = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const getOrg = (id) => window.REGDB.getOrg(id);
  const orgLink = (org) => `#/${org}/home`;
  const breadcrumbs = (trail) => `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      ${trail.map((t, i) => i === trail.length - 1
        ? `<span class="current">${t.label}</span>`
        : `<a href="${t.href}">${t.label}</a><span class="sep">${I.chevronRight}</span>`
      ).join('')}
    </nav>
  `;
  const evidenceBadge = (code, curated) => {
    const tips = {
      IDA: 'IDA — Inferred from Direct Assay (strong experimental evidence)',
      IEP: 'IEP — Inferred from Expression Pattern',
      IPI: 'IPI — Inferred from Physical Interaction',
      IC:  'IC — Inferred by Curator',
      IEA: 'IEA — Inferred from Electronic Annotation (weak, computational)',
    };
    const cls = curated ? 'badge--curated' : 'badge--predicted';
    return `<span class="evidence-code" data-tip="${tips[code] || code}">${code}</span> <span class="badge ${cls}">${curated ? 'Curated' : 'Predicted'}</span>`;
  };

  const exportBar = () => `
    <div class="export">
      <span class="tiny muted">Export</span>
      <button class="btn btn--ghost btn--sm">CSV</button>
      <button class="btn btn--ghost btn--sm">TSV</button>
      <button class="btn btn--ghost btn--sm">JSON</button>
      <button class="btn btn--ghost btn--sm">GFF3</button>
    </div>
  `;

  // ============================================================
  // HOME
  // ============================================================
  function viewHome(root) {
    const org = getOrg();
    const releases = D.releases.slice(0, 4);
    root.innerHTML = `
      <div class="home-hero">
        <section class="hero-search" aria-labelledby="hero-title">
          <h1 id="hero-title">Transcriptional regulation, organism-aware.</h1>
          <p class="hero-search__sub">Curated interactions, high-throughput datasets and predictions across bacterial model organisms — with cross-organism context preserved.</p>
          <form class="hero-search__input" onsubmit="event.preventDefault(); const q=this.q.value.trim(); if(q) window.location.hash='#/${org.id}/search?q='+encodeURIComponent(q);">
            <span aria-hidden="true">${I.search}</span>
            <input name="q" type="search" placeholder="Try a gene (araC), TF (LexA), operon (araBAD), or a pathway…" aria-label="Search" />
          </form>
          <div class="hero-search__toggle">
            <label class="hstack" style="gap:0.5rem">
              <input type="checkbox" /> Search across all organisms
            </label>
            <span class="divider-dot">·</span>
            <a href="#/${org.id}/search?q=lexA"><strong>Advanced search</strong></a>
          </div>
          <div class="hero-search__examples">
            <span>Try:</span>
            <a href="#/ecoli-k12/gene/araC"><em>araC</em></a>
            <a href="#/ecoli-k12/tf/LexA">LexA</a>
            <a href="#/ecoli-k12/regulon/AraC">AraC regulon</a>
            <a href="#/ecoli-k12/search?q=sigma"><em>σ</em> factors</a>
            <a href="#/ecoli-k12/compare/tf/LexA">LexA across species</a>
          </div>
        </section>

        <aside class="active-org-card" aria-label="Active organism">
          <div class="active-org-card__hd">
            <span class="active-org-card__avatar" style="background:${org.color}">${org.initials}</span>
            <div>
              <h2><em>${e(org.sci)}</em></h2>
              <p>${e(org.strain)} · ${org.version} · updated ${e(org.stats.updated)}</p>
            </div>
          </div>
          <div class="active-org-card__stats">
            <div class="active-stat"><div class="active-stat__v">${org.stats.genes.toLocaleString()}</div><div class="active-stat__l">Curated genes</div></div>
            <div class="active-stat"><div class="active-stat__v">${org.stats.tfs}</div><div class="active-stat__l">Transcription factors</div></div>
            <div class="active-stat"><div class="active-stat__v">${org.stats.operons.toLocaleString()}</div><div class="active-stat__l">Operons</div></div>
            <div class="active-stat"><div class="active-stat__v">${org.stats.regulons}</div><div class="active-stat__l">Regulons</div></div>
          </div>
          <div class="active-org-card__foot">
            <span>NCBI:txid${org.taxid}</span>
            <a href="#" onclick="event.preventDefault(); document.getElementById('orgPill').click()">Switch organism →</a>
          </div>
        </aside>
      </div>

      <h3 style="margin-bottom: 1rem">Browse ${org.short}</h3>
      <div class="quick-grid">
        ${[
          { t: 'Genes', c: org.stats.genes, d: 'Genomic coordinates, products, TUs, context.', href: `#/${org.id}/gene/araC`, icon: I.dna, tag: 'gene' },
          { t: 'Operons', c: org.stats.operons, d: 'Co-transcribed gene clusters, TSSs, terminators.', href: `#/${org.id}/search?type=operon`, icon: I.operon, tag: 'operon' },
          { t: 'Regulons', c: org.stats.regulons, d: 'Gene sets under a single TF; conditions & sites.', href: `#/${org.id}/regulon/AraC`, icon: I.regulon, tag: 'regulon' },
          { t: 'Transcription factors', c: org.stats.tfs, d: 'Families, domains, effectors, target sets.', href: `#/${org.id}/tf/LexA`, icon: I.tf, tag: 'tf' },
          { t: 'Promoters', c: org.stats.promoters, d: 'σ-factor usage, −10/−35 boxes, TSS evidence.', href: `#/${org.id}/search?type=promoter`, icon: I.promoter, tag: 'promoter' },
          { t: 'Datasets HT', c: 47, d: 'ChIP-seq · ChIP-exo · RNA-seq · gSELEX · DAP-seq.', href: `#/${org.id}/search?type=dataset`, icon: I.dataset, tag: 'dataset' },
        ].map(q => `
          <a class="quick-card" href="${q.href}">
            <div class="quick-card__icon">${q.icon}</div>
            <div class="quick-card__title">${q.t}</div>
            <div class="quick-card__count">${q.c.toLocaleString()} entries</div>
            <div class="quick-card__desc">${q.d}</div>
          </a>
        `).join('')}
      </div>

      <div class="home-grid">
        <section>
          <div class="card__hd"><h3>Release notes</h3><a href="#/${org.id}/home#releases" class="tiny">All releases →</a></div>
          <div class="card">
            ${releases.map(r => {
              const ro = getOrg(r.org);
              return `
                <article class="release-note">
                  <div class="release-note__top">
                    <span class="release-note__version">${r.v}</span>
                    <span>${r.date}</span>
                    <span class="obj-tag" style="color:${ro.color}">${ro.short}</span>
                  </div>
                  <h4>${e(r.title)}</h4>
                  <p>${e(r.body)}</p>
                </article>
              `;
            }).join('')}
          </div>
        </section>

        <aside>
          <div class="card--section card" style="margin-bottom:1rem">
            <h3 style="font-size: var(--fs-h4); margin-bottom: 0.75rem">Multi-organism features</h3>
            <ul style="margin:0; padding-left: 1.1rem; font-size: var(--fs-body); color: var(--text-primary); line-height: 1.7">
              <li>Context preserved across organism switches when the object exists.</li>
              <li>Ortholog tables on every gene & TF page.</li>
              <li>Side-by-side comparison for TFs and regulons.</li>
              <li>Organism-scoped URLs: <code style="font-family:var(--font-mono); font-size: 0.8125rem">/ecoli-k12/gene/araC</code></li>
            </ul>
          </div>
          <div class="card card--note">
            <strong>For curators</strong>
            <p class="tiny" style="margin-top: 0.5rem">The new curation UI (Citrus) is in beta. <a href="#">Request access →</a></p>
          </div>
        </aside>
      </div>
    `;
  }

  // ============================================================
  // GENE (araC)
  // ============================================================
  function viewGene(root, r) {
    const g = D.araC;
    const org = getOrg(g.organism);

    const sections = [
      { id: 'overview', label: 'Overview' },
      { id: 'context', label: 'Genomic context' },
      { id: 'promoters', label: 'Promoters & TSS' },
      { id: 'incoming', label: 'Regulation (incoming)' },
      { id: 'outgoing', label: 'Regulation (outgoing)' },
      { id: 'orthologs', label: 'Orthologs' },
      { id: 'refs', label: 'References' },
    ];

    const header = `
      ${breadcrumbs([
        { label: org.short, href: `#/${org.id}/home` },
        { label: 'Genes', href: `#/${org.id}/search?type=gene` },
        { label: g.symbol },
      ])}
      <div class="obj-header obj-header--gene">
        <div>
          <div class="obj-header__eyebrow"><span class="obj-tag obj-tag--gene">Gene</span> · <em class="taxon">${e(org.sci)}</em> ${e(org.strain)}</div>
          <h1><em class="gene">${e(g.symbol)}</em> — ${e(g.name)}</h1>
          <p class="obj-header__tagline">${e(g.function)}</p>
          <div class="obj-header__meta">
            <div><span>Locus tag</span><span>${g.synonyms[0]}</span></div>
            <div><span>Length</span><span>${g.length_nt} nt · ${g.length_aa} aa</span></div>
            <div><span>Strand</span><span>${g.strand}</span></div>
            <div><span>Coords</span><span>${g.start.toLocaleString()}–${g.end.toLocaleString()}</span></div>
            <div><span>Operon</span><span><a href="#/${org.id}/regulon/${g.operon}"><em>${g.operon}</em></a></span></div>
          </div>
        </div>
        <div class="obj-header__actions">
          <button class="btn btn--primary"
                  data-action="add-to-set"
                  data-organism="${e(org.id)}" data-type="gene"
                  data-id="${e(g.symbol)}" data-label="${e(g.symbol)}">Add to set</button>
          <button class="btn btn--secondary">FASTA</button>
          <button class="btn btn--ghost btn--sm">GenBank ↗</button>
        </div>
      </div>
    `;

    const sectionOverview = `
      <section class="section-block" id="overview">
        <div class="section-block__hd"><h2>Overview</h2><p>Curation v12 · last updated ${org.stats.updated}</p></div>
        <div class="card"><dl class="kv">
          <dt>Symbol</dt><dd><em class="gene">${g.symbol}</em></dd>
          <dt>Product</dt><dd>${g.product} · dual transcriptional regulator</dd>
          <dt>Synonyms</dt><dd>${g.synonyms.map(s => `<code style="font-family:var(--font-mono); font-size:0.8125rem">${s}</code>`).join(', ')}</dd>
          <dt>Transcription units</dt><dd>${g.tus.join(' · ')}</dd>
          <dt>External IDs</dt><dd>
            <a href="#">EcoCyc:EG10055 ${I.external}</a>
            <span class="divider-dot">·</span>
            <a href="#">UniProt:P0A9E0 ${I.external}</a>
            <span class="divider-dot">·</span>
            <a href="#">NCBI Gene:944780 ${I.external}</a>
          </dd>
        </dl></div>
      </section>
    `;

    const sectionContext = `
      <section class="section-block" id="context">
        <div class="section-block__hd"><h2>Genomic context</h2><p>Positions 69,000 – 72,500 · strand −</p></div>
        <div class="genome-strip">
          ${genomeStripSVG()}
        </div>
        <p class="tiny muted" style="margin-top: 0.5rem">Click any element to open its page. The <em>araC</em>—<em>araBAD</em> pair is divergently transcribed; AraC binds sites <code>araO2</code>, <code>araO1</code>, <code>araI1</code>, <code>araI2</code>.</p>
      </section>
    `;

    const sectionPromoters = `
      <section class="section-block" id="promoters">
        <div class="section-block__hd"><h2>Promoters & transcription start sites</h2><p>${g.promoters.length} curated</p></div>
        <div class="table-wrap">
          <div class="table-wrap__toolbar">
            <span class="tiny muted">${g.promoters.length} promoters</span>
            ${exportBar()}
          </div>
          <table class="data">
            <thead><tr><th>Name</th><th>σ-factor</th><th>TSS</th><th>−10 box</th><th>−35 box</th><th>Evidence</th></tr></thead>
            <tbody>
              ${g.promoters.map(p => `
                <tr>
                  <td><strong>${p.id}</strong></td>
                  <td>${p.sigma}</td>
                  <td style="font-family: var(--font-mono)">${p.tss.toLocaleString()}</td>
                  <td style="font-family: var(--font-mono)">${p.box10}</td>
                  <td style="font-family: var(--font-mono)">${p.box35}</td>
                  <td>${evidenceBadge(p.evidence, p.curated)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    const sectionIncoming = `
      <section class="section-block" id="incoming">
        <div class="section-block__hd"><h2>Regulation — incoming (who regulates <em class="gene">${g.symbol}</em>)</h2><p>${g.regulation_in.length} interactions</p></div>
        <div class="card" style="padding:0">
          ${g.regulation_in.map(i => `
            <div class="reg-item">
              <span class="reg-arrow ${i.mode === 'activate' ? 'reg-arrow--activate' : i.mode === 'repress' ? 'reg-arrow--repress' : 'reg-arrow--dual'}">${i.effect}</span>
              <a href="#/${org.id}/tf/${i.tf}"><strong>${i.tf}</strong></a>
              <span class="muted tiny">binds <code style="font-family:var(--font-mono)">${e(i.site)}</code> — ${e(i.condition)}</span>
              <span>${evidenceBadge(i.evidence, i.curated)}</span>
              <button class="btn btn--ghost btn--sm">Details</button>
            </div>
          `).join('')}
        </div>
      </section>
    `;

    const sectionOutgoing = `
      <section class="section-block" id="outgoing">
        <div class="section-block__hd"><h2>Regulation — outgoing (<em class="gene">${g.symbol}</em> product regulates)</h2><p>${g.regulation_out.length} targets · see <a href="#/${org.id}/regulon/AraC">AraC regulon →</a></p></div>
        <div class="table-wrap">
          <div class="table-wrap__toolbar"><span class="tiny muted">${g.regulation_out.length} targets</span>${exportBar()}</div>
          <table class="data">
            <thead><tr><th>Target</th><th>Effect</th><th>Mode</th><th>Condition</th><th>Evidence</th></tr></thead>
            <tbody>
              ${g.regulation_out.map(o => `
                <tr>
                  <td><a href="#/${org.id}/regulon/${o.target}"><em class="gene">${o.target}</em></a></td>
                  <td><span class="reg-arrow ${o.mode === 'activate' ? 'reg-arrow--activate' : 'reg-arrow--repress'}">${o.effect}</span></td>
                  <td>${o.mode}</td>
                  <td>${e(o.condition)}</td>
                  <td>${evidenceBadge(o.evidence, o.curated)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    const sectionOrthologs = `
      <section class="section-block" id="orthologs">
        <div class="section-block__hd"><h2>Cross-organism orthologs</h2><p>Conservation of regulation, not just sequence</p></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Organism</th><th>Symbol</th><th>Identity</th><th>Conservation note</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td><em class="taxon">${e(org.sci)}</em> ${org.strain}</td>
              <td><em class="gene">${g.symbol}</em></td>
              <td style="font-family:var(--font-mono)">100%</td>
              <td>this page</td>
              <td></td>
            </tr>
            ${g.orthologs.map(o => {
              const oo = getOrg(o.org);
              return `
                <tr>
                  <td><em class="taxon">${e(oo.sci)}</em> ${e(oo.strain)}</td>
                  <td>${o.symbol === '—' ? '<span class="muted">—</span>' : `<em class="gene">${o.symbol}</em>`}</td>
                  <td style="font-family:var(--font-mono)">${o.identity == null ? '—' : o.identity + '%'}</td>
                  <td>${e(o.conservation)}</td>
                  <td>${o.symbol === '—' ? '' : `<a href="#/${o.org}/gene/${o.symbol}" class="btn btn--secondary btn--sm">Switch →</a>`}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table></div>
      </section>
    `;

    const sectionRefs = `
      <section class="section-block" id="refs">
        <div class="section-block__hd"><h2>References</h2><p>${g.references.length} curator-linked publications</p></div>
        <div class="card"><ol style="margin:0; padding-left: 1.2rem">
          ${g.references.map(ref => `<li style="margin-bottom:0.5rem"><span class="citation">${e(ref.short)}</span> <a href="#" class="tiny">${ref.id} ${I.external}</a></li>`).join('')}
        </ol></div>
      </section>
    `;

    const allSections = sectionOverview + sectionContext + sectionPromoters + sectionIncoming + sectionOutgoing + sectionOrthologs + sectionRefs;

    const explainerSlot = `<section class="explainer-panel" data-explainer-host style="margin: 0 0 var(--sp-4) 0"></section>`;

    // ---- layout: tabs vs long-scroll ----
    if (window.REGDB.state.tweaks.genePageLayout === 'tabs') {
      root.innerHTML = header + explainerSlot + `
        <div class="tabs" role="tablist">
          ${sections.map((s, i) => `<button class="${i === 0 ? 'is-active' : ''}" data-tab="${s.id}">${s.label}</button>`).join('')}
        </div>
        <div id="tabContent"></div>
      `;
      const tabContent = root.querySelector('#tabContent');
      const map = {
        overview: sectionOverview,
        context: sectionContext,
        promoters: sectionPromoters,
        incoming: sectionIncoming,
        outgoing: sectionOutgoing,
        orthologs: sectionOrthologs,
        refs: sectionRefs,
      };
      tabContent.innerHTML = map.overview;
      root.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          root.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          tabContent.innerHTML = map[btn.dataset.tab];
        });
      });
    } else {
      root.innerHTML = header + explainerSlot + `
        <div class="page-2col">
          <div>${allSections}</div>
          <aside class="toc" aria-label="On this page">
            <div class="toc__title">On this page</div>
            <ul>
              ${sections.map((s, i) => `<li><a href="#${s.id}" class="${i === 0 ? 'is-active' : ''}">${s.label}</a></li>`).join('')}
            </ul>
          </aside>
        </div>
      `;
      // active TOC via IntersectionObserver
      const links = root.querySelectorAll('.toc a');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
          }
        });
      }, { rootMargin: '-40% 0px -50% 0px' });
      sections.forEach(s => { const el = root.querySelector('#' + s.id); if (el) observer.observe(el); });
    }

    mountExplainer(root, r);
  }

  // Mount the per-page explainer (flavor c) into [data-explainer-host], or
  // hide that slot when the current route has no curated summary yet.
  function mountExplainer(root, route) {
    const slot = root.querySelector('[data-explainer-host]');
    if (!slot || !window.REGDB_ASSIST_UI) return;
    window.REGDB_ASSIST_UI.mountExplainer(slot, route);
  }

  // ============================================================
  // TF (LexA)
  // ============================================================
  function viewTF(root, r) {
    const tf = D.lexA;
    const org = getOrg(tf.organism);

    const domainMax = tf.length_aa;
    const domainsSVG = `
      <svg width="100%" height="80" viewBox="0 0 ${domainMax} 80" preserveAspectRatio="none" role="img" aria-label="Domain diagram">
        <line x1="0" y1="40" x2="${domainMax}" y2="40" stroke="#D5D5D7" stroke-width="2"/>
        ${tf.domains.map((d, i) => {
          const colors = ['#32617D', '#C98528'];
          return `<rect x="${d.start}" y="26" width="${d.end - d.start}" height="28" fill="${colors[i]}" rx="4"/>
                  <text x="${(d.start + d.end) / 2}" y="16" text-anchor="middle" font-family="Arial" font-size="11" fill="#373737">${d.name}</text>
                  <text x="${(d.start + d.end) / 2}" y="70" text-anchor="middle" font-family="monospace" font-size="10" fill="#666">${d.start}–${d.end}</text>`;
        }).join('')}
        <text x="0" y="80" font-family="monospace" font-size="10" fill="#999">1</text>
        <text x="${domainMax}" y="80" text-anchor="end" font-family="monospace" font-size="10" fill="#999">${domainMax} aa</text>
      </svg>
    `;

    root.innerHTML = `
      ${breadcrumbs([
        { label: org.short, href: `#/${org.id}/home` },
        { label: 'Transcription factors', href: `#/${org.id}/search?type=tf` },
        { label: tf.symbol },
      ])}
      <div class="obj-header obj-header--tf">
        <div>
          <div class="obj-header__eyebrow"><span class="obj-tag obj-tag--tf">Transcription factor</span> · <em class="taxon">${e(org.sci)}</em> ${e(org.strain)}</div>
          <h1>${e(tf.symbol)} <span style="font-weight:400; color: var(--text-secondary); font-size: 0.7em">(gene: <em class="gene">${tf.gene}</em>)</span></h1>
          <p class="obj-header__tagline">${e(tf.summary)}</p>
          <div class="obj-header__meta">
            <div><span>Family</span><span>${e(tf.family)}</span></div>
            <div><span>Length</span><span>${tf.length_aa} aa</span></div>
            <div><span>Consensus site</span><span>${e(tf.consensus_site)}</span></div>
            <div><span>Targets</span><span>${tf.regulated.length} curated</span></div>
          </div>
        </div>
        <div class="obj-header__actions">
          <a href="#/${org.id}/regulon/LexA" class="btn btn--primary">View regulon →</a>
          <a href="#/${org.id}/compare/tf/LexA" class="btn btn--accent">Compare across organisms</a>
          <button class="btn btn--secondary btn--sm"
                  data-action="add-to-set"
                  data-organism="${e(org.id)}" data-type="tf"
                  data-id="${e(tf.name)}" data-label="${e(tf.name)}">Add TF to set</button>
          <button class="btn btn--ghost btn--sm">Export PFM/PWM</button>
        </div>
      </div>

      <section class="explainer-panel" data-explainer-host style="margin: 0 0 var(--sp-4) 0"></section>

      <section class="section-block">
        <div class="section-block__hd"><h2>Domain architecture</h2><p>Auto-cleavage architecture typical of LexA / S24 peptidase family</p></div>
        <div class="card">
          ${domainsSVG}
          <dl class="kv" style="margin-top: 1rem">
            ${tf.domains.map(d => `<dt>${d.name}</dt><dd>${e(d.role)}</dd>`).join('')}
          </dl>
        </div>
      </section>

      <section class="section-block">
        <div class="section-block__hd"><h2>Effectors & signals</h2><p>What activates / inactivates this TF</p></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Effector / signal</th><th>Mode</th><th>Evidence</th></tr></thead>
          <tbody>
            ${tf.effectors.map(ef => `
              <tr><td><strong>${e(ef.name)}</strong></td><td>${e(ef.mode)}</td><td>${evidenceBadge(ef.evidence, true)}</td></tr>
            `).join('')}
          </tbody>
        </table></div>
      </section>

      <section class="section-block">
        <div class="section-block__hd"><h2>Regulated targets</h2><p>${tf.regulated.length} interactions · see <a href="#/${org.id}/regulon/LexA">LexA regulon →</a></p></div>
        <div class="table-wrap" id="tfTargetsTable">
          <div class="table-wrap__toolbar">
            <div class="hstack">
              <input type="search" placeholder="Filter targets…" style="height:32px; padding: 0 0.5rem; border: 1px solid var(--border-default); border-radius: 6px; background: var(--surface-raised); color: var(--text-primary); font-family: inherit"/>
              <button class="btn btn--ghost btn--sm">Only IDA</button>
              <button class="btn btn--ghost btn--sm">Only repressed</button>
              <button class="btn btn--primary btn--sm" data-action="add-selected-to-set" data-scope="tfTargetsTable">Add selected to set</button>
            </div>
            ${exportBar()}
          </div>
          <table class="data">
            <thead><tr>
              <th style="width:32px"><input type="checkbox" data-action="set-row-all" data-scope="tfTargetsTable" aria-label="Select all targets"/></th>
              <th>Target</th><th>Effect</th><th>Mode</th><th>Condition</th><th>Evidence</th><th></th>
            </tr></thead>
            <tbody>
              ${tf.regulated.map(t => `
                <tr>
                  <td><input type="checkbox" data-action="set-row" data-organism="${e(org.id)}" data-type="gene" data-id="${e(t.target)}" data-label="${e(t.target)}" aria-label="Select ${e(t.target)}"/></td>
                  <td><a href="#/${org.id}/gene/${t.target}"><em class="gene">${t.target}</em></a></td>
                  <td><span class="reg-arrow reg-arrow--repress">${t.effect}</span></td>
                  <td>${t.mode}</td>
                  <td>${e(t.cond)}</td>
                  <td>${evidenceBadge(t.evidence, true)}</td>
                  <td><a href="#" class="tiny">binding site ↗</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section-block">
        <div class="section-block__hd"><h2>References</h2></div>
        <div class="card"><ol style="margin:0; padding-left: 1.2rem">
          ${tf.references.map(ref => `<li style="margin-bottom:0.5rem"><span class="citation">${e(ref.short)}</span> <a href="#" class="tiny">${ref.id} ${I.external}</a></li>`).join('')}
        </ol></div>
      </section>
    `;
    mountExplainer(root, r);
  }

  // ============================================================
  // REGULON (AraC)
  // ============================================================
  function viewRegulon(root, r) {
    const reg = D.regulonAraC;
    const org = getOrg(reg.organism);
    const title = r.id || reg.id;
    // For LexA regulon we can reuse TF data
    const isLexA = title === 'LexA';
    const members = isLexA
      ? D.lexA.regulated.map(x => ({ gene: x.target, operon: x.target, effect: x.effect, condition: x.cond, evidence: x.evidence }))
      : reg.members;

    root.innerHTML = `
      ${breadcrumbs([
        { label: org.short, href: `#/${org.id}/home` },
        { label: 'Regulons', href: `#/${org.id}/search?type=regulon` },
        { label: title },
      ])}
      <div class="obj-header obj-header--regulon">
        <div>
          <div class="obj-header__eyebrow"><span class="obj-tag obj-tag--regulon">Regulon</span> · <em class="taxon">${e(org.sci)}</em> ${e(org.strain)}</div>
          <h1>${e(title)} regulon</h1>
          <p class="obj-header__tagline">${isLexA
            ? 'SOS response regulon. Repressed by LexA under normal growth; derepressed upon DNA damage via RecA*-stimulated LexA auto-cleavage.'
            : 'L-arabinose utilization regulon. AraC acts as a dual regulator — repressor without arabinose, activator when bound to arabinose.'}</p>
          <div class="obj-header__meta">
            <div><span>Regulator</span><span><a href="#/${org.id}/tf/${title}">${title}</a></span></div>
            <div><span>Members</span><span>${members.length} genes</span></div>
            <div><span>Effect</span><span>${isLexA ? 'Repression' : 'Dual (±)'}</span></div>
            <div><span>Evidence</span><span>${members.filter(m => m.evidence === 'IDA').length} IDA / ${members.filter(m => m.evidence !== 'IDA').length} other</span></div>
            ${(() => {
              const rriRow = (D.rri_table || []).find(x => x.regulon === title && x.organism === org.id);
              if (!rriRow) return '';
              const v = rriRow.rri;
              const band = v <= 0.25 ? 'low' : v <= 0.55 ? 'medium' : v <= 0.80 ? 'high' : 'extreme';
              return `<div><span>Rewiring (RRI)</span><span><a href="#/rri-leaderboard" title="${e(rriRow.summary)}" style="text-decoration:none">
                <span class="score-pill score-pill--${band}" role="meter" aria-valuemin="0" aria-valuemax="1" aria-valuenow="${v}">
                  <span class="score-pill__bar" aria-hidden="true"><span class="score-pill__fill" style="width:${v*100}%"></span></span>
                  <span class="score-pill__value">${v.toFixed(2)}</span>
                </span></a></span></div>`;
            })()}
          </div>
        </div>
        <div class="obj-header__actions">
          <a href="#/${org.id}/compare/tf/${title}" class="btn btn--accent">Compare across organisms</a>
          <button class="btn btn--primary btn--sm"
                  data-action="add-to-set"
                  data-organism="${e(org.id)}" data-type="regulon"
                  data-id="${e(title)}" data-label="${e(title)} regulon">Add regulon to set</button>
          <button class="btn btn--secondary">Download network (SIF)</button>
        </div>
      </div>

      <section class="explainer-panel" data-explainer-host style="margin: 0 0 var(--sp-4) 0"></section>

      <section class="section-block">
        <div class="section-block__hd"><h2>Network view</h2><p>Static representation · hover nodes to highlight · <a href="#">open in full visualizer ↗</a></p></div>
        <div class="card">
          ${networkSVG(title, members.slice(0, 14))}
          <div class="hstack tiny muted" style="margin-top: 0.75rem; justify-content: flex-end">
            <span>Legend:</span>
            <span class="hstack" style="gap:4px"><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background: var(--obj-tf)"></span> TF</span>
            <span class="hstack" style="gap:4px"><span style="display:inline-block; width:10px; height:10px; border-radius:50%; background: var(--obj-gene)"></span> target</span>
            <span class="hstack" style="gap:4px"><span style="display:inline-block; width:18px; height:2px; background: var(--error)"></span> repress</span>
            <span class="hstack" style="gap:4px"><span style="display:inline-block; width:18px; height:2px; background: var(--obj-gene)"></span> activate</span>
          </div>
        </div>
      </section>

      <section class="section-block">
        <div class="section-block__hd"><h2>Members</h2><p>${members.length} genes</p></div>
        <div class="table-wrap" id="regulonMembersTable">
          <div class="table-wrap__toolbar">
            <input type="search" placeholder="Filter members…" style="height:32px; padding: 0 0.5rem; border: 1px solid var(--border-default); border-radius: 6px; background: var(--surface-raised); color: var(--text-primary); font-family: inherit; min-width: 200px"/>
            <button class="btn btn--primary btn--sm" data-action="add-selected-to-set" data-scope="regulonMembersTable">Add selected to set</button>
            ${exportBar()}
          </div>
          <table class="data">
            <thead><tr>
              <th style="width:32px"><input type="checkbox" data-action="set-row-all" data-scope="regulonMembersTable" aria-label="Select all members"/></th>
              <th>Gene</th><th>Operon</th><th>Effect</th><th>Condition</th><th>Evidence</th>
            </tr></thead>
            <tbody>
              ${members.map(m => `
                <tr>
                  <td><input type="checkbox" data-action="set-row" data-organism="${e(org.id)}" data-type="gene" data-id="${e(m.gene)}" data-label="${e(m.gene)}" aria-label="Select ${e(m.gene)}"/></td>
                  <td><a href="#/${org.id}/gene/${m.gene}"><em class="gene">${m.gene}</em></a></td>
                  <td><em class="gene">${m.operon}</em></td>
                  <td><span class="reg-arrow ${m.effect === '+' ? 'reg-arrow--activate' : m.effect === '-' ? 'reg-arrow--repress' : 'reg-arrow--dual'}">${m.effect}</span></td>
                  <td>${e(m.condition)}</td>
                  <td>${evidenceBadge(m.evidence, true)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
    mountExplainer(root, r);
  }

  // ============================================================
  // SEARCH
  // ============================================================
  function viewSearch(root, r) {
    const params = new URLSearchParams(r.query);
    const q = params.get('q') || '';
    const typeFilter = params.get('type') || '';
    const org = getOrg();

    const allResults = window.REGDB_SEARCH.all();
    let results = allResults.slice();
    if (q) results = results.filter(x => x.name.toLowerCase().includes(q.toLowerCase()) || (x.desc || '').toLowerCase().includes(q.toLowerCase()));
    if (typeFilter) results = results.filter(x => x.type === typeFilter);

    const facets = {
      type: groupCount(results, 'type'),
      evidence: groupCount(results, 'evidence'),
      org: groupCount(results, 'org'),
    };

    root.innerHTML = `
      ${breadcrumbs([
        { label: org.short, href: `#/${org.id}/home` },
        { label: 'Search' },
        { label: q ? `“${e(q)}”` : (typeFilter || 'All') },
      ])}

      <h1 style="margin-bottom: 0.5rem">Search results</h1>
      <p class="muted" style="margin-bottom: 1rem">${results.length} matches${q ? ` for <strong>“${e(q)}”</strong>` : ''} across ${Object.keys(facets.org).length} organisms</p>

      <div class="active-filters">
        <span class="muted tiny">Active filters:</span>
        ${typeFilter ? `<span class="filter-chip">type: ${typeFilter}<button aria-label="Remove">×</button></span>` : ''}
        ${q ? `<span class="filter-chip">q: ${e(q)}<button aria-label="Remove">×</button></span>` : ''}
        <label class="hstack tiny" style="gap:0.25rem; margin-left: auto"><input type="checkbox" ${!typeFilter ? 'checked' : ''}/> Cross-organism</label>
      </div>

      <div class="search-layout">
        <aside class="facets" aria-label="Filters">
          ${facetGroup('Object type', facets.type, ['gene','tf','operon','regulon','promoter','dataset'])}
          ${facetGroup('Evidence', facets.evidence, ['curated','predicted','ht','weak'])}
          ${facetGroup('Organism', facets.org, Object.keys(facets.org), (k) => `<em>${getOrg(k)?.short || k}</em>`)}
          ${facetGroup('Source', { 'RegulonDB curated': 9, 'High-throughput': 2, 'Computational': 3 }, ['RegulonDB curated','High-throughput','Computational'])}
        </aside>
        <section>
          <div class="hstack" style="margin-bottom: 1rem; justify-content: space-between">
            <span class="tiny muted">Sort by</span>
            <div class="hstack">
              <button class="btn btn--ghost btn--sm">Relevance</button>
              <button class="btn btn--ghost btn--sm">Name</button>
              <button class="btn btn--ghost btn--sm">Evidence strength</button>
              ${exportBar()}
            </div>
          </div>
          ${results.length === 0
            ? `<div class="card" style="text-align:center; padding: 3rem">No results. Try a different term or broaden filters.</div>`
            : results.map(res => {
              const ro = getOrg(res.org);
              const path = res.type === 'gene' ? `#/${res.org}/gene/${res.name}`
                         : res.type === 'tf'   ? `#/${res.org}/tf/${res.name}`
                         : res.type === 'regulon' ? `#/${res.org}/regulon/${res.name}`
                         : `#/${res.org}/search?q=${encodeURIComponent(res.name)}`;
              const evClass = { curated: 'badge--curated', predicted: 'badge--predicted', ht: 'badge--ht', weak: 'badge--weak' }[res.evidence] || 'badge--plain';
              const evLabel = { curated: 'Curated', predicted: 'Predicted', ht: 'High-throughput', weak: 'Weak' }[res.evidence] || res.evidence;
              return `
                <article class="result">
                  <div class="result__top">
                    <span class="obj-tag obj-tag--${res.type}">${res.type}</span>
                    <a href="${path}" class="result__name">${res.type === 'gene' ? `<em>${highlight(res.name, q)}</em>` : highlight(res.name, q)}</a>
                    <span class="result__org">· <em>${ro?.sci || ''}</em> ${ro?.strain || ''}</span>
                    <span style="margin-left:auto"><span class="badge ${evClass}">${evLabel}</span></span>
                    <button class="btn btn--ghost btn--sm"
                            data-action="add-to-set"
                            data-organism="${e(res.org)}" data-type="${e(res.type)}"
                            data-id="${e(res.name)}" data-label="${e(res.name)}"
                            aria-label="Add ${e(res.name)} to set"
                            style="margin-left:6px">+ Set</button>
                  </div>
                  <a href="${path}" style="display:block; border-bottom:none; color:inherit; text-decoration:none">
                    <div class="result__desc">${highlight(e(res.desc), q)}</div>
                    <div class="result__meta">
                      ${res.location ? `<span>📍 ${e(res.location)}</span>` : ''}
                      <span>RegulonDB: ${res.org}/${res.type}/${res.name}</span>
                    </div>
                  </a>
                </article>
              `;
            }).join('')
          }
        </section>
      </div>
    `;
  }

  function highlight(text, q) {
    if (!q) return text;
    const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return text.replace(re, '<mark class="highlight">$1</mark>');
  }

  function groupCount(arr, key) {
    const out = {}; arr.forEach(x => { const k = x[key]; out[k] = (out[k] || 0) + 1; }); return out;
  }

  function facetGroup(title, counts, order, formatter) {
    return `
      <div class="facet-group">
        <div class="facet-group__title">${title}<a href="#" class="tiny" style="text-transform:none; letter-spacing:0">Clear</a></div>
        ${order.map(k => `
          <label class="facet-item">
            <input type="checkbox" />
            <span>${formatter ? formatter(k) : k}</span>
            <span class="facet-item__count">${counts[k] || 0}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  // ============================================================
  // COMPARE (LexA across 3 organisms)
  // ============================================================
  function viewCompare(root, r) {
    const data = D.lexA_compare;
    const activeOrg = getOrg();

    // union of targets
    const union = Array.from(new Set(data.flatMap(d => d.targets_set))).sort();
    const matrix = union.map(g => ({
      gene: g,
      cells: data.map(d => d.targets_set.includes(g))
    }));

    root.innerHTML = `
      ${breadcrumbs([
        { label: activeOrg.short, href: `#/${activeOrg.id}/home` },
        { label: 'Cross-organism', href: '#' },
        { label: 'LexA comparison' },
      ])}

      <div class="obj-header">
        <div>
          <div class="obj-header__eyebrow"><span class="obj-tag obj-tag--tf">Cross-organism TF</span></div>
          <h1>LexA across bacterial models</h1>
          <p class="obj-header__tagline">The SOS repressor is structurally conserved from Gram-negatives to Gram-positives, but recognizes <strong>different operator sequences</strong> — classic SOS box in E. coli / Salmonella, Cheo box in Bacillus — and regulates partially overlapping target sets.</p>
        </div>
        <div class="obj-header__actions">
          <button class="btn btn--primary">Export comparison (TSV)</button>
          <button class="btn btn--ghost btn--sm">Switch TF</button>
        </div>
      </div>

      <section class="section-block">
        <div class="section-block__hd"><h2>Per-organism summary</h2></div>
        <div class="compare-grid">
          ${data.map(d => {
            const o = getOrg(d.org);
            return `
              <div class="compare-col">
                <div class="compare-col__hd">
                  <span class="org-card__avatar" style="background:${o.color}; width:32px; height:32px; font-size:0.75rem">${o.initials}</span>
                  <div>
                    <div style="font-weight:700; color: var(--text-title)"><em>${o.sci}</em></div>
                    <div class="tiny muted">${o.strain}</div>
                  </div>
                </div>
                <div class="compare-col__body">
                  <div class="compare-col__metric"><span>Symbol</span><span>${d.symbol}</span></div>
                  <div class="compare-col__metric"><span>Length</span><span>${d.length} aa</span></div>
                  <div class="compare-col__metric"><span>Identity to E. coli LexA</span><span>${d.id_pct}%</span></div>
                  <div class="compare-col__metric"><span>Operator</span><span style="font-family:var(--font-mono); font-size:0.8125rem">${d.sos_box}</span></div>
                  <div class="compare-col__metric"><span>Targets (curated)</span><span>${d.n_targets}</span></div>
                  <div style="margin-top: 0.75rem" class="tiny muted">Sequence conservation</div>
                  <div class="conservation-bar">
                    <div class="conservation-bar__track"><div class="conservation-bar__fill" style="width: ${d.id_pct}%; background: ${d.id_pct > 80 ? 'var(--obj-gene)' : d.id_pct > 50 ? 'var(--accent)' : 'var(--error)'}"></div></div>
                    <span class="tiny" style="font-family:var(--font-mono)">${d.id_pct}%</span>
                  </div>
                  <div style="margin-top:0.75rem">
                    <a href="#/${d.org}/tf/LexA" class="btn btn--secondary btn--sm" style="width:100%; justify-content:center">Open ${o.short} page →</a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <section class="section-block">
        <div class="section-block__hd"><h2>Target conservation matrix</h2><p>Which SOS targets are present in each organism's curated regulon</p></div>
        <div class="table-wrap"><table class="data">
          <thead>
            <tr>
              <th class="anchor-col">Gene</th>
              ${data.map(d => {
                const o = getOrg(d.org);
                return `<th style="text-align:center"><em>${o.short}</em></th>`;
              }).join('')}
              <th>Coverage</th>
            </tr>
          </thead>
          <tbody>
            ${matrix.map(row => {
              const cov = row.cells.filter(Boolean).length;
              return `
                <tr>
                  <td class="anchor-col"><em class="gene">${row.gene}</em></td>
                  ${row.cells.map((has, i) => `
                    <td style="text-align:center">
                      ${has
                        ? `<span class="badge badge--curated" style="padding: 0.15rem 0.5rem" data-tip="Curated target in ${getOrg(data[i].org).short}">●</span>`
                        : `<span class="muted">—</span>`}
                    </td>
                  `).join('')}
                  <td><span class="tiny" style="font-family:var(--font-mono)">${cov}/${data.length}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table></div>
      </section>

      <section class="section-block">
        <div class="section-block__hd"><h2>Interpretation</h2></div>
        <div class="card card--note">
          <p style="margin-bottom: 0.5rem"><strong>Take-aways</strong></p>
          <ul style="margin:0; padding-left: 1.2rem">
            <li>Core SOS response (<em class="gene">recA</em>, <em class="gene">lexA</em>, <em class="gene">uvrA/B/D</em>, <em class="gene">ruvAB</em>) is conserved across all three.</li>
            <li>Gram-negative–specific targets (<em class="gene">sulA</em>, <em class="gene">umuDC</em>) are absent or replaced in <em>B. subtilis</em>.</li>
            <li>Operator divergence (SOS box vs Cheo box) reflects <em>parallel</em> evolution of the stress response rather than simple drift.</li>
          </ul>
        </div>
      </section>
    `;
  }

  // ============================================================
  // SVG generators
  // ============================================================
  function genomeStripSVG() {
    // Genes drawn as arrows along a horizontal line; araC is divergent from araBAD
    return `
      <svg viewBox="0 0 900 160" width="100%" height="160" role="img" aria-label="Genomic context around araC">
        <!-- coordinate axis -->
        <line x1="30" y1="110" x2="870" y2="110" stroke="#999" stroke-width="1"/>
        <g font-family="monospace" font-size="10" fill="#999">
          <text x="30" y="128">69,000</text>
          <text x="240" y="128">70,000</text>
          <text x="450" y="128">71,000</text>
          <text x="660" y="128">72,000</text>
          <text x="870" y="128" text-anchor="end">73,000</text>
        </g>

        <!-- araBAD operon (forward) -->
        <g>
          <path d="M 330 90 L 420 90 L 430 100 L 420 110 L 330 110 Z" fill="#D5E2EA" stroke="#32617D"/>
          <text x="380" y="104" text-anchor="middle" font-family="Arial" font-style="italic" font-size="13" fill="#1F3D4E" font-weight="700">araB</text>

          <path d="M 430 90 L 530 90 L 540 100 L 530 110 L 430 110 Z" fill="#D5E2EA" stroke="#32617D"/>
          <text x="485" y="104" text-anchor="middle" font-family="Arial" font-style="italic" font-size="13" fill="#1F3D4E" font-weight="700">araA</text>

          <path d="M 540 90 L 610 90 L 620 100 L 610 110 L 540 110 Z" fill="#D5E2EA" stroke="#32617D"/>
          <text x="580" y="104" text-anchor="middle" font-family="Arial" font-style="italic" font-size="13" fill="#1F3D4E" font-weight="700">araD</text>
        </g>

        <!-- araC (reverse/divergent) -->
        <g>
          <path d="M 260 70 L 330 70 L 330 90 L 260 90 L 250 80 Z" fill="#fdf0d6" stroke="#C98528"/>
          <text x="295" y="84" text-anchor="middle" font-family="Arial" font-style="italic" font-size="13" fill="#8a5a15" font-weight="700">araC</text>
        </g>

        <!-- intergenic regulatory region: operator and CRP sites -->
        <g>
          <rect x="260" y="50" width="22" height="8" fill="#C93A1D" opacity="0.7"/>
          <text x="271" y="46" text-anchor="middle" font-family="monospace" font-size="9" fill="#C93A1D">araO2</text>
          <rect x="300" y="50" width="20" height="8" fill="#C93A1D" opacity="0.7"/>
          <text x="310" y="46" text-anchor="middle" font-family="monospace" font-size="9" fill="#C93A1D">araO1</text>
          <rect x="330" y="50" width="20" height="8" fill="#2f6b48" opacity="0.7"/>
          <text x="340" y="46" text-anchor="middle" font-family="monospace" font-size="9" fill="#2f6b48">araI1</text>
          <rect x="350" y="50" width="20" height="8" fill="#2f6b48" opacity="0.7"/>
          <text x="360" y="46" text-anchor="middle" font-family="monospace" font-size="9" fill="#2f6b48">araI2</text>
          <rect x="215" y="50" width="32" height="8" fill="#32617D" opacity="0.7"/>
          <text x="231" y="46" text-anchor="middle" font-family="monospace" font-size="9" fill="#32617D">CRP</text>
        </g>

        <!-- promoter arrows -->
        <g fill="none" stroke="#1F3D4E" stroke-width="1.5">
          <path d="M 328 65 L 328 30 L 400 30" marker-end="url(#arr)"/>
          <text x="365" y="22" font-family="Arial" font-size="11" fill="#1F3D4E">P<tspan baseline-shift="sub" font-size="9">BAD</tspan></text>
          <path d="M 260 65 L 260 42 L 200 42" marker-end="url(#arr)"/>
          <text x="215" y="38" font-family="Arial" font-size="11" fill="#1F3D4E">P<tspan baseline-shift="sub" font-size="9">C</tspan></text>
        </g>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#1F3D4E"/>
          </marker>
        </defs>
      </svg>
    `;
  }

  function networkSVG(tfName, members) {
    // Circular layout
    const cx = 450, cy = 220, rad = 160;
    const n = members.length;
    const nodes = members.map((m, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return { ...m, x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad };
    });
    return `
      <svg viewBox="0 0 900 440" width="100%" height="440" role="img" aria-label="${tfName} regulon network">
        <defs>
          <marker id="repress" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <line x1="0" y1="2" x2="0" y2="8" stroke="#C93A1D" stroke-width="2.5"/>
          </marker>
          <marker id="activate" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#2f6b48"/>
          </marker>
        </defs>
        <!-- edges -->
        ${nodes.map(nd => {
          const color = nd.effect === '+' ? '#2f6b48' : '#C93A1D';
          const marker = nd.effect === '+' ? 'url(#activate)' : 'url(#repress)';
          return `<line x1="${cx}" y1="${cy}" x2="${nd.x}" y2="${nd.y}" stroke="${color}" stroke-opacity="0.55" stroke-width="1.5" marker-end="${marker}"/>`;
        }).join('')}
        <!-- central TF -->
        <circle cx="${cx}" cy="${cy}" r="34" fill="#6b2f64" stroke="#fff" stroke-width="3"/>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="Arial" font-size="14" font-weight="700" fill="#fff">${tfName}</text>
        <!-- targets -->
        ${nodes.map(nd => `
          <g>
            <circle cx="${nd.x}" cy="${nd.y}" r="18" fill="#D5E2EA" stroke="#32617D" stroke-width="1.5"/>
            <text x="${nd.x}" y="${nd.y + 4}" text-anchor="middle" font-family="Arial" font-style="italic" font-size="11" fill="#1F3D4E">${nd.gene}</text>
          </g>
        `).join('')}
      </svg>
    `;
  }

  // ============================================================
  // SUMMARY HISTORY — cross-organism release dashboard
  // Composed from: StatCardWithDelta · ReleaseHighlight · ReleaseTimeline ·
  // GrowthChart · SmartTable (all defined in the design system; class names
  // mirror lib/src/components/...).
  // ============================================================
  function viewSummaryHistory(root) {
    const releases = D.releases;
    const orgs = D.organisms;
    const orgLabel = (id) => {
      const o = orgs.find((x) => x.id === id);
      return o ? `${o.short} ${o.strain}` : id;
    };
    const ORG_COLOR = {
      'ecoli-k12': 'var(--blue-2)',
      'salmonella-typhimurium': 'var(--accent)',
      'bacillus-subtilis': 'var(--evidence-ht, #7C5295)',
    };

    // Sort newest-first.
    const desc = releases.slice().sort((a, b) => b.date.localeCompare(a.date));
    const latest = desc[0];
    const prevSameOrg = desc.find((r, i) => i > desc.indexOf(latest) && r.org === latest.org);

    // Sum the most recent stats per organism.
    const byOrgLatest = new Map();
    for (const r of desc) if (!byOrgLatest.has(r.org)) byOrgLatest.set(r.org, r);
    const sum = (k) => Array.from(byOrgLatest.values()).reduce((a, r) => a + r.stats[k], 0);
    const totals = {
      genes:        sum('genes'),
      tfs:          sum('tfs'),
      operons:      sum('operons'),
      regulons:     sum('regulons'),
      interactions: sum('interactions'),
      tfbss:        sum('tfbss'),
      datasets:     sum('datasets'),
    };
    const delta = prevSameOrg ? {
      genes:        latest.stats.genes        - prevSameOrg.stats.genes,
      tfs:          latest.stats.tfs          - prevSameOrg.stats.tfs,
      regulons:     latest.stats.regulons     - prevSameOrg.stats.regulons,
      interactions: latest.stats.interactions - prevSameOrg.stats.interactions,
      datasets:     latest.stats.datasets     - prevSameOrg.stats.datasets,
    } : null;
    const deltaRef = prevSameOrg ? prevSameOrg.v : null;

    // ---- Helpers ----
    const fmt = (n) => n.toLocaleString('en-US');
    const stat = (icon, label, value, d, tone) => {
      const t = tone || (d == null || d === 0 ? 'neutral' : d > 0 ? 'positive' : 'negative');
      const dInner = d == null
        ? null
        : d === 0
          ? `unchanged${deltaRef ? ` since ${deltaRef}` : ''}`
          : `${d > 0 ? '+' : ''}${fmt(d)}${deltaRef ? ` since ${deltaRef}` : ''}`;
      const dText = dInner == null ? '' : `<div class="stat-card-delta__delta stat-delta--${t}">${dInner}</div>`;
      return `
        <div class="stat-card-delta">
          <span class="stat-card-delta__icon" aria-hidden="true">${icon || ''}</span>
          <div class="stat-card-delta__body">
            <div class="stat-card-delta__label">${label}</div>
            <div class="stat-card-delta__value">${fmt(value)}</div>
            ${dText}
          </div>
        </div>`;
    };

    // ---- Growth chart: years × organisms (cumulative interactions) ----
    const asc = releases.slice().sort((a, b) => a.date.localeCompare(b.date));
    const xLabels = Array.from(new Set(asc.map((r) => r.date.slice(0, 4))));
    const orgsInData = Array.from(new Set(asc.map((r) => r.org)));
    // Legend uses the short organism name only — full strain blows the legend
    // out of the chart-card width and overlaps the right rail.
    const orgShort = (id) => {
      const o = orgs.find((x) => x.id === id);
      return o ? o.short : id;
    };
    const series = orgsInData.map((org) => {
      const seen = asc.filter((r) => r.org === org);
      let last = 0;
      return {
        org, label: orgShort(org), color: ORG_COLOR[org] || 'var(--blue-3)',
        values: xLabels.map((y) => {
          const inYear = seen.filter((r) => r.date.slice(0, 4) === y);
          if (inYear.length) last = inYear[inYear.length - 1].stats.interactions;
          return last;
        }),
      };
    });

    // SVG chart geometry
    const W = 720, H = 320, PAD_T = 20, PAD_R = 24, PAD_B = 36, PAD_L = 56;
    const innerW = W - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B;
    const yMax = Math.max(1, ...series.flatMap((s) => s.values));
    const xScale = (i) => PAD_L + (xLabels.length === 1 ? innerW / 2 : (innerW * i) / (xLabels.length - 1));
    const yScale = (v) => PAD_T + innerH - (innerH * v) / yMax;
    function niceStep(x) { if (x <= 0) return 1; const e = Math.floor(Math.log10(x)); const f = x / Math.pow(10, e); return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * Math.pow(10, e); }
    const tickStep = niceStep(yMax / 5);
    const ticks = []; for (let v = 0; v <= yMax + tickStep / 2; v += tickStep) ticks.push(v);
    const linePath = (vals) => vals.map((v, i) => `${i ? 'L' : 'M'} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`).join(' ');

    const chartSvg = `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Regulatory interactions over time">
        ${ticks.map((t) => `
          <g>
            <line x1="${PAD_L}" y1="${yScale(t)}" x2="${W - PAD_R}" y2="${yScale(t)}" stroke="var(--border-subtle)" stroke-width="1"/>
            <text x="${PAD_L - 8}" y="${yScale(t) + 4}" text-anchor="end" font-family="Courier New" font-size="11" fill="var(--text-tertiary)">${fmt(Math.round(t))}</text>
          </g>`).join('')}
        ${xLabels.map((label, i) => `<text x="${xScale(i)}" y="${H - 12}" text-anchor="middle" font-family="Courier New" font-size="11" fill="var(--text-tertiary)">${label}</text>`).join('')}
        ${series.map((s) => `
          <g>
            <path d="${linePath(s.values)}" fill="none" stroke="${s.color}" stroke-width="2"/>
            ${s.values.map((v, j) => `<circle cx="${xScale(j)}" cy="${yScale(v)}" r="3" fill="${s.color}"><title>${s.label} · ${xLabels[j]} · ${fmt(v)}</title></circle>`).join('')}
          </g>`).join('')}
      </svg>`;

    // ---- Release timeline (newest first) ----
    const isMajor = (v) => /\.0(\.0)?$/.test(v);
    const timelineHtml = desc.slice(0, 8).map((r) => `
      <li class="${isMajor(r.v) ? 'is-major' : ''}">
        <a href="#" style="display:block; text-decoration:none; color:inherit; border-bottom:none">
          <div class="release-timeline__head">
            <span class="release-timeline__version">${e(r.v)}</span>
            <span class="release-timeline__date">${e(r.date)}</span>
          </div>
          <div class="release-timeline__title">${e(r.title)}</div>
          <span class="release-timeline__org">${e(orgShort(r.org))}</span>
        </a>
      </li>`).join('');

    // ---- Per-release table ----
    const tableRows = desc.map((r) => `
      <tr>
        <td><code>${e(r.v)}</code></td>
        <td>${e(r.date)}</td>
        <td><span class="taxon-cell">${e(orgShort(r.org))}</span></td>
        <td style="text-align:right">${fmt(r.stats.genes)}</td>
        <td style="text-align:right">${fmt(r.stats.tfs)}</td>
        <td style="text-align:right">${fmt(r.stats.regulons)}</td>
        <td style="text-align:right">${fmt(r.stats.interactions)}</td>
        <td style="text-align:right">${fmt(r.stats.tfbss)}</td>
        <td style="text-align:right">${r.stats.datasets}</td>
      </tr>`).join('');

    // ---- Latest highlight (ReleaseHighlight) ----
    const TONE_CLASS = { feature: 'feature', data: 'data', structural: 'structural', note: 'note' };
    const tone = TONE_CLASS[latest.tone] || 'feature';
    const highlight = `
      <div class="release-highlight release-highlight--${tone}" role="note">
        <span class="release-highlight__version">${e(latest.v)}</span>
        <div class="release-highlight__body">
          <div class="release-highlight__title">${e(latest.title)}</div>
          <div class="release-highlight__desc">${e(latest.body)}</div>
        </div>
      </div>`;

    // ---- Render ----
    root.innerHTML = `
      <div class="summary-history">
        <header class="summary-history__head">
          <div>
            <h1 style="font-size: var(--fs-h1); margin: 0; color: var(--text-title)">Summary history</h1>
            <p style="color: var(--text-secondary); max-width: 70ch; margin: 8px 0 0; font-size: var(--fs-body-lg)">
              Evolution of curated transcriptional regulation across releases. Counts reflect cumulative content per organism; cross-organism totals are summed across the most-recent release per organism.
            </p>
          </div>
          <div class="summary-history__actions">
            <button class="btn btn--outline btn--sm">Export data</button>
          </div>
        </header>

        <section class="summary-history__stats">
          ${stat(I.dna,     'Genes',                totals.genes,        delta && delta.genes)}
          ${stat(I.tf,      'Transcription factors',totals.tfs,          delta && delta.tfs)}
          ${stat(I.regulon, 'Regulons',             totals.regulons,     delta && delta.regulons)}
          ${stat(I.operon,  'Reg. interactions',    totals.interactions, delta && delta.interactions)}
          ${stat(I.dataset, 'HT datasets',          totals.datasets,     delta && delta.datasets)}
        </section>

        <section class="summary-history__main">
          <aside class="summary-history__sidebar">
            <h3 style="font-size: var(--fs-h4); margin: 0 0 var(--sp-3); color: var(--text-title)">Major releases</h3>
            <ul class="release-timeline" aria-label="Release history">
              ${timelineHtml}
            </ul>
          </aside>

          <div class="summary-history__chart-area">
            <div class="growth-chart">
              <div class="growth-chart__head">
                <div class="growth-chart__title">Regulatory interactions over time</div>
                <div class="growth-chart__legend">
                  ${series.map((s) => `<span><span class="growth-chart__swatch" style="background:${s.color}"></span>${e(s.label)}</span>`).join('')}
                </div>
              </div>
              ${chartSvg}
            </div>
            <div class="card" style="padding:0">
              <div class="table-wrap">
                <div class="table-wrap__toolbar">
                  <strong>Content changes by release</strong>
                  ${exportBar()}
                </div>
                <table class="data compact">
                  <thead><tr>
                    <th>Version</th><th>Released</th><th>Organism</th>
                    <th style="text-align:right">Genes</th>
                    <th style="text-align:right">TFs</th>
                    <th style="text-align:right">Regulons</th>
                    <th style="text-align:right" title="Regulatory interactions">Interactions</th>
                    <th style="text-align:right">TFBSs</th>
                    <th style="text-align:right" title="High-throughput datasets">HT</th>
                  </tr></thead>
                  <tbody>${tableRows}</tbody>
                </table>
              </div>
            </div>
          </div>

          <aside class="summary-history__right" aria-label="Metadata, exports, and highlights">
            <div class="card">
              <h4 style="margin: 0 0 var(--sp-2)">About this summary</h4>
              <p style="margin: 0; color: var(--text-secondary); font-size: var(--fs-body)">
                Cumulative content as of each release across ${orgsInData.length} organisms. Counts are computed at curation freeze time; numbers may shift retroactively if past evidence is re-categorized.
              </p>
            </div>
            <div class="card">
              <h4 style="margin: 0 0 var(--sp-2)">Data export</h4>
              <div style="display:flex; flex-direction:column; gap:6px">
                <button class="btn btn--outline btn--sm">Export CSV</button>
                <button class="btn btn--outline btn--sm">Export TSV</button>
                <button class="btn btn--outline btn--sm">Export JSON</button>
              </div>
            </div>
            <div class="card">
              <h4 style="margin: 0 0 var(--sp-2)">Latest highlight</h4>
              ${highlight}
            </div>
          </aside>
        </section>
      </div>
    `;
  }

  // ============================================================
  // PAN-REGULOME (M-2) — orthogroup × organism × regulator pivot
  // ============================================================
  function viewPanRegulome(root, r) {
    const rows = D.pan_regulome;
    const orgs = D.organisms;
    const fns = ['All', ...Array.from(new Set(rows.map(x => x.coreFn))).sort()];
    const conservStates = ['All', 'conserved', 'divergent', 'absent', 'unknown'];

    const counts = {
      total: rows.length,
      conserved: rows.filter(x => orgs.every(o => x.cells[o.id] && x.cells[o.id].state === 'conserved')).length,
      divergent: rows.filter(x => orgs.some(o => x.cells[o.id] && x.cells[o.id].state === 'divergent')).length,
      orgSpecific: rows.filter(x => orgs.filter(o => x.cells[o.id] && x.cells[o.id].state !== 'absent' && x.cells[o.id].state !== 'unknown').length === 1).length,
    };

    const renderCell = (cell) => {
      if (!cell) return `<td class="pan-cell"><span class="cons-cell cons-cell--unknown" title="Not curated">·</span></td>`;
      const ICON = { conserved: '✓', divergent: '↺', absent: '—', unknown: '·' };
      const reg = cell.regulator || '—';
      const ev  = cell.evidence ? `<br><span class="tiny muted">${e(cell.evidence)}${cell.effect ? ' · ' + cell.effect : ''}</span>` : '';
      return `<td class="pan-cell">
        <span class="cons-cell cons-cell--${cell.state}" title="${e(reg)}">${ICON[cell.state]}</span>
        <span class="pan-cell__reg">${e(reg)}${ev}</span>
      </td>`;
    };

    const renderRow = (row) => `
      <tr data-og="${row.og}" data-fn="${e(row.coreFn)}">
        <td>
          <div class="pan-og"><strong>${row.og}</strong></div>
          <div class="muted tiny">${e(row.symbol)}</div>
        </td>
        <td><span class="tag">${e(row.coreFn)}</span></td>
        ${orgs.map(o => renderCell(row.cells[o.id])).join('')}
      </tr>
    `;

    root.innerHTML = `
      ${breadcrumbs([{ label: 'RegulonDB MG', href: '#/' }, { label: 'Pan-regulome' }])}
      <div class="page-hd">
        <h1>Pan-regulome</h1>
        <p class="muted">Comparative pivot of orthogroup &times; organism &times; regulator across the curated regulome. Cells encode whether the regulator is conserved, divergent, absent, or not yet curated for that orthogroup in that organism.</p>
      </div>

      <div class="kpi-row" style="display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--sp-4); margin-bottom: var(--sp-5);">
        <div class="card kpi-card"><div class="kpi-card__label">Orthogroups</div><div class="kpi-card__value">${counts.total}</div></div>
        <div class="card kpi-card"><div class="kpi-card__label">Conserved across all</div><div class="kpi-card__value">${counts.conserved}</div></div>
        <div class="card kpi-card"><div class="kpi-card__label">Divergent in &ge; 1</div><div class="kpi-card__value">${counts.divergent}</div></div>
        <div class="card kpi-card"><div class="kpi-card__label">Organism-specific</div><div class="kpi-card__value">${counts.orgSpecific}</div></div>
      </div>

      <div class="pan-toolbar">
        <div class="pan-toolbar__group pan-toolbar__group--wide">
          <label class="pan-toolbar__label">Function</label>
          <div class="chip-toggles" id="panFnFilter" role="tablist" aria-label="Filter by function">
            ${fns.map((f, i) => `<button class="chip-toggle" role="tab" data-fn="${e(f)}" aria-selected="${i===0}">${e(f)}</button>`).join('')}
          </div>
        </div>
        <div class="pan-toolbar__row">
          <div class="pan-toolbar__group">
            <label class="pan-toolbar__label">State</label>
            <div class="tabs tabs--segmented" id="panStateFilter" role="tablist">
              ${conservStates.map((s, i) => `<button role="tab" data-state="${s}" aria-selected="${i===0}">${e(s)}</button>`).join('')}
            </div>
          </div>
          <div class="pan-toolbar__group" style="margin-left:auto">
            <button class="btn btn--ghost btn--sm" id="panExportTSV">Export TSV</button>
          </div>
        </div>
      </div>

      <div class="pan-legend">
        <span><span class="cons-cell cons-cell--conserved">✓</span> conserved regulator + direction</span>
        <span><span class="cons-cell cons-cell--divergent">↺</span> divergent regulator (different family / opposite logic)</span>
        <span><span class="cons-cell cons-cell--absent">—</span> orthogroup absent or unregulated</span>
        <span><span class="cons-cell cons-cell--unknown">·</span> not curated</span>
      </div>

      <div class="table-wrap" id="panRegulomeTable">
        <table class="data data--pan-regulome">
          <thead><tr>
            <th style="min-width:160px">Orthogroup</th>
            <th>Function</th>
            ${orgs.map(o => `<th><div class="org-col"><span class="org-col__avatar" style="background:${o.color}">${o.initials}</span><em class="taxon">${e(o.sci)}</em><div class="muted tiny">${e(o.strain)}</div></div></th>`).join('')}
          </tr></thead>
          <tbody>${rows.map(renderRow).join('')}</tbody>
        </table>
      </div>
    `;

    // Filter wiring
    const applyFilters = () => {
      const fn = root.querySelector('#panFnFilter [aria-selected="true"]').dataset.fn;
      const st = root.querySelector('#panStateFilter [aria-selected="true"]').dataset.state;
      root.querySelectorAll('tbody tr').forEach(tr => {
        const og = D.pan_regulome.find(x => x.og === tr.dataset.og);
        const fnMatch = (fn === 'All') || tr.dataset.fn === fn;
        const stMatch = (st === 'All') || orgs.some(o => og.cells[o.id] && og.cells[o.id].state === st);
        tr.style.display = (fnMatch && stMatch) ? '' : 'none';
      });
    };
    const wireSeg = (id) => {
      root.querySelectorAll(`#${id} button`).forEach(btn => {
        btn.addEventListener('click', () => {
          root.querySelectorAll(`#${id} button`).forEach(b => b.setAttribute('aria-selected', 'false'));
          btn.setAttribute('aria-selected', 'true');
          applyFilters();
        });
      });
    };
    wireSeg('panFnFilter');
    wireSeg('panStateFilter');

    // TSV export
    root.querySelector('#panExportTSV').addEventListener('click', () => {
      const cols = ['orthogroup', 'symbol', 'function', ...orgs.map(o => o.id)];
      const lines = [cols.join('\t')];
      D.pan_regulome.forEach(row => {
        const cells = orgs.map(o => {
          const c = row.cells[o.id];
          if (!c) return '·';
          return `${c.state}|${(c.regulator || '').replace(/\|/g, ' ')}|${c.effect || ''}|${c.evidence || ''}`;
        });
        lines.push([row.og, row.symbol, row.coreFn, ...cells].join('\t'));
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'pan-regulome.tsv'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  // ============================================================
  // RRI LEADERBOARD (M-4)
  // ============================================================
  function viewRriLeaderboard(root, r) {
    const rows = D.rri_table.slice().sort((a, b) => b.rri - a.rri);
    const orgFor = id => D.organisms.find(o => o.id === id) || {};

    const scorePill = (val, band) => {
      const v = Math.max(0, Math.min(1, val));
      const b = band || (v <= 0.25 ? 'low' : v <= 0.55 ? 'medium' : v <= 0.80 ? 'high' : 'extreme');
      return `<span class="score-pill score-pill--${b}" role="meter" aria-valuemin="0" aria-valuemax="1" aria-valuenow="${v}">
        <span class="score-pill__bar" aria-hidden="true"><span class="score-pill__fill" style="width:${v*100}%"></span></span>
        <span class="score-pill__value">${v.toFixed(2)}</span>
      </span>`;
    };

    root.innerHTML = `
      ${breadcrumbs([{ label: 'RegulonDB MG', href: '#/' }, { label: 'RRI leaderboard' }])}
      <div class="page-hd">
        <h1>Regulatory Rewiring Index (RRI)</h1>
        <p class="muted">A score from <code>0</code> (regulator and target set conserved across organisms) to <code>1</code> (the regulon is wholly rewired). Variants: <strong>RRI-target</strong> (target-set churn) and <strong>RRI-regulator</strong> (regulator family churn). Higher = more interesting from a comparative standpoint.</p>
      </div>

      <div class="rri-legend">
        <span class="score-pill score-pill--low"><span class="score-pill__bar"><span class="score-pill__fill" style="width:18%"></span></span><span class="score-pill__value">0–0.25</span></span> conserved core
        <span class="score-pill score-pill--medium"><span class="score-pill__bar"><span class="score-pill__fill" style="width:48%"></span></span><span class="score-pill__value">0.26–0.55</span></span> partially rewired
        <span class="score-pill score-pill--high"><span class="score-pill__bar"><span class="score-pill__fill" style="width:72%"></span></span><span class="score-pill__value">0.56–0.80</span></span> strongly rewired
        <span class="score-pill score-pill--extreme"><span class="score-pill__bar"><span class="score-pill__fill" style="width:96%"></span></span><span class="score-pill__value">&gt; 0.80</span></span> highly rewired / novel
      </div>

      <div class="table-wrap">
        <table class="data data--rri">
          <thead><tr>
            <th>Regulon</th>
            <th>Reference organism</th>
            <th>RRI</th>
            <th>RRI-target</th>
            <th>RRI-regulator</th>
            <th>Why</th>
          </tr></thead>
          <tbody>
            ${rows.map(x => {
              const o = orgFor(x.organism);
              return `<tr>
                <td><a href="#/${x.organism}/regulon/${e(x.regulon)}"><strong>${e(x.regulon)}</strong></a></td>
                <td><em class="taxon">${e(o.sci || x.organism)}</em><br><span class="muted tiny">${e(o.strain || '')}</span></td>
                <td>${scorePill(x.rri)}</td>
                <td>${scorePill(x.targetRRI, 'medium')}</td>
                <td>${scorePill(x.regulatorRRI)}</td>
                <td class="rri-why">${e(x.summary)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ============================================================
  // DATASETS & DOWNLOADS (Q-7 + D-1..D-7)
  // ============================================================
  function viewDownloads(root, r) {
    const items = D.datasets;

    root.innerHTML = `
      ${breadcrumbs([{ label: 'RegulonDB MG', href: '#/' }, { label: 'Datasets &amp; Downloads' }])}
      <div class="page-hd">
        <h1>Datasets &amp; Downloads</h1>
        <p class="muted">Citable artefacts of every release. Each dataset is deposited in Zenodo with its own DOI; "Cite this release" copies the canonical citation. License: CC-BY 4.0 unless otherwise noted.</p>
      </div>

      <div class="downloads-grid">
        ${items.map(d => `
          <div class="card dataset-card" data-dataset-id="${e(d.id)}">
            <div class="dataset-card__head">
              <span class="dataset-card__id">${e(d.id)}</span>
              <a class="doi-badge" href="https://doi.org/${e(d.doi)}" target="_blank" rel="noreferrer noopener" aria-label="Open DOI ${e(d.doi)} in a new tab">
                <span class="doi-badge__label" aria-hidden="true">DOI</span>
                <code class="doi-badge__id">${e(d.doi)}</code>
              </a>
            </div>
            <h3 class="dataset-card__title">${e(d.title)}</h3>
            <p class="dataset-card__desc">${e(d.desc)}</p>
            <dl class="dataset-card__meta">
              <div><dt>Version</dt><dd>${e(d.version)}</dd></div>
              <div><dt>Released</dt><dd>${e(d.releaseDate)}</dd></div>
              <div><dt>Size</dt><dd>${e(d.size)}</dd></div>
              <div><dt>License</dt><dd>${e(d.license)}</dd></div>
            </dl>
            <div class="dataset-card__formats">
              ${d.formats.map(f => `<span class="tag">${e(f)}</span>`).join('')}
            </div>
            <div class="dataset-card__actions">
              <button class="btn btn--primary btn--sm" data-action="download-dataset" data-id="${e(d.id)}">Download</button>
              <button class="btn btn--ghost btn--sm" data-action="cite-dataset" data-id="${e(d.id)}">Cite this release</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Action wiring (mock: download = toast; cite = copy citation to clipboard)
    root.addEventListener('click', (ev) => {
      const dl = ev.target.closest('[data-action="download-dataset"]');
      if (dl) {
        const it = items.find(x => x.id === dl.dataset.id);
        // Reuse the prototype's existing toast, fall back to alert.
        if (window.REGDB && window.REGDB.toast) window.REGDB.toast(`Mock download — ${it.title} (${it.size})`);
        else console.log('Mock download:', it.title);
      }
      const cite = ev.target.closest('[data-action="cite-dataset"]');
      if (cite) {
        const it = items.find(x => x.id === cite.dataset.id);
        if (it && navigator.clipboard) {
          navigator.clipboard.writeText(it.cite).then(() => {
            if (window.REGDB && window.REGDB.toast) window.REGDB.toast('Citation copied to clipboard');
          });
        }
      }
    }, { once: true });
  }

  window.REGDB_VIEWS = {
    home: viewHome,
    gene: viewGene,
    tf: viewTF,
    regulon: viewRegulon,
    search: viewSearch,
    compare: viewCompare,
    summaryHistory: viewSummaryHistory,
    panRegulome: viewPanRegulome,
    rriLeaderboard: viewRriLeaderboard,
    downloads: viewDownloads,
  };
})();
