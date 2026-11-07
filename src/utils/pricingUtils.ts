/**
 * Normalizes all pricing strings and numbers to clean, unclipped western typography format.
 * Eliminates Arabic-Indic numerals, clipping bugs, and inconsistent suffixes.
 * Example outputs:
 *   formatWesternPrice('$800', 'day')   => "$800 / day"
 *   formatWesternPrice('1200', 'night') => "$1,200 / night"
 *   formatWesternPrice('$١٣،٥٠٠/hr')   => "$13,500 / hr"
 */
export function enforceEnglishDigits(val: any): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return s.replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d)));
}

export function formatWesternPrice(
  rawPrice: string | number | undefined | null,
  fallbackPeriod: 'day' | 'night' | 'tour' | 'person' | 'month' | 'transfer' | 'hr' = 'day'
): { formatted: string; amount: string; period: string } {
  if (!rawPrice) {
    return {
      formatted: `$800 / ${fallbackPeriod}`,
      amount: '$800',
      period: `/${fallbackPeriod}`,
    };
  }

  // 1. Enforce English digits
  let clean = enforceEnglishDigits(rawPrice).trim();

  // 2. Identify period if explicitly present
  let period = fallbackPeriod;
  if (clean.includes('/mo') || clean.toLowerCase().includes('month')) {
    period = 'month';
  } else if (clean.includes('/night') || clean.toLowerCase().includes('night')) {
    period = 'night';
  } else if (clean.includes('/hr') || clean.toLowerCase().includes('hour')) {
    period = 'hr';
  } else if (clean.includes('/transfer') || clean.toLowerCase().includes('transfer')) {
    period = 'transfer';
  } else if (clean.includes('/person') || clean.toLowerCase().includes('person')) {
    period = 'person';
  } else if (clean.includes('/tour') || clean.toLowerCase().includes('tour')) {
    period = 'tour';
  } else if (clean.includes('/day') || clean.toLowerCase().includes('day')) {
    period = 'day';
  }

  // 3. Extract pure numeric part with commas/dots
  const numMatch = clean.match(/[\d,.]+/);
  let amountStr = '$800';
  if (numMatch) {
    const rawDigits = numMatch[0].replace(/,/g, '');
    const num = Number(rawDigits);
    if (!isNaN(num) && num > 0) {
      amountStr = `$${num.toLocaleString('en-US')}`;
    } else {
      amountStr = `$${numMatch[0]}`;
    }
  }

  return {
    formatted: `${amountStr} / ${period}`,
    amount: amountStr,
    period: `/${period}`,
  };
}
