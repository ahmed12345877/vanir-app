import {
  getTravelApiConfig,
  isRapidApiActive,
  isAmadeusActive,
} from '../config/travelApiConfig';
import { searchRapidApiHotels } from './rapidApiBookingService';
import { searchAmadeusHotels, searchAmadeusFlights } from './amadeusTravelService';
import {
  generateClientSideLiveHotels,
  calculateNights,
  type HotelSearchParams,
  type HotelSearchResponse,
  type LiveHotelProperty,
} from './hotelSearchApi';
import { searchLiveFlights, type LiveFlightOffer, type FlightSearchParams } from './flightSearchApi';

export interface EngineStatus {
  rapidApi: {
    configured: boolean;
    active: boolean;
    provider: string;
  };
  amadeus: {
    configured: boolean;
    active: boolean;
    environment: 'test' | 'production';
  };
  catalog: {
    active: boolean;
    totalHotels: number;
  };
}

/**
 * Returns current health and configuration status of the dual travel engine
 */
export async function getEngineStatus(): Promise<EngineStatus> {
  const config = await getTravelApiConfig();
  return {
    rapidApi: {
      configured: isRapidApiActive(),
      active: config.rapidApi.enabled && isRapidApiActive(),
      provider: 'Booking.com (RapidAPI)',
    },
    amadeus: {
      configured: isAmadeusActive(),
      active: config.amadeus.enabled && isAmadeusActive(),
      environment: config.amadeus.environment,
    },
    catalog: {
      active: true,
      totalHotels: 94,
    },
  };
}

/**
 * Smart Dual-Engine Hotel Search:
 * 1. Tries RapidAPI (Booking.com) first for full live global inventory and rich photos.
 * 2. If disabled/empty, tries Amadeus GDS Hotel API.
 * 3. Falls back seamlessly to the curated 94-hotel Luxury Catalog (Greece, Turkey, Europe, Gulf).
 */
export async function searchAggregatedHotels(
  params: HotelSearchParams,
): Promise<HotelSearchResponse> {
  const nights = calculateNights(params.checkInDate, params.checkOutDate);

  // 1. Check RapidAPI Booking.com
  if (isRapidApiActive()) {
    try {
      console.log(`[DualEngine] Querying RapidAPI (Booking.com) for: "${params.destination}"...`);
      const rapidHotels = await searchRapidApiHotels(params);
      if (rapidHotels && rapidHotels.length > 0) {
        return {
          success: true,
          provider: 'Booking.com Live API (via RapidAPI)',
          searchId: `rapid_search_${Date.now()}`,
          searchedAt: new Date().toISOString(),
          totalProperties: rapidHotels.length,
          checkInDate: params.checkInDate,
          checkOutDate: params.checkOutDate,
          nights,
          adults: params.adults,
          children: params.children,
          rooms: params.rooms,
          properties: rapidHotels,
        };
      }
    } catch (err) {
      console.warn('[DualEngine] RapidAPI hotel search failed, falling back to Amadeus/Catalog:', err);
    }
  }

  // 2. Check Amadeus GDS Hotel API
  if (isAmadeusActive()) {
    try {
      console.log(`[DualEngine] Querying Amadeus GDS for: "${params.destination}"...`);
      const amadeusHotels = await searchAmadeusHotels(params);
      if (amadeusHotels && amadeusHotels.length > 0) {
        return {
          success: true,
          provider: 'Amadeus Hospitality GDS Live',
          searchId: `amadeus_search_${Date.now()}`,
          searchedAt: new Date().toISOString(),
          totalProperties: amadeusHotels.length,
          checkInDate: params.checkInDate,
          checkOutDate: params.checkOutDate,
          nights,
          adults: params.adults,
          children: params.children,
          rooms: params.rooms,
          properties: amadeusHotels,
        };
      }
    } catch (err) {
      console.warn('[DualEngine] Amadeus hotel search failed, falling back to Catalog:', err);
    }
  }

  // 3. Fallback to Curated 94-hotel Luxury Catalog (100% Guaranteed uptime)
  console.log(`[DualEngine] Serving curated luxury catalog for: "${params.destination}"`);
  return generateClientSideLiveHotels(params, nights);
}

/**
 * Smart Dual-Engine Flight Search:
 * 1. Tries Amadeus Flight Offers Search v2 (GDS tickets & PNRs).
 * 2. Falls back to IATA BSP Flight Service.
 */
export async function searchAggregatedFlights(
  params: FlightSearchParams,
): Promise<LiveFlightOffer[]> {
  if (isAmadeusActive()) {
    try {
      console.log('[DualEngine] Querying Amadeus GDS for flights...');
      const amadeusFlights = await searchAmadeusFlights(params);
      if (amadeusFlights && amadeusFlights.length > 0) {
        return amadeusFlights;
      }
    } catch (err) {
      console.warn('[DualEngine] Amadeus flight search failed, falling back to IATA:', err);
    }
  }

  const res = await searchLiveFlights(params);
  return res.flights || [];
}
