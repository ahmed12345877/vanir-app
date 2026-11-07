import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Image,
  Modal,
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Pencil,
  User,
  Users,
  Globe,
  Building,
  MapPin,
  Check,
  X,
  LogOut,
  ShieldCheck,
  Camera,
  Sparkles,
  Crown,
  Image as ImageIcon,
  Mail,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogo, FacebookLogo, AppleIdLogo } from '../../components/SocialLogos';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

import {
  PRESET_AVATARS,
  AVATAR_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
} from '../../constants/presetAvatars';

export { PRESET_AVATARS, AVATAR_STORAGE_KEY, PROFILE_STORAGE_KEY };

export function UserProfileScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { signOut, user, firebaseUser } = useAuth();

  // Avatar Image State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('av-1');
  const [customAvatarUri, setCustomAvatarUri] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Profile Information State
  const initialName = firebaseUser?.displayName || (user as any)?.name || 'VIP Member';
  const [displayName, setDisplayName] = useState(initialName);
  const [gender, setGender] = useState('Male');
  const [country, setCountry] = useState('Egypt');
  const [city, setCity] = useState('Cairo');
  const [mostVisitedCity, setMostVisitedCity] = useState('Dubai');

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(displayName);
  const [editGender, setEditGender] = useState(gender);
  const [editCountry, setEditCountry] = useState(country);
  const [editCity, setEditCity] = useState(city);
  const [editMostVisited, setEditMostVisited] = useState(mostVisitedCity);

  // Third Party Accounts Linking State
  const [isGoogleLinked, setIsGoogleLinked] = useState(true);
  const [isFacebookLinked, setIsFacebookLinked] = useState(false);
  const [isAppleLinked, setIsAppleLinked] = useState(true);

  // Real user email from active session
  const realEmail = useMemo(() => {
    const u = user as any;
    return u?.email || firebaseUser?.email || 'vip.member@vanirgroup.com';
  }, [user, firebaseUser]);

  // Load persistently saved avatar & profile from AsyncStorage
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedAvatar = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
        if (savedAvatar) {
          const parsed = JSON.parse(savedAvatar);
          if (parsed.type === 'custom' && parsed.uri) {
            setCustomAvatarUri(parsed.uri);
            setSelectedPresetId('');
          } else if (parsed.type === 'preset' && parsed.id) {
            setSelectedPresetId(parsed.id);
            setCustomAvatarUri(null);
          }
        }

        const savedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (savedProfile) {
          const p = JSON.parse(savedProfile);
          if (p.displayName) setDisplayName(p.displayName);
          if (p.gender) setGender(p.gender);
          if (p.country) setCountry(p.country);
          if (p.city) setCity(p.city);
          if (p.mostVisitedCity) setMostVisitedCity(p.mostVisitedCity);
        }
      } catch {}
    };
    loadSavedData();
  }, []);

  // Compute active image source
  const activeAvatarSource = useMemo(() => {
    if (customAvatarUri) {
      return { uri: customAvatarUri };
    }
    const found = PRESET_AVATARS.find(p => p.id === selectedPresetId);
    return found ? found.source : PRESET_AVATARS[0].source;
  }, [customAvatarUri, selectedPresetId]);

  // Handlers for Avatar Selection & Persistent Saving
  const handleLaunchGallery = async () => {
    setShowAvatarModal(false);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.9,
        selectionLimit: 1,
      });
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setCustomAvatarUri(uri);
        setSelectedPresetId('');
        await AsyncStorage.setItem(
          AVATAR_STORAGE_KEY,
          JSON.stringify({ type: 'custom', uri }),
        ).catch(() => {});
        Alert.alert('Profile Photo Saved', 'Your photo has been changed and saved permanently.');
      }
    } catch {
      Alert.alert('Gallery Error', 'Could not open photo library.');
    }
  };

  const handleSelectPresetAvatar = async (presetId: string) => {
    setSelectedPresetId(presetId);
    setCustomAvatarUri(null);
    setShowAvatarModal(false);
    await AsyncStorage.setItem(
      AVATAR_STORAGE_KEY,
      JSON.stringify({ type: 'preset', id: presetId }),
    ).catch(() => {});
    Alert.alert('VIP Avatar Updated', 'Your profile picture has been saved successfully.');
  };

  const handleOpenEdit = () => {
    setEditName(displayName);
    setEditGender(gender);
    setEditCountry(country);
    setEditCity(city);
    setEditMostVisited(mostVisitedCity);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Display name cannot be empty.');
      return;
    }
    const cleanName = editName.trim();
    setDisplayName(cleanName);
    setGender(editGender);
    setCountry(editCountry);
    setCity(editCity);
    setMostVisitedCity(editMostVisited);
    setIsEditing(false);

    try {
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          displayName: cleanName,
          gender: editGender,
          country: editCountry,
          city: editCity,
          mostVisitedCity: editMostVisited,
        }),
      );
    } catch {}

    Alert.alert('Profile Updated', 'Your personal information has been saved successfully.');
  };

  const handleToggleGoogle = () => {
    if (isGoogleLinked) {
      Alert.alert(
        'Unlink Google Account',
        'Are you sure you want to unlink your Google account? You will need your email and password to sign in.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlink',
            style: 'destructive',
            onPress: () => setIsGoogleLinked(false),
          },
        ],
      );
    } else {
      setIsGoogleLinked(true);
      Alert.alert('Google Account Linked', 'Your Google account has been linked successfully.');
    }
  };

  const handleToggleFacebook = () => {
    if (isFacebookLinked) {
      setIsFacebookLinked(false);
      Alert.alert('Facebook Account Unlinked', 'Your Facebook account has been unlinked.');
    } else {
      setIsFacebookLinked(true);
      Alert.alert('Facebook Account Linked', 'Your Facebook account has been linked successfully.');
    }
  };

  const handleToggleApple = () => {
    if (isAppleLinked) {
      Alert.alert(
        'Unlink Apple ID',
        'Are you sure you want to unlink Apple ID? Quick biometric sign-in will be deactivated.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlink',
            style: 'destructive',
            onPress: () => setIsAppleLinked(false),
          },
        ],
      );
    } else {
      setIsAppleLinked(true);
      Alert.alert('Apple ID Linked', 'Your Apple ID has been linked successfully.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your VIP account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.topBtnPressed,
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft color="#1C1917" size={24} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.headerTitle}>User Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* VIP Profile Avatar Header Card with Change Photo Feature */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={activeAvatarSource}
              style={styles.avatarImg}
              resizeMode="cover"
            />
            {/* Interactive Camera Edit Badge */}
            <Pressable
              style={({ pressed }) => [
                styles.cameraBadge,
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
              onPress={() => setShowAvatarModal(true)}
              hitSlop={8}
            >
              <Camera color="#1C1917" size={16} strokeWidth={2.4} />
            </Pressable>
          </View>

          <Text style={styles.avatarName}>{displayName}</Text>
          
          <View style={styles.tierBadgeRow}>
            <Crown color="#D4AF37" size={13} strokeWidth={2.4} />
            <Text style={styles.tierBadgeText}>ROYAL TIER</Text>
            <Text style={styles.vanirIdText}>•  MEMBER NO. VN-0042</Text>
          </View>

          {/* Real Authenticated Session Email Pill */}
          <View style={styles.verifiedEmailPill}>
            <View style={styles.onlineDot} />
            <Mail color="#D4AF37" size={12} />
            <Text style={styles.verifiedEmailText}>{realEmail}</Text>
          </View>

          <Pressable
            style={styles.changePhotoBtn}
            onPress={() => setShowAvatarModal(true)}
          >
            <Camera color="#1C1917" size={14} />
            <Text style={styles.changePhotoBtnText}>Change Profile Picture</Text>
          </Pressable>
        </View>

        {/* Card 1: Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <Pressable style={styles.editBtn} onPress={handleOpenEdit}>
              <Pencil color="#1C1917" size={15} strokeWidth={2.4} />
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
          </View>

          {/* Row 1: Display Name */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelGroup}>
              <User color="#64748B" size={18} strokeWidth={2} />
              <Text style={styles.fieldLabel}>Display Name</Text>
            </View>
            <Text style={styles.fieldValue}>{displayName}</Text>
          </View>

          <View style={styles.fieldDivider} />

          {/* Row 2: Gender */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelGroup}>
              <Users color="#64748B" size={18} strokeWidth={2} />
              <Text style={styles.fieldLabel}>Gender</Text>
            </View>
            <Text style={styles.fieldValue}>{gender}</Text>
          </View>

          <View style={styles.fieldDivider} />

          {/* Row 3: Country */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelGroup}>
              <Globe color="#64748B" size={18} strokeWidth={2} />
              <Text style={styles.fieldLabel}>Country / Region</Text>
            </View>
            <Text style={styles.fieldValue}>{country}</Text>
          </View>

          <View style={styles.fieldDivider} />

          {/* Row 4: City */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelGroup}>
              <Building color="#64748B" size={18} strokeWidth={2} />
              <Text style={styles.fieldLabel}>City of Residence</Text>
            </View>
            <Text style={styles.fieldValue}>{city}</Text>
          </View>

          <View style={styles.fieldDivider} />

          {/* Row 5: Most Visited City */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelGroup}>
              <MapPin color="#64748B" size={18} strokeWidth={2} />
              <Text style={styles.fieldLabel}>Most Visited City</Text>
            </View>
            <Text style={styles.fieldValue}>{mostVisitedCity}</Text>
          </View>
        </View>

        {/* Card 2: Linked Accounts with Authentic Vector Logos */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Linked Accounts</Text>
            <View style={styles.securityBadge}>
              <ShieldCheck color="#10B981" size={14} />
              <Text style={styles.securityBadgeText}>Protected</Text>
            </View>
          </View>

          <Text style={styles.accountSubText}>
            Link third-party accounts to sign in quickly across all your mobile devices using your account info.
          </Text>

          {/* Google Row with Official Multi-Color Google Logo */}
          <View style={styles.thirdPartyRow}>
            <View style={styles.thirdPartyLeft}>
              <View style={styles.socialLogoBox}>
                <GoogleLogo size={24} />
              </View>
              <Text style={styles.thirdPartyName}>Google</Text>
            </View>

            <Pressable
              style={[
                styles.linkActionBtn,
                isGoogleLinked && styles.unlinkActionBtn,
              ]}
              onPress={handleToggleGoogle}
            >
              <Text
                style={[
                  styles.linkActionText,
                  isGoogleLinked && styles.unlinkActionText,
                ]}
              >
                {isGoogleLinked ? 'Unlink' : 'Link Account'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.fieldDivider} />

          {/* Facebook Row with Official Facebook Logo */}
          <View style={styles.thirdPartyRow}>
            <View style={styles.thirdPartyLeft}>
              <View style={styles.socialLogoBox}>
                <FacebookLogo size={24} />
              </View>
              <Text style={styles.thirdPartyName}>Facebook</Text>
            </View>

            <Pressable
              style={[
                styles.linkActionBtn,
                isFacebookLinked && styles.unlinkActionBtn,
              ]}
              onPress={handleToggleFacebook}
            >
              <Text
                style={[
                  styles.linkActionText,
                  isFacebookLinked && styles.unlinkActionText,
                ]}
              >
                {isFacebookLinked ? 'Unlink' : 'Link Account'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.fieldDivider} />

          {/* Apple ID Row with Official Apple Logo */}
          <View style={styles.thirdPartyRow}>
            <View style={styles.thirdPartyLeft}>
              <View style={styles.socialLogoBox}>
                <AppleIdLogo size={22} color="#000000" />
              </View>
              <Text style={styles.thirdPartyName}>Apple ID</Text>
            </View>

            <Pressable
              style={[
                styles.linkActionBtn,
                isAppleLinked && styles.unlinkActionBtn,
              ]}
              onPress={handleToggleApple}
            >
              <Text
                style={[
                  styles.linkActionText,
                  isAppleLinked && styles.unlinkActionText,
                ]}
              >
                {isAppleLinked ? 'Unlink' : 'Link Account'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Card 3: Sign Out Button */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutCard,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
          onPress={handleSignOut}
        >
          <LogOut color="#8B1E2D" size={19} strokeWidth={1.8} />
          <Text style={styles.signOutText}>Sign Out from Account</Text>
        </Pressable>
      </ScrollView>

      {/* Choose Avatar Modal (Camera, Photos, Authentic Presets) */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowAvatarModal(false)}
        >
          <Pressable style={styles.avatarModalSheet} onPress={e => e.stopPropagation()}>
            <View style={styles.avatarModalHandle} />
            <Text style={styles.avatarModalTitle}>Choose Profile Picture</Text>
            <Text style={styles.avatarModalSub}>
              Choose from your photo library or select an authentic royal heritage preset.
            </Text>

            {/* Quick Action (Photo Library) */}
            <View style={styles.avatarActionsRow}>
              <Pressable style={[styles.avatarActionItem, { flex: 1 }]} onPress={handleLaunchGallery}>
                <View style={[styles.avatarActionIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <ImageIcon color="#D97706" size={24} />
                </View>
                <Text style={[styles.avatarActionLabel, { fontWeight: '700' }]}>Choose from Photo Library</Text>
              </Pressable>
            </View>

            {/* VIP Presets Grid with Authentic Egyptian Heritage Images */}
            <Text style={styles.presetsHeaderTitle}>Authentic Royal Presets:</Text>
            <View style={styles.presetsGrid}>
              {PRESET_AVATARS.map(item => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.presetItem,
                    (!customAvatarUri && selectedPresetId === item.id) && styles.presetItemActive,
                  ]}
                  onPress={() => handleSelectPresetAvatar(item.id)}
                >
                  <Image source={item.source} style={styles.presetImg} resizeMode="cover" />
                  <Text style={styles.presetLabel} numberOfLines={1}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.cancelModalBtn}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Personal Info Modal */}
      <Modal visible={isEditing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Personal Information</Text>
              <Pressable onPress={() => setIsEditing(false)} hitSlop={10}>
                <X color="#64748B" size={22} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderSelectRow}>
                {['Male', 'Female', 'Other'].map(g => (
                  <Pressable
                    key={g}
                    style={[
                      styles.genderPill,
                      editGender === g && styles.genderPillActive,
                    ]}
                    onPress={() => setEditGender(g)}
                  >
                    <Text
                      style={[
                        styles.genderPillText,
                        editGender === g && styles.genderPillTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Country / Region</Text>
              <TextInput
                style={styles.modalInput}
                value={editCountry}
                onChangeText={setEditCountry}
                placeholder="Country"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>City of Residence</Text>
              <TextInput
                style={styles.modalInput}
                value={editCity}
                onChangeText={setEditCity}
                placeholder="City"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Most Visited City</Text>
              <TextInput
                style={styles.modalInput}
                value={editMostVisited}
                onChangeText={setEditMostVisited}
                placeholder="e.g. Dubai, London, Paris"
                placeholderTextColor="#94A3B8"
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.modalSaveBtn} onPress={handleSaveProfile}>
                <Check color="#FFFFFF" size={16} strokeWidth={2.4} />
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  avatarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: -0.4,
  },
  tierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  vanirIdText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  verifiedEmailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  verifiedEmailText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D4AF37',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
  },
  changePhotoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  securityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  fieldLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    maxWidth: '50%',
    textAlign: 'right',
  },
  fieldDivider: {
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.08)',
  },
  accountSubText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  thirdPartyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  thirdPartyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thirdPartyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
  },
  linkActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
  },
  unlinkActionBtn: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  linkActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917',
  },
  unlinkActionText: {
    color: '#64748B',
  },
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 18,
    paddingVertical: 14,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  // Avatar Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  avatarModalSheet: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#D4AF37',
  },
  avatarModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
  },
  avatarModalSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  avatarActionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  avatarActionItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  avatarActionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917',
  },
  presetsHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  presetItem: {
    width: '31%',
    alignItems: 'center',
    padding: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: '#FFFFFF',
  },
  presetItemActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  presetImg: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginBottom: 6,
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C1917',
    textAlign: 'center',
  },
  cancelModalBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  // Edit Profile Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  editModalContent: {
    backgroundColor: '#FAF9F6',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  editModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1917',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 10,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1917',
  },
  genderSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
  },
  genderPillActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  genderPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  genderPillTextActive: {
    color: '#1C1917',
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
  },
});
