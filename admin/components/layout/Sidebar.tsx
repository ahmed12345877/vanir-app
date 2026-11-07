'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ComponentType } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  MapPin,
  Tag,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  Star,
  SlidersHorizontal,
  Compass,
  Plane,
  ShipWheel,
  Building2,
  CarFront,
  Bot,
  BriefcaseBusiness,
  MessageSquare,
  Users,
  CreditCard,
  Monitor,
  Navigation,
  FileText,
  Edit3,
  Palette,
  Database,
  ArrowRight,
  LogOut,
  ChevronLeft,
  Layers,
  X,
} from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/layout/SidebarContext';

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const SIDEBAR_SECTIONS: NavSection[] = [
  {
    items: [
      { href: '/', label: 'نظرة عامة', icon: LayoutDashboard },
      { href: '/analytics', label: 'التحليلات', icon: BarChart3 },
    ],
  },
  {
    title: 'المحتوى (CONTENT)',
    items: [
      { href: '/destinations', label: 'الوجهات', icon: MapPin },
      { href: '/offers', label: 'العروض', icon: Tag },
      { href: '/blog', label: 'المدونة', icon: BookOpen },
      { href: '/activities', label: 'الأنشطة', icon: Calendar },
      { href: '/gallery', label: 'معرض الصور', icon: ImageIcon },
      { href: '/reviews', label: 'التقييمات', icon: Star },
    ],
  },
  {
    title: 'الخدمات والتطبيق (APP & SERVICES)',
    items: [
      { href: '/services', label: 'مركز كافة الخدمات (14 خدمة)', icon: Layers, badge: 'شامل' },
      { href: '/app-controls', label: 'التحكم بالتطبيق والصور', icon: SlidersHorizontal, badge: 'مباشر' },
      { href: '/services/packages', label: 'البرامج السياحية', icon: Compass },
      { href: '/jets', label: 'الطيران الخاص', icon: Plane },
      { href: '/yachts', label: 'اليخوت الفاخرة', icon: ShipWheel },
      { href: '/hotels', label: 'الفنادق والمنتجعات', icon: Building2 },
      { href: '/transfers', label: 'الليموزين والسيارات', icon: CarFront },
      { href: '/ai-studio', label: 'المساعد الذكي VIP', icon: Bot },
    ],
  },
  {
    title: 'العمليات (OPERATIONS)',
    items: [
      { href: '/bookings', label: 'الحجوزات', icon: BriefcaseBusiness },
      { href: '/messages', label: 'الرسائل', icon: MessageSquare },
      { href: '/users', label: 'العملاء والبروفايل VIP', icon: Users, badge: 'CRM' },
      { href: '/credits', label: 'الرصيد', icon: CreditCard },
    ],
  },
  {
    title: 'التصميم (DESIGN)',
    items: [
      { href: '/design/hero', label: 'الواجهة الرئيسية (Hero)', icon: Monitor },
      { href: '/design/navbar', label: 'شريط التنقل (Navbar)', icon: Navigation },
      { href: '/design/pages', label: 'الصفحات (Pages)', icon: FileText },
      { href: '/design/editor', label: 'المحرر المباشر', icon: Edit3 },
      { href: '/design/theme', label: 'المظهر والألوان', icon: Palette },
    ],
  },
  {
    title: 'الأدوات (TOOLS)',
    items: [
      { href: '/tools/database', label: 'قاعدة البيانات المباشرة', icon: Database },
    ],
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  return (
    <div className="flex h-full flex-col text-right font-sans">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-[rgba(201,168,76,0.4)] shadow-[0_2px_12px_rgba(201,168,76,0.2)] shrink-0">
            <Image
              src="/vanir_round_logo.png"
              alt="Vanir Logo"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#c9a84c]">
              <span className="text-sm">👑</span>
              <span className="tracking-wide">Admin Panel</span>
            </div>
            <p className="text-[10px] text-[#8892B0] font-mono tracking-wider">لوحة تحكم فانير</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-[#8892B0] hover:text-[#F8F9FA] hover:bg-white/[0.06] transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 text-xs scrollbar-thin scrollbar-thumb-white/10">
        {SIDEBAR_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                {section.title}
              </p>
            )}
            {section.items.map(item => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[rgba(201,168,76,0.14)] text-[#F8F9FA] border border-[rgba(201,168,76,0.3)] shadow-[0_4px_16px_rgba(201,168,76,0.1)]'
                      : 'text-[#8892B0] hover:bg-white/[0.04] hover:text-[#CCD6F6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-[#c9a84c]' : 'text-[#64748B] group-hover:text-[#8892B0]'}`} />
                    <span className="text-xs">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronLeft className="h-3.5 w-3.5 text-[#c9a84c]" />
                  ) : null}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer: Back to Website & User Profile */}
      <div className="border-t border-white/[0.08] p-3 space-y-2 bg-[#09090d]">
        <a
          href="https://vanirgroup.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-[#8892B0] hover:text-[#F8F9FA] hover:border-white/[0.18] transition-all"
        >
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3.5 w-3.5 rotate-180 text-[#c9a84c]" />
            <span>العودة للموقع الرئيسي</span>
          </div>
          <span className="text-[10px] text-[#64748B]">vanirgroup.com</span>
        </a>

        {/* User Account Bar */}
        <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2 border border-white/[0.05]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a84c] text-xs font-bold text-[#0d0d12]">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#F8F9FA]">A "R" Roshdi</p>
              <p className="truncate text-[10px] text-[#64748B]">admin@vanirgroup.com</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="rounded-lg p-1.5 text-[#64748B] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-l border-white/[0.08] bg-[#0d0d12] text-right font-sans">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Only on small screens when isOpen is true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
            onClick={close}
          />

          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-[rgba(201,168,76,0.3)] bg-[#0d0d12] shadow-2xl text-right font-sans animate-[slide-in-right_0.25s_ease-out]">
            <SidebarContent onClose={close} />
          </aside>
        </div>
      )}
    </>
  );
}
