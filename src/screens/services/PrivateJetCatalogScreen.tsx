import React, { useEffect } from 'react';
import { Navigation } from 'lucide-react-native';
import { CatalogListScreen } from '../../components/CatalogListScreen';
import { useCatalogStore } from '../../context/CatalogStore';
import { useTheme } from '../../context/ThemeContext';

export function PrivateJetCatalogScreen() {
  const { colors } = useTheme();
  const { itemsByCategory, loadingByCategory, errorsByCategory, fetchCategory } = useCatalogStore();

  useEffect(() => {
    fetchCategory('jets').catch(() => undefined);
  }, [fetchCategory]);

  return (
    <CatalogListScreen
      title="PRIVATE JET"
      subtitle="20 exclusive aviation charters worldwide"
      headerIcon={<Navigation color={colors.primary} size={24} strokeWidth={1.5} />}
      headerGradient={[colors.gradientCatalogHeader, colors.background]}
      items={itemsByCategory.jets}
      bookingType="private-jet"
      isLoading={loadingByCategory.jets}
      errorMessage={errorsByCategory.jets}
      onRetry={() => {
        fetchCategory('jets', { force: true }).catch(() => undefined);
      }}
    />
  );
}
