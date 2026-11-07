import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  ShieldCheck,
  CreditCard,
  Fingerprint,
  Check,
  X,
} from 'lucide-react-native';
import {
  GooglePayLogo,
  PaypalLogo,
  ApplePayLogo,
} from './PaymentLogos';
import { formatEnglishNumber } from '../lib/formatters';
import { LuxuryPressable } from './LuxuryMicroInteractions';

interface WalletModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  amount: number;
  userEmail?: string;
  userName?: string;
  itemName?: string;
}

// 1. Google Pay Sheet Modal
export function GooglePayModal({
  visible,
  onClose,
  onConfirm,
  amount,
  userEmail = 'client@gmail.com',
  userName = 'VIP Client',
  itemName = 'VANIR Luxury Reservation',
}: WalletModalProps) {
  const [authorizing, setAuthorizing] = useState(false);

  const handlePay = async () => {
    setAuthorizing(true);
    try {
      await onConfirm();
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Sheet Handle */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.gpayHeaderLeft}>
              <GooglePayLogo width={64} height={24} />
              <View style={styles.liveVerifiedTag}>
                <Text style={styles.liveVerifiedTagText}>FAST CHECKOUT</Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <X color="#64748B" size={20} />
            </Pressable>
          </View>

          {/* Amount Display */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Total to Pay</Text>
            <Text style={styles.amountValue}>
              ${formatEnglishNumber(amount)}{' '}
              <Text style={styles.currencyCode}>USD</Text>
            </Text>
            <Text style={styles.itemSubtitle} numberOfLines={1}>
              {itemName}
            </Text>
          </View>

          {/* Google Account Selector Card */}
          <View style={styles.accountCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {(userName || userEmail || 'G')[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{userName}</Text>
              <Text style={styles.accountEmail}>{userEmail}</Text>
            </View>
            <Check color="#16A34A" size={16} strokeWidth={2.5} />
          </View>

          {/* Virtual Payment Method in GPay */}
          <View style={styles.virtualCardRow}>
            <View style={styles.cardIconBox}>
              <CreditCard color="#D4AF37" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Google Pay Virtual Account</Text>
              <Text style={styles.cardNumber}>•••• 5824 • Biometric Tokenized</Text>
            </View>
            <View style={styles.biometricBadge}>
              <Fingerprint color="#16A34A" size={14} />
              <Text style={styles.biometricBadgeText}>Ready</Text>
            </View>
          </View>

          {/* Security Banner */}
          <View style={styles.securityBanner}>
            <ShieldCheck color="#64748B" size={15} />
            <Text style={styles.securityBannerText}>
              Protected by Google 3D-Secure 2.0 & instant zero-liability tokenization.
            </Text>
          </View>

          {/* Pay Button */}
          <LuxuryPressable
            style={styles.gpayPayBtn}
            onPress={handlePay}
            disabled={authorizing}
          >
            {authorizing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnInnerRow}>
                <Fingerprint color="#FFFFFF" size={18} />
                <Text style={styles.gpayPayBtnText}>
                  Pay ${formatEnglishNumber(amount)} with Google Pay
                </Text>
              </View>
            )}
          </LuxuryPressable>
        </View>
      </View>
    </Modal>
  );
}

// 2. PayPal Checkout Modal
export function PayPalModal({
  visible,
  onClose,
  onConfirm,
  amount,
  userEmail = 'client@vanir.com',
  itemName = 'VANIR Luxury Reservation',
}: WalletModalProps) {
  const [authorizing, setAuthorizing] = useState(false);

  const handlePay = async () => {
    setAuthorizing(true);
    try {
      await onConfirm();
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.paypalCardContainer}>
          {/* Header */}
          <View style={styles.paypalHeader}>
            <PaypalLogo width={92} height={26} />
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <X color="#64748B" size={20} />
            </Pressable>
          </View>

          <View style={styles.paypalDivider} />

          {/* Total Amount */}
          <View style={styles.paypalAmountRow}>
            <Text style={styles.paypalAmountLabel}>Pay VANIR Royal Travel</Text>
            <Text style={styles.paypalAmountValue}>${formatEnglishNumber(amount)} USD</Text>
          </View>
          <Text style={styles.paypalItemDesc} numberOfLines={1}>
            {itemName}
          </Text>

          {/* User Account info */}
          <View style={styles.paypalAccountBox}>
            <Text style={styles.paypalAccountLabel}>Logged in with PayPal as</Text>
            <Text style={styles.paypalAccountEmail}>{userEmail}</Text>
          </View>

          {/* Payment Method */}
          <View style={styles.paypalMethodBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.paypalMethodTitle}>PayPal Balance & Linked Account</Text>
              <Text style={styles.paypalMethodSub}>Instant settlement • 0% conversion fees</Text>
            </View>
            <Check color="#0070BA" size={18} strokeWidth={2.6} />
          </View>

          {/* Buyer Protection */}
          <View style={styles.paypalProtectionRow}>
            <ShieldCheck color="#0070BA" size={16} />
            <Text style={styles.paypalProtectionText}>
              Covered by PayPal Buyer Protection Guarantee.
            </Text>
          </View>

          {/* Complete Payment Button */}
          <LuxuryPressable
            style={styles.paypalActionBtn}
            onPress={handlePay}
            disabled={authorizing}
          >
            {authorizing ? (
              <ActivityIndicator color="#1C1917" size="small" />
            ) : (
              <Text style={styles.paypalActionBtnText}>
                Confirm & Pay ${formatEnglishNumber(amount)}
              </Text>
            )}
          </LuxuryPressable>

          <Pressable onPress={onClose} style={styles.paypalCancelBtn}>
            <Text style={styles.paypalCancelText}>Cancel and return</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// 3. Apple Pay Authorization Modal
export function ApplePayModal({
  visible,
  onClose,
  onConfirm,
  amount,
  itemName = 'VANIR Luxury Reservation',
}: WalletModalProps) {
  const [authorizing, setAuthorizing] = useState(false);

  const handlePay = async () => {
    setAuthorizing(true);
    try {
      await onConfirm();
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.applePaySheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.applePayHeader}>
            <ApplePayLogo width={58} height={24} />
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <X color="#CBD5E1" size={20} />
            </Pressable>
          </View>

          <View style={styles.applePayRow}>
            <Text style={styles.applePayLabel}>Cards</Text>
            <Text style={styles.applePayVal}>Apple Card (•••• 9012)</Text>
          </View>

          <View style={styles.applePayRow}>
            <Text style={styles.applePayLabel}>Merchant</Text>
            <Text style={styles.applePayVal}>VANIR LUXURY TRAVEL</Text>
          </View>

          <View style={styles.applePayRow}>
            <Text style={styles.applePayLabel}>Item</Text>
            <Text style={styles.applePayVal} numberOfLines={1}>
              {itemName}
            </Text>
          </View>

          <View style={[styles.applePayRow, styles.applePayTotalRow]}>
            <Text style={styles.applePayTotalLabel}>Total</Text>
            <Text style={styles.applePayTotalVal}>${formatEnglishNumber(amount)} USD</Text>
          </View>

          <LuxuryPressable
            style={styles.applePayBtn}
            onPress={handlePay}
            disabled={authorizing}
          >
            {authorizing ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <View style={styles.btnInnerRow}>
                <Fingerprint color="#000000" size={18} />
                <Text style={styles.applePayBtnText}>Pay with Face ID / Touch ID</Text>
              </View>
            )}
          </LuxuryPressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 14,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gpayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveVerifiedTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveVerifiedTagText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
  },
  amountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1C1917',
    marginVertical: 4,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    maxWidth: '90%',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  accountEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  virtualCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  cardNumber: {
    fontSize: 12,
    color: '#64748B',
  },
  biometricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  biometricBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  securityBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  gpayPayBtn: {
    backgroundColor: '#1C1917',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpayPayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // PayPal Styles
  paypalCardContainer: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    gap: 14,
    alignSelf: 'center',
    marginVertical: 'auto',
  },
  paypalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paypalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  paypalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paypalAmountLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  paypalAmountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0070BA',
  },
  paypalItemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -8,
  },
  paypalAccountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paypalAccountLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  paypalAccountEmail: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
    marginTop: 2,
  },
  paypalMethodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  paypalMethodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },
  paypalMethodSub: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
  },
  paypalProtectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paypalProtectionText: {
    flex: 1,
    fontSize: 11,
    color: '#0070BA',
    fontWeight: '600',
  },
  paypalActionBtn: {
    backgroundColor: '#FFC439',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paypalActionBtnText: {
    color: '#1C1917',
    fontSize: 15,
    fontWeight: '800',
  },
  paypalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  paypalCancelText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  // Apple Pay Styles
  applePaySheet: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 14,
  },
  applePayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applePayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  applePayLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  applePayVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    maxWidth: '65%',
  },
  applePayTotalRow: {
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  applePayTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  applePayTotalVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D4AF37',
  },
  applePayBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  applePayBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
});
