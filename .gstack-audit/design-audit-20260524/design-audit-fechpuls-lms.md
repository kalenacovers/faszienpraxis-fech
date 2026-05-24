# Design-Audit Fech Puls LMS

**URL:** https://onlinekurs.faszienpraxis-fech.de
**Datum:** 2026-05-24
**Modus:** Audit-only (keine Code-Änderungen)
**Scope:** Public + Student Dashboard + Admin (read-only)
**Account:** denis.jungkind99@gmail.com (Admin)

> Lektions-Player nicht auditiert — Test-Account hat keinen gekauften Kurs. Lücke explizit dokumentiert (siehe Abschnitt "Nicht auditiert").

---

## Headline-Score

| Bereich | Note | Begründung |
|---|---|---|
| **Public/Landing** | C+ | Saubere Typografie + Brand-Stil, aber sales-relevanter Content fehlt komplett |
| **Student Dashboard** | C | Funktional, aber kritischer Header-Bug + leere Empty-States |
| **Admin** | C- | Workflow funktioniert, KPI-Lesbarkeit kaputt, Lektions-Editor sehr unübersichtlich |
| **Konsistenz** | B | Design-Sprache durchgezogen, aber Login-State-Inkonsistenz überall |
| **AI Slop** | A | Echte Typografie (DM Sans + Cormorant Garamond), kein generisches Card-Grid — **kein AI Slop**. ✅ |

**Gesamt: C+** — Solides Visual-System, aber Nutzerführung und Conversion-relevante Inhalte fehlen.

---

## Top 5 Quick Wins (jeweils < 30 Min)

1. **Header-State fixen**: Eingeloggte Nutzer dürfen "Login / Konto erstellen" nicht sehen. Stattdessen User-Menü mit Logout. → blockiert: Vertrauen.
2. **`#inhalt`-Anker auf Kursdetail bauen oder Link entfernen** — aktuell führt "Kursinhalte ansehen" ins Leere.
3. **Admin KPI-Karten auf DM Sans / Tabular Nums umstellen** — Cormorant rendert "1" als "I", unleserlich.
4. **Profil-Seite "Lädt…"-Hänger fixen** — Fallback/Error-State einbauen, sonst denkt User das System ist kaputt.
5. **Brand-Konflikt auflösen**: Logo "Wadim Fech" vs Page-Title "Fech Puls" — eine Marke wählen.

---

## Befunde nach Priorität

### 🔴 KRITISCH — Conversion- & Vertrauens-Killer

#### F-01 — Header zeigt nach Login weiterhin "LOGIN / KONTO ERSTELLEN"
**Wo:** Alle Dashboard- und Admin-Seiten
**Was:** Top-Nav rendert unverändert die Public-Nav-Items auch im eingeloggten Zustand. Kein User-Menü, kein Logout-Button im Header.
**Warum kritisch:** Nutzer denken sie sind nicht eingeloggt, klicken erneut Login, verwirrt. Kein Logout = Sicherheits- + UX-Problem. Gilt auch für Admin-Account.
**Fix-Richtung:** Bedingtes Header-Rendering nach Auth-State. Eingeloggt: Avatar/Name + Dropdown mit "Mein Dashboard / Profil / Logout".
**Screenshots:** `06-after-login.png`, `10-admin-overview.png`

#### F-02 — Kursdetail ohne Curriculum, ohne Instructor, ohne Preview
**Wo:** `/kurse/fachkurs`
**Was:** Bei 600€ Kaufentscheidung zeigt die Seite: vage "Was erwartet dich"-Bullets, Preis-Karte mit USP-Wiederholungen, finalen CTA. **Es fehlt komplett:** Lektions-/Modul-Liste, Wadim als Instructor mit Foto + Bio, Sample-Video oder Trailer, Testimonials, Zielgruppe ("Für wen ist der Kurs?"), Voraussetzungen, FAQ.
**Warum kritisch:** Niemand zahlt 600€ ohne zu wissen was drin ist. Das LMS-System HAT alle Daten (im Admin sehe ich 17+ Module mit YouTube-Videos) — sie werden nur dem Käufer nicht gezeigt.
**Fix-Richtung:** Curriculum-Accordion (Module → Lektions-Titel + Dauer + Preview-Flag) öffentlich anzeigen. Instructor-Block mit Foto, Bio, Qualifikationen. 1-2 Lektionen als Preview kostenlos anteasern.
**Screenshots:** `03-kurs-detail.png`, `16-admin-module-lektionen.png` (zeigt was tatsächlich verfügbar wäre)

#### F-03 — "Kursinhalte ansehen"-Link kaputt
**Wo:** `/kurse/fachkurs` Hero-CTA
**Was:** Link zeigt auf `#inhalt`, Anker existiert nicht im DOM. Klick scrollt nirgendwo.
**Warum kritisch:** Sekundärer CTA neben "Jetzt anmelden". Wenn das nicht funktioniert, springt der unentschiedene Käufer ab.
**Fix-Richtung:** Entweder Anker bauen (Curriculum-Sektion wie F-02) oder Link entfernen.

#### F-04 — Admin KPI-Zahlen in Cormorant-Garamond unleserlich
**Wo:** `/admin` Dashboard, `/admin/kunden` Tabelle
**Was:** Kennzahlen wie "1 Aktive Kurse", "0 Bestellungen" werden in Cormorant-Serif mit Old-Style-Ziffern gerendert. "1" sieht aus wie römisches "I", "0" wie ein "O". Auch in Tabellen-Spalten (Kurse, Bestellungen) gleicher Effekt.
**Warum kritisch:** Admin-Zahlen müssen auf einen Blick erfasst werden. Die schöne Editorial-Serif gehört in Headlines, nicht in KPIs.
**Fix-Richtung:** Im Admin: `font-family: 'DM Sans'; font-variant-numeric: tabular-nums lining-nums;` für alle Zahlen. Cormorant nur für H1/H2 behalten.
**Screenshots:** `10-admin-overview.png`, `12-admin-kunden.png`

#### F-05 — Brand-Verwirrung: "Wadim Fech" vs "Fech Puls"
**Wo:** Überall (Logo links oben = "Wadim Fech", Browser-Titel = "Fech Puls — Online-Fachausbildung", Hauptseite-Link führt auf faszienpraxis-fech.de)
**Was:** Drei Marken-Identitäten gleichzeitig: Person (Wadim Fech), Plattform (Fech Puls), Praxis (Faszienpraxis Fech).
**Warum kritisch:** Erstkunde versteht nicht, wer hier verkauft. Vertrauen leidet.
**Fix-Richtung:** Entscheidung: Ist "Fech Puls" der LMS-Brand? Dann Logo entsprechend bauen. "Wadim Fech"-Logo gehört eher auf die Hauptpraxis-Site.

#### F-06 — Touch-Targets unter Mindest-Standard
**Wo:** Alle Navi-Links (Header + Footer + Sidebar)
**Was:** Header-Links 17px hoch (WCAG AAA: 44px, mobile-standard: 44px iOS, 48dp Android). CTAs nur 38-40px. Bei `/kurse` und Dashboard-Sidebar alle Links ebenfalls unter 20px.
**Warum kritisch:** Mobile-Nutzer können präzise nicht klicken, frustrieren. Accessibility (WCAG 2.5.5).
**Fix-Richtung:** `min-height: 44px` auf allen klickbaren Elementen, `padding: 12px 16px` als Default.

---

### 🟡 HOCH — Reibungspunkte die Konversion schwächen

#### F-07 — Landing ist eine Visitenkarte, keine Sales-Page
**Wo:** `/`
**Was:** Komplette Seite nur **1255px hoch** (3-4 Scroll-Sektionen). Nach Hero direkt Footer. Es fehlt: Social Proof (Zahlen "X Absolventen seit YYYY"), Testimonials mit Foto, Instructor-Vorstellung, FAQ-Block, Kurs-Preview-Karten, Trust-Signale (Zertifizierungen, Verbände).
**Fix-Richtung:** Landing auf 4000-5000px ausbauen. Sektionen-Reihenfolge: Hero → "Für wen ist das?" → Kurs-Preview-Karte → Instructor-Block → "So funktioniert's" (3 Schritte) → Testimonials → FAQ → Final CTA.

#### F-08 — Hero-Visual ist 50% leere blaue Fläche
**Wo:** `/`, `/kurse/fachkurs`
**Was:** Rechte Hälfte = dunkelblauer Gradient mit nur "Faszien"-Wortmarke transparent eingeschrieben. Keine Imagery, keine Therapie-Aufnahme, kein Wadim, keine Kurs-Visualisierung.
**Fix-Richtung:** Hochwertiges Foto (Wadim bei der Arbeit am Patient, Detail-Shot Faszien-Behandlung) — emotional + glaubhaft. Oder kurzes Loop-Video (10s ohne Ton).

#### F-09 — Stats "100% / ∞ / PDF" ohne Kontext
**Wo:** Landing, Kurse, Kursdetail (3x wiederholt)
**Was:** "100% ONLINE", "∞ ZUGRIFFE", "PDF ZERTIFIKAT" wirken wie Platzhalter. 100% wovon? Unendliche Zugriffe = lebenslang? Warum PDF — andere Kurse haben Live-Sessions?
**Fix-Richtung:** Konkretere Formulierungen mit echten Zahlen. "17 Module · 12 Std Video · Lebenslanger Zugang · Offizielles Zertifikat (PDF)". Wiederholung auf 1 Stelle reduzieren.

#### F-10 — Profil-Seite hängt auf "Lädt…"
**Wo:** `/dashboard/profil`
**Was:** Box "Persönliche Daten" zeigt dauerhaft "Lädt…", keine Daten, kein Timeout, kein Fehler. Console wirft keinen Error.
**Fix-Richtung:** Skeleton-Loader mit Timeout (~3s) → bei Fehler "Daten konnten nicht geladen werden — [Erneut versuchen]"-Button.

#### F-11 — Bestellungen-Empty-State leer
**Wo:** `/dashboard/bestellungen`
**Was:** Nutzer ohne Bestellung sieht Titel + Subline + große leere Fläche. Kein "Du hast noch keine Bestellung. → Kurse entdecken"-CTA.
**Fix-Richtung:** Konsistent zum Dashboard-Empty-State von Übersicht ("Du hast noch keinen Kurs. Entdecke unsere Kurse" + Button).

#### F-12 — AGB-Akzeptanz implizit per Submit
**Wo:** `/register`
**Was:** "Mit der Registrierung akzeptierst du unsere AGB und die Datenschutzerklärung" als Text unter dem Button — keine explizite Checkbox.
**Warum problematisch:** DSGVO-rechtlich grenzwertig (kein aktives Opt-In). Verfahren bekannt.
**Fix-Richtung:** Pflicht-Checkbox VOR dem Button: "☐ Ich akzeptiere die AGB und die Datenschutzerklärung".

#### F-13 — DE-Sprachschalter überlappt Form-Bereiche
**Wo:** Login, Register, Profil, Bestellungen, Admin (alle Seiten)
**Was:** Floating Sprachumschalter "DE ▾" sitzt fix bottom-right und überlappt mit Form-Submit-Buttons / Inhalten bei mittlerer Viewport-Höhe.
**Fix-Richtung:** Sprachumschalter in den Footer verlagern oder zumindest mit `bottom: env(safe-area-inset-bottom)` und Z-Reihenfolge unter Modals.

---

### 🟠 MITTEL — Polish, Konsistenz, Admin-Effizienz

#### F-14 — Admin Cover-Bild / Thumbnail als URL-Text-Felder
**Wo:** `/admin/kurse/[id]` → Tab "Kurs-Info"
**Was:** `COVER-BILD URL` und `THUMBNAIL URL` sind Plain-Text-Inputs. Admin muss kennen wo Dateien liegen ("/courses/manuelle-techniken-cover.jpg"). Kein Upload, kein Preview, kein File-Picker.
**Fix-Richtung:** File-Upload-Komponente (Drag&Drop → Supabase Storage → URL automatisch befüllen). Preview-Thumbnail anzeigen.

#### F-15 — Lektions-Editor: 17 Module flach gelistet
**Wo:** `/admin/kurse/[id]` → Tab "Module & Lektionen"
**Was:** Alle Module untereinander als endlose Liste (Seite 3575px hoch). Keine Collapse/Expand, kein Drag-to-Reorder sichtbar, jede Modul-Zeile zeigt Slug + YouTube-URL inline.
**Fix-Richtung:** Accordion (Modul standardmäßig collapsed mit Lektions-Count). Drag-Handle links. YouTube-URL ausblenden bis Bearbeiten-Modus.

#### F-16 — Kursdetail-Subhead wiederholt H1
**Wo:** `/kurse/fachkurs`
**Was:** H1: "Online-Fachkurs Manuelle Techniken am Muskel- und Fasziensystem". Subhead direkt darunter: "Manuelle Arbeit am Muskel- und Fasziensystem." → fast wörtliche Wiederholung.
**Fix-Richtung:** Subhead durch Value Prop ersetzen: "17 Module, 12 Std Video, praxisorientiert — lerne palpatorische und manuelle Techniken in deinem Tempo."

#### F-17 — Login: "Passwort vergessen?" doppelt
**Wo:** `/login`
**Was:** Direkt unter Submit-Button und nochmal als zweiter Helper-Link (mit "Noch kein Konto?")
**Fix-Richtung:** Eine Stelle, idealerweise rechts neben/unter Passwort-Feld.

#### F-18 — "Bereits Teilnehmer →" auf Landing
**Wo:** `/`
**Was:** Schwacher sekundärer Link unter "Kurse ansehen"-CTA. Pfeil suggeriert nicht "zum Login" sondern "weiter unten".
**Fix-Richtung:** Klare Formulierung: "Du hast schon einen Kurs? **Hier einloggen** →"

#### F-19 — Doppelter "Admin"-Crumb
**Wo:** `/admin`, `/admin/*`
**Was:** Eyebrow "ADMIN" + H1 "Admin Dashboard" / "Kurse verwalten" / "Kunden verwalten" — "Admin" zweimal direkt untereinander.
**Fix-Richtung:** Eyebrow auf Bereichsnamen kürzen ("PLATTFORM"), oder weglassen wenn redundant.

#### F-20 — Keine Personalisierung trotz vorhandener Daten
**Wo:** Dashboard / `Willkommen zurück`
**Was:** System kennt Vornamen (zeigt im Admin "Denis Jungkind"), nutzt ihn aber nicht: "Willkommen zurück" statt "Willkommen zurück, Denis".
**Fix-Richtung:** Vornamen interpolieren — kostet nichts, fühlt sich besser an.

---

### 🟢 POLISH — Kleinkram, wenn Zeit ist

| # | Befund | Wo |
|---|---|---|
| F-21 | Footer dominiert kurze Seiten (30% Höhe auf Landing/Kurse) | Public |
| F-22 | Währungs-Dropdown wo nur EUR | Admin Kurs-Edit |
| F-23 | Course-Card auf `/kurse` hat kein Bild — gleicher Blau-Gradient wie Hero | Public |
| F-24 | "+ NEUER KURS" CTA hat anderes Blau als Primary-CTAs (Light Cyan vs Navy) | Admin |
| F-25 | Slug-Feld editierbar statt auto-generiert aus Titel | Admin Kurs-Edit |
| F-26 | Footer-USPs ("Ortsunabhängig…") gehören in Hero, nicht in Footer | Public |
| F-27 | App-Version 0.1.0 öffentlich sichtbar im Admin (kein Sicherheitsproblem, aber unprofessionell) | Admin Einstellungen |

---

## Nicht auditiert (Lücken)

- **Lektions-Player** (`/dashboard/kurse/[courseSlug]/[lessonSlug]`) — Test-Account hat keinen gekauften Kurs. **Empfehlung**: zweiten Test-Account mit Test-Enrollment anlegen, dann separat auditieren. Das ist UX-Kernstück und MUSS geprüft werden.
- **Checkout-Flow** (`/checkout/[courseId]`) — nicht ausgelöst (Produktiv-Stripe, keine Test-Transaktion erlaubt).
- **Zertifikats-Generierung & PDF-Output** — kein abgeschlossener Kurs auf Test-Account.
- **Quiz-System** — laut Feature-Flags aktiv, aber Zugang erfordert Lektions-Player-Kontext.
- **Mobile-Interaktion live** — nur Screenshots ausgewertet, keine Touch-Gesten.

---

## Design-System (was funktioniert)

**Stärken:**
- Typografie-Pairing **DM Sans + Cormorant Garamond** — bewusste editoriale Wahl, kein generisches Inter/Roboto.
- Eyebrow-Pattern (cyan, uppercase, kurze Linie) durchgehend.
- H1 mit italic-accent ("Willkommen *zurück*", "Mein *Profil*") als Branding-Element.
- Sidebar-Navigation in Dashboard & Admin sauber und reduziert.
- Empty-State auf Dashboard-Übersicht gut umgesetzt (Message + Primary CTA).

**Konsistenz-Risiken:**
- Drei verschiedene Primary-Button-Farben gesehen: Navy ("Anmelden"), Hellblau ("+ NEUER KURS"), Cyan-Akzent (Links). Nicht klar ob System oder Drift.
- Dunkelblau-Gradient-Panel wird universal eingesetzt — als Hero-Visual, Pricing-Card, Feature-Card. Verliert Distinktion.

---

## Vorgeschlagene nächste Schritte

**Phase A — Bugs fixen (1-2 Tage)**
F-01 (Header-State), F-03 (kaputter Anker), F-04 (KPI-Schrift), F-10 (Profil-Hänger), F-12 (AGB-Checkbox)

**Phase B — Conversion-Inhalte aufbauen (3-5 Tage)**
F-02 (Curriculum + Instructor + Preview), F-07 (Landing ausbauen), F-08 (Hero-Imagery), F-09 (Stats konkretisieren)

**Phase C — Admin-Effizienz (2-3 Tage)**
F-14 (Bild-Upload), F-15 (Module-Accordion), F-25 (Auto-Slug)

**Phase D — Polish (1 Tag)**
F-06 (Touch-Targets), F-13 (Sprachschalter), F-16-F-20 (Microcopy & Konsistenz)

**Phase E — Lektions-Player auditieren** — separat nach Erstellung eines Test-Enrollments.
