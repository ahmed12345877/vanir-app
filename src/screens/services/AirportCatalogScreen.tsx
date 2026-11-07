import React, { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { CatalogListScreen } from '../../components/CatalogListScreen';
import { useCatalogStore } from '../../context/CatalogStore';
import { useTheme } from '../../context/ThemeContext';

export function AirportCatalogScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { itemsByCategory, loadingByCategory, errorsByCategory, fetchCategory } = useCatalogStore();

  useEffect(() => {
    fetchCategory('airports').catch(() => undefined);
  }, [fetchCategory]);

  return (
    <CatalogListScreen
      title={t('screens.airportCatalog.title')}
      subtitle={t('screens.airportCatalog.subtitle')}
      headerIcon={<ShieldCheck color={colors.primary} size={24} strokeWidth={1.5} />}
      headerGradient={[colors.gradientCatalogHeader, colors.background]}
      items={itemsByCategory.airports}
      bookingType="airport-fasttrack"
      isLoading={loadingByCategory.airports}
      errorMessage={errorsByCategory.airports}
      onRetry={() => {
        fetchCategory('airports', { force: true }).catch(() => undefined);
      }}
    />
  );
}
