import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  Search,
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  X,
  Image as ImageIcon,
  Check,
} from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  status: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  readingTime?: number;
}

const SAMPLE_PHOTOS = [
  { label: 'Dubai Superyacht', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85' },
  { label: 'Giza Pyramids', url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=1200&q=85' },
  { label: 'Paris Place Vendôme', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85' },
  { label: 'Swiss Alps Zermatt', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=85' },
  { label: 'Santorini Cliffside', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85' },
  { label: 'Tokyo Skyline', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=85' },
  { label: 'Private Jet Flight', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85' },
];

const CURATED_BLOGS: BlogPostItem[] = [
  {
    id: 'b1',
    slug: 'dubai-luxury-travel-guide',
    title: 'The Dubai Royal Guide: Burj Al Arab & Superyacht Escapes',
    category: 'Luxury Travel',
    author: 'VANIR Editorial',
    status: 'published',
    date: '2026-10-15',
    excerpt: 'Discover ultra-luxury suites overlooking the Arabian Gulf, private Gulfstream arrivals, and bespoke desert dining.',
    content: 'Dubai represents the zenith of modern opulence. From royal duplex residences at Burj Al Arab to chartered superyachts in the Marina, VANIR curates seamless journeys with personal chauffeurs and 24/7 royal butler service.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85',
    readingTime: 5,
  },
  {
    id: 'b2',
    slug: 'egypt-pyramids-nile-cruise-secrets',
    title: 'Secrets of Royal Egypt: After-Hours Pyramids & Nile Palaces',
    category: 'Curated Expeditions',
    author: 'Senior Egyptologist',
    status: 'published',
    date: '2026-10-14',
    excerpt: 'Private sunrise access to the Sphinx, presidential suites at Marriott Mena House, and chartered Nile felucca sailing.',
    content: 'Experience Egypt in imperial privacy. Step inside the Great Pyramid with private gate access before public opening, dine with panoramic views of the Giza Plateau, and cruise the historic Nile aboard exclusive luxury dahabiyas.',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=1200&q=85',
    readingTime: 6,
  },
  {
    id: 'b3',
    slug: 'paris-haute-couture-palaces',
    title: 'Parisian Grandeur: Palace Suites & Private Fashion Salons',
    category: 'European Getaways',
    author: 'VANIR Paris Bureau',
    status: 'published',
    date: '2026-10-10',
    excerpt: 'A stay at Hôtel de Crillon on Place de la Concorde, three-star Michelin gastronomy, and after-hours Louvre access.',
    content: 'Paris embodies timeless elegance. VANIR arranges private after-hours viewings of iconic art collections, chauffeured Bentley transfers along the Seine, and curated reservations at Le Cinq and Jules Verne.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85',
    readingTime: 4,
  },
  {
    id: 'b4',
    slug: 'swiss-alps-helicopter-glaciers',
    title: 'Swiss Alps Luxury: Zermatt Heli-Skiing & Private Chalets',
    category: 'Nature & Mountain',
    author: 'VANIR Alpine Specialist',
    status: 'published',
    date: '2026-10-05',
    excerpt: 'Fly over the Matterhorn by private helicopter, relax in private thermal chalets, and savor glacier champagne fondue.',
    content: 'Zermatt offers world-class alpine luxury. Unwind in ultra-luxury chalets with private in-house chefs, dedicated ski instructors, and panoramic terraces gazing at the majestic Matterhorn peak.',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=85',
    readingTime: 5,
  },
  {
    id: 'b5',
    slug: 'santorini-clifftop-villas',
    title: 'Santorini Romance: Infinity Pools & Caldera Sunsets',
    category: 'Honeymoon & Islands',
    author: 'VANIR Editorial',
    status: 'published',
    date: '2026-09-28',
    excerpt: 'Exclusive clifftop suites carved into volcanic cliffs in Oia with private catamaran sunset charters.',
    content: 'The Cyclades islands at their most breathtaking. Private plunge pools suspended over the Aegean Sea, private wine tastings of indigenous Assyrtiko grapes, and helicopter hops to Mykonos.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85',
    readingTime: 4,
  },
];

export function BlogScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPostItem[]>(CURATED_BLOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // In-App Article Editor Modal State
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Luxury Travel');
  const [editAuthor, setEditAuthor] = useState('VANIR Editorial');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Real-time Firestore sync
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = firestore()
        .collection('blog_posts')
        .onSnapshot(
          snap => {
            if (snap && !snap.empty) {
              const fetched: BlogPostItem[] = [];
              snap.forEach(doc => {
                const d = doc.data();
                fetched.push({
                  id: doc.id,
                  slug: d.slug || doc.id,
                  title: d.title || 'Luxury Travel Dispatch',
                  category: d.category || 'Luxury Travel',
                  author: d.author || 'VANIR Editorial',
                  status: d.status || 'published',
                  date: d.date || '2026',
                  excerpt: d.excerpt || '',
                  content: d.content || d.excerpt || '',
                  image: d.image || '',
                  readingTime: d.readingTime || 5,
                });
              });
              if (fetched.length > 0) {
                setPosts(fetched);
              }
            }
          },
          err => {
            console.warn('[BlogScreen] Firestore sync note:', err?.message);
          }
        );
    } catch {
      // offline fallback
    }
    return () => unsub();
  }, []);

  const openNewArticleEditor = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditCategory('Luxury Travel');
    setEditAuthor('VANIR Editorial');
    setEditExcerpt('');
    setEditContent('');
    setEditImage('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85');
    setShowEditorModal(true);
  };

  const openEditArticle = (post: BlogPostItem) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditCategory(post.category);
    setEditAuthor(post.author);
    setEditExcerpt(post.excerpt);
    setEditContent(post.content);
    setEditImage(post.image || '');
    setShowEditorModal(true);
  };

  const handleSaveArticle = async () => {
    if (!editTitle.trim()) {
      Alert.alert('Required Information', 'Please enter a title for the article.');
      return;
    }
    if (!editExcerpt.trim() && !editContent.trim()) {
      Alert.alert('Required Information', 'Please write article summary or content.');
      return;
    }

    setIsSaving(true);
    const docId = editingPostId || `article-${Date.now().toString(36)}`;
    const slug = editTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || docId;

    const payload = {
      title: editTitle.trim(),
      slug,
      category: editCategory.trim(),
      author: editAuthor.trim() || 'VANIR Editorial',
      excerpt: editExcerpt.trim() || editContent.slice(0, 160),
      content: editContent.trim() || editExcerpt.trim(),
      image: editImage.trim(),
      status: 'published',
      date: new Date().toISOString().split('T')[0],
      readingTime: Math.max(3, Math.ceil((editContent.length || 300) / 400)),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      await firestore().collection('blog_posts').doc(docId).set(payload, { merge: true });

      // Update local state immediately for instant feedback
      setPosts(prev => {
        const existingIdx = prev.findIndex(p => p.id === docId);
        const updatedItem: BlogPostItem = {
          id: docId,
          ...payload,
        };
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = updatedItem;
          return next;
        }
        return [updatedItem, ...prev];
      });

      setShowEditorModal(false);
      Alert.alert('Success', 'Article published to the blog successfully!');
    } catch (err: any) {
      Alert.alert('Save Error', err?.message || 'Unable to save article to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = () => {
    if (!editingPostId) return;
    Alert.alert(
      'Delete Article',
      'Are you sure you want to permanently remove this article from the blog?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('blog_posts').doc(editingPostId).delete();
              setPosts(prev => prev.filter(p => p.id !== editingPostId));
              setShowEditorModal(false);
            } catch (err: any) {
              Alert.alert('Delete Error', err?.message || 'Failed to delete article.');
            }
          },
        },
      ]
    );
  };

  const filteredPosts = useMemo(
    () =>
      posts.filter(p => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }),
    [posts, searchTerm],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#D4AF37" size={22} strokeWidth={2.5} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('screens.blog.title', 'VANIR MAGAZINE')}</Text>
          <Text style={styles.headerSub}>{t('screens.blog.subtitle', 'Curated Luxury Travel & Editorial Guides')}</Text>
        </View>

        {/* Create / Edit Article Action Button */}
        <Pressable
          style={styles.newArticleBtn}
          onPress={openNewArticleEditor}
          accessibilityLabel="Add or Edit Article"
        >
          <Plus color="#1C1917" size={16} strokeWidth={2.6} />
          <Text style={styles.newArticleBtnText}>Write</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Search color="#D4AF37" size={18} />
          <TextInput
            placeholder={t('screens.blog.searchPlaceholder', 'Search articles, destinations, guides...')}
            placeholderTextColor="#78716C"
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Articles List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              onPress={() =>
                navigation.navigate('BlogPost', {
                  slug: item.slug || item.id,
                  title: item.title,
                })
              }
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImage, styles.noImagePlaceholder]}>
                  <ImageIcon color="#94A3B8" size={32} />
                  <Text style={styles.noImageText}>No image attached</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.cardBody}>
              <View style={styles.cardMetaRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category.toUpperCase()}</Text>
                </View>

                {/* Edit Pencil Button */}
                <Pressable
                  style={styles.editCardBtn}
                  onPress={() => openEditArticle(item)}
                  hitSlop={8}
                >
                  <Edit3 color="#D4AF37" size={14} strokeWidth={2} />
                  <Text style={styles.editCardBtnText}>Edit</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() =>
                  navigation.navigate('BlogPost', {
                    slug: item.slug || item.id,
                    title: item.title,
                  })
                }
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardExcerpt} numberOfLines={2}>
                  {item.excerpt}
                </Text>

                <View style={styles.footerRow}>
                  <View style={styles.metaCol}>
                    <Text style={styles.authorText}>By {item.author}</Text>
                    <Text style={styles.readingTime}>{item.readingTime || 5} min read • {item.date}</Text>
                  </View>

                  <View style={styles.readMoreBtn}>
                    <Text style={styles.readMoreText}>Read Article</Text>
                    <ArrowRight color="#D4AF37" size={14} strokeWidth={2.4} />
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Full-Featured Article Editor Modal */}
      <Modal
        visible={showEditorModal}
        animationType="slide"
        onRequestClose={() => setShowEditorModal(false)}
      >
        <SafeAreaView style={styles.editorSafe} edges={['top', 'bottom']}>
          <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

          {/* Editor Header */}
          <View style={styles.editorHeader}>
            <Pressable onPress={() => setShowEditorModal(false)} style={styles.editorCloseBtn}>
              <X color="#D4AF37" size={22} />
            </Pressable>
            <Text style={styles.editorHeaderTitle}>
              {editingPostId ? 'Edit Article & Photo' : 'Create New Article'}
            </Text>
            <Pressable
              style={[styles.editorSaveBtn, isSaving && { opacity: 0.6 }]}
              onPress={handleSaveArticle}
              disabled={isSaving}
            >
              <Check color="#1C1917" size={16} strokeWidth={2.8} />
              <Text style={styles.editorSaveBtnText}>Publish</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.editorScroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Input */}
            <Text style={styles.editorLabel}>ARTICLE TITLE</Text>
            <TextInput
              style={styles.editorInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="e.g. Royal Escapes in Monaco & French Riviera"
              placeholderTextColor="#94A3B8"
            />

            {/* Category Selector */}
            <Text style={[styles.editorLabel, { marginTop: 14 }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {['Luxury Travel', 'Curated Expeditions', 'Private Aviation', 'Superyachts', 'European Getaways'].map(cat => (
                <Pressable
                  key={cat}
                  style={[styles.categoryChip, editCategory === cat && styles.categoryChipActive]}
                  onPress={() => setEditCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, editCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Author Input */}
            <Text style={[styles.editorLabel, { marginTop: 14 }]}>AUTHOR NAME</Text>
            <TextInput
              style={styles.editorInput}
              value={editAuthor}
              onChangeText={setEditAuthor}
              placeholder="e.g. VANIR Editorial Board"
              placeholderTextColor="#94A3B8"
            />

            {/* Photo Section with Remove & Change */}
            <Text style={[styles.editorLabel, { marginTop: 14 }]}>ARTICLE FEATURED PHOTO</Text>
            {editImage ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: editImage }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.previewActionsRow}>
                  <Pressable style={styles.removePhotoBtn} onPress={() => setEditImage('')}>
                    <Trash2 color="#EF4444" size={14} strokeWidth={2} />
                    <Text style={styles.removePhotoText}>Remove Photo</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.noPhotoBox}>
                <ImageIcon color="#94A3B8" size={30} />
                <Text style={styles.noPhotoText}>No photo selected</Text>
              </View>
            )}

            {/* Custom Photo URL Input */}
            <Text style={[styles.editorLabel, { marginTop: 10 }]}>IMAGE URL</Text>
            <TextInput
              style={styles.editorInput}
              value={editImage}
              onChangeText={setEditImage}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Quick Luxury Presets */}
            <Text style={[styles.editorLabel, { marginTop: 10 }]}>CHOOSE PRESET PHOTO:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
              {SAMPLE_PHOTOS.map(p => (
                <Pressable
                  key={p.label}
                  style={[styles.presetPhotoChip, editImage === p.url && styles.presetPhotoChipActive]}
                  onPress={() => setEditImage(p.url)}
                >
                  <Text style={[styles.presetPhotoText, editImage === p.url && styles.presetPhotoTextActive]}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Excerpt Input */}
            <Text style={[styles.editorLabel, { marginTop: 16 }]}>SHORT SUMMARY / EXCERPT</Text>
            <TextInput
              style={[styles.editorInput, { minHeight: 60 }]}
              value={editExcerpt}
              onChangeText={setEditExcerpt}
              placeholder="Brief summary displayed on card list..."
              placeholderTextColor="#94A3B8"
              multiline
            />

            {/* Full Body Content */}
            <Text style={[styles.editorLabel, { marginTop: 16 }]}>FULL ARTICLE CONTENT</Text>
            <TextInput
              style={[styles.editorInput, { minHeight: 140, textAlignVertical: 'top' }]}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Write the full editorial piece here..."
              placeholderTextColor="#94A3B8"
              multiline
            />

            {/* Delete Article Button (if editing existing) */}
            {editingPostId && (
              <Pressable style={styles.deleteArticleBtn} onPress={handleDeleteArticle}>
                <Trash2 color="#EF4444" size={16} strokeWidth={2} />
                <Text style={styles.deleteArticleText}>Delete Article from Blog</Text>
              </Pressable>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: '#FAF9F6',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  newArticleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  newArticleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1917',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  noImagePlaceholder: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },
  cardBody: {
    padding: 16,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  editCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FAF9F6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  editCardBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4AF37',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    lineHeight: 22,
    marginBottom: 6,
  },
  cardExcerpt: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  metaCol: {
    flex: 1,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  readingTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },

  // Editor Modal Styles
  editorSafe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  editorCloseBtn: {
    padding: 6,
  },
  editorHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
  },
  editorSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  editorSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  editorScroll: {
    padding: 16,
  },
  editorLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  editorInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1917',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#1C1917',
    borderColor: '#1C1917',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#D4AF37',
  },
  previewBox: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 160,
  },
  previewActionsRow: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  noPhotoBox: {
    height: 90,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  noPhotoText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  presetScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  presetPhotoChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetPhotoChipActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  presetPhotoText: {
    fontSize: 11,
    color: '#1C1917',
  },
  presetPhotoTextActive: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  deleteArticleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteArticleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
});
