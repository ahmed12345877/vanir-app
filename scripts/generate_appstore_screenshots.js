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
const maldivesBase64 = getBase64('src/assets/images/hero/hero_maldives.jpg');
const pyramidsBase64 = getBase64('src/assets/images/hero/hero_pyramids.jpg');

// 3D Icons
const jetIconBase64 = getBase64('src/assets/icons/3d/jet_3d.png');
const yachtIconBase64 = getBase64('src/assets/icons/3d/yacht_3d.png');
const carIconBase64 = getBase64('src/assets/icons/3d/car_3d.png');
const hotelIconBase64 = getBase64('src/assets/icons/3d/hotel_3d.png');
const flightsIconBase64 = getBase64('src/assets/icons/3d/flights_3d.png');
const apartmentsIconBase64 = getBase64('src/assets/icons/3d/apartments_3d.png');

const outDir = path.join(process.cwd(), 'appstore_screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tmpHtmlDir = path.join(process.cwd(), 'node_modules', '.cache', 'appstore_html');
if (!fs.existsSync(tmpHtmlDir)) {
  fs.mkdirSync(tmpHtmlDir, { recursive: true });
}

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const commonCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  width: 1290px;
  height: 2796px;
  background: radial-gradient(circle at 50% 12%, #112548 0%, #081226 45%, #040812 100%);
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  position: relative;
  color: #FFFFFF;
  -webkit-font-smoothing: antialiased;
}

/* Background Atmospheric Radial Glow */
.ambient-glow-top {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 1400px;
  height: 900px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(17, 37, 72, 0.4) 40%, transparent 75%);
  pointer-events: none;
  z-index: 1;
}

.ambient-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 900px;
  background-image: 
    radial-gradient(1.5px 1.5px at 120px 80px, rgba(255,255,255,0.7), transparent),
    radial-gradient(1.5px 1.5px at 340px 180px, rgba(212,175,55,0.8), transparent),
    radial-gradient(1.5px 1.5px at 780px 120px, rgba(255,255,255,0.6), transparent),
    radial-gradient(1.5px 1.5px at 1120px 220px, rgba(212,175,55,0.7), transparent),
    radial-gradient(1px 1px at 560px 290px, rgba(255,255,255,0.5), transparent),
    radial-gradient(1.5px 1.5px at 980px 380px, rgba(212,175,55,0.6), transparent);
  pointer-events: none;
  z-index: 1;
}

/* Top Marketing Header */
.marketing-header {
  position: relative;
  z-index: 10;
  padding-top: 140px;
  padding-left: 90px;
  padding-right: 90px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(212, 175, 55, 0.14);
  border: 1.5px solid rgba(212, 175, 55, 0.55);
  border-radius: 999px;
  padding: 10px 28px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15);
}

.kicker-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #D4AF37;
  box-shadow: 0 0 10px #D4AF37;
}

.kicker-text {
  font-family: 'Cinzel', serif;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #D4AF37;
  text-transform: uppercase;
}

.main-headline {
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-size: 64px;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: 1.5px;
  color: #FFFFFF;
  margin-bottom: 22px;
  text-shadow: 0 6px 30px rgba(0, 0, 0, 0.7);
}

.main-headline span.gold {
  color: #D4AF37;
  background: linear-gradient(135deg, #FFE8A3 0%, #D4AF37 50%, #997A24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sub-headline {
  font-size: 26px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0.5px;
  max-width: 950px;
  line-height: 1.45;
}

/* Device Shell (iPhone 16 Pro Max Style Titanium Mockup) */
.device-stage {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 1060px;
  height: 2020px;
  background: #0D1626;
  border-radius: 90px 90px 0 0;
  padding: 24px 24px 0 24px;
  border: 4px solid rgba(212, 175, 55, 0.5);
  box-shadow: 
    0 -25px 80px rgba(0, 0, 0, 0.85),
    0 -10px 40px rgba(212, 175, 55, 0.25),
    inset 0 2px 10px rgba(255, 255, 255, 0.15);
  z-index: 5;
}

/* Screen Interior */
.screen-interior {
  width: 100%;
  height: 100%;
  background: #FAF9F6;
  border-radius: 72px 72px 0 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Dynamic Island */
.dynamic-island {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 48px;
  background: #000000;
  border-radius: 24px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
}

.island-sensor {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #111;
  border: 1px solid #222;
}
`;

// ==========================================
// SCREENSHOT 1: HOME & ROYAL NAVY HERO
// ==========================================
function getHtmlSlide1() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonCSS}

.hero-royal-navy {
  position: relative;
  background: linear-gradient(180deg, #050A14 0%, #0A162B 40%, #112340 75%, #182E52 100%);
  padding: 85px 40px 48px 40px;
  overflow: hidden;
}

.hero-jet-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.28;
}

.hero-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.hero-brand {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-logo {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 2px solid #D4AF37;
  background: #FFFFFF;
}

.hero-titles h1 {
  font-family: 'Cinzel', serif;
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 4px;
  color: #FFFFFF;
}

.hero-titles p {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #D4AF37;
}

.hero-actions {
  display: flex;
  gap: 14px;
}

.hero-btn {
  width: 58px;
  height: 58px;
  border-radius: 29px;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(212, 175, 55, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

/* VIP Member Card */
.vip-card {
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, #162644 0%, #0C172B 100%);
  border: 1.8px solid rgba(212, 175, 55, 0.55);
  border-radius: 28px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.vip-avatar {
  width: 72px;
  height: 72px;
  border-radius: 36px;
  border: 2px solid #D4AF37;
  background: #0B1526;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #D4AF37;
  font-weight: 900;
}

.vip-info {
  flex: 1;
}

.vip-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.vip-name {
  font-size: 22px;
  font-weight: 800;
  color: #FFFFFF;
}

.vip-badge {
  background: rgba(212, 175, 55, 0.18);
  border: 1px solid rgba(212, 175, 55, 0.7);
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 900;
  color: #D4AF37;
  letter-spacing: 1.5px;
}

.vip-sub {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
}

.vip-id {
  font-size: 13px;
  color: #D4AF37;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-top: 4px;
}

/* Soft Bottom Feathering Overlay */
.hero-bottom-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55px;
  background: linear-gradient(180deg, transparent 0%, rgba(250, 249, 246, 0.4) 40%, #FAF9F6 100%);
  pointer-events: none;
  z-index: 3;
}

/* Categories Row with 3D Icons */
.categories-strip {
  background: #FAF9F6;
  padding: 24px 30px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1.5px solid rgba(212, 175, 55, 0.2);
}

.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.cat-img {
  width: 82px;
  height: 82px;
  filter: drop-shadow(0 6px 12px rgba(212, 175, 55, 0.25));
}

.cat-label {
  font-size: 16px;
  font-weight: 800;
  color: #1C1917;
  letter-spacing: 0.5px;
}

/* Feed Card Container */
.feed-content {
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.luxury-card {
  position: relative;
  border-radius: 36px;
  overflow: hidden;
  height: 520px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.35);
}

.luxury-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.luxury-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.3) 40%, rgba(10,16,28,0.95) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 30px;
}

.card-top-tag {
  align-self: flex-start;
  background: rgba(13, 23, 43, 0.85);
  border: 1.2px solid #D4AF37;
  color: #D4AF37;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.flight-route-box {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 26px;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.carrier-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.carrier-title {
  font-size: 16px;
  font-weight: 900;
  color: #1C1917;
  letter-spacing: 1.5px;
}

.carrier-iata {
  font-size: 13px;
  font-weight: 800;
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
}

.flight-cities {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.airport-code {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 34px;
  font-weight: 800;
  color: #1C1917;
}

.city-name {
  font-size: 14px;
  font-weight: 700;
  color: #64748B;
}

.flight-divider {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 24px;
}

.flight-divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  border-top: 2px dashed #CBD5E1;
}

.plane-icon {
  background: #FAF9F6;
  border: 1.5px solid #D4AF37;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-size: 18px;
}
</style>
</head>
<body>
  <div class="ambient-glow-top"></div>
  <div class="ambient-stars"></div>

  <div class="marketing-header">
    <div class="kicker-pill">
      <div class="kicker-pill-dot"></div>
      <span class="kicker-text">VANIR ROYAL PRIVILEGE</span>
    </div>
    <h1 class="main-headline">BESPOKE LUXURY <br><span class="gold">AT YOUR COMMAND</span></h1>
    <p class="sub-headline">Private Jets, Superyachts, Palaces & VIP Fleet Managed by Your 24/7 Royal Concierge</p>
  </div>

  <div class="device-stage">
    <div class="screen-interior">
      <div class="dynamic-island">
        <div class="island-sensor"></div>
        <div style="color: #D4AF37; font-size: 12px; font-weight: 800;">VANIR</div>
      </div>

      <!-- Royal Navy Hero -->
      <div class="hero-royal-navy">
        <img class="hero-jet-bg" src="${jetFlightBase64}" />

        <div class="hero-topbar">
          <div class="hero-brand">
            <img class="hero-logo" src="${logoBase64}" />
            <div class="hero-titles">
              <h1>VANIR</h1>
              <p>ROYAL CONCIERGE</p>
            </div>
          </div>
          <div class="hero-actions">
            <div class="hero-btn">🔍</div>
            <div class="hero-btn">🔔</div>
          </div>
        </div>

        <div class="vip-card">
          <div class="vip-avatar">V</div>
          <div class="vip-info">
            <div class="vip-header">
              <span class="vip-name">VIP Member</span>
              <span class="vip-badge">ROYAL TIER</span>
            </div>
            <p class="vip-sub">Bespoke private jet & superyacht concierge</p>
            <p class="vip-id">MEMBER NO. VN-0042</p>
          </div>
          <div style="font-size: 24px; color: #D4AF37;">→</div>
        </div>

        <div class="hero-bottom-fade"></div>
      </div>

      <!-- 3D Luxury Categories Strip -->
      <div class="categories-strip">
        <div class="cat-item">
          <img class="cat-img" src="${flightsIconBase64}" />
          <span class="cat-label">Flights</span>
        </div>
        <div class="cat-item">
          <img class="cat-img" src="${jetIconBase64}" />
          <span class="cat-label">Private Jet</span>
        </div>
        <div class="cat-item">
          <img class="cat-img" src="${hotelIconBase64}" />
          <span class="cat-label">Hotels</span>
        </div>
        <div class="cat-item">
          <img class="cat-img" src="${yachtIconBase64}" />
          <span class="cat-label">Yachts</span>
        </div>
        <div class="cat-item">
          <img class="cat-img" src="${carIconBase64}" />
          <span class="cat-label">Fleet</span>
        </div>
      </div>

      <!-- Luxury Flight Card Mock -->
      <div class="feed-content">
        <div class="luxury-card">
          <img src="${jetFlightBase64}" />
          <div class="luxury-card-overlay">
            <div class="card-top-tag">ROYAL TRANSCONTINENTAL</div>

            <div class="flight-route-box">
              <div class="carrier-line">
                <span class="carrier-title">EMIRATES • FIRST CLASS SUITE</span>
                <span class="carrier-iata">IATA GDS LIVE</span>
              </div>
              <div class="flight-cities">
                <div>
                  <div class="airport-code">CAI</div>
                  <div class="city-name">Cairo</div>
                </div>
                <div class="flight-divider">
                  <div class="plane-icon">✈</div>
                </div>
                <div style="text-align: right;">
                  <div class="airport-code">LON</div>
                  <div class="city-name">London Heathrow</div>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 12px;">
                <span style="color: #D4AF37; font-weight: 800; font-size: 14px;">5.0 ★ VIP Rated</span>
                <span style="color: #1C1917; font-weight: 800; font-size: 15px;">Private Jet & Suite Access →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;
}

// ==========================================
// SCREENSHOT 2: PRIVATE AVIATION
// ==========================================
function getHtmlSlide2() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonCSS}

.jet-header-bar {
  background: #080E1B;
  padding: 85px 40px 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1.5px solid rgba(212, 175, 55, 0.35);
}

.jet-header-title h2 {
  font-family: 'Cinzel', serif;
  font-size: 30px;
  color: #FFFFFF;
  letter-spacing: 2px;
}

.jet-header-title p {
  font-size: 13px;
  font-weight: 800;
  color: #D4AF37;
  letter-spacing: 1.5px;
}

.jet-content {
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.jet-card {
  background: #FFFFFF;
  border-radius: 36px;
  overflow: hidden;
  border: 1.5px solid rgba(212, 175, 55, 0.4);
  box-shadow: 0 16px 40px rgba(0,0,0,0.08);
}

.jet-photo-wrap {
  position: relative;
  height: 380px;
}

.jet-photo-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.jet-photo-tag {
  position: absolute;
  top: 24px;
  left: 24px;
  background: rgba(13, 23, 43, 0.88);
  border: 1.2px solid #D4AF37;
  color: #D4AF37;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.jet-details-panel {
  padding: 28px 32px;
}

.jet-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.jet-title-row h3 {
  font-size: 26px;
  font-weight: 800;
  color: #1C1917;
}

.jet-price-box {
  text-align: right;
}

.jet-price-val {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1C1917;
}

.jet-price-unit {
  font-size: 13px;
  font-weight: 700;
  color: #64748B;
}

.jet-specs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: #F8FAFC;
  padding: 18px 20px;
  border-radius: 20px;
  margin: 18px 0;
}

.spec-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-label {
  font-size: 12px;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.spec-val {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
}

.charter-cta-btn {
  background: linear-gradient(135deg, #0D172B 0%, #152544 100%);
  border: 1.5px solid #D4AF37;
  border-radius: 22px;
  padding: 20px;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
}
</style>
</head>
<body>
  <div class="ambient-glow-top"></div>
  <div class="ambient-stars"></div>

  <div class="marketing-header">
    <div class="kicker-pill">
      <div class="kicker-pill-dot"></div>
      <span class="kicker-text">GLOBAL WINGS</span>
    </div>
    <h1 class="main-headline">CHARTER PRIVATE JETS <br><span class="gold">ON-DEMAND</span></h1>
    <p class="sub-headline">Gulfstream G650ER, Bombardier Global 7500 & Transcontinental Flagships</p>
  </div>

  <div class="device-stage">
    <div class="screen-interior">
      <div class="dynamic-island">
        <div class="island-sensor"></div>
        <div style="color: #D4AF37; font-size: 12px; font-weight: 800;">VANIR AVIATION</div>
      </div>

      <div class="jet-header-bar">
        <div class="jet-header-title">
          <h2>PRIVATE AVIATION</h2>
          <p>GULFSTREAM & BOMBARDIER VIP FLEET</p>
        </div>
        <div style="width: 50px; height: 50px; border-radius: 25px; background: rgba(255,255,255,0.1); border: 1px solid #D4AF37; display: flex; align-items: center; justify-content: center; font-size: 20px;">⚙</div>
      </div>

      <div class="jet-content">
        <div class="jet-card">
          <div class="jet-photo-wrap">
            <img src="${jetFlightBase64}" />
            <div class="jet-photo-tag">ULTRA LONG RANGE</div>
          </div>
          <div class="jet-details-panel">
            <div class="jet-title-row">
              <div>
                <h3>Bombardier Global 7500</h3>
                <p style="color: #64748B; font-size: 14px; margin-top: 4px;">4 Private Living Spaces • Master Stateroom</p>
              </div>
              <div class="jet-price-box">
                <div class="jet-price-val">$16,500</div>
                <div class="jet-price-unit">per flight hour</div>
              </div>
            </div>

            <div class="jet-specs-grid">
              <div class="spec-cell">
                <span class="spec-label">Flight Range</span>
                <span class="spec-val">7,700 nm</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">Passengers</span>
                <span class="spec-val">19 VIP Seats</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">Cruise Speed</span>
                <span class="spec-val">Mach 0.925</span>
              </div>
            </div>

            <div class="charter-cta-btn">
              <span>REQUEST VIP CHARTER FLIGHT</span>
              <span style="color: #D4AF37;">→</span>
            </div>
          </div>
        </div>

        <!-- Second Jet Card Sneak Peek -->
        <div class="jet-card" style="opacity: 0.9;">
          <div class="jet-photo-wrap" style="height: 240px;">
            <img src="${jetInteriorBase64}" />
            <div class="jet-photo-tag">INTERCONTINENTAL EXECUTIVE</div>
          </div>
          <div style="padding: 20px 32px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="font-size: 20px; font-weight: 800; color: #1C1917;">Gulfstream G650ER</h4>
              <p style="color: #64748B; font-size: 13px;">Panoramic Oval Windows • Ka-band Ultra WiFi</p>
            </div>
            <div style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 800; color: #1C1917;">$15,000<span style="font-size: 12px; color: #64748B;">/hr</span></div>
          </div>
        </div>

      </div>

    </div>
  </div>
</body>
</html>`;
}

// ==========================================
// SCREENSHOT 3: ROYAL SUPERYACHTS
// ==========================================
function getHtmlSlide3() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonCSS}

.yacht-header-bar {
  background: #080E1B;
  padding: 85px 40px 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1.5px solid rgba(212, 175, 55, 0.35);
}

.yacht-header-title h2 {
  font-family: 'Cinzel', serif;
  font-size: 30px;
  color: #FFFFFF;
  letter-spacing: 2px;
}

.yacht-header-title p {
  font-size: 13px;
  font-weight: 800;
  color: #D4AF37;
  letter-spacing: 1.5px;
}

.yacht-content {
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.yacht-card {
  background: #FFFFFF;
  border-radius: 36px;
  overflow: hidden;
  border: 1.5px solid rgba(212, 175, 55, 0.4);
  box-shadow: 0 16px 40px rgba(0,0,0,0.08);
}

.yacht-photo-wrap {
  position: relative;
  height: 400px;
}

.yacht-photo-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.yacht-photo-tag {
  position: absolute;
  top: 24px;
  left: 24px;
  background: rgba(13, 23, 43, 0.88);
  border: 1.2px solid #D4AF37;
  color: #D4AF37;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.yacht-details-panel {
  padding: 28px 32px;
}

.yacht-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.yacht-title-row h3 {
  font-size: 26px;
  font-weight: 800;
  color: #1C1917;
}

.yacht-specs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: #F8FAFC;
  padding: 18px 20px;
  border-radius: 20px;
  margin: 18px 0;
}

.spec-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-label {
  font-size: 11px;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
}

.spec-val {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}

.yacht-features-row {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.feat-pill {
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #B45309;
  font-size: 13px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 8px;
}

.yacht-cta-btn {
  background: linear-gradient(135deg, #0D172B 0%, #152544 100%);
  border: 1.5px solid #D4AF37;
  border-radius: 22px;
  padding: 20px;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
</style>
</head>
<body>
  <div class="ambient-glow-top"></div>
  <div class="ambient-stars"></div>

  <div class="marketing-header">
    <div class="kicker-pill">
      <div class="kicker-pill-dot"></div>
      <span class="kicker-text">AZURE HORIZONS</span>
    </div>
    <h1 class="main-headline">ROYAL SUPERYACHT <br><span class="gold">CHARTERS</span></h1>
    <p class="sub-headline">Majesty 120, Benetti & Bespoke Mediterranean & Red Sea Escapades</p>
  </div>

  <div class="device-stage">
    <div class="screen-interior">
      <div class="dynamic-island">
        <div class="island-sensor"></div>
        <div style="color: #D4AF37; font-size: 12px; font-weight: 800;">VANIR MARINE</div>
      </div>

      <div class="yacht-header-bar">
        <div class="yacht-header-title">
          <h2>ROYAL SUPERYACHTS</h2>
          <p>PRIVATE MEDITERRANEAN & GULF CHARTER</p>
        </div>
        <div style="width: 50px; height: 50px; border-radius: 25px; background: rgba(255,255,255,0.1); border: 1px solid #D4AF37; display: flex; align-items: center; justify-content: center; font-size: 20px;">⚓</div>
      </div>

      <div class="yacht-content">
        <div class="yacht-card">
          <div class="yacht-photo-wrap">
            <img src="${santoriniBase64}" />
            <div class="yacht-photo-tag">FLAGSHIP SUPERYACHT</div>
          </div>
          <div class="yacht-details-panel">
            <div class="yacht-title-row">
              <div>
                <h3>Majesty 120 Superyacht</h3>
                <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Dubai Marina • Monaco • French Riviera</p>
              </div>
              <div style="text-align: right;">
                <div style="font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 800; color: #1C1917;">$32,000</div>
                <div style="font-size: 13px; font-weight: 700; color: #64748B;">per charter day</div>
              </div>
            </div>

            <div class="yacht-specs-grid">
              <div class="spec-cell">
                <span class="spec-label">Length</span>
                <span class="spec-val">120 ft / 37m</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">Guests</span>
                <span class="spec-val">12 Guests</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">Cabins</span>
                <span class="spec-val">5 En-Suite</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">Crew</span>
                <span class="spec-val">7 Officers</span>
              </div>
            </div>

            <div class="yacht-features-row">
              <span class="feat-pill">Jacuzzi on Sun Deck</span>
              <span class="feat-pill">Private Seafood Chef</span>
              <span class="feat-pill">Beach Club & Seabobs</span>
              <span class="feat-pill">Helipad</span>
            </div>

            <div class="yacht-cta-btn">
              <span>CHARTER SUPERYACHT NOW</span>
              <span style="color: #D4AF37;">→</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;
}

// ==========================================
// SCREENSHOT 4: EXECUTIVE CHAUFFEUR FLEET
// ==========================================
function getHtmlSlide4() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonCSS}

.fleet-header-bar {
  background: #080E1B;
  padding: 85px 40px 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1.5px solid rgba(212, 175, 55, 0.35);
}

.fleet-header-title h2 {
  font-family: 'Cinzel', serif;
  font-size: 30px;
  color: #FFFFFF;
  letter-spacing: 2px;
}

.fleet-header-title p {
  font-size: 13px;
  font-weight: 800;
  color: #D4AF37;
  letter-spacing: 1.5px;
}

.fleet-content {
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.car-card {
  background: #FFFFFF;
  border-radius: 36px;
  overflow: hidden;
  border: 1.5px solid rgba(212, 175, 55, 0.4);
  box-shadow: 0 16px 40px rgba(0,0,0,0.08);
}

.car-photo-wrap {
  position: relative;
  height: 380px;
}

.car-photo-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ZERO NUMBERS OVER PHOTO (USER REQUIREMENT) */
.car-clean-badge {
  position: absolute;
  top: 24px;
  left: 24px;
  background: rgba(13, 23, 43, 0.88);
  border: 1.2px solid #D4AF37;
  color: #D4AF37;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.car-details-panel {
  padding: 28px 32px;
}

.car-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.car-title-row h3 {
  font-size: 26px;
  font-weight: 800;
  color: #1C1917;
}

.car-sub {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 16px;
}

.car-specs-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #F8FAFC;
  padding: 16px 20px;
  border-radius: 18px;
  margin-bottom: 22px;
}

.car-spec-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #1C1917;
}

.car-spec-dot {
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background: #CBD5E1;
}

.car-price-cta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.car-price-tag {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1C1917;
}

.car-book-btn {
  background: linear-gradient(135deg, #0D172B 0%, #152544 100%);
  border: 1.5px solid #D4AF37;
  border-radius: 18px;
  padding: 16px 32px;
  font-family: 'Cinzel', serif;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #FFFFFF;
}
</style>
</head>
<body>
  <div class="ambient-glow-top"></div>
  <div class="ambient-stars"></div>

  <div class="marketing-header">
    <div class="kicker-pill">
      <div class="kicker-pill-dot"></div>
      <span class="kicker-text">PRESTIGE MOTORING</span>
    </div>
    <h1 class="main-headline">EXECUTIVE CHAUFFEUR <br><span class="gold">VIP FLEET</span></h1>
    <p class="sub-headline">Rolls-Royce Phantom VIII, Mercedes-Maybach & Certified Security Escorts</p>
  </div>

  <div class="device-stage">
    <div class="screen-interior">
      <div class="dynamic-island">
        <div class="island-sensor"></div>
        <div style="color: #D4AF37; font-size: 12px; font-weight: 800;">VANIR FLEET</div>
      </div>

      <div class="fleet-header-bar">
        <div class="fleet-header-title">
          <h2>EXECUTIVE FLEET</h2>
          <p>WHITE-GLOVE CHAUFFEUR & ARMORED ESCORT</p>
        </div>
        <div style="width: 50px; height: 50px; border-radius: 25px; background: rgba(255,255,255,0.1); border: 1px solid #D4AF37; display: flex; align-items: center; justify-content: center; font-size: 20px;">🚘</div>
      </div>

      <div class="fleet-content">
        <div class="car-card">
          <div class="car-photo-wrap">
            <img src="${transportBase64}" />
            <div class="car-clean-badge">FLAGSHIP LUXURY</div>
          </div>
          <div class="car-details-panel">
            <div class="car-title-row">
              <h3>Rolls-Royce Phantom VIII</h3>
            </div>
            <p class="car-sub">Starlight Fiber-Optic Ceiling • Champagne Cooler • White-Glove Protocol</p>

            <div class="car-specs-row">
              <div class="car-spec-item">
                <span style="color: #D4AF37;">★</span> 5.0 Rated
              </div>
              <div class="car-spec-dot"></div>
              <div class="car-spec-item">
                <span style="color: #D4AF37;">👤</span> 4 Seats
              </div>
              <div class="car-spec-dot"></div>
              <div class="car-spec-item">
                <span style="color: #D4AF37;">💼</span> 4 Bags
              </div>
              <div class="car-spec-dot"></div>
              <div class="car-spec-item">
                <span style="color: #D4AF37;">🛡️</span> Diplomatic Chauffeur
              </div>
            </div>

            <div class="car-price-cta-row">
              <div>
                <div class="car-price-tag">$1,200 <span style="font-size: 14px; color: #64748B;">/ day</span></div>
                <div style="font-size: 13px; color: #D4AF37; font-weight: 700;">$220 / hr with chauffeur</div>
              </div>
              <div class="car-book-btn">RESERVE VEHICLE →</div>
            </div>
          </div>
        </div>

        <!-- Maybach Card Sneak Peek -->
        <div class="car-card" style="opacity: 0.9;">
          <div class="car-details-panel" style="padding: 24px 32px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="font-size: 22px; font-weight: 800; color: #1C1917;">Mercedes-Maybach S 680</h4>
              <p style="color: #64748B; font-size: 13px; margin-top: 4px;">First-Class Executive Rear Lounge • V12 Twin-Turbo</p>
            </div>
            <div style="text-align: right;">
              <div style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 800; color: #1C1917;">$650 <span style="font-size: 12px; color: #64748B;">/day</span></div>
              <span style="color: #10B981; font-size: 12px; font-weight: 800;">✓ Available Today</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</body>
</html>`;
}

// ==========================================
// SCREENSHOT 5: MESSAGES & 24/7 CONCIERGE
// ==========================================
function getHtmlSlide5() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonCSS}

.msg-header-bar {
  background: #FFFFFF;
  padding: 85px 40px 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1.5px solid #F1F5F9;
}

.msg-header-bar h2 {
  font-size: 32px;
  font-weight: 900;
  color: #1C1917;
  letter-spacing: 0.5px;
}

.msg-icons {
  display: flex;
  gap: 12px;
}

.msg-icon-btn {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #1C1917;
}

.msg-content {
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.bespoke-icon-halo {
  position: relative;
  width: 170px;
  height: 170px;
  border-radius: 46px;
  background: radial-gradient(circle, #1B2C4E 0%, #08101E 100%);
  border: 2px solid #D4AF37;
  box-shadow: 
    0 16px 50px rgba(212, 175, 55, 0.35),
    inset 0 2px 10px rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 36px;
}

.bespoke-icon-halo::before {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: 58px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%);
  z-index: -1;
}

.bespoke-icon-inner {
  font-size: 78px;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));
}

.msg-title {
  font-size: 30px;
  font-weight: 900;
  color: #1C1917;
  margin-bottom: 16px;
}

.msg-desc {
  font-size: 18px;
  color: #64748B;
  line-height: 1.55;
  max-width: 700px;
  margin-bottom: 36px;
}

.explore-cta-btn {
  background: linear-gradient(135deg, #0D172B 0%, #152544 100%);
  border: 1.5px solid #D4AF37;
  border-radius: 24px;
  padding: 22px 54px;
  font-size: 18px;
  font-weight: 800;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(13, 23, 43, 0.3);
}

/* Past Conversations List */
.past-box {
  width: 100%;
  margin-top: 50px;
  border-top: 1.5px solid #F1F5F9;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.past-row {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 24px;
  padding: 22px 26px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.past-avatar {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #0B1526;
  border: 1.5px solid #D4AF37;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #D4AF37;
  font-weight: 900;
}

.past-texts {
  flex: 1;
}

.past-host {
  font-size: 18px;
  font-weight: 800;
  color: #1C1917;
}

.past-sub {
  font-size: 14px;
  color: #64748B;
  margin-top: 4px;
}
</style>
</head>
<body>
  <div class="ambient-glow-top"></div>
  <div class="ambient-stars"></div>

  <div class="marketing-header">
    <div class="kicker-pill">
      <div class="kicker-pill-dot"></div>
      <span class="kicker-text">24/7 DEDICATED CONCIERGE</span>
    </div>
    <h1 class="main-headline">DIRECT DIALOGUE WITH <br><span class="gold">ROYAL DESK</span></h1>
    <p class="sub-headline">Aviation Dispatchers, Verified Superyacht Captains & Personal Butlers</p>
  </div>

  <div class="device-stage">
    <div class="screen-interior">
      <div class="dynamic-island">
        <div class="island-sensor"></div>
        <div style="color: #D4AF37; font-size: 12px; font-weight: 800;">VANIR CONCIERGE</div>
      </div>

      <div class="msg-header-bar">
        <h2>Messages</h2>
        <div class="msg-icons">
          <div class="msg-icon-btn">🔍</div>
          <div class="msg-icon-btn">⚙</div>
        </div>
      </div>

      <div class="msg-content">
        <div class="bespoke-icon-halo">
          <div class="bespoke-icon-inner">💬</div>
        </div>

        <h3 class="msg-title">No messages yet</h3>
        <p class="msg-desc">Start planning a luxury stay, private aviation flight, or bespoke service to connect with your royal concierge and verified hosts here.</p>

        <div class="explore-cta-btn">
          <span style="color: #D4AF37;">✨</span>
          <span>Explore Experiences</span>
        </div>

        <div class="past-box">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 8px;">
            <span style="font-size: 16px; font-weight: 800; color: #1C1917;">Past Conversations</span>
            <span style="font-size: 14px; font-weight: 700; color: #D4AF37;">View Archive →</span>
          </div>

          <div class="past-row">
            <div class="past-avatar">V</div>
            <div class="past-texts">
              <div style="display: flex; justify-content: space-between;">
                <span class="past-host">Vanir Royal Concierge</span>
                <span style="font-size: 13px; color: #94A3B8;">Yesterday</span>
              </div>
              <p class="past-sub">Your private helicopter transfer to Burj Al Arab is confirmed.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</body>
</html>`;
}

// ==========================================
// RENDER ALL 5 SCREENSHOTS
// ==========================================
const slides = [
  { name: '1_hero_portal', html: getHtmlSlide1() },
  { name: '2_private_aviation', html: getHtmlSlide2() },
  { name: '3_royal_superyachts', html: getHtmlSlide3() },
  { name: '4_executive_fleet', html: getHtmlSlide4() },
  { name: '5_concierge_messages', html: getHtmlSlide5() },
];

console.log('Rendering 5 official Apple App Store screenshots (1290x2796)...');

for (const s of slides) {
  const htmlFile = path.join(tmpHtmlDir, `${s.name}.html`);
  const pngFile = path.join(outDir, `${s.name}.png`);

  fs.writeFileSync(htmlFile, s.html);

  const cmd = `"${chromePath}" --headless --disable-gpu --screenshot="${pngFile}" --window-size=1290,2796 "file://${htmlFile}"`;
  console.log(`Rendering ${s.name}...`);
  execSync(cmd);

  if (fs.existsSync(pngFile)) {
    const stats = fs.statSync(pngFile);
    console.log(`✓ Generated ${s.name}.png (${(stats.size / 1024).toFixed(1)} KB)`);
  }
}

console.log('All 5 App Store screenshots generated successfully in:', outDir);
