/* RegulonDB MG — Assistant
   ========================================================================
   Two flavors of "AI" UX, both driven by the mock dataset:

     (a) RAG chat        — open-ended Q&A, scripted answers + citations
     (c) Per-page explainer — page-side panel summarising the current
                            object at PI / Postdoc / Undergrad / Public
                            level

   Nothing here calls a real LLM — every response is a pattern-matched
   lookup against window.REGDB_DATA + window.REGDB_SEARCH so the prototype
   stays self-contained.

   The same primitives mirror the React design-system components:
     - chat-panel / chat-panel__header / chat-panel__messages
     - chat-msg, chat-msg--user / --assistant / --system
     - chat-composer with chat-composer__suggestions
     - citation-chip
     - explainer-panel
   ======================================================================== */

(function () {
  const D = window.REGDB_DATA;
  const SEARCH = window.REGDB_SEARCH;

  // ----------------------------------------------------------------------
  //  Knowledge base — flatten the mock dataset into citable records and
  //  small, self-contained "answer cards" matched by keyword groups.
  // ----------------------------------------------------------------------

  /** Resolve a route + readable label for any object in the corpus. */
  function refFor(type, id, org) {
    org = org || 'ecoli-k12';
    if (type === 'gene')    return { type, id, org, label: id, href: `#/${org}/gene/${id}` };
    if (type === 'tf')      return { type, id, org, label: id, href: `#/${org}/tf/${id}` };
    if (type === 'regulon') return { type, id, org, label: id, href: `#/${org}/regulon/${id}` };
    if (type === 'operon')  return { type, id, org, label: id, href: `#/${org}/search?q=${encodeURIComponent(id)}` };
    if (type === 'promoter')return { type, id, org, label: id, href: `#/${org}/search?q=${encodeURIComponent(id)}` };
    if (type === 'dataset') return { type, id, org, label: id, href: `#/${org}/search?q=${encodeURIComponent(id)}` };
    return { type: 'gene', id, org, label: id, href: `#/${org}/search?q=${encodeURIComponent(id)}` };
  }

  /** Compose an HTML string for a citation-chip row. */
  function chipsHTML(refs) {
    if (!refs || !refs.length) return '';
    return `<div class="chat-msg__cites">` + refs.map(r => `
      <a href="${r.href}" class="citation-chip" data-cite-type="${r.type}">
        <span class="obj-tag obj-tag--${r.type}">${r.type}</span>
        <span class="citation-chip__label">${r.type === 'gene' ? `<em>${r.label}</em>` : r.label}</span>
        ${r.org ? `<span class="citation-chip__meta">${(D.organisms.find(o => o.id === r.org) || {}).short || ''}</span>` : ''}
      </a>
    `).join('') + `</div>`;
  }

  // ----------------------------------------------------------------------
  //  Answer cards — pattern → scripted response. Each card returns either
  //  a string (HTML body) or { body, cites, followups }.
  // ----------------------------------------------------------------------

  const CARDS = [
    {
      id: 'lexA-overview',
      // Explicit token list — matched against tokenized question.
      match: ['lexa', 'sos', 'repressor', 'damage', 'recA*'],
      answer() {
        return {
          body: `
            <p><strong>LexA</strong> is the master repressor of the bacterial <strong>SOS response</strong> — the program that switches on when the cell senses DNA damage. Under normal growth it sits on the SOS box <code>CTGT-N₈-ACAG</code> upstream of ~40 genes (<em>recA</em>, <em>uvrA</em>, <em>uvrB</em>, <em>umuDC</em>, <em>sulA</em>, <em>polB</em>, <em>dinB</em>, …) and keeps them off.</p>
            <p>When ssDNA accumulates (replication stress, UV, mitomycin), <strong>RecA</strong> assembles into a nucleoprotein filament that stimulates LexA's auto-cleavage at the Ala-Gly bond between its DNA-binding and peptidase domains. The cleaved repressor falls off, the regulon derepresses, and translesion / repair machinery comes online.</p>
            <p class="muted">Curated in E. coli K-12 v12.0.3 — 42 LexA-repressed targets, all with strong evidence.</p>
          `,
          cites: [
            refFor('tf', 'LexA', 'ecoli-k12'),
            refFor('regulon', 'LexA', 'ecoli-k12'),
            refFor('gene', 'recA', 'ecoli-k12'),
            refFor('gene', 'lexA', 'ecoli-k12'),
          ],
          followups: [
            'Show me LexA targets',
            'Compare LexA across organisms',
            'What is the SOS box consensus?',
          ],
        };
      },
    },

    {
      id: 'lexA-targets',
      match: ['lexa', 'targets', 'genes', 'regulated', 'list'],
      answer() {
        const rows = D.lexA.regulated.map(r =>
          `<tr><td><em class="gene">${r.target}</em></td><td>${r.effect}</td><td>${r.evidence}</td></tr>`
        ).join('');
        return {
          body: `
            <p>LexA represses 14 curated targets in the prototype's snapshot of E. coli K-12 (the full curated regulon is 42 targets — the table below is the high-confidence subset shown on the LexA page).</p>
            <table class="data-table data-table--compact"><thead><tr><th>Target</th><th>Effect</th><th>Evidence</th></tr></thead><tbody>${rows}</tbody></table>
            <p class="muted" style="margin-top:8px">All entries are repression with the LexA SOS-off condition.</p>
          `,
          cites: [refFor('tf', 'LexA', 'ecoli-k12'), refFor('regulon', 'LexA', 'ecoli-k12')],
          followups: ['Compare LexA across organisms', 'Why is recA in this list?'],
        };
      },
    },

    {
      id: 'lexA-compare',
      match: ['lexa', 'compare', 'across', 'organisms', 'ortholog'],
      answer() {
        const rows = D.lexA_compare.map(r => {
          const o = D.organisms.find(x => x.id === r.org) || {};
          return `<tr><td><em class="taxon">${o.sci || r.org}</em></td><td>${r.symbol}</td><td>${r.id_pct}%</td><td><code>${r.sos_box}</code></td><td>${r.n_targets}</td></tr>`;
        }).join('');
        return {
          body: `
            <p>Across the three curated organisms LexA's <strong>function</strong> is conserved (DNA-damage repressor, RecA-stimulated auto-cleavage) but the <strong>operator</strong> is not — Gram-positives bind a Cheo box rather than the canonical SOS box.</p>
            <table class="data-table data-table--compact"><thead><tr><th>Organism</th><th>Symbol</th><th>Identity</th><th>Operator</th><th>Targets</th></tr></thead><tbody>${rows}</tbody></table>
          `,
          cites: [
            refFor('tf', 'LexA', 'ecoli-k12'),
            refFor('tf', 'LexA', 'salmonella-typhimurium'),
            refFor('tf', 'LexA', 'bacillus-subtilis'),
          ],
          followups: ['Show the SOS box logo', 'Open the cross-organism page'],
        };
      },
    },

    {
      id: 'araC-overview',
      match: ['arac', 'arabinose', 'arabad', 'arae', 'arafgh'],
      answer() {
        return {
          body: `
            <p><em class="gene">araC</em> encodes a <strong>dual regulator</strong> of L-arabinose catabolism. Without arabinose AraC binds the operator pair <code>araO2/araI1</code> as a DNA loop and <em>represses</em> the <em>araBAD</em> operon. When arabinose arrives, the loop breaks, AraC contacts <code>araI1/araI2</code>, and (with CRP-cAMP under low-glucose) <em>activates</em> <em>araBAD</em>, <em>araE</em> and <em>araFGH</em>.</p>
            <p>It also auto-regulates: <em>araC</em>'s own promoter is repressed by AraC in the unliganded state.</p>
          `,
          cites: [
            refFor('gene', 'araC', 'ecoli-k12'),
            refFor('tf', 'AraC', 'ecoli-k12'),
            refFor('regulon', 'AraC', 'ecoli-k12'),
          ],
          followups: ['Show the AraC regulon', 'What controls araC expression?', 'Compare araC orthologs'],
        };
      },
    },

    {
      id: 'sigma',
      match: ['sigma', 'σ', 'rpod', 'σ⁷⁰', 'house', 'keeping', 'factor'],
      answer() {
        return {
          body: `
            <p>Sigma factors are interchangeable subunits of bacterial RNA polymerase that select which promoter set the holoenzyme transcribes. <strong>σ⁷⁰ (RpoD)</strong> is the housekeeping factor in <em class="taxon">E. coli</em> — it recognises the canonical −10 (TATAAT) and −35 (TTGACA) boxes and drives most exponential-phase transcription. Alternative sigmas (σˢ stationary phase, σ³² heat shock, σ²⁴ extracytoplasmic stress, σ²⁸ flagellar, σ⁵⁴ nitrogen) reprogram expression in response to environment.</p>
            <p>In the prototype's curated promoters, both <em>araCp1</em> and <em>araCp2</em> are σ⁷⁰-driven.</p>
          `,
          cites: [refFor('promoter', 'araCp1', 'ecoli-k12'), refFor('promoter', 'araCp2', 'ecoli-k12')],
          followups: ['Which sigma drives the SOS regulon?', 'List σ²⁴-dependent genes'],
        };
      },
    },

    {
      id: 'evidence',
      match: ['evidence', 'curated', 'predicted', 'high-throughput', 'ht', 'ida', 'iep', 'ipi', 'codes'],
      answer() {
        return {
          body: `
            <p>Every interaction carries an <strong>evidence code</strong> from the GO ontology and a <strong>tier</strong> reflecting how RegulonDB curates it:</p>
            <ul>
              <li><strong>Curated</strong> — direct experimental evidence (IDA, IPI, IGI). Manually reviewed.</li>
              <li><strong>Predicted</strong> — sequence- or model-based call (IEA, IEP) without direct experimental support.</li>
              <li><strong>High-throughput (HT)</strong> — ChIP-seq / ChIP-exo / gSELEX peaks, evidence-weighted but not individually verified.</li>
              <li><strong>Weak</strong> — single-line literature mentions, deprecated calls, propagated annotations.</li>
            </ul>
            <p>The evidence ontology was formalised in v11.0 (Sept 2022) and back-mapped to all interactions.</p>
          `,
          cites: [],
          followups: ['Show release notes for v11.0', 'How is HT data ingested?'],
        };
      },
    },

    {
      id: 'gensor',
      match: ['gensor', 'unit', 'signal', 'sensor'],
      answer() {
        return {
          body: `
            <p>A <strong>GENSOR unit</strong> bundles a <em>signal</em> (e.g. arabinose), the <em>sensor</em> that perceives it (e.g. AraC's effector pocket), the downstream <em>transcription factor</em>, and the <em>response</em> (regulated genes / metabolic outcome) into one navigable object. They were introduced as first-class entities in v10.0 (2019) and 12 amino-acid biosynthesis units were added in v12.0.2.</p>
          `,
          cites: [],
          followups: ['Show the AraC GENSOR unit', 'List GENSOR units added in v12'],
        };
      },
    },

    {
      id: 'orgs',
      match: ['organisms', 'organism', 'available', 'covered', 'species', 'list'],
      answer() {
        const rows = D.organisms.map(o =>
          `<tr><td><em class="taxon">${o.sci}</em><br><span class="muted">${o.strain}</span></td><td>${o.stats.genes.toLocaleString()}</td><td>${o.stats.tfs}</td><td>${o.stats.regulons}</td><td>${o.version}</td></tr>`
        ).join('');
        return {
          body: `
            <p>RegulonDB MG currently covers ${D.organisms.length} organisms:</p>
            <table class="data-table data-table--compact"><thead><tr><th>Organism</th><th>Genes</th><th>TFs</th><th>Regulons</th><th>Version</th></tr></thead><tbody>${rows}</tbody></table>
          `,
          cites: [],
          followups: ['Switch to Bacillus subtilis', 'When was Salmonella added?'],
        };
      },
    },

    {
      id: 'releases',
      match: ['release', 'version', 'changelog', 'updates', 'history', 'v12'],
      answer() {
        const recent = D.releases.slice(0, 4).map(r => {
          const o = D.organisms.find(x => x.id === r.org) || {};
          return `<li><strong>${r.v}</strong> · <span class="muted">${r.date} · ${o.short || r.org}</span><br>${r.title}</li>`;
        }).join('');
        return {
          body: `
            <p>Recent releases across all organisms:</p>
            <ul class="chat-list">${recent}</ul>
          `,
          cites: [],
          followups: ['Open the full release timeline'],
        };
      },
    },
  ];

  // ----------------------------------------------------------------------
  //  Question router — tokenise, score against each card's match list,
  //  fall back to a search-results card if no card scored well.
  // ----------------------------------------------------------------------

  function tokenize(q) {
    return q.toLowerCase()
      .replace(/[^a-z0-9σ⁷⁰⁵⁴²⁸³⁶²⁴ -]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function answer(q) {
    const tokens = tokenize(q);
    if (!tokens.length) {
      return { body: `<p class="muted">Ask about a gene, transcription factor, regulon, or any concept in the database.</p>`, cites: [], followups: [] };
    }
    let best = null, bestScore = 0;
    for (const card of CARDS) {
      const score = card.match.reduce((s, m) => s + (tokens.includes(m) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = card; }
    }
    if (best && bestScore >= 1) return best.answer();

    // Fallback: search the corpus and dump top hits as a result card.
    const hits = SEARCH.suggest(q).slice(0, 6);
    if (hits.length) {
      const refs = hits.map(h => refFor(h.type, h.name, h.org));
      return {
        body: `<p>I couldn't find a curated explainer for "<em>${escapeHTML(q)}</em>", but here are the most relevant objects from the database:</p>`,
        cites: refs,
        followups: hits.slice(0, 3).map(h => `Tell me about ${h.name}`),
      };
    }
    return {
      body: `<p>I don't have an answer for "<em>${escapeHTML(q)}</em>" in the prototype's mock corpus. Try asking about <strong>LexA</strong>, the <strong>SOS response</strong>, <em class="gene">araC</em>, evidence codes, or release history.</p>`,
      cites: [],
      followups: ['Tell me about LexA', 'What is the SOS response?', 'How is evidence classified?'],
    };
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
    }[ch]));
  }

  // ----------------------------------------------------------------------
  //  Per-page explainer (c) — given the current route, produce four
  //  audience-tuned explanations + citation chips back to the source page.
  // ----------------------------------------------------------------------

  /**
   * Build an explanation for the route the user is currently on. Returns
   * `null` when the current page has no curated explainer (in which case
   * the page should hide the panel).
   */
  function explainPage(route) {
    if (!route) return null;
    const { view, id, org } = route;

    if (view === 'gene' && id === 'araC') {
      return {
        title: `About ${labelGene('araC')}`,
        levels: {
          pi: `<p><em class="gene">araC</em> (b0064, 879 nt, 292 aa, − strand) encodes the dual regulator AraC. AraC is the prototypical example of dimer-mediated DNA looping: in the absence of arabinose, AraC bridges <code>aroO2</code> and <code>araI1</code>, sequestering the −35 of <em>araBAD</em>'s promoter and repressing it. Arabinose binding flips the dimer geometry, breaking the loop and allowing CRP-cAMP-stimulated activation of <em>araBAD</em>, <em>araE</em> and <em>araFGH</em>. araCp1 and araCp2 are σ⁷⁰-dependent and themselves AraC-repressed when unliganded.</p>`,
          postdoc: `<p><em class="gene">araC</em> codes for AraC, the regulator of L-arabinose catabolism. Without arabinose AraC represses <em>araBAD</em> via a DNA loop between <code>aroO2</code> and <code>araI1</code>. With arabinose it activates <em>araBAD</em>, <em>araE</em> and <em>araFGH</em>; CRP-cAMP is required for full activation under glucose limitation. AraC also auto-represses <em>araC</em> in the absence of inducer.</p>`,
          undergrad: `<p>The gene <em class="gene">araC</em> makes a protein, AraC, that decides whether the cell turns on its arabinose-eating genes. When arabinose is present, AraC switches the genes on. When it isn't, AraC switches them off. It also keeps its own production in check.</p>`,
          public: `<p><em>araC</em> is a "switch" gene in <em>E. coli</em>. It senses the sugar arabinose and tells the cell when to start digesting it.</p>`,
        },
        cites: [
          refFor('gene', 'araC', org),
          refFor('tf', 'AraC', org),
          refFor('regulon', 'AraC', org),
        ],
      };
    }

    if (view === 'tf' && id === 'LexA') {
      return {
        title: `About ${id}`,
        levels: {
          pi: `<p>LexA is the master repressor of the SOS response (S24 peptidase family, 202 aa). It binds the SOS box <code>CTGT-N₈-ACAG</code> as a dimer and represses ~40 genes. The HTH domain (residues 3–69) recognises the operator; the C-terminal peptidase domain (85–196) catalyses RecA*-stimulated auto-cleavage at the Ala84-Gly85 bond, derepressing the regulon. The cleaved fragments are degraded by ClpXP, ensuring a sharp transition. Auto-regulation at <em>lexAp</em> tunes basal repressor levels.</p>`,
          postdoc: `<p>LexA represses the SOS regulon (recA, lexA itself, sulA, umuDC, uvrA/B/D, ruvAB, polB, dinB and others). Upon DNA damage, RecA filaments on ssDNA stimulate LexA's auto-cleavage, releasing the operators and inducing repair / translesion machinery. The Cheo box in B. subtilis is a non-orthologous operator for the Gram-positive LexA homolog (DinR).</p>`,
          undergrad: `<p>LexA is a "stop" sign that bacterial cells put on their DNA-repair genes. When the DNA is fine, LexA keeps those genes off. When DNA gets damaged, another protein called RecA helps LexA destroy itself, and the repair genes turn on.</p>`,
          public: `<p>LexA is a switch that bacteria use to call in DNA-repair workers when their DNA is damaged.</p>`,
        },
        cites: [
          refFor('tf', 'LexA', org),
          refFor('regulon', 'LexA', org),
          refFor('gene', 'recA', org),
        ],
      };
    }

    if (view === 'regulon' && id === 'AraC') {
      const n = D.regulonAraC.members.length;
      return {
        title: `About the ${id} regulon`,
        levels: {
          pi: `<p>The AraC regulon in <em class="taxon">E. coli</em> K-12 covers ${n} curated members across the <em>araBAD</em>, <em>araE</em>, <em>araFGH</em>, <em>araJ</em> and <em>ygeA</em> operons. AraC operates as a Janus regulator: looping-mediated repression in the apo state, and CRP-cAMP-coordinated activation in the holo state. The dual mode allows tight off-state expression with rapid induction kinetics.</p>`,
          postdoc: `<p>AraC's regulon (${n} members) controls L-arabinose uptake (<em>araE</em>, <em>araFGH</em>) and catabolism (<em>araBAD</em>). The regulator senses arabinose directly via its N-terminal arabinose-binding pocket and switches between repressing and activating conformations.</p>`,
          undergrad: `<p>The AraC regulon is the small group of genes that all turn on together when AraC senses arabinose. They are the genes the cell needs to bring arabinose in and break it down.</p>`,
          public: `<p>A regulon is a team of genes a single regulator switches on or off together. The AraC regulon turns on when the bacterium finds arabinose to eat.</p>`,
        },
        cites: [
          refFor('regulon', 'AraC', org),
          refFor('tf', 'AraC', org),
        ],
      };
    }

    return null;
  }

  function labelGene(symbol) {
    return `<em class="gene">${symbol}</em>`;
  }

  // ----------------------------------------------------------------------
  //  Public API
  // ----------------------------------------------------------------------
  window.REGDB_ASSIST = { answer, explainPage, refFor, escapeHTML, chipsHTML };
})();
