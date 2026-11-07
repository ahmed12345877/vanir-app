import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Star,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  User,
} from 'lucide-react-native';

interface ReviewItem {
  id: string;
  guestName: string;
  tripName: string;
  rating: number;
  date: string;
  content: string;
  verified: boolean;
  adminReply?: string;
  likes: number;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    guestName: 'Alexander Sterling',
    tripName: 'FIVE Palm Jumeirah - Presidential Suite',
    rating: 5,
    date: 'October 12, 2026',
    content:
      'The private chauffeur was waiting at DXB immediately upon landing. The suite had spectacular panoramic sunset views of the Palm and Dubai Marina. The 24/7 dedicated butler exceeded all expectations.',
    verified: true,
    adminReply:
      'Thank you, Alexander. We look forward to welcoming you back for your next private charter in the Maldives.',
    likes: 24,
  },
  {
    id: 'rev-2',
    guestName: 'Eleanor Vance',
    tripName: 'Bombardier Global 7500 - Paris to London',
    rating: 5,
    date: 'October 8, 2026',
    content:
      'Seamless tarmac boarding from Le Bourget directly to Farnborough. Exceptional catering and Dom Pérignon service at 45,000 feet. Absolutely first-class concierge coordination.',
    verified: true,
    likes: 18,
  },
  {
    id: 'rev-3',
    guestName: 'Karim Mansour',
    tripName: 'Private Superyacht Majesty 120 - Dubai Harbour',
    rating: 5,
    date: 'September 28, 2026',
    content:
      'We hosted an exclusive private gala for 18 VIP guests. The Michelin-level chef and courteous deck crew created an unforgettable sunset cruise around the World Islands.',
    verified: true,
    adminReply:
      'It was our distinct honor to host your private event, Karim. Safe travels until next time.',
    likes: 31,
  },
  {
    id: 'rev-4',
    guestName: 'Victoria Chen',
    tripName: 'The Nile Ritz-Carlton Cairo - Royal Nile Suite',
    rating: 5,
    date: 'September 15, 2026',
    content:
      'The private after-hours Giza Pyramids expedition organized by our Vanir guide was nothing short of breathtaking. Flawless security and utmost discretion throughout.',
    verified: true,
    likes: 15,
  },
];

export function ReviewsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [guestName, setGuestName] = useState('');
  const [tripName, setTripName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = () => {
    if (!guestName.trim()) {
      Alert.alert('Required Field', 'Please enter your name.');
      return;
    }
    if (!tripName.trim()) {
      Alert.alert('Required Field', 'Please enter the hotel, flight, or yacht experience.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Required Field', 'Please enter your review feedback.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newReview: ReviewItem = {
        id: `rev-${Date.now()}`,
        guestName: guestName.trim(),
        tripName: tripName.trim(),
        rating,
        date: 'Just now',
        content: content.trim(),
        verified: true,
        likes: 0,
      };

      setReviews([newReview, ...reviews]);
      setGuestName('');
      setTripName('');
      setContent('');
      setRating(5);

      Alert.alert(
        'Review Submitted',
        'Thank you! Your verified review has been published to our platform.'
      );
    }, 600);
  };

  const handleLike = (id: string) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Screen Header with Working Back Button */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <ChevronLeft color="#1C1917" size={22} strokeWidth={2.4} />
        </Pressable>

        <Text style={styles.headerTitle}>Guest Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 60 + insets.bottom }]}
      >
        {/* Rating Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.scoreRow}>
            <View style={styles.bigScoreBox}>
              <Text style={styles.bigScoreText}>4.96</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    color="#D4AF37"
                    size={16}
                    fill="#D4AF37"
                  />
                ))}
              </View>
              <Text style={styles.reviewsCountText}>1,480+ Verified Reviews</Text>
            </View>

            {/* Breakdown Bars */}
            <View style={styles.barsCol}>
              <View style={styles.barItem}>
                <Text style={styles.barLabel}>5 ★</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: '96%' }]} />
                </View>
                <Text style={styles.barPercent}>96%</Text>
              </View>

              <View style={styles.barItem}>
                <Text style={styles.barLabel}>4 ★</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: '4%' }]} />
                </View>
                <Text style={styles.barPercent}>4%</Text>
              </View>

              <View style={styles.barItem}>
                <Text style={styles.barLabel}>3 ★</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: '0%' }]} />
                </View>
                <Text style={styles.barPercent}>0%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Leave a Review Section */}
        <View style={styles.formCard}>
          <View style={styles.formHeaderRow}>
            <MessageSquare color="#D4AF37" size={18} />
            <Text style={styles.formTitle}>Leave a Verified Review</Text>
          </View>

          {/* Interactive Star Rating Selector */}
          <View style={styles.starPickerRow}>
            <Text style={styles.starPickerLabel}>Your Rating:</Text>
            <View style={styles.starButtonsGroup}>
              {[1, 2, 3, 4, 5].map(s => (
                <Pressable
                  key={s}
                  onPress={() => setRating(s)}
                  hitSlop={6}
                  style={styles.starPressable}
                >
                  <Star
                    color="#F59E0B"
                    size={28}
                    fill={s <= rating ? '#F59E0B' : 'transparent'}
                    strokeWidth={2}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Traveler Name */}
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            value={guestName}
            onChangeText={setGuestName}
            placeholder="e.g. John Michael"
            placeholderTextColor="#94A3B8"
          />

          {/* Trip / Service Experience */}
          <Text style={styles.inputLabel}>Experience / Hotel / Flight</Text>
          <TextInput
            style={styles.textInput}
            value={tripName}
            onChangeText={setTripName}
            placeholder="e.g. Delta Flight JFK-LAX or FIVE Palm Jumeirah"
            placeholderTextColor="#94A3B8"
          />

          {/* Review Text */}
          <Text style={styles.inputLabel}>Review Details</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Share your VIP experience, service highlights, or butler attention..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
          />

          {/* Full-width Submit Button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && styles.btnPressed,
              isSubmitting && { opacity: 0.7 },
            ]}
            onPress={handleSubmitReview}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Submitting…' : 'Submit Review'}
            </Text>
          </Pressable>
        </View>

        {/* Reviews List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>Recent Traveler Testimonials</Text>
          <View style={styles.verifiedBadge}>
            <ShieldCheck color="#16A34A" size={14} />
            <Text style={styles.verifiedBadgeText}>100% Verified Guests</Text>
          </View>
        </View>

        {/* Reviews Cards List */}
        {reviews.map(item => (
          <View key={item.id} style={styles.reviewCard}>
            <View style={styles.reviewCardHeader}>
              <View style={styles.guestAvatar}>
                <Text style={styles.avatarInitial}>{item.guestName.charAt(0)}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.guestNameRow}>
                  <Text style={styles.guestNameText}>{item.guestName}</Text>
                  {item.verified && (
                    <View style={styles.verifiedTag}>
                      <CheckCircle2 color="#D4AF37" size={12} />
                      <Text style={styles.verifiedTagText}>Verified Stay</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.tripNameText}>{item.tripName}</Text>
              </View>

              <Text style={styles.dateText}>{item.date}</Text>
            </View>

            {/* Stars */}
            <View style={styles.starsSmallRow}>
              {[1, 2, 3, 4, 5].map(st => (
                <Star
                  key={st}
                  color="#D4AF37"
                  size={14}
                  fill={st <= item.rating ? '#D4AF37' : 'transparent'}
                />
              ))}
            </View>

            {/* Content */}
            <Text style={styles.reviewContentText}>{item.content}</Text>

            {/* Admin Concierge Reply */}
            {item.adminReply && (
              <View style={styles.replyBox}>
                <View style={styles.replyHeaderRow}>
                  <Sparkles color="#D4AF37" size={14} />
                  <Text style={styles.replyTitle}>Vanir VIP Concierge Response</Text>
                </View>
                <Text style={styles.replyText}>{item.adminReply}</Text>
              </View>
            )}

            {/* Footer / Likes */}
            <View style={styles.reviewFooter}>
              <Pressable
                style={styles.likeBtn}
                onPress={() => handleLike(item.id)}
                hitSlop={8}
              >
                <ThumbsUp color="#64748B" size={14} />
                <Text style={styles.likeCountText}>Helpful ({item.likes})</Text>
              </Pressable>
            </View>
          </View>
        ))}
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: -0.3,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  bigScoreBox: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(28, 25, 23, 0.08)',
  },
  bigScoreText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1C1917',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginVertical: 4,
  },
  reviewsCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  barsCol: {
    flex: 1,
    gap: 6,
  },
  barItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    width: 24,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3,
  },
  barPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    width: 28,
    textAlign: 'right',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  starPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 25, 23, 0.08)',
  },
  starPickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  starButtonsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  starPressable: {
    padding: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1C1917',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#D4AF37',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  submitBtnText: {
    color: '#1C1917',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D4AF37',
  },
  guestNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  guestNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
  },
  tripNameText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  starsSmallRow: {
    flexDirection: 'row',
    gap: 3,
  },
  reviewContentText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
  },
  replyBox: {
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    gap: 4,
    marginTop: 4,
  },
  replyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  replyText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 25, 23, 0.08)',
    paddingTop: 10,
    marginTop: 4,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});
