import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Check, Sparkles, SlidersHorizontal } from 'lucide-react-native';

type SelectOption = { value: string; label: string };

type PreferenceSection = {
  key: string;
  title: string;
  subtitle: string;
  options: SelectOption[];
  multi?: boolean;
};

const PREFERENCES: PreferenceSection[] = [
  {
    key: 'cabin_class',
    title: 'Cabin Class',
    subtitle: 'Select your default flight travel comfort preference',
    options: [
      { value: 'economy', label: 'Economy Class' },
      { value: 'premium_economy', label: 'Premium Economy' },
      { value: 'business', label: 'Business Class' },
      { value: 'first', label: 'First Class Suite' },
      { value: 'private', label: 'Private Jet Charter' },
    ],
  },
  {
    key: 'travel_style',
    title: 'Travel Style & Interests',
    subtitle: 'Select multiple experiences that match your travel persona',
    multi: true,
    options: [
      { value: 'adventure', label: 'Adventure & Nature' },
      { value: 'cultural', label: 'Cultural & Heritage' },
      { value: 'wellness', label: 'Wellness & Spa Retreats' },
      { value: 'gastronomy', label: 'Fine Dining & Gastronomy' },
      { value: 'beach', label: 'Beach & Island Resorts' },
      { value: 'urban', label: 'Urban & Shopping' },
    ],
  },
  {
    key: 'accommodation',
    title: 'Preferred Accommodations',
    subtitle: 'Your primary lodging category for VIP stays',
    options: [
      { value: 'five_star', label: '5-Star Luxury Hotels' },
      { value: 'boutique', label: 'Boutique Heritage Suites' },
      { value: 'villa', label: 'Private Oceanfront Villas' },
      { value: 'resort', label: 'All-Inclusive Luxury Resorts' },
      { value: 'cruise', label: 'Private Yacht Charters' },
    ],
  },
  {
    key: 'dietary',
    title: 'Dietary Preferences',
    subtitle: 'Informed in advance for all flights, yachts, and dining reservations',
    multi: true,
    options: [
      { value: 'none', label: 'No Dietary Restrictions' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'halal', label: 'Halal Certified' },
      { value: 'gluten_free', label: 'Gluten-Free' },
      { value: 'kosher', label: 'Kosher' },
    ],
  },
  {
    key: 'currency',
    title: 'Preferred Currency',
    subtitle: 'Prices across all catalogs will display in your selected currency',
    options: [
      { value: 'usd', label: 'USD ($) - US Dollar' },
      { value: 'eur', label: 'EUR (€) - Euro' },
      { value: 'gbp', label: 'GBP (£) - British Pound' },
      { value: 'aed', label: 'AED (AED) - UAE Dirham' },
      { value: 'sar', label: 'SAR (SAR) - Saudi Riyal' },
    ],
  },
];

const DEFAULTS: Record<string, string[]> = {
  cabin_class: ['business'],
  travel_style: ['cultural', 'gastronomy'],
  accommodation: ['five_star'],
  dietary: ['none'],
  currency: ['usd'],
};

export function TravelPreferencesScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Record<string, string[]>>(DEFAULTS);

  function toggle(sectionKey: string, value: string, multi?: boolean) {
    setSelected(prev => {
      const current = prev[sectionKey] ?? [];
      if (multi) {
        return {
          ...prev,
          [sectionKey]: current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value],
        };
      }
      return { ...prev, [sectionKey]: [value] };
    });
  }

  const handleSave = () => {
    Alert.alert(
      'Preferences Saved',
      'Your travel preferences have been synchronized with your VIP concierge profile.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.headerTitle}>Travel Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.introIconBox}>
            <SlidersHorizontal color="#D4AF37" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Personalize Your Journey</Text>
            <Text style={styles.introDesc}>
              These settings guide our 24/7 concierge and booking algorithms to suggest the most relevant cabins, hotels, and bespoke dining.
            </Text>
          </View>
        </View>

        {PREFERENCES.map(section => (
          <View key={section.key} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionSub}>{section.subtitle}</Text>
              {section.multi && (
                <View style={styles.multiBadge}>
                  <Text style={styles.multiBadgeText}>Multiple Selection Enabled</Text>
                </View>
              )}
            </View>

            <View style={styles.optionList}>
              {section.options.map(opt => {
                const isActive = (selected[section.key] ?? []).includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.optionChip, isActive && styles.optionChipActive]}
                    onPress={() => toggle(section.key, opt.value, section.multi)}
                  >
                    <View style={styles.optionLeft}>
                      <View style={[styles.radioBox, isActive && styles.radioBoxActive]}>
                        {isActive && <Check color="#1C1917" size={14} strokeWidth={3} />}
                      </View>
                      <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                        {opt.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Save Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.btnPressed]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save Preferences</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  introIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  introDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  sectionSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  multiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  multiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
  },
  optionList: {
    gap: 10,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: 'rgba(28, 25, 23, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionChipActive: {
    backgroundColor: '#FFFDF9',
    borderColor: '#D4AF37',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioBoxActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  optionTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  saveBtn: {
    backgroundColor: '#D4AF37',
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  saveBtnText: {
    color: '#1C1917',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
