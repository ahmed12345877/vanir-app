'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signIn, signInGoogle } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@vanirgroup.com');
  const [password, setPassword] = useState('VanirAdmin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch {
      setError('Invalid credentials. Please verify your email and password or use Google Sign-In.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);
    try {
      await signInGoogle();
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#07070a] px-4 py-12 selection:bg-[#c9a84c] selection:text-[#07070a]">
      {/* Background Image with Luxury Deep Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/the_nile_river_cairo.jpg"
          alt="The Nile Cairo Backdrop"
          fill
          unoptimized
          priority
          className="object-cover opacity-25 filter blur-[2px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07070a]/75 via-[#07070a]/90 to-[#07070a]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.12)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-[slide-up_0.4s_ease-out]">
        {/* Brand Header with Glowing Vanir Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3 flex items-center justify-center">
            {/* Ambient Gold Glow Halo */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#c9a84c] via-[#ecd58e] to-[#8b6914] opacity-40 blur-xl animate-pulse" />
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#c9a84c] bg-[#0c0c14] p-1 shadow-[0_0_40px_rgba(201,168,76,0.45)]">
              <Image
                src="/vanir_round_logo.png"
                alt="Vanir Luxury Logo"
                fill
                unoptimized
                className="object-cover rounded-full"
              />
            </div>
          </div>

          <p className="font-display text-2xl font-bold tracking-[6px] text-[#f5f0e8] drop-shadow-md">
            VANIR
          </p>

          {/* Slogan Capsule */}
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.08)] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ecd58e]">
            <Sparkles className="h-3 w-3 text-[#c9a84c]" />
            <span>WE CRAFT HAPPINESS</span>
          </div>

          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#8892B0]">
            Executive Cloud Control Center
          </p>
        </div>

        {/* Glassmorphic Luxury Login Card */}
        <div className="rounded-[28px] border border-[rgba(201,168,76,0.22)] bg-[rgba(15,15,26,0.85)] p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h1 className="text-xl font-bold text-[#f5f0e8]">Admin Authentication</h1>
              <p className="mt-0.5 text-xs text-[#8892B0]">Sign in to manage services, tours & app images</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] text-[#c9a84c]">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          {/* 1-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/[0.14] bg-white/[0.05] px-4 py-3 text-sm font-semibold text-[#f5f0e8] transition-all duration-200 hover:border-[rgba(201,168,76,0.5)] hover:bg-white/[0.09] hover:shadow-[0_4px_20px_rgba(201,168,76,0.15)] disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Connecting to Google…' : 'Sign In with Google Account'}</span>
          </button>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-white/[0.08]" />
            <span className="absolute bg-[#0f0f1a] px-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
              Or with Credentials
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#a8a099]">
                <span>Admin Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#64748B]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@vanirgroup.com"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141422] pl-10 pr-4 py-3 text-sm text-[#f5f0e8] placeholder-[#5a5560] transition-colors focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#a8a099]">
                <span>Master Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#64748B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141422] pl-10 pr-11 py-3 text-sm text-[#f5f0e8] placeholder-[#5a5560] transition-colors focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#64748B] hover:text-[#CCD6F6]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] via-[#d8b85c] to-[#8b6914] py-3 text-sm font-bold text-[#07070a] shadow-[0_8px_25px_rgba(201,168,76,0.3)] transition-all hover:brightness-110 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating…' : 'Enter Control Center'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Pre-configured Authorized Credentials Card */}
          <div className="mt-5 rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.06)] p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#ecd58e]">
              <Sparkles className="h-3.5 w-3.5 text-[#c9a84c]" />
              <span>Official Admin Account</span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8892B0]">Email:</span>
                <span className="font-mono font-medium text-[#F8F9FA] selection:bg-[#c9a84c]">
                  admin@vanirgroup.com
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8892B0]">Password:</span>
                <span className="font-mono font-medium text-[#c9a84c] selection:bg-[#c9a84c]">
                  VanirAdmin@2026!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-[#64748B]">
          <p>Vanir Group · VIP Concierge Management</p>
          <div className="mt-1 flex items-center justify-center gap-3 text-[11px] text-[#8892B0]">
            <a href="https://vanirgroup.com" target="_blank" rel="noreferrer" className="hover:text-[#c9a84c]">
              vanirgroup.com
            </a>
            <span>•</span>
            <a href="tel:+201123988882" className="hover:text-[#c9a84c]">
              +20 112 398 8882
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
