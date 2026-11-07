import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CalendarDays, MapPin, Plane, Users } from 'lucide-react-native';
import { CatalogListScreen } from '../../components/CatalogListScreen';
import { useCatalogStore } from '../../context/CatalogStore';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing } from '../../theme/spacing';

export function FlightCatalogScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { itemsByCategory, loadingByCategory, errorsByCategory, fetchCategory } = useCatalogStore();
  const [route, setRoute] = useState('Dubai (DXB) → London (LHR)');
  const [dates, setDates] = useState('Oct 20 - Oct 27');
  const [guests, setGuests] = useState('2 VIP Passengers');
  const [appliedRoute, setAppliedRoute] = useState('');
  const [appliedDates, setAppliedDates] = useState(dates);
  const [appliedGuests, setAppliedGuests] = useState(guests);

  const filteredItems = useMemo(() => {
    const query = appliedRoute.trim().toLowerCase();
    if (!query) {
      return itemsByCategory.flights;
    }

    return itemsByCategory.flights.filter(item => {
      const name = `${item.name} ${item.subtitle}`.toLowerCase();
      return name.includes(query);
    });
  }, [appliedRoute, itemsByCategory.flights]);

  useEffect(() => {
    fetchCategory('flights').catch(() => undefined);
  }, [fetchCategory]);

  return (
    <CatalogListScreen
      title="FIRST CLASS & PRIVATE JETS"
      subtitle={`${filteredItems.length} curated flight routes · ${appliedDates} · ${appliedGuests}`}
      headerIcon={<Plane color={colors.primary} size={24} strokeWidth={1.5} />}
      headerGradient={[colors.gradientCatalogHeader, colors.background]}
      items={filteredItems}
      bookingType="flight"
      isLoading={loadingByCategory.flights}
      errorMessage={errorsByCategory.flights}
      onRetry={() => {
        fetchCategory('flights', { force: true }).catch(() => undefined);
      }}
      listHeaderComponent={(
        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>VIP Flight Search</Text>
          <Text style={styles.searchSubtitle}>Charter private aviation or first class cabins</Text>

          <View style={styles.field}>
            <MapPin color={colors.primary} size={16} strokeWidth={1.8} />
            <Text style={styles.fieldLabel}>Route / Airports</Text>
            <TextInput
              style={styles.fieldInput}
              value={route}
              onChangeText={setRoute}
              placeholder="Enter route"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Route or airports"
            />
          </View>

          <View style={styles.field}>
            <CalendarDays color={colors.primary} size={16} strokeWidth={1.8} />
            <Text style={styles.fieldLabel}>Dates (Departure - Return)</Text>
            <TextInput
              style={styles.fieldInput}
              value={dates}
              onChangeText={setDates}
              placeholder="Select dates"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Departure and return dates"
            />
          </View>

          <View style={styles.field}>
            <Users color={colors.primary} size={16} strokeWidth={1.8} />
            <Text style={styles.fieldLabel}>VIP Passengers</Text>
            <TextInput
              style={styles.fieldInput}
              value={guests}
              onChangeText={setGuests}
              placeholder="Guests"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Number of VIP guests"
            />
          </View>

          <Pressable
            style={styles.searchButton}
            onPress={() => {
              setAppliedRoute(route);
              setAppliedDates(dates);
              setAppliedGuests(guests);
              fetchCategory('flights', { force: true }).catch(() => undefined);
            }}
          >
            <Text style={styles.searchButtonText}>Search Availability</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    searchCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: borderRadius['2xl'],
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.25)',
      padding: spacing[4],
      marginBottom: spacing[4],
      gap: spacing[3],
      shadowColor: '#1C1917',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 4,
    },
    searchTitle: {
      color: '#1C1917',
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    searchSubtitle: {
      color: '#64748B',
      fontSize: 12,
      letterSpacing: 0.5,
    },
    field: {
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.25)',
      borderRadius: borderRadius.lg,
      backgroundColor: '#FAF9F6',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      gap: 4,
    },
    fieldLabel: {
      color: '#64748B',
      fontSize: 11,
      fontWeight: '600',
    },
    fieldInput: {
      color: '#1C1917',
      fontSize: 14,
      fontWeight: '700',
      paddingVertical: 2,
    },
    searchButton: {
      backgroundColor: '#D4AF37',
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[3],
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing[1],
      shadowColor: '#D4AF37',
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 3,
    },
    searchButtonText: {
      color: '#1C1917',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
  });
}
