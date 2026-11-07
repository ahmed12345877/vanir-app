import React from 'react';
import { FlatList, StyleSheet, Text, View, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

const AIRPORTS = [
  { code: 'JFK', name: 'New York' },  { code: 'LAX', name: 'Los Angeles' },
  { code: 'LHR', name: 'London' },    { code: 'CDG', name: 'Paris' },
  { code: 'HND', name: 'Tokyo' },     { code: 'DXB', name: 'Dubai' },
  { code: 'AMS', name: 'Amsterdam' }, { code: 'FRA', name: 'Frankfurt' },
  { code: 'SIN', name: 'Singapore' }, { code: 'ICN', name: 'Seoul' },
  { code: 'HKG', name: 'Hong Kong' }, { code: 'SYD', name: 'Sydney' },
  { code: 'YYZ', name: 'Toronto' },   { code: 'BCN', name: 'Barcelona' },
  { code: 'FCO', name: 'Rome' },      { code: 'MUC', name: 'Munich' },
  { code: 'ZRH', name: 'Zurich' },    { code: 'VIE', name: 'Vienna' },
  { code: 'CPT', name: 'Cape Town' }, { code: 'CAI', name: 'Cairo' },
];

function AirportCard({ item }: { item: { code: string; name: string } }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardCode}>{item.code}</Text>
      <Text style={styles.cardName}>{item.name}</Text>
    </View>
  );
}

export function AirportScreen() {
  const { t } = useTranslation();

  return (
    <Screen
      title={t('screens.airportCatalog.title')}
      subtitle={t('screens.airportCatalog.subtitle')}
    >
      <FlatList
        data={AIRPORTS}
        renderItem={({ item }) => <AirportCard item={item} />}
        keyExtractor={item => item.code}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={I18nManager.isRTL ? styles.rowReverse : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: spacing[4],
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    margin: spacing[2],
    alignItems: 'center',
  },
  cardCode: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  cardName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
});
