
import React, { useState } from 'react';
import {
  FlatList,
  I18nManager,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { AirlineLogo } from '../../components/AirlineLogos';

const FLIGHTS_DATA = [
  {
    id: '1',
    from: 'JFK',
    to: 'LAX',
    departureTime: '08:30 PM',
    arrivalTime: '11:00 PM',
    duration: '5h 30m',
    price: '289',
    airline: 'Delta Air Lines',
    airlineCode: 'DL',
  },
  {
    id: '2',
    from: 'JFK',
    to: 'LAX',
    departureTime: '09:00 PM',
    arrivalTime: '11:30 PM',
    duration: '5h 30m',
    price: '312',
    airline: 'American Airlines',
    airlineCode: 'AA',
  },
  {
    id: '3',
    from: 'JFK',
    to: 'LAX',
    departureTime: '10:15 PM',
    arrivalTime: '12:45 AM',
    duration: '5h 30m',
    price: '275',
    airline: 'United Airlines',
    airlineCode: 'UA',
  },
];

const FlightCard = ({ flight }: { flight: any }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <AirlineLogo airline={flight.airline} iata={flight.airlineCode} size={36} />
        <View style={styles.flightRoute}>
          <Text style={styles.flightAirport}>{flight.from}</Text>
          <View style={styles.flightPath} />
          <Text style={styles.flightAirport}>{flight.to}</Text>
        </View>
        <Text style={styles.flightPrice}>${flight.price}</Text>
      </View>
      <View style={styles.cardBody}>
        <View>
          <Text style={styles.flightTimeLabel}>{t('screens.flightSearch.departure')}</Text>
          <Text style={styles.flightTimeValue}>{flight.departureTime}</Text>
        </View>
        <View style={styles.flightDurationContainer}>
          <Text style={styles.flightDuration}>{flight.duration}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.flightTimeLabel}>{t('screens.flightSearch.to')}</Text>
          <Text style={styles.flightTimeValue}>{flight.arrivalTime}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>{t('screens.flightSearch.bookNow')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export function FlightSearchScreen() {
  const { t } = useTranslation();
  const [from, setFrom] = useState('NYC');
  const [to, setTo] = useState('LON');

  return (
    <Screen title={t('screens.flightSearch.title')}>
      <View style={styles.searchContainer}>
        <View style={styles.inputRow}>
          <TextInput
            placeholder={t('screens.flightSearch.from')}
            style={styles.input}
            value={from}
            onChangeText={setFrom}
          />
          <TextInput
            placeholder={t('screens.flightSearch.to')}
            style={styles.input}
            value={to}
            onChangeText={setTo}
          />
        </View>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.inputButton}>
            <Text>{t('screens.flightSearch.departure')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton}>
            <Text>{t('screens.flightSearch.pax')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>{t('screens.flightSearch.searchFlights')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.compareTitle}>{t('screens.flightSearch.compareFlights')}</Text>
      <FlatList
        data={FLIGHTS_DATA}
        renderItem={({ item }) => <FlightCard flight={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: colors.surface,
    padding: spacing[4],
    margin: spacing[4],
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginHorizontal: spacing[1],
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  inputButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginHorizontal: spacing[1],
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing[2],
  },
  searchButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  compareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[2],
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  listContainer: {
    paddingHorizontal: spacing[4],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  airlineLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  flightRoute: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing[3],
  },
  flightAirport: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  flightPath: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing[2],
  },
  flightPrice: {
    fontWeight: 'bold',
    fontSize: 20,
    color: colors.primary,
  },
  cardBody: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  flightTimeLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  flightTimeValue: {
    fontWeight: '500',
    fontSize: 14,
  },
  flightDurationContainer: {
    alignItems: 'center',
  },
  flightDuration: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  bookButton: {
    backgroundColor: colors.primaryMuted,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bookButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

