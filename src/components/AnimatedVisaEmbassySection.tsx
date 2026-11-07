import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import {
  Landmark,
  ShieldCheck,
  Globe,
  Building2,
  Sparkles,
  ArrowRight,
  FileCheck2,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';
import type { RootStackParamList } from '../navigation/types';
import { LuxuryPressable } from './LuxuryMicroInteractions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 305);
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface EmbassyVisaItem {
  id: string;
  flag: string;
  title: { en: string; ar: string; fr: string; ru: string };
  subtitle: { en: string; ar: string; fr: string; ru: string };
  badge: { en: string; ar: string; fr: string; ru: string };
  time: { en: string; ar: string; fr: string; ru: string };
  iconType: 'landmark' | 'shield' | 'globe' | 'consulate' | 'sparkles' | 'building';
  embassyCode: string;
}

const EMBASSY_ITEMS: EmbassyVisaItem[] = [
  {
    id: 'schengen',
    flag: '🇪🇺',
    title: {
      en: 'Schengen European Visa',
      ar: 'تأشيرة الشنغن الأوروبية الموحدة',
      fr: 'Visa Schengen Européen',
      ru: 'Шенгенская Европейская Виза',
    },
    subtitle: {
      en: 'France, Italy, Switzerland, Germany & Greece • VFS & GVCW VIP Lounge',
      ar: 'فرنسا، إيطاليا، سويسرا واليونان • صالات كبار الشخصيات VFS & GVCW',
      fr: 'France, Italie, Suisse & Grèce • Salons VIP VFS & GVCW',
      ru: 'Франция, Италия, Швейцария и Греция • VIP залы VFS и GVCW',
    },
    badge: {
      en: 'FAST APPOINTMENT',
      ar: 'مواعيد مستعجلة',
      fr: 'RDV RAPIDE',
      ru: 'СРОЧНАЯ ЗАПИСЬ',
    },
    time: {
      en: '48h Dossier Audit',
      ar: 'فحص الملف خلال 48 ساعة',
      fr: 'Audit sous 48h',
      ru: 'Проверка за 48ч',
    },
    iconType: 'landmark',
    embassyCode: 'EU-CONSULAR',
  },
  {
    id: 'uk',
    flag: '🇬🇧',
    title: {
      en: 'UK Royal Standard Visitor Visa',
      ar: 'تأشيرة بريطانيا والمملكة المتحدة',
      fr: 'Visa Visiteur Royaume-Uni',
      ru: 'Виза в Великобританию',
    },
    subtitle: {
      en: 'Direct British Embassy London liaison • Priority TLScontact Lounge',
      ar: 'تنسيق مباشر مع السفارة البريطانية • مسار الصالات الخاصة TLScontact',
      fr: 'Liaison directe Ambassade britannique • Salon prioritaire TLScontact',
      ru: 'Прямая связь с Посольством Великобритании • VIP TLScontact',
    },
    badge: {
      en: 'EXPRESS PRIORITY',
      ar: 'أولوية سريعة',
      fr: 'PRIORITÉ EXPRESS',
      ru: 'ЭКСПРЕСС ПРИОРИТЕТ',
    },
    time: {
      en: 'VIP Super Priority',
      ar: 'أولوية سوبر VIP',
      fr: 'Super Priorité VIP',
      ru: 'Супер VIP статус',
    },
    iconType: 'shield',
    embassyCode: 'UK-EMBASSY',
  },
  {
    id: 'usa',
    flag: '🇺🇸',
    title: {
      en: 'US B1/B2 Tourism & Business Visa',
      ar: 'تأشيرة أمريكا B1/B2 للسياحة والأعمال',
      fr: 'Visa USA B1/B2 Tourisme & Affaires',
      ru: 'Виза в США B1/B2 Туризм и Бизнес',
    },
    subtitle: {
      en: 'Full DS-160 VIP Preparation • US Embassy Interview Slot Expediting',
      ar: 'تجهيز نموذج DS-160 الملكي • تسريع مواعيد المقابلة بالسفارة الأمريكية',
      fr: 'Préparation complète DS-160 • Accélération des créneaux d\'entretien',
      ru: 'Полная подготовка DS-160 • Ускорение записи на собеседование',
    },
    badge: {
      en: 'EMBASSY EXPEDITION',
      ar: 'تسريع السفارة',
      fr: 'EXPÉDITION AMBASSADE',
      ru: 'УСКОРЕНИЕ В ПОСОЛЬСТВЕ',
    },
    time: {
      en: 'Guaranteed Dossier',
      ar: 'ملف معتمد ومضمون',
      fr: 'Dossier Garanti',
      ru: 'Гарантированный пакет',
    },
    iconType: 'globe',
    embassyCode: 'US-CONSULAR',
  },
  {
    id: 'legalization',
    flag: '🏛️',
    title: {
      en: 'Diplomatic & Consular Legalization',
      ar: 'توثيق السفارات والتصديق القنصلي',
      fr: 'Légalisation Consulaire & Diplomatique',
      ru: 'Консульская Легализация Документов',
    },
    subtitle: {
      en: 'Ministry of Foreign Affairs Certification • Consular Attestation Escort',
      ar: 'تصديقات وزارة الخارجية والسفارات • ترجمة معتمدة ومرافقة دبلوماسية',
      fr: 'Attestation Ministère des Affaires Étrangères • Escorte consulaire',
      ru: 'Заверение МИД и посольств • Сертифицированный перевод',
    },
    badge: {
      en: 'CONSULAR STAMP',
      ar: 'تصديق معتمد',
      fr: 'TAMPON CONSULAIRE',
      ru: 'КОНСУЛЬСКИЙ ШТАМП',
    },
    time: {
      en: 'Official Attestation',
      ar: 'توثيق رسمي شامل',
      fr: 'Attestation Officielle',
      ru: 'Официальное заверение',
    },
    iconType: 'consulate',
    embassyCode: 'DIPLOMATIC-MOFA',
  },
  {
    id: 'japan_asia',
    flag: '🇯🇵',
    title: {
      en: 'Japan & Asia Royal e-Visa',
      ar: 'تأشيرة اليابان وآسيا الإلكترونية',
      fr: 'e-Visa Japon & Asie',
      ru: 'Электронная виза в Японию и Азию',
    },
    subtitle: {
      en: 'Tokyo Diplomatic Gateway • 48-Hour Official Electronic Issuance',
      ar: 'بوابة طوكيو الدبلوماسية • إصدار إلكتروني رسمي خلال 48 ساعة فقط',
      fr: 'Passerelle diplomatique Tokyo • Émission officielle sous 48h',
      ru: 'Дипломатический шлюз Токио • Официальная выдача за 48 часов',
    },
    badge: {
      en: 'INSTANT E-VISA',
      ar: 'إصدار فوري',
      fr: 'E-VISA INSTANTANÉ',
      ru: 'МГНОВЕННАЯ E-VISA',
    },
    time: {
      en: '48h Instant Approval',
      ar: 'موافقة خلال 48 ساعة',
      fr: 'Approbation 48h',
      ru: 'Одобрение за 48ч',
    },
    iconType: 'sparkles',
    embassyCode: 'ASIA-EVISA',
  },
  {
    id: 'gulf_saudi',
    flag: '🇦🇪',
    title: {
      en: 'Gulf & Saudi VIP Residence & Visit',
      ar: 'تأشيرات الخليج والمملكة والإقامة الفاخرة',
      fr: 'Visas Golfe & Arabie Saoudite VIP',
      ru: 'Визы в страны Персидского залива и КСА',
    },
    subtitle: {
      en: 'UAE, Saudi Arabia & Qatar • VIP Fast-Track Residence & Business',
      ar: 'الإمارات والسعودية وقطر • تخليص فوري لكبار المستثمرين والزوار',
      fr: 'EAU, Arabie Saoudite & Qatar • Accès accéléré VIP affaires',
      ru: 'ОАЭ, Саудовская Аравия и Катар • Ускоренное оформление VIP',
    },
    badge: {
      en: 'ROYAL ENTRY',
      ar: 'دخول ملكي فوري',
      fr: 'ENTRÉE ROYALE',
      ru: 'КОРОЛЕВСКИЙ ДОСТУП',
    },
    time: {
      en: 'Same Day Clearance',
      ar: 'تخليص في نفس اليوم',
      fr: 'Délivrance le jour même',
      ru: 'Выдача в тот же день',
    },
    iconType: 'building',
    embassyCode: 'GCC-ROYAL',
  },
];

export function AnimatedVisaEmbassySection() {
  const navigation = useNavigation<Nav>();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language === 'ar' || i18n.language === 'fr' || i18n.language === 'ru')
    ? i18n.language
    : 'en';

  const scrollRef = useRef<ScrollView>(null);
  const isInteracting = useRef(false);
  const currentIndex = useRef(0);
  const [activeDot, setActiveDot] = useState(0);

  // Subtle pulsing animation for the "LIVE EMBASSY ACCESS" indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  // Smooth Automatic Moving / Scrolling Carousel ("بتتحرك")
  useEffect(() => {
    const timer = setInterval(() => {
      if (isInteracting.current || !scrollRef.current) return;
      const nextIndex = (currentIndex.current + 1) % EMBASSY_ITEMS.length;
      currentIndex.current = nextIndex;
      scrollRef.current.scrollTo({
        x: nextIndex * SNAP_INTERVAL,
        animated: true,
      });
      setActiveDot(nextIndex);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    if (index >= 0 && index < EMBASSY_ITEMS.length) {
      currentIndex.current = index;
      setActiveDot(index);
    }
  };

  const renderIcon = (type: EmbassyVisaItem['iconType']) => {
    switch (type) {
      case 'landmark':
        return <Landmark color="#D4AF37" size={20} strokeWidth={2} />;
      case 'shield':
        return <ShieldCheck color="#D4AF37" size={20} strokeWidth={2} />;
      case 'globe':
        return <Globe color="#D4AF37" size={20} strokeWidth={2} />;
      case 'consulate':
        return <FileCheck2 color="#D4AF37" size={20} strokeWidth={2} />;
      case 'sparkles':
        return <Sparkles color="#D4AF37" size={20} strokeWidth={2} />;
      case 'building':
      default:
        return <Building2 color="#D4AF37" size={20} strokeWidth={2} />;
    }
  };

  const headerTitle = useMemo(() => {
    switch (currentLang) {
      case 'ar':
        return 'خدمات التأشيرات والسفارات الدبلوماسية';
      case 'fr':
        return 'Services Visas & Ambassades Diplomatiques';
      case 'ru':
        return 'Дипломатические визы и посольства';
      default:
        return 'Embassy & Diplomatic Visa Services';
    }
  }, [currentLang]);

  const headerSub = useMemo(() => {
    switch (currentLang) {
      case 'ar':
        return 'تنسيق قنصلي مباشر وتجهيز ملفات السفارات بأولوية VIP';
      case 'fr':
        return 'Liaison consulaire directe et dossiers prioritaires VIP';
      case 'ru':
        return 'Прямая консульская связь и приоритетное оформление VIP';
      default:
        return 'Direct Consular Liaison & Priority Embassy Dossiers';
    }
  }, [currentLang]);

  const liveBadgeText = useMemo(() => {
    switch (currentLang) {
      case 'ar':
        return 'اعتماد قنصلي رسمي مباشر';
      case 'fr':
        return 'ACCÈS AMBASSADE DIRECT';
      case 'ru':
        return 'ПРЯМОЙ ДОСТУП В ПОСОЛЬСТВА';
      default:
        return 'DIRECT EMBASSY ACCESS';
    }
  }, [currentLang]);

  const viewAllText = useMemo(() => {
    switch (currentLang) {
      case 'ar':
        return 'كافة السفارات ➔';
      case 'fr':
        return 'Voir tout ➔';
      case 'ru':
        return 'Все посольства ➔';
      default:
        return 'All Embassies ➔';
    }
  }, [currentLang]);

  return (
    <View style={styles.container}>
      {/* Editorial Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            {/* Animated Pulsing Gold Light Indicator */}
            <View style={styles.indicatorContainer}>
              <Animated.View
                style={[
                  styles.pulseDot,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.35],
                      outputRange: [0.9, 0.35],
                    }),
                  },
                ]}
              />
              <View style={styles.solidDot} />
            </View>
            <Text style={styles.liveBadgeText}>{liveBadgeText}</Text>
          </View>
          <Text style={styles.sectionTitle}>{headerTitle}</Text>
          <Text style={styles.sectionSubtitle}>{headerSub}</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Visa')}
          hitSlop={10}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAllText}>{viewAllText}</Text>
        </Pressable>
      </View>

      {/* Auto-Moving Horizontal Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={() => {
          isInteracting.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isInteracting.current = false;
          }, 2000);
        }}
      >
        {EMBASSY_ITEMS.map((item, index) => {
          const isSelected = activeDot === index;
          return (
            <LuxuryPressable
              key={item.id}
              style={[
                styles.card,
                isSelected && styles.cardActive,
              ]}
              onPress={() => navigation.navigate('Visa')}
              scaleTo={0.97}
            >
              <LinearGradient
                colors={['#FFFFFF', '#FAF9F6']}
                style={styles.cardGradient}
              >
                {/* Top Row: Flag & Tag Badge */}
                <View style={styles.cardTopRow}>
                  <View style={styles.iconAndFlagBox}>
                    <Text style={styles.flagText}>{item.flag}</Text>
                    <View style={styles.iconCircle}>
                      {renderIcon(item.iconType)}
                    </View>
                  </View>

                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{item.badge[currentLang]}</Text>
                  </View>
                </View>

                {/* Embassy / Visa Title */}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title[currentLang]}
                </Text>

                {/* Subtitle / Details */}
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {item.subtitle[currentLang]}
                </Text>

                {/* Footer with Processing Time & Action */}
                <View style={styles.cardFooter}>
                  <View style={styles.timeRow}>
                    <Clock color="#D4AF37" size={12} strokeWidth={2} />
                    <Text style={styles.timeText} numberOfLines={1}>
                      {item.time[currentLang]}
                    </Text>
                  </View>

                  <View style={styles.arrowBox}>
                    <ChevronRight color="#1C1917" size={14} strokeWidth={2.4} />
                  </View>
                </View>
              </LinearGradient>
            </LuxuryPressable>
          );
        })}
      </ScrollView>

      {/* Modern Gold Progress Indicator Dots */}
      <View style={styles.dotsRow}>
        {EMBASSY_ITEMS.map((_, i) => (
          <View
            key={`dot-${i}`}
            style={[
              styles.dot,
              activeDot === i && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  indicatorContainer: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D4AF37',
  },
  solidDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  liveBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#78716C',
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  viewAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1917',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  card: {
    width: CARD_WIDTH,
    height: 172,
    marginRight: CARD_MARGIN,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActive: {
    borderColor: '#D4AF37',
    shadowOpacity: 0.22,
    elevation: 4,
  },
  cardGradient: {
    flex: 1,
    padding: 13,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAndFlagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagText: {
    fontSize: 22,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 0.8,
    borderColor: '#D4AF37',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B38822',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.2,
    marginTop: 2,
    lineHeight: 18,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#78716C',
    lineHeight: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1C1917',
  },
  arrowBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(212, 175, 55, 0.28)',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#D4AF37',
  },
});
