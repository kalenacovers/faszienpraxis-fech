---
name: Fech Puls – Faszienpraxis Spaichingen
description: Tile-based editorial practice site. Rounded paper cards on a cold-blue ground, serif headlines, one signal blue.
source: claude.ai/design — "Fech Puls Redesign A"
source-of-truth: site.css (tokens, components) and site.js (behaviour). This file explains them.
colors:
  ink: "#0a2540"          # --ink — text, dark tiles, footer
  paper: "#f5faff"        # --paper — card surface
  tint: "#e3f2fd"         # --tint — page ground, inner tiles, soft buttons
  wash: "#eaf5ff"         # --wash — notices, selected form choice
  mist: "#d4e8f8"         # --mist — hover of soft surfaces
  photo: "#cfe3f3"        # --photo — image placeholder
  accent: "#0496ff"       # --accent — primary buttons, accent tiles, dots on dark
  accent-hi: "#1ba3ff"    # --accent-hi — accent hover, labels on dark
  accent-ink: "#0377cc"   # --accent-ink — numerals and link hover on light
  muted: "#4a6a8a"        # --muted — secondary text on light
  sky: "#90caf9"          # --sky — secondary text on dark
  contra: "#d64045"       # --contra — contraindications only
  open: "#22c55e"         # --open — location dot only
typography:
  display: { family: "Cormorant Garamond", weight: 400, size: "clamp(44px, 7cqw, 116px)", lineHeight: .96 }
  h-xl:    { family: "Cormorant Garamond", weight: 400, size: "clamp(36px, 5cqw, 84px)", lineHeight: 1 }
  h-lg:    { family: "Cormorant Garamond", weight: 400, size: "clamp(32px, 4cqw, 64px)", lineHeight: 1 }
  em:      { family: "Cormorant Garamond", style: italic, weight: 300 }
  lead:    { family: "Host Grotesk", weight: 400, size: "clamp(18px, 1.6cqw, 22px)", lineHeight: 1.45 }
  body:    { family: "Host Grotesk", weight: 400, size: "16px", lineHeight: 1.6 }
  eyebrow: { family: "Host Grotesk", weight: 600, size: "11px", letterSpacing: "0.14em", transform: uppercase }
rounded:
  section: "clamp(22px, 2.4cqw, 34px)"   # --r
  tile: "24–28px"
  pill: "999px"                          # buttons, chips, tags
layout:
  frame: "1600px inline-size container (.frame)"
  gap: "12px between every tile"
  padding: "clamp(24px, 4cqw, 56px) (--pad) · clamp(24px, 3.6cqw, 48px) (--pad-md)"
---

# Design System: Fech Puls

## 1. Overview

Every page is a stack of rounded tiles on a cold-blue ground (`--tint`), separated by a constant 12px gap. Paper tiles carry content, navy tiles change pace, signal-blue tiles mark the few loud moments (rating, statement, course stats). Headlines are Cormorant Garamond with an italic light emphasis; everything else is Host Grotesk.

## 2. Architecture

| File | Role |
|---|---|
| `site.css` | All styles: self-hosted fonts, tokens, components, page sections, motion helpers. |
| `site.js` | All behaviour: mobile menu, FAQ, hover rows, certificate lightbox, voucher form, motion. |
| `*.html` | Static pages. Header and footer markup is identical on every page. |
| `api/gutschein.js` | Vercel function that mails voucher requests via Resend. |
| `motion/` | Source of the course film: `kurs-video.html` (timeline editor, `render(t)` per frame) and `render.mjs` (Chrome + ffmpeg → `assets/kurs-video*.mp4`, poster). Not deployed. |

- Layout lives inside `.frame`, a 1600px **inline-size container**. `cqw` units and `@container frame (…)` queries resolve against it — breakpoints at 1180 (header rating), 1000 (desktop nav ↔ menu, hover images), 860 (voucher form), 760 (legal sidebar), 700 / 660 (hero ratio, stacked rows).
- Grids are `repeat(auto-fit, minmax(min(100%, var(--min)), 1fr))` (`.grid` + `--min`), so they reflow without media queries.
- No third-party requests: fonts are self-hosted, there is no CDN script, map or widget.

## 3. Components

- **Cards** `.card` (paper) · `.card--dark` · `.card--accent`, padded with `.pad` / `.pad-md`.
- **Tiles** `.tile` (inner tint tiles with numeral, title, text), `.info` (small fact tiles), `.price` / `.price--dark`.
- **Eyebrow** `.eyebrow` — 7px square dot; navy on light, accent on dark, `.eyebrow--red` for contraindications.
- **Buttons** `.btn` (soft) · `--accent` · `--dark` · `--paper` · `--block`; `.btn--icon` + `.btn__icon` for the arrow circle.
- **Hover rows** `.rows` / `.row` with `data-hover-group` — one active row; on the home page the active row shows a tilted photo (desktop only).
- **Contact rows** `.contact` — label · value · arrow, hairline separated.
- **FAQ** `.faq__item` — one open at a time; fully expanded without JavaScript.
- **Lightbox** `<dialog class="lightbox">` — certificate links open in it; without JavaScript they open the image.

## 4. Motion (`site.js`, off for `prefers-reduced-motion`)

- H1 words rise out of a mask on load.
- Sections, grid tiles, list items and headings fade up once when they enter the viewport.
- H2s and large paragraphs brighten word by word while they scroll through.
- The hero photo zooms slightly while scrolling past it.
- Tile grids close their gap and square their inner corners as they scroll in.
- Large circular arrows follow the pointer; buttons press in and spring back.

## 5. Rules

- Ground is always `--tint`; content sits on tiles, never directly on the ground.
- One accent colour. Green and red are reserved for the location dot and contraindications.
- New sections reuse `.card`, `.grid`, `.eyebrow` and the heading sizes — no per-page font sizes.
- Everything must work without JavaScript: native links, `<details>` menu, native form POST.
