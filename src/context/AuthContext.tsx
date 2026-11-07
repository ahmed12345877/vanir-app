import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { trpc } from '../lib/trpc';
import {
  restoreServerSession,
  signInWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  signOutEverywhere,
  signUpWithEmail,
} from '../services/firebase';

export interface UserSessionData {
  id: string;
  email: string | null;
  name: string | null;
}

type AuthContextValue = {
  user: UserSessionData | unknown | null;
  firebaseUser: FirebaseAuthTypes.User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = '@vanir_auth_user';

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();
  const logoutMutation = trpc.auth.logout.useMutation();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [localUser, setLocalUser] = useState<UserSessionData | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(
    async (currentUser?: FirebaseAuthTypes.User | null) => {
      if (currentUser) {
        await restoreServerSession(currentUser).catch(() => undefined);
      }
      await utils.auth.me.invalidate().catch(() => undefined);
    },
    [utils.auth.me],
  );

  // Load cached user session on start
  useEffect(() => {
    const loadCachedSession = async () => {
      try {
        const cached = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email) {
            setLocalUser(parsed);
          }
        }
      } catch {}
    };
    loadCachedSession();
  }, []);

  useEffect(() => {
    const unsubscribe = restoreServerSessionListener(async currentUser => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        const sessionData: UserSessionData = {
          id: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName ?? 'VIP Member',
        };
        setLocalUser(sessionData);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData)).catch(() => {});
      }
      try {
        await refreshSession(currentUser);
        setError(null);
      } catch (sessionError) {
        setError(sessionError instanceof Error ? sessionError.message : 'Failed to restore session.');
      } finally {
        setBootstrapped(true);
      }
    });

    return unsubscribe;
  }, [refreshSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const currentUser = await signInWithEmail(email, password);
      const sessionData: UserSessionData = {
        id: currentUser.uid,
        email: currentUser.email ?? email.trim().toLowerCase(),
        name: currentUser.displayName ?? 'VIP Member',
      };
      setLocalUser(sessionData);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData)).catch(() => {});
      await refreshSession(currentUser);
    },
    [refreshSession],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setError(null);
      const currentUser = await signUpWithEmail(email, password, name);
      const sessionData: UserSessionData = {
        id: currentUser.uid,
        email: currentUser.email ?? email.trim().toLowerCase(),
        name: name || currentUser.displayName || 'VIP Member',
      };
      setLocalUser(sessionData);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData)).catch(() => {});
      await refreshSession(currentUser);
    },
    [refreshSession],
  );

  const signInGoogle = useCallback(async () => {
    setError(null);
    const currentUser = await signInWithGoogle();
    const sessionData: UserSessionData = {
      id: currentUser.uid,
      email: currentUser.email,
      name: currentUser.displayName ?? 'VIP Member',
    };
    setLocalUser(sessionData);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData)).catch(() => {});
    await refreshSession(currentUser);
  }, [refreshSession]);

  const signInFacebook = useCallback(async () => {
    setError(null);
    const currentUser = await signInWithFacebook();
    const sessionData: UserSessionData = {
      id: currentUser.uid,
      email: currentUser.email,
      name: currentUser.displayName ?? 'VIP Member',
    };
    setLocalUser(sessionData);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData)).catch(() => {});
    await refreshSession(currentUser);
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    setError(null);
    await logoutMutation.mutateAsync().catch(() => undefined);
    await signOutEverywhere().catch(() => undefined);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {});
    setFirebaseUser(null);
    setLocalUser(null);
    queryClient.clear();
    utils.auth.me.setData(undefined, null);
  }, [logoutMutation, queryClient, utils.auth.me]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? (firebaseUser ? { id: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName ?? 'VIP Member' } : localUser),
      firebaseUser,
      isAuthenticated: Boolean(meQuery.data || firebaseUser || localUser),
      isLoading: !bootstrapped || meQuery.isFetching || logoutMutation.isPending,
      error,
      signIn,
      signUp,
      signInGoogle,
      signInFacebook,
      signOut,
    }),
    [bootstrapped, error, firebaseUser, localUser, logoutMutation.isPending, meQuery.data, meQuery.isFetching, signIn, signInFacebook, signInGoogle, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

function restoreServerSessionListener(
  onChange: (user: FirebaseAuthTypes.User | null) => Promise<void>,
) {
  return auth().onAuthStateChanged(user => {
    onChange(user).catch(() => undefined);
  });
}
