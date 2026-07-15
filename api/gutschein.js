// Vercel serverless function — receives Gutschein form submissions and
// sends an email to the therapist via Resend.
//
// Endpoint:  POST /api/gutschein
// Env vars:  RESEND_API_KEY  (required, set in Vercel project settings)
//
// The "From" address uses the already-verified onlinekurs subdomain.
// "Reply-To" is set to the customer so replying in the mail client
// answers the customer directly.

export const config = {
  runtime: "nodejs",
};

// Erlaubte Origins für CORS (Allowlist). Same-origin-Requests senden keinen
// Origin-Header; Cross-origin von fremden Domains wird nicht gespiegelt.
const ALLOWED_ORIGINS = [
  "https://faszienpraxis-fech.de",
  "https://www.faszienpraxis-fech.de",
  // lokale Entwicklung (optional)
  "http://localhost:3000",
];
const PRIMARY_ORIGIN = "https://faszienpraxis-fech.de";

// Einfaches In-Memory-Rate-Limiting pro IP.
// ACHTUNG: Gilt nur pro Serverless-Instanz und wird NICHT global geteilt.
// Für harten Schutz wäre ein zentraler KV-Store (z. B. Upstash/Redis) nötig.
const RATE_LIMIT_MAX = 5; // max. Anfragen ...
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // ... pro 10 Minuten je IP
const rateLimitHits = new Map(); // ip -> Array<number> (Zeitstempel in ms)

function isRateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateLimitHits.get(ip) || []).filter((t) => t > windowStart);
  hits.push(now);
  rateLimitHits.set(ip, hits);
  // Gelegentliches Aufräumen, um den Speicher zu begrenzen
  if (rateLimitHits.size > 500) {
    for (const [key, times] of rateLimitHits) {
      const fresh = times.filter((t) => t > windowStart);
      if (fresh.length === 0) rateLimitHits.delete(key);
      else rateLimitHits.set(key, fresh);
    }
  }
  return hits.length > RATE_LIMIT_MAX;
}

export default async function handler(req, res) {
  // CORS — nur erlaubte Origins zulassen (Allowlist statt Wildcard "*").
  const origin = req.headers.origin;
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : PRIMARY_ORIGIN;
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate-Limit (best-effort, pro Serverless-Instanz) anhand der Client-IP.
  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : String(fwd || ""))
    .split(",")[0]
    .trim();
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Zu viele Anfragen. Bitte in einigen Minuten erneut versuchen.",
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Mail-Service ist nicht konfiguriert (RESEND_API_KEY fehlt).",
    });
  }

  // Vercel parses JSON bodies automatically when Content-Type is application/json
  let data = req.body;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch { data = {}; }
  }
  data = data || {};

  // Honeypot — if filled, silently "succeed" but do nothing
  if (data._honey && String(data._honey).trim().length > 0) {
    return res.status(200).json({ success: true });
  }

  // Feld-Limits gegen Missbrauch/DoS — harte Obergrenzen je Feld.
  const capText = (v, max) => String(v == null ? "" : v).slice(0, max);
  data.name = capText(data.name, 500);
  data.email = capText(data.email, 500);
  data.mobil = capText(data.mobil, 500);
  data.anschrift = capText(data.anschrift, 500);
  data.city = capText(data.city, 500);
  data.dauer = capText(data.dauer, 500);
  data.versand = capText(data.versand, 500);
  data.nachricht = capText(data.nachricht, 2000);
  data.anzahl = Math.min(20, Math.max(1, parseInt(data.anzahl, 10) || 1));

  // Validation
  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  if (!name || !email) {
    return res.status(400).json({ error: "Name und E-Mail sind erforderlich." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Bitte eine gültige E-Mail-Adresse angeben." });
  }

  const subject = `Neue Gutschein-Anfrage von ${name}`;
  const html = buildHtmlEmail(data);
  const text = buildTextEmail(data);

  const requestBody = {
    from: "Fech Puls Gutschein <noreply@onlinekurs.faszienpraxis-fech.de>",
    to: ["mein-therapeut@web.de"],
    reply_to: email,
    subject,
    html,
    text,
  };

  try {
    if (typeof fetch !== "function") {
      throw new Error(
        "fetch ist nicht verfügbar. Vercel-Projekt braucht Node.js 18+ (Settings → General → Node.js Version)."
      );
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Nur den Status loggen — niemals den Antwort-Body (kann Empfängerdaten enthalten).
    console.log("[gutschein] Resend status:", r.status);

    if (!r.ok) {
      // Rohen Upstream-Text nicht an den Client geben — nur generische Meldung.
      console.error("[gutschein] Resend-Versand fehlgeschlagen, Status", r.status);
      return res.status(502).json({
        error:
          "Der Versand ist fehlgeschlagen. Bitte später erneut versuchen oder telefonisch melden.",
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    // Ausnahmetext nur serverseitig loggen (keine PII-Bodies); Client erhält Generisches.
    console.error(
      "[gutschein] Versand-Ausnahme:",
      err instanceof Error ? err.message : String(err)
    );
    return res.status(500).json({
      error:
        "Der Versand ist fehlgeschlagen. Bitte später erneut versuchen oder telefonisch melden.",
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function safe(v) {
  const s = String(v == null ? "" : v).trim();
  return s.length > 0 ? escapeHtml(s) : "<span style='color:#94a3b8'>—</span>";
}

function buildHtmlEmail(d) {
  const row = (label, value) => `
    <tr>
      <td style="padding:12px 18px;background:#f5faff;border-bottom:1px solid #e3f2fd;font-weight:500;color:#0a2540;width:200px;vertical-align:top;font-size:13px;letter-spacing:.04em">${label}</td>
      <td style="padding:12px 18px;border-bottom:1px solid #e3f2fd;color:#1a2e45;font-size:14px;line-height:1.5">${value}</td>
    </tr>`;

  const dauerLabel = d.dauer === "45min-100"
    ? "45 Minuten — 100 €"
    : d.dauer === "30min-80"
      ? "30 Minuten — 80 €"
      : safe(d.dauer);

  const nachrichtHtml = d.nachricht && String(d.nachricht).trim().length > 0
    ? escapeHtml(d.nachricht).replace(/\n/g, "<br>")
    : "<span style='color:#94a3b8'>—</span>";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Neue Gutschein-Anfrage</title>
</head>
<body style="margin:0;padding:0;background:#f5faff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a2e45">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px">

    <div style="background:#0a2540;padding:32px 32px 24px;border-top:3px solid #0496ff">
      <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#90caf9;margin-bottom:12px">
        Fech Puls · Spaichingen
      </div>
      <h1 style="font-family:Georgia,'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:#ffffff;margin:0;line-height:1.2">
        Neue Gutschein-Anfrage
      </h1>
      <p style="color:rgba(227,242,253,.65);font-size:14px;margin:8px 0 0">
        Von <strong style="color:#90caf9">${safe(d.name)}</strong>
      </p>
    </div>

    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ffffff;border-collapse:collapse">
      ${row("Name", safe(d.name))}
      ${row("E-Mail", `<a href="mailto:${escapeHtml(d.email || "")}" style="color:#0496ff;text-decoration:none">${safe(d.email)}</a>`)}
      ${row("Mobil", d.mobil ? `<a href="tel:${escapeHtml(String(d.mobil).replace(/\s/g, ""))}" style="color:#0496ff;text-decoration:none">${safe(d.mobil)}</a>` : "<span style='color:#94a3b8'>—</span>")}
      ${row("Anschrift", safe(d.anschrift))}
      ${row("Ort / PLZ", safe(d.city))}
      ${row("Behandlungsdauer", dauerLabel)}
      ${row("Versand / Abholung", safe(d.versand))}
      ${row("Anzahl Gutscheine", safe(d.anzahl))}
      ${row("Nachricht", nachrichtHtml)}
    </table>

    <div style="background:#ffffff;border-top:1px solid #e3f2fd;padding:20px 24px;color:#5a7a99;font-size:12px;line-height:1.6">
      <strong style="color:#0a2540">Antworten</strong> — klicke einfach auf "Antworten" in deinem Mail-Programm,
      die Antwort geht direkt an den Kunden (<a href="mailto:${escapeHtml(d.email || "")}" style="color:#0496ff;text-decoration:none">${safe(d.email)}</a>).
    </div>

    <p style="text-align:center;color:#94a3b8;font-size:11px;margin:24px 0 0;letter-spacing:.08em;text-transform:uppercase">
      Automatisch gesendet · faszienpraxis-fech.de
    </p>
  </div>
</body>
</html>`;
}

function buildTextEmail(d) {
  const lines = [
    `Neue Gutschein-Anfrage — Fech Puls Spaichingen`,
    `==========================================`,
    ``,
    `Name:               ${d.name || "—"}`,
    `E-Mail:             ${d.email || "—"}`,
    `Mobil:              ${d.mobil || "—"}`,
    `Anschrift:          ${d.anschrift || "—"}`,
    `Ort / PLZ:          ${d.city || "—"}`,
    `Behandlungsdauer:   ${d.dauer === "45min-100" ? "45 Min — 100 €" : d.dauer === "30min-80" ? "30 Min — 80 €" : (d.dauer || "—")}`,
    `Versand:            ${d.versand || "—"}`,
    `Anzahl:             ${d.anzahl || "—"}`,
    ``,
    `Nachricht:`,
    `${d.nachricht || "—"}`,
    ``,
    `Auf "Antworten" klicken → Antwort geht direkt an den Kunden.`,
  ];
  return lines.join("\n");
}
