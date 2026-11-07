import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
  Compass,
  Search,
  Globe,
} from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';
import {
  getLiveDestinations,
  subscribeLiveDestinations,
  type LiveDestinationItem,
} from '../../services/firestore';
import { LuxuryPressable } from '../../components/LuxuryMicroInteractions';
import { getLocalizedDestination } from '../../utils/destinationUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DestinationsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [destinations, setDestinations] = useState<LiveDestinationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getLiveDestinations().then(setDestinations);
    const unsub = subscribeLiveDestinations(items => {
      if (items && items.length > 0) {
        setDestinations(items);
      }
    });
    return () => unsub();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const items = await getLiveDestinations();
    setDestinations(items);
    setRefreshing(false);
  };

  const REGIONS = useMemo(() => [
    { key: 'all', label: `${t('screens.destinations.all', 'All Destinations')} 🌍` },
    { key: 'europe', label: `${t('screens.destinations.europe', 'Europe & Schengen')} 🇪🇺` },
    { key: 'greece', label: `${t('screens.destinations.greece', 'Greece')} 🇬🇷` },
    { key: 'turkey', label: `${t('screens.destinations.turkey', 'Turkey')} 🇹🇷` },
    { key: 'gulf', label: `${t('screens.destinations.gulf', 'Arabian Gulf')} 🇦🇪` },
    { key: 'islands', label: `${t('screens.destinations.islands', 'Islands & Maldives')} 🇲🇻` },
  ], [t]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter(d => {
      const localized = getLocalizedDestination(d, i18n.language);
      const combined = `${d.name} ${d.country} ${localized.name} ${localized.country} ${localized.filterQuery}`.toLowerCase();

      const matchQuery =
        !searchQuery.trim() ||
        combined.includes(searchQuery.toLowerCase());

      if (!matchQuery) return false;

      if (selectedRegion === 'all') return true;
      if (selectedRegion === 'europe') {
        return (
          localized.region === 'europe' ||
          combined.includes('france') ||
          combined.includes('paris') ||
          combined.includes('italy') ||
          combined.includes('rome') ||
          combined.includes('switzerland') ||
          combined.includes('london') ||
          combined.includes('uk') ||
          combined.includes('فرنسا') ||
          combined.includes('إيطاليا') ||
          combined.includes('سويسرا') ||
          combined.includes('لندن')
        );
      }
      if (selectedRegion === 'greece') {
        return (
          localized.region === 'greece' ||
          combined.includes('greece') ||
          combined.includes('athens') ||
          combined.includes('santorini') ||
          combined.includes('mykonos') ||
          combined.includes('يونان') ||
          combined.includes('أثينا') ||
          combined.includes('سانتوريني')
        );
      }
      if (selectedRegion === 'turkey') {
        return (
          localized.region === 'turkey' ||
          combined.includes('turkey') ||
          combined.includes('istanbul') ||
          combined.includes('bodrum') ||
          combined.includes('تركيا') ||
          combined.includes('إسطنبول') ||
          combined.includes('بودروم')
        );
      }
      if (selectedRegion === 'gulf') {
        return (
          localized.region === 'gulf' ||
          combined.includes('uae') ||
          combined.includes('dubai') ||
          combined.includes('emirates') ||
          combined.includes('saudi') ||
          combined.includes('qatar') ||
          combined.includes('دبي') ||
          combined.includes('إمارات') ||
          combined.includes('الخليج')
        );
      }
      if (selectedRegion === 'islands') {
        return (
          localized.region === 'islands' ||
          combined.includes('maldives') ||
          combined.includes('مالديف') ||
          combined.includes('island')
        );
      }
      return true;
    });
  }, [destinations, searchQuery, selectedRegion, i18n.language]);

  const handleDestinationPress = (item: LiveDestinationItem) => {
    const localized = getLocalizedDestination(item, i18n.language);
    // Open complete bespoke travel programs and packages instead of generic hotels
    navigation.navigate('Tours', {
      initialCategory: 'packages',
      destinationQuery: localized.filterQuery,
      destinationTitle: localized.name,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.backBtn}
          >
            <ChevronLeft color="#D4AF37" size={24} />
          </Pressable>

          <View style={styles.headerTitles}>
            <View style={styles.goldBadgeRow}>
              <Compass color="#D4AF37" size={12} />
              <Text style={styles.goldBadgeText}>{t('portals.destinationsBadge', 'GLOBAL CITIES')}</Text>
            </View>
            <Text style={styles.headerTitle}>{t('screens.destinations.title', 'World Destinations & Cities')}</Text>
          </View>
        </View>

        {/* Search input */}
        <View style={styles.searchBox}>
          <Search color="#D4AF37" size={18} />
          <TextInput
            placeholder={t('screens.destinations.searchPlaceholder', 'Search city, country or island...')}
            placeholderTextColor="#78716C"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Region filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={REGIONS}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.chipsContainer}
          renderItem={({ item }) => {
            const active = selectedRegion === item.key;
            return (
              <Pressable
                onPress={() => setSelectedRegion(item.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Destination List */}
      <FlatList
        data={filteredDestinations}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 32 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
        }
        renderItem={({ item }) => {
          const localized = getLocalizedDestination(item, i18n.language);
          return (
            <LuxuryPressable
              onPress={() => handleDestinationPress(item)}
              style={styles.card}
            >
              <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(28, 25, 23, 0.45)', 'rgba(28, 25, 23, 0.92)']}
                style={styles.cardGradient}
              />

              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{localized.status}</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statBadge}>
                      <Building color="#D4AF37" size={12} />
                      <Text style={styles.statBadgeText}>{item.hotels || 24} {t('categories.hotels', 'Hotels')}</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Sparkles color="#D4AF37" size={12} />
                      <Text style={styles.statBadgeText}>{item.packages || 12} {t('screens.tours.packages', 'Packages')}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.destName}>{localized.name}</Text>
                    <View style={styles.locationRow}>
                      <MapPin color="#D4AF37" size={13} />
                      <Text style={styles.locationText}>{localized.country}</Text>
                    </View>
                  </View>

                  <View style={styles.exploreCircle}>
                    <ArrowRight color="#1C1917" size={18} strokeWidth={2.4} />
                  </View>
                </View>
              </View>
            </LuxuryPressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Globe color="#D4AF37" size={48} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>{t('screens.destinations.empty', 'No destinations match your search')}</Text>
            <Text style={styles.emptySubtitle}>Try searching another city or select all destinations</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitles: {
    flex: 1,
  },
  goldBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  goldBadgeText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: '#1C1917',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#1C1917',
    fontSize: 13,
  },
  chipsContainer: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  chipActive: {
    backgroundColor: '#FFFDF5',
    borderColor: '#D4AF37',
    borderWidth: 1.5,
  },
  chipText: {
    color: '#78716C',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#B45309',
    fontWeight: '800',
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  card: {
    height: 230,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    backgroundColor: 'rgba(250, 249, 246, 0.92)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    color: '#B45309',
    fontSize: 10.5,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(28, 25, 23, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statBadgeText: {
    color: '#FAF9F6',
    fontSize: 10,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  destName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    color: '#FAF7EE',
    fontSize: 12,
    fontWeight: '600',
  },
  exploreCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#1C1917',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#78716C',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
});
