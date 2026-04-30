/* RegulonDB MG — Icons + small search helper */

window.REGDB_ICONS = {
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>`,
  chevronRight: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 6 6 6-6 6"/></svg>`,
  close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  theme: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10 8 8 0 0 1-10-10Z"/></svg>`,
  download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16"/></svg>`,
  help: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h.01"/></svg>`,
  sliders: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>`,
  info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v.01M11 12h1v5h1"/></svg>`,
  external: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14 21 3M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>`,
  dna: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3c4 4 12 4 16 0M4 21c4-4 12-4 16 0M4 8c4 2 12 2 16 0M4 16c4-2 12-2 16 0"/></svg>`,
  operon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4l2-4h4l2 4h4M3 12l-0 5h18v-5"/></svg>`,
  regulon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="15" r="2"/><circle cx="19" cy="15" r="2"/><circle cx="12" cy="19" r="2"/><path d="M12 7v10M12 7 6 14M12 7l6 7M6 16l5 3M18 16l-5 3"/></svg>`,
  tf: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="9" width="18" height="6" rx="1"/><path d="M7 9V6m10 3V6m-5 3v6"/></svg>`,
  promoter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17h12l-3-3m3 3-3 3M3 12h18M3 7h6"/></svg>`,
  dataset: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="8" ry="2.5"/><path d="M4 5v14c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V5M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5"/></svg>`,
  tools: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a3 3 0 0 0 4 4L22 13l-9 9-3-3 9-9-2.3-2.3zM6 13l3 3-6 6H3v-3z"/></svg>`,
  compare: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v18M16 3v18M4 7h8M12 17h8"/></svg>`,
  plus: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`,
  minus: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>`,
};

// Lightweight fuzzy search over the mock dataset
window.REGDB_SEARCH = (function () {
  const D = window.REGDB_DATA;
  // Build a searchable pool
  const pool = D.search_results.slice();
  // Add the detailed objects as canonical entries too
  pool.push({ type: 'gene', name: 'araC', desc: 'L-arabinose utilization system regulator; dual activator/repressor.', org: 'ecoli-k12', evidence: 'curated' });
  pool.push({ type: 'tf', name: 'AraC', desc: 'Arabinose-sensing dual regulator; activates araBAD, araE, araFGH.', org: 'ecoli-k12', evidence: 'curated' });
  pool.push({ type: 'regulon', name: 'AraC', desc: '10 genes in the arabinose utilization regulon.', org: 'ecoli-k12', evidence: 'curated' });
  pool.push({ type: 'tf', name: 'CRP', desc: 'cAMP receptor protein; global regulator of catabolite repression.', org: 'ecoli-k12', evidence: 'curated' });

  function suggest(q) {
    q = q.toLowerCase();
    return pool.filter(p =>
      p.name.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q))
    ).map(p => {
      let path;
      if (p.type === 'gene') path = `/${p.org}/gene/${p.name}`;
      else if (p.type === 'tf') path = `/${p.org}/tf/${p.name}`;
      else if (p.type === 'regulon') path = `/${p.org}/regulon/${p.name}`;
      else path = `/${p.org}/search?q=${encodeURIComponent(p.name)}`;
      return { ...p, path };
    });
  }

  function all() { return pool; }
  return { suggest, all };
})();
