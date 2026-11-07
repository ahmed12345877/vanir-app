import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import { AirlineLogo } from './AirlineLogos';

export interface CompanyBrandBadgeProps {
  title?: string;
  category?: string;
  style?: ViewStyle;
  variant?: 'compact' | 'pill' | 'header';
}

export type BrandInfo = {
  brandName: string;
  subLabel: string;
  type: 'airline' | 'svg';
  iata?: string;
  renderIcon?: () => React.ReactNode;
};

export function resolveBrandInfo(title?: string, category?: string): BrandInfo {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();

  // 1. Flights / Airlines
  if (c.includes('flight') || t.includes('flight') || t.includes('emirates') || t.includes('qatar') || t.includes('boeing')) {
    if (t.includes('qatar')) {
      return {
        brandName: 'QATAR AIRWAYS',
        subLabel: 'Skytrax 5-Star Luxury Airline',
        type: 'airline',
        iata: 'QR',
      };
    }
    return {
      brandName: 'EMIRATES',
      subLabel: 'First Class & Private Jet Fleet',
      type: 'airline',
      iata: 'EK',
    };
  }

  // 2. Rolls-Royce & Luxury Fleet
  if (t.includes('rolls') || t.includes('phantom') || t.includes('ghost') || t.includes('cullinan')) {
    return {
      brandName: 'ROLLS-ROYCE',
      subLabel: 'Goodwood Luxury Motor Cars',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="2" width="20" height="20" rx="4" fill="#0C0A09" stroke="#D4AF37" strokeWidth="1.2" />
          {/* Double Interlocking R's */}
          <Path d="M7 6H12C13.5 6 14.5 6.8 14.5 8.2C14.5 9.5 13.5 10.2 12 10.2H7V6Z" stroke="#D4AF37" strokeWidth="1.1" fill="none" />
          <Path d="M7 6V18M7 10.5H12L15 18" stroke="#D4AF37" strokeWidth="1.1" strokeLinecap="round" />
          <Path d="M12 8H17C18.5 8 19.5 8.8 19.5 10.2C19.5 11.5 18.5 12.2 17 12.2H12V8Z" stroke="#F5D77F" strokeWidth="1.1" fill="none" />
          <Path d="M12 8V18M12 12.5H17L19.5 18" stroke="#F5D77F" strokeWidth="1.1" strokeLinecap="round" />
        </Svg>
      ),
    };
  }

  // 3. Mercedes-Maybach
  if (t.includes('maybach') || t.includes('mercedes') || t.includes('s-class')) {
    return {
      brandName: 'MAYBACH',
      subLabel: 'Mercedes-Benz Haute Horlogerie Fleet',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0C0A09" stroke="#D4AF37" strokeWidth="1.2" />
          {/* Double M */}
          <Path d="M6 16L10 8L12 12L14 8L18 16M9 16L12 10L15 16" stroke="#D4AF37" strokeWidth="1.1" strokeLinecap="round" />
        </Svg>
      ),
    };
  }

  // 4. Bombardier Aerospace
  if (t.includes('bombardier') || t.includes('global 7500') || (c.includes('jet') && !t.includes('gulfstream') && !t.includes('falcon'))) {
    return {
      brandName: 'BOMBARDIER',
      subLabel: 'Aerospace Flagship Fleet',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0C0A09" stroke="#D4AF37" strokeWidth="1.2" />
          {/* Supersonic Swept Wings */}
          <Path d="M3 13.5L12 6L21 13.5L16 14.5L12 9.5L8 14.5L3 13.5Z" fill="#D4AF37" />
          <Path d="M6 16.5L12 11.5L18 16.5L15 17.5L12 14.5L9 17.5L6 16.5Z" fill="#F5D77F" opacity={0.8} />
        </Svg>
      ),
    };
  }

  // 4.5. Dassault Falcon
  if (t.includes('falcon') || t.includes('dassault')) {
    return {
      brandName: 'DASSAULT AVIATION',
      subLabel: 'Falcon Flagship Executive Fleet',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0C0A09" stroke="#D4AF37" strokeWidth="1.2" />
          <Path d="M12 4L14.5 10L20.5 11.5L15 15L16 21L12 17L8 21L9 15L3.5 11.5L9.5 10L12 4Z" fill="#D4AF37" />
        </Svg>
      ),
    };
  }

  // 5. Gulfstream Aerospace
  if (t.includes('gulfstream') || t.includes('g650') || t.includes('g700')) {
    return {
      brandName: 'GULFSTREAM',
      subLabel: 'Aerospace Long-Range Fleet',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0C0A09" stroke="#D4AF37" strokeWidth="1.2" />
          <Path d="M4 14C8 10 16 10 20 14L12 8L4 14Z" fill="#D4AF37" />
          <Circle cx="12" cy="15" r="2" fill="#D4AF37" />
        </Svg>
      ),
    };
  }

  // 6. Majesty Superyachts (Gulf Craft)
  if (t.includes('majesty') || c.includes('yacht') || t.includes('yacht')) {
    return {
      brandName: 'MAJESTY',
      subLabel: 'Gulf Craft Superyacht Charter',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0C0A09" stroke="#D4AF37" strokeWidth="1.2" />
          {/* Crown & Trident */}
          <Path d="M7 14L9 9L12 12L15 9L17 14H7Z" fill="#D4AF37" />
          <Path d="M12 6V18M9 16C9 17.5 10.5 18.5 12 18.5C13.5 18.5 15 17.5 15 16" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
        </Svg>
      ),
    };
  }

  // 7. Jumeirah / Burj Al Arab
  if (t.includes('burj al arab') || t.includes('jumeirah')) {
    return {
      brandName: 'JUMEIRAH',
      subLabel: 'Iconic Hotels & Palace Resorts',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0C2340" stroke="#D4AF37" strokeWidth="1.2" />
          {/* Iconic Sail Crest */}
          <Path d="M10 5V19M10 6C16 8.5 17.5 14 10 18" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" />
          <Path d="M7 19H17" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
        </Svg>
      ),
    };
  }

  // 7.5. Marriott Luxury / Mena House
  if (t.includes('marriott') || t.includes('mena house') || t.includes('mena')) {
    return {
      brandName: 'MARRIOTT LUXURY',
      subLabel: 'The Luxury Collection Hotels',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="2" width="20" height="20" rx="4" fill="#0C0A09" stroke="#D4AF37" strokeWidth="1.2" />
          <Path d="M6 17V8L9.5 14L12 9.5L14.5 14L18 8V17" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
    };
  }

  // 7.8. Four Seasons
  if (t.includes('four seasons')) {
    return {
      brandName: 'FOUR SEASONS',
      subLabel: 'Hotels and Resorts',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0C0A09" stroke="#D4AF37" strokeWidth="1.2" />
          <Path d="M12 6V18M7 11C7 8 12 7 12 7C12 7 17 8 17 11M8 15C8 13 12 12 12 12C12 12 16 13 16 15" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
        </Svg>
      ),
    };
  }

  // 8. The Address Hotels & Residences
  if (t.includes('address') || c.includes('apartment') || t.includes('residence') || t.includes('penthouse')) {
    return {
      brandName: 'ADDRESS RESIDENCES',
      subLabel: 'Emaar Hospitality Group',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="2" width="20" height="20" rx="5" fill="#1C1917" stroke="#D4AF37" strokeWidth="1.2" />
          {/* Diamond Luxury Monogram */}
          <Path d="M12 4L19 12L12 20L5 12L12 4Z" stroke="#D4AF37" strokeWidth="1.1" fill="none" />
          <Path d="M12 8L15.5 12L12 16L8.5 12L12 8Z" fill="#D4AF37" />
        </Svg>
      ),
    };
  }

  // 9. The Ritz-Carlton
  if (t.includes('ritz')) {
    return {
      brandName: 'THE RITZ-CARLTON',
      subLabel: 'Marriott Luxury Collection',
      type: 'svg',
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#0D131A" stroke="#D4AF37" strokeWidth="1.2" />
          <Path d="M8 9L10 6L12 8L14 6L16 9H8Z" fill="#D4AF37" />
          <Path d="M8.5 10.5H15.5V11.5C15.5 14.5 13.5 17 12 18C10.5 17 8.5 14.5 8.5 11.5V10.5Z" stroke="#D4AF37" strokeWidth="1" fill="none" />
        </Svg>
      ),
    };
  }

  // Default Luxury Vanir Mark
  return {
    brandName: 'VANIR ROYAL',
    subLabel: 'Private Concierge Partner',
    type: 'svg',
    renderIcon: () => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#1C1917" stroke="#D4AF37" strokeWidth="1.2" />
        <Path d="M7 8L12 17L17 8" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  };
}

export function CompanyBrandBadge({
  title,
  category,
  style,
  variant = 'compact',
}: CompanyBrandBadgeProps) {
  const brand = resolveBrandInfo(title, category);

  return (
    <View style={[styles.badgeContainer, style]}>
      {brand.type === 'airline' ? (
        <View style={styles.airlineWrap}>
          <AirlineLogo airline={brand.brandName} iata={brand.iata} size={18} />
        </View>
      ) : (
        <View style={styles.iconWrap}>{brand.renderIcon ? brand.renderIcon() : null}</View>
      )}

      <View style={styles.textCol}>
        <Text style={styles.brandTitle} numberOfLines={1}>
          {brand.brandName}
        </Text>
        {variant !== 'compact' && (
          <Text style={styles.brandSub} numberOfLines={1}>
            {brand.subLabel}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 25, 23, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    alignSelf: 'flex-start',
  },
  airlineWrap: {
    width: 20,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#D4AF37',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  brandSub: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 8.5,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});
