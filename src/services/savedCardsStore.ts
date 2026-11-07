import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const SAVED_CARDS_STORAGE_KEY = '@vanir_saved_cards_v2';
export const LOCAL_BOOKINGS_STORAGE_KEY = '@vanir_user_bookings_v1';

export type CardBrand =
  | 'Visa'
  | 'Mastercard'
  | 'American Express'
  | 'Mada'
  | 'Discover'
  | 'Card';

export interface SavedCardItem {
  id: string;
  brand: CardBrand;
  last4: string;
  expiry: string;
  holderName: string;
  isDefault: boolean;
  gradient: [string, string];
  createdAt: string;
}

export const PROMO_CATALOG: Record<
  string,
  { type: 'percent' | 'fixed'; value: number; label: string }
> = {
  VIP2026: { type: 'percent', value: 15, label: '15% Royal VIP Privilege' },
  ROYAL10: { type: 'percent', value: 10, label: '10% Concierge Privilege' },
  VANIR20: { type: 'percent', value: 20, label: '20% Executive Member Discount' },
  WELCOME50: { type: 'fixed', value: 50, label: '$50 First Booking Privilege' },
};

export function evaluatePromoCode(
  rawCode: string,
  subtotal: number,
): {
  valid: boolean;
  code: string;
  label: string;
  discount: number;
  finalAmount: number;
} {
  const code = (rawCode || '').trim().toUpperCase();
  const entry = PROMO_CATALOG[code];
  if (!entry || subtotal <= 0) {
    return {
      valid: false,
      code,
      label: '',
      discount: 0,
      finalAmount: Math.max(0, subtotal),
    };
  }
  const discount =
    entry.type === 'percent'
      ? Math.round(subtotal * (entry.value / 100) * 100) / 100
      : Math.min(Math.round(subtotal * 0.5 * 100) / 100, entry.value);
  return {
    valid: true,
    code,
    label: entry.label,
    discount,
    finalAmount: Math.max(1, Math.round((subtotal - discount) * 100) / 100),
  };
}

export function detectCardBrand(input: string): CardBrand {
  const digits = (input || '').replace(/\D/g, '');
  if (/^(446404|440795|440647|429948|457865|588845|529415)/.test(digits)) {
    return 'Mada';
  }
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) {
    return 'Mastercard';
  }
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return 'Card';
}

export function formatCardNumberInput(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '').slice(0, 19);
  if (/^3[47]/.test(digits)) {
    // Amex 4-6-5 grouping
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiryInput(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

export function getGradientForBrand(brand: CardBrand): [string, string] {
  switch (brand) {
    case 'Visa':
      return ['#1C1917', '#1E3A8A'];
    case 'Mastercard':
      return ['#18181B', '#3F2B1D'];
    case 'American Express':
      return ['#1C1917', '#0E7490'];
    case 'Mada':
      return ['#064E3B', '#1C1917'];
    default:
      return ['#111827', '#1E293B'];
  }
}

const DEFAULT_SEED_CARDS: SavedCardItem[] = [];

export async function getSavedCards(): Promise<SavedCardItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_CARDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage read error
  }
  return DEFAULT_SEED_CARDS;
}

export async function saveNewMaskedCard(input: {
  cardNumber: string;
  expiry: string;
  holderName: string;
  makeDefault?: boolean;
}): Promise<SavedCardItem> {
  const digits = input.cardNumber.replace(/\D/g, '');
  const brand = detectCardBrand(digits);
  const last4 = digits.slice(-4);
  const existing = await getSavedCards();

  // Deduplicate by brand + last4 + expiry
  const duplicate = existing.find(
    c => c.brand === brand && c.last4 === last4 && c.expiry === input.expiry.trim(),
  );
  if (duplicate) {
    return duplicate;
  }

  const shouldDefault = Boolean(input.makeDefault) || existing.length === 0;
  const newCard: SavedCardItem = {
    id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    brand: brand === 'Card' ? 'Visa' : brand,
    last4,
    expiry: input.expiry.trim(),
    holderName: input.holderName.trim().toUpperCase(),
    isDefault: shouldDefault,
    gradient: getGradientForBrand(brand),
    createdAt: new Date().toISOString(),
  };

  const next = [
    newCard,
    ...existing.map(c => (shouldDefault ? { ...c, isDefault: false } : c)),
  ];
  await AsyncStorage.setItem(SAVED_CARDS_STORAGE_KEY, JSON.stringify(next));

  // Sync non-sensitive masked token metadata to Firestore user profile if authenticated
  try {
    const uid = auth().currentUser?.uid;
    if (uid) {
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('payment_methods')
        .doc(newCard.id)
        .set({
          brand: newCard.brand,
          last4: newCard.last4,
          expiry: newCard.expiry,
          holderName: newCard.holderName,
          isDefault: newCard.isDefault,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    }
  } catch {
    // Non-blocking sync
  }

  return newCard;
}

export async function setDefaultSavedCard(cardId: string): Promise<SavedCardItem[]> {
  const existing = await getSavedCards();
  const next = existing.map(c => ({ ...c, isDefault: c.id === cardId }));
  await AsyncStorage.setItem(SAVED_CARDS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function deleteSavedCard(cardId: string): Promise<SavedCardItem[]> {
  const existing = await getSavedCards();
  const filtered = existing.filter(c => c.id !== cardId);
  if (filtered.length > 0 && !filtered.some(c => c.isDefault)) {
    filtered[0] = { ...filtered[0], isDefault: true };
  }
  await AsyncStorage.setItem(SAVED_CARDS_STORAGE_KEY, JSON.stringify(filtered));
  try {
    const uid = auth().currentUser?.uid;
    if (uid) {
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('payment_methods')
        .doc(cardId)
        .delete();
    }
  } catch {
    // Ignore
  }
  return filtered;
}
