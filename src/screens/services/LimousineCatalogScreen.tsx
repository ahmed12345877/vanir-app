import React, { useEffect } from 'react';
import { Car } from 'lucide-react-native';
import { CatalogListScreen } from '../../components/CatalogListScreen';
import { useCatalogStore } from '../../context/CatalogStore';
import { useTheme } from '../../context/ThemeContext';

export function LimousineCatalogScreen() {
  const { colors } = useTheme();
  const { itemsByCategory, loadingByCategory, errorsByCategory, fetchCategory } = useCatalogStore();

  useEffect(() => {
    fetchCategory('limousines').catch(() => undefined);
  }, [fetchCategory]);

  return (
    <CatalogListScreen
      title="CHAUFFEUR & EXECUTIVE LIMOUSINES"
      subtitle="20 premium luxury vehicles with professional private chauffeurs"
      headerIcon={<Car color={colors.primary} size={24} strokeWidth={1.5} />}
      headerGradient={[colors.gradientCatalogHeader, colors.background]}
      items={itemsByCategory.limousines}
      bookingType="limousine"
      isLoading={loadingByCategory.limousines}
      errorMessage={errorsByCategory.limousines}
      onRetry={() => {
        fetchCategory('limousines', { force: true }).catch(() => undefined);
      }}
    />
  );
}
