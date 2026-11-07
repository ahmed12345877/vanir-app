import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search, Plane, Car, Sparkles } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import type { BookingCategory } from './CategorySwitcher';

interface SearchCardProps {
  category: BookingCategory;
  onSearch: (params: SearchParams) => void;
}

export interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  category: BookingCategory;
}

const DEFAULT_FLIGHT_GUESTS = 1;
const DEFAULT_BOOKING_GUESTS = 2;

export function SearchCard({ category, onSearch }: SearchCardProps) {
  const [destination, setDestination] = useState('');
  const isFlights = category === 'flights';
  const isCars = category === 'cars';
  const isAI = category === 'ai-studio';
  const guests = isFlights ? DEFAULT_FLIGHT_GUESTS : DEFAULT_BOOKING_GUESTS;

  const destPlaceholder = isFlights
    ? 'Search destinations, tours, packages...'
    : isCars
    ? 'Search destinations, tours, packages...'
    : isAI
    ? 'Where would you like to go?'
    : 'Search destinations, tours, packages...';

  const IconComponent = isFlights ? Plane : isCars ? Car : isAI ? Sparkles : Search;

  return (
    <View style={styles.card}>
      <View style={styles.field}>
        <IconComponent color={colors.primary} size={20} strokeWidth={1.5} />
        <TextInput
          style={styles.input}
          value={destination}
          onChangeText={setDestination}
          placeholder={destPlaceholder}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
        />
        <Pressable
          style={styles.toFindBtn}
          onPress={() => onSearch({ destination, checkIn: '', checkOut: '', guests, category })}>
          <Text style={styles.toFindText}>{isAI ? 'ASK AI CONCIERGE' : 'TO FIND'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginHorizontal: spacing[5],
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing[4],
    paddingRight: spacing[2],
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    paddingVertical: spacing[3],
  },
  toFindBtn: {
    backgroundColor: colors.cyan,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  toFindText: {
    color: colors.textOnCyan,
    fontWeight: '700',
    fontSize: 12,
  },
});
