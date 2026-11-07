import { NextResponse } from 'next/server';


export interface SeatMapRequest {
  flightId: string;
  flightNumber: string;
  aircraft?: string;
  cabinClass?: string;
  originCode?: string;
  destinationCode?: string;
}

export interface LiveSeatDetail {
  id: string; // e.g. "1A", "2E"
  row: number;
  col: string;
  status: 'available' | 'occupied' | 'blocked';
  type: 'suite' | 'lie_flat' | 'window' | 'aisle';
  features: string[];
  priceSupplement: number;
}

export async function POST(request: Request) {
  try {
    const body: SeatMapRequest = await request.json();
    const { flightId, flightNumber, aircraft = 'Airbus A380-800 Flagship', cabinClass = 'First Class Suite' } = body;

    const isPrivateJet = aircraft.toLowerCase().includes('gulfstream') || aircraft.toLowerCase().includes('jet');
    const isA380 = aircraft.toLowerCase().includes('380');
    const isQsuite = flightNumber.toUpperCase().includes('QR') || aircraft.toLowerCase().includes('777');

    let deckName = isA380 ? 'Upper Deck - First Class Suites & Shower Spa' : isPrivateJet ? 'Private Sovereign Executive Cabin' : 'Main Cabin Suite Deck';
    let layout = isPrivateJet ? '1-1 VIP Club' : '1-2-1 Direct Aisle Access';

    // Build dynamic rows tailored to the exact flagship aircraft model
    const rows: { rowNumber: number; seats: LiveSeatDetail[] }[] = [];

    if (isPrivateJet) {
      // Gulfstream G650ER luxury configuration (4 VIP club seats + Master Stateroom bed)
      const seatDefs = [
        { col: 'A', type: 'window' as const, features: ['Handcrafted Italian Leather', 'Panoramic Oval Window', 'Satellite Phone'] },
        { col: 'F', type: 'window' as const, features: ['Conference Table Executive Seat', 'Direct Video Link', 'Champagne Chiller'] },
      ];

      for (let r = 1; r <= 4; r++) {
        rows.push({
          rowNumber: r,
          seats: seatDefs.map((def, idx) => ({
            id: `${r}${def.col}`,
            row: r,
            col: def.col,
            status: r === 2 && idx === 1 ? 'occupied' : 'available',
            type: def.type,
            features: def.features,
            priceSupplement: 0,
          })),
        });
      }
    } else if (isA380) {
      // Emirates A380-800 First Class Suites (Rows 1 to 4: 1-2-1 layout with Private Sliding Doors)
      const cols = ['A', 'E', 'F', 'K'];
      for (let r = 1; r <= 4; r++) {
        rows.push({
          rowNumber: r,
          seats: cols.map(c => {
            const isWindow = c === 'A' || c === 'K';
            const isOccupied = (r === 1 && c === 'K') || (r === 3 && c === 'E');
            return {
              id: `${r}${c}`,
              row: r,
              col: c,
              status: isOccupied ? 'occupied' : 'available',
              type: 'suite' as const,
              features: [
                'Motorized Sliding Privacy Door',
                'Fully Flat 180° Bed with Mattress & Duvet',
                isWindow ? 'Triple Panoramic Windows with Electric Blinds' : 'Honeymoon Divider Screen',
                'Personal Ambient Lighting & Minibar',
                'Direct Access to Upper Deck Shower Spa',
              ],
              priceSupplement: isWindow ? 200 : 0,
            };
          }),
        });
      }
    } else {
      // Boeing 777-300ER / A350 Qsuite & First suites (Rows 1 to 6)
      const cols = ['A', 'B', 'J', 'K'];
      for (let r = 1; r <= 6; r++) {
        rows.push({
          rowNumber: r,
          seats: cols.map(c => {
            const isOccupied = (r === 2 && c === 'B') || (r === 4 && c === 'K') || (r === 5 && c === 'A');
            return {
              id: `${r}${c}`,
              row: r,
              col: c,
              status: isOccupied ? 'occupied' : 'available',
              type: 'lie_flat' as const,
              features: [
                'Full Privacy Suite Sliding Door',
                '180° Flat Lie-Flat Bed',
                c === 'A' || c === 'K' ? 'Window View' : 'Quad-Suite Configurable Centre',
                'Diptyque Skincare Amenity Pack',
              ],
              priceSupplement: 0,
            };
          }),
        });
      }
    }

    const allSeats = rows.flatMap(r => r.seats);
    const availableSeatsCount = allSeats.filter(s => s.status === 'available').length;
    const occupiedSeatsCount = allSeats.filter(s => s.status === 'occupied').length;

    return NextResponse.json(
      {
        success: true,
        seatMapId: `smap_${flightNumber.replace(/\s+/g, '')}_${Date.now()}`,
        flightId,
        flightNumber,
        aircraft,
        cabinClass,
        deckName,
        layout,
        totalSeats: allSeats.length,
        availableSeats: availableSeatsCount,
        occupiedSeats: occupiedSeatsCount,
        updatedAt: new Date().toISOString(),
        rows,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Live Seat Map Fetch Failed',
        code: 'seatmap_gateway_error',
      },
      { status: 500 }
    );
  }
}
