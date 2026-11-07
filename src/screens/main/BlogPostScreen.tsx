import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Clock, Calendar, User, Share2 } from 'lucide-react-native';
import firestore from '@react-native-firebase/firestore';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BlogPost'>;

type BlogPost = {
  title: string;
  excerpt: string;
  content: string;
  category?: string;
  author?: string;
  readingTime?: number | null;
  date?: string | null;
  image?: string;
};

const DEFAULT_POSTS: Record<string, BlogPost> = {
  'dubai-luxury-travel-guide': {
    title: 'The Dubai Royal Guide: Burj Al Arab & Superyacht Escapes',
    category: 'Luxury Travel',
    author: 'VANIR Editorial',
    readingTime: 5,
    date: 'October 15, 2026',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85',
    excerpt: 'Discover ultra-luxury suites overlooking the Arabian Gulf, private Gulfstream arrivals, and bespoke desert dining.',
    content: `Dubai represents the pinnacle of contemporary opulence. From royal duplex suites at Burj Al Arab to chartered superyachts along Dubai Marina and the Palm Jumeirah, VANIR curates seamless journeys tailored for discerning executives and royalty.\n\nUpon landing at Al Maktoum or Dubai International, guests are escorted directly from the aircraft to the private VIP Majlis lounge, where customs and luggage handling are managed discreetly. A chauffeured Rolls-Royce Phantom or armored Mercedes-Benz S-Class ensures an effortless transfer to your private villa or presidential suite.\n\nOur private aviation wing coordinates seamless helicopter excursions to the desert dunes of Bab Al Shams, where bespoke five-course dinners are prepared under the starlight by private Michelin-starred chefs.`,
  },
  'egypt-pyramids-nile-cruise-secrets': {
    title: 'Secrets of Royal Egypt: After-Hours Pyramids & Nile Palaces',
    category: 'Curated Expeditions',
    author: 'Senior Egyptologist',
    readingTime: 6,
    date: 'October 14, 2026',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c0e?w=1200&q=85',
    excerpt: 'Private sunrise access to the Sphinx, presidential suites at Marriott Mena House, and chartered Nile felucca sailing.',
    content: `Egypt is a land where ancient eternity meets boundless grandeur. For centuries, royalty, artists, and heads of state have journeyed to the Nile valley to witness monuments that defy time itself.\n\nWith VANIR's royal arrangements, our clients bypass all public hours. At 6:00 AM, the gates to the Giza Plateau open exclusively for you. Stand between the paws of the Great Sphinx in utter tranquility while the morning sun bathes the pyramid summits in golden light, accompanied by our leading Egyptologist.\n\nIn Cairo, stay in the historical Palace wing of the Marriott Mena House, waking up to the Great Pyramid filling your suite window. Continue your voyage south aboard a private chartered dahabiya, gliding quietly along the timeless Nile between Luxor and Aswan with private on-board culinary chefs and musicians.`,
  },
};

export function BlogPostScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const slug = route.params.slug;
  const [post, setPost] = useState<BlogPost | null>(DEFAULT_POSTS[slug] || null);

  const fallbackTitle =
    route.params.title ||
    slug
      .split('-')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  useEffect(() => {
    let isMounted = true;
    async function loadPost() {
      try {
        // 1. Try fetching by doc ID first
        const docSnap = await firestore().collection('blog_posts').doc(slug).get();
        const doesExist = typeof docSnap.exists === 'function' ? docSnap.exists() : Boolean(docSnap.exists);
        if (doesExist) {
          const d = docSnap.data();
          if (isMounted && d) {
            setPost({
              title: d.title || fallbackTitle,
              category: d.category || 'Luxury Travel',
              author: d.author || 'VANIR Editorial',
              readingTime: d.readingTime || 5,
              date: d.date || '2026',
              image: d.image || undefined,
              excerpt: d.excerpt || '',
              content: d.content || d.excerpt || '',
            });
            return;
          }
        }

        // 2. Fallback to slug query
        const querySnap = await firestore().collection('blog_posts').where('slug', '==', slug).get();
        if (!querySnap.empty && isMounted) {
          const d = querySnap.docs[0].data();
          setPost({
            title: d.title || fallbackTitle,
            category: d.category || 'Luxury Travel',
            author: d.author || 'VANIR Editorial',
            readingTime: d.readingTime || 5,
            date: d.date || '2026',
            image: d.image || undefined,
            excerpt: d.excerpt || '',
            content: d.content || d.excerpt || '',
          });
        }
      } catch (e) {
        // Fallback to activePost or default
      }
    }
    loadPost();
    return () => {
      isMounted = false;
    };
  }, [slug, fallbackTitle]);

  const activePost = post || {
    title: fallbackTitle,
    category: 'Luxury Travel',
    author: 'VANIR Editorial',
    readingTime: 5,
    date: 'October 2026',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
    excerpt: 'Exclusive travel guides and insights curated by VANIR Group.',
    content: 'Full article text is loading from our editorial network...',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Header with Vanir Logo */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs'))}
        >
          <ChevronLeft color="#D4AF37" size={22} strokeWidth={2.5} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerBrand}>VANIR MAGAZINE</Text>
        </View>

        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/vanir_round_logo.png')}
            style={styles.logoImg}
            resizeMode="cover"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + insets.bottom }]}
      >
        {/* Cover Photo */}
        {activePost.image && (
          <View style={styles.coverBox}>
            <Image source={{ uri: activePost.image }} style={styles.coverImage} resizeMode="cover" />
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{activePost.category}</Text>
            </View>
          </View>
        )}

        {/* Content Body */}
        <View style={styles.body}>
          <Text style={styles.title}>{activePost.title}</Text>

          {/* Meta Bar */}
          <View style={styles.metaBar}>
            <View style={styles.metaRow}>
              <User color="#94A3B8" size={13} />
              <Text style={styles.metaText}>{activePost.author}</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <View style={styles.metaRow}>
              <Clock color="#94A3B8" size={13} />
              <Text style={styles.metaText}>{activePost.readingTime || 5} min read</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <View style={styles.metaRow}>
              <Calendar color="#94A3B8" size={13} />
              <Text style={styles.metaText}>{activePost.date}</Text>
            </View>
          </View>

          {/* Excerpt Lead */}
          {activePost.excerpt ? (
            <View style={styles.leadBox}>
              <Text style={styles.leadText}>{activePost.excerpt}</Text>
            </View>
          ) : null}

          {/* Full Content */}
          <Text style={styles.contentText}>{activePost.content}</Text>
        </View>
      </ScrollView>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  topBtnPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    backgroundColor: '#FAF9F6',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {},
  coverBox: {
    width: '100%',
    height: 250,
    position: 'relative',
    backgroundColor: '#FAF9F6',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  categoryPill: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryPillText: {
    color: '#1C1917',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1917',
    lineHeight: 30,
    marginBottom: 12,
  },
  metaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  dot: {
    color: '#64748B',
    fontSize: 12,
  },
  leadBox: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  leadText: {
    fontSize: 14,
    color: '#1C1917',
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  contentText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
});
