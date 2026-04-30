# RegulonDB MG — Multi-organism redesign prototype

A navigable HTML/CSS/JS prototype exploring the evolution of RegulonDB from a mono-organism (*E. coli* K-12) resource into a scalable multi-organism platform.

**Open `regulondb_mg_prototype.html` via a local HTTP server** (`python3 -m http.server` from the repo root works), or just visit the live deploy. No build step, no backend.

> Live version: published to GitHub Pages on every push to `main` — see [Deployment](#deployment) at the bottom of this file.

---

## Structure

```
regulondb_mg_prototype.html   ← entry point
regulondb/
  tokens.css                  ← design tokens (colors, type, spacing, dark mode)
  styles.css                  ← components & layout
  data.js                     ← mock biological data (realistic-but-simulated)
  icons.js                    ← SVG icons + search helper
  views.js                    ← the views (home, gene, tf, regulon, search, compare,
                                 pan-regulome, rri-leaderboard, downloads, summary-history)
  app.js                      ← shell, hash router, drawer, theme, tweaks, working sets
  assistant.js                ← scripted Q&A engine + per-page explainer data
  assistant-ui.js             ← chat panel + FAB + explainer renderer
index.html                    ← redirects to the entry point (Pages serves this first)
README.md                     ← this file
.github/workflows/deploy.yml  ← GitHub Pages deploy on push to main
```

Hash routing keeps URLs shareable (e.g. `#/ecoli-k12/gene/araC`). Opening the file directly via `file://` may fail because some browsers block module loading from local files — use a local HTTP server or the live Pages deploy.

Routing uses `window.location.hash`:
- `#/ecoli-k12/home`
- `#/ecoli-k12/gene/araC`
- `#/ecoli-k12/tf/LexA`
- `#/ecoli-k12/regulon/AraC`
- `#/ecoli-k12/search?q=lexA`
- `#/ecoli-k12/compare/tf/LexA`

---

## Information architecture

```
RegulonDB MG
├── Home (per active organism)
├── Search ────┬── Genes
│              ├── Operons
│              ├── Regulons
│              ├── TFs
│              ├── Promoters
│              └── Datasets HT
├── Object pages
│   ├── Gene          (araC example)
│   ├── TF            (LexA example)
│   ├── Regulon       (AraC / LexA example)
│   ├── Operon        (placeholder)
│   └── Promoter      (placeholder)
├── Compare (cross-organism)
├── Tools / Downloads / Help
```

The organism is the **first URL segment** of every object page. Breadcrumbs always start at the active organism. Switching organism preserves the view type and attempts to keep the object id (falls back to search if missing).

---

## Design system (token → role → example use)

| Token | Value | Role | Where it shows up |
|---|---|---|---|
| `--blue-1` | `#1F3D4E` | Page-title color, header bg, active-organism card bg | Header, H1–H4, active-org card |
| `--blue-2` | `#32617D` | Primary link, primary CTA | All links, `.btn--primary`, active tab border |
| `--blue-3` | `#3D779B` | Hover, focus ring | Link hover, focus outline |
| `--blue-4` | `#72A7C7` | Soft highlights | Small strain line on header org pill |
| `--blue-5` | `#D5E2EA` | Section bg, soft surface | Quick-card icon bg, facet chips |
| `--grey-1` | `#373737` | Body text | All paragraphs, table cells |
| `--grey-2` | `#666666` | Secondary text | Table column headers, muted copy |
| `--grey-3` | `#999999` | Tertiary / placeholders | Genome-strip coordinates |
| `--grey-4` | `#D5D5D7` | Borders | Table borders, card borders |
| `--grey-5` | `#F4F5F5` | Subtle surface | Sunken cards, table toolbar |
| `--accent` | `#C98528` | Secondary CTA, accent cards | "Compare across organisms" button, araC arrow (divergent gene) |
| `--accent-light` | `#D2A769` | Border of accent buttons | `.btn--accent` border |
| `--postit` | `#FFF8A6` | Curator notes, search highlights | Note cards, `<mark>` in results |
| `--error` | `#C93A1D` | Repression, weak evidence, low confidence | `.reg-arrow--repress`, weak-evidence badge |

Evidence badges use distinct semantic colors:
- **Curated** (`--evidence-curated-bg`) — `--blue-2` family
- **Predicted** (`--evidence-predicted-bg`) — `--accent` family
- **High-throughput** — neutral purple
- **Weak** — error red

### Typography
| Role | Family | Weight | Size (rem) | Notes |
|---|---|---|---|---|
| H1 | Arial | 700 | 1.5 | Object names, page titles |
| H2 | Arial | 700 | 1.375 | Section headers |
| H3 | Arial | 700 | 1.25 | Card titles |
| H4 | Arial | 700 | 1.125 | Subsection, quick-card title |
| Body (relevant) | Arial | 400 | 1 | Long-form copy, taglines |
| Body (normal) | Arial | 400 | 0.875 | Tables, UI chrome |
| Citations | Times New Roman | 400 italic | 0.875 | Reference list |
| Code / coordinates | ui-monospace | 400 | 0.8125 | Positions, IDs, sequences |

Gene names are always `font-style: italic` via `.gene`; taxa use `.taxon`; proteins stay upright (explicit class optional).

### Spacing — 4/8 base (`--sp-1` = 0.25rem through `--sp-10` = 4rem).

---

## Scientific conventions applied

- Gene names italicized everywhere (`<em class="gene">araC</em>`).
- Species names italicized (`<em class="taxon">E. coli</em>`); strain in roman.
- Sigma factors rendered as `σ⁷⁰` with Unicode superscripts.
- Promoter sites labeled `−10`, `−35` with Unicode minus; positions in monospace.
- Operon notation preserved (`lacZYA`, `araBAD`).
- Evidence codes: **IDA** (Inferred from Direct Assay), **IEP** (Expression Pattern), **IPI** (Physical Interaction), **IC** (Curator), **IEA** (Electronic). Tooltips on every badge.

---

## Views included

1. **Home** — hero search, active-organism card with stats, 6-card quick grid, release notes, multi-organism feature callout.
2. **Gene — araC** — two layouts via Tweaks: **tabs** (compact) or **long-scroll with sticky TOC** (scannable). Includes genomic-context SVG showing the divergent promoter architecture *P<sub>C</sub>* / *P<sub>BAD</sub>* with araO1/O2/I1/I2 sites and the CRP binding site.
3. **TF — LexA** — domain diagram SVG (HTH + S24 peptidase), effectors table, 14 curated targets with filter/export controls.
4. **Regulon** — central TF node + radial target layout, SVG with activation/repression edge markers. Interactive members table.
5. **Search** — three-column faceted search: object type, evidence, organism, source. Active-filter chips. Cross-organism toggle. Result cards with highlighted query matches.
6. **Compare — LexA across organisms** — three-column per-organism summary card (symbol, length, % identity, operator motif, target count, conservation bar), plus a target-presence matrix showing SOS-regulon conservation across *E. coli*, *Salmonella*, *B. subtilis*.

---

## Multi-organism architecture

- **Persistent organism pill** in the header opens a drawer with all organisms, stats, and an active-badge. (Tweakable: drawer or dropdown style.)
- URL-first organism scoping: every object page is reached through `/<organism>/<type>/<id>`, so links are shareable and context-free.
- **Three seeded organisms**: *E. coli* K-12 MG1655, *Salmonella enterica* sv. Typhimurium LT2, *B. subtilis* 168. Each with distinct counts, color identity, and version.
- **Cross-organism search toggle** on the home hero.
- Every gene page shows an **orthologs panel** — species, symbol, % identity, and a conservation note (not just sequence). The LexA comparison view shows the divergent operator-sequence story (SOS box vs Cheo box) and target-set conservation as a matrix.

---

## Tweaks (toolbar toggle)

The **Tweaks** toggle (top right of the toolbar) reveals an in-page panel. Current tweaks:

- **Gene page layout:** tabs vs. long-scroll (sticky TOC).
- **Organism selector style:** drawer vs. dropdown.
- **Accent-color usage:** restrained / moderate / generous.
- **Theme:** auto / light / dark.

Values persist to `localStorage` and also write back to disk via the `__edit_mode_set_keys` host protocol.

---

## Accessibility

- Skip-to-content link.
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`).
- Focus-visible rings on every interactive element (WCAG AA contrast).
- Keyboard shortcut **⌘/Ctrl + K** focuses the header search.
- All icons decorative unless labeled; `aria-label` on icon-only buttons.
- Tables use `<thead>`/`<tbody>` with sticky headers and horizontal-scroll degradation on narrow viewports.
- Color never the sole signal for evidence strength — text code + badge label.

## Dark mode

- `prefers-color-scheme: dark` respected by default (auto).
- Header toolbar provides explicit light/dark toggle; persisted to `localStorage`.
- Semantic tokens remapped (surfaces, borders, text) while brand hue identity is preserved.

---

## Known limits of the prototype

- Data is **simulated** beyond the well-documented examples (araC, LexA, SOS regulon).
- Autocomplete uses a simple substring match rather than a real tokenizer / fuzzy matcher.
- Network visualization is a static radial layout, not force-directed.
- No real backend: filters render counts but the chip UI is illustrative only.
- The "Operon" and "Promoter" dedicated pages are not wired — the primary nav routes them into search.

---

## Aesthetic decisions worth naming

- **Serif only for citations.** The brief's Times New Roman rule is narrowly applied to reference lists so the scientific-paper signal stays meaningful — everywhere else, Arial.
- **Object-type tags over icons** for text lists. A colored 8×8 square + uppercase caption reads faster than an icon at 14px and avoids AI-looking iconography.
- **The genome context is hand-drawn SVG**, not a generic DNA spiral — it shows the *specific* divergent architecture of the *araC*/*araBAD* locus with its operators, which is the single most teachable thing about this gene.
- **Accent (`--accent`) is rare and intentional**: divergent/reverse gene arrows, the "Compare across organisms" CTA, predicted-evidence badges. It never substitutes for blue.

---
