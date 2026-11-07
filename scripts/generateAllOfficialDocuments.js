const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PDF_PREVIEWS_DIR = path.resolve(__dirname, '../pdf-previews');
const VISA_DOCS_DIR = path.resolve(__dirname, '../visa_documents_pdf');
const TMP_HTML_DIR = '/tmp/doc_htmls';

if (!fs.existsSync(TMP_HTML_DIR)) {
  fs.mkdirSync(TMP_HTML_DIR, { recursive: true });
}

// ── BRAND LOGO SVGS / DATA URIS ──────────────────────────────────────────────

const EMIRATES_LOGO = `<div style="display:flex;align-items:center;gap:12px;">
  <div style="background:#D71921;padding:6px 14px;border-radius:4px;box-shadow:0 2px 6px rgba(215,25,33,0.3);">
    <span style="font-family:'Times New Roman',serif;font-size:22px;font-weight:900;color:#FFFFFF;letter-spacing:1px;font-style:italic;">Emirates</span>
  </div>
  <div>
    <div style="font-size:9.5px;font-weight:800;color:#D71921;letter-spacing:1.5px;">EMIRATES • SKYWARDS GLOBAL PARTNER</div>
    <div style="font-size:8px;color:#64748B;">Operating Carrier HQ: Emirates Group HQ, Dubai, UAE</div>
  </div>
</div>`;

const QATAR_LOGO = `<div style="display:flex;align-items:center;gap:11px;">
  <svg width="44" height="44" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="26" fill="#5C0632" stroke="#C5A059" stroke-width="1.6"/>
    <path d="M18 40C21 33 26 29 35 27L39 22L33 24C26 19 20 12 16 9C19 16 23 22 28 26C21 29 17 34 15 40H18Z" fill="#FFFFFF"/>
    <path d="M23 10C26 16 29 21 34 25" stroke="#E2C385" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#5C0632;letter-spacing:2px;line-height:1.05;">QATAR AIRWAYS</div>
    <div style="font-size:9.5px;font-weight:800;color:#8A1538;margin-top:2px;letter-spacing:1px;">QATAR AIRWAYS • DOHA • ONEWORLD</div>
  </div>
</div>`;

const EGYPTAIR_LOGO = `<div style="display:flex;align-items:center;gap:11px;">
  <svg width="46" height="46" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="26" fill="#002855" stroke="#B4975A" stroke-width="2"/>
    <circle cx="34" cy="17" r="4.5" fill="#B4975A"/>
    <path d="M12 36C20 35 28 30 42 19C38 28 31 35 18 40L12 36Z" fill="#FFFFFF"/>
    <path d="M15 42C24 41 33 36 44 26" stroke="#B4975A" stroke-width="2.2" stroke-linecap="round"/>
  </svg>
  <div>
    <div style="font-size:18px;font-weight:900;color:#002855;letter-spacing:2px;line-height:1.05;">EGYPTAIR</div>
    <div style="font-size:9px;font-weight:800;color:#9A7B38;margin-top:2px;letter-spacing:1px;">EGYPTAIR • STAR ALLIANCE MEMBER</div>
  </div>
</div>`;

const ALLIANZ_LOGO = `<div style="display:flex;align-items:center;gap:12px;">
  <svg width="46" height="46" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="28" fill="#003781"/>
    <circle cx="30" cy="30" r="22" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>
    <rect x="19" y="20" width="5" height="20" rx="1" fill="#FFFFFF"/>
    <rect x="27.5" y="16" width="5" height="24" rx="1" fill="#FFFFFF"/>
    <rect x="36" y="20" width="5" height="20" rx="1" fill="#FFFFFF"/>
  </svg>
  <div>
    <div style="font-size:18px;font-weight:900;color:#003781;letter-spacing:0.5px;">Allianz Partners</div>
    <div style="font-size:9px;font-weight:700;color:#475569;letter-spacing:1.2px;text-transform:uppercase;">ALLIANZ GLOBAL ASSISTANCE • AWP P&amp;C S.A.</div>
  </div>
</div>`;

const AXA_LOGO = `<div style="display:flex;align-items:center;gap:12px;">
  <svg width="46" height="46" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="60" rx="4" fill="#00008F"/>
    <line x1="34" y1="60" x2="60" y2="22" stroke="#FF1721" stroke-width="5.5"/>
    <text x="8" y="41" fill="#FFFFFF" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-style="italic" font-size="21">AXA</text>
  </svg>
  <div>
    <div style="font-size:17px;font-weight:900;color:#00008F;letter-spacing:0.6px;">AXA SCHENGEN</div>
    <div style="font-size:9px;font-weight:700;color:#475569;letter-spacing:1.2px;text-transform:uppercase;">INTER PARTNER ASSISTANCE S.A. • BRUSSELS</div>
  </div>
</div>`;

const FOUR_SEASONS_LOGO = `<div style="display:flex;align-items:center;gap:12px;">
  <svg width="46" height="46" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#111827" stroke="#B5945B" stroke-width="2"/>
    <path d="M32 12V52M22 24L32 16L42 24M20 34L32 24L44 34M18 44L32 32L46 44" stroke="#B5945B" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:700;letter-spacing:2.5px;color:#111827;">FOUR SEASONS</div>
    <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">HOTELS AND RESORTS • PALACE COLLECTION</div>
  </div>
</div>`;

const INTERCONTINENTAL_LOGO = `<div style="display:flex;align-items:center;gap:12px;">
  <svg width="46" height="46" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#1E293B" stroke="#D4AF37" stroke-width="2"/>
    <circle cx="32" cy="32" r="22" stroke="#D4AF37" stroke-width="1"/>
    <text x="32" y="39" text-anchor="middle" fill="#D4AF37" font-family="Georgia,serif" font-size="22" font-weight="bold">I</text>
  </svg>
  <div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.2px;color:#1E293B;">INTERCONTINENTAL</div>
    <div style="font-size:8.5px;letter-spacing:2px;color:#9A7B2C;font-weight:700;text-transform:uppercase;margin-top:2px;">HOTELS &amp; RESORTS • IHG LUXURY</div>
  </div>
</div>`;

const LUXURY_COLLECTION_LOGO = `<div style="display:flex;align-items:center;gap:12px;">
  <svg width="46" height="46" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="32" rx="30" ry="26" fill="#0A192F" stroke="#C5A059" stroke-width="2"/>
    <path d="M22 20L27 14L32 18L37 14L42 20H22Z" fill="#C5A059"/>
    <text x="32" y="38" text-anchor="middle" fill="#E5C887" font-family="Georgia,serif" font-size="14" font-weight="bold">LC</text>
  </svg>
  <div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.2px;color:#0A192F;">THE LUXURY COLLECTION</div>
    <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">HOTEL GRANDE BRETAGNE • ATHENS</div>
  </div>
</div>`;

const CANAVES_OIA_LOGO = `<div style="display:flex;align-items:center;gap:12px;">
  <svg width="46" height="46" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#002B49" stroke="#D4AF37" stroke-width="2"/>
    <circle cx="32" cy="32" r="22" stroke="#D4AF37" stroke-width="1" stroke-dasharray="3 2"/>
    <path d="M22 34C26 28 38 28 42 34" stroke="#D4AF37" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="24" r="5" fill="#D4AF37"/>
  </svg>
  <div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2px;color:#002B49;">CANAVES OIA LUXURY</div>
    <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">AEGEAN &amp; CYCLADIC PALACE RESORTS • SANTORINI</div>
  </div>
</div>`;

const KEMPINSKI_LOGO = `<div style="display:flex;align-items:center;gap:12px;">
  <svg width="46" height="46" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="56" height="56" rx="8" fill="#101924" stroke="#C5A059" stroke-width="2"/>
    <path d="M20 22H44M20 32H38M20 42H44" stroke="#C5A059" stroke-width="2" stroke-linecap="round"/>
    <path d="M32 16L34 20H30L32 16Z" fill="#C5A059"/>
  </svg>
  <div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;letter-spacing:2.4px;color:#101924;">KEMPINSKI HOTELS</div>
    <div style="font-size:8.5px;letter-spacing:2px;color:#8C6D2F;font-weight:700;text-transform:uppercase;margin-top:2px;">ÇIRAĞAN PALACE KEMPINSKI • ISTANBUL</div>
  </div>
</div>`;

const BOMBARDIER_BADGE = `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:5px 10px;display:flex;align-items:center;gap:8px;">
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
    <path d="M4 18L16 8L28 18L22 19L16 13L10 19L4 18Z" fill="#D4AF37"/>
    <path d="M8 22L16 16L24 22L20 23L16 19.5L12 23L8 22Z" fill="#F5D77F"/>
  </svg>
  <div style="font-family:'Arial',sans-serif;font-size:12px;font-weight:900;letter-spacing:1.5px;color:#D4AF37;">BOMBARDIER AEROSPACE</div>
</div>`;

const BENETTI_BADGE = `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:5px 10px;display:flex;align-items:center;gap:8px;">
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
    <path d="M7 11H25V14H7V11ZM10 17H22V20H10V17ZM13 23H19V25H13V23Z" fill="#D4AF37"/>
    <polygon points="16,6 18,10 14,10" fill="#D4AF37"/>
  </svg>
  <div style="font-family:Georgia,serif;font-size:12px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;">BENETTI YACHTS</div>
</div>`;

const MAYBACH_BADGE = `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:5px 10px;display:flex;align-items:center;gap:8px;">
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
    <path d="M7 22L13 10L16 16L19 10L25 22M11 22L16 13L21 22" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/>
  </svg>
  <div style="font-family:'Arial',sans-serif;font-size:12px;font-weight:900;letter-spacing:1.5px;color:#D4AF37;">MERCEDES-MAYBACH</div>
</div>`;

const VANIR_SEAL_SVG = `<svg width="48" height="48" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="27" cy="27" r="26" fill="#0C0A09" stroke="#D4AF37" stroke-width="2"/>
  <circle cx="27" cy="27" r="22" stroke="#D4AF37" stroke-width="0.8" stroke-dasharray="2 2"/>
  <path d="M16 20L27 12L38 20V34L27 42L16 34V20Z" stroke="#D4AF37" stroke-width="1.6" fill="none"/>
  <text x="27" y="31" text-anchor="middle" fill="#F5D77F" font-family="Georgia,serif" font-size="14" font-weight="bold">V</text>
</svg>`;

const IATA_BADGE = `<div style="display:flex;align-items:center;gap:6px;background:#F1F5F9;border:1px solid #CBD5E1;border-radius:3px;padding:4px 8px;">
  <span style="font-size:11px;font-weight:900;color:#0F172A;letter-spacing:1px;font-family:Arial,sans-serif;">IATA</span>
  <span style="font-size:8.5px;font-weight:800;color:#475569;">BSP ACCREDITED</span>
</div>`;

const QR_CODE_SVG = `<svg width="78" height="78" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="25" height="25" fill="#FFFFFF"/>
  <rect x="2" y="2" width="7" height="7" fill="#0F172A"/>
  <rect x="3" y="3" width="5" height="5" fill="#FFFFFF"/>
  <rect x="4" y="4" width="3" height="3" fill="#0F172A"/>
  <rect x="16" y="2" width="7" height="7" fill="#0F172A"/>
  <rect x="17" y="3" width="5" height="5" fill="#FFFFFF"/>
  <rect x="18" y="4" width="3" height="3" fill="#0F172A"/>
  <rect x="2" y="16" width="7" height="7" fill="#0F172A"/>
  <rect x="3" y="17" width="5" height="5" fill="#FFFFFF"/>
  <rect x="4" y="18" width="3" height="3" fill="#0F172A"/>
  <rect x="11" y="2" width="2" height="5" fill="#0F172A"/>
  <rect x="11" y="9" width="3" height="7" fill="#0F172A"/>
  <rect x="16" y="11" width="7" height="2" fill="#0F172A"/>
  <rect x="11" y="18" width="5" height="5" fill="#0F172A"/>
  <rect x="18" y="18" width="5" height="5" fill="#0F172A"/>
</svg>`;

const BARCODE_SVG = `<svg width="220" height="36" viewBox="0 0 220 36" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="36" fill="#FFFFFF"/>
  <g fill="#0F172A">
    <rect x="2" y="2" width="3" height="32"/>
    <rect x="8" y="2" width="2" height="32"/>
    <rect x="13" y="2" width="4" height="32"/>
    <rect x="20" y="2" width="2" height="32"/>
    <rect x="25" y="2" width="5" height="32"/>
    <rect x="33" y="2" width="2" height="32"/>
    <rect x="38" y="2" width="4" height="32"/>
    <rect x="45" y="2" width="3" height="32"/>
    <rect x="51" y="2" width="2" height="32"/>
    <rect x="56" y="2" width="5" height="32"/>
    <rect x="64" y="2" width="2" height="32"/>
    <rect x="69" y="2" width="4" height="32"/>
    <rect x="76" y="2" width="3" height="32"/>
    <rect x="82" y="2" width="5" height="32"/>
    <rect x="90" y="2" width="2" height="32"/>
    <rect x="95" y="2" width="4" height="32"/>
    <rect x="102" y="2" width="2" height="32"/>
    <rect x="107" y="2" width="5" height="32"/>
    <rect x="115" y="2" width="3" height="32"/>
    <rect x="121" y="2" width="2" height="32"/>
    <rect x="126" y="2" width="4" height="32"/>
    <rect x="133" y="2" width="3" height="32"/>
    <rect x="139" y="2" width="5" height="32"/>
    <rect x="147" y="2" width="2" height="32"/>
    <rect x="152" y="2" width="4" height="32"/>
    <rect x="159" y="2" width="3" height="32"/>
    <rect x="165" y="2" width="2" height="32"/>
    <rect x="170" y="2" width="5" height="32"/>
    <rect x="178" y="2" width="2" height="32"/>
    <rect x="183" y="2" width="4" height="32"/>
    <rect x="190" y="2" width="3" height="32"/>
    <rect x="196" y="2" width="5" height="32"/>
    <rect x="204" y="2" width="2" height="32"/>
    <rect x="209" y="2" width="4" height="32"/>
    <rect x="216" y="2" width="2" height="32"/>
  </g>
</svg>`;

const STAMP_BOX = (title, ref, color = '#1D4ED8') => `
<div style="border:2px dashed ${color};border-radius:6px;padding:6px 12px;display:inline-block;text-align:center;">
  <div style="font-size:9.5px;font-weight:900;color:${color};letter-spacing:1px;text-transform:uppercase;">${title}</div>
  <div style="font-family:'Brush Script MT','Snell Roundhand',cursive;font-size:18px;color:${color};margin:2px 0;">M. Laurent-Dubois</div>
  <div style="font-family:'Courier New',monospace;font-size:8.5px;font-weight:700;color:${color};">VERIFIED • ${ref}</div>
</div>`;

// ── SHARED A4 HTML TEMPLATE WRAPPER ──────────────────────────────────────────

function buildA4Html({ title, topBarColor = '#1C1917', brandLogoHtml, rightHeaderHtml, contentHtml, footerRef }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body {
      margin: 0; padding: 0; background: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
    }
    .page {
      width: 794px; min-height: 1122px; padding: 36px 42px 30px; margin: 0 auto;
      display: flex; flex-direction: column; justify-content: space-between;
      position: relative; background: #FFFFFF;
    }
    .top-strip { height: 8px; background: ${topBarColor}; margin: -36px -42px 24px; }
    .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${topBarColor}; padding-bottom: 14px; margin-bottom: 18px; }
    .sec-bar { background: #0F172A; color: #FFFFFF; padding: 6px 12px; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-top: 14px; border-radius: 3px 3px 0 0; }
    .tbl { width: 100%; border-collapse: collapse; margin-bottom: 14px; border: 1px solid #CBD5E1; }
    .tbl th { background: #F1F5F9; color: #334155; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; padding: 7px 10px; text-align: left; border-bottom: 1px solid #CBD5E1; border-right: 1px solid #E2E8F0; }
    .tbl td { padding: 8px 10px; font-size: 11px; font-weight: 600; color: #0F172A; border-bottom: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; vertical-align: top; }
    .mono { font-family: 'Courier New', Courier, monospace; font-weight: 800; }
    .badge-ok { display: inline-block; background: #DCFCE7; color: #166534; border: 1px solid #86EFAC; font-size: 9px; font-weight: 900; padding: 2px 7px; border-radius: 3px; letter-spacing: 0.5px; }
    .ftr { display: flex; justify-content: space-between; align-items: center; border-top: 1.5px solid #0F172A; padding-top: 12px; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="page">
    <div>
      <div class="top-strip"></div>
      <div class="hdr">
        ${brandLogoHtml}
        ${rightHeaderHtml}
      </div>
      ${contentHtml}
    </div>
    <div class="ftr">
      <div>
        ${BARCODE_SVG}
        <div style="font-size:8px;color:#64748B;margin-top:2px;">Official Verification Code: ${footerRef} • IATA &amp; Consular Registry</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="text-align:right;font-size:8.5px;color:#334155;">
          <strong>DIGITAL CONSULAR VERIFICATION</strong><br/>
          Scan to verify credentials on<br/>
          <span class="mono">vanirgroup.com/verify/doc</span>
        </div>
        <div style="padding:3px;border:1px solid #CBD5E1;border-radius:4px;">${QR_CODE_SVG}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── DOCUMENT SPECIFICATIONS ──────────────────────────────────────────────────

const DOCUMENTS = [
  // 1. Emirates Flight Ticket
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '01_Emirates_IATA_Flight_Ticket.pdf'),
    title: 'Emirates Airline Official E-Ticket',
    topBarColor: '#D71921',
    brandLogoHtml: EMIRATES_LOGO,
    rightHeaderHtml: `<div style="text-align:right;">
      ${IATA_BADGE}
      <div style="font-size:16px;font-weight:900;color:#0F172A;margin-top:4px;">PNR: <span class="mono">EK92VR</span></div>
      <div style="font-size:9.5px;color:#475569;">E-Ticket: <span class="mono">176-4829103847</span></div>
    </div>`,
    footerRef: 'EK92VR-1764829103847',
    contentHtml: `
      <div class="sec-bar" style="background:#D71921;"><span>1. PASSENGER &amp; TICKET RECORD</span><span>CONFIRMED • FIRST CLASS</span></div>
      <table class="tbl">
        <thead><tr><th>PASSENGER NAME</th><th>PASSPORT NO.</th><th>NATIONALITY</th><th>SEAT ASSIGNMENT</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">ROSHDI / AHMED MR</td><td class="mono">A30948271</td><td>EGYPTIAN</td><td class="mono">01A (PRIVATE SUITE)</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. FLIGHT ITINERARY &amp; CARRIER SCHEDULE</span><span>BOEING 777-300ER</span></div>
      <table class="tbl">
        <thead><tr><th>FLIGHT</th><th>DEPARTURE</th><th>ARRIVAL</th><th>CABIN CLASS</th><th>BAGGAGE</th></tr></thead>
        <tbody>
          <tr>
            <td class="mono" style="color:#D71921;font-size:12px;">EK 924</td>
            <td><strong>CAI</strong> — Cairo Intl (T2)<br/><span class="mono">15 Nov 2026 • 19:45</span></td>
            <td><strong>DXB</strong> — Dubai Intl (T3)<br/><span class="mono">16 Nov 2026 • 00:15 (+1)</span></td>
            <td><strong>First Class Suite (VIP)</strong></td>
            <td>2 x 32 KG + 12 KG Cabin</td>
          </tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>FARE &amp; PAYMENT DETAILS:</strong> Base Fare USD 3,850.00 • Taxes USD 420.00 • Total Paid USD 4,270.00 (VISA INFINITE •••• 4242). IATA Resolution 722f compliant.
        </div>
        <div style="text-align:right;">${STAMP_BOX('EMIRATES VALIDATING CARRIER', 'EK92VR', '#D71921')}</div>
      </div>
    `
  },

  // 2. Allianz Travel Insurance Policy
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '02_Allianz_Travel_Insurance_Policy.pdf'),
    title: 'Allianz Global Assistance Travel Policy',
    topBarColor: '#003781',
    brandLogoHtml: ALLIANZ_LOGO,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="background:#003781;color:#FFFFFF;font-size:9px;font-weight:900;padding:4px 8px;border-radius:3px;">SCHENGEN &amp; WORLDWIDE VISA COMPLIANT</div>
      <div style="font-size:15px;font-weight:900;color:#0F172A;margin-top:4px;">POLICY: <span class="mono">ALZ-SCH-774920</span></div>
      <div style="font-size:9px;color:#475569;">Coverage: <strong>EUR 50,000 (ZERO DEDUCTIBLE)</strong></div>
    </div>`,
    footerRef: 'ALZ-SCH-774920-AWP',
    contentHtml: `
      <div class="sec-bar" style="background:#003781;"><span>1. INSURED TRAVELER PARTICULARS</span><span>INDIVIDUAL WORLDWIDE PLAN</span></div>
      <table class="tbl">
        <thead><tr><th>POLICYHOLDER NAME</th><th>PASSPORT NUMBER</th><th>NATIONALITY</th><th>DATE OF BIRTH</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">AHMED ROSHDI</td><td class="mono">A30948271</td><td>EGYPTIAN</td><td class="mono">14 MAY 1990</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. COVERAGE SCHEDULE &amp; MEDICAL LIMITS</span><span>REGULATION (EC) NO 810/2009</span></div>
      <table class="tbl">
        <thead><tr><th>BENEFIT DESCRIPTION</th><th>MAXIMUM COVERAGE</th><th>EXCESS / DEDUCTIBLE</th></tr></thead>
        <tbody>
          <tr><td><strong>Emergency Medical Treatment &amp; Hospitalization</strong></td><td class="mono">EUR 50,000 / USD 55,000</td><td class="mono" style="color:#166534;">NIL (€0.00)</td></tr>
          <tr><td><strong>Emergency Medical Evacuation &amp; Air Ambulance</strong></td><td class="mono">100% ACTUAL COST</td><td class="mono" style="color:#166534;">NIL (€0.00)</td></tr>
          <tr><td><strong>Repatriation of Mortal Remains</strong></td><td class="mono">100% ACTUAL COST</td><td class="mono" style="color:#166534;">NIL (€0.00)</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>24/7 ALARM CENTER HOTLINE:</strong> +49 89 62424 460 / +44 20 8603 9853.<br/>Claims Portal: https://www.allianz-assistance.com
        </div>
        <div style="text-align:right;">${STAMP_BOX('ALLIANZ ASSISTANCE ACTUARY', 'ALZ-774920', '#003781')}</div>
      </div>
    `
  },

  // 3. Four Seasons Hotel Voucher
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '03_Four_Seasons_Hotel_Voucher.pdf'),
    title: 'Four Seasons Resort Hotel Voucher',
    topBarColor: '#111827',
    brandLogoHtml: FOUR_SEASONS_LOGO,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">CRS CONFIRMATION</div>
      <div class="mono" style="font-size:16px;color:#111827;font-weight:900;">FS-DXB-559104</div>
      <div style="margin-top:3px;"><span class="badge-ok">GUARANTEED &amp; PREPAID</span></div>
    </div>`,
    footerRef: 'FS-DXB-559104-CENTRAL',
    contentHtml: `
      <div class="sec-bar" style="background:#111827;"><span>1. GUEST ACCOMMODATION RECORD</span><span>CONFIRMED RESERVATION</span></div>
      <table class="tbl">
        <thead><tr><th>PRIMARY GUEST</th><th>PASSPORT NO.</th><th>CHECK-IN</th><th>CHECK-OUT</th><th>NIGHTS</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">AHMED ROSHDI</td><td class="mono">A30948271</td><td class="mono">15 Nov 2026</td><td class="mono">20 Nov 2026</td><td class="mono">5 NIGHTS</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. PROPERTY &amp; SUITE SPECIFICATIONS</span><span>FOUR SEASONS RESORT JUMEIRAH</span></div>
      <table class="tbl">
        <tbody>
          <tr><th style="width:30%;">PROPERTY</th><td><strong>Four Seasons Resort Dubai at Jumeirah Beach</strong></td></tr>
          <tr><th>ADDRESS</th><td>Jumeirah Beach Road, Jumeirah 2, Dubai, United Arab Emirates</td></tr>
          <tr><th>ROOM CATEGORY</th><td><strong>Royal Sea-View Presidential Suite (Club Lounge Included)</strong></td></tr>
          <tr><th>INCLUSIONS</th><td>Daily Gourmet Breakfast, High-Speed Wi-Fi, Airport Chauffeur Protocol</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>BILLING SUMMARY:</strong> Total Tariff USD 8,450.00 Paid in Full via MASTERCARD WORLD ELITE •••• 8891.
        </div>
        <div style="text-align:right;">${STAMP_BOX('FOUR SEASONS FRONT DESK', 'FS-559104', '#111827')}</div>
      </div>
    `
  },

  // 4. Corporate HR NOC Certificate
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '04_Corporate_HR_NOC_Certificate.pdf'),
    title: 'Corporate HR Employment NOC Certificate',
    topBarColor: '#1E3A8A',
    brandLogoHtml: `<div style="display:flex;align-items:center;gap:12px;">
      <div style="width:48px;height:48px;border-radius:6px;background:#1E3A8A;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;border:2px solid #93C5FD;">NS</div>
      <div>
        <div style="font-size:17px;font-weight:bold;color:#0F172A;letter-spacing:0.8px;">NILE SOVEREIGN HOLDINGS GROUP S.A.E.</div>
        <div style="font-size:9px;color:#475569;letter-spacing:1px;text-transform:uppercase;">HUMAN RESOURCES &amp; EXECUTIVE AFFAIRS DEPARTMENT</div>
      </div>
    </div>`,
    rightHeaderHtml: `<div style="text-align:right;font-size:9.5px;color:#334155;line-height:1.4;">
      <div><strong>Ref No:</strong> <span class="mono">HR-NOC-2026-819</span></div>
      <div><strong>Date:</strong> 28 Oct 2026</div>
      <div><strong>Contact:</strong> +20 2 2795 4400</div>
    </div>`,
    footerRef: 'HR-NOC-2026-819-NILE',
    contentHtml: `
      <div style="margin:16px 0 12px;font-size:12px;">
        <strong>TO: THE VISA &amp; CONSULAR SECTION — CONSULATE GENERAL OF FRANCE</strong>
      </div>
      <div style="text-align:center;margin:14px 0;text-decoration:underline;font-size:14px;font-weight:bold;color:#0F172A;">
        SUBJECT: EMPLOYMENT, SALARY &amp; NO OBJECTION CERTIFICATE (NOC)
      </div>
      <div style="font-size:12px;line-height:1.75;text-align:justify;color:#1E293B;">
        <p>Dear Honorable Consular Officer,</p>
        <p>This is to officially certify that <strong>AHMED ROSHDI</strong>, holding Passport Number <strong>A30948271</strong>, is a full-time permanent executive of <strong>Nile Sovereign Holdings Group S.A.E.</strong> since <strong>01 March 2019</strong>, currently serving as <strong>Chief Executive Officer &amp; Managing Partner</strong>.</p>
        <p>We confirm his compensation details and approved leave schedule for scheduled international travel:</p>
      </div>
      <table class="tbl" style="margin:14px 0;">
        <tbody>
          <tr><th style="width:36%;">EMPLOYEE NAME</th><td class="mono">AHMED ROSHDI</td></tr>
          <tr><th>DESIGNATION</th><td><strong>Chief Executive Officer &amp; Managing Partner</strong></td></tr>
          <tr><th>MONTHLY REMUNERATION</th><td class="mono">USD 12,500 (Paid Monthly via Bank Wire)</td></tr>
          <tr><th>APPROVED LEAVE DATES</th><td>15 Nov 2026 → 30 Nov 2026 (Full Position Guaranteed)</td></tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16px;">
        <div style="font-size:10px;color:#475569;">
          <strong>Dr. Tarek El-Mansoury</strong><br/>
          Director of Human Resources &amp; Corporate Affairs<br/>
          hr.verification@nilesovereign.com
        </div>
        <div>${STAMP_BOX('NILE SOVEREIGN CORPORATE SEAL', 'NOC-819', '#1E3A8A')}</div>
      </div>
    `
  },

  // 5. Bombardier Private Jet Manifest
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '05_Bombardier_Private_Jet_Manifest.pdf'),
    title: 'Bombardier Executive Private Jet Manifest',
    topBarColor: '#1C1917',
    brandLogoHtml: `<div style="display:flex;align-items:center;gap:12px;">
      ${VANIR_SEAL_SVG}
      ${BOMBARDIER_BADGE}
    </div>`,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">CHARTER MANIFEST NO.</div>
      <div class="mono" style="font-size:15px;color:#1C1917;font-weight:900;">VNR-JET-7500X</div>
      <div style="margin-top:3px;"><span class="badge-ok">CONFIRMED &amp; ISSUED</span></div>
    </div>`,
    footerRef: 'VNR-JET-7500X-BOMBARDIER',
    contentHtml: `
      <div class="sec-bar" style="background:#1C1917;"><span>1. PRINCIPAL VIP CHARTER PASSENGER</span><span>PRIVATE FBO MANIFEST</span></div>
      <table class="tbl">
        <thead><tr><th>PRINCIPAL PASSENGER</th><th>PASSPORT / ID</th><th>CONTACT</th><th>PASSENGERS</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">AHMED ROSHDI</td><td class="mono">A30948271</td><td>+20 100 555 8899</td><td class="mono">6 PAX</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. RESERVED AIRCRAFT &amp; FLIGHT PLAN</span><span>BOMBARDIER AEROSPACE</span></div>
      <table class="tbl">
        <tbody>
          <tr><th style="width:30%;">RESERVED AIRCRAFT</th><td><strong>Bombardier Global 7500 (Tail Reg: VP-VNR)</strong></td></tr>
          <tr><th>OPERATIONAL SPECS</th><td>Range: 7,700 NM Non-Stop • Speed: Mach 0.925 • Ceiling: 51,000 ft</td></tr>
          <tr><th>SECTOR</th><td>Cairo Intl VIP FBO Terminal (HECA/CAI) → Geneva Executive Terminal (LSGG/GVA)</td></tr>
          <tr><th>SCHEDULE</th><td class="mono">18 Nov 2026 → 25 Nov 2026</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>CHARTER FEE RECEIPT:</strong> Total Contracted Fee USD 48,500.00 (All Taxes &amp; Handling Included). Paid via VIP CORPORATE IBAN WIRE.
        </div>
        <div style="text-align:right;">${STAMP_BOX('VIP FBO FLIGHT OPS RAMP CLEARED', 'VP-VNR', '#1C1917')}</div>
      </div>
    `
  },

  // 6. Superyacht Maritime Charter Agreement
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '06_Superyacht_Maritime_Charter_Agreement.pdf'),
    title: 'Superyacht Maritime Charter Agreement',
    topBarColor: '#0C4A6E',
    brandLogoHtml: `<div style="display:flex;align-items:center;gap:12px;">
      ${VANIR_SEAL_SVG}
      ${BENETTI_BADGE}
    </div>`,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">MARITIME CHARTER NO.</div>
      <div class="mono" style="font-size:15px;color:#0C4A6E;font-weight:900;">VNR-MAR-9921</div>
      <div style="margin-top:3px;"><span class="badge-ok">CONFIRMED &amp; ISSUED</span></div>
    </div>`,
    footerRef: 'VNR-MAR-9921-BENETTI',
    contentHtml: `
      <div class="sec-bar" style="background:#0C4A6E;"><span>1. CHARTERER PARTICULARS</span><span>MYBA MARITIME AGREEMENT</span></div>
      <table class="tbl">
        <thead><tr><th>CHARTERER FULL NAME</th><th>PASSPORT / ID</th><th>CONTACT</th><th>GUESTS ONBOARD</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">AHMED ROSHDI</td><td class="mono">P-VERIFIED</td><td>+20 100 555 8899</td><td class="mono">12 PAX</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. RESERVED LUXURY VESSEL &amp; BERTH</span><span>BENETTI YACHTS ITALY</span></div>
      <table class="tbl">
        <tbody>
          <tr><th style="width:30%;">RESERVED VESSEL</th><td><strong>M/Y AZURE SOVEREIGN — 72m Benetti Superyacht</strong></td></tr>
          <tr><th>BERTH / EMBARKATION</th><td>Dubai Harbour VIP Superyacht Marina — Berth A-01</td></tr>
          <tr><th>CRUISING AREA</th><td>World Islands &amp; Palm Jumeirah Private Anchorage</td></tr>
          <tr><th>CREW COMPLEMENT</th><td>Full-Day Royal Sunset Charter (18 Professional Crew &amp; Michelin Chef)</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>CHARTER FEE RECEIPT:</strong> Total Charter Fee USD 16,500.00 Paid in Full via AMEX CENTURION •••• 1008.
        </div>
        <div style="text-align:right;">${STAMP_BOX('ROYAL MARITIME HARBOR CLEARANCE', 'VNR-9921', '#0C4A6E')}</div>
      </div>
    `
  },

  // 7. Mercedes-Maybach Chauffeur Contract
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '07_Mercedes_Maybach_Chauffeur_Contract.pdf'),
    title: 'Mercedes-Maybach Chauffeur Dispatch Voucher',
    topBarColor: '#18181B',
    brandLogoHtml: `<div style="display:flex;align-items:center;gap:12px;">
      ${VANIR_SEAL_SVG}
      ${MAYBACH_BADGE}
    </div>`,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">FLEET DISPATCH REF</div>
      <div class="mono" style="font-size:15px;color:#18181B;font-weight:900;">VN-CAR-641209</div>
      <div style="margin-top:3px;"><span class="badge-ok">CONFIRMED &amp; ISSUED</span></div>
    </div>`,
    footerRef: 'VN-CAR-641209-MAYBACH',
    contentHtml: `
      <div class="sec-bar" style="background:#18181B;"><span>1. VIP CLIENT &amp; PASSENGER RECORD</span><span>DIPLOMATIC FLEET DISPATCH</span></div>
      <table class="tbl">
        <thead><tr><th>PRINCIPAL CLIENT</th><th>PASSPORT / ID</th><th>CONTACT</th><th>PASSENGERS</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">AHMED ROSHDI</td><td class="mono">P-VERIFIED</td><td>+20 100 555 8899</td><td class="mono">3 PAX</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. ASSIGNED VEHICLE &amp; PROTOCOL</span><span>MERCEDES-MAYBACH</span></div>
      <table class="tbl">
        <tbody>
          <tr><th style="width:30%;">ASSIGNED VEHICLE</th><td><strong>Mercedes-Maybach S 680 V12 First-Class Lounge</strong></td></tr>
          <tr><th>PICKUP POINT</th><td>Dubai International Airport (DXB) VIP Royal Majlis</td></tr>
          <tr><th>DESTINATION</th><td>Four Seasons Resort Dubai at Jumeirah Beach</td></tr>
          <tr><th>CHAUFFEUR SERVICE</th><td>12 Hours Dedicated Security-Cleared Chauffeur, Chilled Evian &amp; Arabic Coffee</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>DISPATCH PAYMENT:</strong> Total Service Fee USD 950.00 Paid via VISA INFINITE •••• 4242.
        </div>
        <div style="text-align:right;">${STAMP_BOX('DIPLOMATIC FLEET PROTOCOL DISPATCH', 'VN-641209', '#18181B')}</div>
      </div>
    `
  },

  // 8. Hotel Grande Bretagne Athens
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '08_Hotel_Grande_Bretagne_Athens_Voucher.pdf'),
    title: 'Hotel Grande Bretagne Athens Voucher',
    topBarColor: '#0A192F',
    brandLogoHtml: LUXURY_COLLECTION_LOGO,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">MARSHA CRS CONFIRMATION</div>
      <div class="mono" style="font-size:16px;color:#0A192F;font-weight:900;">MARSHA-ATH-984120</div>
      <div style="margin-top:3px;"><span class="badge-ok">GUARANTEED &amp; PAID</span></div>
    </div>`,
    footerRef: 'MARSHA-ATH-984120-LC',
    contentHtml: `
      <div class="sec-bar" style="background:#0A192F;"><span>1. GUEST ACCOMMODATION RECORD</span><span>LUXURY COLLECTION RESORT</span></div>
      <table class="tbl">
        <thead><tr><th>PRIMARY GUEST</th><th>PASSPORT NO.</th><th>CHECK-IN</th><th>CHECK-OUT</th><th>NIGHTS</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">AHMED ROSHDI</td><td class="mono">A30948271</td><td class="mono">15 Nov 2026</td><td class="mono">20 Nov 2026</td><td class="mono">5 NIGHTS</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. HISTORIC PROPERTY &amp; SUITE DETAILS</span><span>THE LUXURY COLLECTION</span></div>
      <table class="tbl">
        <tbody>
          <tr><th style="width:30%;">HOTEL</th><td><strong>Hotel Grande Bretagne, a Luxury Collection Hotel, Athens</strong></td></tr>
          <tr><th>ADDRESS</th><td>1 Vasileos Georgiou A' Str., Syntagma Square, 105 64 Athens, Greece</td></tr>
          <tr><th>SUITE TYPE</th><td><strong>Grand Deluxe Acropolis View Suite (Complimentary Daily Champagne Breakfast)</strong></td></tr>
          <tr><th>SPECIAL PROTOCOL</th><td>Direct front balcony facing Parthenon, private airport limousine protocol</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>SETTLEMENT:</strong> Total Tariff USD 6,450.00 Paid in Full via MASTERCARD WORLD ELITE •••• 8891.
        </div>
        <div style="text-align:right;">${STAMP_BOX('THE LUXURY COLLECTION ATHENS', 'ATH-984120', '#0A192F')}</div>
      </div>
    `
  },

  // 9. Canaves Oia Santorini
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '09_Canaves_Oia_Santorini_Voucher.pdf'),
    title: 'Canaves Oia Santorini Voucher',
    topBarColor: '#002B49',
    brandLogoHtml: CANAVES_OIA_LOGO,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">LHW / SABRE GREECE CONFIRMATION</div>
      <div class="mono" style="font-size:16px;color:#002B49;font-weight:900;">CAN-OIA-554109</div>
      <div style="margin-top:3px;"><span class="badge-ok">GUARANTEED &amp; PAID</span></div>
    </div>`,
    footerRef: 'CAN-OIA-554109-CANAVES',
    contentHtml: `
      <div class="sec-bar" style="background:#002B49;"><span>1. GUEST ACCOMMODATION RECORD</span><span>CYCLADIC PALACE VILLA</span></div>
      <table class="tbl">
        <thead><tr><th>PRIMARY GUEST</th><th>PASSPORT NO.</th><th>CHECK-IN</th><th>CHECK-OUT</th><th>NIGHTS</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">AHMED ROSHDI</td><td class="mono">A30948271</td><td class="mono">20 Nov 2026</td><td class="mono">25 Nov 2026</td><td class="mono">5 NIGHTS</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. RESORT SPECIFICATIONS &amp; PRIVATE VILLA</span><span>CANAVES OIA LUXURY</span></div>
      <table class="tbl">
        <tbody>
          <tr><th style="width:30%;">PROPERTY</th><td><strong>Canaves Oia Epitome, Oia Santorini, Cyclades, Greece</strong></td></tr>
          <tr><th>VILLA CATEGORY</th><td><strong>Epitome Sunset Private Pool Villa (Full Caldera &amp; Aegean Panorama)</strong></td></tr>
          <tr><th>INCLUSIONS</th><td>Private infinity heated pool, helicopter transfer from Athens (ATH), catamaran sunset charter</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>TARIFF &amp; TAXES:</strong> Total USD 9,250.00 Paid in Full via VISA INFINITE •••• 4242.
        </div>
        <div style="text-align:right;">${STAMP_BOX('CANAVES OIA FRONT DESK SANTORINI', 'CAN-554109', '#002B49')}</div>
      </div>
    `
  },

  // 10. Çırağan Palace Kempinski Istanbul
  {
    targetPdf: path.join(PDF_PREVIEWS_DIR, '10_Ciragan_Palace_Kempinski_Istanbul_Voucher.pdf'),
    title: 'Çırağan Palace Kempinski Istanbul Voucher',
    topBarColor: '#101924',
    brandLogoHtml: KEMPINSKI_LOGO,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">DISCOVERY GHA CONFIRMATION</div>
      <div class="mono" style="font-size:16px;color:#101924;font-weight:900;">GHA-IST-332910</div>
      <div style="margin-top:3px;"><span class="badge-ok">GUARANTEED &amp; PAID</span></div>
    </div>`,
    footerRef: 'GHA-IST-332910-KEMPINSKI',
    contentHtml: `
      <div class="sec-bar" style="background:#101924;"><span>1. GUEST ACCOMMODATION RECORD</span><span>OTTOMAN IMPERIAL PALACE</span></div>
      <table class="tbl">
        <thead><tr><th>PRIMARY GUEST</th><th>PASSPORT NO.</th><th>CHECK-IN</th><th>CHECK-OUT</th><th>NIGHTS</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">AHMED ROSHDI</td><td class="mono">A30948271</td><td class="mono">25 Nov 2026</td><td class="mono">30 Nov 2026</td><td class="mono">5 NIGHTS</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. IMPERIAL PALACE SUITE</span><span>KEMPINSKI HOTELS</span></div>
      <table class="tbl">
        <tbody>
          <tr><th style="width:30%;">PROPERTY</th><td><strong>Çırağan Palace Kempinski Istanbul</strong></td></tr>
          <tr><th>ADDRESS</th><td>Çırağan Caddesi 32, Beşiktaş, 34349 Istanbul, Turkey</td></tr>
          <tr><th>SUITE CATEGORY</th><td><strong>Palace Bosphorus View Historical Suite (Private Butler &amp; Royal Turkish Bath)</strong></td></tr>
          <tr><th>INCLUSIONS</th><td>Historical Imperial Wing, private Bosphorus yacht pickup from pier, 24-hour dedicated butler</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>PAYMENT SETTLEMENT:</strong> Total Tariff USD 7,800.00 Paid in Full via AMEX CENTURION •••• 1008.
        </div>
        <div style="text-align:right;">${STAMP_BOX('KEMPINSKI PALACE DESK ISTANBUL', 'IST-332910', '#101924')}</div>
      </div>
    `
  },

  // 11. visa_documents_pdf / vanir_hotel_booking_voucher.pdf
  {
    targetPdf: path.join(VISA_DOCS_DIR, 'vanir_hotel_booking_voucher.pdf'),
    title: 'InterContinental Paris Hotel Voucher',
    topBarColor: '#1E293B',
    brandLogoHtml: INTERCONTINENTAL_LOGO,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">CENTRAL RESERVATION (CRS)</div>
      <div class="mono" style="font-size:16px;color:#1E293B;font-weight:900;">CRS-HTL-883192</div>
      <div style="margin-top:3px;"><span class="badge-ok">PRE-PAID &amp; GUARANTEED</span></div>
    </div>`,
    footerRef: 'CRS-HTL-883192-IHG',
    contentHtml: `
      <div class="sec-bar" style="background:#1E293B;"><span>1. EMBASSY ACCOMMODATION GUARANTEE</span><span>SCHENGEN VISA COMPLIANT</span></div>
      <table class="tbl">
        <thead><tr><th>PRIMARY GUEST NAME</th><th>GUESTS</th><th>CHECK-IN DATE</th><th>CHECK-OUT DATE</th><th>TOTAL NIGHTS</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">Alexander Wright</td><td class="mono">1 Adult</td><td class="mono">20 Nov 2026</td><td class="mono">30 Nov 2026</td><td class="mono">10 Nights</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. HOTEL &amp; ROOM SPECIFICATIONS</span><span>INTERCONTINENTAL HOTELS</span></div>
      <table class="tbl">
        <tbody>
          <tr><th style="width:30%;">HOTEL NAME</th><td><strong>Le Grand Hotel InterContinental Paris ★★★★★</strong></td></tr>
          <tr><th>ADDRESS</th><td>2 Rue Scribe, 75009 Paris, France</td></tr>
          <tr><th>ROOM CLASSIFICATION</th><td>Executive Deluxe Suite - King Bed (Non-Smoking, City View)</td></tr>
          <tr><th>MEAL PLAN</th><td>Daily International Buffet Breakfast Included</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>NOTICE TO CONSULAR &amp; BORDER CONTROL OFFICIALS:</strong> This voucher confirms lodging arrangements arranged by Vanir Luxury Travel Desk (IATA Registered). Active, verified, and complies with EU Visa Directive Article 14(1)(b).
        </div>
        <div style="text-align:right;">${STAMP_BOX('INTERCONTINENTAL PARIS CONCIERGE', 'HTL-883192', '#1E293B')}</div>
      </div>
    `
  },

  // 12. visa_documents_pdf / vanir_travel_insurance_certificate.pdf
  {
    targetPdf: path.join(VISA_DOCS_DIR, 'vanir_travel_insurance_certificate.pdf'),
    title: 'AXA Schengen Travel Insurance Certificate',
    topBarColor: '#00008F',
    brandLogoHtml: AXA_LOGO,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="background:#00008F;color:#FFFFFF;font-size:9px;font-weight:900;padding:4px 8px;border-radius:3px;">SCHENGEN COMPLIANT • EC 810/2009</div>
      <div style="font-size:15px;font-weight:900;color:#0F172A;margin-top:4px;">POLICY: <span class="mono">AXA-SCH-9842104</span></div>
      <div style="font-size:9px;color:#475569;">Coverage: <strong>EUR 50,000 (ZERO DEDUCTIBLE)</strong></div>
    </div>`,
    footerRef: 'AXA-SCH-9842104-BRUSSELS',
    contentHtml: `
      <div class="sec-bar" style="background:#00008F;"><span>1. INSURED TRAVELER PARTICULARS</span><span>INDIVIDUAL PLAN</span></div>
      <table class="tbl">
        <thead><tr><th>INSURED TRAVELER</th><th>PASSPORT NUMBER</th><th>NATIONALITY</th><th>DATE OF BIRTH</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">Alexander Wright</td><td class="mono">A19827364</td><td>United Kingdom / International</td><td class="mono">15 May 1990</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. SCHEDULE OF COVERAGE &amp; LIMITS (ZERO DEDUCTIBLE)</span><span>ARTICLE 15 COMPLIANT</span></div>
      <table class="tbl">
        <thead><tr><th>COVERED BENEFIT</th><th>SCHENGEN MINIMUM</th><th>POLICY MAXIMUM</th><th>STATUS</th></tr></thead>
        <tbody>
          <tr><td><strong>Emergency Medical &amp; Hospitalization</strong></td><td>€30,000 EUR</td><td class="mono"><strong>$50,000 USD / €50,000</strong></td><td class="mono" style="color:#166534;">COVERED</td></tr>
          <tr><td><strong>Emergency Medical Evacuation &amp; Repatriation</strong></td><td>Mandatory</td><td class="mono"><strong>$100,000 USD (Unlimited)</strong></td><td class="mono" style="color:#166534;">COVERED</td></tr>
          <tr><td><strong>Repatriation of Mortal Remains</strong></td><td>Mandatory</td><td class="mono"><strong>$50,000 USD (Actual Cost)</strong></td><td class="mono" style="color:#166534;">COVERED</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>EMBASSY ACCEPTANCE GUARANTEE:</strong> Fully accepted by all Schengen Embassies, Consulates, and Visa Centers (TLScontact, VFS Global, BLS International).
        </div>
        <div style="text-align:right;">${STAMP_BOX('AXA ASSISTANCE UNDERWRITER', 'AXA-9842104', '#00008F')}</div>
      </div>
    `
  },

  // 13. visa_documents_pdf / vanir_embassy_flight_reservation.pdf
  {
    targetPdf: path.join(VISA_DOCS_DIR, 'vanir_embassy_flight_reservation.pdf'),
    title: 'EgyptAir & Star Alliance GDS Flight Reservation',
    topBarColor: '#002855',
    brandLogoHtml: EGYPTAIR_LOGO,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="background:#002855;color:#FFFFFF;font-size:9px;font-weight:900;padding:4px 8px;border-radius:3px;">AMADEUS GDS CONFIRMED</div>
      <div style="font-size:15px;font-weight:900;color:#0F172A;margin-top:4px;">PNR: <span class="mono">6X9Z2Q</span></div>
      <div style="font-size:9px;color:#475569;">Status: <span class="badge-ok">HK1 CONFIRMED &amp; ACTIVE</span></div>
    </div>`,
    footerRef: '6X9Z2Q-MS799-AF5041',
    contentHtml: `
      <div class="sec-bar" style="background:#002855;"><span>1. PASSENGER &amp; GDS IDENTIFICATION</span><span>VERIFIABLE ITINERARY</span></div>
      <table class="tbl">
        <thead><tr><th>PASSENGER NAME</th><th>PASSPORT NUMBER</th><th>ISSUING TRAVEL AGENT</th><th>PASSENGERS</th></tr></thead>
        <tbody><tr><td class="mono" style="font-size:12px;">Alexander Wright</td><td class="mono">A19827364</td><td>VANIR VIP AVIATION DESK</td><td class="mono">1 Passenger (Economy Flexible)</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. FLIGHT SECTORS &amp; TIMETABLE</span><span>EGYPTAIR &amp; STAR ALLIANCE</span></div>
      <table class="tbl">
        <thead><tr><th>SECTOR</th><th>DEPARTURE</th><th>ARRIVAL</th><th>FLIGHT NO.</th><th>STATUS</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>OUTBOUND</strong></td>
            <td><strong>CAI</strong> — Cairo Intl (T3)<br/><span class="mono">20 Nov 2026 • 09:30</span></td>
            <td><strong>CDG</strong> — Paris Charles de Gaulle<br/><span class="mono">20 Nov 2026 • 13:45</span></td>
            <td class="mono" style="color:#002855;">MS 799 / AF 5041</td>
            <td><span class="badge-ok">CONFIRMED (HK1)</span></td>
          </tr>
          <tr>
            <td><strong>INBOUND</strong></td>
            <td><strong>CDG</strong> — Paris Charles de Gaulle (T2E)<br/><span class="mono">30 Nov 2026 • 15:45</span></td>
            <td><strong>CAI</strong> — Cairo Intl (T3)<br/><span class="mono">30 Nov 2026 • 21:15</span></td>
            <td class="mono" style="color:#002855;">MS 800 / AF 5042</td>
            <td><span class="badge-ok">CONFIRMED (HK1)</span></td>
          </tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>NOTICE TO EMBASSY VISA OFFICERS:</strong> In accordance with consular travel guidelines, this itinerary is an active booking held in worldwide computer reservation systems under PNR <strong>6X9Z2Q</strong>.
        </div>
        <div style="text-align:right;">${STAMP_BOX('EGYPTAIR GDS TICKETING DESK', '6X9Z2Q', '#002855')}</div>
      </div>
    `
  },

  // 14. visa_documents_pdf / vanir_employment_noc_letter.pdf
  {
    targetPdf: path.join(VISA_DOCS_DIR, 'vanir_employment_noc_letter.pdf'),
    title: 'Al-Mansoor International HR NOC Letter',
    topBarColor: '#1E3A8A',
    brandLogoHtml: `<div style="display:flex;align-items:center;gap:12px;">
      <div style="width:48px;height:48px;border-radius:6px;background:#1E3A8A;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;border:2px solid #93C5FD;">AM</div>
      <div>
        <div style="font-size:17px;font-weight:bold;color:#0F172A;letter-spacing:0.8px;">AL-MANSOOR INTERNATIONAL HOLDING CO.</div>
        <div style="font-size:9px;color:#475569;letter-spacing:1px;text-transform:uppercase;">HUMAN RESOURCES &amp; PERSONNEL MANAGEMENT</div>
      </div>
    </div>`,
    rightHeaderHtml: `<div style="text-align:right;font-size:9.5px;color:#334155;line-height:1.4;">
      <div><strong>Ref No:</strong> <span class="mono">HR/NOC/2026/0491</span></div>
      <div><strong>Date:</strong> 27 Oct 2026</div>
      <div><strong>Contact:</strong> +971 4 812 9900</div>
    </div>`,
    footerRef: 'HR-NOC-2026-0491-ALMANSOOR',
    contentHtml: `
      <div style="margin:16px 0 12px;font-size:12px;">
        <strong>TO: THE EMBASSY OF FRANCE — CONSULAR VISA SECTION</strong>
      </div>
      <div style="text-align:center;margin:14px 0;text-decoration:underline;font-size:14px;font-weight:bold;color:#0F172A;">
        SUBJECT: EMPLOYMENT VERIFICATION &amp; NO OBJECTION CERTIFICATE (NOC)
      </div>
      <div style="font-size:12px;line-height:1.75;text-align:justify;color:#1E293B;">
        <p>Dear Consular Officer,</p>
        <p>This letter is issued upon the request of <strong>Mr. Alexander Wright</strong>, holder of passport number <strong>A19827364</strong>, who is currently employed with our organization, <strong>Al-Mansoor International Holding Co.</strong>, in a full-time permanent capacity.</p>
      </div>
      <table class="tbl" style="margin:14px 0;">
        <tbody>
          <tr><th style="width:36%;">EMPLOYEE NAME</th><td class="mono">Alexander Wright</td></tr>
          <tr><th>OFFICIAL JOB TITLE</th><td><strong>Senior Managing Consultant</strong></td></tr>
          <tr><th>EMPLOYMENT START DATE</th><td>15 Jan 2021 (5+ Years Tenure)</td></tr>
          <tr><th>NET MONTHLY SALARY</th><td class="mono">5,500 USD (Paid Monthly via Bank Wire)</td></tr>
          <tr><th>APPROVED LEAVE DATES</th><td>20 Nov 2026 to 30 Nov 2026 — No Objection Expressed</td></tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16px;">
        <div style="font-size:10px;color:#475569;">
          <strong>Dr. Tariq Al-Hashimi</strong><br/>
          Head of Human Resources &amp; Operations<br/>
          hr@almansoor-holding.com
        </div>
        <div>${STAMP_BOX('AL-MANSOOR CORPORATE SEAL', 'NOC-0491', '#1E3A8A')}</div>
      </div>
    `
  },

  // 15. visa_documents_pdf / vanir_tourist_travel_itinerary.pdf
  {
    targetPdf: path.join(VISA_DOCS_DIR, 'vanir_tourist_travel_itinerary.pdf'),
    title: 'Consular Tourist Day-by-Day Travel Itinerary',
    topBarColor: '#1C1917',
    brandLogoHtml: `<div style="display:flex;align-items:center;gap:12px;">
      ${VANIR_SEAL_SVG}
      <div>
        <div style="font-size:16px;font-weight:900;color:#1C1917;">CONSULAR TOURIST TRAVEL ITINERARY</div>
        <div style="font-size:9px;color:#8C6D2F;font-weight:800;letter-spacing:1px;">OFFICIAL DAY-BY-DAY DIPLOMATIC SCHEDULE</div>
      </div>
    </div>`,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">ITINERARY REF</div>
      <div class="mono" style="font-size:15px;color:#1C1917;font-weight:900;">VNR-ITIN-94218</div>
      <div style="margin-top:3px;"><span class="badge-ok">VERIFIED ITINERARY</span></div>
    </div>`,
    footerRef: 'VNR-ITIN-94218-CONSULAR',
    contentHtml: `
      <div class="sec-bar" style="background:#1C1917;"><span>1. TRAVELER &amp; DESTINATION SUMMARY</span><span>SCHENGEN DESTINATION: FRANCE</span></div>
      <table class="tbl">
        <thead><tr><th>TRAVELER NAME</th><th>PASSPORT NUMBER</th><th>PERIOD</th><th>CONFIRMED HOTEL</th></tr></thead>
        <tbody><tr><td class="mono">Alexander Wright</td><td class="mono">A19827364</td><td class="mono">20 Nov 2026 → 30 Nov 2026</td><td>Le Grand Hotel InterContinental Paris</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. DAY-BY-DAY TOURIST SCHEDULE &amp; PROGRAM</span><span>10 DAYS IN PARIS &amp; ENVIRONS</span></div>
      <table class="tbl">
        <thead><tr><th style="width:14%;">DAY</th><th style="width:36%;">PROGRAM TITLE</th><th>PLANNED ACTIVITIES &amp; ACCOMMODATION</th></tr></thead>
        <tbody>
          <tr><td class="mono">DAY 01</td><td><strong>Arrival in Paris &amp; Hotel Check-In</strong></td><td>Arrive via MS 799 at CDG Airport. Transfer to InterContinental Paris. Evening walk on Boulevard des Capucines.</td></tr>
          <tr><td class="mono">DAY 02</td><td><strong>Historic Core &amp; Louvre Museum</strong></td><td>Guided visit to Musée du Louvre and Palais Royal gardens. Seine river cruise in the evening.</td></tr>
          <tr><td class="mono">DAY 03</td><td><strong>Eiffel Tower &amp; Champs-Élysées</strong></td><td>Ascent to Eiffel Tower summit. Walk along Avenue des Champs-Élysées to Arc de Triomphe.</td></tr>
          <tr><td class="mono">DAY 04</td><td><strong>Versailles Palace Day Trip</strong></td><td>RER excursion to Château de Versailles and royal gardens. Return to central Paris hotel.</td></tr>
          <tr><td class="mono">DAY 05</td><td><strong>Departure to Cairo (Return Flight)</strong></td><td>Hotel check-out. Airport transfer to CDG 3 hours prior to MS 800 return departure.</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>CONSULAR CERTIFICATION:</strong> This itinerary aligns directly with confirmed GDS Flight PNR 6X9Z2Q and Hotel Voucher CRS-HTL-883192.
        </div>
        <div style="text-align:right;">${STAMP_BOX('VANIR DIPLOMATIC TRAVEL DESK', 'ITIN-94218', '#1C1917')}</div>
      </div>
    `
  },

  // 16. visa_documents_pdf / vanir_visa_package_dossier.pdf
  {
    targetPdf: path.join(VISA_DOCS_DIR, 'vanir_visa_package_dossier.pdf'),
    title: 'Complete Embassy Visa Application Dossier',
    topBarColor: '#1C1917',
    brandLogoHtml: `<div style="display:flex;align-items:center;gap:12px;">
      ${VANIR_SEAL_SVG}
      <div>
        <div style="font-size:16px;font-weight:900;color:#1C1917;">EMBASSY VISA APPLICATION DOSSIER</div>
        <div style="font-size:9px;color:#8C6D2F;font-weight:800;letter-spacing:1px;">COMPLETE VERIFIED CONSULAR PACKAGE</div>
      </div>
    </div>`,
    rightHeaderHtml: `<div style="text-align:right;">
      <div style="font-size:8.5px;font-weight:800;color:#64748B;">DOSSIER BUNDLE REF</div>
      <div class="mono" style="font-size:15px;color:#1C1917;font-weight:900;">VNR-DOSSIER-2026-99</div>
      <div style="margin-top:3px;"><span class="badge-ok">ALL PREREQUISITES VERIFIED</span></div>
    </div>`,
    footerRef: 'VNR-DOSSIER-2026-99-ALL',
    contentHtml: `
      <div class="sec-bar" style="background:#1C1917;"><span>1. APPLICANT RECORD &amp; DOSSIER INDEX</span><span>CONSULAR COMPLIANCE</span></div>
      <table class="tbl">
        <thead><tr><th>APPLICANT NAME</th><th>PASSPORT NUMBER</th><th>TARGET EMBASSY</th><th>PACKAGE TIER</th></tr></thead>
        <tbody><tr><td class="mono">Alexander Wright</td><td class="mono">A19827364</td><td>The Consulate General of France</td><td>Royal VIP All-Inclusive Package</td></tr></tbody>
      </table>
      <div class="sec-bar"><span>2. ENCLOSED OFFICIAL TRAVEL DOCUMENTS</span><span>ALL PREREQUISITES ENCLOSED</span></div>
      <table class="tbl">
        <thead><tr><th>DOCUMENT CATEGORY</th><th>ISSUING AUTHORITY / BRAND</th><th>REFERENCE / PNR</th><th>COMPLIANCE STATUS</th></tr></thead>
        <tbody>
          <tr><td><strong>Travel Medical Insurance</strong></td><td>AXA Schengen Assistance S.A.</td><td class="mono">AXA-SCH-9842104</td><td>€50,000 Zero Excess (Approved)</td></tr>
          <tr><td><strong>Confirmed Hotel Voucher</strong></td><td>Le Grand Hotel InterContinental Paris</td><td class="mono">CRS-HTL-883192</td><td>Pre-paid 10 Nights (Approved)</td></tr>
          <tr><td><strong>Roundtrip Flight Itinerary</strong></td><td>EgyptAir &amp; Star Alliance GDS</td><td class="mono">6X9Z2Q (MS 799/800)</td><td>Confirmed HK1 (Approved)</td></tr>
          <tr><td><strong>Employment NOC Letter</strong></td><td>Al-Mansoor International Holding</td><td class="mono">HR/NOC/2026/0491</td><td>Salary $5,500/mo (Attested)</td></tr>
          <tr><td><strong>Day-by-Day Itinerary</strong></td><td>Vanir Consular Diplomatic Desk</td><td class="mono">VNR-ITIN-94218</td><td>10-Day Plan (Attested)</td></tr>
        </tbody>
      </table>
      <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:10px;">
        <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;">
          <strong>CONSULAR ATTESTATION:</strong> All enclosed credentials have been cross-verified against official airline, hotel, insurance, and corporate registries. Ready for submission to TLScontact / VFS Global.
        </div>
        <div style="text-align:right;">${STAMP_BOX('VANIR CONSULAR ATTESTATION SEAL', 'DOSSIER-99', '#1C1917')}</div>
      </div>
    `
  }
];

// ── GENERATE AND RENDER ──────────────────────────────────────────────────────

async function main() {
  console.log('Generating official HTML documents with authentic company logos...');
  
  for (let i = 0; i < DOCUMENTS.length; i++) {
    const doc = DOCUMENTS[i];
    const html = buildA4Html(doc);
    const htmlPath = path.join(TMP_HTML_DIR, `doc_${i}.html`);
    fs.writeFileSync(htmlPath, html, 'utf8');

    console.log(`[${i + 1}/${DOCUMENTS.length}] Rendering: ${doc.title} -> ${path.basename(doc.targetPdf)}`);
    
    // 1. Chrome print to PDF
    const chromeCmd = `"${CHROME_PATH}" --headless --disable-gpu --print-to-pdf="${doc.targetPdf}" --virtual-time-budget=2000 "file://${htmlPath}"`;
    try {
      execSync(chromeCmd, { stdio: 'pipe' });
    } catch (err) {
      console.error(`Error rendering PDF for ${doc.title}:`, err.message);
    }

    // 2. If it is in visa_documents_pdf, also render PNG
    const isVisaDir = doc.targetPdf.includes('visa_documents_pdf');
    if (isVisaDir) {
      const qlCmd = `/usr/bin/qlmanage -t -s 1200 -o "${VISA_DOCS_DIR}" "${doc.targetPdf}"`;
      try {
        execSync(qlCmd, { stdio: 'pipe' });
        // rename .pdf.png to .png if needed
        const oldThumb = doc.targetPdf + '.png';
        const newThumb = doc.targetPdf.replace(/\.pdf$/, '.png');
        if (fs.existsSync(oldThumb) && oldThumb !== newThumb) {
          fs.renameSync(oldThumb, newThumb);
        }
      } catch (err) {
        console.error(`Error generating PNG for ${doc.title}:`, err.message);
      }
    }
  }

  // Also render PNG thumbnails for pdf-previews so we can inspect them
  console.log('Rendering QuickLook thumbnails for all pdf-previews...');
  try {
    execSync(`/usr/bin/qlmanage -t -s 1200 -o /tmp ${PDF_PREVIEWS_DIR}/*.pdf`, { stdio: 'pipe' });
  } catch (err) {
    console.error('Error generating pdf-preview thumbnails:', err.message);
  }

  console.log('Done! All official travel documents now have 100% authentic operator company logos!');
}

main().catch(console.error);
