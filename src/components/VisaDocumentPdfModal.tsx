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
  DRV_LOGO_DATA_URI,
  escapeHtml,
  generateLinearBarcodeSvg,
  IATA_LOGO_DATA_URI,
  resolveAirlineBrand,
  resolveHotelBrand,
  resolveInsuranceBrand,
  VANIR_SEAL_DATA_URI,
} from '../utils/pdfBrandAssets';
import { printOrSavePdfDocument } from '../utils/pdfPrinter';

const PdfWebView = WebView as unknown as React.ComponentType<any>;

export type VisaDocType =
  | 'insurance'
  | 'hotel'
  | 'flight'
  | 'noc'
  | 'itinerary'
  | 'package'
  | 'jet'
  | 'yacht'
  | 'car'
  | 'limousine'
  | 'apartment'
  | 'tour'
  | 'airport'
  | 'esim';

export interface VisaDocumentPdfModalProps {
  visible: boolean;
  onClose: () => void;
  docType: VisaDocType;
  data: {
    referenceNumber?: string;
    issueDate?: string;
    clientName: string;
    passportNumber?: string;
    nationality?: string;
    dob?: string;
    email?: string;
    phone?: string;

    // Destination
    destinationCountry?: string;
    destinationCity?: string;

    // Travel Insurance
    insuranceProvider?: string;
    insuranceCoverageAmount?: string;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    insuranceDurationDays?: number;

    // Hotel / Apartment Voucher
    hotelName?: string;
    hotelAddress?: string;
    hotelPhone?: string;
    checkInDate?: string;
    checkOutDate?: string;
    roomType?: string;
    nights?: number;
    guestsCount?: number;

    // Embassy Flight
    flightTripType?: 'round' | 'oneway';
    flightOrigin?: string;
    flightOriginCode?: string;
    flightDestination?: string;
    flightDestinationCode?: string;
    flightDepartureDate?: string;
    flightReturnDate?: string;
    flightAirline?: string;
    flightAirlineCode?: string;
    flightNumber?: string;
    pnr?: string;
    passengersCount?: number;

    // NOC / Work Verification
    jobTitle?: string;
    companyName?: string;
    monthlySalary?: string;
    salaryCurrency?: string;
    managerName?: string;
    managerContact?: string;
    employmentStartDate?: string;
    embassyName?: string;

    // Itinerary
    itineraryDays?: Array<{
      dayNumber: number;
      title: string;
      activities: string;
      hotelStay: string;
    }>;

    // Charter / Fleet / Service / eSIM / Package extras
    packageName?: string;
    packageTier?: string;
    totalAmountPaid?: number;
    paymentMethod?: string;
    transactionId?: string;
    vehicleOrVesselName?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    serviceTime?: string;
    durationLabel?: string;
    aircraftRange?: string;
    aircraftSpeed?: string;
    esimDataPlan?: string;
    specialRequests?: string;
  };
}

function buildIsoQrSvg(url: string, sizePx = 86, darkColor = '#0F172A'): string {
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
    return `<div style="width:${sizePx}px;height:${sizePx}px;border:1px solid #CBD5E1;display:flex;align-items:center;justify-content:center;font-size:9px;">QR</div>`;
  }
}

function resolveOperatorBrandLogoHtml(docType: string, name?: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('rolls') || n.includes('phantom') || n.includes('ghost') || n.includes('cullinan') || (docType === 'car' && !n.includes('mercedes') && !n.includes('maybach') && !n.includes('bentley') && !n.includes('cadillac'))) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="4" fill="#0C0A09"/>
        <path d="M10 6H18C20.5 6 22 7.2 22 9.5C22 11.5 20.5 12.8 18 12.8H10V6Z" stroke="#D4AF37" stroke-width="1.8" fill="none"/>
        <path d="M10 6V26M10 13H18L23 26" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M16 9H24C26.5 9 28 10.2 28 12.5C28 14.5 26.5 15.8 24 15.8H16V9Z" stroke="#F5D77F" stroke-width="1.8" fill="none"/>
        <path d="M16 9V26M16 16H24L28 26" stroke="#F5D77F" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <div style="font-family:'Times New Roman',serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;">ROLLS-ROYCE</div>
    </div>`;
  }
  if (n.includes('bentley')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M6 14C11 12 14 14 16 16C18 14 21 12 26 14C23 18 19 19 16 20C13 19 9 18 6 14Z" fill="#D4AF37"/>
        <circle cx="16" cy="16" r="5" fill="#0C0A09" stroke="#D4AF37" stroke-width="1"/>
        <text x="16" y="19" text-anchor="middle" fill="#D4AF37" font-family="Georgia,serif" font-size="8" font-weight="bold">B</text>
      </svg>
      <div style="font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;">BENTLEY</div>
    </div>`;
  }
  if (n.includes('maybach')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M7 22L13 10L16 16L19 10L25 22M11 22L16 13L21 22" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
      <div style="font-family:'Arial',sans-serif;font-size:11px;font-weight:900;letter-spacing:1.5px;color:#D4AF37;">MAYBACH</div>
    </div>`;
  }
  if (n.includes('mercedes') || n.includes('s-class') || n.includes('s580') || n.includes('v-class')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <line x1="16" y1="3" x2="16" y2="16" stroke="#D4AF37" stroke-width="1.6"/>
        <line x1="16" y1="16" x2="5" y2="22" stroke="#D4AF37" stroke-width="1.6"/>
        <line x1="16" y1="16" x2="27" y2="22" stroke="#D4AF37" stroke-width="1.6"/>
      </svg>
      <div style="font-family:'Arial',sans-serif;font-size:11px;font-weight:900;letter-spacing:1.5px;color:#D4AF37;">MERCEDES-BENZ</div>
    </div>`;
  }
  if (n.includes('cadillac') || n.includes('escalade')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M10 11L16 8L22 11V18L16 24L10 18V11Z" stroke="#D4AF37" stroke-width="1.4" fill="none"/>
        <path d="M12 14H20M12 18H20" stroke="#D4AF37" stroke-width="1"/>
      </svg>
      <div style="font-family:'Arial',sans-serif;font-size:11px;font-weight:900;letter-spacing:1.5px;color:#D4AF37;">CADILLAC</div>
    </div>`;
  }
  if (n.includes('bombardier') || n.includes('global 7500') || (docType === 'jet' && !n.includes('gulfstream') && !n.includes('falcon') && !n.includes('citation'))) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M4 18L16 8L28 18L22 19L16 13L10 19L4 18Z" fill="#D4AF37"/>
        <path d="M8 22L16 16L24 22L20 23L16 19.5L12 23L8 22Z" fill="#F5D77F"/>
      </svg>
      <div style="font-family:'Arial',sans-serif;font-size:11px;font-weight:900;letter-spacing:1.5px;color:#D4AF37;">BOMBARDIER</div>
    </div>`;
  }
  if (n.includes('gulfstream')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M5 19C10 13 22 13 27 19L16 11L5 19Z" fill="#D4AF37"/>
        <circle cx="16" cy="20" r="2.5" fill="#D4AF37"/>
      </svg>
      <div style="font-family:'Arial',sans-serif;font-size:11px;font-weight:900;letter-spacing:1.5px;color:#D4AF37;">GULFSTREAM</div>
    </div>`;
  }
  if (n.includes('falcon') || n.includes('dassault')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M16 6L19 13L27 15L20 19L21 27L16 22L11 27L12 19L5 15L13 13L16 6Z" fill="#D4AF37"/>
      </svg>
      <div style="font-family:'Arial',sans-serif;font-size:11px;font-weight:900;letter-spacing:1.5px;color:#D4AF37;">DASSAULT FALCON</div>
    </div>`;
  }
  if (n.includes('sunseeker')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M6 18C12 13 20 13 26 18M9 22C14 18 18 18 23 22" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="16" cy="12" r="3" fill="#D4AF37"/>
      </svg>
      <div style="font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;">SUNSEEKER</div>
    </div>`;
  }
  if (n.includes('riva')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M8 20L16 8L24 20M12 16H20" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/>
        <text x="16" y="23" text-anchor="middle" fill="#D4AF37" font-family="Georgia,serif" font-size="7" font-weight="bold">RIVA</text>
      </svg>
      <div style="font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;">RIVA YACHTS</div>
    </div>`;
  }
  if (n.includes('benetti')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M7 11H25V14H7V11ZM10 17H22V20H10V17ZM13 23H19V25H13V23Z" fill="#D4AF37"/>
        <polygon points="16,6 18,10 14,10" fill="#D4AF37"/>
      </svg>
      <div style="font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;">BENETTI YACHTS</div>
    </div>`;
  }
  if (n.includes('lurssen') || n.includes('lürssen') || n.includes('feadship')) {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M6 16L16 8L26 16M10 20L16 15L22 20M12 24L16 21L20 24" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <div style="font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;">${n.includes('feadship') ? 'FEADSHIP' : 'LÜRSSEN YACHTS'}</div>
    </div>`;
  }
  if (n.includes('majesty') || docType === 'yacht') {
    return `<div style="background:#0C0A09;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0C0A09" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M8 18L11 11L16 15L21 11L24 18H8Z" fill="#D4AF37"/>
        <path d="M16 7V24M12 21C12 23 14 24 16 24C18 24 20 23 20 21" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
      <div style="font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;">MAJESTY YACHTS</div>
    </div>`;
  }
  if (docType === 'esim') {
    return `<div style="background:#064E3B;border:1.5px solid #10B981;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="22" height="22" rx="4" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
        <path d="M10 11H14V15H10V11ZM18 11H22V15H18V11ZM10 17H14V21H10V17ZM18 17H22V21H18V17Z" fill="#10B981"/>
      </svg>
      <div style="font-family:'Arial',sans-serif;font-size:11px;font-weight:900;letter-spacing:1.5px;color:#34D399;">GLOBAL 5G eSIM</div>
    </div>`;
  }
  if (docType === 'airport') {
    return `<div style="background:#0F172A;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#0F172A" stroke="#D4AF37" stroke-width="1.5"/>
        <path d="M8 17L16 11L24 17L20 18L16 14L12 18L8 17Z" fill="#D4AF37"/>
        <path d="M16 14V22" stroke="#D4AF37" stroke-width="1.5"/>
      </svg>
      <div style="font-family:'Arial',sans-serif;font-size:11px;font-weight:900;letter-spacing:1.5px;color:#D4AF37;">VIP TARMAC CONCIERGE</div>
    </div>`;
  }
  if (docType === 'tour') {
    return `<div style="background:#1E1B4B;border:1.5px solid #D4AF37;border-radius:6px;padding:4px 8px;display:flex;align-items:center;gap:6px;">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#1E1B4B" stroke="#D4AF37" stroke-width="1.5"/>
        <polygon points="16,6 19,13 26,14 21,19 22,26 16,22 10,26 11,19 6,14 13,13" fill="#D4AF37"/>
      </svg>
      <div style="font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#D4AF37;">ROYAL EXPEDITIONS</div>
    </div>`;
  }
  return '';
}

export function VisaDocumentPdfModal({
  visible,
  onClose,
  docType,
  data,
}: VisaDocumentPdfModalProps) {
  const webViewRef = useRef<any>(null);

  const issueDate = useMemo(() => {
    if (data.issueDate) return data.issueDate;
    return new Date()
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .toUpperCase();
  }, [data.issueDate]);

  const insuranceBrand = useMemo(
    () => resolveInsuranceBrand(data.insuranceProvider),
    [data.insuranceProvider],
  );
  const hotelBrand = useMemo(
    () =>
      resolveHotelBrand(
        data.hotelName || data.packageName,
        data.destinationCity || data.destinationCountry,
      ),
    [data.destinationCity, data.destinationCountry, data.hotelName, data.packageName],
  );
  const airlineBrand = useMemo(
    () => resolveAirlineBrand(data.flightAirline, data.flightAirlineCode),
    [data.flightAirline, data.flightAirlineCode],
  );

  const refCode = useMemo(() => {
    if (data.referenceNumber) return data.referenceNumber;
    const seed = Math.abs(
      Array.from(`${data.clientName || 'VIP'}-${docType}`).reduce(
        (acc, c) => (acc * 33 + c.charCodeAt(0)) | 0,
        72914,
      ),
    )
      .toString()
      .slice(0, 6)
      .padStart(6, '8');

    switch (docType) {
      case 'insurance':
        return `${insuranceBrand.policyPrefix}-2026-${seed}`;
      case 'hotel':
      case 'apartment':
        return `CRS-HTL-${seed}`;
      case 'flight':
        return data.pnr || `VNR${seed.slice(0, 3)}`;
      case 'noc':
        return `HR-NOC/2026/${seed.slice(0, 4)}`;
      case 'jet':
        return `FBO-JET-${seed}`;
      case 'yacht':
        return `MYBA-YCH-${seed}`;
      case 'car':
      case 'limousine':
        return `VIP-FLT-${seed}`;
      case 'esim':
        return `LPA-ESIM-${seed}`;
      default:
        return `VNR-DOC-${seed}`;
    }
  }, [data.clientName, data.pnr, data.referenceNumber, docType, insuranceBrand.policyPrefix]);

  const qrVerifyUrl = `https://vanirgroup.com/verify/doc?type=${encodeURIComponent(
    docType,
  )}&ref=${encodeURIComponent(refCode)}&client=${encodeURIComponent(
    data.clientName || 'VIP Member',
  )}`;

  const qrSvg = useMemo(() => buildIsoQrSvg(qrVerifyUrl, 84, '#0F172A'), [qrVerifyUrl]);
  const barcodeSvg = useMemo(
    () => generateLinearBarcodeSvg(`${docType.toUpperCase()}-${refCode}`, 220, 36, '#0F172A'),
    [docType, refCode],
  );

  const headerMeta = useMemo(() => {
    switch (docType) {
      case 'insurance':
        return { badge: insuranceBrand.companyName, title: `Policy ${refCode}` };
      case 'hotel':
        return { badge: hotelBrand.brandName, title: `Hotel Voucher ${refCode}` };
      case 'apartment':
        return { badge: hotelBrand.brandName, title: `Residence Voucher ${refCode}` };
      case 'flight':
        return { badge: `${airlineBrand.name} • GDS`, title: `Flight Itinerary ${data.pnr || refCode}` };
      case 'noc':
        return { badge: (data.companyName || 'CORPORATE HR').toUpperCase(), title: `Official NOC Certificate` };
      case 'jet':
        return { badge: 'PRIVATE AVIATION CHARTER', title: `Flight Manifest ${refCode}` };
      case 'yacht':
        return { badge: 'ROYAL MARITIME CHARTER', title: `Charter Voucher ${refCode}` };
      case 'car':
      case 'limousine':
        return { badge: 'EXECUTIVE CHAUFFEUR DISPATCH', title: `Fleet Voucher ${refCode}` };
      case 'esim':
        return { badge: 'GLOBAL 5G ROAMING eSIM', title: `Activation Certificate ${refCode}` };
      case 'itinerary':
        return { badge: 'CONSULAR TRAVEL SCHEDULE', title: `Official Itinerary ${refCode}` };
      default:
        return { badge: 'OFFICIAL EMBASSY VOUCHER', title: `Confirmation ${refCode}` };
    }
  }, [airlineBrand.name, data.companyName, data.pnr, docType, hotelBrand.brandName, insuranceBrand.companyName, refCode]);

  const htmlContent = useMemo(() => {
    const clientNameUpper = (data.clientName || 'HONORED VIP GUEST').toUpperCase();
    const passportNo = (data.passportNumber || 'P-VERIFIED').toUpperCase();
    const nationality = (data.nationality || 'INTERNATIONAL').toUpperCase();
    const paidAmount = Number(data.totalAmountPaid ?? 0);
    const paymentLabel = data.paymentMethod || 'PREPAID • CREDIT CARD AUTHORIZED';

    const sharedStyles = `
      @page { size: A4 portrait; margin: 0; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      html, body {
        margin: 0; padding: 0; background: #CBD5E1;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        color: #0F172A;
      }
      .wrap { padding: 18px 12px 32px; display: flex; justify-content: center; }
      .page {
        width: 794px; min-height: 1122px; background: #FFFFFF;
        box-shadow: 0 12px 36px rgba(15, 23, 42, 0.2);
        padding: 34px 42px 28px; display: flex; flex-direction: column;
        justify-content: space-between; position: relative; overflow: hidden;
      }
      @media print {
        html, body { background: #FFFFFF; }
        .wrap { padding: 0; }
        .page { width: 210mm; min-height: 297mm; box-shadow: none; padding: 12mm 14mm 10mm; }
      }
      .tbl { width: 100%; border-collapse: collapse; margin-bottom: 14px; border: 1px solid #CBD5E1; }
      .tbl th {
        background: #F1F5F9; color: #334155; font-size: 8.5px; font-weight: 800;
        text-transform: uppercase; letter-spacing: 0.7px; padding: 7px 10px;
        text-align: left; border-bottom: 1px solid #CBD5E1; border-right: 1px solid #E2E8F0;
      }
      .tbl td {
        padding: 8px 10px; font-size: 11px; font-weight: 600; color: #0F172A;
        border-bottom: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; vertical-align: top;
      }
      .sec-bar {
        background: #0F172A; color: #FFFFFF; padding: 6px 12px; font-size: 10px;
        font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
        display: flex; justify-content: space-between; align-items: center;
        border-radius: 3px 3px 0 0;
      }
      .mono { font-family: 'Courier New', Courier, monospace; font-weight: 800; }
      .badge-ok {
        display: inline-block; background: #DCFCE7; color: #166534; border: 1px solid #86EFAC;
        font-size: 9px; font-weight: 900; padding: 2px 8px; border-radius: 3px; letter-spacing: 0.5px;
      }
      .footer-verify {
        border-top: 1.5px solid #0F172A; padding-top: 12px; margin-top: 14px;
        display: flex; justify-content: space-between; align-items: center; gap: 14px;
      }
      .sig-line {
        font-family: 'Brush Script MT', 'Snell Roundhand', Georgia, cursive;
        font-size: 22px; color: #1D4ED8; font-style: italic; line-height: 1.1;
      }
    `;

    // ── 1. TRAVEL MEDICAL INSURANCE POLICY CERTIFICATE ───────────────────
    if (docType === 'insurance') {
      const start = data.insuranceStartDate || issueDate;
      const end = data.insuranceEndDate || 'AS SCHEDULED';
      const days = data.insuranceDurationDays || 15;
      const coverage = data.insuranceCoverageAmount || '€50,000 / USD 55,000';

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=840, initial-scale=0.45"/><style>${sharedStyles}</style></head><body>
      <div class="wrap"><div class="page">
        <div>
          <div style="height:7px;background:linear-gradient(90deg,${insuranceBrand.primaryColor},${insuranceBrand.accentColor});margin:-34px -42px 22px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid ${insuranceBrand.primaryColor};padding-bottom:14px;margin-bottom:16px;">
            <div>
              ${insuranceBrand.logoSvgHtml}
              <div style="font-size:8.5px;color:#475569;margin-top:6px;font-weight:600;">Underwriter: ${escapeHtml(insuranceBrand.underwriter)}</div>
              <div style="font-size:8.5px;color:#64748B;">${escapeHtml(insuranceBrand.regNumber)}</div>
            </div>
            <div style="text-align:right;">
              <div style="display:inline-block;background:${insuranceBrand.primaryColor};color:#FFFFFF;font-size:9px;font-weight:900;padding:4px 10px;border-radius:3px;letter-spacing:1px;">CERTIFICATE OF TRAVEL INSURANCE</div>
              <div style="font-size:15px;font-weight:900;color:#0F172A;margin-top:6px;">POLICY NO: <span class="mono">${escapeHtml(refCode)}</span></div>
              <div style="font-size:9.5px;color:#475569;margin-top:2px;">Date of Issue: <strong>${escapeHtml(issueDate)}</strong> • Status: <span class="badge-ok">ACTIVE &amp; PAID</span></div>
            </div>
          </div>

          <div style="background:#F8FAFC;border-left:4px solid ${insuranceBrand.primaryColor};padding:10px 14px;font-size:10.5px;line-height:1.5;margin-bottom:16px;color:#1E293B;">
            <strong>CONSULAR &amp; EMBASSY CERTIFICATION:</strong> This Certificate confirms that the insured person named below holds an active International Medical &amp; Repatriation Insurance Policy compliant with <strong>Regulation (EC) No 810/2009 of the European Parliament (Schengen Visa Code Article 15)</strong>, UKVI, and Worldwide Consular Standards with <strong>ZERO DEDUCTIBLE (€0.00)</strong>.
          </div>

          <div class="sec-bar" style="background:${insuranceBrand.primaryColor};">
            <span>1. INSURED POLICYHOLDER PARTICULARS</span>
            <span>INDIVIDUAL INTERNATIONAL PLAN</span>
          </div>
          <table class="tbl">
            <thead>
              <tr>
                <th>FULL NAME OF INSURED (AS IN PASSPORT)</th>
                <th>PASSPORT NUMBER</th>
                <th>NATIONALITY</th>
                <th>DATE OF BIRTH</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="mono" style="font-size:12px;">${escapeHtml(clientNameUpper)}</td>
                <td class="mono">${escapeHtml(passportNo)}</td>
                <td>${escapeHtml(nationality)}</td>
                <td>${escapeHtml(data.dob || 'VERIFIED ADULT')}</td>
              </tr>
            </tbody>
          </table>

          <div class="sec-bar" style="background:${insuranceBrand.primaryColor};">
            <span>2. GEOGRAPHICAL TERRITORY &amp; PERIOD OF COVERAGE</span>
            <span>24/7 EMERGENCY ALARM CENTER</span>
          </div>
          <table class="tbl">
            <thead>
              <tr>
                <th>GEOGRAPHICAL SCOPE</th>
                <th>DESTINATION</th>
                <th>EFFECTIVE FROM (00:01)</th>
                <th>EXPIRATION (23:59)</th>
                <th>TOTAL DAYS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>SCHENGEN AREA, EU &amp; WORLDWIDE</strong></td>
                <td>${escapeHtml((data.destinationCountry || 'Schengen States').toUpperCase())}</td>
                <td class="mono">${escapeHtml(start)}</td>
                <td class="mono">${escapeHtml(end)}</td>
                <td class="mono">${days} DAYS</td>
              </tr>
            </tbody>
          </table>

          <div class="sec-bar" style="background:#0F172A;">
            <span>3. SCHEDULE OF INSURED MEDICAL &amp; ASSISTANCE BENEFITS</span>
            <span>DEDUCTIBLE: €0.00 / NIL</span>
          </div>
          <table class="tbl">
            <thead>
              <tr>
                <th style="width:52%;">BENEFIT DESCRIPTION</th>
                <th style="width:28%;">MAXIMUM SUM INSURED</th>
                <th style="width:20%;">EXCESS / DEDUCTIBLE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Emergency Medical, Surgical &amp; Hospitalization Expenses</strong> (Inpatient &amp; Outpatient)</td>
                <td class="mono" style="color:${insuranceBrand.primaryColor};font-size:12px;">${escapeHtml(coverage)}</td>
                <td class="mono" style="color:#166534;">NIL (€0.00)</td>
              </tr>
              <tr>
                <td><strong>Emergency Medical Evacuation &amp; Air Ambulance</strong></td>
                <td class="mono">100% ACTUAL COST (INCLUDED)</td>
                <td class="mono" style="color:#166534;">NIL (€0.00)</td>
              </tr>
              <tr>
                <td><strong>Repatriation of Mortal Remains to Country of Residence</strong></td>
                <td class="mono">100% ACTUAL COST (INCLUDED)</td>
                <td class="mono" style="color:#166534;">NIL (€0.00)</td>
              </tr>
              <tr>
                <td><strong>Epidemic &amp; Pandemic Medical Treatment (including COVID-19)</strong></td>
                <td class="mono">COVERED UP TO POLICY LIMIT</td>
                <td class="mono" style="color:#166534;">NIL (€0.00)</td>
              </tr>
              <tr>
                <td><strong>Emergency Dental Pain Relief &amp; Prescription Pharmaceuticals</strong></td>
                <td class="mono">EUR 600 / USD 650</td>
                <td class="mono" style="color:#166534;">NIL (€0.00)</td>
              </tr>
              <tr>
                <td><strong>24/7 Multilingual Medical Assistance &amp; Direct Hospital Billing</strong></td>
                <td class="mono">INCLUDED WORLDWIDE</td>
                <td class="mono" style="color:#166534;">24/7 DIRECT</td>
              </tr>
            </tbody>
          </table>

          <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:8px;">
            <div style="border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;background:#F8FAFC;">
              <div style="font-size:9px;font-weight:900;color:${insuranceBrand.primaryColor};text-transform:uppercase;">24/7 EMERGENCY MEDICAL ASSISTANCE HOTLINE</div>
              <div class="mono" style="font-size:12px;margin-top:4px;color:#0F172A;">${escapeHtml(insuranceBrand.emergencyPhone)}</div>
              <div style="font-size:9px;color:#475569;margin-top:4px;">Claims &amp; Policy Verification Portal: ${escapeHtml(insuranceBrand.claimsPortal)}</div>
              ${paidAmount > 0 ? `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #CBD5E1;font-size:9.5px;font-weight:800;">Premium Receipt: USD ${paidAmount.toFixed(2)} — PAID (${escapeHtml(paymentLabel)})</div>` : ''}
            </div>

            <div style="border:1px solid #CBD5E1;border-radius:4px;padding:8px 10px;background:#FFFFFF;">
              ${buildAuthenticDocumentStampHtml({
                variant: 'insurance',
                issuerName: insuranceBrand.companyName,
                dateStr: issueDate,
                refCode,
                signerName: 'Dr. M. Laurent-Dubois',
                signerTitle: 'Chief Underwriting Officer',
              })}
            </div>
          </div>
        </div>

        <div class="footer-verify">
          <div>
            ${barcodeSvg}
            <div style="font-size:8px;color:#64748B;margin-top:2px;">Authorized Broker: Vanir Group International • IATA &amp; DRV Accredited (${escapeHtml(refCode)})</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="text-align:right;font-size:8.5px;color:#334155;">
              <strong>CONSULAR DIGITAL VERIFICATION</strong><br/>Scan QR to verify policy status on<br/><span class="mono">vanirgroup.com/verify/doc</span>
            </div>
            <div style="padding:3px;border:1px solid #CBD5E1;border-radius:4px;">${qrSvg}</div>
          </div>
        </div>
      </div></div></body></html>`;
    }

    // ── 2. OFFICIAL HOTEL / LUXURY APARTMENT RESERVATION VOUCHER ─────────
    if (docType === 'hotel' || docType === 'apartment') {
      const propName = data.hotelName || data.packageName || 'The Ritz-Carlton Palace';
      const checkIn = data.checkInDate || issueDate;
      const checkOut = data.checkOutDate || 'CONFIRMED DEPARTURE';
      const nights = data.nights || 5;
      const guests = data.guestsCount || 2;
      const room =
        data.roomType ||
        (docType === 'apartment'
          ? 'Three-Bedroom Royal Panoramic Penthouse Residence'
          : 'Deluxe Executive Suite — King Bed (Club Lounge & Breakfast Included)');

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=840, initial-scale=0.45"/><style>${sharedStyles}</style></head><body>
      <div class="wrap"><div class="page">
        <div>
          <div style="height:7px;background:linear-gradient(90deg,${hotelBrand.primaryColor},${hotelBrand.accentColor});margin:-34px -42px 24px;"></div>

          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid ${hotelBrand.primaryColor};padding-bottom:16px;margin-bottom:18px;">
            <div>
              ${hotelBrand.logoSvgHtml}
              <div style="font-size:9px;color:#475569;margin-top:6px;font-weight:600;">Property Address: ${escapeHtml(data.hotelAddress || hotelBrand.address)}</div>
              <div style="font-size:9px;color:#64748B;">Front Desk &amp; Concierge: ${escapeHtml(data.hotelPhone || hotelBrand.phone)}</div>
            </div>
            <div style="text-align:right;">
              <div style="display:inline-block;background:${hotelBrand.primaryColor};color:#FFFFFF;font-size:9px;font-weight:900;padding:4px 10px;border-radius:3px;letter-spacing:1.2px;">
                ${docType === 'apartment' ? 'CONFIRMED RESIDENCE LEASE VOUCHER' : 'OFFICIAL HOTEL RESERVATION VOUCHER'}
              </div>
              <div style="font-size:15px;font-weight:900;color:#0F172A;margin-top:7px;">CONFIRMATION: <span class="mono">${escapeHtml(refCode)}</span></div>
              <div style="font-size:9px;color:#64748B;margin-top:2px;">${escapeHtml(hotelBrand.crsSystem)}</div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);border:1.5px solid ${hotelBrand.primaryColor};border-radius:4px;overflow:hidden;margin-bottom:18px;">
            <div style="padding:10px 12px;background:${hotelBrand.primaryColor};color:#FFFFFF;">
              <div style="font-size:8px;letter-spacing:1px;opacity:0.8;font-weight:800;">CHECK-IN DATE</div>
              <div class="mono" style="font-size:14px;margin-top:3px;">${escapeHtml(checkIn)}</div>
              <div style="font-size:8.5px;opacity:0.85;margin-top:2px;">${escapeHtml(hotelBrand.checkInTime)}</div>
            </div>
            <div style="padding:10px 12px;background:#F8FAFC;border-right:1px solid #CBD5E1;">
              <div style="font-size:8px;letter-spacing:1px;color:#64748B;font-weight:800;">CHECK-OUT DATE</div>
              <div class="mono" style="font-size:14px;margin-top:3px;color:#0F172A;">${escapeHtml(checkOut)}</div>
              <div style="font-size:8.5px;color:#475569;margin-top:2px;">${escapeHtml(hotelBrand.checkOutTime)}</div>
            </div>
            <div style="padding:10px 12px;background:#F8FAFC;border-right:1px solid #CBD5E1;">
              <div style="font-size:8px;letter-spacing:1px;color:#64748B;font-weight:800;">DURATION &amp; OCCUPANCY</div>
              <div class="mono" style="font-size:14px;margin-top:3px;color:#0F172A;">${nights} NIGHT(S)</div>
              <div style="font-size:8.5px;color:#475569;margin-top:2px;">${guests} Registered Guest(s)</div>
            </div>
            <div style="padding:10px 12px;background:#F8FAFC;">
              <div style="font-size:8px;letter-spacing:1px;color:#64748B;font-weight:800;">RESERVATION STATUS</div>
              <div style="margin-top:4px;"><span class="badge-ok">GUARANTEED &amp; PAID</span></div>
              <div style="font-size:8.5px;color:#475569;margin-top:3px;">Embassy / Front Desk Valid</div>
            </div>
          </div>

          <div class="sec-bar" style="background:${hotelBrand.primaryColor};">
            <span>1. PRIMARY REGISTERED GUEST &amp; ACCOMMODATION DETAILS</span>
            <span>PROPERTY FOLIO CONFIRMED</span>
          </div>
          <table class="tbl">
            <tbody>
              <tr>
                <th style="width:28%;">PROPERTY / HOTEL NAME</th>
                <td style="font-size:12px;font-weight:900;">${escapeHtml(propName)}</td>
              </tr>
              <tr>
                <th>DESTINATION CITY / COUNTRY</th>
                <td>${escapeHtml(data.destinationCity || data.destinationCountry || 'International Destination')}</td>
              </tr>
              <tr>
                <th>PRIMARY GUEST NAME</th>
                <td class="mono" style="font-size:12px;">${escapeHtml(clientNameUpper)}</td>
              </tr>
              <tr>
                <th>PASSPORT / TRAVEL ID</th>
                <td class="mono">${escapeHtml(passportNo)} (${escapeHtml(nationality)})</td>
              </tr>
              <tr>
                <th>ACCOMMODATION CATEGORY</th>
                <td><strong>${escapeHtml(room)}</strong></td>
              </tr>
              <tr>
                <th>MEAL PLAN &amp; VIP PRIVILEGES</th>
                <td>Daily Gourmet Breakfast Included • Complimentary High-Speed Wi-Fi • Late Arrival Guarantee Held</td>
              </tr>
              ${
                data.specialRequests
                  ? `<tr><th>SPECIAL CONCIERGE NOTES</th><td>${escapeHtml(data.specialRequests)}</td></tr>`
                  : ''
              }
            </tbody>
          </table>

          <div class="sec-bar" style="background:#0F172A;">
            <span>2. SETTLEMENT &amp; BILLING SUMMARY</span>
            <span>NO BALANCE DUE AT CHECK-IN</span>
          </div>
          <table class="tbl">
            <tbody>
              <tr>
                <td style="width:65%;">Room / Suite Tariff (${nights} Night${nights > 1 ? 's' : ''}) + Municipality, VAT &amp; Tourism Taxes</td>
                <td class="mono" style="text-align:right;font-size:12px;">${paidAmount > 0 ? `USD ${paidAmount.toFixed(2)}` : 'PREPAID CONTRACT RATE'}</td>
              </tr>
              <tr>
                <td>Payment Settlement Method</td>
                <td class="mono" style="text-align:right;">${escapeHtml(paymentLabel)}</td>
              </tr>
            </tbody>
          </table>

          <div style="display:grid;grid-template-columns:1.1fr 1.15fr;gap:14px;margin-top:10px;">
            <div style="background:#FAF9F6;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.2px;line-height:1.45;color:#334155;">
              <strong>CHECK-IN &amp; CONSULAR INSTRUCTIONS:</strong><br/>
              • Present this Reservation Voucher and valid passport at the Front Desk.<br/>
              • Room &amp; statutory taxes are guaranteed via Vanir Wholesale Hospitality Account.<br/>
              • Valid proof of accommodation for Schengen, UK, US &amp; global diplomatic visas.
            </div>

            <div style="border:1px solid #CBD5E1;border-radius:4px;padding:8px 10px;background:#FFFFFF;">
              ${buildAuthenticDocumentStampHtml({
                variant: docType,
                issuerName: hotelBrand.brandName,
                dateStr: issueDate,
                refCode,
                signerName: 'H. Van Der Berg',
                signerTitle: `Reservations Desk • ${hotelBrand.brandName}`,
                cityOrBranch: data.destinationCity || data.destinationCountry || 'PALACE DESK',
              })}
            </div>
          </div>
        </div>

        <div class="footer-verify">
          <div>
            ${barcodeSvg}
            <div style="font-size:8px;color:#64748B;margin-top:2px;">CRS Confirmation: ${escapeHtml(refCode)} • Issued on ${escapeHtml(issueDate)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="text-align:right;font-size:8.5px;color:#334155;">
              <strong>HOTEL VOUCHER VERIFICATION</strong><br/>Verify reservation live on<br/><span class="mono">vanirgroup.com/verify/doc</span>
            </div>
            <div style="padding:3px;border:1px solid #CBD5E1;border-radius:4px;">${qrSvg}</div>
          </div>
        </div>
      </div></div></body></html>`;
    }

    // ── 3. EMBASSY FLIGHT RESERVATION (GDS AMADEUS / AIRLINE HEADER) ─────
    if (docType === 'flight') {
      const pnr = (data.pnr || refCode).toUpperCase();
      const origCode = (data.flightOriginCode || 'CAI').toUpperCase();
      const destCode = (data.flightDestinationCode || 'CDG').toUpperCase();
      const origName = data.flightOrigin || 'Cairo International Airport';
      const destName = data.flightDestination || data.destinationCountry || 'Paris Charles de Gaulle';
      const depDate = data.flightDepartureDate || issueDate;
      const retDate = data.flightReturnDate;
      const fltNo = data.flightNumber || `${airlineBrand.code} 384`;
      const paxCount = data.passengersCount || 1;

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=840, initial-scale=0.45"/><style>${sharedStyles}</style></head><body>
      <div class="wrap"><div class="page">
        <div>
          <div style="height:7px;background:linear-gradient(90deg,${airlineBrand.primaryColor},${airlineBrand.accentColor});margin:-34px -42px 22px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0F172A;padding-bottom:14px;margin-bottom:16px;">
            <div>
              ${airlineBrand.logoHtml}
              <div style="font-size:9px;color:#475569;font-weight:700;margin-top:5px;">${escapeHtml(airlineBrand.name)} • ${escapeHtml(airlineBrand.alliance)}</div>
            </div>
            <div style="text-align:right;">
              <div style="display:inline-flex;align-items:center;gap:8px;border:1px solid #CBD5E1;padding:4px 10px;border-radius:4px;background:#F8FAFC;">
                <img src="${IATA_LOGO_DATA_URI}" alt="IATA" style="height:18px;"/>
                <span style="font-size:9px;font-weight:900;">AMADEUS GDS PNR ITINERARY</span>
              </div>
              <div style="font-size:17px;font-weight:900;margin-top:6px;">GDS PNR: <span class="mono" style="color:${airlineBrand.primaryColor};">${escapeHtml(pnr)}</span></div>
              <div style="font-size:9px;color:#64748B;">Issued: ${escapeHtml(issueDate)} • Status: <span class="badge-ok">HK1 CONFIRMED</span></div>
            </div>
          </div>

          <div class="sec-bar" style="background:${airlineBrand.primaryColor};">
            <span>PASSENGER MANIFEST (${paxCount} PASSENGER${paxCount > 1 ? 'S' : ''})</span>
            <span>CONSULAR VISA SUBMISSION COPY</span>
          </div>
          <table class="tbl">
            <thead><tr><th>PASSENGER NAME</th><th>PASSPORT NO.</th><th>NATIONALITY</th><th>BAGGAGE ALLOWANCE</th></tr></thead>
            <tbody>
              <tr>
                <td class="mono" style="font-size:12px;">${escapeHtml(clientNameUpper)}</td>
                <td class="mono">${escapeHtml(passportNo)}</td>
                <td>${escapeHtml(nationality)}</td>
                <td>${escapeHtml(airlineBrand.baggagePolicy)}</td>
              </tr>
            </tbody>
          </table>

          <div class="sec-bar">
            <span>CONFIRMED AIR ITINERARY SEGMENTS</span>
            <span>OPERATING CARRIER: ${escapeHtml(airlineBrand.code)}</span>
          </div>
          <table class="tbl">
            <thead>
              <tr>
                <th>SEGMENT</th>
                <th>FLIGHT NO.</th>
                <th>FROM (ORIGIN)</th>
                <th>TO (DESTINATION)</th>
                <th>DATE &amp; TIME</th>
                <th>CABIN / STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="mono">SEG 01 (OUTBOUND)</td>
                <td class="mono">${escapeHtml(fltNo)}</td>
                <td><strong>${escapeHtml(origCode)}</strong> — ${escapeHtml(origName)}</td>
                <td><strong>${escapeHtml(destCode)}</strong> — ${escapeHtml(destName)}</td>
                <td class="mono">${escapeHtml(depDate)} • 09:45</td>
                <td><span class="badge-ok">CONFIRMED (HK1)</span></td>
              </tr>
              ${
                data.flightTripType !== 'oneway' && retDate
                  ? `<tr>
                      <td class="mono">SEG 02 (RETURN)</td>
                      <td class="mono">${escapeHtml(airlineBrand.code)} 385</td>
                      <td><strong>${escapeHtml(destCode)}</strong> — ${escapeHtml(destName)}</td>
                      <td><strong>${escapeHtml(origCode)}</strong> — ${escapeHtml(origName)}</td>
                      <td class="mono">${escapeHtml(retDate)} • 18:20</td>
                      <td><span class="badge-ok">CONFIRMED (HK1)</span></td>
                    </tr>`
                  : ''
              }
            </tbody>
          </table>

          <div style="display:grid;grid-template-columns:1.1fr 1.15fr;gap:14px;margin-top:12px;">
            <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;font-size:9.5px;line-height:1.5;color:#334155;">
              <strong>EMBASSY &amp; CONSULATE VERIFICATION NOTE:</strong> This GDS flight reservation holds active airline inventory under PNR <strong>${escapeHtml(pnr)}</strong> via IATA Accredited Agency <strong>Vanir Group Aviation</strong>.
              ${paidAmount > 0 ? `<div style="margin-top:6px;font-weight:800;color:#0F172A;">Fee Paid: USD ${paidAmount.toFixed(2)} (${escapeHtml(paymentLabel)})</div>` : ''}
            </div>
            <div style="border:1px solid #CBD5E1;border-radius:4px;padding:8px 10px;background:#FFFFFF;">
              ${buildAuthenticDocumentStampHtml({
                variant: 'flight',
                issuerName: `${airlineBrand.name} • GDS`,
                dateStr: issueDate,
                refCode: pnr,
                signerName: 'A. Al-Hashimi • GDS Desk',
                signerTitle: 'Amadeus / Sabre IATA Ticketing',
              })}
            </div>
          </div>
        </div>

        <div class="footer-verify">
          <div>${barcodeSvg}<div style="font-size:8px;color:#64748B;margin-top:2px;">IATA GDS Record Locator: ${escapeHtml(pnr)}</div></div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="text-align:right;font-size:8.5px;color:#334155;"><strong>VERIFY GDS PNR</strong><br/><span class="mono">vanirgroup.com/verify/doc</span></div>
            <div style="padding:3px;border:1px solid #CBD5E1;border-radius:4px;">${qrSvg}</div>
          </div>
        </div>
      </div></div></body></html>`;
    }

    // ── 4. EMPLOYER NO OBJECTION & SALARY CERTIFICATE (CORPORATE PAPER) ──
    if (docType === 'noc') {
      const company = data.companyName || 'Al-Futtaim Global Enterprises LLC';
      const initials = company
        .split(/\s+/)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() || 'C')
        .join('');
      const embassy = data.embassyName || `The Consulate General of ${data.destinationCountry || 'France'}`;
      const job = data.jobTitle || 'Senior Executive Director';
      const salary = data.monthlySalary || '6,500';
      const currency = data.salaryCurrency || 'USD';
      const startDate = data.employmentStartDate || '01 March 2021';
      const manager = data.managerName || 'Dr. Khaled Al-Mansoori';
      const contact = data.managerContact || '+971 4 302 9900 / hr@corporate-verify.com';

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=840, initial-scale=0.45"/><style>${sharedStyles}</style></head><body>
      <div class="wrap"><div class="page" style="font-family:Georgia,'Times New Roman',serif;">
        <div>
          <!-- CORPORATE EMPLOYER LETTERHEAD -->
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px double #1E3A8A;padding-bottom:16px;margin-bottom:24px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:54px;height:54px;border-radius:8px;background:#1E3A8A;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;border:2px solid #93C5FD;">${escapeHtml(initials)}</div>
              <div>
                <div style="font-size:19px;font-weight:bold;color:#0F172A;letter-spacing:0.6px;">${escapeHtml(company.toUpperCase())}</div>
                <div style="font-size:9.5px;color:#475569;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;margin-top:3px;">HUMAN RESOURCES &amp; EXECUTIVE ADMINISTRATION DEPARTMENT</div>
              </div>
            </div>
            <div style="text-align:right;font-family:Arial,sans-serif;font-size:9.5px;color:#334155;line-height:1.5;">
              <div><strong>Ref No:</strong> ${escapeHtml(refCode)}</div>
              <div><strong>Date:</strong> ${escapeHtml(issueDate)}</div>
              <div><strong>HR Contact:</strong> ${escapeHtml(contact)}</div>
            </div>
          </div>

          <div style="margin-bottom:20px;font-size:12.5px;line-height:1.6;">
            <strong>TO: THE VISA &amp; CONSULAR SECTION</strong><br/>
            <strong>${escapeHtml(embassy.toUpperCase())}</strong>
          </div>

          <div style="text-align:center;margin:22px 0;text-decoration:underline;font-size:15px;font-weight:bold;letter-spacing:0.8px;color:#0F172A;">
            SUBJECT: EMPLOYMENT, SALARY &amp; NO OBJECTION CERTIFICATE (NOC)
          </div>

          <div style="font-size:12.5px;line-height:1.85;color:#1E293B;text-align:justify;">
            <p>Dear Honorable Visa Officer,</p>
            <p>
              This is to officially certify that <strong>${escapeHtml(clientNameUpper)}</strong>, holding Passport Number <strong>${escapeHtml(passportNo)}</strong>, is a full-time permanent employee of <strong>${escapeHtml(company)}</strong> since <strong>${escapeHtml(startDate)}</strong>, currently serving in the capacity of <strong>${escapeHtml(job)}</strong>.
            </p>
            <p>
              We hereby confirm their current compensation details and approved annual leave schedule for travel to <strong>${escapeHtml(data.destinationCountry || 'the destination country')}</strong> as follows:
            </p>
          </div>

          <table class="tbl" style="font-family:Arial,sans-serif;margin:18px 0;">
            <tbody>
              <tr><th style="width:36%;">EMPLOYEE FULL NAME</th><td class="mono">${escapeHtml(clientNameUpper)}</td></tr>
              <tr><th>PASSPORT NUMBER</th><td class="mono">${escapeHtml(passportNo)}</td></tr>
              <tr><th>DESIGNATION / POSITION</th><td><strong>${escapeHtml(job)}</strong></td></tr>
              <tr><th>DATE OF JOINING</th><td>${escapeHtml(startDate)}</td></tr>
              <tr><th>NET MONTHLY REMUNERATION</th><td class="mono">${escapeHtml(currency)} ${escapeHtml(salary)} (Paid Monthly via Bank Transfer)</td></tr>
              <tr><th>APPROVED LEAVE DATES</th><td>${escapeHtml(data.checkInDate || data.insuranceStartDate || 'Approved Scheduled Leave')} — Full Return to Position Guaranteed</td></tr>
            </tbody>
          </table>

          <div style="font-size:12.5px;line-height:1.85;color:#1E293B;text-align:justify;">
            <p>
              <strong>${escapeHtml(company)}</strong> hereby expresses <strong>NO OBJECTION</strong> to the travel of the above-named executive and confirms that their position and employment contract remain secured upon completion of their visit. Please note that the applicant will bear all travel, accommodation, and medical expenses during this trip.
            </p>
            <p>Should your esteemed Consulate require any further verification, please contact the undersigned directly at ${escapeHtml(contact)}.</p>
          </div>

          <div style="font-family:Arial,sans-serif;">
            ${buildAuthenticDocumentStampHtml({
              variant: 'noc',
              issuerName: company,
              dateStr: issueDate,
              refCode,
              signerName: manager,
              signerTitle: 'Director of Human Resources & Corporate Affairs',
            })}
          </div>
        </div>

        <div class="footer-verify" style="font-family:Arial,sans-serif;">
          <div style="font-size:8.5px;color:#64748B;">Document Ref: ${escapeHtml(refCode)} • Electronically Attested Corporate Copy</div>
          <div style="padding:3px;border:1px solid #CBD5E1;border-radius:4px;">${qrSvg}</div>
        </div>
      </div></div></body></html>`;
    }

    // ── 5. PRIVATE JET / SUPERYACHT / CHAUFFEUR / VIP SERVICE / ESIM ─────
    const isCharterOrService = ['jet', 'yacht', 'car', 'limousine', 'tour', 'airport', 'esim'].includes(docType);
    if (isCharterOrService) {
      const divisionMap: Record<string, { title: string; subtitle: string; color: string; codeLabel: string }> = {
        jet: {
          title: 'VANIR EXECUTIVE AVIATION — CHARTER FLIGHT BRIEF',
          subtitle: 'PRIVATE FBO TERMINAL MANIFEST & TAIL ASSIGNMENT',
          color: '#1C1917',
          codeLabel: 'CHARTER MANIFEST NO.',
        },
        yacht: {
          title: 'VANIR ROYAL MARITIME — SUPERYACHT CHARTER PARTY',
          subtitle: 'MYBA MARITIME BOARDING VOUCHER & HARBOR CLEARANCE',
          color: '#0C4A6E',
          codeLabel: 'MARITIME CHARTER NO.',
        },
        car: {
          title: 'VANIR DIPLOMATIC FLEET — EXECUTIVE CHAUFFEUR VOUCHER',
          subtitle: 'CONFIRMED LUXURY VEHICLE & PROTOCOL DISPATCH',
          color: '#18181B',
          codeLabel: 'FLEET DISPATCH REF',
        },
        limousine: {
          title: 'VANIR ROYAL LIMOUSINE — VIP CHAUFFEUR DISPATCH',
          subtitle: 'CONFIRMED AIRPORT TARMAC / CITY CHAUFFEUR TRANSFER',
          color: '#18181B',
          codeLabel: 'DISPATCH VOUCHER NO.',
        },
        esim: {
          title: 'VANIR TELECOM — GLOBAL 5G ROAMING eSIM CERTIFICATE',
          subtitle: 'INSTANT LPA PROFILE PROVISIONING & RECEIPT',
          color: '#064E3B',
          codeLabel: 'ICCID / ORDER REF',
        },
        airport: {
          title: 'VANIR ROYAL TARMAC — VIP MEET, ASSIST & LOUNGE VOUCHER',
          subtitle: 'FAST-TRACK IMMIGRATION & PRIVATE LOUNGE ACCESS',
          color: '#1E293B',
          codeLabel: 'AIRPORT VIP VOUCHER',
        },
        tour: {
          title: 'VANIR BESPOKE JOURNEYS — ROYAL TOUR & CONCIERGE VOUCHER',
          subtitle: 'CONFIRMED PRIVATE GUIDE, CHAUFFEUR & HOSPITALITY PASS',
          color: '#312E81',
          codeLabel: 'CONCIERGE VOUCHER',
        },
      };
      const div = divisionMap[docType] || divisionMap.tour;
      const itemTitle = data.vehicleOrVesselName || data.packageName || data.hotelName || 'VIP Bespoke Service';

      return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=840, initial-scale=0.45"/><style>${sharedStyles}</style></head><body>
      <div class="wrap"><div class="page">
        <div>
          <div style="height:8px;background:linear-gradient(90deg,${div.color},#D4AF37);margin:-34px -42px 22px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid ${div.color};padding-bottom:16px;margin-bottom:18px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <img src="${VANIR_SEAL_DATA_URI}" alt="Vanir" style="width:54px;height:54px;border-radius:27px;border:1.5px solid #D4AF37;" />
              ${resolveOperatorBrandLogoHtml(docType, data.vehicleOrVesselName)}
              <div>
                <div style="font-size:15px;font-weight:900;color:${div.color};letter-spacing:0.6px;">${escapeHtml(div.title)}</div>
                <div style="font-size:9px;font-weight:800;color:#8C6D2F;letter-spacing:1.2px;margin-top:3px;">${escapeHtml(div.subtitle)}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:8.5px;font-weight:800;color:#64748B;">${escapeHtml(div.codeLabel)}</div>
              <div class="mono" style="font-size:15px;color:${div.color};margin-top:2px;">${escapeHtml(refCode)}</div>
              <div style="margin-top:4px;"><span class="badge-ok">CONFIRMED &amp; ISSUED</span></div>
            </div>
          </div>

          <div class="sec-bar" style="background:${div.color};">
            <span>1. PRINCIPAL VIP PASSENGER / CLIENT RECORD</span>
            <span>ISSUED: ${escapeHtml(issueDate)}</span>
          </div>
          <table class="tbl">
            <thead><tr><th>PRINCIPAL CLIENT NAME</th><th>PASSPORT / ID</th><th>CONTACT</th><th>PASSENGERS / GUESTS</th></tr></thead>
            <tbody>
              <tr>
                <td class="mono" style="font-size:12px;">${escapeHtml(clientNameUpper)}</td>
                <td class="mono">${escapeHtml(passportNo)}</td>
                <td>${escapeHtml(data.phone || data.email || 'VIP Concierge Registered')}</td>
                <td class="mono">${data.guestsCount || data.passengersCount || 2} PAX</td>
              </tr>
            </tbody>
          </table>

          <div class="sec-bar" style="background:#0F172A;">
            <span>2. RESERVED ASSET &amp; OPERATIONAL SCHEDULE</span>
            <span>PRIORITY DISPATCH</span>
          </div>
          <table class="tbl">
            <tbody>
              <tr><th style="width:32%;">RESERVED SERVICE / ASSET</th><td style="font-size:12.5px;font-weight:900;">${escapeHtml(itemTitle)}</td></tr>
              <tr><th>SCHEDULED DATE(S)</th><td class="mono">${escapeHtml(data.checkInDate || data.flightDepartureDate || issueDate)}${data.checkOutDate ? ` → ${escapeHtml(data.checkOutDate)}` : ''}</td></tr>
              ${data.pickupLocation ? `<tr><th>DEPARTURE / PICKUP POINT</th><td>${escapeHtml(data.pickupLocation)}</td></tr>` : ''}
              ${data.dropoffLocation || data.destinationCity ? `<tr><th>DESTINATION / DROP-OFF</th><td>${escapeHtml(data.dropoffLocation || data.destinationCity || '')}</td></tr>` : ''}
              ${data.serviceTime ? `<tr><th>REPORTING / PICKUP TIME</th><td class="mono">${escapeHtml(data.serviceTime)}</td></tr>` : ''}
              ${data.durationLabel ? `<tr><th>CHARTER / HIRE DURATION</th><td>${escapeHtml(data.durationLabel)}</td></tr>` : ''}
              ${data.aircraftRange ? `<tr><th>OPERATIONAL SPECS</th><td>Range: ${escapeHtml(data.aircraftRange)} ${data.aircraftSpeed ? `• Speed: ${escapeHtml(data.aircraftSpeed)}` : ''}</td></tr>` : ''}
              ${data.esimDataPlan ? `<tr><th>5G DATA PROVISIONING</th><td><strong>${escapeHtml(data.esimDataPlan)}</strong> • Instant QR / LPA Activation Enabled</td></tr>` : ''}
              ${data.specialRequests ? `<tr><th>VIP PROTOCOL &amp; CATERING NOTES</th><td>${escapeHtml(data.specialRequests)}</td></tr>` : ''}
            </tbody>
          </table>

          <div class="sec-bar" style="background:${div.color};">
            <span>3. OFFICIAL FINANCIAL RECEIPT</span>
            <span>PAID IN FULL</span>
          </div>
          <table class="tbl">
            <tbody>
              <tr>
                <td style="width:65%;">Total Contracted Charter / Service Fee (All Taxes &amp; VIP Handling Included)</td>
                <td class="mono" style="text-align:right;font-size:13px;color:${div.color};">USD ${paidAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Payment Settlement &amp; Authorization</td>
                <td class="mono" style="text-align:right;">${escapeHtml(paymentLabel)}</td>
              </tr>
            </tbody>
          </table>

          <div style="display:grid;grid-template-columns:1.05fr 1.2fr;gap:14px;margin-top:10px;">
            <div style="border:1px solid #CBD5E1;border-radius:4px;padding:10px 12px;background:#FAF9F6;font-size:9px;color:#334155;line-height:1.45;">
              <strong>24/7 ROYAL OPERATIONS DESK:</strong> Dedicated Flight / Marina / Fleet Dispatchers monitor your booking live. Present this stamped voucher upon arrival.
              <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
                <img src="${IATA_LOGO_DATA_URI}" alt="IATA" style="height:20px;object-fit:contain;" />
                <img src="${DRV_LOGO_DATA_URI}" alt="DRV" style="height:20px;object-fit:contain;" />
              </div>
            </div>
            <div style="border:1px solid #CBD5E1;border-radius:4px;padding:8px 10px;background:#FFFFFF;">
              ${buildAuthenticDocumentStampHtml({
                variant: docType,
                issuerName: itemTitle,
                dateStr: issueDate,
                refCode,
              })}
            </div>
          </div>
        </div>

        <div class="footer-verify">
          <div>${barcodeSvg}<div style="font-size:8px;color:#64748B;margin-top:2px;">Official Reference: ${escapeHtml(refCode)} • vanirgroup.com</div></div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="text-align:right;font-size:8.5px;color:#334155;"><strong>LIVE VOUCHER VERIFICATION</strong><br/><span class="mono">vanirgroup.com/verify/doc</span></div>
            <div style="padding:3px;border:1px solid #CBD5E1;border-radius:4px;">${qrSvg}</div>
          </div>
        </div>
      </div></div></body></html>`;
    }

    // ── 6. CONSULAR TRAVEL ITINERARY OR COMPLETE VISA PACKAGE DOSSIER ────
    const daysList =
      data.itineraryDays && data.itineraryDays.length > 0
        ? data.itineraryDays
        : [
            { dayNumber: 1, title: `Arrival in ${data.destinationCity || data.destinationCountry || 'Destination'} & Hotel Check-In`, activities: 'Immigration clearance, private transfer, hotel check-in & evening historic promenade.', hotelStay: data.hotelName || 'The Ritz-Carlton / 5-Star Confirmed Hotel' },
            { dayNumber: 2, title: 'Cultural Landmarks & National Museums', activities: 'Guided visit to iconic architectural landmarks, museum quarter & diplomatic district.', hotelStay: data.hotelName || 'The Ritz-Carlton / 5-Star Confirmed Hotel' },
            { dayNumber: 3, title: 'Old Town Heritage & Panoramic Excursion', activities: 'Morning scenic excursion, culinary avenue & curated cultural tour.', hotelStay: data.hotelName || 'The Ritz-Carlton / 5-Star Confirmed Hotel' },
            { dayNumber: 4, title: 'Regional Day Trip & Leisure', activities: 'Day excursion to surrounding scenic region, shopping boulevard & preparation for return.', hotelStay: data.hotelName || 'The Ritz-Carlton / 5-Star Confirmed Hotel' },
            { dayNumber: 5, title: 'Hotel Check-Out & International Return Flight', activities: 'Final hotel check-out, airport transfer 3 hours prior to scheduled return flight.', hotelStay: 'Outbound Return Flight Confirmed' },
          ];

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=840, initial-scale=0.45"/><style>${sharedStyles}</style></head><body>
    <div class="wrap"><div class="page">
      <div>
        <div style="height:7px;background:linear-gradient(90deg,#1C1917,#D4AF37);margin:-34px -42px 22px;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1C1917;padding-bottom:14px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${VANIR_SEAL_DATA_URI}" alt="Vanir" style="width:50px;height:50px;border-radius:25px;border:1px solid #D4AF37;" />
            <div>
              <div style="font-size:16px;font-weight:900;color:#1C1917;">${docType === 'itinerary' ? 'CONSULAR DAY-BY-DAY TRAVEL ITINERARY' : 'COMPLETE EMBASSY VISA DOSSIER CERTIFICATE'}</div>
              <div style="font-size:9px;font-weight:700;color:#8C6D2F;letter-spacing:1px;">IATA &amp; DRV ACCREDITED DIPLOMATIC DOCUMENTATION DESK</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div class="mono" style="font-size:14px;color:#1C1917;">REF: ${escapeHtml(refCode)}</div>
            <div style="font-size:9px;color:#64748B;">Issued: ${escapeHtml(issueDate)}</div>
          </div>
        </div>

        <table class="tbl">
          <thead><tr><th>APPLICANT FULL NAME</th><th>PASSPORT NO.</th><th>DESTINATION</th><th>TRAVEL WINDOW</th></tr></thead>
          <tbody>
            <tr>
              <td class="mono">${escapeHtml(clientNameUpper)}</td>
              <td class="mono">${escapeHtml(passportNo)}</td>
              <td>${escapeHtml((data.destinationCity || data.destinationCountry || 'Schengen / International').toUpperCase())}</td>
              <td class="mono">${escapeHtml(data.checkInDate || data.flightDepartureDate || issueDate)}${data.checkOutDate ? ` → ${escapeHtml(data.checkOutDate)}` : ''}</td>
            </tr>
          </tbody>
        </table>

        ${
          docType === 'package'
            ? `<div class="sec-bar"><span>INCLUDED EMBASSY DOSSIER DOCUMENTS (${escapeHtml(data.packageName || 'VIP Visa File')})</span><span>VERIFIED</span></div>
               <table class="tbl">
                 <tbody>
                   <tr><td><strong>1. Confirmed GDS Flight Itinerary</strong> (${escapeHtml(airlineBrand.name)})</td><td><span class="badge-ok">ISSUED</span></td></tr>
                   <tr><td><strong>2. Confirmed Hotel Accommodation Voucher</strong> (${escapeHtml(data.hotelName || hotelBrand.brandName)})</td><td><span class="badge-ok">ISSUED</span></td></tr>
                   <tr><td><strong>3. Schengen / Global Medical Insurance (€30,000+ / Zero Deductible)</strong></td><td><span class="badge-ok">ISSUED</span></td></tr>
                   <tr><td><strong>4. Day-by-Day Consular Travel Plan &amp; Cover Letter</strong></td><td><span class="badge-ok">ISSUED</span></td></tr>
                   ${paidAmount > 0 ? `<tr><td><strong>Total Dossier Settlement Paid</strong></td><td class="mono">USD ${paidAmount.toFixed(2)} (${escapeHtml(paymentLabel)})</td></tr>` : ''}
                 </tbody>
               </table>`
            : ''
        }

        <div class="sec-bar"><span>DETAILED DAY-BY-DAY CONSULAR SCHEDULE</span><span>ACCOMMODATION &amp; ACTIVITIES</span></div>
        <table class="tbl">
          <thead><tr><th style="width:10%;">DAY</th><th style="width:28%;">TITLE</th><th style="width:38%;">PLANNED ACTIVITIES</th><th style="width:24%;">CONFIRMED STAY</th></tr></thead>
          <tbody>
            ${daysList
              .slice(0, 6)
              .map(
                d => `<tr>
                  <td class="mono">DAY 0${d.dayNumber}</td>
                  <td><strong>${escapeHtml(d.title)}</strong></td>
                  <td>${escapeHtml(d.activities)}</td>
                  <td>${escapeHtml(d.hotelStay)}</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>

        <div style="border:1px solid #CBD5E1;border-radius:4px;padding:8px 12px;margin-top:8px;background:#FAF9F6;">
          ${buildAuthenticDocumentStampHtml({
            variant: docType,
            issuerName: 'VANIR DIPLOMATIC DESK',
            dateStr: issueDate,
            refCode,
          })}
        </div>
      </div>

      <div class="footer-verify">
        <div>${barcodeSvg}<div style="font-size:8px;color:#64748B;margin-top:2px;">Consular File Reference: ${escapeHtml(refCode)}</div></div>
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${IATA_LOGO_DATA_URI}" alt="IATA" style="height:22px;" />
          <div style="padding:3px;border:1px solid #CBD5E1;border-radius:4px;">${qrSvg}</div>
        </div>
      </div>
    </div></div></body></html>`;
  }, [
    airlineBrand,
    barcodeSvg,
    data,
    docType,
    hotelBrand,
    insuranceBrand,
    issueDate,
    qrSvg,
    refCode,
  ]);

  const handlePrintPdf = async () => {
    await printOrSavePdfDocument({
      html: htmlContent,
      jobName: `Vanir_${docType.toUpperCase()}_${refCode}`,
      webViewRef,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${headerMeta.badge} — ${headerMeta.title}`,
        message:
          `📄 OFFICIAL DOCUMENT ISSUED\n` +
          `Issuer: ${headerMeta.badge}\n` +
          `Document: ${headerMeta.title}\n` +
          `Client: ${data.clientName}\n` +
          `Reference: ${refCode}\n` +
          `Verify Online: ${qrVerifyUrl}`,
      });
    } catch {
      // Cancelled
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
              <Text style={styles.badgeText} numberOfLines={1}>
                {headerMeta.badge}
              </Text>
            </View>
            <Text style={styles.mainTitle} numberOfLines={1}>
              {headerMeta.title}
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
