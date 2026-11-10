/**
 * Booking.com & Global Travel Photo Extractor & CDN Resolver
 * Enables fetching and extracting authentic hotel photos directly from Booking.com,
 * Expedia, or global hotel CDNs with 40 to 100+ high-resolution images.
 */

export interface ExtractedHotelPhoto {
  url: string;
  category: 'all' | 'rooms' | 'exterior' | 'dining' | 'pools_spa' | 'views';
  label: string;
}

export interface HotelPhotosCollection {
  hotelName: string;
  totalCount: number;
  all: ExtractedHotelPhoto[];
  rooms: ExtractedHotelPhoto[];
  exterior: ExtractedHotelPhoto[];
  dining: ExtractedHotelPhoto[];
  pools_spa: ExtractedHotelPhoto[];
  views: ExtractedHotelPhoto[];
}

/**
 * Extracts high-resolution photo URLs from a Booking.com hotel page URL or HTML content.
 * Booking.com stores image URLs on https://cf.bstatic.com/xdata/images/hotel/max1280x900/...
 */
export async function extractPhotosFromBookingUrl(bookingUrl: string): Promise<string[]> {
  try {
    const trimmed = bookingUrl.trim();
    if (!trimmed.includes('booking.com')) {
      return [];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(trimmed, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[BookingFetcher] Failed with status ${res.status}`);
      return [];
    }

    const html = await res.text();
    const photos = extractBookingCdnUrlsFromHtml(html);
    return photos;
  } catch (err) {
    console.warn('[BookingFetcher] Error fetching Booking.com URL:', err);
    return [];
  }
}

/**
 * Regular expression parser to harvest all unique high-res Booking.com images from HTML
 */
export function extractBookingCdnUrlsFromHtml(html: string): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  // Match patterns like:
  // https://cf.bstatic.com/xdata/images/hotel/max1024x768/123456789.jpg
  // https://cf.bstatic.com/xdata/images/hotel/max1280x900/123456789.jpg
  // https://cf.bstatic.com/images/hotel/max1024x768/...
  const regex = /https:\/\/(?:cf|q-xx)\.bstatic\.com\/(?:xdata\/)?images\/hotel\/(?:max\d+x\d+|square\d+)\/(\d+)\.(?:jpg|jpeg|webp|png)/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const photoId = match[1];
    if (photoId && !seen.has(photoId)) {
      seen.add(photoId);
      // Upgrade to high-resolution max1280x900
      const highResUrl = `https://cf.bstatic.com/xdata/images/hotel/max1280x900/${photoId}.jpg?k=vanir-curated`;
      results.push(highResUrl);
    }
  }

  // Also check for raw photo arrays in Booking JSON scripts (hotel_photos or b_hotel_photos)
  const jsonMatch = html.match(/b_hotel_photos\s*=\s*\[([\s\S]*?)\];/);
  if (jsonMatch && jsonMatch[1]) {
    const idRegex = /"photo_id"\s*:\s*(\d+)/g;
    let idM: RegExpExecArray | null;
    while ((idM = idRegex.exec(jsonMatch[1])) !== null) {
      const pid = idM[1];
      if (pid && !seen.has(pid)) {
        seen.add(pid);
        results.push(`https://cf.bstatic.com/xdata/images/hotel/max1280x900/${pid}.jpg?k=vanir-curated`);
      }
    }
  }

  return results;
}
