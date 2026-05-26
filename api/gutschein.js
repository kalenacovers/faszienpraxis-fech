// Vercel serverless function — receives Gutschein form submissions and
// sends an email to the therapist via Resend.
//
// Endpoint:  POST /api/gutschein
// Env vars:  RESEND_API_KEY  (required, set in Vercel project settings)
//
// The "From" address uses the already-verified onlinekurs subdomain.
// "Reply-To" is set to the customer so replying in the mail client
// answers the customer directly.

export default async function handler(req, res) {
  // CORS — same-origin in production, but allows easier local testing
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Fech Puls Gutschein <noreply@onlinekurs.faszienpraxis-fech.de>",
        to: ["mein-therapeut@web.de"],
        reply_to: email,
        subject,
        html,
        text,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({
        error: "Mail-Versand fehlgeschlagen.",
        detail: detail.slice(0, 300),
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({
      error: "Netzwerkfehler beim Mail-Versand.",
      detail: err instanceof Error ? err.message : String(err),
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
