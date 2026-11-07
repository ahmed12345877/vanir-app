import React, { useEffect } from 'react';
import { Globe } from 'lucide-react-native';
import { CatalogListScreen } from '../../components/CatalogListScreen';
import { useCatalogStore } from '../../context/CatalogStore';
import { useTheme } from '../../context/ThemeContext';

export function ESIMCatalogScreen() {
  const { colors } = useTheme();
  const { itemsByCategory, loadingByCategory, errorsByCategory, fetchCategory } = useCatalogStore();

  useEffect(() => {
    fetchCategory('esims').catch(() => undefined);
  }, [fetchCategory]);

  return (
    <CatalogListScreen
      title="GLOBAL HIGH-SPEED eSIM"
      subtitle="20 premium international high-speed roaming data packages"
      headerIcon={<Globe color={colors.primary} size={24} strokeWidth={1.5} />}
      headerGradient={[colors.gradientCatalogHeader, colors.background]}
      items={itemsByCategory.esims}
      bookingType="esim"
      isLoading={loadingByCategory.esims}
      errorMessage={errorsByCategory.esims}
      onRetry={() => {
        fetchCategory('esims', { force: true }).catch(() => undefined);
      }}
    />
  );
}
