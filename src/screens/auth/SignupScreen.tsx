import React, { useState } from 'react';
import {
  Alert,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { GoogleLogo, FacebookLogo, AppleIdLogo } from '../../components/SocialLogos';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { signUp, signInGoogle, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignUp() {
    try {
      await signUp(name, email, password);
      navigation.goBack();
    } catch (authError) {
      Alert.alert(
        t('auth.signup.errors.title'),
        authError instanceof Error ? authError.message : t('auth.signup.errors.default'),
      );
    }
  }

  async function handleGoogleAuth() {
    try {
      await signInGoogle();
      navigation.goBack();
    } catch (authError) {
      Alert.alert(
        t('auth.signup.errors.google_title'),
        authError instanceof Error ? authError.message : t('auth.signup.errors.default'),
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.brand}>VANIR</Text>
            <Text style={styles.tagline}>ELITE TRAVEL</Text>
            <Text style={styles.headline}>{t('auth.signup.title')}</Text>
            <Text style={styles.subheadline}>
              {t('auth.signup.subtitle')}
            </Text>
          </View>

          {/* Social Logins */}
          <View style={styles.socialBlock}>
            <Pressable
              style={({ pressed }) => [
                styles.socialBtn,
                pressed && styles.socialBtnPressed,
              ]}
              onPress={handleGoogleAuth}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#FFFFFF', '#FAF9F6']}
                style={styles.socialBtnGlass}
              >
                <GoogleLogo size={20} />
                <Text style={styles.socialLabel}>{t('auth.signup.continue_google')}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.socialBtn,
                pressed && styles.socialBtnPressed,
              ]}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#FFFFFF', '#FAF9F6']}
                style={styles.socialBtnGlass}
              >
                <AppleIdLogo size={20} color="#1C1917" />
                <Text style={styles.socialLabel}>{t('auth.signup.continue_apple')}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.socialBtn,
                pressed && styles.socialBtnPressed,
              ]}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#FFFFFF', '#FAF9F6']}
                style={styles.socialBtnGlass}
              >
                <FacebookLogo size={20} />
                <Text style={styles.socialLabel}>{t('auth.signup.continue_facebook')}</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.signup.divider')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.formBlock}>
            <TextInput
              placeholder={t('auth.signup.form.name')}
              placeholderTextColor="#94A3B8"
              style={styles.input}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              placeholder={t('auth.signup.form.email')}
              placeholderTextColor="#94A3B8"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder={t('auth.signup.form.password')}
              placeholderTextColor="#94A3B8"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.primaryBtnPressed,
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#D4AF37', '#C49B27']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>
                  {isLoading ? t('auth.signup.loading') : t('auth.signup.submit')}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.signup.footer.text')}</Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}> {t('auth.signup.footer.link')}</Text>
            </Pressable>
          </View>

          <Text style={styles.terms}>
            {t('auth.signup.terms_prefix')}{' '}
            <Text style={styles.termsLink}>{t('auth.signup.terms_of_service')}</Text> {' '}
            {t('auth.signup.terms_and')}{' '}
            <Text style={styles.termsLink}>{t('auth.signup.privacy_policy')}</Text>
            {t('auth.signup.terms_suffix')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
  headerBlock: { alignItems: 'center', gap: spacing[2] },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 10,
    fontFamily: 'Georgia',
  },
  tagline: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 5,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1917',
    marginTop: spacing[4],
  },
  subheadline: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  socialBlock: { gap: spacing[3] },
  socialBtn: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  socialBtnPressed: { opacity: 0.75 },
  socialBtnGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    gap: spacing[3],
  },
  socialLogo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
    width: 24,
    textAlign: 'center',
  },
  socialLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.1)',
  },
  dividerText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  formBlock: { gap: spacing[4] },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: borderRadius.lg,
    color: '#1C1917',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: 15,
    textAlign: 'right',
  },
  errorText: { color: colors.danger, fontSize: 13, textAlign: 'center' },
  primaryBtn: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing[2],
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnPressed: { opacity: 0.85 },
  primaryBtnGradient: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#1C1917',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14, color: '#64748B' },
  footerLink: { fontSize: 14, color: '#D4AF37', fontWeight: '700' },
  terms: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { color: '#D4AF37', fontWeight: '600' },
});
