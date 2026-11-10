import React, { useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { CarGalleryPhoto, CarCategorizedGallery } from '../services/carGalleryBank';
import { LuxuryPressable } from './LuxuryMicroInteractions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CarPhotoGalleryModalProps {
  visible: boolean;
  gallery: CarCategorizedGallery;
  initialIndex?: number;
  onClose: () => void;
}

type CategoryKey = 'all' | 'exterior' | 'interior' | 'cockpit' | 'details';

const CATEGORY_TABS: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'All Photos' },
  { key: 'exterior', label: 'Exterior' },
  { key: 'interior', label: 'Executive Interior' },
  { key: 'cockpit', label: 'Cockpit' },
  { key: 'details', label: 'Luxury Details' },
];

export function CarPhotoGalleryModal({
  visible,
  gallery,
  initialIndex = 0,
  onClose,
}: CarPhotoGalleryModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activePhotos: CarGalleryPhoto[] = useMemo(() => {
    if (selectedCategory === 'all') return gallery.all;
    if (selectedCategory === 'exterior') return gallery.exterior;
    if (selectedCategory === 'interior') return gallery.interior;
    if (selectedCategory === 'cockpit') return gallery.cockpit;
    if (selectedCategory === 'details') return gallery.details;
    return gallery.all;
  }, [gallery, selectedCategory]);

  const countsByCategory = useMemo(() => {
    return {
      all: gallery.all.length,
      exterior: gallery.exterior.length,
      interior: gallery.interior.length,
      cockpit: gallery.cockpit.length,
      details: gallery.details.length,
    };
  }, [gallery]);

  const handleOpenPhoto = (photo: CarGalleryPhoto) => {
    const idx = gallery.all.findIndex(p => p.url === photo.url);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const handleNextPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % gallery.all.length);
  };

  const handlePrevPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === 0 ? gallery.all.length - 1 : lightboxIndex - 1);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Top Header */}
        <View style={styles.topHeader}>
          <LuxuryPressable style={styles.circleBtn} onPress={onClose} accessibilityLabel="Close Gallery">
            <X color="#1C1917" size={20} strokeWidth={2.4} />
          </LuxuryPressable>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {gallery.carName}
            </Text>
            <View style={styles.photoCountPill}>
              <ImageIcon color="#D4AF37" size={13} strokeWidth={2} />
              <Text style={styles.photoCountText}>{gallery.totalCount} High-Definition Photos</Text>
            </View>
          </View>

          <View style={styles.rightPlaceholder} />
        </View>

        {/* Category Horizontal Filter Pills */}
        <View style={styles.categoryBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORY_TABS.map(tab => {
              const isSelected = selectedCategory === tab.key;
              const count = countsByCategory[tab.key] || 0;
              if (count === 0 && tab.key !== 'all') return null;

              return (
                <Pressable
                  key={tab.key}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(tab.key)}
                >
                  <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                    {tab.label}
                  </Text>
                  <View style={[styles.pillBadge, isSelected && styles.pillBadgeActive]}>
                    <Text style={[styles.pillBadgeText, isSelected && styles.pillBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 2-Column Photo Grid */}
        <FlatList
          data={activePhotos}
          keyExtractor={item => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.gridList, { paddingBottom: insets.bottom + 24 }]}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              style={styles.gridCard}
              onPress={() => handleOpenPhoto(item)}
              accessibilityLabel={item.title}
            >
              <Image source={{ uri: item.url }} style={styles.gridImage} resizeMode="cover" />
              <View style={styles.gridOverlay}>
                <Text style={styles.gridPhotoTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
            </Pressable>
          )}
        />

        {/* Fullscreen Lightbox Light/Dark Viewer */}
        {lightboxIndex !== null && (
          <Modal
            visible={true}
            transparent={false}
            animationType="fade"
            onRequestClose={() => setLightboxIndex(null)}
          >
            <View style={styles.lightboxContainer}>
              <StatusBar barStyle="light-content" backgroundColor="#000000" />

              {/* Lightbox Top Controls */}
              <View style={[styles.lightboxHeader, { paddingTop: Math.max(insets.top, 16) }]}>
                <LuxuryPressable
                  style={styles.lightboxCloseBtn}
                  onPress={() => setLightboxIndex(null)}
                  accessibilityLabel="Close Lightbox"
                >
                  <X color="#FFFFFF" size={20} strokeWidth={2.4} />
                </LuxuryPressable>

                <View style={styles.lightboxCounterBadge}>
                  <Text style={styles.lightboxCounterText}>
                    {lightboxIndex + 1} / {gallery.all.length}
                  </Text>
                </View>

                <View style={{ width: 40 }} />
              </View>

              {/* Central Active Photo */}
              <View style={styles.lightboxImageWrapper}>
                <Image
                  source={{ uri: gallery.all[lightboxIndex]?.url }}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />

                <LuxuryPressable
                  style={styles.lightboxArrowLeft}
                  onPress={handlePrevPhoto}
                  accessibilityLabel="Previous Photo"
                >
                  <ChevronLeft color="#FFFFFF" size={26} strokeWidth={2.6} />
                </LuxuryPressable>

                <LuxuryPressable
                  style={styles.lightboxArrowRight}
                  onPress={handleNextPhoto}
                  accessibilityLabel="Next Photo"
                >
                  <ChevronRight color="#FFFFFF" size={26} strokeWidth={2.6} />
                </LuxuryPressable>
              </View>

              {/* Bottom Caption & Thumbnails Strip */}
              <View style={[styles.lightboxFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Text style={styles.lightboxTitle}>
                  {gallery.all[lightboxIndex]?.title}
                </Text>
                {gallery.all[lightboxIndex]?.caption && (
                  <Text style={styles.lightboxCaption}>
                    {gallery.all[lightboxIndex]?.caption}
                  </Text>
                )}

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.lightboxThumbsScroll}
                >
                  {gallery.all.map((p, idx) => {
                    const isCur = idx === lightboxIndex;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => setLightboxIndex(idx)}
                        style={[styles.miniThumb, isCur && styles.miniThumbActive]}
                      >
                        <Image source={{ uri: p.url }} style={styles.miniThumbImg} />
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
  },
  photoCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  photoCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
  },
  rightPlaceholder: {
    width: 40,
  },
  categoryBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryScroll: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: '#0A0A0A',
    borderColor: '#D4AF37',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pillBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  pillBadgeActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  pillBadgeTextActive: {
    color: '#D4AF37',
  },
  gridList: {
    padding: 12,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridCard: {
    width: (SCREEN_WIDTH - 34) / 2,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  gridPhotoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  lightboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  lightboxCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxCounterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  lightboxCounterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lightboxImageWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.65,
  },
  lightboxArrowLeft: {
    position: 'absolute',
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxArrowRight: {
    position: 'absolute',
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxFooter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  lightboxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  lightboxCaption: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
  },
  lightboxThumbsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  miniThumb: {
    width: 52,
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    opacity: 0.5,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  miniThumbActive: {
    opacity: 1,
    borderColor: '#D4AF37',
  },
  miniThumbImg: {
    width: '100%',
    height: '100%',
  },
});
