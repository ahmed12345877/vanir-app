/**
 * URL Sanitizer & Asset Authenticity Validator
 * Guarantees that no generic placeholder, stock template, or Unsplash URLs
 * bypass the client presentation layer or corrupt cached luxury asset stores.
 */

export function isUnsplashOrGeneric(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return true;
  const lower = url.trim().toLowerCase();
  if (lower.length === 0) return true;
  if (lower.includes('unsplash.com')) return true;
  if (lower.includes('placeholder')) return true;
  if (lower.includes('via.placeholder')) return true;
  if (lower.includes('example.com')) return true;
  return false;
}

export function sanitizePhotoList(urls: any[] = []): string[] {
  if (!Array.isArray(urls)) return [];
  const valid: string[] = [];
  const seen = new Set<string>();
  for (const item of urls) {
    const u = typeof item === 'string' ? item.trim() : item?.url ? String(item.url).trim() : '';
    if (u && !isUnsplashOrGeneric(u) && !seen.has(u)) {
      seen.add(u);
      valid.push(u);
    }
  }
  return valid;
}
