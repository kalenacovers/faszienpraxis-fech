---
name: Fech Puls – Faszienpraxis Spaichingen
description: Editorial fascia therapy practice. Precise, authoritative, premium without opulence.
colors:
  deep-navy: "#0a2540"
  charcoal-ink: "#0d3060"
  signal-blue: "#0496ff"
  sky-trace: "#90caf9"
  body-ink: "#1a2e45"
  steel-mist: "#5a7a99"
  paper-white: "#f5faff"
  cold-tint: "#e3f2fd"
  star-gold: "#ffd166"
  open-green: "#22c55e"
  contra-red: "#d64045"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(42px, 5.5vw, 86px)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(32px, 4vw, 56px)"
    fontWeight: 300
    lineHeight: 1.12
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "28px"
    fontWeight: 300
    lineHeight: 1.2
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 300
    lineHeight: 1.8
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.2em"
rounded:
  sharp: "2px"
  soft: "4px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "32px"
  lg: "60px"
  xl: "100px"
components:
  button-primary:
    backgroundColor: "#0496ff"
    textColor: "#ffffff"
    rounded: "2px"
    padding: "18px 38px"
  button-primary-hover:
    backgroundColor: "#1ba3ff"
    textColor: "#ffffff"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    rounded: "2px"
    padding: "18px 24px"
  button-ghost-hover:
    backgroundColor: "rgba(255,255,255,0.08)"
  nav-cta:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    rounded: "2px"
    padding: "9px 22px"
---

# Design System: Fech Puls

## 1. Overview

**Creative North Star: "The Practitioner's Dispatch"**

This is the visual language of a craftsperson who doesn't need to sell themselves — only to be found and trusted. Every surface operates like a careful publication: spare, considered, unhurried. The typography carries the authority; the color is kept on a tight leash. When the accent fires, it fires with purpose.

The palette is built around a deep navy world — not dark as mood, but dark as precision instrument. The hero is drenched in it; sections breathe into a cool paper-white ground; dark-surfaced modules snap back in. The signal-blue accent appears where the eye needs a direction: calls to action, certification marks, live-status indicators. It is never decorative.

This system explicitly rejects: stock-photo wellness softness, sterile hospital whites with zero warmth, SaaS hero-metric templates (big number, small label, gradient accent, identical card grid), and nightclub-dark luxury with gold dust. If it reads as a theme-park version of a therapy practice, it has failed.

**Key Characteristics:**
- Serifed display type (Cormorant Garamond, weight 300) anchors every section as an editorial moment
- Accent blue used with restraint — on CTAs, live indicators, and certification chips only
- Section rhythm alternates between paper-white ground and deep-navy ground for tonal contrast without visual noise
- Motion is minimal: translateY(-2px) hover lifts, underline scale transitions, scroll-driven fade-ins — nothing choreographed
- Shapes are nearly sharp: 2px radius on interactive elements, 4px on containers, full-pill on badges only

## 2. Colors: The Dispatch Palette

A monochromatic navy world, punctuated by one precision accent.

### Primary
- **Signal Blue** (`#0496ff`): The sole accent. Appears on primary CTAs, section eyebrow labels, the accent rule in the quote blockquote, cert-chip checkmarks, and the live-open status dot. Nowhere decorative.
- **Sky Trace** (`#90caf9`): Desaturated blue. Used in hero text emphasis, icon tints on dark surfaces, and subdued trust indicators. Never a standalone accent — always supporting Signal Blue.

### Neutral (Dark)
- **Deep Navy** (`#0a2540`): The primary dark surface. Hero background (via overlay), trust bar, how-section, featured price card. The "floor" of the dark world.
- **Charcoal Ink** (`#0d3060`): Slightly bluer dark. Used as the about-section image placeholder and as a secondary dark surface for layering.
- **Body Ink** (`#1a2e45`): Default text on light surfaces. The readable mid-navy.

### Neutral (Light)
- **Paper White** (`#f5faff`): The primary body background. Slightly blue-tinted — never neutral-gray, never warm-cream. Keeps the navy world coherent even in light sections.
- **Cold Tint** (`#e3f2fd`): The section-level light background for the pricing area. One step cooler and slightly more saturated than Paper White.
- **Steel Mist** (`#5a7a99`): Muted body text, metadata, timestamps, secondary labels. Legible but clearly secondary.

### Accent (Functional Only)
- **Star Gold** (`#ffd166`): Stars only. Never buttons, never borders, never backgrounds.
- **Open Green** (`#22c55e`): Live-hours "open" indicator only. One semantic dot, full stop.
- **Contra Red** (`#d64045`, tint `rgba(214, 64, 69, 0.08)`): Medical contraindication warnings only (fuer-wen.html). Never CTAs, never decorative accents, never error styling outside the contraindication context.

### Named Rules
**The One Voice Rule.** Signal Blue and Sky Trace together are the only chromatic elements in the interface. Every other surface is a navy or a tinted neutral. If a new element needs color, the answer is always a shade of blue or a tonal navy — not a new hue.

**The Semantic Exclusivity Rule.** Star Gold is reserved for star ratings and nothing else. Open Green is reserved for the live-open status dot and nothing else. Contra Red is reserved for medical contraindication warnings and nothing else. Each appears in exactly one context per page.

## 3. Typography

**Display Font:** Cormorant Garamond (weight 300, with italic variant) — Georgia, serif fallback
**Body Font:** DM Sans (weights 300, 400, 500) — system-ui, sans-serif fallback

**Character:** Cormorant at weight 300 brings a quiet editorial authority — the kind of type that belongs on the cover of a specialist journal, not a wellness brochure. DM Sans at weight 300 acts as its precise, unpretentious counterpart. The pairing works because neither tries to emote: Cormorant is formal without being cold; DM Sans is clear without being clinical.

### Hierarchy
- **Display** (weight 300, `clamp(42px, 5.5vw, 86px)`, line-height 1.05): Hero headline only. One per page.
- **Headline** (weight 300, `clamp(32px, 4vw, 56px)`, line-height 1.12): Section titles. May include italic `<em>` spans for the accent-blue emphasis moment.
- **Title** (weight 300, `28px`, line-height 1.2): Card headings, the about-section pull quote font size reference point.
- **Body** (weight 300, `16px`, line-height 1.8): Long-form paragraph content. Max line length 65–75ch. Weight 400 used for `<strong>` emphasis within body copy.
- **Label** (weight 500, `11px`, letter-spacing `0.2em`, uppercase): Eyebrow labels, certification tags, nav links, badge text. The smallest legible unit — never go below `11px`.

### Named Rules
**The Weight Ceiling Rule.** Weight 600 (semibold) is not in this system. The highest weight is 500 (medium) on DM Sans labels and strong spans. Display and headline stay at 300 always. Heaviness here reads as shouting.

**The Italic Signal Rule.** Italic in Cormorant Garamond is the only typographic accent on dark surfaces (see hero `<em>`). On light surfaces, italic appears in pull quotes. It is never used in DM Sans.

## 4. Elevation

This system is nearly flat by default. Depth is communicated through tonal contrast between sections (dark navy vs paper-white), not shadow layering. Shadows appear only as hover state responses.

### Shadow Vocabulary
- **Accent Glow** (`0 6px 20px rgba(4, 150, 255, 0.35)`, scales to `0 10px 28px rgba(4, 150, 255, 0.5)` on hover): Primary button only. The only intentional glow in the system.
- **Card Lift** (`0 14px 38px rgba(10, 37, 64, 0.12)`): Price card hover state. Structural — indicates the card has risen above the surface.
- **Featured Elevation** (`0 18px 50px rgba(10, 37, 64, 0.22)`): Featured price card at rest. The single persistent shadow in the page, establishing one clear hierarchy peak.
- **Nav Glass** (`0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(10, 37, 64, 0.18)`): Scrolled navigation. Anchors the frosted nav bar against the content below.

### Named Rules
**The Flat-By-Default Rule.** At rest, cards have no shadow. Shadows only emerge on hover (lift state) or for the one intentionally elevated featured element. If a card has a shadow at rest and no hover change, it reads as frozen mid-interaction.

## 5. Components

### Buttons
Shape: nearly sharp, gently radiused (2px). Every button uses uppercase DM Sans at 13px, weight 500, letter-spacing 0.1em — consistent across all variants.

- **Primary:** Signal Blue (`#0496ff`) background, white text, 18px 38px padding, 2px radius. Carries a subtle accent glow (`box-shadow: 0 6px 20px rgba(4,150,255,.35)`). On hover: lightens to `#1ba3ff`, rises `translateY(-1px)`, glow intensifies.
- **Ghost:** Transparent background, white text, `1px solid rgba(255,255,255,.35)` border, same padding. Used on dark backgrounds only. Carries an `→` arrow that slides `translateX(4px)` on hover. Border strengthens to `rgba(255,255,255,.7)` on hover.
- **Nav CTA:** Inline ghost variant at a smaller scale — `9px 22px` padding, `12px` type. Inverts to solid white background + dark text on hover. Lives only in the navigation.

### Chips / Tags
- **Cert Tags:** Full-pill radius (`999px`), white background, `1px` border in `rgba(4,150,255,.15)`. Uppercase DM Sans 11px, letter-spacing 0.1em, Steel Mist text. Leading checkmark icon embedded as SVG background-image in Signal Blue. On hover: border strengthens, text darkens to Body Ink.

### Cards / Containers
- **How-Section Cards (dark):** 4px radius, `1px solid rgba(255,255,255,.08)` border, near-transparent background `rgba(255,255,255,.03)`. On hover: background shifts to `rgba(4,150,255,.06)`, border to `rgba(4,150,255,.35)`, `translateY(-2px)`. Ghost Cormorant numeral (weight 300, 56px, 14% opacity) as decorative position marker in top-right corner.
- **Price Cards (light):** No radius (flat-edged). `1px solid` border in border token `rgba(4,150,255,.15)`. White background. On hover: border becomes Signal Blue, card lifts with Card Lift shadow + `translateY(-2px)`.
- **Featured Price Card:** Inverted — Deep Navy background, Cream text. Permanently elevated `translateY(-12px)` above siblings. Badge in Signal Blue at card top-center.
- **Condition Grid:** No individual card borders. Items separated by a 2px-wide gap with the border-token color as background — the grid gap IS the line. Items are flat panels.

### Inputs / Fields
Not defined in the main index (booking is external via Timify). For future form surfaces: follow the same sharp-edge (2px radius), Body Ink stroke, Paper White background pattern as the rest of the light surface system.

### Navigation
Fixed, transparent-over-hero. At rest: gradient readability veil from Deep Navy at 55% opacity, fading to transparent — not a visible bar, just legibility. On scroll (`is-scrolled`): frosted glass (`backdrop-filter: blur(18px) saturate(140%)`) with Deep Navy at 42% opacity, Nav Glass shadow. Links are DM Sans 13px uppercase, letter-spacing 0.12em, weight 400. Hover: white + underline scaleX(0→1) from left. Mobile: full-screen overlay with Paper White at 98% opacity, Cormorant Garamond 22px links.

### Signature Component: Quote Blockquote
Cormorant Garamond italic, weight 300, 24px, line-height 1.45. A `2px solid Signal Blue` left border at 18px padding-left. This is the only place a left-border stripe is permitted — it's structural (the sole typographic affordance for quotation), not decorative.

## 6. Do's and Don'ts

### Do:
- **Do** use Cormorant Garamond at weight 300 for all display and headline text. The lightness is load-bearing.
- **Do** reserve Signal Blue (`#0496ff`) for primary CTAs, eyebrow labels, cert checkmarks, and the quote rule. Nowhere else.
- **Do** alternate section backgrounds between Paper White and Deep Navy for tonal rhythm — never the same background more than two sections in a row.
- **Do** let typography carry hierarchy. Resist adding icons, borders, or backgrounds to make sections feel "more designed."
- **Do** keep body line length at 65–75ch. At wider widths, constrain with `max-width`.
- **Do** use uppercase DM Sans (11–13px, letter-spacing 0.12–0.2em) for all labels, eyebrows, and navigation links.
- **Do** write copy that is direct and specific. Numbers, place names, credentials — these are design elements.

### Don't:
- **Don't** add new hues. The palette is Signal Blue + navy world. A third accent (coral, sage, amber) breaks the single-voice system immediately.
- **Don't** use gradient text (`background-clip: text`). Prohibited across the entire system.
- **Don't** build identical card grids. The conditions grid, how-section, and price cards are all deliberately different structures. New sections should find their own form.
- **Don't** use generic wellness/spa imagery language — stock photo green leaves, lotus flowers, "ganzheitlich" paired with a soft-focus pastel. This practice is medical-grade, not spa-grade.
- **Don't** create cold clinical / hospital whites — every white surface is Paper White (`#f5faff`), blue-tinted and alive. Never `#ffffff` or `#f8f8f8` as a background.
- **Don't** replicate SaaS landing page patterns: hero metric boxes, gradient text, identical feature card grids, hero subtext that lists three bullet benefits.
- **Don't** use `border-left` or `border-right` greater than 2px as a colored accent stripe on cards or list items, except for the designated quote blockquote component.
- **Don't** add Cormorant Garamond at weight 400 or 600. The system only uses 300 (body text in DM Sans weight 400/500 is fine).
- **Don't** animate layout properties. Transitions are confined to `opacity`, `transform`, `color`, `background-color`, `border-color`, `box-shadow`.
