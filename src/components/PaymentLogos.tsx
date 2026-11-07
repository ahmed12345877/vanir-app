import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Svg, { Path, Rect, Circle, G, Text as SvgText } from 'react-native-svg';
import { Check } from 'lucide-react-native';

export interface PaymentLogoProps {
  width?: number;
  height?: number;
}

/**
 * Streamline Official VISA Vector Logo
 * Extracted directly from streamline-svg-logos--24x24-SVG/Visaelectron--Streamline-Svg-Logos.svg
 */
export function VisaLogo({ width = 64, height = 22 }: PaymentLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 6.2 24 8.5" fill="none">
      {/* Streamline Official VISA Wordmark */}
      <Path
        fill="#1A1F71"
        d="M9.172325 6.903525 6.09575 14.24345h-2.00735L2.57425 8.38555c-0.0916775 -0.359975 -0.171505 -0.49245 -0.450895 -0.6446 -0.4565975 -0.248025 -1.21059 -0.48 -1.873355 -0.62435l0.044715 -0.213075H3.5263c0.4113 0 0.7816 0.27385 0.8757 0.748l0.80005 4.247725 1.9751 -4.995725h1.995175Zm2.71365 0 -1.570125 7.339925h-1.899l1.5701 -7.339925h1.899025Zm5.15115 4.9435c0.00795 -1.936825 -2.67805 -2.044275 -2.6605 -2.90975 0.00645 -0.263025 0.257025 -0.543175 0.8056 -0.61475 0.27175 -0.0351 1.022425 -0.06315 1.87275 0.328625l0.332675 -1.557375c-0.4569 -0.1652 -1.0448 -0.32425 -1.776125 -0.32425 -1.877275 0 -3.19785 0.997075 -3.20835 2.426 -0.0123 1.056925 0.9432 1.646025 1.6618 1.998025 0.740175 0.359525 0.98835 0.5906 0.9849 0.91185 -0.00525 0.492475 -0.591025 0.710475 -1.1357 0.7186 -0.955075 0.01515 -1.50875 -0.2581 -1.950325 -0.4638l-0.344675 1.60895c0.4443 0.203625 1.2631 0.380525 2.111175 0.389525 1.99565 0 3.300925 -0.98565 3.306775 -2.51165Zm4.95715 2.396425H23.75l-1.53395 -7.339925h-1.619925c-0.365375 0 -0.672375 0.212025 -0.8086 0.538075L16.9381 14.24345h1.99415l0.395525 -1.0964h2.436325l0.230175 1.0964Zm-2.119725 -2.6005 0.999925 -2.756375 0.574375 2.756375h-1.5743Z"
      />
      {/* Streamline Visa Gold Wing Accent */}
      <Path
        fill="#F7B600"
        d="M3.5263 6.903525c-0.4565975 -0.248025 -1.21059 -0.48 -1.873355 -0.62435l0.044715 -0.213075H3.5263c0.4113 0 0.7816 0.27385 0.8757 0.748l-0.8757 0.089Z"
      />
    </Svg>
  );
}

/**
 * Official Mastercard Interlocking Red & Orange/Yellow Circles
 */
export function MastercardLogo({ width = 48, height = 30 }: PaymentLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 50 32" fill="none">
      {/* Left Circle: Red */}
      <Circle cx="18" cy="16" r="14" fill="#EB001B" />
      {/* Right Circle: Yellow/Orange */}
      <Circle cx="32" cy="16" r="14" fill="#F79E1B" fillOpacity="0.95" />
      {/* Interlocking lens intersection: Orange */}
      <Path
        d="M25 5.5C28.2 8.3 30.2 11.9 30.2 16C30.2 20.1 28.2 23.7 25 26.5C21.8 23.7 19.8 20.1 19.8 16C19.8 11.9 21.8 8.3 25 5.5Z"
        fill="#FF5F00"
      />
    </Svg>
  );
}

/**
 * Streamline Official Maestro Vector Logo
 * Extracted directly from streamline-svg-logos--24x24-SVG/Maestro--Streamline-Svg-Logos.svg
 */
export function MaestroLogo({ width = 48, height = 30 }: PaymentLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 2 24 16" fill="none">
      {/* Center overlap */}
      <Path fill="#6C6BBD" d="M15.176925 15.853625H8.8225V4.43395h6.354425v11.419675Z" />
      {/* Left Red circle */}
      <Path
        fill="#D32011"
        d="M9.22615 10.144025c0 -2.316525 1.084625 -4.380025 2.77365 -5.709825 -1.23515 -0.9724 -2.793975 -1.552825 -4.488075 -1.552825C3.501075 2.881375 0.25 6.132925 0.25 10.144025s3.251075 7.26265 7.261725 7.26265c1.6941 0 3.252925 -0.5804 4.488075 -1.552825 -1.689025 -1.3298 -2.77365 -3.3933 -2.77365 -5.709825Z"
      />
      {/* Right Blue circle */}
      <Path
        fill="#0099DF"
        d="M23.750025 10.144025c0 4.0111 -3.2511 7.26265 -7.261725 7.26265 -1.694125 0 -3.25295 -0.5804 -4.48855 -1.552825 1.6895 -1.3298 2.774125 -3.3933 2.774125 -5.709825 0 -2.316525 -1.084625 -4.380025 -2.774125 -5.709825 1.2356 -0.9724 2.794425 -1.552825 4.48855 -1.552825 4.010625 0 7.261725 3.25155 7.261725 7.26265Z"
      />
    </Svg>
  );
}

/**
 * Combined VISA & Mastercard Official Badge
 * Displays both global payment icons side-by-side in high-contrast crisp card
 */
export function VisaMastercardLogo({ width = 120, height = 28 }: PaymentLogoProps) {
  return (
    <View style={paymentBadgeStyles.combinedBox}>
      <VisaLogo width={52} height={18} />
      <View style={paymentBadgeStyles.divider} />
      <MastercardLogo width={34} height={22} />
    </View>
  );
}

const paymentBadgeStyles = StyleSheet.create({
  combinedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 8,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
  },
});

/**
 * Official PayPal Vector
 * Double P badge (Navy #003087 & Cyan #0079C1) with "PayPal" typography
 */
export function PaypalLogo({ width = 84, height = 24 }: PaymentLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 28" fill="none">
      {/* Back P (Dark Navy) */}
      <Path
        d="M6 3.5H16.2C20.8 3.5 23.8 5.2 23.2 9.5C22.5 13.8 19 16.5 14.5 16.5H10.8L8.2 25.5H3L6 3.5Z"
        fill="#003087"
      />
      {/* Front P (Sky Blue) */}
      <Path
        d="M10.8 7.5H20.5C24.5 7.5 27.2 9.2 26.5 13C25.8 17 22.8 19.5 18.5 19.5H14.8L12.5 27.5H8L10.8 7.5Z"
        fill="#0079C1"
      />
      {/* Overlap shade */}
      <Path
        d="M14.8 16.5H17.2C20.2 16.5 22.8 15 23.2 12C23.5 10 22.5 8.5 20.5 8.5H15.5L14.8 16.5Z"
        fill="#002071"
        fillOpacity="0.4"
      />

      {/* "Pay" wordmark (Dark Navy) */}
      <G fill="#003087">
        <SvgText
          x="32"
          y="20"
          fontSize="18"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="System"
          fill="#003087"
        >
          Pay
        </SvgText>
      </G>

      {/* "Pal" wordmark (Sky Blue) */}
      <G fill="#0079C1">
        <SvgText
          x="65"
          y="20"
          fontSize="18"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="System"
          fill="#0079C1"
        >
          Pal
        </SvgText>
      </G>
    </Svg>
  );
}

/**
 * Streamline Official Google Pay Vector Logo
 * Extracted directly from streamline-svg-logos--24x24-SVG/Google-Pay--Streamline-Svg-Logos.svg
 */
export function GooglePayLogo({ width = 76, height = 26 }: PaymentLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 6.5 24 11" fill="none">
      {/* "Pay" Typography (Streamline Slate) */}
      <Path
        fill="#5F6368"
        d="M16.9078 9.8571c0.64605 0 1.145275 0.176175 1.527025 0.528575 0.38175 0.3524 0.55795 0.82225 0.55795 1.40955v2.819125h-0.82225v-0.64605h-0.02935c-0.3524 0.5286 -0.851625 0.792875 -1.438925 0.792875 -0.499225 0 -0.939725 -0.146825 -1.2921 -0.440475 -0.323025 -0.293675 -0.5286 -0.704775 -0.5286 -1.145275 0 -0.46985 0.1762 -0.8516 0.5286 -1.145275 0.352375 -0.29365 0.8516 -0.4111 1.438925 -0.4111 0.528575 0 0.9397 0.088075 1.262725 0.29365v-0.20555c0 -0.2741 -0.102325 -0.548175 -0.306975 -0.72675l-0.045425 -0.036775c-0.234925 -0.20555 -0.528575 -0.323025 -0.8516 -0.323025 -0.499225 0 -0.880975 0.205575 -1.145275 0.616675l-0.7635 -0.46985c0.46985 -0.616675 1.086525 -0.910325 1.908775 -0.910325Zm-4.140575 -1.996875c0.52695 0 1.0277 0.18335 1.42805 0.525325l0.0696 0.061975c0.411125 0.3524 0.616675 0.880975 0.616675 1.438925 0 0.55795 -0.20555 1.057175 -0.616675 1.438925 -0.411125 0.381775 -0.91035 0.587325 -1.49765 0.587325l-1.409575 -0.029375v2.731025h-0.880975V7.860225h2.29055ZM17.02525 12.323825c-0.352375 0 -0.646025 0.0881 -0.88095 0.264275 -0.23495 0.14685 -0.3524 0.3524 -0.3524 0.6167 0 0.234925 0.11745 0.440475 0.29365 0.55795 0.205575 0.146825 0.4405 0.234925 0.675425 0.234925 0.3289 0 0.6578 -0.1279 0.91505 -0.35985l0.054025 -0.051275c0.29365 -0.2643 0.440475 -0.587325 0.440475 -0.9397 -0.264275 -0.205575 -0.64605 -0.323025 -1.145275 -0.323025ZM12.82595 8.68245h-1.4683v2.349275h1.4683c0.323025 0 0.64605 -0.117475 0.8516 -0.3524 0.46985 -0.440475 0.46985 -1.174625 0.029375 -1.6151l-0.029375 -0.029375c-0.234925 -0.234925 -0.528575 -0.38175 -0.8516 -0.3524Zm10.924075 1.321475L20.842825 16.66995h-0.880975l1.086525 -2.3199 -1.908775 -4.316775h0.9397l1.3802 3.31835h0.029375l1.350825 -3.31835h0.910325v-0.02935Z"
      />
      {/* Streamline Google Blue */}
      <Path
        fill="#4285F4"
        d="M7.86325 11.296025c0 -0.2643 -0.029375 -0.5286 -0.058725 -0.7929H4.1338v1.497675h2.084975c-0.0881 0.46985 -0.3524 0.910325 -0.763525 1.174625v0.969075h1.262725c0.73415 -0.675425 1.145275 -1.67385 1.145275 -2.848475Z"
      />
      {/* Streamline Google Green */}
      <Path
        fill="#34A853"
        d="M4.13375 15.0842c1.057175 0 1.93815 -0.352375 2.5842 -0.9397l-1.26275 -0.969075c-0.352375 0.234925 -0.792875 0.38175 -1.32145 0.38175 -0.99845 0 -1.8794175 -0.6754 -2.173075 -1.615125H0.66858v0.99845c0.6754125 1.32145 1.99687 2.1437 3.46517 2.1437Z"
      />
      {/* Streamline Google Yellow */}
      <Path
        fill="#FBBC04"
        d="M1.96056 11.94205c-0.176195 -0.46985 -0.176195 -0.998425 0 -1.49765v-0.99845H0.6684625c-0.55795025 1.08655 -0.55795025 2.37865 0 3.49455l1.2920975 -0.99845Z"
      />
      {/* Streamline Google Red */}
      <Path
        fill="#EA4335"
        d="M4.133675 8.85865c0.55795 0 1.086525 0.20555 1.49765 0.587325l1.1159 -1.1159c-0.704775 -0.64605 -1.644475 -1.027825 -2.584175 -0.99845 -1.4683 0 -2.819125 0.82225 -3.465175 2.1437l1.2920975 0.99845c0.2642925 -0.9397 1.1452775 -1.615125 2.1437025 -1.615125Z"
      />
    </Svg>
  );
}

/**
 * Streamline Official Apple Pay Vector Logo
 * Extracted directly from streamline-svg-logos--24x24-SVG/Apple-Pay--Streamline-Svg-Logos.svg
 */
export function ApplePayLogo({ width = 74, height = 26 }: PaymentLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 6.5 24 11" fill="none">
      <Path
        fill="#000000"
        d="M4.5439 8.419525c-0.275425 0.325925 -0.7161 0.582975 -1.156775 0.54625 -0.0551 -0.440675 0.16065 -0.908875 0.413125 -1.198075 0.275425 -0.3351 0.757425 -0.5738 1.1476 -0.592175 0.0459 0.45905 -0.133125 0.9089 -0.40395 1.244Zm0.39935 0.633475c-0.63805 -0.036725 -1.1843 0.362625 -1.487275 0.362625 -0.30755 0 -0.771175 -0.344275 -1.2761225 -0.335075 -0.6564225 0.009175 -1.2669425 0.381 -1.6020375 0.97315 -0.68855625 1.184325 -0.179025 2.937825 0.4865775 3.9018 0.3259175 0.4774 0.7160975 1.000725 1.23022 0.98235 0.4865875 -0.01835 0.6793625 -0.316725 1.2669375 -0.316725 0.59215 0 0.762 0.316725 1.276125 0.30755 0.532475 -0.009175 0.867575 -0.4774 1.1935 -0.9548 0.371825 -0.541675 0.5233 -1.06955 0.532475 -1.0971 -0.009175 -0.009175 -1.028225 -0.39935 -1.037425 -1.5745 -0.009175 -0.982325 0.803325 -1.45055 0.84005 -1.4781 -0.45905 -0.679375 -1.17515 -0.752825 -1.423025 -0.771175Zm3.686075 -1.3312v7.156375h1.110875V12.4315h1.537775c1.40465 0 2.391575 -0.963975 2.391575 -2.35945 0 -1.39545 -0.968575 -2.35025 -2.35485 -2.35025H8.629325Zm1.110875 0.936425h1.2807c0.963975 0 1.514825 0.514125 1.514825 1.418425s-0.55085 1.423025 -1.5194 1.423025h-1.276125V8.658225ZM15.6985 14.93325c0.697725 0 1.344975 -0.35345 1.63875 -0.913475h0.02295v0.8584h1.02825V11.31605c0 -1.032825 -0.826275 -1.698425 -2.0978 -1.698425 -1.179725 0 -2.0519 0.674775 -2.084025 1.602025h1.0007c0.082625 -0.440675 0.491175 -0.729875 1.0512 -0.729875 0.679375 0 1.060375 0.31675 1.060375 0.899725v0.394775l-1.3863 0.082625c-1.2899 0.078025 -1.987625 0.605925 -1.987625 1.524 0 0.92725 0.720675 1.54235 1.753525 1.54235Zm0.298375 -0.8492c-0.592175 0 -0.968575 -0.2846 -0.968575 -0.7207 0 -0.44985 0.362625 -0.7115 1.055775 -0.752825l1.234825 -0.078025v0.40395c0 0.6702 -0.569225 1.1476 -1.322025 1.1476ZM19.760975 16.8245c1.083325 0 1.59285 -0.41315 2.038125 -1.6663L23.75 9.686475h-1.129225l-1.30825 4.227725h-0.022975l-1.30825 -4.227725h-1.16135l1.88205 5.210075 -0.101 0.316725c-0.169825 0.537075 -0.44525 0.74365 -0.936425 0.74365 -0.087225 0 -0.257075 -0.0092 -0.325925 -0.018375v0.8584c0.064275 0.01835 0.3397 0.02755 0.422325 0.02755Z"
      />
    </Svg>
  );
}

/**
 * Official American Express (AMEX) Blue Vector Badge
 */
export function AmexLogo({ width = 64, height = 24 }: PaymentLogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 80 32" fill="none">
      <Rect width="80" height="32" rx="6" fill="#006FCF" />
      <SvgText
        x="40"
        y="21"
        fontSize="14"
        fontWeight="900"
        fontFamily="System"
        fill="#FFFFFF"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        AMEX
      </SvgText>
    </Svg>
  );
}

/**
 * Reusable Official Payment Badge Card matching the user's reference image
 * (media_1791959877766_72c04f7c.jpg):
 * Clean white squircle container with crisp official logo and generous spacing.
 */
interface PaymentBadgeCardProps {
  id: string;
  title: string;
  logo: React.ReactNode;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  widthPercent?: `${number}%` | number;
}

export function PaymentBadgeCard({
  title,
  logo,
  subtitle,
  selected,
  onPress,
}: PaymentBadgeCardProps) {
  return (
    <Pressable
      style={[
        styles.card,
        selected ? styles.cardSelected : styles.cardDefault,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {/* Selected Indicator Pill / Check */}
      {selected && (
        <View style={styles.selectedBadge}>
          <Check color="#FFFFFF" size={12} strokeWidth={3} />
        </View>
      )}

      {/* Centered Brand Logo */}
      <View style={styles.logoContainer}>{logo}</View>

      {/* Clear, uncrowded label */}
      <Text style={[styles.title, selected && styles.titleSelected]} numberOfLines={1}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 82,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDefault: {
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 6,
    textAlign: 'center',
  },
  titleSelected: {
    color: '#D4AF37',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
});
