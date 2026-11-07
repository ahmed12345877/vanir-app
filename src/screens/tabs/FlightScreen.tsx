import React, { useState } from 'react';
import { StyleSheet, Text, View, I18nManager, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

export function FlightScreen() {
  const { t } = useTranslation();
  const [guests, setGuests] = useState('');

  const handleSearch = () => {
    Alert.alert('Search', `Searching for flights for ${guests} guests.`);
  };

  return (
    <Screen title={t('screens.flightCatalog.title')}>
      <View style={styles.container}>
        <Text style={styles.label}>{t('screens.flightCatalog.guestsLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('screens.flightCatalog.guestsPlaceholder')}
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={guests}
          onChangeText={setGuests}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>{t('screens.flightCatalog.searchButton')}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing[4],
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing[3],
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    marginBottom: spacing[5],
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
