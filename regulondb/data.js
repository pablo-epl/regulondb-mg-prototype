/* RegulonDB MG — Mock data for the prototype
   Realistic-but-simulated data. Real gene names and well-documented
   biology only; counts/IDs are placeholders. */

window.REGDB_DATA = (function () {
  const organisms = [
    {
      id: 'ecoli-k12',
      sci: 'Escherichia coli',
      strain: 'K-12 MG1655',
      short: 'E. coli',
      taxid: '511145',
      color: '#72A7C7',
      initials: 'Ec',
      stats: { genes: 4639, tfs: 335, operons: 2783, promoters: 4174, regulons: 214, updated: '2026-03-14' },
      version: 'v12.0',
      desc: 'Reference organism for bacterial transcriptional regulation. Deepest curation; paired with EcoCyc.',
    },
    {
      id: 'salmonella-typhimurium',
      sci: 'Salmonella enterica',
      strain: 'serovar Typhimurium LT2',
      short: 'S. Typhimurium',
      taxid: '99287',
      color: '#C98528',
      initials: 'St',
      stats: { genes: 4556, tfs: 284, operons: 2491, promoters: 3120, regulons: 172, updated: '2026-02-02' },
      version: 'v1.4',
      desc: 'Enteric pathogen; strong ortholog coverage with E. coli. Added 2024.',
    },
    {
      id: 'bacillus-subtilis',
      sci: 'Bacillus subtilis',
      strain: '168',
      short: 'B. subtilis',
      taxid: '224308',
      color: '#7a4a1e',
      initials: 'Bs',
      stats: { genes: 4245, tfs: 258, operons: 2110, promoters: 2687, regulons: 149, updated: '2026-01-20' },
      version: 'v1.2',
      desc: 'Gram-positive model. Distinct sigma factor repertoire and sporulation circuitry.',
    },
  ];

  // releases[].stats are cumulative-as-of-that-version totals. tone marks the
  // headline kind (feature / data / structural / note) for ReleaseHighlight.
  const releases = [
    // ---- E. coli K-12 ----
    { v: 'v12.0.3', date: '2026-03-14', org: 'ecoli-k12', tone: 'data',
      title: '84 new TF–gene interactions from recent ChIP-exo',
      body: 'Incorporates Ishihama lab 2025 ChIP-exo dataset; 84 new interactions with strong evidence, 19 re-annotated.',
      stats: { genes: 4639, tfs: 335, operons: 2783, promoters: 4174, regulons: 214, datasets: 47, interactions: 9870, tfbss: 12560 } },
    { v: 'v12.0.2', date: '2025-12-08', org: 'ecoli-k12', tone: 'feature',
      title: 'GENSOR units for amino-acid biosynthesis',
      body: 'Added 12 new GENSOR units linking metabolic state to transcriptional response.',
      stats: { genes: 4639, tfs: 335, operons: 2783, promoters: 4170, regulons: 214, datasets: 45, interactions: 9786, tfbss: 12498 } },
    { v: 'v12.0.1', date: '2025-09-12', org: 'ecoli-k12', tone: 'data',
      title: 'gSELEX dataset import (170 conditions)',
      body: 'Ishihama lab gSELEX panel ingested as HT dataset; 9 weak-evidence interactions promoted to predicted.',
      stats: { genes: 4639, tfs: 333, operons: 2778, promoters: 4128, regulons: 213, datasets: 44, interactions: 9712, tfbss: 12420 } },
    { v: 'v12.0', date: '2024-11-04', org: 'ecoli-k12', tone: 'feature',
      title: 'RegulonDB v12 release',
      body: 'Major curation pass; sigma-factor reassignment, evidence ontology cleanup, FAIR exports.',
      stats: { genes: 4636, tfs: 328, operons: 2769, promoters: 4096, regulons: 212, datasets: 41, interactions: 9540, tfbss: 12090 } },
    { v: 'v11.2', date: '2023-06-21', org: 'ecoli-k12', tone: 'data',
      title: 'ChIP-seq overlay layer',
      body: '47 ChIP-seq datasets aligned and overlaid on the regulatory map.',
      stats: { genes: 4632, tfs: 318, operons: 2750, promoters: 3960, regulons: 208, datasets: 32, interactions: 9210, tfbss: 11680 } },
    { v: 'v11.0', date: '2022-09-08', org: 'ecoli-k12', tone: 'structural',
      title: 'New evidence taxonomy',
      body: 'Curated / Predicted / High-throughput / Weak categories formalized; back-mapped to all interactions.',
      stats: { genes: 4621, tfs: 305, operons: 2718, promoters: 3760, regulons: 198, datasets: 22, interactions: 8730, tfbss: 11140 } },
    { v: 'v10.10', date: '2021-04-15', org: 'ecoli-k12', tone: 'data',
      title: 'Operon predictions refined',
      body: 'Operons reorganized using updated transcription-unit boundaries.',
      stats: { genes: 4598, tfs: 287, operons: 2680, promoters: 3540, regulons: 188, datasets: 16, interactions: 8210, tfbss: 10620 } },
    { v: 'v10.0', date: '2019-11-22', org: 'ecoli-k12', tone: 'feature',
      title: 'GENSOR units introduced',
      body: 'Signal → sensor → TF → response model added as a first-class object.',
      stats: { genes: 4540, tfs: 256, operons: 2603, promoters: 3210, regulons: 174, datasets: 12, interactions: 7440, tfbss: 9810 } },

    // ---- Salmonella Typhimurium LT2 ----
    { v: 'v1.4', date: '2026-02-02', org: 'salmonella-typhimurium', tone: 'data',
      title: 'Salmonella Typhimurium LT2 reaches 172 regulons',
      body: 'New curation pass on SPI-1 and SPI-2 regulatory regions. HilA, InvF and SsrB regulons now fully annotated.',
      stats: { genes: 4556, tfs: 284, operons: 2491, promoters: 3120, regulons: 172, datasets: 18, interactions: 5720, tfbss: 6810 } },
    { v: 'v1.3', date: '2025-08-19', org: 'salmonella-typhimurium', tone: 'feature',
      title: 'Two-component systems imported',
      body: 'PhoP/PhoQ, OmpR/EnvZ, BarA/SirA two-component pairs annotated with effectors.',
      stats: { genes: 4548, tfs: 269, operons: 2462, promoters: 2980, regulons: 158, datasets: 14, interactions: 5410, tfbss: 6320 } },
    { v: 'v1.2', date: '2025-02-10', org: 'salmonella-typhimurium', tone: 'data',
      title: 'Initial ChIP-seq import',
      body: '8 ChIP-seq datasets ingested; ortholog map vs E. coli K-12 published.',
      stats: { genes: 4532, tfs: 244, operons: 2410, promoters: 2780, regulons: 138, datasets: 8, interactions: 4920, tfbss: 5640 } },
    { v: 'v1.0', date: '2024-06-04', org: 'salmonella-typhimurium', tone: 'feature',
      title: 'Salmonella seed release',
      body: 'Initial multi-organism ingestion: genome, gene calls, baseline regulon set.',
      stats: { genes: 4520, tfs: 210, operons: 2360, promoters: 2540, regulons: 96, datasets: 0, interactions: 3210, tfbss: 3480 } },

    // ---- Bacillus subtilis 168 ----
    { v: 'v1.2', date: '2026-01-20', org: 'bacillus-subtilis', tone: 'feature',
      title: 'B. subtilis sporulation cascade fully curated',
      body: 'Spo0A, σ^F, σ^E, σ^G, σ^K cascade imported with cross-references to SubtiWiki.',
      stats: { genes: 4245, tfs: 258, operons: 2110, promoters: 2687, regulons: 149, datasets: 11, interactions: 4910, tfbss: 5320 } },
    { v: 'v1.1', date: '2025-04-30', org: 'bacillus-subtilis', tone: 'data',
      title: 'SubtiWiki regulator import',
      body: 'CcpA, AbrB, CodY regulons aligned with SubtiWiki annotations.',
      stats: { genes: 4232, tfs: 232, operons: 2078, promoters: 2480, regulons: 124, datasets: 6, interactions: 4180, tfbss: 4520 } },
    { v: 'v1.0', date: '2024-09-15', org: 'bacillus-subtilis', tone: 'feature',
      title: 'B. subtilis seed release',
      body: 'Genome ingested; baseline regulons from DBTBS imported as predicted.',
      stats: { genes: 4220, tfs: 198, operons: 2010, promoters: 2240, regulons: 80, datasets: 0, interactions: 3120, tfbss: 3010 } },
  ];

  // ---- Gene: araC (E. coli K-12) ----
  const araC = {
    id: 'araC',
    symbol: 'araC',
    name: 'arabinose operon regulatory protein',
    organism: 'ecoli-k12',
    synonyms: ['b0064'],
    type: 'gene',
    length_nt: 879,
    length_aa: 292,
    strand: '-',
    start: 70387, end: 71265,
    operon: 'araC',
    product: 'AraC',
    function: 'Dual regulator of the L-arabinose utilization system; activates the araBAD, araC, araE and araFGH operons in the presence of arabinose and represses araC in its absence.',
    tus: ['araCp → araC'],
    promoters: [
      { id: 'araCp1', sigma: 'σ⁷⁰', tss: 70388, box10: 'TATGTT', box35: 'CTGACG', evidence: 'IDA', curated: true },
      { id: 'araCp2', sigma: 'σ⁷⁰', tss: 70377, box10: 'TACAAT', box35: 'TTAACG', evidence: 'IEP', curated: true },
    ],
    regulation_in: [
      { tf: 'AraC', effect: '-', mode: 'repress', evidence: 'IDA', condition: 'no arabinose', curated: true, site: 'aroO2 (70410..70427)' },
      { tf: 'CRP', effect: '+', mode: 'activate', evidence: 'IDA', condition: '+ cAMP (low glucose)', curated: true, site: 'CRP-araC1 (70334..70356)' },
      { tf: 'AraC', effect: '+', mode: 'activate', evidence: 'IPI', condition: '+ arabinose', curated: true, site: 'araI1/araI2' },
    ],
    regulation_out: [
      { target: 'araBAD', effect: '+', mode: 'activate', condition: '+ arabinose', evidence: 'IDA', curated: true },
      { target: 'araFGH', effect: '+', mode: 'activate', condition: '+ arabinose', evidence: 'IDA', curated: true },
      { target: 'araE',   effect: '+', mode: 'activate', condition: '+ arabinose', evidence: 'IDA', curated: true },
      { target: 'araJ',   effect: '+', mode: 'activate', condition: '+ arabinose', evidence: 'IEP', curated: false },
      { target: 'araC',   effect: '-', mode: 'repress',  condition: '− arabinose', evidence: 'IDA', curated: true },
    ],
    related_objects: [
      { t: 'operon', id: 'araBAD', org: 'ecoli-k12' },
      { t: 'regulon', id: 'AraC',  org: 'ecoli-k12' },
      { t: 'tf', id: 'AraC', org: 'ecoli-k12' },
      { t: 'tf', id: 'CRP',  org: 'ecoli-k12' },
    ],
    references: [
      { id: 'PMID:9023224',  short: 'Schleif R. (1996). Two positively acting regulators, AraC and CRP, activate the Escherichia coli araBAD operon. J Mol Biol.' },
      { id: 'PMID:8026463',  short: 'Lobell RB, Schleif RF. (1990). DNA looping and unlooping by AraC protein. Science 250.' },
      { id: 'PMID:11139615', short: 'Schleif R. (2000). Regulation of the L-arabinose operon of Escherichia coli. Trends Genet.' },
    ],
    orthologs: [
      { org: 'salmonella-typhimurium', symbol: 'araC', identity: 86, conservation: 'regulatory mechanism conserved' },
      { org: 'bacillus-subtilis', symbol: '—', identity: null, conservation: 'no direct ortholog; arabinose regulation via AraR (distinct family)' },
    ],
  };

  // ---- TF: LexA (E. coli K-12) ----
  const lexA = {
    id: 'LexA',
    symbol: 'LexA',
    gene: 'lexA',
    organism: 'ecoli-k12',
    type: 'tf',
    family: 'LexA repressor, S24 peptidase',
    length_aa: 202,
    domains: [
      { name: 'HTH DNA-binding', start: 3, end: 69, role: 'Helix-turn-helix — recognizes SOS box (CTGT-N8-ACAG)' },
      { name: 'Peptidase S24',  start: 85, end: 196, role: 'Auto-catalytic cleavage domain activated by RecA* nucleoprotein filament' },
    ],
    effectors: [
      { name: 'RecA* (filament)', mode: 'inactivating', evidence: 'IDA' },
      { name: 'ssDNA-stress signal', mode: 'indirect', evidence: 'IEP' },
    ],
    consensus_site: 'CTGT-N₈-ACAG (SOS box, 20 bp)',
    regulated: [
      { target: 'recA',   effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
      { target: 'lexA',   effect: '-', mode: 'repress', evidence: 'IDA', cond: 'auto' },
      { target: 'sulA',   effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
      { target: 'umuDC',  effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
      { target: 'uvrA',   effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
      { target: 'uvrB',   effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
      { target: 'uvrD',   effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
      { target: 'ruvAB',  effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
      { target: 'polB',   effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
      { target: 'dinB',   effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
      { target: 'dinI',   effect: '-', mode: 'repress', evidence: 'IEP', cond: 'SOS off' },
      { target: 'sbmC',   effect: '-', mode: 'repress', evidence: 'IEP', cond: 'SOS off' },
      { target: 'ftsK',   effect: '-', mode: 'repress', evidence: 'IC',  cond: 'SOS off' },
      { target: 'yebG',   effect: '-', mode: 'repress', evidence: 'IDA', cond: 'SOS off' },
    ],
    summary: 'Master repressor of the SOS response to DNA damage. Binds the SOS box of ~40 genes; upon DNA damage it undergoes RecA-stimulated auto-cleavage, derepressing the regulon.',
    references: [
      { id: 'PMID:11448770', short: 'Little JW. (1991). Mechanism of specific LexA cleavage. Biochimie 73.' },
      { id: 'PMID:16077032', short: 'Fernández de Henestrosa AR et al. (2000). Identification of additional genes belonging to the LexA regulon. Mol Microbiol.' },
    ],
  };

  // Cross-organism LexA comparison data
  const lexA_compare = [
    { org: 'ecoli-k12',  symbol: 'LexA', id_pct: 100, length: 202, sos_box: 'CTGT-N₈-ACAG', n_targets: 42, curation: 'strong', targets_set: ['recA','lexA','sulA','umuDC','uvrA','uvrB','uvrD','ruvAB','polB','dinB','dinI','sbmC','ftsK','yebG'] },
    { org: 'salmonella-typhimurium', symbol: 'LexA', id_pct: 91, length: 202, sos_box: 'CTGT-N₈-ACAG', n_targets: 38, curation: 'strong', targets_set: ['recA','lexA','sulA','umuDC','uvrA','uvrB','uvrD','ruvAB','polB','dinB','yebG','STM1254'] },
    { org: 'bacillus-subtilis', symbol: 'LexA (DinR)', id_pct: 37, length: 205, sos_box: 'CGAAC-N₄-GTTCG (Cheo box)', n_targets: 33, curation: 'strong', targets_set: ['recA','lexA','uvrBA','ruvAB','polY1','polY2','yneA','yneB','yolD'] },
  ];

  const regulonAraC = {
    id: 'AraC',
    organism: 'ecoli-k12',
    tf: 'AraC',
    members: [
      { gene: 'araB', operon: 'araBAD', effect: '+', condition: '+ arabinose', evidence: 'IDA' },
      { gene: 'araA', operon: 'araBAD', effect: '+', condition: '+ arabinose', evidence: 'IDA' },
      { gene: 'araD', operon: 'araBAD', effect: '+', condition: '+ arabinose', evidence: 'IDA' },
      { gene: 'araC', operon: 'araC',    effect: '±', condition: 'dual (auto)', evidence: 'IDA' },
      { gene: 'araE', operon: 'araE',    effect: '+', condition: '+ arabinose', evidence: 'IDA' },
      { gene: 'araF', operon: 'araFGH',  effect: '+', condition: '+ arabinose', evidence: 'IDA' },
      { gene: 'araG', operon: 'araFGH',  effect: '+', condition: '+ arabinose', evidence: 'IDA' },
      { gene: 'araH', operon: 'araFGH',  effect: '+', condition: '+ arabinose', evidence: 'IDA' },
      { gene: 'araJ', operon: 'araJ',    effect: '+', condition: '+ arabinose', evidence: 'IEP' },
      { gene: 'ygeA', operon: 'ygeA',    effect: '+', condition: '+ arabinose', evidence: 'IEP' },
    ],
  };

  const search_results = [
    { type: 'gene', name: 'lexA', desc: 'Repressor of the SOS response; auto-cleaves under DNA damage.', org: 'ecoli-k12', evidence: 'curated', location: 'NC_000913.3 : 4,254,631 – 4,255,238 (+)' },
    { type: 'tf', name: 'LexA', desc: 'Transcriptional repressor binding the SOS box (CTGT-N8-ACAG). 42 curated targets.', org: 'ecoli-k12', evidence: 'curated' },
    { type: 'regulon', name: 'LexA', desc: 'SOS regulon — 42 genes repressed under normal growth; derepressed on DNA damage.', org: 'ecoli-k12', evidence: 'curated' },
    { type: 'gene', name: 'lexA', desc: 'Ortholog in Salmonella; 91% identity to E. coli LexA.', org: 'salmonella-typhimurium', evidence: 'curated' },
    { type: 'tf', name: 'LexA (DinR)', desc: 'B. subtilis SOS repressor; recognizes Cheo box (CGAAC-N4-GTTCG), distinct from Gram-negative SOS box.', org: 'bacillus-subtilis', evidence: 'curated' },
    { type: 'gene', name: 'recA', desc: 'Recombinase; forms nucleoprotein filaments on ssDNA that stimulate LexA auto-cleavage.', org: 'ecoli-k12', evidence: 'curated' },
    { type: 'promoter', name: 'lexAp', desc: 'σ⁷⁰ promoter upstream of lexA — auto-regulated by LexA itself.', org: 'ecoli-k12', evidence: 'curated' },
    { type: 'operon', name: 'umuDC', desc: 'SOS-induced operon encoding translesion polymerase V. LexA-repressed.', org: 'ecoli-k12', evidence: 'curated' },
    { type: 'gene', name: 'lexA',  desc: 'Ortholog call inferred from sequence. Functional validation pending.', org: 'bacillus-subtilis', evidence: 'predicted' },
    { type: 'dataset', name: 'ChIP-exo LexA (Ishihama 2025)', desc: 'Genome-wide LexA binding under mitomycin-C stress. 46 peaks; 39 overlap curated targets.', org: 'ecoli-k12', evidence: 'ht' },
  ];

  // ----------------------------------------------------------------------
  //  Pan-regulome (M-2): orthogroups × organism × regulator × evidence.
  //  Each row = one orthogroup; cells[orgId] = { state, regulator, evidence,
  //  effect } where state is the ConservationCell state.
  //
  //  States:
  //    - conserved : same regulator (ortholog) + same direction
  //    - divergent : a different regulator controls this orthogroup
  //    - absent    : the orthogroup is present but unregulated (or no curated edge)
  //    - unknown   : the orthogroup hasn't been curated yet in this organism
  //
  //  The `coreFn` field clusters orthogroups by functional category for
  //  filter chips at the top of the pan-regulome page.
  // ----------------------------------------------------------------------
  const pan_regulome = [
    // ---- DNA damage / SOS ----
    { og: 'OG_recA',  symbol: 'recA',  coreFn: 'DNA repair', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'LexA',         effect: '-', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'LexA',         effect: '-', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'LexA (DinR)',  effect: '-', evidence: 'IDA' },
    }},
    { og: 'OG_lexA',  symbol: 'lexA',  coreFn: 'DNA repair', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'LexA',         effect: '-', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'LexA',         effect: '-', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'LexA (DinR)',  effect: '-', evidence: 'IDA' },
    }},
    { og: 'OG_uvrA',  symbol: 'uvrA',  coreFn: 'DNA repair', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'LexA', effect: '-', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'LexA', effect: '-', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'LexA (DinR)', effect: '-', evidence: 'IDA' },
    }},
    { og: 'OG_uvrB',  symbol: 'uvrB',  coreFn: 'DNA repair', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'LexA', effect: '-', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'LexA', effect: '-', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'LexA (DinR)', effect: '-', evidence: 'IPI' },
    }},
    { og: 'OG_umuDC', symbol: 'umuDC', coreFn: 'DNA repair', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'LexA', effect: '-', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'LexA', effect: '-', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'absent',    regulator: '—' },
    }},
    { og: 'OG_sulA',  symbol: 'sulA',  coreFn: 'DNA repair', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'LexA', effect: '-', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'LexA', effect: '-', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'YneA (LexA-target)', effect: '-', evidence: 'IDA' },
    }},

    // ---- Arabinose utilization ----
    { og: 'OG_araC',  symbol: 'araC',  coreFn: 'Carbon catabolism', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'AraC',         effect: '±', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'AraC',         effect: '±', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'AraR',         effect: '-', evidence: 'IDA' },
    }},
    { og: 'OG_araBAD', symbol: 'araBAD', coreFn: 'Carbon catabolism', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'AraC + CRP',   effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'AraC + CRP',   effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'AraR',         effect: '-', evidence: 'IDA' },
    }},
    { og: 'OG_araE',  symbol: 'araE',  coreFn: 'Carbon catabolism', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'AraC',  effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'AraC',  effect: '+', evidence: 'IEP' },
        'bacillus-subtilis':      { state: 'absent',    regulator: '—' },
    }},
    { og: 'OG_araFGH', symbol: 'araFGH', coreFn: 'Carbon catabolism', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'AraC',  effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'AraC',  effect: '+', evidence: 'IEP' },
        'bacillus-subtilis':      { state: 'unknown',   regulator: '?' },
    }},

    // ---- Catabolite repression ----
    { og: 'OG_crp',   symbol: 'crp',   coreFn: 'Catabolite repression', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'CRP',         effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'CRP',         effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'CcpA',        effect: '+', evidence: 'IDA' },
    }},
    { og: 'OG_lacZ',  symbol: 'lacZ',  coreFn: 'Carbon catabolism', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'LacI + CRP', effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'absent',    regulator: '—' },
        'bacillus-subtilis':      { state: 'absent',    regulator: '—' },
    }},

    // ---- Iron homeostasis ----
    { og: 'OG_fur',   symbol: 'fur',   coreFn: 'Iron homeostasis', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'Fur',  effect: '-', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'Fur',  effect: '-', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'conserved', regulator: 'Fur',  effect: '-', evidence: 'IDA' },
    }},
    { og: 'OG_entCEBA', symbol: 'entCEBA', coreFn: 'Iron homeostasis', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'Fur',  effect: '-', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'Fur',  effect: '-', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'absent',    regulator: '—' },
    }},

    // ---- Anaerobic / nitrogen ----
    { og: 'OG_fnr',   symbol: 'fnr',   coreFn: 'Anaerobic respiration', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'FNR',           effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'FNR',           effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'ResD/ResE',     effect: '+', evidence: 'IPI' },
    }},
    { og: 'OG_narGHJI', symbol: 'narGHJI', coreFn: 'Anaerobic respiration', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'FNR + NarL',    effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'FNR + NarL',    effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'ResD/ResE',     effect: '+', evidence: 'IEP' },
    }},
    { og: 'OG_glnA',  symbol: 'glnA',  coreFn: 'Nitrogen', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'NtrC',          effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'NtrC',          effect: '+', evidence: 'IEP' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'TnrA',          effect: '+', evidence: 'IDA' },
    }},

    // ---- Stress / heat-shock ----
    { og: 'OG_rpoH',  symbol: 'rpoH',  coreFn: 'Heat shock', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'σ³² (RpoH)', effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'σ³² (RpoH)', effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'HrcA + CtsR', effect: '-', evidence: 'IDA' },
    }},
    { og: 'OG_rpoS',  symbol: 'rpoS',  coreFn: 'Stationary phase', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'σˢ (RpoS)', effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'σˢ (RpoS)', effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'σᴮ (SigB)', effect: '+', evidence: 'IDA' },
    }},

    // ---- Virulence / pathogen-specific ----
    { og: 'OG_invF',  symbol: 'invF',  coreFn: 'Virulence (SPI-1)', cells: {
        'ecoli-k12':              { state: 'absent',    regulator: '—' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'HilA + InvF',  effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'absent',    regulator: '—' },
    }},
    { og: 'OG_ssrB',  symbol: 'ssrB',  coreFn: 'Virulence (SPI-2)', cells: {
        'ecoli-k12':              { state: 'absent',    regulator: '—' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'OmpR + SsrA',  effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'absent',    regulator: '—' },
    }},

    // ---- Sporulation ----
    { og: 'OG_spo0A', symbol: 'spo0A', coreFn: 'Sporulation', cells: {
        'ecoli-k12':              { state: 'absent',    regulator: '—' },
        'salmonella-typhimurium': { state: 'absent',    regulator: '—' },
        'bacillus-subtilis':      { state: 'conserved', regulator: 'Phosphorelay',  effect: '+', evidence: 'IDA' },
    }},
    { og: 'OG_sigF',  symbol: 'sigF',  coreFn: 'Sporulation', cells: {
        'ecoli-k12':              { state: 'absent',    regulator: '—' },
        'salmonella-typhimurium': { state: 'absent',    regulator: '—' },
        'bacillus-subtilis':      { state: 'conserved', regulator: 'σᶠ',           effect: '+', evidence: 'IDA' },
    }},

    // ---- Two-component / motility ----
    { og: 'OG_phoP',  symbol: 'phoP',  coreFn: 'Two-component', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'PhoB',  effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'divergent', regulator: 'PhoP/Q', effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'PhoP/R', effect: '+', evidence: 'IDA' },
    }},
    { og: 'OG_flhDC', symbol: 'flhDC', coreFn: 'Motility', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'FlhDC',  effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'FlhDC',  effect: '+', evidence: 'IDA' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'σᴰ (SigD)', effect: '+', evidence: 'IDA' },
    }},

    // ---- Carbon overflow / acetate ----
    { og: 'OG_acs',   symbol: 'acs',   coreFn: 'Carbon overflow', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'CRP + IHF',  effect: '+', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'CRP',         effect: '+', evidence: 'IEP' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'CcpA',        effect: '+', evidence: 'IPI' },
    }},
    { og: 'OG_pta',   symbol: 'pta',   coreFn: 'Carbon overflow', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'CRP',  effect: '+', evidence: 'IEP' },
        'salmonella-typhimurium': { state: 'unknown',   regulator: '?' },
        'bacillus-subtilis':      { state: 'divergent', regulator: 'CcpA', effect: '+', evidence: 'IEP' },
    }},

    // ---- Quorum / cell density ----
    { og: 'OG_lsrR',  symbol: 'lsrR',  coreFn: 'Quorum sensing', cells: {
        'ecoli-k12':              { state: 'conserved', regulator: 'LsrR',  effect: '-', evidence: 'IDA' },
        'salmonella-typhimurium': { state: 'conserved', regulator: 'LsrR',  effect: '-', evidence: 'IEP' },
        'bacillus-subtilis':      { state: 'absent',    regulator: '—' },
    }},
  ];

  // ----------------------------------------------------------------------
  //  RRI (Regulatory Rewiring Index, M-4) per regulon. 0 = same regulator
  //  with same target set across organisms; 1 = wholly rewired (different
  //  regulator OR different targets). Breakdown: targetRRI = how much the
  //  target set churns; regulatorRRI = how much the regulator changes.
  //
  //  Mock: hand-assigned numbers consistent with the pan-regulome cells
  //  above; in production these come from the conservation matrix +
  //  ortholog mapping.
  // ----------------------------------------------------------------------
  const rri_table = [
    // organism is the "reference" organism we computed RRI from.
    { regulon: 'LexA',     organism: 'ecoli-k12',              rri: 0.18, targetRRI: 0.12, regulatorRRI: 0.33,
      summary: 'SOS regulon. Targets and direction strongly conserved in γ-proteobacteria; B. subtilis uses a paralogous LexA (DinR) with a non-orthologous Cheo box, contributing the regulatorRRI delta.' },
    { regulon: 'AraC',     organism: 'ecoli-k12',              rri: 0.61, targetRRI: 0.40, regulatorRRI: 1.00,
      summary: 'L-arabinose regulon. Conserved in Salmonella; B. subtilis replaces AraC with the unrelated GntR-family AraR which represses (vs. activates) — a textbook divergent-regulator case.' },
    { regulon: 'CRP',      organism: 'ecoli-k12',              rri: 0.55, targetRRI: 0.44, regulatorRRI: 1.00,
      summary: 'Catabolite repression. CRP-cAMP architecture in γ-proteobacteria; firmicutes use unrelated CcpA-HPr.' },
    { regulon: 'Fur',      organism: 'ecoli-k12',              rri: 0.08, targetRRI: 0.10, regulatorRRI: 0.00,
      summary: 'Iron homeostasis. Fur is conserved in all three with similar target sets — a "core" regulon of the bacterial regulome.' },
    { regulon: 'FNR',      organism: 'ecoli-k12',              rri: 0.48, targetRRI: 0.30, regulatorRRI: 0.80,
      summary: 'Anaerobic respiration. FNR conserved in γ-proteobacteria; B. subtilis uses ResD/ResE two-component instead.' },
    { regulon: 'NtrC',     organism: 'ecoli-k12',              rri: 0.52, targetRRI: 0.35, regulatorRRI: 1.00,
      summary: 'Nitrogen assimilation. NtrC operates in γ-proteobacteria; B. subtilis uses the unrelated TnrA.' },
    { regulon: 'σ³² (RpoH)', organism: 'ecoli-k12',            rri: 0.71, targetRRI: 0.45, regulatorRRI: 1.00,
      summary: 'Heat shock. σ³² conserved between E. coli and Salmonella; B. subtilis uses repression by HrcA/CtsR — opposite logic.' },
    { regulon: 'σˢ (RpoS)',  organism: 'ecoli-k12',            rri: 0.65, targetRRI: 0.42, regulatorRRI: 1.00,
      summary: 'General stress. σˢ in γ-proteobacteria, σᴮ in firmicutes; functional analog but no sequence homology.' },
    { regulon: 'AraR',     organism: 'bacillus-subtilis',      rri: 0.62, targetRRI: 0.40, regulatorRRI: 1.00,
      summary: 'B. subtilis arabinose regulon. Mirror image of AraC — same target genes, different family of regulator and opposite logic.' },
    { regulon: 'PhoP/Q',   organism: 'salmonella-typhimurium', rri: 0.78, targetRRI: 0.65, regulatorRRI: 1.00,
      summary: 'Salmonella virulence + Mg²⁺ sensing. Targets include SPI-1 effectors absent from E. coli; high targetRRI vs the E. coli PhoB regulon.' },
    { regulon: 'HilA',     organism: 'salmonella-typhimurium', rri: 0.95, targetRRI: 0.95, regulatorRRI: 1.00,
      summary: 'SPI-1 master regulator. Salmonella-specific; no ortholog regulon in E. coli or B. subtilis — appears as "wholly novel" by RRI.' },
    { regulon: 'Spo0A',    organism: 'bacillus-subtilis',      rri: 0.96, targetRRI: 0.96, regulatorRRI: 1.00,
      summary: 'Sporulation phosphorelay. Bacillus-specific; no analog regulon in γ-proteobacteria.' },
  ];

  // ----------------------------------------------------------------------
  //  Datasets & Downloads (Q-7 + D-1..D-7) — citable artefacts. Each entry
  //  has a Zenodo-style DOI; clicking the badge opens https://doi.org/<doi>.
  //  In v1 the DOIs are mock; v2 will register real DOIs at release.
  // ----------------------------------------------------------------------
  const datasets = [
    { id: 'D-1', title: 'Gold-standard TF–target set v1',
      desc: 'Manually curated TF–target interactions with strong experimental evidence (IDA / IPI / IMP) across the three organisms. Splits stratified by orthogroup ready for ML.',
      version: 'v1.0', releaseDate: '2026-03-14',
      doi: '10.5281/zenodo.10874321', formats: ['TSV', 'JSON-LD', 'RDF Turtle'],
      size: '4.8 MB · 6 files', license: 'CC-BY 4.0',
      cite: 'RegulonDB MG Consortium (2026). Gold-standard TF–target set v1. Zenodo. https://doi.org/10.5281/zenodo.10874321' },
    { id: 'D-2', title: 'Curated TFBS PWM library',
      desc: 'Fusion of RegulonDB + CollecTF + DBTBS + SwissRegulon. ~600 PWMs in MEME, JASPAR and TRANSFAC-like formats; metadata: source, evidence, organism, factor.',
      version: 'v1.0', releaseDate: '2026-03-14',
      doi: '10.5281/zenodo.10874322', formats: ['MEME', 'JASPAR', 'TRANSFAC', 'JSON-LD'],
      size: '11.2 MB · 612 PWMs', license: 'CC-BY 4.0',
      cite: 'RegulonDB MG Consortium (2026). Curated TFBS PWM library. Zenodo. https://doi.org/10.5281/zenodo.10874322' },
    { id: 'D-3', title: 'Pan-regulome table',
      desc: 'Pivot of orthogroup × organism × regulator × evidence × conservation across the curated regulome. Materia prima for comparative analyses by third parties.',
      version: 'v0.9', releaseDate: '2026-03-14',
      doi: '10.5281/zenodo.10874323', formats: ['TSV', 'Parquet'],
      size: '2.1 MB · 1 file', license: 'CC-BY 4.0',
      cite: 'RegulonDB MG Consortium (2026). Pan-regulome table v0.9. Zenodo. https://doi.org/10.5281/zenodo.10874323' },
    { id: 'D-4', title: 'Reprocessed HT datasets (ChIP / RNA-seq)',
      desc: '394 high-throughput datasets uniformly processed — MACS3 IDR-filtered peaks, BigWig coverage tracks, all aligned against the same reference assembly. Manifest CSV with homogeneous metadata.',
      version: 'v1.1', releaseDate: '2026-02-02',
      doi: '10.5281/zenodo.10874324', formats: ['BED', 'BigWig', 'CSV manifest'],
      size: '38 GB · 1,182 files', license: 'CC-BY 4.0',
      cite: 'RegulonDB MG Consortium (2026). Reprocessed HT datasets v1.1. Zenodo. https://doi.org/10.5281/zenodo.10874324' },
    { id: 'D-5', title: 'Predicted vs curated operons',
      desc: 'Operon-mapper / DOOR2 / OperonHunter predictions aligned with curated operons and ortholog conservation flags. Useful for rapid annotation of new genomes.',
      version: 'v1.0', releaseDate: '2025-12-08',
      doi: '10.5281/zenodo.10874325', formats: ['TSV', 'GFF3'],
      size: '6.9 MB · 4 files', license: 'CC-BY 4.0',
      cite: 'RegulonDB MG Consortium (2025). Predicted vs curated operons. Zenodo. https://doi.org/10.5281/zenodo.10874325' },
    { id: 'D-6', title: 'ML benchmark splits',
      desc: 'Train/val/test splits for TF target prediction stratified by orthogroup (no random splits — prevents leakage across paralogs). Snakemake/Nextflow code included for full reproducibility.',
      version: 'v1.0', releaseDate: '2026-03-14',
      doi: '10.5281/zenodo.10874326', formats: ['TSV', 'JSON', 'Snakemake'],
      size: '1.4 MB · 18 files', license: 'CC-BY 4.0',
      cite: 'RegulonDB MG Consortium (2026). ML benchmark splits v1.0. Zenodo. https://doi.org/10.5281/zenodo.10874326' },
    { id: 'D-7', title: 'iModulons cross-organism mapping',
      desc: 'Mapping of iModulons (data-driven gene modules from ICA) to curated regulons across organisms, using ortholog overlap + activity correlation. Bridges RegulonDB MG with iModulonDB.',
      version: 'v0.6', releaseDate: '2026-01-20',
      doi: '10.5281/zenodo.10874327', formats: ['TSV', 'JSON-LD'],
      size: '3.2 MB · 9 files', license: 'CC-BY 4.0',
      cite: 'RegulonDB MG Consortium (2026). iModulons cross-organism mapping v0.6. Zenodo. https://doi.org/10.5281/zenodo.10874327' },
  ];

  return {
    organisms, releases, araC, lexA, lexA_compare, regulonAraC, search_results,
    pan_regulome, rri_table, datasets,
  };
})();
