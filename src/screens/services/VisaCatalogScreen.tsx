import React, { useEffect } from 'react';
import { FileText } from 'lucide-react-native';
import { CatalogListScreen } from '../../components/CatalogListScreen';
import { useCatalogStore } from '../../context/CatalogStore';
import { useTheme } from '../../context/ThemeContext';

export function VisaCatalogScreen() {
  const { colors } = useTheme();
  const { itemsByCategory, loadingByCategory, errorsByCategory, fetchCategory } = useCatalogStore();

  useEffect(() => {
    fetchCategory('visas').catch(() => undefined);
  }, [fetchCategory]);

  return (
    <CatalogListScreen
      title="VISA SERVICES"
      subtitle="20 destinations with expert visa processing"
      headerIcon={<FileText color={colors.primary} size={24} strokeWidth={1.5} />}
      headerGradient={[colors.gradientCatalogHeader, colors.background]}
      items={itemsByCategory.visas}
      bookingType="visa"
      isLoading={loadingByCategory.visas}
      errorMessage={errorsByCategory.visas}
      onRetry={() => {
        fetchCategory('visas', { force: true }).catch(() => undefined);
      }}
    />
  );
}
