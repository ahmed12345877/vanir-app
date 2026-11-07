import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { GoogleLogo, AppleIdLogo } from '../../components/SocialLogos';
import { useAuth } from '../../context/AuthContext';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const REMEMBERED_EMAIL_KEY = '@vanir_remembered_email';

function getFriendlyErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const code = err?.code || '';
  const message = err?.message || '';

  if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/user-not-found' || message.includes('user-not-found')) {
    return 'No VIP account found with this email. Switch to "Create VIP Account" above to register.';
  }
  if (
    code === 'auth/wrong-password' ||
    code === 'auth/invalid-credential' ||
    message.includes('wrong-password') ||
    message.includes('invalid-credential')
  ) {
    return 'Incorrect email or password. Please verify and try again, or use Forgot Password.';
  }
  if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
    return 'This email is already registered. Please switch to "Sign In" above.';
  }
  if (code === 'auth/weak-password' || message.includes('weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/network-request-failed' || message.includes('network')) {
    return 'Network connection failed. Please check your internet connectivity.';
  }
  if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
    return 'Access temporarily locked due to multiple attempts. Please try again in a few moments.';
  }
  return message || 'Authentication failed. Please check your credentials.';
}

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn, signUp, signInGoogle, isAuthenticated, isLoading: authLoading } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeField, setActiveField] = useState<'name' | 'email' | 'phone' | 'password' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('MainTabs');
    }
  }, [isAuthenticated, navigation]);

  // Load remembered email on mount
  useEffect(() => {
    async function loadSavedEmail() {
      try {
        const saved = await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (saved) {
          setEmail(saved);
          setRememberMe(true);
        }
      } catch {
        // Silently continue
      }
    }
    loadSavedEmail();
  }, []);

  async function handleSignIn() {
    setErrorMessage(null);
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, cleanEmail).catch(() => {});
      } else {
        await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY).catch(() => {});
      }

      await signIn(cleanEmail, cleanPass);
      navigation.navigate('MainTabs');
    } catch (err: any) {
      const friendly = getFriendlyErrorMessage(err);
      setErrorMessage(friendly);
      Alert.alert('Sign In Failed', friendly);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp() {
    setErrorMessage(null);
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please create a password.');
      return;
    }
    if (cleanPass.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, cleanEmail).catch(() => {});
      }

      await signUp(cleanName, cleanEmail, cleanPass);
      navigation.navigate('MainTabs');
    } catch (err: any) {
      const friendly = getFriendlyErrorMessage(err);
      setErrorMessage(friendly);
      Alert.alert('Registration Failed', friendly);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleAuth() {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signInGoogle();
      navigation.navigate('MainTabs');
    } catch (authError: any) {
      if (
        authError?.code === '12501' ||
        authError?.code === 'SIGN_IN_CANCELLED' ||
        authError?.message?.includes('cancel')
      ) {
        return;
      }
      const friendly = getFriendlyErrorMessage(authError);
      setErrorMessage(friendly);
      Alert.alert('Google Sign-In', friendly);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAppleAuth() {
    if (Platform.OS === 'ios') {
      Alert.alert('Apple Sign-In', 'Connecting to Apple ID Authentication...');
    } else {
      Alert.alert(
        'Apple Sign-In',
        'Apple ID Sign-In is optimized for iOS devices. On Android, please use Google Sign-In or your VIP Email.',
      );
    }
  }

  function handleForgotPassword() {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert(
        'Reset Password',
        'Please enter your email address in the field above first, then tap Forgot Password.',
      );
      return;
    }

    Alert.alert(
      'Password Reset',
      `Dispatch a password reset link to ${cleanEmail}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: async () => {
            try {
              setIsResettingPassword(true);
              await auth().sendPasswordResetEmail(cleanEmail);
              Alert.alert(
                'Email Dispatched',
                `A password reset link has been sent to ${cleanEmail}. Please check your inbox.`,
              );
            } catch (resetErr: any) {
              const friendly = getFriendlyErrorMessage(resetErr);
              Alert.alert('Reset Failed', friendly);
            } finally {
              setIsResettingPassword(false);
            }
          },
        },
      ],
    );
  }

  const isLoading = authLoading || isSubmitting;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Atmospheric Luxury Backdrop */}
      <Image
        source={require('../../assets/images/welcome_destination_bg.jpg')}
        style={styles.backdropImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          'rgba(10, 8, 7, 0.78)',
          'rgba(14, 12, 10, 0.90)',
          'rgba(16, 13, 11, 0.97)',
          '#0C0A09',
        ]}
        locations={[0, 0.35, 0.7, 1]}
        style={styles.gradientOverlay}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: Math.max(insets.top + 10, 20),
                paddingBottom: Math.max(insets.bottom + 24, 32),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Top Brand Mark & Titles */}
            <View style={styles.brandSection}>
              <View style={styles.logoHalo}>
                <Image
                  source={require('../../assets/vanir_round_logo.png')}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </View>

              <Text style={styles.brandTitle}>VANIR</Text>
              <Text style={styles.brandTagline}>ROYAL CONCIERGE & PRIVATE CLUB</Text>
              <Text style={styles.brandDescription}>
                {authMode === 'signup'
                  ? 'Join our private membership to unlock bespoke aviation, luxury villas & personal concierge.'
                  : 'Access your private itineraries, concierge bookings & membership privileges.'}
              </Text>
            </View>

            {/* 2. Luxury Segmented Switcher */}
            <View style={styles.modeTabsWrapper}>
              <Pressable
                style={[
                  styles.modeTab,
                  authMode === 'signin' && styles.modeTabActive,
                ]}
                onPress={() => {
                  setErrorMessage(null);
                  setAuthMode('signin');
                }}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    authMode === 'signin' && styles.modeTabTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modeTab,
                  authMode === 'signup' && styles.modeTabActive,
                ]}
                onPress={() => {
                  setErrorMessage(null);
                  setAuthMode('signup');
                }}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    authMode === 'signup' && styles.modeTabTextActive,
                  ]}
                >
                  Create Account
                </Text>
              </Pressable>
            </View>

            {/* 3. Main Auth Card */}
            <View style={styles.cardContainer}>
              {/* Optional Inline Error Banner */}
              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Full Name Input (Sign Up Only) */}
              {authMode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <View
                    style={[
                      styles.inputBox,
                      activeField === 'name' && styles.inputBoxActive,
                    ]}
                  >
                    <User
                      size={18}
                      color={activeField === 'name' ? '#D4AF37' : '#8A8175'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Alexander Vance"
                      placeholderTextColor="#78716C"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      onFocus={() => setActiveField('name')}
                      onBlur={() => setActiveField(null)}
                    />
                  </View>
                </View>
              )}

              {/* Email Address Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View
                  style={[
                    styles.inputBox,
                    activeField === 'email' && styles.inputBoxActive,
                  ]}
                >
                  <Mail
                    size={18}
                    color={activeField === 'email' ? '#D4AF37' : '#8A8175'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="vip.member@vanir.com"
                    placeholderTextColor="#78716C"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                  />
                </View>
              </View>

              {/* Phone Input (Sign Up Only) */}
              {authMode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PHONE / WHATSAPP (OPTIONAL)</Text>
                  <View
                    style={[
                      styles.inputBox,
                      activeField === 'phone' && styles.inputBoxActive,
                    ]}
                  >
                    <Phone
                      size={18}
                      color={activeField === 'phone' ? '#D4AF37' : '#8A8175'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="+971 50 000 0000"
                      placeholderTextColor="#78716C"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      onFocus={() => setActiveField('phone')}
                      onBlur={() => setActiveField(null)}
                    />
                  </View>
                </View>
              )}

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View
                  style={[
                    styles.inputBox,
                    activeField === 'password' && styles.inputBoxActive,
                  ]}
                >
                  <Lock
                    size={18}
                    color={activeField === 'password' ? '#D4AF37' : '#8A8175'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      authMode === 'signup'
                        ? 'Minimum 6 characters'
                        : 'Your account password'
                    }
                    placeholderTextColor="#78716C"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField(null)}
                  />
                  <Pressable
                    onPress={() => setShowPassword(p => !p)}
                    style={styles.eyeBtn}
                    hitSlop={10}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#D4AF37" />
                    ) : (
                      <Eye size={18} color="#8A8175" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Form Options Row (Sign In Mode) */}
              {authMode === 'signin' ? (
                <View style={styles.metaRow}>
                  <Pressable
                    style={styles.rememberRow}
                    onPress={() => setRememberMe(p => !p)}
                    hitSlop={8}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <Check size={12} color="#0C0A09" strokeWidth={3} />}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </Pressable>

                  <Pressable onPress={handleForgotPassword} disabled={isResettingPassword} hitSlop={8}>
                    <Text style={styles.forgotText}>
                      {isResettingPassword ? 'Sending...' : 'Forgot password?'}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ height: 6 }} />
              )}

              {/* Primary VIP Gold Action Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.ctaButton,
                  pressed && styles.ctaButtonPressed,
                  isLoading && styles.ctaButtonDisabled,
                ]}
                onPress={authMode === 'signup' ? handleSignUp : handleSignIn}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#F5D67D', '#D4AF37', '#997316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#0C0A09" />
                  ) : (
                    <>
                      <Text style={styles.ctaText}>
                        {authMode === 'signup' ? 'CREATE VIP ACCOUNT' : 'SIGN IN TO VANIR'}
                      </Text>
                      <ArrowRight size={18} color="#0C0A09" strokeWidth={2.6} />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Logins */}
              <View style={styles.socialRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.socialBtn,
                    pressed && styles.socialBtnPressed,
                  ]}
                  onPress={handleGoogleAuth}
                  disabled={isLoading}
                >
                  <GoogleLogo size={20} />
                  <Text style={styles.socialBtnText}>Google</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.socialBtn,
                    pressed && styles.socialBtnPressed,
                  ]}
                  onPress={handleAppleAuth}
                  disabled={isLoading}
                >
                  <AppleIdLogo size={20} color="#FFFFFF" />
                  <Text style={styles.socialBtnText}>Apple</Text>
                </Pressable>
              </View>
            </View>

            {/* 4. Secondary Guest Access */}
            <View style={styles.guestSection}>
              <Pressable
                style={({ pressed }) => [
                  styles.guestBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => navigation.navigate('MainTabs')}
                hitSlop={12}
              >
                <Text style={styles.guestBtnText}>
                  Continue as Guest <Text style={styles.guestArrow}>→</Text>
                </Text>
              </Pressable>

              <View style={styles.securityRow}>
                <ShieldCheck size={14} color="#D4AF37" strokeWidth={2.2} />
                <Text style={styles.securityText}>
                  256-BIT ENCRYPTION • PRIVATE CLIENT ACCESS
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0A09',
  },
  backdropImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    opacity: 0.22,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoHalo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    backgroundColor: 'rgba(28, 24, 20, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 3,
    marginTop: 4,
    marginBottom: 8,
  },
  brandDescription: {
    fontSize: 13,
    color: '#A8A29E',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  modeTabsWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 21, 18, 0.85)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  modeTabActive: {
    backgroundColor: '#2A241E',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A8A29E',
    letterSpacing: 0.5,
  },
  modeTabTextActive: {
    color: '#F5D67D',
    fontWeight: '700',
  },
  cardContainer: {
    backgroundColor: 'rgba(24, 21, 18, 0.92)',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  errorBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#FCA5A5',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1916',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    paddingHorizontal: 14,
    height: 50,
  },
  inputBoxActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#221E19',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    height: '100%',
  },
  eyeBtn: {
    padding: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: '#1C1916',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  rememberText: {
    color: '#D6D3D1',
    fontSize: 12,
  },
  forgotText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#0C0A09',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
  },
  dividerLabel: {
    color: '#8A8175',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#1E1A16',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  socialBtnPressed: {
    backgroundColor: '#26211C',
    borderColor: 'rgba(212, 175, 55, 0.45)',
  },
  socialBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  guestSection: {
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  guestBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  guestBtnText: {
    color: '#A8A29E',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  guestArrow: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    color: '#78716C',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
