# Website Master Audit — Faszienpraxis Fech / Fech Puls

**Auditdatum:** 2026-07-15
**Umfang:** 9 HTML-Seiten (index, kurs-page, ueber-mich, fuer-wen, zertifikate, gutschein, impressum, datenschutz, certificate-preview), 3 CSS-Dateien (accessibility.css, kurs-page.css, widescreen.css), 3 JS-Dateien (components.js, lang.js, api/gutschein.js), Fragmente (nav.html, footer.html), 21 Bild-Assets, vercel.json.
**Methodik:** Statische Vollanalyse aller Zeilen, Laufzeittests im Chromium-Browser über 9 Breakpoints (320–1920 px), Formular- und Interaktionstests, WCAG-Kontrastberechnung, Bildvermessung (Dateigröße vs. Anzeigegröße), Cross-File-Konsistenzprüfung.
**Stack:** Statische Website auf Vercel (`cleanUrls: true`), client-seitige Nav/Footer-Injektion via `fetch`, client-seitige i18n (6 Sprachen), eine Serverless-Function (Gutschein-Versand via Resend).

---

## Gesamtbewertung vorab

Die Website hat ein **echtes, durchdachtes Design-System** und wirkt visuell premium — Typografie, Farbwelt (`:root`-Tokens sind über alle Seiten driftfrei identisch) und Sektionsrhythmus sind auf gutem Niveau umgesetzt. Darunter liegen jedoch **produktionskritische Blocker**: ein Klartext-Admin-Passwort samt Kunden-PII im Repository/Deploy, ~30 MB unkomprimierte Bilder auf der Startseite, ein erfundenes Testimonial live, rechtlich fehlerhafte Pflichtseiten (falscher Hoster genannt, veraltete Gesetze, Google Fonts vom CDN), ein toter Haupt-CTA und systematische WCAG-Kontrastverstöße.

**Finale Qualität: 58 / 100** (Detailaufschlüsselung am Ende). Gut gestaltet, aber **noch nicht produktionsreif**.

---

# 1. CRITICAL — sofort beheben

## C1 · Security/Datenschutz · Repository & Deploy
**Admin-Passwort und Kundendaten im Klartext im Git-Repo.**

- **Beschreibung:** `.gstack/browse-audit.jsonl` enthält in Zeile 63 ein Klartext-Passwort (`input[type=password] 1234567890`) zusammen mit der Login-E-Mail (`denis.jungkind99@gmail.com`) für `onlinekurs.faszienpraxis-fech.de/login`. `.gstack-audit/design-audit-20260524/screenshots/` enthält Screenshots der **LMS-Admin-Kundenliste mit echten Namen und E-Mail-Adressen**. Insgesamt **29 Dateien** unter `.gstack/`, `.gstack-audit/` und `.claude/` sind git-getrackt. `.vercelignore` schließt nur `*.php` aus — diese Verzeichnisse werden also potenziell mitdeployt.
- **Ursache:** Audit-Artefakte eines Browser-Agenten und lokale Tool-Konfiguration wurden mitcommittet; fehlende `.gitignore`/`.vercelignore`-Hygiene.
- **Auswirkung:** Kritischer Datenschutzvorfall. Admin-Zugang zum Kurssystem und Kunden-PII liegen im Versionsverlauf und im Deploy-Bundle. Selbst wenn Vercel Dotfiles nicht ausliefert (nicht garantiert), ist die Kompromittierung durch die Git-History bereits erfolgt.
- **Lösung (in dieser Reihenfolge):**
  1. Passwort `1234567890` **sofort rotieren** (und generell ein starkes Passwort setzen).
  2. Verzeichnisse aus dem Tracking nehmen und ignorieren:
     ```bash
     git rm -r --cached .gstack .gstack-audit .claude
     printf '.gstack/\n.gstack-audit/\n.claude/\n' >> .gitignore
     printf '.gstack/\n.gstack-audit/\n.claude/\nassets/*.psd\n' >> .vercelignore
     ```
  3. Git-History bereinigen (`git filter-repo --path .gstack --path .gstack-audit --path .claude --invert-paths` oder BFG), danach Force-Push und alle Klone neu ziehen.

## C2 · Performance · index.html:3806, assets/glas-schroepfen.png
**19,5 MB PNG auf der Startseite.**

- **Beschreibung:** `assets/glas-schroepfen.png` ist **19.495.489 Bytes (4800×3584 px)**, eingebunden als Foto in der Schröpfen-Sektion, angezeigt auf ~640 px Breite. Ein Foto als PNG gespeichert.
- **Auswirkung:** Alleine dieses Bild überträgt beim Scrollen 19 MB; auf Mobilfunk sind das Minuten Ladezeit und massiver Datenverbrauch, plus Decode-Jank. Als WebP/AVIF ~1600 px wären es ~150–250 KB — eine **~99 % Reduktion**.
- **Lösung:** Als WebP/AVIF re-exportieren, auf Anzeigebreite skalieren, `srcset`/`sizes`, `width`/`height`, `loading="lazy"` beibehalten.

## C3 · Performance · Bildgewicht gesamt
**~30 MB unoptimierte Bilder; Assets-Ordner 57 MB.**

| Datei | Größe | Dimension | Anzeige | Faktor |
|---|--:|---|---|--:|
| glas-schroepfen.png | 19,5 MB | 4800×3584 | ~640 px | siehe C2 |
| wadim-fech-portrait.jpg | 6,6 MB | 3072×5504 | ≤720 px | ~4,8× zu groß |
| bewegungstherapeut.jpg | 4,7 MB | 3000×3838 | ~556 px | Zertifikatsgalerie |
| faszientherapeut.jpg | 4,5 MB | 3000×3838 | ~556 px | " |
| ...schmerztherapie.jpg | 4,5 MB | 3000×3838 | ~556 px | " |
| sport-therapeut.jpg | 4,5 MB | 3000×3838 | ~556 px | " |
| ...chiropraktik.jpg | 4,3 MB | 3000×3838 | ~556 px | " |
| kurs-online-ausbildung.jpg | 3,9 MB | 3712×4608 | ~495 px | ~7× zu groß |
| iaoth-logo.png | 682 KB | 6336×2688 | ~120 px Höhe | Logo als Riesen-PNG |

- **Auswirkung:** `zertifikate.html` lädt beim Durchscrollen allein ~29 MB (7 Scans). LCP auf `ueber-mich.html` (6,6-MB-Portrait, `loading="eager"`) im Sekundenbereich. Dominierender Performance-Faktor der gesamten Website — wichtiger als jede andere Optimierung.
- **Lösung:** Build-Pipeline oder einmaliger Batch: alle Content-Bilder → AVIF/WebP, auf max. das 2-Fache der Anzeigebreite skalieren (Ziel ≤200 KB). Logos (IAOTH/IPHM/CPD/ITA) auf ~2× Anzeigehöhe. Zielgröße Assets-Ordner: unter 3 MB.

## C4 · Recht/Content · index.html:3929–3935
**Erfundenes Testimonial live, inklusive TODO-Kommentar im Quelltext.**

- **Beschreibung:** Über dem ausgespielten Zitat „K. Müller · Absolventin, Heilpraktikerin" steht im HTML: `<!-- TODO: Platzhalter-Zitat ersetzen durch echtes Schüler-Zitat. -->`.
- **Auswirkung:** Ein erfundenes Testimonial auf einer Gesundheitsdienstleister-Seite ist irreführende Werbung (§ 5 UWG, abmahnfähig); der TODO-Kommentar ist öffentlich im Quelltext lesbar und belegt die Fiktion.
- **Lösung:** Echtes, freigegebenes Zitat einsetzen oder den Block bis dahin entfernen.

## C5 · Recht/DSGVO · datenschutz.html:664 & fehlende Dienste
**Datenschutzerklärung nennt falschen Hoster und verschweigt tatsächlich genutzte Dienste.**

- **Beschreibung:** Die Erklärung sagt „Wir hosten … bei **Hostinger**" — die Seite läuft aber auf **Vercel** (USA, Drittlandtransfer). Google Maps wird ausführlich erklärt, **eingebettet ist aber OpenStreetMap** (`openstreetmap.org/export/embed.html` im Footer, lädt auf jeder Seite ohne Consent). Nicht erwähnt: **Resend** (US-Auftragsverarbeiter, verarbeitet Name/E-Mail/Anschrift/Telefon aus dem Gutschein-Formular), das web.de-Empfängerpostfach, WhatsApp (Meta), sowie `localStorage['fp-lang']`.
- **Auswirkung:** Verstoß gegen Art. 13/14 DSGVO; nicht deklarierte US-Transfers; das Gutschein-Formular erhebt PII ganz ohne Datenschutzhinweis. Reales Abmahn-/Bußgeldrisiko.
- **Lösung:** Datenschutzerklärung auf den realen Stack neu aufsetzen (Vercel, Resend mit SCC/DPF, OpenStreetMap/OSMF, WhatsApp, localStorage). Hinweis + Link direkt am Gutschein-Formular.

## C6 · Recht/DSGVO · alle 9 Seiten, `<head>`
**Google Fonts vom CDN geladen.**

- **Beschreibung:** Jede Seite lädt `fonts.googleapis.com` / `fonts.gstatic.com` (im Laufzeittest bestätigt als externer Request). Die Datenschutzerklärung (Z. 762–771) beschreibt das sogar und beruft sich auf Art. 6 Abs. 1 lit. f — genau die vom LG München I (3 O 17493/20) als rechtswidrig eingestufte Konstellation.
- **Auswirkung:** IP-Übertragung an Google ohne Einwilligung bei jedem Seitenaufruf; für eine deutsche Praxis der klassische Abmahn-Fall. Zusätzlich render-blockierendes CSS von Fremd-Domain.
- **Lösung:** Beide Fontfamilien lokal hosten (`woff2`, `font-display: swap`, `preload` fürs kritische Subset), Google-`<link>`/`preconnect` entfernen. Reduziert nebenbei die Latenz und macht eine strikte CSP möglich.

## C7 · UX/Conversion · zertifikate.html:1039
**Einziger Haupt-CTA der Seite ist ein 404.**

- **Beschreibung:** `<a class="zert-cta-btn" href="https://faszienpraxis-fech.de/termin">` — es gibt weder `termin.html` noch eine `/termin`-Rewrite in `vercel.json`.
- **Auswirkung:** Der einzige inhaltliche Conversion-Pfad der Zertifikate-Seite führt auf eine Fehlerseite.
- **Lösung:** Timify-URL einsetzen (`https://book.timify.com/?accountId=652fe85cbd51d3ad47200466&hideCloseButton=true`) oder eine `/termin`-Rewrite in `vercel.json` anlegen und überall als Kurzlink nutzen (behebt zugleich die 10-fache Hardcodierung, siehe R4).

## C8 · Content/Trust · zertifikate.html:946–953
**Als Top-Credential wird ein Blanko-Musterzertifikat mit „John Doe" gezeigt.**

- **Beschreibung:** Das Featured-Zertifikat („N° 01", „steht für höchste fachliche Qualifikation") ist `assets/Abschlusszertifikat.png` — ein **Muster-Template des eigenen Online-Kurses** mit Empfänger „John Doe", Datum „dd/mm/yyyy" und „GESCHÜTZT"-Wasserzeichen (korrekt eingesetzt in `kurs-page.html` und `certificate-preview.html` als Kurs-Vorschau). Die 7 Galerie-Scans darunter sind dagegen echte, auf Wadim Fech ausgestellte Fremdzertifikate.
- **Auswirkung:** Auf der Qualifikationsnachweis-Seite steht ein selbst ausgestelltes Platzhalter-Dokument als wichtigstes Credential — glaubwürdigkeitsschädigend, faktisch irreführend.
- **Lösung:** Featured-Slot mit einem echten eigenen Zertifikat füllen oder entfernen; das Kurs-Template nur auf der Kursseite zeigen.

## C9 · Bug/UX · index.html:2546
**Maps-Link im Footer ist auf der Startseite per Maus/Touch tot.**

- **Beschreibung:** `.footer-praxis-map-overlay { pointer-events: none; }` im Inline-`<style>` von index.html. In `footer.html` ist dieses Element aber ein `<a href="maps.google.com…">` („In Maps öffnen"). Im Browser bestätigt: `pointer-events: none` auf index.html, `auto` auf allen Unterseiten. Ursache: Der Footer-CSS-Block wurde ins Inline-CSS dupliziert, als das Overlay noch ein `<div>` war; `accessibility.css` (korrekt) lädt davor und verliert in der Kaskade.
- **Auswirkung:** Der Karten-Link im Footer funktioniert ausgerechnet auf der wichtigsten Seite nur per Tastatur, nicht per Klick/Touch. Symptom eines größeren Problems (400 Zeilen dupliziertes Footer-CSS, siehe R2).
- **Lösung:** Zeile `pointer-events: none;` entfernen — besser das gesamte Footer-CSS-Duplikat aus index.html löschen (`accessibility.css` ist die kanonische Quelle).

---

# 2. HIGH — vor Go-Live beheben

## H1 · A11y · Systemische Kontrastverstöße (alle Seiten)
Rechnerisch verifizierte WCAG-AA-Verstöße (Normaltext braucht 4,5:1):

| Paar | Ratio | Verwendung | Status |
|---|--:|---|---|
| `#5a7a99` auf `#f5faff` | **4,28:1** | Fließtext, FAQ-Antworten, Preis-Features (14–16 px) | ✗ AA |
| `#5a7a99` auf `#e3f2fd` | **3,93:1** | Sekundärtext in Preis-/FAQ-Sektionen | ✗ AA |
| Weiß auf `#0496ff` | **3,08:1** | **alle primären CTAs** („Termin buchen", 13 px) | ✗ AA |
| `#0496ff` auf `#f5faff` | **2,94:1** | `.section-eyebrow`-Labels (11 px) | ✗ AA |
| `#0496ff` auf `#e3f2fd` | **2,70:1** | Eyebrows in Preis-/FAQ-Sektion | ✗ AA |

- **Ursache:** Zu helle Sekundärfarbe (`--text-muted`) und der zu helle Signal-Blau-Ton für weißen/blauen Kleintext.
- **Auswirkung:** Kerntexte und der wichtigste Button der Seite sind für Sehschwächere schwer lesbar.
- **Lösung:** (a) `--text-muted` von `#5a7a99` auf ≥ `#4a6a8a` abdunkeln (≈4,9:1) oder Fließtext auf `--text-body #1a2e45` (13,15:1) setzen; `#5a7a99` nur für ≥18,66 px/500. (b) Akzent-Buttons: `color: var(--dark)` auf Blau (5,04:1) — dieses Muster existiert bereits korrekt in `.btn-cta-primary` und sollte vereinheitlicht werden. (c) Eyebrows auf hellen Flächen in `#0a2540` mit Akzent-Punkt statt blauem Text.

## H2 · Design-System · accessibility.css:1020–1075
**„Global Eyebrow Upgrade" bricht drei Systemregeln auf jeder Seite per `!important`.**

- **Beschreibung:** Ein 16-Klassen-Selektorblock verwandelt alle Eyebrows in Pill-Chips mit `font-weight: 600 !important` (System verbietet ≥600 — „Weight Ceiling Rule"), `border-radius: 100px !important` (weder 999px-Token noch Badge-Kontext) und `letter-spacing: .14em` (Label-Spec ist .2em). Er überschreibt die 30 Zeilen darüber definierte kanonische `.section-eyebrow` und macht ~14 seitenlokale Eyebrow-Definitionen zu totem Code. DM Sans 600 ist gar nicht geladen → Faux-Bold.
- **Auswirkung:** Dreifacher Design-System-Verstoß auf jeder Sektion jeder Seite; ~30 `!important`; synthetisch gerendertes Bold.
- **Lösung:** Entweder das Chip-Design in DESIGN.md legalisieren (mit `font-weight: 500`, `999px`, `.2em`) oder den Block entfernen. Overrides in die Komponentendefinition mergen, `!important` streichen.

## H3 · Bug/CSS · index.html:1870, 1961
**Undefinierte CSS-Variable `--text-light`.**

- **Beschreibung:** `.grev-rating-score { color: var(--text-light) }` und `.grev-footer-link:hover { color: var(--text-light) }` — `--text-light` ist in keinem `:root` definiert (nur `--accent-light`/`--text-muted` existieren; verifiziert).
- **Auswirkung:** Die Google-Bewertungszahl „4,7" und der Link-Hover fallen auf Vererbung zurück statt der intendierten Farbe; der Hover hat gar kein Feedback.
- **Lösung:** Auf das korrekte Token mappen (`var(--dark)` bzw. `var(--accent)`).

## H4 · A11y/Tastatur · gutschein.html:451, 502
**Radio-Buttons per `display:none` — komplett unbedienbar für Tastatur/Screenreader.**

- **Beschreibung:** `.duration-option { display: none }` und `.delivery-option { display: none }` entfernen die `<input type="radio">` aus dem Fokusbaum.
- **Auswirkung:** Tastatur- und Screenreader-Nutzer können weder Behandlungsdauer noch Versandart wählen — beides Pflichtfelder des Bestellformulars.
- **Lösung:** Visuell verstecken, aber fokussierbar lassen, und Fokus am Label sichtbar machen:
  ```css
  .duration-option, .delivery-option { position:absolute; opacity:0; width:1px; height:1px; }
  .duration-option:focus-visible + .duration-label,
  .delivery-option:focus-visible + .delivery-label { outline:2px solid var(--accent); outline-offset:2px; }
  ```
  Zusätzlich in `<fieldset><legend>` fassen (siehe H12).

## H5 · Security · api/gutschein.js:17
**CORS-Wildcard + kein Rate-Limiting auf E-Mail-Endpoint.**

- **Beschreibung:** `Access-Control-Allow-Origin: *` auf einem unauthentifizierten, mailversendenden Endpoint. Einzige Abwehr ist ein Honeypot-Feld. Kommentar räumt ein: „allows easier local testing".
- **Auswirkung:** Jede fremde Website kann `POST /api/gutschein` browserseitig auslösen → Mail-Bombing des Praxispostfachs, Erschöpfung des Resend-Kontingents (Kosten-DoS).
- **Lösung:** Origin auf `https://faszienpraxis-fech.de` beschränken; serverseitiges Rate-Limit pro IP (Vercel KV/Upstash); optional Cloudflare Turnstile. Zusätzlich Feldlängen begrenzen (`String(v).slice(0, N)`, `anzahl` als Integer 1–20) gegen Payload-DoS, und Fehlermeldungen nicht im Rohtext an den Client leaken.

## H6 · Bug/i18n · components.js:120 + lang.js:175 (index.html:3562)
**Zwei Timer schreiben konkurrierend in den Öffnungsstatus.**

- **Beschreibung:** `#hours-status` wird von zwei `updateHoursStatus()` bedient: `components.js` schreibt hartkodiert **deutschen** Text alle 60 s, `lang.js` schreibt **lokalisierten** Text alle 61 s. `lang.js` exponiert extra `window.fpLang.updateHours` mit dem Kommentar „so components.js can delegate to us" — `components.js` delegiert aber nie.
- **Auswirkung:** Bei nicht-deutscher Sprache pendelt der Öffnungsstatus im Minutentakt zwischen Deutsch und Zielsprache; zwei Timer laufen parallel. Die Öffnungszeiten-Logik existiert 4-fach (JSON-LD, HTML, components.js, lang.js) — Drift vorprogrammiert.
- **Lösung:** In `components.js`: `if (window.fpLang) { window.fpLang.updateHours(); } else { …Fallback… }`, eigenes Intervall entfernen. Schedule-Daten in ein Modul zentralisieren.

## H7 · Bug/Logik · components.js:106–118
**Öffnungsstatus nutzt Besucher-Zeitzone statt Praxiszeit.**

- **Beschreibung:** `new Date()` läuft in der lokalen Zeitzone des Besuchers. Feiertage fehlen komplett.
- **Auswirkung:** Ein Besucher außerhalb der deutschen Zeitzone sieht „Jetzt geöffnet"/„Geschlossen" zur falschen Zeit; an Feiertagen zeigt die Praxis fälschlich „geöffnet". Zusätzlich (components.js:128): `next.date.getDate() - now.getDate() === 1` erkennt „morgen" über Monatsgrenzen nicht (31.→1. ergibt −30).
- **Lösung:** Zeit über `Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', … })` in Praxiszeit rechnen; Feiertagsliste (Baden-Württemberg) ergänzen oder den Status-Anspruch abschwächen; „morgen"-Erkennung über den Schleifenindex (wie `lang.js` es korrekt macht).

## H8 · A11y/SEO · index.html:3603, 3748
**Zwei zentrale Sektionstitel sind `<div>` statt `<h2>` — Heading-Outline bricht.**

- **Beschreibung:** „Womit ich helfen kann" (Behandlungsbereiche) und „Behandlungsoptionen" (Preise) sind `<div class="section-title">`. Dadurch folgt auf `<h1>` direkt `<h4>` (die cond-Karten) ohne dazwischenliegendes h2/h3.
- **Auswirkung:** Screenreader-Heading-Navigation und SEO-Struktur der beiden wichtigsten Conversion-Sektionen sind defekt.
- **Lösung:** In `<h2 id="…-heading">` umwandeln, `aria-labelledby` an den `<section>` setzen, cond-`<h4>` → `<h3>`.

## H9 · A11y · alle Seiten
**Fehlendes `<main>`-Landmark; Skip-Links springen am Hauptinhalt vorbei.**

- **Beschreibung:** Die meisten Seiten haben kein `<main>` (Sektionen hängen direkt im `<body>`); nur zertifikate/impressum/datenschutz haben eins. Skip-Link auf index.html zielt auf `#leistungen` (Sektion in der Seitenmitte), auf ueber-mich.html auf `#geschichte` (5. Sektion) — beide überspringen H1/Hero.
- **Auswirkung:** „Zum Hauptinhalt springen" verschluckt den wichtigsten Inhalt; Landmark-Navigation unvollständig.
- **Lösung:** Inhalt jeder Seite in `<main id="main" tabindex="-1">` fassen (ab Hero), Skip-Link darauf zeigen.

## H10 · i18n · alle Unterseiten + index.html-Teile
**Mehrsprachigkeit bricht auf 6 von 8 Seiten ab.**

- **Beschreibung:** `lang.js` wird nur auf index.html und kurs-page.html geladen. ueber-mich, fuer-wen, zertifikate, gutschein, impressum, datenschutz haben **0 `data-i18n`-Attribute und keinen Sprachumschalter**. Selbst auf index.html fehlen ganze Sektionen (Schröpfen, Kurs-Banner, **alle 6 FAQ**, Footer) das Attribut. `lang.js` setzt aber global `document.documentElement.lang = 'en'` — obwohl > 90 % des DOM deutsch bleiben.
- **Auswirkung:** Wer auf der Startseite EN/RU/IT/ES/FR wählt und weiterklickt, landet auf einer komplett deutschen Seite ohne Umschalter; `<html lang>` lügt über die Inhaltssprache (Screenreader liest deutschen Text mit falscher Aussprache-Engine, WCAG 3.1.1). Zusätzlich: rein client-seitige Übersetzung ohne `hreflang`/eigene URLs ist für Suchmaschinen unsichtbar — der SEO-Wert der 5 Fremdsprachen ist null.
- **Lösung:** Entweder `lang.js` überall einbinden + Inhalte durchgängig mit `data-i18n` versehen (und `lang` nur pro tatsächlich übersetztem Element setzen), **oder** das Feature ehrlich auf die Startseite begrenzen und den Anspruch zurücknehmen. Für echtes SEO: statische Sprachversionen mit `hreflang`.

## H11 · Recht · impressum.html
**Veraltete Rechtsgrundlagen und abgeschalteter Pflichthinweis.**

- **Beschreibung:** Durchgängig „§ 5 TMG" / „§§ 7–10 TMG" — das **TMG ist seit 14.05.2024 außer Kraft**, es gilt das DDG (§ 5 DDG). Der Abschnitt „EU-Streitschlichtung" verweist auf die **OS-Plattform, die zum 20.07.2025 abgeschaltet wurde**. „Steuer-ID" (§ 27a UStG) ist falsch bezeichnet — § 27a regelt die **USt-IdNr.**; die persönliche Steuer-Identifikationsnummer darf nicht veröffentlicht werden.
- **Auswirkung:** Irreführende/veraltete Pflichtangaben; wirkt ungepflegt; wettbewerbsrechtliches Restrisiko. (Positiv: Name, Anschrift, Telefon, E-Mail, USt-IdNr sind inhaltlich vorhanden.)
- **Lösung:** TMG→DDG, ODR-Absatz ersatzlos streichen (VSBG-Satz behalten), „Steuer-ID" → „Umsatzsteuer-Identifikationsnummer (USt-IdNr.)".

## H12 · A11y/Struktur · gutschein.html (Formular)
**Fehlende Formular-Semantik und Erfolgs-/Fehlerkommunikation.**

- **Beschreibung:** Gruppenlabels („Behandlungsdauer", „Versand", „Anzahl") sind `<label>` ohne `for` und ohne `<fieldset>/<legend>`; das Mengen-Label sollte `for="quantity"` haben. Erfolgsmeldung hat kein `role="status"`/`aria-live`, und beim Ausblenden des Formulars geht der Fokus verloren. Fehler nur per `alert()` (inkl. rohem Servertext). Kein `autocomplete` auf Kontakt-Inputs. Mengen-Buttons ohne `aria-label`.
- **Auswirkung:** Screenreader kündigen Feldgruppen nicht an; Erfolg/Fehler werden nicht zugänglich gemeldet; Autofill fehlt (höhere Abbruchrate mobil).
- **Lösung:** Radio-Gruppen in `<fieldset><legend>`; `autocomplete="name|email|tel|street-address|postal-code"`; Erfolgscontainer `role="status" tabindex="-1"` + `.focus()`; Inline-Fehler mit `role="alert"` statt `alert()`; `aria-label` an Stepper-Buttons.

## H13 · UX/SEO · fuer-wen.html
**Wichtige medizinische Seite ist ein Waisenkind — und die Kontraindikationen sind unvollständig.**

- **Beschreibung:** `fuer-wen.html` (vollwertige Seite mit Kontraindikationen) ist in **keiner** Navigation verlinkt — einziger Einstieg ist ein FAQ-Textlink auf index.html. Die Hero-Angabe „**8 Kontraindikationen**" steht über nur **7 Karten**; **Thrombose** (klassische absolute Kontraindikation für tiefe manuelle Arbeit, Emboliegefahr) fehlt, ebenso Schwangerschaft und Osteoporose.
- **Auswirkung:** Medizinisch relevante Sicherheitsinfos sind faktisch unauffindbar; sichtbarer Zahlenfehler (8 vs. 7); Haftungsrelevanz durch fehlende Thrombose-Warnung.
- **Lösung:** Seite in Footer- (und idealerweise Haupt-)Navigation aufnehmen; 8. Karte „Thrombose/Venenerkrankungen" ergänzen; Schwangerschaft/Osteoporose prüfen.

## H14 · A11y · zertifikate.html:508–525, 1048
**Lightbox: Fokusfalle im geschlossenen Zustand, kein Fokus-Management im offenen.**

- **Beschreibung:** Die Lightbox wird nur per `opacity: 0; pointer-events: none` versteckt — `#lb-close`/`#lb-prev`/`#lb-next` bleiben tabbierbar (unsichtbare Fokusfallen). Geöffnet: `role="dialog" aria-modal="true"` ohne Fokus-Trap, ohne Fokus-Rückgabe, Hintergrund erreichbar.
- **Auswirkung:** WCAG 2.4.3/1.3.2; Tastaturnutzer verirren sich.
- **Lösung:** Geschlossen `visibility: hidden`/`hidden`-Attribut; bei Öffnen Fokus auf Close-Button, Fokus-Trap, bei Schließen Fokus zurück auf den Trigger.

## H15 · Architektur/SEO · alle Seiten
**Nav/Footer nur per JS injiziert, ohne Fallback; interne Links lösen 308-Redirects aus.**

- **Beschreibung:** Nav und Footer existieren nur als leere Platzhalter (`<div id="site-nav">`) und werden per `fetch('nav.html')` nachgeladen — ohne `.catch`, ohne `<noscript>`. Da Impressum/Datenschutz-Links **nur** im injizierten Footer stehen, sind die Pflichtseiten bei JS-Fehlern von keiner Inhaltsseite erreichbar (§ 5 DDG: „unmittelbar erreichbar"). Zusätzlich zeigen alle internen Links auf `*.html`, obwohl Vercel `cleanUrls: true` nutzt → jeder Klick und jeder Fragment-Fetch läuft über einen 308-Redirect.
- **Auswirkung:** Fragile Navigation/Pflichtseiten; Nav „poppt" verzögert ein; Redirect-Ketten kosten Crawl-Budget und Latenz.
- **Lösung:** `.catch` mit statischem Minimal-Fallback (mind. Impressum/Datenschutz) + `<noscript>`-Links; langfristig Build-Step/SSG, der Nav/Footer inline shippt. Interne Links extensionslos (`/ueber-mich`, `/#leistungen`), Fragmente als `/nav`/`/footer` fetchen.

---

# 3. MEDIUM — Qualität & Konsistenz

## Design-System & CSS

- **M1 · Button-Drift (mehrere Dateien).** „Der" Primärbutton existiert in ~8 Varianten: Paddings 15/16/18 px, Radien 0/2/999 px, drei Hover-Verhalten (heller `#1ba3ff` / dunkler `#0380d8` / Sky-Trace `#90caf9`), mit/ohne Glow. Beispiele: `.btn-kurs` (16px 36px), `.btn-price` (radius 0), `.kurs-btn-enroll` (hover dunkler, kein Glow), `.fuerwen-alt-cta` (radius 0, hover dunkler). **Lösung:** Alle auf `.btn-primary` (+Modifier) konsolidieren; `#0380d8`/`#90caf9`-Hover entfernen.
- **M2 · Cormorant in Weight 400 (~10 Stellen).** `.cond-item h4`, `.kurs-pillar-title`, `.info-card-title`, `.legal-section h3` u. a. nutzen Cormorant 400; DESIGN.md verbietet 400/600 für die Display-Schrift. Zusätzlich lädt die Font-URL jeder Seite `0,600` ungenutzt. **Lösung:** Kartentitel auf 300, `0,600` (und nach Umstellung `0,400`) aus dem Request streichen.
- **M3 · Italic in DM Sans (fuer-wen, kurs-page, ueber-mich).** `.fuerwen-hero-note`, `.kurs-cert-footer`, `.ueber-not-note` setzen `font-style: italic` auf DM-Sans-Text; da kein Italic-Schnitt geladen ist → Faux-Italic (Verstoß „Italic Signal Rule"). **Lösung:** Italic entfernen oder als Cormorant-Zitat auszeichnen.
- **M4 · Off-System-Schatten & Ruhe-Schatten.** `.kurs-figure` (`0 30px 60px rgba(0,0,0,.35)` im Ruhezustand), `.kurs-price-card.featured` (Akzent-Glow auf Karte statt Button), Lightbox `0 40px 100px rgba(0,0,0,.6)`, Glow-Duplikate 18/24 statt Spec 20/28 px. Verstößt gegen das 4-Schatten-„Flat-by-default"-System. **Lösung:** auf die vier Vokabular-Schatten mappen.
- **M5 · Undokumentierte Fremdfarben.** `#061828` (11× Footer-Bottom, de-facto 11. Ton), `#0d3a6e`/`#0e3f75` (Gradient-Stops, 9×), `#0d6efd`/`#0a4fa8` (Bootstrap-Blau, Hero-Avatare), `#fff8f8`, sowie Tailwind-Grautöne (`#6b7280`, `#e5e7eb`) und Alt-Cream `#f5f0e8` im injizierten Sprachwidget. **Lösung:** auf Palette normalisieren oder `#061828` offiziell als Token dokumentieren.
- **M6 · Label-Größen unter 11 px (~50 Stellen).** `font-size: 10px` (mehrere Eyebrows/Labels), `9px` (Avatar-Initialen, about-label), **8px** (ueber-mich Hero-Badge mobil). DESIGN.md: „never go below 11px". **Lösung:** auf 11 px anheben.
- **M7 · z-index-Kollision.** Offenes Mobile-Menü (190) liegt unter WhatsApp-FAB (240) und Mobile-CTA-Bar (250) — beide schweben über den Menülinks. Grain-Overlay (9998) liegt über der Lightbox (1000). **Lösung:** dokumentierte Skala (100/200/300/900/1000); FABs bei offenem Menü ausblenden.
- **M8 · Overlay-Kollision Sprachumschalter.** Im Browser bei 700 px bestätigt: Der Sprachbutton (`bottom:24px`, greift erst < 640 px auf `bottom:88px`) überlappt die Mobile-CTA-Bar (erscheint < 768 px). **Lösung:** lang.js-Breakpoint auf 768 px anheben.
- **M9 · Breakpoint-Wildwuchs.** Seiten nutzen 480/768/1024, `accessibility.css` schaltet die Nav aber bei **820/900**, dazu Insel-Breakpoints 560 (index) und 640 (lang.js). Zwischen 769–820 px gelten Desktop-Nav und Mobile-Seitenlayout gleichzeitig. **Lösung:** Breakpoint-Tokens festschreiben.
- **M10 · Typo-Skala-Drift.** Jede Hero-Display-Größe ist anders: `clamp(42,5.5vw,86)` (index) vs. 40/5/72 (kurs) vs. 48/6/84 (zertifikate) vs. 36/4.5/68 (fuer-wen). **Lösung:** `--fs-display`/`--fs-headline`-Tokens.
- **M11 · Grain-Overlay inkonsistent.** `body::after`-Rauschtextur nur auf 4 von 8 Seiten → wahrnehmbarer Unterschied beim Seitenwechsel. **Lösung:** in Shared-CSS zentralisieren (alle oder keine).

## Performance

- **M12 · Kein Bild trägt `width`/`height` (alle 13 auf index).** Trotz teilweiser aspect-ratio-Abfederung shiften Logo-Slider und Kurs-Trust-Logos beim Lazy-Load (CLS). **Lösung:** intrinsische `width`/`height` überall.
- **M13 · LCP-Hero ohne `preload`/`srcset`.** hero.jpg (5504 px Quelle) hat nur `fetchpriority="high"`; 4 render-blockierende Stylesheets davor. **Lösung:** `srcset` 800/1280/1920, `sizes="100vw"`, `width`/`height`, optional Preload.
- **M14 · Kein `Cache-Control` für /assets.** `vercel.json` setzt keine Cache-Header für Bilder. **Lösung:** `{ "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }`.
- **M15 · Fehlende Security-Header.** Kein HSTS, keine CSP, keine Permissions-Policy in `vercel.json`. **Lösung:** nach Font-Self-Hosting HSTS + CSP + `Permissions-Policy: camera=(), microphone=(), geolocation=()` ergänzen.
- **M16 · Trustindex-Widget & OSM-iframe ohne Consent.** Beide laden Drittressourcen (Trustindex fiel im Test aus, Fallback-Text erscheint erst nach 7 s). **Lösung:** Consent/Zwei-Klick oder statisch rendern; OSM durch statisches Kartenbild ersetzen (ist ohnehin `aria-hidden`).

## SEO & Head

- **M17 · Kein Favicon (alle Seiten).** Kein `rel="icon"`, kein apple-touch-icon, keine favicon.ico im Repo → generisches Icon in Tab/Bookmark/Google-SERP. **Lösung:** SVG/PNG-Favicon + apple-touch-icon-180.
- **M18 · Canonicals zeigen auf Redirects.** Alle Canonicals/`og:url` nutzen `*.html`, das bei `cleanUrls` 308-redirectet; kurs-page zusätzlich unter `/kurs` erreichbar. **Lösung:** extensionslose absolute URLs.
- **M19 · Meta-Descriptions zu lang / Titel zu lang.** index 224 Zeichen (CTA wird abgeschnitten), zertifikate-Desc 187, ueber-mich-Titel 81. fuer-wen-Titel „…**geeignet**?" vs. H1 „…**nicht** geeignet?" (Intent-Mismatch). **Lösung:** Titel ≤60, Desc ≤155 Zeichen.
- **M20 · og:image/twitter:card fehlen auf allen Unterseiten.** Nur index hat beides; kurs-page hat `og:type: article`. Beim Teilen (WhatsApp = Zielgruppe) erscheint kein/gestrecktes Bild. **Lösung:** 1200×630-Share-Bild + Dimensions-Tags von index übernehmen; kurs-page kein JSON-LD → Course/Offer-Schema ergänzen.
- **M21 · Self-Serving aggregateRating.** index JSON-LD trägt 4,7/191 aus eigenen Google-Reviews — Google ignoriert das für LocalBusiness (kein Rich Result, Spam-Risiko). Zahl 191 an 4 unabhängigen Stellen hartkodiert (Meta, OG, JSON-LD, JS-Konstante) → driftet zwangsläufig. **Lösung:** aggregateRating entfernen oder aus unabhängiger Quelle; Zahl zentralisieren.

## UX & Content

- **M22 · Kurs-Haupt-CTA führt zur Login-Maske.** „Jetzt anmelden" (index.html:3938 und 3× auf kurs-page) verlinkt auf `onlinekurs.…/login` — Kaltbesucher haben keinen Account. **Lösung:** auf Signup/Checkout verlinken.
- **M23 · Featured-Kurspaket ist „Bald verfügbar" und nicht kaufbar** — wirbt aber mit Streichpreis „statt 1.090 €" und „Spare 240 €". Die visuell dominante Karte lenkt auf ein totes Angebot (Conversion-Killer, UWG-Risiko bei Streichpreis für Nicht-Kaufbares). **Lösung:** bis zum Launch das kaufbare 600-€-Paket featuren; „Bald verfügbar"-Karten ohne Streichpreis, mit Warteliste-CTA.
- **M24 · Gutschein-Text-Bug (gutschein.html:1228).** Trust-Item 5 lautet „Nach Zahlungseingang versandfertig**Behandlungen ausschließlich** mit Termin" — zwei Strings zusammengeklebt, dazu Item 4 dupliziert. **Lösung:** auf „Behandlungen ausschließlich mit Termin" korrigieren.
- **M25 · Inkonsistente Anrede.** ueber-mich.html wechselt **innerhalb der Seite** von „Sie" (Hero) zu „du" (Werte/CTA); fuer-wen/zertifikate siezen, index/kurs duzen. **Lösung:** site-weit festlegen (Empfehlung: „du", da index/Kurs es prägen).
- **M26 · Hero-Ghost-Button-Ziel-Mismatch (index.html:3475).** „Leistungen ansehen" verlinkt auf `#preise` („Behandlungsoptionen"), während der Nav-Punkt „Leistungen" auf `#leistungen` zeigt. **Lösung:** auf `#leistungen` zeigen oder Label „Preise ansehen".
- **M27 · Dekorative Glyphen ohne `aria-hidden`.** `✦`, `✕`, `★` als Text-Spans in Trust-Bars und Kontraindikations-Karten werden vorgelesen; die Klasse `.icon` ist zudem nirgends definiert. **Lösung:** `aria-hidden="true"` ergänzen (index macht es bei SVGs korrekt vor).

## Weitere A11y (Medium)

- **M28 · Prohibited ARIA auf generischen Spans.** `aria-label` auf `<span class="hero-trust-stars">`/`<div class="info-strip">` ohne Rolle wird von vielen Screenreadern ignoriert → „Stern Stern Stern…". **Lösung:** `role="img"` ergänzen.
- **M29 · `role="listitem"`/`role="region"` falsch platziert.** Kontakt-Links tragen `role="listitem"` direkt am `<a>` (überschreibt Link-Rolle); FAQ-`role="region" aria-labelledby` referenziert den Item-Wrapper statt den Button. **Lösung:** echte `<ul>/<li>` bzw. IDs auf die Buttons.
- **M30 · Hamburger-Menü unvollständig.** Kein `aria-controls`, kein Escape-Close, kein Fokus-Trap, Body-Scroll nicht gesperrt — inkonsistent zum Sprachmenü, das Escape/Outside-Click kann. **Lösung:** Interaktionsmuster angleichen.
- **M31 · Sprachwidget-ARIA ungültig.** `ul[role="listbox"] > li > button[role="option"]` bricht die owned-children-Regel; keine Pfeiltasten-Navigation; `aria-label="Language selection"` hart englisch. **Lösung:** Disclosure-/Menu-Pattern.

---

# 4. LOW — Feinschliff (Auswahl)

- **L1 · Preisformat `<sup>€</sup>80`.** Währung als Superscript, englisches Format; Screenreader liest „hochgestellt Euro 80". Deutsches Publikum erwartet „80 €". **Lösung:** de-Format + visually-hidden Klartext.
- **L2 · Telefon-Gruppierung „07424 960 609 9"** ungewöhnlich (DIN 5008: 07424 9606099). tel:/wa.me stimmen technisch überein. **Lösung:** vereinheitlichen.
- **L3 · Duplizierte Inline-SVGs.** FAQ-Chevron 6×, Map-Pin/Uhr/Bizeps je 2× inline → ~120 KB HTML. **Lösung:** SVG-Sprite mit `<use>`.
- **L4 · No-Op-CSS.** `.cond-item:nth-child(4){order:4}` (Identität), `counter-reset:none`, `::before{display:none}` ohne generierten Content, doppelte Deklarationen in Media Queries. **Lösung:** entfernen.
- **L5 · Fake-Avatare „W M S"** mit erfundenen Initialen und Off-Palette-Blau als Social Proof. **Lösung:** Google-„G" oder echte freigegebene Initialen.
- **L6 · `<meta name="keywords">`** (obsolet seit ~2009). **Lösung:** entfernen.
- **L7 · Freemail-Adresse `mein-therapeut@web.de`** als offizielle Impressums-/Kontaktadresse, obwohl eigene Domain existiert (Resend sendet bereits von `@onlinekurs.faszienpraxis-fech.de`). **Lösung:** `kontakt@faszienpraxis-fech.de` einrichten, an allen 16 Stellen tauschen.
- **L8 · `© 2026` hartkodiert** (footer.html:119) — 2027 falsch. **Lösung:** Jahr in components.js setzen.
- **L9 · `100vh`/`88vh` statt `dvh`** (Hero-Sektionen) → Adressleisten-Sprung auf iOS Safari. **Lösung:** `dvh`/`svh`.
- **L10 · Verwaiste Anker.** `#ueber-wadim`, `#online-kurs`, `#bewertungen` werden nirgends verlinkt (verpasste Deeplink-Chancen). **Lösung:** verlinken oder entfernen.
- **L11 · Datei-/URL-Hygiene.** Bilddateiname `prakriker-für-tiefe-freisetzungspunkte.jpg` (Tippfehler + Umlaut in URL). Grammatik „die deutlich hilfreicher und sicherere Wahl" (fuer-wen.html, aus PHP-Altlast kopiert). **Lösung:** korrigieren.
- **L12 · No-JS-Sichtbarkeit.** Reveal-Klassen (`.mg-chapter`, `.zert-row`) starten mit `opacity: 0` — ohne JS bleiben ganze Sektionen unsichtbar. **Lösung:** Initialzustand sichtbar + `.js`-Opt-in oder `<noscript>`-Override.

---

# 5. Refactoring-Empfehlungen

- **R1 · Tote/verwaiste Dateien entfernen.**
  - `kurs-page.css` (1.724 Zeilen) wird von **keiner** Datei verlinkt — toter Code mit gefährlichen Gegen-Definitionen (`.btn-primary{background:var(--dark)}`, Legacy-Nav). Löschen.
  - `page-fuer-wen.php` / `page-zertifikate.php` — WordPress-Templates in einem statischen Repo, per `.vercelignore` ausgeschlossen, nirgends referenziert, inhaltlich veraltet. Löschen (Git-History bewahrt sie).
  - `certificate-preview.html` — von nichts verlinkt, off-brand (eigene Palette, Great Vibes, `font-weight:600`), öffentlich unter `/certificate-preview` erreichbar mit echtem Namen/Signatur. In `.vercelignore` oder ins LMS-Projekt verschieben.
- **R2 · Shared Stylesheet extrahieren.** ~31 % aller CSS-Zeilen sind textidentische Duplikate; konservativ ~5.000 von ~13.500 Zeilen sind tot oder redundant. Jede Unterseite trägt einen Legacy-Footer-/Nav-Block, den `accessibility.css` per Spezifität/`!important` neutralisieren muss (Ursache von C9). **Lösung:** `base.css` (Tokens, Reset, Typo, Buttons, Sections) + `components.css` (Nav/Footer/FABs); Inline-`<style>` auf echte Seiten-Spezifika reduzieren; Legacy-Blöcke löschen; danach den `body > nav`-Spezifitäts-Hack und die `!important`-Schicht zurückbauen.
- **R3 · `accessibility.css` umbenennen/aufteilen.** Nur ~40 Zeilen sind wirklich A11y; der Rest ist ein Komponenten-Stylesheet mit seiten­spezifischen Selektoren (`.how-section`, `.schroepfen-section`) und einem toten `.footer-social a`-Block (von einer späteren Regel doppelt überschrieben). **Lösung:** `a11y.css` + `components.css`.
- **R4 · Konstanten zentralisieren.** Timify-URL 16×, Telefon 3×, Review-Zahl „191" an 4 unabhängigen Stellen, Öffnungszeiten 4-fach hartkodiert. **Lösung:** `/termin`-Rewrite als Buchungs-Kurzlink; Öffnungszeiten/Review-Zahl in ein Modul, per Build/JS in Meta+JSON-LD+UI schreiben.
- **R5 · Öffnungszeiten-Logik vereinheitlichen** (siehe H6/H7): ein Schedule-Objekt, ein Timer, `Europe/Berlin`, Feiertage.
- **R6 · Tote CSS-Selektoren & JS entfernen.** u. a. `.kurs-banner-eyebrow`, `.btn-cta-ghost`, `.footer-praxis-map img`, `.zert-row-*` (verhindert sogar sichtbare Zertifikatstitel!); toter JS-Block in ueber-mich (`.mg-ring-fill`, `#mgRingNum` — Elemente existieren nicht).

---

# 6. Top 20 der wichtigsten Probleme

| # | Prio | Problem | Ort |
|--:|---|---|---|
| 1 | Critical | Admin-Passwort + Kunden-PII im Git/Deploy | .gstack/, .claude/ |
| 2 | Critical | 19,5 MB PNG auf Startseite | glas-schroepfen.png |
| 3 | Critical | ~30 MB Bildgewicht gesamt | assets/ |
| 4 | Critical | Erfundenes Testimonial live (UWG) | index.html:3929 |
| 5 | Critical | Datenschutz nennt falschen Hoster, verschweigt Resend/OSM | datenschutz.html:664 |
| 6 | Critical | Google Fonts vom CDN (Abmahnrisiko) | alle `<head>` |
| 7 | Critical | Haupt-CTA ist 404 (`/termin`) | zertifikate.html:1039 |
| 8 | Critical | „John Doe"-Musterzertifikat als Top-Credential | zertifikate.html:946 |
| 9 | Critical | Footer-Maps-Link auf Startseite tot (pointer-events) | index.html:2546 |
| 10 | High | Systemische WCAG-Kontrastverstöße (CTAs, Fließtext, Eyebrows) | alle Seiten |
| 11 | High | Radio-Buttons `display:none` — Formular tastaturunbedienbar | gutschein.html:451 |
| 12 | High | CORS-Wildcard + kein Rate-Limit auf Mail-Endpoint | api/gutschein.js:17 |
| 13 | High | i18n bricht auf 6/8 Seiten ab; `<html lang>` lügt | lang.js-Einbindung |
| 14 | High | Impressum: TMG statt DDG, tote ODR-Plattform, „Steuer-ID" falsch | impressum.html |
| 15 | High | Öffnungsstatus: 2 Timer + Besucher-Zeitzone | components.js / lang.js |
| 16 | High | Sektionstitel als `<div>`, Heading-Outline bricht | index.html:3603, 3748 |
| 17 | High | fuer-wen verwaist + „8 vs. 7" Kontraindikationen, Thrombose fehlt | fuer-wen.html |
| 18 | High | Eyebrow-Override: `font-weight:600 !important` + 100px auf allen Seiten | accessibility.css:1041 |
| 19 | High | Kein `<main>`; Skip-Links springen am Hauptinhalt vorbei | alle Seiten |
| 20 | High | Undefinierte Variable `--text-light` | index.html:1870, 1961 |

---

# 7. Quick Wins (< 30 Minuten pro Punkt)

1. **`.footer-praxis-map-overlay { pointer-events: none }`** aus index.html löschen → Maps-Link lebt wieder (C9).
2. **Gutschein-Trust-Item 5** korrigieren: „Behandlungen ausschließlich mit Termin" (M24).
3. **`/termin`-404** → Timify-URL in zertifikate.html:1039 (C7).
4. **`--text-light`** → `var(--dark)` in index.html:1870/1961 (H3).
5. **Fake-Testimonial** entfernen oder ersetzen (C4).
6. **ODR-Absatz** aus Impressum streichen, `§ 5 TMG` → `§ 5 DDG`, „Steuer-ID" → „USt-IdNr." (H11).
7. **`--text-muted`** von `#5a7a99` auf `#4a6a8a` abdunkeln → behebt einen Großteil der Fließtext-Kontraste auf einen Schlag (H1).
8. **Primär-Button-Textfarbe** auf `var(--dark)` vereinheitlichen → CTA-Kontrast 3,08 → 5,04 (H1).
9. **Favicon** + apple-touch-icon in alle `<head>` (M17).
10. **`Cache-Control`** für `/assets/*` in vercel.json (M14).
11. **`.gstack/`, `.gstack-audit/`, `.claude/`** in `.vercelignore`/`.gitignore` (Teil von C1 — Passwortrotation separat!).
12. **`0,600`** aus den Google-Fonts-URLs entfernen (ungenutzt, M2).
13. **`<meta name="keywords">`** entfernen (L6).
14. **`role="img"`** an die Sterne-Spans (M28).
15. **8. Kontraindikations-Karte** „Thrombose" ergänzen → Zahl „8" stimmt wieder (H13).

---

# 8. Performance-Optimierungen (nach Impact)

1. **Bilder (C2/C3):** ~30 MB → < 2 MB durch AVIF/WebP + korrekte Skalierung + `srcset`. Mit Abstand der größte Hebel — reduziert LCP und Transfer um Größenordnungen.
2. **`width`/`height` auf alle `<img>`** (M12) → eliminiert Layout-Shift (CLS).
3. **Google Fonts self-hosten** (C6) → entfernt render-blockierenden Fremd-Request, senkt FCP, DSGVO-konform.
4. **`Cache-Control: immutable` für /assets** (M14) → schnelle Wiederkehr.
5. **LCP-Hero: `preload` + `srcset`** (M13).
6. **CSS entschlacken** (R2): ~5.000 tote/duplizierte Zeilen; pro Seitenaufruf werden aktuell ~350 Zeilen doppeltes Footer-CSS geparst.
7. **Trustindex/OSM entkoppeln** (M16) → weniger Third-Party-Blocking; statisches Kartenbild statt iframe.
8. **SVG-Logo (144 KB) + Inline-SVG-Sprite** (L3) via SVGO/`<use>`.
9. **JS minifizieren** (lang.js 46 KB, components.js unminifiziert).

## Erwartete Core Web Vitals
- **LCP:** aktuell kritisch (mehrere MB-Bilder, render-blockierende Fremd-Fonts) → nach 1–3/5 gut.
- **CLS:** mittel (fehlende Bild-Dimensionen, verzögerte Nav-Injektion) → nach 2 gut.
- **INP:** unkritisch (wenig JS, keine schweren Handler); Scroll-Handler sind `passive`.

---

# 9. UX-Optimierungen

1. **fuer-wen.html erreichbar machen** (H13) — medizinische Sicherheitsinfos gehören in die Navigation.
2. **CTAs auf die richtigen Ziele** (C7, M22, M26): Kurs-CTA → Checkout statt Login; Hero-Ghost → `#leistungen`; toter `/termin` → Timify.
3. **Kurs-Preisblock** (M23): kaufbares Paket featuren statt „Bald verfügbar" mit Streichpreis.
4. **Formular-Feedback** (H12): Loading-/Erfolgs-/Fehlerzustände zugänglich und gestylt statt `alert()`; Autofill via `autocomplete`.
5. **Anrede vereinheitlichen** (M25).
6. **Floating-Element-Zoo entzerren** (M7/M8): WhatsApp-FAB, Sprachumschalter und Mobile-CTA-Bar konkurrieren mobil um denselben Bereich.
7. **Trust-Redundanz auflösen:** „4,7★/191" erscheint 3× direkt untereinander — Platz für differenzierte Proof-Punkte.
8. **5-Sekunden-Test:** Startseite besteht ihn (klares Wertversprechen + sichtbarer CTA); Kursseite nicht ganz — „17 Module" werden behauptet, aber nur 4 generische Schritte gezeigt, kein Curriculum/keine Belege dort, wo 600 € entschieden werden.

---

# 10. Design-Verbesserungen (Richtung Linear/Stripe/Apple-Niveau)

Das System hat die richtige Grundlage (editoriale Serif-Display, enge Akzent-Leine, driftfreie Tokens). Was zum Referenzniveau fehlt:

1. **Eine Wahrheit pro Komponente** (M1, H2): Ein Button, ein Hover, ein Eyebrow. Aktuell existieren ~8 Button-Varianten und ein `!important`-Eyebrow-Override, der gegen die eigene kanonische Definition kämpft. Stripe/Linear-Qualität kommt aus Reduktion, nicht aus Sonderfällen.
2. **Schatten-Disziplin** (M4): „Flat by default" wird durch Ruhe-Schatten und Akzent-Glows auf Karten unterlaufen. Die vier definierten Schatten konsequent halten.
3. **Kontrast als Designqualität** (H1): Premium heißt nicht „hellgrau auf weiß". `--text-muted` abdunkeln hebt die wahrgenommene Wertigkeit sofort.
4. **Typo-Tokens** (M2, M10): Cormorant strikt auf 300; Display-/Headline-Größen als Tokens statt pro Seite neu erfunden — sorgt für den „ein Guss"-Eindruck.
5. **Mikro-Polish** (fehlt sitewide): `::selection` in Navy/Blau (statt Browser-Blau), `-webkit-tap-highlight-color: transparent`, konsistente Reveal-Animationen mit `prefers-reduced-motion`-Guard (der Scroll-Parallax in ueber-mich ignoriert Reduced-Motion aktuell).
6. **Grain & Rhythmus konsistent** (M11): gleiche Textur, gleiche Section-Paddings auf allen Seiten.

---

# 11. Finale Qualitätsbewertung

## Gesamt: 58 / 100

| Dimension | Score | Begründung |
|---|--:|---|
| **Visuelles Design** | 82 | Starkes, kohärentes System; editoriale Typografie; driftfreie Farbtokens. Abzug für Button-/Schatten-/Eyebrow-Drift. |
| **Design-System-Disziplin** | 62 | Exzellent dokumentiert (DESIGN.md), aber der `!important`-Eyebrow-Override und ~8 Button-Varianten verletzen die eigenen Regeln. |
| **Code-Qualität / Architektur** | 45 | ~31 % CSS-Duplikate, tote Orphan-Dateien (kurs-page.css, PHP), undefinierte Variable, kaskadenbedingte Bugs. |
| **Performance** | 30 | ~30 MB Bilder, render-blockierende Fremd-Fonts, keine Bild-Dimensionen, kein Asset-Caching. Dominierender Schwachpunkt. |
| **Accessibility** | 48 | Gute Basis (focus-visible, reduced-motion, aria-expanded, alt-Texte), aber systemische Kontrastverstöße, tastaturuntaugliches Formular, fehlende Landmarks, Lightbox-Fokusfallen. |
| **UX / Conversion** | 60 | Klare Startseite, guter 5-Sekunden-Test; aber tote/falsche CTAs, verwaiste Seiten, Formular-Feedback schwach. |
| **SEO** | 55 | Solide Meta/JSON-LD auf index; aber Canonicals auf Redirects, kein Favicon, unsichtbare i18n, Self-Serving-Rating. |
| **Recht / DSGVO** | 25 | Falscher Hoster genannt, Google Fonts vom CDN, nicht deklarierte Dienste, veraltete Gesetze, erfundenes Testimonial. Mehrfaches Abmahnrisiko. |
| **Security** | 20 | Klartext-Admin-Passwort + Kunden-PII im Repo/Deploy; CORS-Wildcard ohne Rate-Limit. (API-Code selbst ist XSS-sicher.) |
| **Responsive** | 78 | Über 9 Breakpoints getestet, nur minimaler 3-px-Overflow bei 320 px (about-Label) und die verwaiste certificate-preview überläuft mobil. Solide. |

### Einordnung
Ein handwerklich schön gestalteter Marketing-Auftritt mit einer klaren Design-Vision — aber **nicht produktionsreif**. Vier Kategorien blockieren den Go-Live unabhängig voneinander: **Security** (Passwort-Leak), **Recht** (DSGVO/Impressum/Fake-Testimonial), **Performance** (30 MB Bilder) und **Accessibility** (Kontraste, Formular). Die gute Nachricht: Die teuersten Punkte (Bilder, Fonts, Kontrast-Tokens, Legal-Texte, der Security-Cleanup) sind mit überschaubarem, klar umrissenem Aufwand behebbar, ohne das Design anzutasten. Nach Abarbeitung von Critical + High ist realistisch ein Niveau von **~85/100** erreichbar.

### Empfohlene Reihenfolge
1. **Sofort:** C1 (Passwort rotieren + Repo bereinigen).
2. **Tag 1:** Quick Wins 1–15 (die meisten < 30 min, hoher Wirkungsgrad).
3. **Woche 1:** C2/C3 (Bild-Pipeline), C5/C6 (Datenschutz + Fonts self-hosten), H1 (Kontraste), H4/H12 (Formular).
4. **Woche 2:** H2/H15 + R1–R6 (Refactoring, Shared-CSS, tote Dateien), restliche High/Medium.

---

*Erstellt durch statische Vollanalyse, Browser-Laufzeittests (Chromium, 9 Breakpoints), WCAG-Kontrastberechnung und Bildvermessung. Alle Zeilennummern wurden gegen den aktuellen Stand des Branches `claude/website-master-audit-rbgjpm` verifiziert.*
