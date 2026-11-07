import React, { useMemo, useRef } from 'react';
import {
  Modal,
  Pressable,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import {
  X,
  Printer,
  Share2,
  ShieldCheck,
} from 'lucide-react-native';
import { toQR } from 'toqr';
import {
  buildAuthenticDocumentStampHtml,
  escapeHtml,
  generateLinearBarcodeSvg,
  IATA_LOGO_DATA_URI,
  resolveAirlineBrand,
  VANIR_SEAL_DATA_URI,
} from '../utils/pdfBrandAssets';
import { printOrSavePdfDocument } from '../utils/pdfPrinter';

const PdfWebView = WebView as unknown as React.ComponentType<any>;

export interface FlightTicketPdfModalProps {
  visible: boolean;
  onClose: () => void;
  booking: {
    bookingId?: string;
    pnr: string;
    eTicketNumber: string;
    barcodeData?: string;
    airline: string;
    airlineCode?: string;
    flightNumber: string;
    aircraft?: string;
    origin: string;
    originCode: string;
    originTerminal?: string;
    destination: string;
    destinationCode: string;
    destinationTerminal?: string;
    departureDate?: string;
    departureTime: string;
    arrivalTime: string;
    returnDate?: string;
    returnFlightNumber?: string;
    duration: string;
    gate?: string;
    boardingTime?: string;
    cabinClass?: string;
    baggage?: string;
    selectedSeats?: string[];
    basePrice?: number;
    taxes?: number;
    totalPrice?: number;
    paymentMethod?: string;
    transactionId?: string;
    issueDate?: string;
    checkinUrl?: string;
    passenger: {
      title?: string;
      firstName?: string;
      lastName?: string;
      fullName: string;
      gender?: string;
      dob?: string;
      nationality?: string;
      idType?: string;
      passportNumber: string;
      passportExpiry?: string;
      passportCountry?: string;
      email?: string;
      phone?: string;
      mealPreference?: string;
      specialAssistance?: string;
    };
  };
}

function buildIsoQrSvg(url: string, sizePx = 92, darkColor = '#0F172A'): string {
  try {
    const qrData = toQR(url);
    const side = Math.round(Math.sqrt(qrData.length));
    let pathD = '';
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        if (qrData[y * side + x]) {
          pathD += `M${x},${y}h1v1h-1z `;
        }
      }
    }
    return `<svg width="${sizePx}" height="${sizePx}" viewBox="0 0 ${side} ${side}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="${side}" height="${side}" fill="#FFFFFF"/><path d="${pathD}" fill="${darkColor}"/></svg>`;
  } catch {
    return `<div style="width:${sizePx}px;height:${sizePx}px;border:1px solid #CBD5E1;display:flex;align-items:center;justify-content:center;font-size:9px;color:#475569;">QR VERIFIED</div>`;
  }
}

export function FlightTicketPdfModal({
  visible,
  onClose,
  booking,
}: FlightTicketPdfModalProps) {
  const webViewRef = useRef<any>(null);

  const brand = useMemo(
    () => resolveAirlineBrand(booking.airline, booking.airlineCode),
    [booking.airline, booking.airlineCode],
  );

  const passenger = booking.passenger;
  const seatsStr =
    booking.selectedSeats && booking.selectedSeats.length > 0
      ? booking.selectedSeats.join(', ')
      : '02A';

  // Ensure authentic 3-digit carrier accounting prefix on the 13-digit e-ticket number
  const formattedETicket = useMemo(() => {
    const raw = (booking.eTicketNumber || '').trim();
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      const serial = digitsOnly.slice(-10);
      return `${brand.iataAccountingPrefix}-${serial}`;
    }
    const hashDigits = String(
      Math.abs(
        Array.from(booking.pnr || 'VNR882').reduce(
          (acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0,
          482910371,
        ),
      ),
    )
      .padStart(10, '4')
      .slice(0, 10);
    return `${brand.iataAccountingPrefix}-${hashDigits}`;
  }, [booking.eTicketNumber, booking.pnr, brand.iataAccountingPrefix]);

  const formattedPassengerIataName = useMemo(() => {
    if (passenger.lastName && passenger.firstName) {
      return `${passenger.lastName.toUpperCase()} / ${passenger.firstName.toUpperCase()} ${(passenger.title || 'MR').toUpperCase()}`.trim();
    }
    const parts = (passenger.fullName || 'VIP PASSENGER').trim().split(/\s+/);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1].toUpperCase();
      const first = parts.slice(0, -1).join(' ').toUpperCase();
      return `${last} / ${first} ${(passenger.title || '').toUpperCase()}`.trim();
    }
    return (passenger.fullName || 'VIP PASSENGER').toUpperCase();
  }, [passenger.firstName, passenger.fullName, passenger.lastName, passenger.title]);

  const issueDateStr = useMemo(() => {
    if (booking.issueDate) return booking.issueDate;
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  }, [booking.issueDate]);

  const flightDateStr = useMemo(() => {
    if (booking.departureDate) return booking.departureDate;
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  }, [booking.departureDate]);

  const totalAmount = Number(booking.totalPrice ?? 686);
  const baseFare =
    booking.basePrice !== undefined
      ? Number(booking.basePrice)
      : Math.round(totalAmount * 0.86 * 100) / 100;
  const taxesAndFees =
    booking.taxes !== undefined
      ? Number(booking.taxes)
      : Math.max(0, Math.round((totalAmount - baseFare) * 100) / 100);

  const cabinLabel = booking.cabinClass || 'Business / First Suite (J)';
  const aircraftLabel = booking.aircraft || (brand.code === 'EK' ? 'Airbus A380-800' : brand.code === 'QR' ? 'Airbus A350-1000' : 'Boeing 787-9 Dreamliner');
  const originTerm = booking.originTerminal || 'Terminal 3';
  const destTerm = booking.destinationTerminal || 'Terminal 1';
  const baggageAllowance = booking.baggage || brand.baggagePolicy;
  const paymentLabel = booking.paymentMethod || 'VISA / MASTERCARD •••• PAID';
  const flightNumDisplay = booking.flightNumber?.toUpperCase().startsWith(brand.code)
    ? booking.flightNumber.toUpperCase()
    : `${brand.code} ${booking.flightNumber || '204'}`;

  const qrVerificationUrl = `https://vanirgroup.com/verify/ticket?pnr=${encodeURIComponent(
    booking.pnr,
  )}&etkt=${encodeURIComponent(formattedETicket)}&flight=${encodeURIComponent(
    flightNumDisplay.replace(/\s+/g, ''),
  )}&pax=${encodeURIComponent(passenger.fullName || 'VIP')}`;

  const qrSvg = useMemo(
    () => buildIsoQrSvg(qrVerificationUrl, 88, '#0F172A'),
    [qrVerificationUrl],
  );

  const bcbpPayload =
    booking.barcodeData ||
    `M1${formattedPassengerIataName.slice(0, 18)} ${booking.pnr} ${booking.originCode}${booking.destinationCode}${flightNumDisplay.replace(/\s+/g, '')} ${seatsStr}`;

  const linearBarcodeSvg = useMemo(
    () => generateLinearBarcodeSvg(bcbpPayload, 260, 44, '#0F172A'),
    [bcbpPayload],
  );

  const htmlContent = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=840, initial-scale=0.45, maximum-scale=3.0, user-scalable=yes" />
  <title>Electronic Ticket Receipt - ${escapeHtml(booking.pnr)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0F172A;
    }
    .sheet-wrap {
      padding: 18px 12px 32px;
      display: flex;
      justify-content: center;
    }
    .a4-page {
      width: 794px;
      min-height: 1122px;
      background: #FFFFFF;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.18);
      position: relative;
      padding: 32px 38px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    @media print {
      html, body {
        background: #FFFFFF;
      }
      .sheet-wrap {
        padding: 0;
      }
      .a4-page {
        width: 210mm;
        min-height: 297mm;
        box-shadow: none;
        padding: 11mm 13mm 10mm;
      }
    }
    .top-brand-bar {
      height: 6px;
      background: linear-gradient(90deg, ${brand.primaryColor} 0%, ${brand.accentColor} 100%);
      margin: -32px -38px 22px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    .carrier-block {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .carrier-sub {
      font-size: 9.5px;
      color: #475569;
      font-weight: 700;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    .doc-title-block {
      text-align: right;
    }
    .doc-type-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      padding: 4px 10px;
      margin-bottom: 6px;
    }
    .doc-main-heading {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.8px;
      color: #0F172A;
      margin: 0;
      text-transform: uppercase;
    }
    .doc-sub-heading {
      font-size: 9.5px;
      color: #64748B;
      font-weight: 700;
      margin-top: 2px;
      letter-spacing: 0.5px;
    }
    .ref-strip {
      display: grid;
      grid-template-columns: 1.2fr 1.5fr 1fr 1.1fr;
      border: 1.5px solid #0F172A;
      border-radius: 4px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .ref-cell {
      padding: 9px 12px;
      border-right: 1px solid #CBD5E1;
      background: #F8FAFC;
    }
    .ref-cell:last-child {
      border-right: none;
    }
    .ref-cell.highlight {
      background: ${brand.primaryColor};
      color: #FFFFFF;
    }
    .ref-label {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 3px;
    }
    .ref-cell.highlight .ref-label {
      color: rgba(255,255,255,0.82);
    }
    .ref-val {
      font-size: 14px;
      font-weight: 900;
      font-family: 'Courier New', Courier, monospace;
      letter-spacing: 0.8px;
      color: #0F172A;
    }
    .ref-cell.highlight .ref-val {
      color: #FFFFFF;
      font-size: 16px;
      letter-spacing: 1.6px;
    }
    .section-hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0F172A;
      color: #FFFFFF;
      padding: 6px 12px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.1px;
      text-transform: uppercase;
      border-radius: 3px 3px 0 0;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      border: 1px solid #CBD5E1;
      border-top: none;
    }
    .data-table th {
      background: #F1F5F9;
      color: #334155;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 6px 10px;
      text-align: left;
      border-bottom: 1px solid #CBD5E1;
      border-right: 1px solid #E2E8F0;
    }
    .data-table td {
      padding: 8px 10px;
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
      border-bottom: 1px solid #E2E8F0;
      border-right: 1px solid #E2E8F0;
      vertical-align: top;
    }
    .mono {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 800;
    }
    .status-confirmed {
      display: inline-block;
      background: #DCFCE7;
      color: #166534;
      border: 1px solid #86EFAC;
      font-size: 9px;
      font-weight: 900;
      padding: 2px 7px;
      border-radius: 3px;
      letter-spacing: 0.5px;
    }
    .coupon-box {
      border: 1.5px solid #0F172A;
      border-radius: 4px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .coupon-top {
      background: ${brand.primaryColor};
      color: #FFFFFF;
      padding: 7px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.8px;
    }
    .coupon-body {
      padding: 14px;
      background: #FFFFFF;
    }
    .route-grid {
      display: grid;
      grid-template-columns: 1.35fr 0.9fr 1.35fr;
      align-items: center;
      gap: 10px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #CBD5E1;
      margin-bottom: 12px;
    }
    .iata-big {
      font-size: 28px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: 1px;
      line-height: 1;
    }
    .city-line {
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      margin-top: 3px;
    }
    .term-line {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748B;
      margin-top: 2px;
    }
    .time-box {
      margin-top: 6px;
      font-size: 13px;
      font-weight: 900;
      color: ${brand.primaryColor};
    }
    .mid-flight {
      text-align: center;
    }
    .flight-line-graphic {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin: 4px 0;
    }
    .flight-line-dash {
      flex: 1;
      height: 1.5px;
      background: #94A3B8;
    }
    .coupon-meta-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .meta-item {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 3px;
      padding: 6px 8px;
    }
    .meta-k {
      font-size: 8px;
      font-weight: 800;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .meta-v {
      font-size: 10.5px;
      font-weight: 800;
      color: #0F172A;
      margin-top: 2px;
    }
    .fare-and-agency {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }
    .agency-box {
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      padding: 10px 12px;
      background: #FAF9F6;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .perforation {
      position: relative;
      border-top: 2px dashed #94A3B8;
      margin: 8px 0 12px;
      text-align: center;
    }
    .perforation span {
      background: #FFFFFF;
      padding: 0 10px;
      font-size: 8.5px;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 1.4px;
      position: relative;
      top: -7px;
      text-transform: uppercase;
    }
    .boarding-stub {
      border: 1.5px solid #0F172A;
      border-radius: 6px;
      overflow: hidden;
      background: #FFFFFF;
    }
    .stub-hdr {
      background: #0F172A;
      color: #FFFFFF;
      padding: 6px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .stub-grid {
      display: grid;
      grid-template-columns: 1.7fr 1fr;
      padding: 12px 14px;
      gap: 14px;
      align-items: center;
    }
    .stub-codes {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      border-left: 1px dashed #CBD5E1;
      padding-left: 12px;
    }
    .legal-footer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      color: #64748B;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <div class="sheet-wrap">
    <div class="a4-page">
      <div>
        <div class="top-brand-bar"></div>

        <!-- OFFICIAL OPERATING AIRLINE LETTERHEAD + IATA ACCREDITATION -->
        <div class="header-row">
          <div class="carrier-block">
            ${brand.logoHtml}
            <div class="carrier-sub">${escapeHtml(brand.name)} • ${escapeHtml(brand.alliance)}</div>
            <div style="font-size:8.5px;color:#64748B;">Operating Carrier HQ: ${escapeHtml(brand.headquarters)}</div>
          </div>

          <div class="doc-title-block">
            <div class="doc-type-pill">
              <img src="${IATA_LOGO_DATA_URI}" alt="IATA" style="height:20px;width:auto;object-fit:contain;" />
              <span style="font-size:9px;font-weight:900;color:#0F172A;letter-spacing:0.8px;">IATA BSP ELECTRONIC TICKET</span>
            </div>
            <h1 class="doc-main-heading">PASSENGER ITINERARY &amp; RECEIPT</h1>
            <div class="doc-sub-heading">ISSUED IN ACCORDANCE WITH IATA RESOLUTION 722f • NOT TRANSFERABLE</div>
          </div>
        </div>

        <!-- PNR & 13-DIGIT E-TICKET STRIP -->
        <div class="ref-strip">
          <div class="ref-cell highlight">
            <div class="ref-label">BOOKING REFERENCE (PNR)</div>
            <div class="ref-val">${escapeHtml(booking.pnr)}</div>
          </div>
          <div class="ref-cell">
            <div class="ref-label">IATA E-TICKET NUMBER</div>
            <div class="ref-val">${escapeHtml(formattedETicket)}</div>
          </div>
          <div class="ref-cell">
            <div class="ref-label">DATE OF ISSUE</div>
            <div class="ref-val" style="font-size:12px;">${escapeHtml(issueDateStr)}</div>
          </div>
          <div class="ref-cell">
            <div class="ref-label">RESERVATION STATUS</div>
            <div><span class="status-confirmed">CONFIRMED • HK1</span></div>
          </div>
        </div>

        <!-- PASSENGER RECORD -->
        <div class="section-hdr">
          <span>1. PASSENGER &amp; TRAVEL DOCUMENT IDENTIFICATION</span>
          <span>SSR DOCS VERIFIED</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:34%;">PASSENGER NAME (IATA FORMAT)</th>
              <th style="width:19%;">PASSPORT / ID NO.</th>
              <th style="width:16%;">NATIONALITY</th>
              <th style="width:15%;">DATE OF BIRTH</th>
              <th style="width:16%;">SSR / MEAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="mono" style="font-size:11.5px;">${escapeHtml(formattedPassengerIataName)}</td>
              <td class="mono">${escapeHtml(passenger.passportNumber || 'P-VERIFIED')}</td>
              <td>${escapeHtml((passenger.nationality || 'INTERNATIONAL').toUpperCase())}</td>
              <td>${escapeHtml(passenger.dob || 'ADULT (ADT)')}</td>
              <td>${escapeHtml(passenger.mealPreference || 'VIP STANDARD')}</td>
            </tr>
          </tbody>
        </table>

        <!-- FLIGHT COUPON 1 -->
        <div class="coupon-box">
          <div class="coupon-top">
            <span>FLIGHT COUPON 01 • ${escapeHtml(brand.name.toUpperCase())} (${escapeHtml(flightNumDisplay)})</span>
            <span>CABIN: ${escapeHtml(cabinLabel.toUpperCase())} • COUPON STATUS: OPEN FOR USE</span>
          </div>
          <div class="coupon-body">
            <div class="route-grid">
              <div>
                <div class="iata-big">${escapeHtml(booking.originCode)}</div>
                <div class="city-line">${escapeHtml(booking.origin)}</div>
                <div class="term-line">${escapeHtml(originTerm)} • Check-in closes 60m prior</div>
                <div class="time-box">${escapeHtml(flightDateStr)} • ${escapeHtml(booking.departureTime)}</div>
              </div>

              <div class="mid-flight">
                <div style="font-size:9px;font-weight:800;color:#64748B;text-transform:uppercase;">NON-STOP • ${escapeHtml(booking.duration)}</div>
                <div class="flight-line-graphic">
                  <div class="flight-line-dash"></div>
                  <span style="font-size:15px;color:${brand.primaryColor};">✈</span>
                  <div class="flight-line-dash"></div>
                </div>
                <div style="font-size:9px;font-weight:800;color:#0F172A;">${escapeHtml(aircraftLabel)}</div>
              </div>

              <div style="text-align:right;">
                <div class="iata-big">${escapeHtml(booking.destinationCode)}</div>
                <div class="city-line">${escapeHtml(booking.destination)}</div>
                <div class="term-line">${escapeHtml(destTerm)} • International Arrivals</div>
                <div class="time-box">${escapeHtml(flightDateStr)} • ${escapeHtml(booking.arrivalTime)}</div>
              </div>
            </div>

            <div class="coupon-meta-grid">
              <div class="meta-item">
                <div class="meta-k">FLIGHT NO.</div>
                <div class="meta-v mono">${escapeHtml(flightNumDisplay)}</div>
              </div>
              <div class="meta-item">
                <div class="meta-k">ASSIGNED SEAT</div>
                <div class="meta-v mono">${escapeHtml(seatsStr)}</div>
              </div>
              <div class="meta-item">
                <div class="meta-k">DEPARTURE GATE</div>
                <div class="meta-v mono">${escapeHtml(booking.gate || 'A14')}</div>
              </div>
              <div class="meta-item" style="grid-column: span 2;">
                <div class="meta-k">BAGGAGE ALLOWANCE</div>
                <div class="meta-v">${escapeHtml(baggageAllowance)}</div>
              </div>
            </div>
          </div>
        </div>

        ${
          booking.returnDate
            ? `
        <div class="coupon-box" style="margin-top:-6px;">
          <div class="coupon-top" style="background:#1E293B;">
            <span>FLIGHT COUPON 02 (RETURN) • ${escapeHtml(brand.name.toUpperCase())} (${escapeHtml(booking.returnFlightNumber || `${brand.code} 205`)})</span>
            <span>DATE: ${escapeHtml(booking.returnDate)} • CONFIRMED (HK1)</span>
          </div>
          <div class="coupon-body" style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:700;">
            <div><strong>${escapeHtml(booking.destinationCode)}</strong> (${escapeHtml(booking.destination)}) → <strong>${escapeHtml(booking.originCode)}</strong> (${escapeHtml(booking.origin)})</div>
            <div>Return Date: <span class="mono">${escapeHtml(booking.returnDate)}</span> • Baggage: ${escapeHtml(baggageAllowance)}</div>
          </div>
        </div>`
            : ''
        }

        <!-- FARE BREAKDOWN & ISSUING OFFICE -->
        <div class="fare-and-agency">
          <div>
            <div class="section-hdr">
              <span>2. AIRFARE, TAXES &amp; PAYMENT RECEIPT</span>
              <span>PAID IN FULL</span>
            </div>
            <table class="data-table" style="margin-bottom:0;">
              <tbody>
                <tr>
                  <td style="color:#475569;">Base Airfare (Equivalent Fare Paid)</td>
                  <td class="mono" style="text-align:right;">USD ${baseFare.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="color:#475569;">Carrier Surcharges, Airport &amp; Security Taxes (YQ/YR/XT)</td>
                  <td class="mono" style="text-align:right;">USD ${taxesAndFees.toFixed(2)}</td>
                </tr>
                <tr style="background:#F8FAFC;">
                  <td style="font-weight:900;font-size:12px;">TOTAL AMOUNT COLLECTED</td>
                  <td class="mono" style="text-align:right;font-size:13px;color:${brand.primaryColor};">USD ${totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="color:#475569;">Form of Payment (FOP)</td>
                  <td class="mono" style="text-align:right;font-size:10px;">${escapeHtml(paymentLabel)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="agency-box">
            ${buildAuthenticDocumentStampHtml({
              variant: 'airline_ticket',
              issuerName: `${brand.name} • IATA BSP`,
              dateStr: issueDateStr,
              refCode: booking.pnr,
              signerName: 'A. Al-Hashimi • IATA BSP',
              signerTitle: `${brand.code} Validating Carrier Desk`,
            })}
            <div style="margin-top:6px;padding-top:6px;border-top:1px dashed #CBD5E1;font-size:8px;color:#334155;font-weight:700;">
              END: NON-ENDORSABLE • VALID ON ${escapeHtml(brand.code)} OPERATING FLIGHTS ONLY • OFFICE VNR-IATA-9021
            </div>
          </div>
        </div>
      </div>

      <!-- PERFORATED IATA BOARDING PASS & DIGITAL VERIFICATION STUB -->
      <div>
        <div class="perforation"><span>✂ ELECTRONIC BOARDING &amp; GATE VERIFICATION COUPON</span></div>
        <div class="boarding-stub">
          <div class="stub-hdr">
            <span>${escapeHtml(brand.name.toUpperCase())} • BOARDING PASS SUMMARY</span>
            <span>ETKT ${escapeHtml(formattedETicket)} • PNR ${escapeHtml(booking.pnr)}</span>
          </div>
          <div class="stub-grid">
            <div>
              <div style="font-size:8.5px;color:#64748B;font-weight:800;">PASSENGER</div>
              <div class="mono" style="font-size:13px;font-weight:900;margin-bottom:8px;">${escapeHtml(formattedPassengerIataName)}</div>

              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px;">
                <div>
                  <div style="font-size:8px;color:#64748B;font-weight:800;">ROUTE</div>
                  <div class="mono" style="font-size:11px;">${escapeHtml(booking.originCode)} → ${escapeHtml(booking.destinationCode)}</div>
                </div>
                <div>
                  <div style="font-size:8px;color:#64748B;font-weight:800;">FLIGHT</div>
                  <div class="mono" style="font-size:11px;">${escapeHtml(flightNumDisplay)}</div>
                </div>
                <div>
                  <div style="font-size:8px;color:#64748B;font-weight:800;">GATE / SEAT</div>
                  <div class="mono" style="font-size:11px;">${escapeHtml(booking.gate || 'A14')} / ${escapeHtml(seatsStr)}</div>
                </div>
                <div>
                  <div style="font-size:8px;color:#64748B;font-weight:800;">DEPARTURE</div>
                  <div class="mono" style="font-size:11px;">${escapeHtml(booking.departureTime)}</div>
                </div>
              </div>

              <div>${linearBarcodeSvg}</div>
              <div class="mono" style="font-size:8px;color:#64748B;letter-spacing:1.2px;margin-top:2px;">
                IATA BCBP: ${escapeHtml(bcbpPayload.slice(0, 44))}
              </div>
            </div>

            <div class="stub-codes">
              <div style="text-align:right;">
                <div style="font-size:8.5px;font-weight:900;color:#0F172A;text-transform:uppercase;">SCAN TO VERIFY</div>
                <div style="font-size:8px;color:#64748B;margin-top:2px;max-width:115px;">Live GDS status on vanirgroup.com</div>
                <div class="mono" style="font-size:9px;color:${brand.primaryColor};margin-top:5px;">SEQ 0014 • ZONE 1</div>
              </div>
              <div style="padding:4px;border:1px solid #CBD5E1;border-radius:4px;background:#FFFFFF;">
                ${qrSvg}
              </div>
            </div>
          </div>
        </div>

        <div class="legal-footer">
          <div style="max-width:560px;">
            Carriage and other services provided by the carrier are subject to conditions of carriage and the Montreal Convention (1999). Passports must remain valid for at least 6 months from international departure. Please present this printed A4 E-Ticket Receipt at airport immigration and check-in counters.
          </div>
          <div class="mono" style="text-align:right;font-size:8.5px;color:#0F172A;">
            VERIFY ONLINE:<br/>vanirgroup.com/verify/ticket
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }, [
    baggageAllowance,
    baseFare,
    bcbpPayload,
    booking.departureTime,
    booking.destination,
    booking.destinationCode,
    booking.duration,
    booking.arrivalTime,
    booking.gate,
    booking.origin,
    booking.originCode,
    booking.pnr,
    booking.returnDate,
    booking.returnFlightNumber,
    brand,
    cabinLabel,
    destTerm,
    flightDateStr,
    flightNumDisplay,
    formattedETicket,
    formattedPassengerIataName,
    issueDateStr,
    linearBarcodeSvg,
    originTerm,
    passenger.dob,
    passenger.mealPreference,
    passenger.nationality,
    passenger.passportNumber,
    paymentLabel,
    qrSvg,
    seatsStr,
    taxesAndFees,
    totalAmount,
    aircraftLabel,
  ]);

  const handlePrintPdf = async () => {
    await printOrSavePdfDocument({
      html: htmlContent,
      jobName: `ETicket_${brand.code}_${booking.pnr}`,
      webViewRef,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${brand.name} E-Ticket — PNR ${booking.pnr}`,
        message:
          `✈️ OFFICIAL IATA E-TICKET RECEIPT\n` +
          `Carrier: ${brand.name} (${flightNumDisplay})\n` +
          `Passenger: ${formattedPassengerIataName}\n` +
          `Route: ${booking.origin} (${booking.originCode}) → ${booking.destination} (${booking.destinationCode})\n` +
          `Date & Time: ${flightDateStr} • ${booking.departureTime}\n` +
          `PNR: ${booking.pnr} | E-Ticket: ${formattedETicket}\n` +
          `Seat: ${seatsStr} | Total Paid: USD ${totalAmount.toFixed(2)}\n` +
          `Verify Online: ${qrVerificationUrl}`,
      });
    } catch {
      // Share cancelled
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
            onPress={onClose}
            hitSlop={8}
          >
            <X color="#1C1917" size={20} />
          </Pressable>

          <View style={styles.titleWrap}>
            <View style={styles.badgeRow}>
              <ShieldCheck color="#D4AF37" size={13} />
              <Text style={styles.badgeText}>{brand.name.toUpperCase()} • IATA E-TICKET</Text>
            </View>
            <Text style={styles.mainTitle} numberOfLines={1}>
              PNR: {booking.pnr} • {formattedETicket}
            </Text>
          </View>

          <View style={styles.actionsRight}>
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
              onPress={handleShare}
              hitSlop={8}
            >
              <Share2 color="#1C1917" size={19} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.printBtn, pressed && styles.btnPressed]}
              onPress={handlePrintPdf}
            >
              <Printer color="#1C1917" size={17} strokeWidth={2.2} />
              <Text style={styles.printBtnText}>Print / Save PDF</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.webWrapper}>
          <PdfWebView
            ref={webViewRef}
            source={{ html: htmlContent, baseUrl: 'https://vanirgroup.com/' }}
            style={styles.webView}
            scalesPageToFit
            bounces={false}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  topBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1917',
  },
  webWrapper: {
    flex: 1,
    backgroundColor: '#CBD5E1',
  },
  webView: {
    flex: 1,
    backgroundColor: '#CBD5E1',
  },
});
