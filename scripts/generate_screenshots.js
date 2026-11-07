const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getBase64(rel) {
  const p = path.join(process.cwd(), rel);
  if (fs.existsSync(p)) {
    const ext = path.extname(p).slice(1).toLowerCase();
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,` + fs.readFileSync(p).toString('base64');
  }
  return '';
}

const logoBase64 = getBase64('src/assets/vanir_round_logo.png');
const jetFlightBase64 = getBase64('src/assets/images/services/luxury_private_jet_flight.jpg');
const jetInteriorBase64 = getBase64('src/assets/images/services/private_jet_interior.jpg');
const hotelBase64 = getBase64('src/assets/images/services/service_hotel_reservation.jpg');
const transportBase64 = getBase64('src/assets/images/services/service_transportation.jpg');
const santoriniBase64 = getBase64('src/assets/images/hero/hero_santorini.jpg');
const dubaiBase64 = getBase64('src/assets/images/hero/hero_dubai.jpg');

const outDir = path.join(process.cwd(), 'store_assets', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Common styles & Google Fonts for ultra-luxury editorial aesthetic
const commonStyles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  width: 1080px;
  height: 1920px;
  background-color: #FAF9F6;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  position: relative;
  color: #0F1E36;
  -webkit-font-smoothing: antialiased;
}

/* Background Subtle Luxury Editorial Elements */
.canvas-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* Panoramic Horizon Spline */
.panorama-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 1080px;
  height: 1920px;
}

/* Editorial Grid Accents */
.grid-mark {
  position: absolute;
  font-family: 'Cinzel', serif;
  font-size: 13px;
  color: rgba(212, 175, 55, 0.6);
  letter-spacing: 2px;
}

/* Crosshairs in corners */
.crosshair {
  position: absolute;
  width: 24px;
  height: 24px;
}
.crosshair::before {
  content: '';
  position: absolute;
  top: 11px;
  left: 0;
  width: 24px;
  height: 1px;
  background: rgba(212, 175, 55, 0.4);
}
.crosshair::after {
  content: '';
  position: absolute;
  top: 0;
  left: 11px;
  width: 1px;
  height: 24px;
  background: rgba(212, 175, 55, 0.4);
}

/* Editorial Top Header Section */
.editorial-header {
  position: relative;
  z-index: 10;
  padding: 75px 80px 0 80px;
}

.top-brand-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.brand-identity {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid #D4AF37;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.25);
}

.brand-title-wrap {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: 'Cinzel', serif;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 3.5px;
  color: #0F1E36;
}

.brand-tagline {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #D4AF37;
  text-transform: uppercase;
  margin-top: 2px;
}

.issue-badge {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  font-weight: 700;
  color: #0F1E36;
  letter-spacing: 2px;
  border: 1px solid rgba(212, 175, 55, 0.45);
  background: rgba(255, 255, 255, 0.85);
  padding: 8px 16px;
  border-radius: 30px;
  box-shadow: 0 4px 12px rgba(15, 30, 54, 0.05);
}

.fine-separator {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, #D4AF37 0%, rgba(212, 175, 55, 0.25) 50%, transparent 100%);
  margin-bottom: 22px;
}

.editorial-eyebrow {
  font-family: 'Cinzel', serif;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #D4AF37;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
}
.editorial-eyebrow::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 1.5px;
  background: #D4AF37;
}

.editorial-headline {
  font-family: 'Playfair Display', serif;
  font-size: 56px;
  font-weight: 700;
  color: #0F1E36;
  line-height: 1.15;
  letter-spacing: -0.8px;
  margin-top: 8px;
  margin-bottom: 10px;
}

.editorial-subtitle {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #64748B;
  line-height: 1.35;
  letter-spacing: 0.1px;
  max-width: 860px;
}

/* 3D Smartphone Stage */
.phone-stage {
  position: absolute;
  top: 450px;
  left: 50%;
  width: 700px;
  height: 1320px;
  margin-left: -350px;
  z-index: 20;
  display: flex;
  justify-content: center;
}

/* Chassis Titanium Gold & Matte Obsidian finishes */
.smartphone-device {
  width: 650px;
  height: 1260px;
  border-radius: 54px;
  position: relative;
  box-sizing: border-box;
  padding: 12px;
  background: linear-gradient(135deg, #F5E6B8 0%, #D4AF37 40%, #AA820A 75%, #E5D5A0 100%);
  box-shadow: 
    0 45px 110px rgba(15, 30, 54, 0.22),
    0 20px 45px rgba(212, 175, 55, 0.16),
    -18px 25px 60px rgba(15, 30, 54, 0.1),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease;
}

.smartphone-device.matte-obsidian {
  background: linear-gradient(135deg, #3A3F47 0%, #1A1D24 45%, #0B0E14 80%, #2A2F38 100%);
  border: 1px solid rgba(212, 175, 55, 0.6);
  box-shadow: 
    0 45px 110px rgba(10, 15, 25, 0.32),
    0 20px 45px rgba(212, 175, 55, 0.15),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.3);
}

.inner-bezel {
  width: 100%;
  height: 100%;
  background: #000000;
  border-radius: 44px;
  padding: 8px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.screen-glass {
  width: 100%;
  height: 100%;
  background: #FAF9F6;
  border-radius: 36px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Glass Reflection Sheen across screen */
.screen-glass::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.03) 35%, transparent 55%);
  pointer-events: none;
  z-index: 50;
}

/* Dynamic Island */
.dynamic-island {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 32px;
  background: #000000;
  border-radius: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.island-camera {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #1E3A8A 0%, #000000 80%);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Inside Phone Status Bar */
.phone-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 28px 4px 28px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #0F1E36;
  z-index: 60;
  flex-shrink: 0;
}
.phone-status-bar.dark-text {
  color: #0F1E36;
}
.phone-status-bar.light-text {
  color: #FFFFFF;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* App Bottom Navigation Bar inside Phone */
.app-bottom-bar {
  background: #FFFFFF;
  border-top: 1px solid rgba(212, 175, 55, 0.25);
  padding: 10px 18px 8px 18px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 60;
  margin-top: auto;
  flex-shrink: 0;
}
.app-bottom-bar.dark-nav {
  background: #0B132B;
  border-top: 1px solid rgba(212, 175, 55, 0.3);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-size: 9.5px;
  font-weight: 700;
  color: #64748B;
  letter-spacing: 0.5px;
}
.nav-item.active {
  color: #D4AF37;
}

.home-indicator {
  width: 140px;
  height: 4px;
  background: #0F1E36;
  border-radius: 2px;
  margin: 6px auto 5px auto;
  flex-shrink: 0;
}
.home-indicator.light {
  background: rgba(255, 255, 255, 0.5);
}

/* Editorial Footer Metadata */
.editorial-footer {
  position: absolute;
  bottom: 40px;
  left: 80px;
  right: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  border-top: 1px solid rgba(212, 175, 55, 0.25);
  padding-top: 18px;
}

.footer-meta-left {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  color: #64748B;
  text-transform: uppercase;
}

.footer-meta-right {
  font-family: 'Cinzel', serif;
  font-size: 18px;
  font-weight: 900;
  color: #D4AF37;
  letter-spacing: 3px;
}
`;

function renderBottomNav(activeIdx, isDark = false) {
  const items = [
    { label: 'Aviation', icon: '✈️' },
    { label: 'Radar', icon: '📡' },
    { label: 'Residences', icon: '🏛️' },
    { label: 'Fleet', icon: '🚘' },
    { label: 'Pass', icon: '🎫' },
  ];

  return `
    <div class="app-bottom-bar ${isDark ? 'dark-nav' : ''}">
      ${items.map((it, idx) => `
        <div class="nav-item ${idx === activeIdx ? 'active' : ''}">
          <span style="font-size: 16px;">${it.icon}</span>
          <span style="font-family: 'Cinzel', serif; font-weight: ${idx === activeIdx ? '800' : '600'}; color: ${idx === activeIdx ? '#D4AF37' : (isDark ? '#94A3B8' : '#64748B')};">${it.label}</span>
        </div>
      `).join('')}
    </div>
    <div class="home-indicator ${isDark ? 'light' : ''}"></div>
  `;
}

// Helper to wrap full HTML page with custom screen content
function generateHtml(options) {
  const {
    screenNum,
    totalScreens = 5,
    eyebrow,
    headline,
    subtitle,
    isDarkChassis = false,
    isometricTransform,
    splinePath,
    phoneContentHtml,
    footerMetaLeft,
  } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vanir Screenshot ${screenNum}</title>
  <style>
    ${commonStyles}
  </style>
</head>
<body>
  <!-- Canvas Background & Editorial Lines -->
  <div class="canvas-bg">
    <!-- Panoramic Flowing Gold Line -->
    <svg class="panorama-line" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="${splinePath}" stroke="url(#goldGradient${screenNum})" stroke-width="1.8" stroke-dasharray="6 6" opacity="0.65" />
      <path d="${splinePath}" stroke="url(#goldGradient${screenNum})" stroke-width="1" opacity="0.8" />
      <defs>
        <linearGradient id="goldGradient${screenNum}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.2"/>
          <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- Crosshairs & Corner Details -->
    <div class="crosshair" style="top: 40px; left: 40px;"></div>
    <div class="crosshair" style="top: 40px; right: 40px;"></div>
    <div class="crosshair" style="bottom: 40px; left: 40px;"></div>
    <div class="crosshair" style="bottom: 40px; right: 40px;"></div>

    <div class="grid-mark" style="top: 45px; left: 75px;">REF. VANIR-SPEC // PLAY-CONSOLE</div>
    <div class="grid-mark" style="top: 45px; right: 75px;">LAT 25°12'N • LON 55°17'E</div>
  </div>

  <!-- Editorial Top Header Section -->
  <div class="editorial-header">
    <div class="top-brand-bar">
      <div class="brand-identity">
        <img src="${logoBase64}" class="brand-logo-img" alt="Vanir Logo">
        <div class="brand-title-wrap">
          <span class="brand-name">VANIR</span>
          <span class="brand-tagline">ROYAL VIP CONCIERGE</span>
        </div>
      </div>
      <div class="issue-badge">
        FOLIO 0${screenNum} / 0${totalScreens}
      </div>
    </div>

    <div class="fine-separator"></div>

    <div class="editorial-eyebrow">${eyebrow}</div>
    <h1 class="editorial-headline">${headline}</h1>
    <p class="editorial-subtitle">${subtitle}</p>
  </div>

  <!-- 3D Smartphone Stage -->
  <div class="phone-stage">
    <div class="smartphone-device ${isDarkChassis ? 'matte-obsidian' : ''}" style="transform: ${isometricTransform};">
      <div class="inner-bezel">
        <div class="dynamic-island">
          <div class="island-camera"></div>
        </div>

        <div class="screen-glass">
          ${phoneContentHtml}
        </div>
      </div>
    </div>
  </div>

  <!-- Editorial Footer Metadata -->
  <div class="editorial-footer">
    <div class="footer-meta-left">${footerMetaLeft}</div>
    <div class="footer-meta-right">N° 0${screenNum}</div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1: Bespoke Private Jet Charters
// ─────────────────────────────────────────────────────────────────────────────
const screen1Html = generateHtml({
  screenNum: 1,
  eyebrow: 'COLLECTION N° 01 • PRIVATE AVIATION',
  headline: 'Bespoke Private Jet Charters',
  subtitle: 'On-demand Gulfstream, Bombardier & Dassault fleet with dedicated captain & crew.',
  isDarkChassis: false, // Titanium Gold
  isometricTransform: 'perspective(1800px) rotateY(-8deg) rotateX(7deg) rotateZ(-1.2deg)',
  splinePath: 'M 0 1180 C 350 1130, 750 1090, 1080 1050',
  footerMetaLeft: 'VANIR ARCHIVE • GLOBAL FLIGHT DISPATCH • FAA PART 135',
  phoneContentHtml: `
    <!-- Phone Status Bar -->
    <div class="phone-status-bar dark-text">
      <span>9:41</span>
      <div class="status-right">
        <span>5G</span>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0.5" y="0.5" width="14" height="11" rx="2.5" stroke="#0F1E36"/><rect x="2" y="2" width="10" height="8" rx="1.5" fill="#D4AF37"/><path d="M16 4V8" stroke="#0F1E36" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
    </div>

    <!-- App Header inside Phone -->
    <div style="padding: 10px 20px 8px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(15,30,54,0.08); flex-shrink: 0;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; border-radius: 16px; background: #0F1E36; display: flex; align-items: center; justify-content: center; border: 1px solid #D4AF37;">
          <img src="${logoBase64}" style="width: 20px; height: 20px; border-radius: 50%;">
        </div>
        <div>
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: 800; color: #0F1E36; letter-spacing: 1px;">VANIR AVIATION</div>
          <div style="font-size: 9.5px; color: #D4AF37; font-weight: 700;">VIP FLEET // CHARTER</div>
        </div>
      </div>
      <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.4); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; color: #0F1E36;">
        ARGUS PLATINUM
      </div>
    </div>

    <!-- Full-Height App Content with space-between distribution -->
    <div style="padding: 12px 18px 14px 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;">
      
      <!-- Aircraft Hero Banner -->
      <div style="width: 100%; height: 250px; border-radius: 18px; overflow: hidden; position: relative; box-shadow: 0 10px 25px rgba(15,30,54,0.15); border: 1.5px solid rgba(212, 175, 55, 0.35); flex-shrink: 0;">
        <img src="${jetFlightBase64}" style="width: 100%; height: 100%; object-fit: cover;">
        <div style="position: absolute; top: 10px; left: 10px; background: rgba(15, 30, 54, 0.88); backdrop-filter: blur(8px); padding: 5px 12px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.4); color: #D4AF37; font-size: 10px; font-weight: 800;">
          READY FOR DISPATCH • CAI / DXB
        </div>
        <div style="position: absolute; bottom: 10px; right: 10px; background: #D4AF37; color: #0F1E36; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 900;">
          INTERCONTINENTAL
        </div>
      </div>

      <!-- Aircraft Detail Card -->
      <div style="background: #FFFFFF; border-radius: 18px; padding: 15px 18px; border: 1px solid rgba(212, 175, 55, 0.25); box-shadow: 0 6px 18px rgba(15,30,54,0.05); flex-shrink: 0;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 9px;">
          <div>
            <h2 style="font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #0F1E36;">Gulfstream G650ER VIP</h2>
            <div style="font-size: 11px; color: #64748B; margin-top: 1px;">Tail No. N700VN • Serial MSN-6340</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; font-weight: 900; color: #D4AF37;">$11,500</div>
            <div style="font-size: 9.5px; color: #64748B;">/ flight hour</div>
          </div>
        </div>

        <!-- Specs Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
          <div style="background: #FAF9F6; border: 1px solid rgba(212, 175, 55, 0.2); padding: 7px; border-radius: 10px; text-align: center;">
            <div style="font-size: 12px; font-weight: 800; color: #0F1E36;">14 VIPs</div>
            <div style="font-size: 8px; color: #64748B; text-transform: uppercase;">Capacity</div>
          </div>
          <div style="background: #FAF9F6; border: 1px solid rgba(212, 175, 55, 0.2); padding: 7px; border-radius: 10px; text-align: center;">
            <div style="font-size: 12px; font-weight: 800; color: #0F1E36;">7,500 NM</div>
            <div style="font-size: 8px; color: #64748B; text-transform: uppercase;">Range</div>
          </div>
          <div style="background: #FAF9F6; border: 1px solid rgba(212, 175, 55, 0.2); padding: 7px; border-radius: 10px; text-align: center;">
            <div style="font-size: 12px; font-weight: 800; color: #0F1E36;">Mach 0.925</div>
            <div style="font-size: 8px; color: #64748B; text-transform: uppercase;">Top Speed</div>
          </div>
        </div>

        <!-- Amenities Chips -->
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
          <span style="background: #FFFDF5; border: 1px solid rgba(212,175,55,0.3); padding: 3px 8px; border-radius: 6px; font-size: 9.5px; color: #0F1E36; font-weight: 600;">✨ Master Stateroom</span>
          <span style="background: #FFFDF5; border: 1px solid rgba(212,175,55,0.3); padding: 3px 8px; border-radius: 6px; font-size: 9.5px; color: #0F1E36; font-weight: 600;">📶 Starlink Wi-Fi</span>
          <span style="background: #FFFDF5; border: 1px solid rgba(212,175,55,0.3); padding: 3px 8px; border-radius: 6px; font-size: 9.5px; color: #0F1E36; font-weight: 600;">🍾 Dom Pérignon Bar</span>
        </div>

        <!-- CTA Button -->
        <div style="background: #D4AF37; padding: 13px; border-radius: 12px; text-align: center; color: #0F1E36; font-size: 13px; font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(212,175,55,0.35);">
          Reserve Private Jet Now
        </div>
      </div>

      <!-- Second Aircraft Card: Bombardier Global 7500 Cabin -->
      <div style="background: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.25); box-shadow: 0 6px 18px rgba(15,30,54,0.06); flex-shrink: 0;">
        <div style="width: 100%; height: 160px; position: relative;">
          <img src="${jetInteriorBase64}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 10px; left: 10px; background: rgba(15, 30, 54, 0.88); padding: 4px 10px; border-radius: 10px; color: #D4AF37; font-size: 9.5px; font-weight: 800;">
            BOMBARDIER GLOBAL 7500
          </div>
          <div style="position: absolute; bottom: 10px; right: 10px; background: #D4AF37; color: #0F1E36; padding: 3px 8px; border-radius: 8px; font-size: 10.5px; font-weight: 900;">
            $14,800 / FLIGHT HR
          </div>
        </div>
        <div style="padding: 11px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: #0F1E36;">Four Zone Master Suite Living</div>
            <div style="font-size: 10px; color: #64748B; margin-top: 1px;">Full Stateroom Bed • Private En-Suite Shower</div>
          </div>
          <span style="font-size: 10px; font-weight: 800; color: #0F1E36; background: #FAF9F6; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(212,175,55,0.3);">INSPECT</span>
        </div>
      </div>

      <!-- Flight Route Dispatch Itinerary Bar -->
      <div style="background: #FFFFFF; border-radius: 14px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 17px;">📍</span>
          <div>
            <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Cairo (CAI) ➔ Dubai (DXB)</div>
            <div style="font-size: 9px; color: #64748B;">Nov 20 • 2 Dedicated Flight Crew + 1 Cabin Attendant</div>
          </div>
        </div>
        <span style="font-size: 9.5px; font-weight: 800; color: #10B981; background: rgba(16,185,129,0.12); padding: 4px 10px; border-radius: 8px;">STANDBY READY</span>
      </div>

      <!-- In-Flight VIP Catering Preview -->
      <div style="background: #FAF9F6; border-radius: 14px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 17px;">🥂</span>
          <div>
            <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Royal Sommelier & In-Flight Dining</div>
            <div style="font-size: 9px; color: #64748B;">Caviar Imperial Beluga • Custom Executive Chef Menu</div>
          </div>
        </div>
        <span style="font-size: 9.5px; font-weight: 800; color: #D4AF37; text-transform: uppercase;">Included</span>
      </div>

      <!-- Direct Jet Ramp & Customs Clearance -->
      <div style="background: #FFFFFF; border-radius: 14px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 17px;">🛫</span>
          <div>
            <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Direct Jet Ramp & Customs Clearance</div>
            <div style="font-size: 9px; color: #64748B;">Private terminal tarmac escort direct to aircraft stairs</div>
          </div>
        </div>
        <span style="font-size: 9.5px; font-weight: 800; color: #10B981; background: rgba(16,185,129,0.12); padding: 4px 10px; border-radius: 8px;">VERIFIED</span>
      </div>

    </div>

    <!-- App Bottom Nav Bar -->
    ${renderBottomNav(0, false)}
  `
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2: Real-Time Radar Flight Tracking
// ─────────────────────────────────────────────────────────────────────────────
const screen2Html = generateHtml({
  screenNum: 2,
  eyebrow: 'COLLECTION N° 02 • SATELLITE RADAR',
  headline: 'Real-Time Radar Flight Tracking',
  subtitle: 'Military-grade ADS-B telemetry, live cruise altitude & arrival projections.',
  isDarkChassis: true, // Matte Obsidian
  isometricTransform: 'perspective(1800px) rotateY(7deg) rotateX(8deg) rotateZ(1.2deg)',
  splinePath: 'M 0 1050 C 350 1010, 750 970, 1080 940',
  footerMetaLeft: 'VANIR TELEMETRY // GLOBAL AIR TRAFFIC // SATELLITE ADS-B',
  phoneContentHtml: `
    <!-- Dark Mode Cockpit Telemetry UI -->
    <div style="background: #0B132B; width: 100%; height: 100%; display: flex; flex-direction: column;">
      <!-- Phone Status Bar -->
      <div class="phone-status-bar light-text" style="color: #FFFFFF;">
        <span>9:41</span>
        <div class="status-right">
          <span style="color: #D4AF37; font-size: 11px; font-weight: 800;">RADAR ACTIVE</span>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0.5" y="0.5" width="14" height="11" rx="2.5" stroke="#FFFFFF"/><rect x="2" y="2" width="10" height="8" rx="1.5" fill="#D4AF37"/><path d="M16 4V8" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
      </div>

      <!-- Radar Top Bar -->
      <div style="padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(212,175,55,0.25); flex-shrink: 0;">
        <div>
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 800; color: #FFFFFF; letter-spacing: 1px;">FLIGHT VN-808</div>
          <div style="font-size: 10px; color: #D4AF37; font-weight: 700;">CAI ➔ DXB • LIVE TELEMETRY</div>
        </div>
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; color: #10B981; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 800;">
          CRUISING • ON TIME
        </div>
      </div>

      <!-- Telemetry Gauges HUD Overlay Top -->
      <div style="padding: 10px 16px 6px 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; z-index: 10; flex-shrink: 0;">
        <div style="background: rgba(15, 30, 54, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 8px; text-align: center;">
          <div style="font-size: 8.5px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Altitude</div>
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 800; color: #D4AF37;">43,000 FT</div>
        </div>
        <div style="background: rgba(15, 30, 54, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 8px; text-align: center;">
          <div style="font-size: 8.5px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Ground Speed</div>
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 800; color: #FFFFFF;">512 KTS</div>
        </div>
        <div style="background: rgba(15, 30, 54, 0.88); backdrop-filter: blur(8px); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 8px; text-align: center;">
          <div style="font-size: 8.5px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Tailwind</div>
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 800; color: #10B981;">+24 KTS</div>
        </div>
      </div>

      <!-- High-Tech Radar Map Viewport -->
      <div style="flex: 1; position: relative; overflow: hidden; background: radial-gradient(circle at 50% 50%, #152752 0%, #0B132B 85%);">
        <!-- Circular Radar Grid Rings -->
        <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;" viewBox="0 0 400 440">
          <circle cx="200" cy="220" r="70" stroke="rgba(212, 175, 55, 0.18)" stroke-width="1" fill="none"/>
          <circle cx="200" cy="220" r="140" stroke="rgba(212, 175, 55, 0.18)" stroke-width="1" fill="none"/>
          <circle cx="200" cy="220" r="210" stroke="rgba(212, 175, 55, 0.12)" stroke-width="1" fill="none" stroke-dasharray="4 4"/>
          <line x1="10" y1="220" x2="390" y2="220" stroke="rgba(212, 175, 55, 0.12)" stroke-width="1"/>
          <line x1="200" y1="10" x2="200" y2="430" stroke="rgba(212, 175, 55, 0.12)" stroke-width="1"/>
          
          <!-- Nearby Airspace Routes -->
          <path d="M 40 100 Q 200 160 360 120" stroke="rgba(148, 163, 184, 0.2)" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/>
          <path d="M 40 340 Q 200 280 360 320" stroke="rgba(148, 163, 184, 0.2)" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/>

          <!-- Golden Flight Path Arc from CAI to DXB -->
          <path d="M 70 270 Q 200 100 330 230" stroke="#D4AF37" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <path d="M 70 270 Q 180 130 240 165" stroke="#60A5FA" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="5 5"/>
          
          <!-- Airport Waypoints -->
          <circle cx="70" cy="270" r="6" fill="#D4AF37"/>
          <text x="60" y="296" fill="#FFFFFF" font-size="12" font-weight="800" font-family="'Space Grotesk', sans-serif">CAI</text>
          
          <circle cx="330" cy="230" r="6" fill="#D4AF37"/>
          <text x="320" y="256" fill="#FFFFFF" font-size="12" font-weight="800" font-family="'Space Grotesk', sans-serif">DXB</text>
          
          <!-- Aircraft Position Indicator with Radar Pulse -->
          <circle cx="240" cy="165" r="20" fill="rgba(212, 175, 55, 0.2)"/>
          <circle cx="240" cy="165" r="7" fill="#D4AF37"/>
          <polygon points="240,152 245,168 240,164 235,168" fill="#FFFFFF"/>
          <text x="254" y="170" fill="#D4AF37" font-size="10" font-weight="800" font-family="'Space Grotesk', sans-serif">G650ER • MACH 0.90</text>
        </svg>

        <!-- Live Telemetry Card Bottom of Radar -->
        <div style="position: absolute; bottom: 8px; left: 16px; right: 16px; background: rgba(15, 30, 54, 0.94); backdrop-filter: blur(12px); border: 1.5px solid rgba(212,175,55,0.4); border-radius: 16px; padding: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #FFFFFF;">Cairo (CAI) ➔ Dubai (DXB)</div>
              <div style="font-size: 10px; color: #D4AF37; margin-top: 1px;">Touchdown: 14:15 Local (Remaining: 1h 22m)</div>
            </div>
            <div style="background: #D4AF37; width: 30px; height: 30px; border-radius: 15px; display: flex; align-items: center; justify-content: center; color: #0F1E36; font-weight: 900; font-size: 13px;">
              ✈️
            </div>
          </div>
          
          <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.15); border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: 68%; height: 100%; background: #D4AF37; border-radius: 3px;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: #94A3B8;">Captain SatCom: <b style="color: #10B981;">CONNECTED</b></span>
            <span style="background: rgba(212,175,55,0.2); border: 1px solid #D4AF37; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; color: #D4AF37;">
              Cockpit Telemetry
            </span>
          </div>
        </div>
      </div>

      <!-- Live Waypoint Log Table in Dark Radar Mode -->
      <div style="padding: 10px 16px; background: #0F1E36; border-top: 1px solid rgba(212,175,55,0.2); display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;">
        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #94A3B8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
          <span>Waypoint</span>
          <span>Altitude</span>
          <span>Speed</span>
          <span>Status</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif; background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px;">
          <span style="color: #D4AF37; font-weight: 700;">WP-ALKAP</span>
          <span>43,000 FT</span>
          <span>512 KTS</span>
          <span style="color: #10B981; font-size: 9.5px; font-weight: 700;">PASSED</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif; background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); padding: 5px 8px; border-radius: 6px;">
          <span style="color: #D4AF37; font-weight: 700;">WP-MEDIN</span>
          <span>43,000 FT</span>
          <span>510 KTS</span>
          <span style="color: #60A5FA; font-size: 9.5px; font-weight: 700;">NEXT (14m)</span>
        </div>
      </div>

      <!-- App Bottom Nav Bar in Dark Mode -->
      ${renderBottomNav(1, true)}
    </div>
  `
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3: Curated Luxury Residences
// ─────────────────────────────────────────────────────────────────────────────
const screen3Html = generateHtml({
  screenNum: 3,
  eyebrow: 'COLLECTION N° 03 • STATEROOMS & RESIDENCES',
  headline: 'Curated Luxury Residences',
  subtitle: 'Handpicked five-star serviced suites, private villas & island sanctuaries.',
  isDarkChassis: false, // Titanium Gold
  isometricTransform: 'perspective(1800px) rotateY(-5deg) rotateX(9deg) rotateZ(-0.8deg)',
  splinePath: 'M 0 940 C 350 915, 750 915, 1080 940',
  footerMetaLeft: 'VANIR ARCHIVE • BESPOKE RESIDENCES & STATEROOMS // 5★ PALACE',
  phoneContentHtml: `
    <!-- Phone Status Bar -->
    <div class="phone-status-bar dark-text">
      <span>9:41</span>
      <div class="status-right">
        <span>5G</span>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0.5" y="0.5" width="14" height="11" rx="2.5" stroke="#0F1E36"/><rect x="2" y="2" width="10" height="8" rx="1.5" fill="#D4AF37"/><path d="M16 4V8" stroke="#0F1E36" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
    </div>

    <!-- App Header -->
    <div style="padding: 10px 20px 8px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(15,30,54,0.08); flex-shrink: 0;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; border-radius: 16px; background: #0F1E36; display: flex; align-items: center; justify-content: center; border: 1px solid #D4AF37;">
          <img src="${logoBase64}" style="width: 20px; height: 20px; border-radius: 50%;">
        </div>
        <div>
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: 800; color: #0F1E36; letter-spacing: 1px;">ROYAL RESIDENCES</div>
          <div style="font-size: 9.5px; color: #D4AF37; font-weight: 700;">HANDPICKED STATEROOMS</div>
        </div>
      </div>
      <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.4); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; color: #0F1E36;">
        5★ PALACE VERIFIED
      </div>
    </div>

    <!-- Full-Height App Content with space-between distribution -->
    <div style="padding: 12px 18px 14px 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;">
      
      <!-- Residence Image Hero -->
      <div style="width: 100%; height: 230px; border-radius: 18px; overflow: hidden; position: relative; box-shadow: 0 10px 25px rgba(15,30,54,0.15); border: 1.5px solid rgba(212, 175, 55, 0.35); flex-shrink: 0;">
        <img src="${hotelBase64}" style="width: 100%; height: 100%; object-fit: cover;">
        <div style="position: absolute; top: 10px; left: 10px; background: rgba(15, 30, 54, 0.88); backdrop-filter: blur(8px); padding: 5px 12px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.4); color: #D4AF37; font-size: 10px; font-weight: 800;">
          FOUR SEASONS PRIVATE SUITE
        </div>
        <div style="position: absolute; bottom: 10px; right: 10px; background: #D4AF37; color: #0F1E36; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 900;">
          4.98 ★ (120 REVIEWS)
        </div>
      </div>

      <!-- Hotel Detail Card -->
      <div style="background: #FFFFFF; border-radius: 18px; padding: 15px 18px; border: 1px solid rgba(212, 175, 55, 0.25); box-shadow: 0 6px 18px rgba(15,30,54,0.05); flex-shrink: 0;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 9px;">
          <div>
            <h2 style="font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #0F1E36;">The Royal Penthouse Residence</h2>
            <div style="font-size: 11px; color: #64748B; margin-top: 1px;">Nile Waterfront Panoramic View • Cairo VIP</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; font-weight: 900; color: #D4AF37;">$4,250</div>
            <div style="font-size: 9.5px; color: #64748B;">/ night</div>
          </div>
        </div>

        <!-- Date & Guest Selector Mockup -->
        <div style="background: #FAF9F6; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; padding: 9px 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px;">
          <div>
            <div style="font-size: 8px; color: #64748B; text-transform: uppercase; font-weight: 700;">Check-in / Check-out</div>
            <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Nov 20 – Nov 24 (4 Nights)</div>
          </div>
          <div style="border-left: 1px solid rgba(212,175,55,0.25); padding-left: 14px;">
            <div style="font-size: 8px; color: #64748B; text-transform: uppercase; font-weight: 700;">Guests</div>
            <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">2 VIP Guests</div>
          </div>
        </div>

        <!-- Amenities Chips -->
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
          <span style="background: #FFFDF5; border: 1px solid rgba(212,175,55,0.3); padding: 3px 8px; border-radius: 6px; font-size: 9.5px; color: #0F1E36; font-weight: 600;">🏊 Private Pool</span>
          <span style="background: #FFFDF5; border: 1px solid rgba(212,175,55,0.3); padding: 3px 8px; border-radius: 6px; font-size: 9.5px; color: #0F1E36; font-weight: 600;">🤵 24/7 Butler</span>
          <span style="background: #FFFDF5; border: 1px solid rgba(212,175,55,0.3); padding: 3px 8px; border-radius: 6px; font-size: 9.5px; color: #0F1E36; font-weight: 600;">🚁 Helipad</span>
        </div>

        <!-- CTA Button -->
        <div style="background: #D4AF37; padding: 13px; border-radius: 12px; text-align: center; color: #0F1E36; font-size: 13px; font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(212,175,55,0.35);">
          Reserve Residence Stateroom
        </div>
      </div>

      <!-- Second Curated Residence: Burj Al Arab Sky Penthouse -->
      <div style="background: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.25); box-shadow: 0 6px 18px rgba(15,30,54,0.06); flex-shrink: 0;">
        <div style="width: 100%; height: 150px; position: relative;">
          <img src="${dubaiBase64}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 10px; left: 10px; background: rgba(15, 30, 54, 0.88); padding: 4px 10px; border-radius: 10px; color: #D4AF37; font-size: 9.5px; font-weight: 800;">
            BURJ AL ARAB SKY PENTHOUSE
          </div>
          <div style="position: absolute; bottom: 10px; right: 10px; background: #D4AF37; color: #0F1E36; padding: 3px 8px; border-radius: 8px; font-size: 10.5px; font-weight: 900;">
            $6,800 / NIGHT
          </div>
        </div>
        <div style="padding: 11px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-family: 'Playfair Display', serif; font-size: 14.5px; font-weight: 700; color: #0F1E36;">Dubai Marina Skyline & Private Elevator</div>
            <div style="font-size: 10px; color: #64748B; margin-top: 1px;">Phantom VIII Chauffeur & Private Chef Included</div>
          </div>
          <span style="font-size: 9.5px; font-weight: 800; color: #0F1E36; background: #FAF9F6; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(212,175,55,0.3);">EXPLORE</span>
        </div>
      </div>

      <!-- Third Curated Residence: Santorini Cliff Villa -->
      <div style="background: #FFFFFF; border-radius: 16px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 1px solid #D4AF37; flex-shrink: 0;">
            <img src="${santoriniBase64}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div>
            <div style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: #0F1E36;">Oia Caldera Cliff Sanctuary</div>
            <div style="font-size: 9.5px; color: #64748B;">Santorini Aegean View • Private Yacht Slip</div>
          </div>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <div style="font-size: 14px; font-weight: 900; color: #D4AF37;">$5,400</div>
          <div style="font-size: 8.5px; color: #64748B;">/ night</div>
        </div>
      </div>

      <!-- Fourth Curated Residence: Villa d'Este Lake Como -->
      <div style="background: #FFFFFF; border-radius: 16px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 1px solid #D4AF37; flex-shrink: 0;">
            <img src="${transportBase64}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div>
            <div style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: #0F1E36;">Villa d'Este Palace Suite</div>
            <div style="font-size: 9.5px; color: #64748B;">Lake Como Waterfront • Private Riva Aquarama Slip</div>
          </div>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <div style="font-size: 14px; font-weight: 900; color: #D4AF37;">$7,200</div>
          <div style="font-size: 8.5px; color: #64748B;">/ night</div>
        </div>
      </div>

      <!-- Palace Concierge VIP Service Bar -->
      <div style="background: #FAF9F6; border-radius: 14px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">🏛️</span>
          <div>
            <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Vanir White-Glove Stateroom Guarantee</div>
            <div style="font-size: 9px; color: #64748B;">Pre-stocked preferred cellar, bespoke linens & VIP check-in</div>
          </div>
        </div>
        <span style="font-size: 9.5px; font-weight: 800; color: #D4AF37; text-transform: uppercase;">Guaranteed</span>
      </div>

    </div>

    <!-- App Bottom Nav Bar -->
    ${renderBottomNav(2, false)}
  `
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4: Premium Fleets & Superyachts
// ─────────────────────────────────────────────────────────────────────────────
const screen4Html = generateHtml({
  screenNum: 4,
  eyebrow: 'COLLECTION N° 04 • FLEET & MARITIME',
  headline: 'Premium Fleets & Superyachts',
  subtitle: 'Armored chauffeur transfers & Mediterranean mega-yacht charters.',
  isDarkChassis: true, // Matte Obsidian
  isometricTransform: 'perspective(1800px) rotateY(8deg) rotateX(7deg) rotateZ(1deg)',
  splinePath: 'M 0 940 C 350 970, 750 1020, 1080 1070',
  footerMetaLeft: 'VANIR FLEET // ARMORED CHAUFFEURS & MONACO SUPERYACHTS',
  phoneContentHtml: `
    <!-- Phone Status Bar -->
    <div class="phone-status-bar dark-text">
      <span>9:41</span>
      <div class="status-right">
        <span>5G</span>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0.5" y="0.5" width="14" height="11" rx="2.5" stroke="#0F1E36"/><rect x="2" y="2" width="10" height="8" rx="1.5" fill="#D4AF37"/><path d="M16 4V8" stroke="#0F1E36" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
    </div>

    <!-- App Header -->
    <div style="padding: 10px 20px 8px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(15,30,54,0.08); flex-shrink: 0;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; border-radius: 16px; background: #0F1E36; display: flex; align-items: center; justify-content: center; border: 1px solid #D4AF37;">
          <img src="${logoBase64}" style="width: 20px; height: 20px; border-radius: 50%;">
        </div>
        <div>
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: 800; color: #0F1E36; letter-spacing: 1px;">VANIR FLEET & YACHT</div>
          <div style="font-size: 9.5px; color: #D4AF37; font-weight: 700;">EXECUTIVE CHAUFFEUR & MARITIME</div>
        </div>
      </div>
      <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.4); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; color: #0F1E36;">
        B6/B7 ARMORED
      </div>
    </div>

    <!-- Full-Height App Content with space-between distribution -->
    <div style="padding: 12px 18px 14px 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;">
      
      <!-- Card 1: Chauffeur -->
      <div style="background: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.25); box-shadow: 0 6px 18px rgba(15,30,54,0.06); flex-shrink: 0;">
        <div style="width: 100%; height: 160px; position: relative;">
          <img src="${transportBase64}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 10px; left: 10px; background: rgba(15, 30, 54, 0.88); padding: 5px 12px; border-radius: 10px; color: #D4AF37; font-size: 9.5px; font-weight: 800;">
            ROLLS-ROYCE PHANTOM VIII EWB
          </div>
          <div style="position: absolute; bottom: 10px; right: 10px; background: #D4AF37; color: #0F1E36; padding: 4px 10px; border-radius: 8px; font-size: 10.5px; font-weight: 900;">
            $1,800 / TRANSFER
          </div>
        </div>
        <div style="padding: 11px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-family: 'Playfair Display', serif; font-size: 14.5px; font-weight: 700; color: #0F1E36;">Executive Chauffeur & Tarmac Escort</div>
            <div style="font-size: 10px; color: #64748B; margin-top: 1px;">Uniformed Chauffeur • Starlight Ceiling • Direct Jet Ramp Access</div>
          </div>
          <span style="font-size: 9.5px; font-weight: 800; color: #0F1E36; background: #FAF9F6; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(212,175,55,0.3);">SELECT</span>
        </div>
      </div>

      <!-- Card 2: Superyacht -->
      <div style="background: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.25); box-shadow: 0 6px 18px rgba(15,30,54,0.06); flex-shrink: 0;">
        <div style="width: 100%; height: 160px; position: relative;">
          <img src="${santoriniBase64}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 10px; left: 10px; background: rgba(15, 30, 54, 0.88); padding: 5px 12px; border-radius: 10px; color: #D4AF37; font-size: 9.5px; font-weight: 800;">
            BENETTI 65M CUSTOM SUPERYACHT
          </div>
          <div style="position: absolute; bottom: 10px; right: 10px; background: #D4AF37; color: #0F1E36; padding: 4px 10px; border-radius: 8px; font-size: 10.5px; font-weight: 900;">
            $45,000 / DAY
          </div>
        </div>
        <div style="padding: 11px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-family: 'Playfair Display', serif; font-size: 14.5px; font-weight: 700; color: #0F1E36;">Mediterranean & Arabian Gulf Charter</div>
            <div style="font-size: 10px; color: #64748B; margin-top: 1px;">Helipad • Jacuzzi Beach Club • Crew of 16 • Monaco & Dubai Berths</div>
          </div>
          <span style="font-size: 9.5px; font-weight: 800; color: #0F1E36; background: #FAF9F6; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(212,175,55,0.3);">CHARTER</span>
        </div>
      </div>

      <!-- Card 3: Dubai Exotic Hypercar Escort Convoy -->
      <div style="background: #FFFFFF; border-radius: 18px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.25); box-shadow: 0 6px 18px rgba(15,30,54,0.06); flex-shrink: 0;">
        <div style="width: 100%; height: 150px; position: relative;">
          <img src="${dubaiBase64}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 10px; left: 10px; background: rgba(15, 30, 54, 0.88); padding: 5px 12px; border-radius: 10px; color: #D4AF37; font-size: 9.5px; font-weight: 800;">
            DUBAI EXOTIC HYPERCAR CONVOY
          </div>
          <div style="position: absolute; bottom: 10px; right: 10px; background: #D4AF37; color: #0F1E36; padding: 4px 10px; border-radius: 8px; font-size: 10.5px; font-weight: 900;">
            $3,200 / DAY
          </div>
        </div>
        <div style="padding: 11px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-family: 'Playfair Display', serif; font-size: 14.5px; font-weight: 700; color: #0F1E36;">Ferrari SF90 & Revuelto Highway Convoy</div>
            <div style="font-size: 10px; color: #64748B; margin-top: 1px;">Dedicated Lead Pilot • Closed Route Security • Direct Tarmac Handover</div>
          </div>
          <span style="font-size: 9.5px; font-weight: 800; color: #0F1E36; background: #FAF9F6; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(212,175,55,0.3);">EXPLORE</span>
        </div>
      </div>

      <!-- Armored Motorcade Specs Bar (4 specs) -->
      <div style="background: #FFFFFF; border-radius: 14px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.25); display: flex; justify-content: space-around; align-items: center; flex-shrink: 0;">
        <div style="text-align: center;">
          <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">B7 Ballistic</div>
          <div style="font-size: 8px; color: #64748B; text-transform: uppercase;">Armor Level</div>
        </div>
        <div style="width: 1px; height: 20px; background: rgba(212,175,55,0.25);"></div>
        <div style="text-align: center;">
          <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Run-Flat</div>
          <div style="font-size: 8px; color: #64748B; text-transform: uppercase;">Reinforced Tires</div>
        </div>
        <div style="width: 1px; height: 20px; background: rgba(212,175,55,0.25);"></div>
        <div style="text-align: center;">
          <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Close Protection</div>
          <div style="font-size: 8px; color: #64748B; text-transform: uppercase;">Tactical Escort</div>
        </div>
        <div style="width: 1px; height: 20px; background: rgba(212,175,55,0.25);"></div>
        <div style="text-align: center;">
          <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">SatCom Uplink</div>
          <div style="font-size: 8px; color: #64748B; text-transform: uppercase;">Encrypted Radio</div>
        </div>
      </div>

      <!-- Diplomatic Close Protection Escort Banner -->
      <div style="background: #FAF9F6; border-radius: 14px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 18px;">🛡️</span>
          <div>
            <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Tarmac Direct Escort Protocol</div>
            <div style="font-size: 9.5px; color: #64748B;">Ramp-side VIP clearance direct from jet stairs to armored vehicle</div>
          </div>
        </div>
        <span style="font-size: 9.5px; font-weight: 800; color: #10B981; background: rgba(16,185,129,0.12); padding: 4px 10px; border-radius: 8px;">ACTIVE</span>
      </div>

      <!-- Action Button -->
      <div style="background: #D4AF37; padding: 14px; border-radius: 12px; text-align: center; color: #0F1E36; font-size: 13px; font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(212,175,55,0.35); flex-shrink: 0;">
        Reserve Bespoke Fleet & Escort
      </div>

    </div>

    <!-- App Bottom Nav Bar -->
    ${renderBottomNav(3, false)}
  `
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5: Bespoke Digital Boarding Pass
// ─────────────────────────────────────────────────────────────────────────────
const screen5Html = generateHtml({
  screenNum: 5,
  eyebrow: 'COLLECTION N° 05 • EXPEDITED CLEARANCE',
  headline: 'Bespoke Digital Boarding Pass',
  subtitle: 'Biometric tarmac access, priority FBO terminal clearance & NFC passes.',
  isDarkChassis: false, // Titanium Gold
  isometricTransform: 'perspective(1800px) rotateY(-6deg) rotateX(7deg) rotateZ(-1deg)',
  splinePath: 'M 0 1070 C 350 1110, 750 1150, 1080 1190',
  footerMetaLeft: 'VANIR AIRPORT CLEARANCE // FIRST CLASS SUITE PASS // IATA VIP',
  phoneContentHtml: `
    <!-- Phone Status Bar -->
    <div class="phone-status-bar dark-text">
      <span>9:41</span>
      <div class="status-right">
        <span>5G</span>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0.5" y="0.5" width="14" height="11" rx="2.5" stroke="#0F1E36"/><rect x="2" y="2" width="10" height="8" rx="1.5" fill="#D4AF37"/><path d="M16 4V8" stroke="#0F1E36" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
    </div>

    <!-- App Header -->
    <div style="padding: 10px 20px 8px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(15,30,54,0.08); flex-shrink: 0;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 32px; height: 32px; border-radius: 16px; background: #0F1E36; display: flex; align-items: center; justify-content: center; border: 1px solid #D4AF37;">
          <img src="${logoBase64}" style="width: 20px; height: 20px; border-radius: 50%;">
        </div>
        <div>
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: 800; color: #0F1E36; letter-spacing: 1px;">ROYAL BOARDING PASS</div>
          <div style="font-size: 9.5px; color: #D4AF37; font-weight: 700;">BIOMETRIC EXPEDITED ACCESS</div>
        </div>
      </div>
      <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; color: #10B981;">
        TARMAC READY
      </div>
    </div>

    <!-- Full-Height App Content with space-between distribution -->
    <div style="padding: 12px 18px 14px 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;">
      
      <!-- Physical-feel Ivory Luxury Boarding Pass Ticket Card -->
      <div style="background: #FFFFFF; border-radius: 20px; border: 1.5px solid #D4AF37; box-shadow: 0 10px 28px rgba(15,30,54,0.1); overflow: hidden; position: relative; flex-shrink: 0;">
        <!-- Ticket Header (Navy Gold) -->
        <div style="background: #0F1E36; padding: 16px 20px; color: #FFFFFF; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #D4AF37;">
          <div>
            <div style="font-family: 'Cinzel', serif; font-size: 14px; font-weight: 800; color: #D4AF37; letter-spacing: 2px;">VANIR ROYAL AVIATION</div>
            <div style="font-size: 10px; color: #94A3B8; margin-top: 1px;">ROYAL FIRST CLASS (F) • FLIGHT VN-808</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; font-weight: 700; color: #D4AF37;">DATE</div>
            <div style="font-size: 12px; font-weight: 800; color: #FFFFFF;">20 NOV 2026</div>
          </div>
        </div>

        <!-- Ticket Body -->
        <div style="padding: 18px 20px;">
          <!-- Route Large IATA Display -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div>
              <div style="font-family: 'Space Grotesk', sans-serif; font-size: 38px; font-weight: 900; color: #0F1E36; line-height: 1;">CAI</div>
              <div style="font-size: 11px; font-weight: 600; color: #64748B; margin-top: 3px;">Cairo VIP Terminal</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 22px; color: #D4AF37;">✈️</div>
              <div style="font-size: 10px; font-weight: 800; color: #D4AF37; margin-top: 2px;">NON-STOP</div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: 'Space Grotesk', sans-serif; font-size: 38px; font-weight: 900; color: #0F1E36; line-height: 1;">DXB</div>
              <div style="font-size: 11px; font-weight: 600; color: #64748B; margin-top: 3px;">Dubai World Central</div>
            </div>
          </div>

          <!-- Passenger & Seat Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #FAF9F6; border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 10px 12px; margin-bottom: 10px;">
            <div>
              <div style="font-size: 8.5px; color: #64748B; text-transform: uppercase; font-weight: 700;">Passenger</div>
              <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Lord A. Wright</div>
            </div>
            <div>
              <div style="font-size: 8.5px; color: #64748B; text-transform: uppercase; font-weight: 700;">Seat / Suite</div>
              <div style="font-size: 11.5px; font-weight: 800; color: #D4AF37;">01A (Master)</div>
            </div>
            <div>
              <div style="font-size: 8.5px; color: #64748B; text-transform: uppercase; font-weight: 700;">Gate</div>
              <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">VIP FBO 01</div>
            </div>
          </div>

          <!-- Flight Timing & Cabin Info Row -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #FAF9F6; border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 8px 12px; margin-bottom: 10px; font-size: 10.5px;">
            <div><span style="color: #64748B; font-size: 8px; text-transform: uppercase; font-weight: 700; display: block;">Boarding</span><b style="color: #0F1E36;">11:00 AM</b></div>
            <div style="border-left: 1px solid rgba(212,175,55,0.25); height: 20px;"></div>
            <div><span style="color: #64748B; font-size: 8px; text-transform: uppercase; font-weight: 700; display: block;">Departure</span><b style="color: #0F1E36;">11:30 AM</b></div>
            <div style="border-left: 1px solid rgba(212,175,55,0.25); height: 20px;"></div>
            <div><span style="color: #64748B; font-size: 8px; text-transform: uppercase; font-weight: 700; display: block;">Duration</span><b style="color: #D4AF37;">3h 15m Direct</b></div>
          </div>

          <!-- High-Tech Barcode with Holographic Laser Line -->
          <div style="text-align: center; border-top: 1px solid rgba(15,30,54,0.08); padding-top: 10px;">
            <div style="display: flex; justify-content: center; gap: 3.5px; height: 42px; align-items: flex-end; margin-bottom: 4px;">
              ${Array.from({ length: 42 }).map((_, i) => {
                const w = (i % 3 === 0 ? 3.5 : i % 2 === 0 ? 2.5 : 1.5);
                return `<div style="width: ${w}px; height: 100%; background: #0F1E36;"></div>`;
              }).join('')}
            </div>
            <div style="font-family: 'Space Grotesk', sans-serif; font-size: 10px; letter-spacing: 2.5px; color: #64748B;">
              *VN808-01A-984275-VIP*
            </div>
          </div>
        </div>

        <!-- Ticket Footer Tarmac Escort Indicator -->
        <div style="background: #FAF9F6; padding: 11px; text-align: center; border-top: 1px solid rgba(212,175,55,0.2); font-size: 11px; font-weight: 800; color: #0F1E36;">
          🚘 Rolls-Royce Tarmac Chauffeur Escort Included • Stand 04
        </div>
      </div>

      <!-- FBO Private Lounge Access Pass (with image banner) -->
      <div style="background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid rgba(212,175,55,0.25); box-shadow: 0 4px 14px rgba(15,30,54,0.05); flex-shrink: 0;">
        <div style="width: 100%; height: 105px; position: relative;">
          <img src="${hotelBase64}" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 8px; left: 8px; background: rgba(15, 30, 54, 0.88); padding: 4px 10px; border-radius: 8px; color: #D4AF37; font-size: 9px; font-weight: 800;">
            AL MAKTOUM FBO ROYAL SUITE 04
          </div>
          <div style="position: absolute; bottom: 8px; right: 8px; background: #D4AF37; color: #0F1E36; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 900;">
            ACCESS CONFIRMED
          </div>
        </div>
        <div style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11.5px; font-weight: 800; color: #0F1E36;">Private Terminal Salon & Dom Pérignon Cellar</div>
            <div style="font-size: 9.5px; color: #64748B; margin-top: 1px;">Dedicated Butler • Diplomatic Immigration Fast-Track</div>
          </div>
          <span style="font-size: 9.5px; font-weight: 800; color: #D4AF37; background: #FFFDF5; border: 1px solid rgba(212,175,55,0.3); padding: 4px 8px; border-radius: 6px;">ACCESS PASS</span>
        </div>
      </div>

      <!-- Biometric Clearance & Baggage Telemetry Bar -->
      <div style="background: #FFFFFF; border-radius: 14px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 16px;">
            🛂
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #0F1E36;">Biometric Clearance: Verified</div>
            <div style="font-size: 9px; color: #64748B;">2 Bags Tagged (VN-RFID-892) • Loaded on Jet Cargo Hold</div>
          </div>
        </div>
        <span style="font-size: 9px; font-weight: 800; color: #10B981; background: rgba(16, 185, 129, 0.12); padding: 4px 8px; border-radius: 6px;">FAST-TRACK</span>
      </div>

      <!-- In-Flight VIP Sommelier & Dining Card -->
      <div style="background: #FFFFFF; border-radius: 14px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(212,175,55,0.15); display: flex; align-items: center; justify-content: center; font-size: 16px;">
            🍾
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #0F1E36;">Imperial Beluga Caviar & Dom Pérignon</div>
            <div style="font-size: 9px; color: #64748B;">Executive in-flight dining service scheduled 35m post-climb</div>
          </div>
        </div>
        <span style="font-size: 9px; font-weight: 800; color: #D4AF37; background: #FFFDF5; border: 1px solid rgba(212,175,55,0.3); padding: 4px 8px; border-radius: 6px;">CONFIRMED</span>
      </div>

      <!-- In-Flight Stateroom Turn-down Request Card -->
      <div style="background: #FAF9F6; border-radius: 14px; padding: 11px 14px; border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 16px;">🛏️</span>
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #0F1E36;">Master Stateroom Suite Prepared</div>
            <div style="font-size: 9px; color: #64748B;">Frette Italian Linens • Cabin Temperature 21.5°C • Bvlgari Kit</div>
          </div>
        </div>
        <span style="font-size: 9px; font-weight: 800; color: #D4AF37; text-transform: uppercase;">READY</span>
      </div>

      <!-- Add to Apple Wallet / Google Wallet Button -->
      <div style="background: #0F1E36; border: 1.5px solid #D4AF37; padding: 14px; border-radius: 12px; text-align: center; color: #D4AF37; font-size: 12.5px; font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(15,30,54,0.15); flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <span>💳</span> Add to Apple & Google Wallet
      </div>

    </div>

    <!-- App Bottom Nav Bar -->
    ${renderBottomNav(4, false)}
  `
});

// Write HTML files
const htmlFiles = [
  { name: 'screen_1.html', content: screen1Html, outPng: 'screen_1.png' },
  { name: 'screen_2.html', content: screen2Html, outPng: 'screen_2.png' },
  { name: 'screen_3.html', content: screen3Html, outPng: 'screen_3.png' },
  { name: 'screen_4.html', content: screen4Html, outPng: 'screen_4.png' },
  { name: 'screen_5.html', content: screen5Html, outPng: 'screen_5.png' },
];

for (const f of htmlFiles) {
  const filePath = path.join(outDir, f.name);
  fs.writeFileSync(filePath, f.content, 'utf8');
  console.log(`Saved ${f.name}`);
}

console.log('Rendering screenshots with Headless Chrome at 1080x1920 (16:9 vertical ratio)...');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

for (const f of htmlFiles) {
  const htmlPath = path.join(outDir, f.name);
  const pngPath = path.join(outDir, f.outPng);
  console.log(`Rendering ${f.outPng}...`);
  try {
    execSync(
      `"${chromePath}" --headless=new --disable-gpu --screenshot="${pngPath}" --window-size=1080,1920 --hide-scrollbars "file://${htmlPath}"`,
      { stdio: 'inherit' }
    );
    console.log(`Successfully generated: ${f.outPng}`);
  } catch (err) {
    console.error(`Error rendering ${f.outPng}:`, err.message);
  }
}

console.log('All 5 screenshots generated successfully in:', outDir);
