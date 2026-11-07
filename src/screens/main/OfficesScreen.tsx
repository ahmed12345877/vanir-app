import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Rect, Path } from 'react-native-svg';
import {
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  ChevronLeft,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

import { Flag } from '../../components/Flag';

const OFFICES = [
  {
    id: '1',
    city: 'Cairo',
    country: 'Egypt',
    flagEmoji: '🇪🇬',
    address: '16 Lebanon Street, Mohandessin, Giza, Egypt',
    phone: '+201123988882',
    displayPhone: '+201123988882',
    email: 'cairo@vanirgroup.com',
    website: 'https://vanirgroup.com',
    isHQ: true,
    hours: 'Sun–Thu: 9:00 AM – 6:00 PM',
  },
  {
    id: '2',
    city: 'Dubai',
    country: 'United Arab Emirates',
    flagEmoji: '🇦🇪',
    address: 'Business Bay, Dubai, UAE',
    phone: '+971 4 123 4567',
    displayPhone: '+971 4 123 4567',
    email: 'dubai@vanirgroup.com',
    website: 'https://vanirgroup.com',
    isHQ: false,
    hours: 'Mon–Fri: 9:00 AM – 6:00 PM',
  },
  {
    id: '3',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    flagEmoji: '🇸🇦',
    address: 'King Fahd Road, Olaya District, Riyadh, KSA',
    phone: '+966 11 123 4567',
    displayPhone: '+966 11 123 4567',
    email: 'riyadh@vanirgroup.com',
    website: 'https://vanirgroup.com',
    isHQ: false,
    hours: 'Sun–Thu: 9:00 AM – 5:00 PM',
  },
  {
    id: '4',
    city: 'London',
    country: 'United Kingdom',
    flagEmoji: '🇬🇧',
    address: 'Mayfair, London W1J, United Kingdom',
    phone: '+44 20 1234 5678',
    displayPhone: '+44 20 1234 5678',
    email: 'london@vanirgroup.com',
    website: 'https://vanirgroup.com',
    isHQ: false,
    hours: 'Mon–Fri: 9:00 AM – 6:00 PM',
  },
  {
    id: '5',
    city: 'Paris',
    country: 'France',
    flagEmoji: '🇫🇷',
    address: 'Place Vendôme, 75001 Paris, France',
    phone: '+33 1 4268 5500',
    displayPhone: '+33 1 4268 5500',
    email: 'paris@vanirgroup.com',
    website: 'https://vanirgroup.com',
    isHQ: false,
    hours: 'Mon–Fri: 9:00 AM – 6:00 PM',
  },
];

export function OfficesScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.topBtnPressed]}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <ChevronLeft color="#1C1917" size={20} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            OUR <Text style={styles.titleGold}>OFFICES</Text>
          </Text>
          <Text style={styles.headerSub}>Find us around the world</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {OFFICES.map(office => (
            <View
              key={office.id}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                {/* Official Refined Small National Flag */}
                <Flag emoji={office.flagEmoji} size={28} />

                <View style={styles.cardHeaderText}>
                  <View style={styles.cityRow}>
                    <Text style={styles.city}>{office.city}</Text>
                    {office.isHQ ? (
                      <View style={styles.hqBadge}>
                        <Text style={styles.hqBadgeText}>HEADQUARTERS</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.country}>{office.country}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <MapPin color="#D4AF37" size={15} strokeWidth={1.8} />
                <Text style={styles.infoText}>{office.address}</Text>
              </View>

              <View style={styles.row}>
                <Clock color="#D4AF37" size={15} strokeWidth={1.8} />
                <Text style={styles.infoText}>{office.hours}</Text>
              </View>

              <View style={styles.contactRow}>
                <Pressable
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(`tel:${office.phone}`)}
                >
                  <Phone color="#1C1917" size={13} strokeWidth={1.8} />
                  <Text style={styles.contactBtnText}>{office.displayPhone}</Text>
                </Pressable>
                <Pressable
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(`mailto:${office.email}`)}
                >
                  <Mail color="#1C1917" size={13} strokeWidth={1.8} />
                  <Text style={styles.contactBtnText}>Email</Text>
                </Pressable>
                <Pressable
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(office.website)}
                >
                  <Globe color="#1C1917" size={13} strokeWidth={1.8} />
                  <Text style={styles.contactBtnText}>Website</Text>
                </Pressable>
              </View>
            </View>
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
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
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1,
  },
  titleGold: { color: '#D4AF37' },
  headerSub: { fontSize: 12, color: '#64748B', marginTop: 1 },
  scroll: { padding: spacing[4], gap: spacing[4] },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: spacing[5],
    gap: spacing[3],
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagBadge: {
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flagEmoji: {
    fontSize: 18,
  },
  cardHeaderText: { flex: 1 },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  city: { fontSize: 18, fontWeight: '800', color: '#1C1917' },
  country: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },
  hqBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  hqBadgeText: { color: '#D4AF37', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  infoText: {
    color: '#475569',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  contactRow: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap', marginTop: 4 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: '#FAF9F6',
  },
  contactBtnText: { color: '#1C1917', fontSize: 11.5, fontWeight: '700', letterSpacing: 0.2 },
  bottomPad: { height: 80 },
});
