import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Send,
  Calendar,
  Users,
  CreditCard,
  FileText,
} from 'lucide-react-native';
import { createServiceRequest, ServiceRequest } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import { VipDatePickerModal } from '../../components/VipDatePickerModal';
import { VisaDocumentPdfModal, type VisaDocType } from '../../components/VisaDocumentPdfModal';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';

interface FormFieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  multiline?: boolean;
}

const DEFAULT_VIP_FIELDS: FormFieldConfig[] = [
  { name: 'fullName', label: 'Primary Guest / Full Name', placeholder: 'Enter your full name' },
  { name: 'phone', label: 'VIP Contact Phone / WhatsApp', placeholder: '+971 50 123 4567', keyboardType: 'phone-pad' },
  {
    name: 'specialRequests',
    label: 'Special Requests & Butler Preferences',
    placeholder: 'Private chef, airport tarmac escort, dietary notes, soundproofing...',
    multiline: true,
  },
];

function getFutureYmd(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function inferDocType(serviceType: string, title: string): VisaDocType {
  const s = `${serviceType} ${title}`.toLowerCase();
  if (s.includes('tour') || s.includes('expedition') || s.includes('safari') || s.includes('cruise')) return 'tour';
  if (s.includes('apartment') || s.includes('penthouse') || s.includes('residence') || s.includes('villa')) return 'apartment';
  if (s.includes('jet') || s.includes('aviation')) return 'jet';
  if (s.includes('yacht')) return 'yacht';
  if (s.includes('limo') || s.includes('chauffeur') || s.includes('car') || s.includes('transfer')) return 'limousine';
  if (s.includes('airport') || s.includes('fast-track')) return 'airport';
  if (s.includes('esim')) return 'esim';
  if (s.includes('hotel') || s.includes('suite')) return 'hotel';
  return 'package';
}

export function ServiceBookingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const params = route.params || {};
  const serviceType = params.serviceType || 'Hotel Apartments & Penthouses';
  const title = params.title || params.prefillItem || serviceType;
  const subtitle = params.subtitle || 'Bespoke VIP Concierge Reservation';
  const prefillItem = params.prefillItem || '';
  const price = params.price || '';
  const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;

  const rawFields: FormFieldConfig[] =
    Array.isArray(params.formFields) && params.formFields.length > 0
      ? params.formFields.filter(
          (f: FormFieldConfig) => f.name !== 'dates' && f.name !== 'guests',
        )
      : DEFAULT_VIP_FIELDS;

  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (prefillItem) {
      initial.prefillItem = prefillItem;
    }
    if ((user as any)?.name) {
      initial.fullName = (user as any).name;
    }
    return initial;
  });

  const [startDate, setStartDate] = useState(() => getFutureYmd(3));
  const [endDate, setEndDate] = useState(() => getFutureYmd(6));
  const [guestsCount, setGuestsCount] = useState(2);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVoucherPdf, setShowVoucherPdf] = useState(false);
  const [lastRefCode, setLastRefCode] = useState('');

  const docType = inferDocType(serviceType, title);

  const validateGuestInputs = (): boolean => {
    const guestName = (formData.fullName || '').trim();
    const guestPhone = (formData.phone || '').trim();

    if (!guestName || guestName.length < 3) {
      Alert.alert(
        'Required Information',
        'Please enter your full name to proceed with the reservation.',
      );
      return false;
    }

    if (!guestPhone || guestPhone.length < 7) {
      Alert.alert(
        'Required Information',
        'Please enter a valid contact phone or WhatsApp number.',
      );
      return false;
    }

    return true;
  };

  const handleProceedToCheckout = () => {
    if (!validateGuestInputs()) return;
    navigation.navigate('Booking', {
      type: docType,
      bookingType: docType,
      visaDocType: docType,
      itemName: title,
      price: numericPrice > 0 ? numericPrice : 850,
      startDate,
      endDate,
      guestsCount,
      fullName: (formData.fullName || '').trim(),
      phone: (formData.phone || '').trim(),
      specialRequests: (formData.specialRequests || '').trim(),
      destination: params.city || params.location || serviceType,
    });
  };

  const handleSubmit = async () => {
    if (!validateGuestInputs()) return;

    setIsSubmitting(true);
    const generatedRef = `VN-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastRefCode(generatedRef);
    try {
      const request: Omit<ServiceRequest, 'id' | 'createdAt'> = {
        userId: (user as any)?.uid || 'anonymous_vip',
        serviceType: serviceType as ServiceRequest['serviceType'],
        details: {
          ...formData,
          dates: `${startDate} to ${endDate}`,
          startDate,
          endDate,
          guests: String(guestsCount),
          requestedService: title,
          prefillItem,
          price,
          referenceNumber: generatedRef,
        },
        status: 'pending',
      };

      await createServiceRequest(request);
      setShowVoucherPdf(true);
    } catch {
      setShowVoucherPdf(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Luxury Off-White Header */}
      <View style={styles.header}>
        <LuxuryPressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#1C1917" size={20} strokeWidth={2.4} />
        </LuxuryPressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.headerRightBadge}>
          <ShieldCheck color="#D4AF37" size={18} strokeWidth={2.2} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 + insets.bottom }]}
        >
          {/* VIP Guarantee Banner */}
          <View style={styles.guaranteeCard}>
            <View style={styles.guaranteeIconBox}>
              <Sparkles color="#D4AF37" size={18} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.guaranteeTitle}>Direct VIP Concierge Reservation</Text>
              <Text style={styles.guaranteeText}>
                Guaranteed priority allocation with private butler service & verified safety protocols.
              </Text>
            </View>
          </View>

          {/* Interactive Dates & Guests Card */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Preferred Schedule & VIP Guests</Text>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: '#FAF9F6',
                  borderWidth: 1,
                  borderColor: 'rgba(212, 175, 55, 0.35)',
                  borderRadius: 12,
                  padding: 11,
                  gap: 4,
                }}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748B' }}>
                  START / CHECK-IN DATE
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Calendar color="#D4AF37" size={14} strokeWidth={2} />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#1C1917' }}>
                    {startDate}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: '#FAF9F6',
                  borderWidth: 1,
                  borderColor: 'rgba(212, 175, 55, 0.35)',
                  borderRadius: 12,
                  padding: 11,
                  gap: 4,
                }}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748B' }}>
                  END / CHECK-OUT DATE
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Calendar color="#D4AF37" size={14} strokeWidth={2} />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#1C1917' }}>
                    {endDate}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FAF9F6',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: 'rgba(212, 175, 55, 0.25)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Users color="#D4AF37" size={16} strokeWidth={2} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1C1917' }}>
                  Number of VIP Guests
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable
                  style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D4AF37', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => setGuestsCount(g => Math.max(1, g - 1))}
                >
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1917' }}>−</Text>
                </Pressable>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#1C1917', minWidth: 18, textAlign: 'center' }}>
                  {guestsCount}
                </Text>
                <Pressable
                  style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D4AF37', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => setGuestsCount(g => Math.min(20, g + 1))}
                >
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1917' }}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Guest Contact & Preferences</Text>

            {rawFields.map((field, idx) => (
              <View key={field.name || idx} style={styles.fieldContainer}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={[styles.input, field.multiline && styles.textArea]}
                  placeholder={field.placeholder || ''}
                  placeholderTextColor="#94A3B8"
                  keyboardType={field.keyboardType || 'default'}
                  multiline={field.multiline}
                  value={formData[field.name] || ''}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, [field.name]: text }))
                  }
                />
              </View>
            ))}

            {/* Secondary Option: Concierge Inquiry Without Immediate Charge */}
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 11,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(28, 25, 23, 0.2)',
                backgroundColor: '#FAF9F6',
                marginTop: 4,
              }}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <FileText color="#1C1917" size={15} strokeWidth={2} />
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#1C1917' }}>
                {isSubmitting ? 'Generating Official Dossier...' : 'Request Concierge Callback & Provisional PDF'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarLabel}>TOTAL RATE</Text>
          <Text style={styles.bottomBarValue}>
            {numericPrice > 0 ? `$${numericPrice.toLocaleString('en-US')}` : (price || '$850')}
          </Text>
        </View>

        <LuxuryPressable
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleProceedToCheckout}
          disabled={isSubmitting}
        >
          <View style={styles.submitBtnRow}>
            <CreditCard color="#1C1917" size={16} strokeWidth={2.4} />
            <Text style={styles.submitBtnText}>Pay & Issue Official PDF</Text>
          </View>
        </LuxuryPressable>
      </View>

      <VipDatePickerModal
        visible={showStartPicker}
        initialDate={startDate}
        title="Select Start / Check-In Date"
        onClose={() => setShowStartPicker(false)}
        onSelectDate={selected => {
          setStartDate(selected);
          if (selected > endDate) {
            setEndDate(selected);
          }
        }}
      />

      <VipDatePickerModal
        visible={showEndPicker}
        initialDate={endDate}
        title="Select End / Check-Out Date"
        onClose={() => setShowEndPicker(false)}
        onSelectDate={selected => {
          if (selected < startDate) {
            setEndDate(startDate);
          } else {
            setEndDate(selected);
          }
        }}
      />

      <VisaDocumentPdfModal
        visible={showVoucherPdf}
        onClose={() => {
          setShowVoucherPdf(false);
          navigation.goBack();
        }}
        docType={docType}
        data={{
          referenceNumber: lastRefCode || 'VN-CONCIERGE-VIP',
          clientName: (formData.fullName || '').trim() || 'VIP Member',
          phone: (formData.phone || '').trim(),
          email: (user as any)?.email || '',
          hotelName: title,
          packageName: title,
          vehicleOrVesselName: title,
          checkInDate: startDate,
          checkOutDate: endDate,
          guestsCount,
          totalAmountPaid: numericPrice > 0 ? numericPrice : undefined,
          specialRequests: formData.specialRequests,
          paymentMethod: 'Concierge Priority Dispatch',
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  guaranteeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
  guaranteeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 12,
    color: '#1C1917',
    fontSize: 13.5,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF9F6',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomBarLeft: {
    minWidth: 90,
    justifyContent: 'center',
  },
  bottomBarLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  bottomBarValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1917',
    marginTop: 2,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#1C1917',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
