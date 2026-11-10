import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { Building } from 'lucide-react-native';
import { CatalogListScreen } from '../../components/CatalogListScreen';
import { useCatalogStore } from '../../context/CatalogStore';
import { useTheme } from '../../context/ThemeContext';

interface DestinationFilter {
  id: string;
  label: string;
  match: (subtitle: string, name: string) => boolean;
}

const DESTINATIONS: DestinationFilter[] = [
  {
    id: 'all',
    label: 'All Destinations',
    match: () => true,
  },
  {
    id: 'europe',
    label: 'Europe & Schengen 🇪🇺',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('greece') ||
        t.includes('athens') ||
        t.includes('santorini') ||
        t.includes('mykonos') ||
        t.includes('turkey') ||
        t.includes('istanbul') ||
        t.includes('france') ||
        t.includes('paris') ||
        t.includes('italy') ||
        t.includes('rome') ||
        t.includes('milan') ||
        t.includes('venice') ||
        t.includes('spain') ||
        t.includes('madrid') ||
        t.includes('barcelona') ||
        t.includes('switzerland') ||
        t.includes('geneva') ||
        t.includes('zurich') ||
        t.includes('germany') ||
        t.includes('berlin') ||
        t.includes('austria') ||
        t.includes('vienna') ||
        t.includes('netherlands') ||
        t.includes('amsterdam') ||
        t.includes('czech') ||
        t.includes('prague') ||
        t.includes('hungary') ||
        t.includes('budapest')
      );
    },
  },
  {
    id: 'greece',
    label: 'Greece 🇬🇷',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('greece') ||
        t.includes('athens') ||
        t.includes('santorini') ||
        t.includes('oia') ||
        t.includes('mykonos') ||
        t.includes('crete') ||
        t.includes('rhodes') ||
        t.includes('bretagne') ||
        t.includes('canaves') ||
        t.includes('katikies') ||
        t.includes('cavo tagoo')
      );
    },
  },
  {
    id: 'turkey',
    label: 'Turkey 🇹🇷',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('turkey') ||
        t.includes('turkiye') ||
        t.includes('istanbul') ||
        t.includes('cappadocia') ||
        t.includes('çırağan') ||
        t.includes('bosphorus') ||
        t.includes('bodrum') ||
        t.includes('antalya') ||
        t.includes('kemer')
      );
    },
  },
  {
    id: 'france',
    label: 'France 🇫🇷',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('paris') ||
        t.includes('france') ||
        t.includes('crillon') ||
        t.includes('george v') ||
        t.includes('shangri-la') ||
        t.includes('cannes') ||
        t.includes('martinez') ||
        t.includes('cap-ferrat') ||
        t.includes('riviera')
      );
    },
  },
  {
    id: 'italy',
    label: 'Italy 🇮🇹',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('italy') ||
        t.includes('rome') ||
        t.includes('milan') ||
        t.includes('venice') ||
        t.includes('florence') ||
        t.includes('como') ||
        t.includes('gritti') ||
        t.includes('cipriani') ||
        t.includes('tremezzo') ||
        t.includes('de russie')
      );
    },
  },
  {
    id: 'switzerland',
    label: 'Switzerland 🇨🇭',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('switzerland') ||
        t.includes('geneva') ||
        t.includes('zurich') ||
        t.includes('st. moritz') ||
        t.includes('badrutt') ||
        t.includes('baur au lac') ||
        t.includes('dolder')
      );
    },
  },
  {
    id: 'spain',
    label: 'Spain 🇪🇸',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('spain') ||
        t.includes('madrid') ||
        t.includes('barcelona') ||
        t.includes('marbella') ||
        t.includes('villa magna') ||
        t.includes('hotel arts')
      );
    },
  },
  {
    id: 'germany_austria',
    label: 'Germany & Austria 🇩🇪',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('germany') ||
        t.includes('berlin') ||
        t.includes('munich') ||
        t.includes('adlon') ||
        t.includes('austria') ||
        t.includes('vienna') ||
        t.includes('sacher')
      );
    },
  },
  {
    id: 'england',
    label: 'England 🇬🇧',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('london') ||
        t.includes('united kingdom') ||
        t.includes('england') ||
        t.includes('edinburgh') ||
        t.includes('savoy') ||
        t.includes('claridge') ||
        t.includes('ritz london') ||
        t.includes('dorchester') ||
        t.includes('balmoral')
      );
    },
  },
  {
    id: 'gulf',
    label: 'Gulf & Arab 🇸🇦',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('saudi') ||
        t.includes('riyadh') ||
        t.includes('jeddah') ||
        t.includes('alula') ||
        t.includes('makkah') ||
        t.includes('madinah') ||
        t.includes('dubai') ||
        t.includes('abu dhabi') ||
        t.includes('uae') ||
        t.includes('qatar') ||
        t.includes('doha') ||
        t.includes('egypt') ||
        t.includes('cairo') ||
        t.includes('sharm') ||
        t.includes('hurghada') ||
        t.includes('sunrise') ||
        t.includes('movenpick') ||
        t.includes('radisson') ||
        t.includes('morocco') ||
        t.includes('marrakech') ||
        t.includes('mansour')
      );
    },
  },
  {
    id: 'east_asia_usa',
    label: 'Asia, USA & Islands 🌏',
    match: (s, n) => {
      const t = `${s} ${n}`.toLowerCase();
      return (
        t.includes('tokyo') ||
        t.includes('japan') ||
        t.includes('bali') ||
        t.includes('singapore') ||
        t.includes('bangkok') ||
        t.includes('maldives') ||
        t.includes('new york') ||
        t.includes('los angeles') ||
        t.includes('miami')
      );
    },
  },
];

export function HotelCatalogScreen() {
  const { colors } = useTheme();
  const { itemsByCategory, loadingByCategory, errorsByCategory, fetchCategory } = useCatalogStore();
  const [selectedDest, setSelectedDest] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategory('hotels', { force: true }).catch(() => undefined);
  }, [fetchCategory]);

  const allHotels = itemsByCategory.hotels ?? [];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCategory('hotels', { force: true });
    } finally {
      setRefreshing(false);
    }
  }, [fetchCategory]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredHotels = useMemo(() => {
    let result = allHotels;
    const activeFilter = DESTINATIONS.find(d => d.id === selectedDest);
    if (activeFilter && activeFilter.id !== 'all') {
      result = result.filter(item => activeFilter.match(item.subtitle, item.name));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          (item.country && item.country.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allHotels, selectedDest, searchQuery]);

  const destinationChips = (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>SELECT DESTINATION REGION</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {DESTINATIONS.map(dest => {
          const isActive = selectedDest === dest.id;
          const count = dest.id === 'all'
            ? allHotels.length
            : allHotels.filter(h => dest.match(h.subtitle, h.name)).length;
          return (
            <Pressable
              key={dest.id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedDest(dest.id)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {dest.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <CatalogListScreen
      title="LUXURY 5-STAR HOTELS"
      subtitle=""
      hideCountBadge={true}
      showSearch={true}
      searchPlaceholder="Search hotel, palace, resort, or city…"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      headerIcon={<Building color={colors.primary} size={24} strokeWidth={1.5} />}
      headerGradient={[colors.gradientCatalogHeader, colors.background]}
      items={filteredHotels}
      bookingType="hotel"
      listHeaderComponent={destinationChips}
      isLoading={loadingByCategory.hotels}
      errorMessage={errorsByCategory.hotels}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onRetry={() => {
        fetchCategory('hotels', { force: true }).catch(() => undefined);
      }}
    />
  );
}

const styles = StyleSheet.create({
  filterSection: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  filterChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#1C1917',
    fontWeight: '800',
  },
});
