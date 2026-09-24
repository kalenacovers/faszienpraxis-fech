---
name: Fech Puls – Faszienpraxis Spaichingen
description: Editorial fascia therapy practice. Precise, authoritative, premium without opulence.
source-of-truth: site.css (tokens, layout primitives, components). This file explains it.
colors:
  deep-navy: "#0a2540"      # --navy
  navy-deep: "#061828"      # --navy-deep (footer base line)
  charcoal-ink: "#0d3060"   # --charcoal
  signal-blue: "#0496ff"    # --accent
  signal-blue-hover: "#1ba3ff"
  sky-trace: "#90caf9"      # --accent-light
  body-ink: "#1a2e45"       # --ink
  steel-mist: "#4a6a8a"     # --muted (darkened from #5a7a99 for AA contrast)
  paper-white: "#f5faff"    # --paper
  cold-tint: "#e3f2fd"      # --tint
  accent-wash: "#eaf5ff"    # --accent-wash (selected form choice)
  star-gold: "#ffd166"      # --star
  open-green: "#22c55e"     # --open
  contra-red: "#d64045"     # --contra
typography:
  display:  { family: "Cormorant Garamond", weight: 300, size: "clamp(42px → 86px)", lineHeight: 1.04 }
  h1:       { family: "Cormorant Garamond", weight: 300, size: "clamp(40px → 72px)", lineHeight: 1.04 }
  h2:       { family: "Cormorant Garamond", weight: 300, size: "clamp(32px → 56px)", lineHeight: 1.12 }
  h2-sm:    { family: "Cormorant Garamond", weight: 300, size: "clamp(28px → 42px)" }
  h3:       { family: "Cormorant Garamond", weight: 300, size: "clamp(22px → 28px)" }
  lead:     { family: "DM Sans", weight: 300, size: "clamp(18px → 20px)", lineHeight: 1.7 }
  body:     { family: "DM Sans", weight: 400, size: "16px", lineHeight: 1.7 }
  eyebrow:  { family: "DM Sans", weight: 500, size: "11px", letterSpacing: "0.18em", transform: uppercase }
rounded:
  controls: "2px"   # buttons, fields, badges
  surfaces: "4px"   # cards, media frames
  pill: "999px"     # status dots only
spacing:
  scale: "4 · 8 · 12 · 16 · 24 · 32 · 40→56 · 48→88"
  section-sm: "clamp(40px → 64px)"
  section: "clamp(72px → 128px)"
  section-lg: "clamp(96px → 168px)"
layout:
  container: "1320px"
  gutter: "clamp(20px → 60px)"
  breakpoints: "480 · 640 · 768 · 1023 · 1279 (max-width)"
---

# Design System: Fech Puls

## 1. Overview

**Creative North Star: "The Practitioner's Dispatch"**

This is the visual language of a craftsperson who doesn't need to sell themselves — only to be found and trusted. Every surface operates like a careful publication: spare, considered, unhurried. The typography carries the authority; the colour is kept on a tight leash. When the accent fires, it fires with purpose.

The palette is built around a deep navy world — not dark as mood, but dark as precision instrument. Sections alternate between a cool paper-white ground, a cold tint and navy; dark bands snap back in to change pace. Signal Blue appears where the eye needs a direction: calls to action, the eyebrow mark, list markers. It is never decorative.

This system explicitly rejects: stock-photo wellness softness, sterile hospital whites, SaaS hero-metric templates, identical card grids, glassmorphism, glow, giant watermark words and anything that could have been generated for any business in any category.

**Key characteristics**
- Serifed display type (Cormorant Garamond 300) anchors every section as an editorial moment
- Hairlines instead of boxes: lists, indexes, steps and contact rows are separated by 1px rules
- Numbers are typography (Cormorant numerals), never icons in circles
- One container edge: every band, the nav and the footer align to the same left and right line at every width
- Shapes are nearly sharp: 2px on controls, 4px on surfaces

## 2. Architecture

| File | Role |
|---|---|
| `site.css` | **Single source of truth.** Tokens, base, layout primitives, typography, components, site chrome (nav, menu, footer, fixed contact), motion and focus. Loaded on every page. |
| `index.css`, `kurs-page.css`, `ueber-mich.css`, `gutschein.css`, `fuer-wen.css`, `zertifikate.css`, `legal.css` | **Composition only.** Page-specific arrangement of system parts. They never redefine tokens, buttons, headings or surfaces. |
| `nav.html`, `footer.html` | Shared fragments, injected by `components.js`. |

Rules of the house:
- A value that appears twice becomes a token in `site.css`.
- Layout primitives use zero-specificity child selectors (`:where()`), so a page rule with one class always wins — no `!important`, no `body > …` chains.
- Components never set a background that a surface class also sets (`.surface-dark` must be able to recolour them).

## 3. Colours: The Dispatch Palette

A monochromatic navy world, punctuated by one precision accent.

- **Signal Blue** `--accent` — primary buttons, the eyebrow "+", list markers, numerals and heading emphasis on light grounds.
- **Sky Trace** `--accent-light` — the same roles on dark grounds.
- **Deep Navy** `--navy` — dark bands, nav, footer, featured cards.
- **Charcoal Ink** `--charcoal` — the tonal step for page-closing CTA bands, so they read apart from the footer.
- **Paper White** `--paper` / **Cold Tint** `--tint` — the light grounds. Never `#ffffff` or grey as a surface.
- **Body Ink** `--ink` / **Steel Mist** `--muted` — text on light.

**Semantic exclusivity.** Star Gold only for stars. Open Green only for the "open now" dot. Contra Red only for contraindications on `/fuer-wen`. WhatsApp green only on the WhatsApp button. Form errors use `--error`, not Contra Red.

### Surfaces
A section declares its ground; components follow automatically.

| Class | Ground | Headings | Emphasis / eyebrow | Rules |
|---|---|---|---|---|
| *(default)* / `.surface-paper` | Paper White | Navy | Signal Blue | `--line` |
| `.surface-tint` | Cold Tint | Navy | Signal Blue | `--line` |
| `.surface-dark` | Navy | Cold Tint | Sky Trace | white 12 % |
| `.surface-charcoal` | Charcoal | Cold Tint | Sky Trace | white 12 % |

Rhythm: never the same ground more than twice in a row. A page that ends in a charcoal CTA band hides the generic footer CTA (`body:has(.cta-band) .footer-cta`).

## 4. Typography

**Display:** Cormorant Garamond 300 (+ italic). **Body:** DM Sans 300/400/500. All sizes are fluid tokens; there are no per-page font sizes.

| Role | Token | Use |
|---|---|---|
| Display | `--fs-display` | Home hero only (`.display`) |
| Page title | `--fs-h1` | Sub-page heroes (`.page-title`) |
| Section title | `--fs-h2` | `.section-title` |
| Section title, compact | `--fs-h2-sm` | Long titles, cards on dark (`.section-title--sm`) |
| Item title | `--fs-h3` / `--fs-h4` | List items, steps, cards (`.item-title`) |
| Numeral | `--fs-num` | `.num` — lining figures |
| Lead | `--fs-lead` | `.lead`, hero sub-lines |
| Body | `--fs-body` 16px | Paragraphs, max `--measure` (66ch) |
| Eyebrow / label | `--fs-eyebrow` 11px | `.eyebrow` (with "+"), `.label` (without) — never smaller |

- Cormorant stays at weight 300; emphasis inside headings is `<em>` (italic, `--em` colour).
- Numerals use `font-variant-numeric: lining-nums` so "01" never reads as "OI".
- `.flow` sets the vertical rhythm of any text column (eyebrow → title → text → lists → actions).

## 5. Layout system

- **Band:** `.section` (+ `--sm` / `--lg`) is full-bleed; its content is inset by `--band-inline = max(gutter, (100% − 1320px) / 2)`. The nav and footer use the same value, so all content shares one edge — no wrappers, no widescreen overrides.
- **Split:** `.split` — two columns inside a band, ratio via `--split-cols`, stacks below 1024px.
- **Media split:** `.media-split` — one side bleeds to the viewport edge, the text stays on the container edge. `--split` is the media share (e.g. `.42`), and the ratio holds at every width. `--reverse` flips it. Stacked, the media takes `--media-ratio-stacked`.
- **Page hero:** `.page-hero` on top of the media split — text on one side, photo or dark `.page-hero-panel` on the other (the panel keeps its content on the container grid via subgrid).
- **Section head:** `.section-head` (stacked) or `.section-head--split` (title left, lead right).
- **Index grid:** `.index-grid` — editorial columns separated by hairlines, `--cols` 3 → 2 → 1.

Breakpoints (max-width): 480 · 640 · 768 · 1023 · 1279. Everything between them is fluid.

## 6. Components

**Buttons** — one family. `.btn-primary` (Signal Blue fill, navy label), `.btn-ghost` (hairline outline that follows the surface, → arrow), `.btn-link` (text action with arrow and underline). Modifiers `.btn-block`, `.btn-sm`. Height 52px, 2px radius, 13px uppercase. Hover: lift 1px and lighten; no glow.

**Rule list** `.rule-list` — the standard list: dash marker, hairline between items.

**Price card** `.price-card` in `.pricing-grid` — paper card with hairline border; `.is-featured.surface-dark` is navy, extends above and below its row and carries `.price-badge`. Used for treatments and course packages alike.

**Stat row** `.stat-row` — numbers set in Cormorant with a label, separated by a hairline, never in boxes.

**Trust strip** `.trust-strip` — a quiet navy info line, one row on desktop, two columns on tablet, one on small phones.

**Media** `.media` + `.media-caption` — image fills its frame, focus point via `--focus`; the caption is a solid navy tag (no blur).

**Contact list** `.contact-list` — label / value / hint rows with an arrow; used on the home CTA and `/fuer-wen`.

**CTA band** `.cta-band` — the page finale: large title left, text/actions or contact list right.

**Pull quote** `.pull-quote` — Cormorant italic with a 2px Signal Blue rule. The only coloured left border in the system.

**Lightbox** `.lightbox` — shared by `/zertifikate` and `/gutschein`.

**Navigation** — solid navy by default; transparent with a top readability veil only while it overlaps the home hero (`.is-over-hero`, set by `components.js`). Collapses to the hamburger below 1024px.

**Fixed contact** — below 768px a bottom bar (call · WhatsApp · book); above, a WhatsApp button stacked over the language switcher on the right, so it never covers the start of a line.

## 7. Elevation & motion

Flat by default. Shadows: `--shadow-lift` (card hover), `--shadow-raised` (featured card), `--shadow-media` (framed images), `--shadow-document` (paper on navy), `--shadow-nav`.

Motion is confined to `opacity`, `transform`, colours and shadows. Hero content fades up once on load (`.animate`); below the fold, section heads and `.reveal-group` children fade in once on scroll. Everything is visible without JavaScript and with reduced motion.

## 8. Do's and Don'ts

### Do
- Start every new section from a surface class, `.section`, and a `.section-head`.
- Use hairlines, numerals and typography to structure content.
- Keep body text at 66ch or less.
- Add a token before adding a second occurrence of any value.

### Don't
- Don't add new hues, gradients as decoration, or `background-clip: text`.
- Don't add glassmorphism, glow, grain overlays or giant watermark words behind sections.
- Don't use icon-in-a-circle cards, Unicode glyphs (✦ ◈ ☎) or emoji as icons.
- Don't build three identical cards with ghost numerals; use `.index-grid`, a stepped list or a manifesto list instead.
- Don't use coloured left/right borders thicker than 2px (only `.pull-quote` has one).
- Don't set font sizes, paddings or container widths per page — use the tokens.
- Don't put a second CTA directly above the footer CTA; use `.cta-band` and let the footer step back.
