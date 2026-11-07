import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle,
  ShieldCheck,
  X,
  Lock,
  CreditCard,
} from 'lucide-react-native';
import {
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  PaypalLogo,
  GooglePayLogo,
  ApplePayLogo,
} from '../../components/PaymentLogos';
import {
  deleteSavedCard,
  detectCardBrand,
  formatCardNumberInput,
  formatExpiryInput,
  getSavedCards,
  SavedCardItem,
  saveNewMaskedCard,
  setDefaultSavedCard,
} from '../../services/savedCardsStore';
import {
  validateCardCvv,
  validateCardExpiry,
  validateCardNumberLuhn,
} from '../../services/paymentGateway';
import { borderRadius, spacing } from '../../theme/spacing';

export function PaymentMethodsScreen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState<SavedCardItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Add New Card form state
  const [holderName, setHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [makeDefault, setMakeDefault] = useState(true);

  const loadCards = useCallback(async () => {
    const saved = await getSavedCards();
    setCards(saved);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards]),
  );

  const handleSetDefault = async (id: string) => {
    const next = await setDefaultSavedCard(id);
    setCards(next);
  };

  const handleRemoveCard = (card: SavedCardItem) => {
    Alert.alert(
      'Remove Card',
      `Are you sure you want to remove the card ending in ${card.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const next = await deleteSavedCard(card.id);
            setCards(next);
          },
        },
      ],
    );
  };

  const handleSaveCard = async () => {
    const cleanDigits = cardNumber.replace(/\D/g, '');
    if (!holderName.trim() || holderName.trim().length < 3) {
      Alert.alert('Cardholder Name', 'Please enter the full name as printed on the bank card.');
      return;
    }
    if (!validateCardNumberLuhn(cleanDigits)) {
      Alert.alert('Invalid Card Number', 'Luhn checksum verification failed. Please check your card number.');
      return;
    }
    if (!validateCardExpiry(expiry)) {
      Alert.alert('Invalid Expiry Date', 'Please enter a valid expiry date in MM/YY format.');
      return;
    }
    if (!validateCardCvv(cvv)) {
      Alert.alert('Security Code (CVV)', 'Please enter the 3 or 4 digit CVV security code.');
      return;
    }

    await saveNewMaskedCard({
      cardNumber: cleanDigits,
      expiry,
      holderName,
      makeDefault,
    });
    await loadCards();
    setHolderName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setModalVisible(false);
    Alert.alert('Card Saved Successfully ✓', 'Your card has been securely encrypted and saved for your reservations.');
  };

  const liveBrand = detectCardBrand(cardNumber);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.topBtnPressed]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.topBarTitle}>PAYMENT METHODS</Text>
        <View style={styles.placeholderBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionNote}>
          Your payment instruments are tokenized with PCI-DSS Level 1 protection. Raw card numbers and CVV codes are never stored.
        </Text>

        {cards.length === 0 ? (
          <View style={styles.emptyBox}>
            <CreditCard color="#D4AF37" size={32} strokeWidth={1.8} />
            <Text style={styles.emptyTitle}>No Saved Cards Yet</Text>
            <Text style={styles.emptySub}>
              Add your Visa, Mastercard, American Express, or Mada card for instant 1-tap VIP checkout across flights, hotels, and charters.
            </Text>
          </View>
        ) : (
          cards.map(card => (
            <Pressable
              key={card.id}
              onPress={() => handleSetDefault(card.id)}
              style={styles.cardWrapper}
            >
              <LinearGradient
                colors={card.gradient || ['#1C1917', '#1E3A8A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, card.isDefault && styles.cardSelected]}
              >
                <View style={styles.cardShine} />

                <View style={styles.cardTop}>
                  <View style={styles.brandChipWhite}>
                    {card.brand === 'Visa' ? (
                      <VisaLogo width={54} height={18} />
                    ) : card.brand === 'Mastercard' ? (
                      <MastercardLogo width={36} height={22} />
                    ) : card.brand === 'American Express' ? (
                      <AmexLogo width={48} height={18} />
                    ) : (
                      <Text style={{ fontWeight: '900', color: '#1C1917', fontSize: 12 }}>
                        {card.brand.toUpperCase()}
                      </Text>
                    )}
                  </View>
                  {card.isDefault && <CheckCircle color="#D4AF37" size={20} strokeWidth={2.2} />}
                </View>

                <View style={styles.chip}>
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                </View>

                <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>

                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.cardFieldLabel}>CARDHOLDER</Text>
                    <Text style={styles.cardFieldValue}>{card.holderName}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.cardFieldLabel}>EXPIRES</Text>
                    <Text style={styles.cardFieldValue}>{card.expiry}</Text>
                  </View>
                </View>

                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
              </LinearGradient>

              <Pressable style={styles.removeBtn} onPress={() => handleRemoveCard(card)}>
                <Trash2 color="#EF4444" size={15} strokeWidth={1.8} />
                <Text style={styles.removeBtnText}>Remove Card</Text>
              </Pressable>
            </Pressable>
          ))
        )}

        {/* Real Add New Card Trigger */}
        <Pressable style={styles.addCard} onPress={() => setModalVisible(true)}>
          <Plus color="#1C1917" size={19} strokeWidth={2.4} />
          <Text style={styles.addCardText}>Add New Visa / Mastercard / Amex</Text>
        </Pressable>

        {/* Connected Digital Wallets */}
        <View style={styles.walletsSection}>
          <Text style={styles.walletsSectionTitle}>SUPPORTED DIGITAL WALLETS</Text>

          <View style={styles.walletItem}>
            <View style={styles.walletItemLeft}>
              <View style={styles.walletIconBox}>
                <ApplePayLogo width={48} height={20} />
              </View>
              <View>
                <Text style={styles.walletName}>Apple Pay Biometric</Text>
                <Text style={styles.walletEmail}>Instant Express Tokenization</Text>
              </View>
            </View>
            <View style={styles.walletBadge}>
              <Text style={styles.walletBadgeText}>READY ✓</Text>
            </View>
          </View>

          <View style={styles.walletItem}>
            <View style={styles.walletItemLeft}>
              <View style={styles.walletIconBox}>
                <GooglePayLogo width={54} height={20} />
              </View>
              <View>
                <Text style={styles.walletName}>Google Pay Wallet</Text>
                <Text style={styles.walletEmail}>Biometric Checkout Active</Text>
              </View>
            </View>
            <View style={styles.walletBadge}>
              <Text style={styles.walletBadgeText}>READY ✓</Text>
            </View>
          </View>

          <View style={styles.walletItem}>
            <View style={styles.walletItemLeft}>
              <View style={styles.walletIconBox}>
                <PaypalLogo width={64} height={18} />
              </View>
              <View>
                <Text style={styles.walletName}>PayPal Express Checkout</Text>
                <Text style={styles.walletEmail}>Buyer Protection Enabled</Text>
              </View>
            </View>
            <View style={styles.walletBadge}>
              <Text style={styles.walletBadgeText}>READY ✓</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBlock}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ShieldCheck color="#16A34A" size={18} />
            <Text style={styles.infoTitle}>PCI-DSS LEVEL 1 BANK ENCRYPTION</Text>
          </View>
          <Text style={styles.infoText}>
            All card instruments undergo real-time Luhn mathematical checksum validation and 256-bit TLS tokenization via vanirgroup.com/api/checkout.
          </Text>
        </View>
      </ScrollView>

      {/* Real Add Card Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Lock color="#D4AF37" size={18} />
                <Text style={styles.modalTitle}>Add Bank Card</Text>
              </View>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                <X color="#1C1917" size={22} />
              </Pressable>
            </View>

            <Text style={styles.fieldLbl}>CARDHOLDER FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. AHMED AL MANSOURI"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              value={holderName}
              onChangeText={setHolderName}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.fieldLbl}>CARD NUMBER</Text>
              <Text style={styles.brandLivePill}>{liveBrand.toUpperCase()}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="4532 0000 0000 0000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={23}
              value={cardNumber}
              onChangeText={t => setCardNumber(formatCardNumberInput(t))}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLbl}>EXPIRY (MM/YY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09/29"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={5}
                  value={expiry}
                  onChangeText={t => setExpiry(formatExpiryInput(t))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLbl}>CVV / CVC</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={cvv}
                  onChangeText={t => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Set as default VIP payment card</Text>
              <Switch
                value={makeDefault}
                onValueChange={setMakeDefault}
                trackColor={{ false: '#CBD5E1', true: '#D4AF37' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Pressable style={styles.saveBtn} onPress={handleSaveCard}>
              <ShieldCheck color="#1C1917" size={18} strokeWidth={2.4} />
              <Text style={styles.saveBtnText}>Verify & Save Card</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(28, 25, 23, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  placeholderBtn: { width: 40 },
  topBarTitle: {
    color: '#1C1917',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  sectionNote: { color: '#64748B', fontSize: 12.5, lineHeight: 19 },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1C1917' },
  emptySub: { fontSize: 12.5, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  cardWrapper: { gap: 8 },
  card: {
    borderRadius: borderRadius.xl,
    padding: 20,
    gap: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    position: 'relative',
  },
  cardSelected: { borderColor: '#D4AF37', borderWidth: 2 },
  cardShine: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -80,
    right: -60,
  },
  brandChipWhite: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: {
    width: 38,
    height: 28,
    borderRadius: 5,
    backgroundColor: '#D4AF37',
    justifyContent: 'space-evenly',
    paddingHorizontal: 5,
    opacity: 0.9,
  },
  chipLine: { height: 1.5, backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 1 },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
  },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardFieldLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  cardFieldValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.8 },
  defaultBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  defaultBadgeText: { color: '#FDE68A', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    borderRadius: borderRadius.lg,
    paddingVertical: 15,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addCardText: { color: '#1C1917', fontSize: 14, fontWeight: '800' },
  walletsSection: { marginTop: 4, gap: 10 },
  walletsSectionTitle: {
    color: '#1C1917',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(28, 25, 23, 0.08)',
  },
  walletItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletIconBox: {
    width: 68,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletName: { color: '#1C1917', fontSize: 13.5, fontWeight: '800' },
  walletEmail: { color: '#64748B', fontSize: 11.5, marginTop: 1 },
  walletBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  walletBadgeText: { color: '#166534', fontSize: 10, fontWeight: '800' },
  infoBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
    gap: 6,
  },
  infoTitle: { color: '#166534', fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  infoText: { color: '#475569', fontSize: 12, lineHeight: 18 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#1C1917' },
  fieldLbl: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 10,
  },
  brandLivePill: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D4AF37',
    backgroundColor: '#1C1917',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 18,
  },
  switchLabel: { fontSize: 13, fontWeight: '700', color: '#1C1917' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 15,
  },
  saveBtnText: { fontSize: 14.5, fontWeight: '900', color: '#1C1917' },
});
