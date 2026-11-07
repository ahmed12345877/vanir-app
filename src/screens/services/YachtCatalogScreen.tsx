import React, { useEffect } from 'react';
import { Anchor } from 'lucide-react-native';
import { CatalogListScreen } from '../../components/CatalogListScreen';
import { useCatalogStore } from '../../context/CatalogStore';
import { useTheme } from '../../context/ThemeContext';

export function YachtCatalogScreen() {
  const { colors } = useTheme();
  const { itemsByCategory, loadingByCategory, errorsByCategory, fetchCategory } = useCatalogStore();

  useEffect(() => {
    fetchCategory('yachts').catch(() => undefined);
  }, [fetchCategory]);

  return (
    <CatalogListScreen
      title="LUXURY SUPERYACHTS"
      subtitle="20 prestigious superyachts available across Mediterranean, Dubai & Red Sea"
      headerIcon={<Anchor color={colors.primary} size={24} strokeWidth={1.5} />}
      headerGradient={[colors.gradientCatalogHeader, colors.background]}
      items={itemsByCategory.yachts}
      bookingType="yacht"
      isLoading={loadingByCategory.yachts}
      errorMessage={errorsByCategory.yachts}
      onRetry={() => {
        fetchCategory('yachts', { force: true }).catch(() => undefined);
      }}
    />
  );
}
