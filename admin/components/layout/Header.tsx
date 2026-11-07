'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut, Search, Sparkles, Menu } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';
import { useSidebar } from '@/components/layout/SidebarContext';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'لوحة التحكم الرئيسية', subtitle: 'نظرة عامة على نشاط المنظومة، الحجوزات ومؤشرات الأداء' },
  '/app-controls': { title: 'التحكم في أزرار وصور التطبيق', subtitle: 'تفعيل وتعطيل أزرار التطبيق وتعديل صور وبانرات الصفحة الرئيسية' },
  '/services/packages': { title: 'البرامج والرحلات السياحية', subtitle: 'إدارة الباقات والرحلات الحصرية وتجارب السفر الفاخرة' },
  '/blog': { title: 'إدارة المدونة', subtitle: 'نشر وتعديل مقالات وأدلة السفر السياحية' },
  '/destinations': { title: 'الوجهات السياحية', subtitle: 'إدارة المدن والوجهات العالمية والمواقع السياحية' },
  '/offers': { title: 'العروض والخصومات', subtitle: 'إدارة العروض الترويجية والخصومات الحصرية' },
  '/activities': { title: 'الأنشطة والفعاليات', subtitle: 'إدارة التجارب والفعاليات الترفيهية والسياحية' },
  '/gallery': { title: 'معرض الصور', subtitle: 'إدارة الصور والمحتوى المرئي للموقع والتطبيق' },
  '/reviews': { title: 'التقييمات والآراء', subtitle: 'مراجعات وتقييمات العملاء وضيوف VIP' },
  '/bookings': { title: 'الحجوزات والطلبات', subtitle: 'متابعة وتأكيد حجوزات الطيران والفنادق والرحلات' },
  '/messages': { title: 'الرسائل والاستفسارات', subtitle: 'صندوق رسائل العملاء وطلبات الاستفسار' },
  '/users': { title: 'العملاء والمستخدمين', subtitle: 'بيانات العملاء وحسابات VIP المسجلة' },
  '/credits': { title: 'الرصيد والمعاملات', subtitle: 'العمليات المالية والمدفوعات والمحافظ الإلكترونية' },
  '/jets': { title: 'الطيران الخاص', subtitle: 'أسطول الطائرات الخاصة والرحلات الحصرية' },
  '/yachts': { title: 'اليخوت الفاخرة', subtitle: 'أسطول اليخوت والرحلات البحرية الفخمة' },
  '/hotels': { title: 'الفنادق والمنتجعات', subtitle: 'محفظة الفنادق 5 نجوم والشقق الفندقية' },
  '/transfers': { title: 'الليموزين والسيارات', subtitle: 'أسطول السيارات الفاخرة وخدمات الاستقبال بالمطار' },
  '/ai-studio': { title: 'المساعد الذكي VIP', subtitle: 'إعدادات وخوارزميات الذكاء الاصطناعي للسياحة' },
  '/notifications': { title: 'الإشعارات السحابية', subtitle: 'إرسال إشعارات وتنبيهات مباشرة لهواتف المستخدمين' },
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const page = Object.entries(PAGE_TITLES)
    .sort(([left], [right]) => right.length - left.length)
    .find(([route]) => pathname === route || pathname.startsWith(`${route}/`))?.[1]
    ?? { title: 'لوحة التحكم', subtitle: 'فانير جروب للخدمات الفاخرة' };
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const SEARCH_ITEMS = [
    { title: 'التحكم في أزرار وصور التطبيق', category: 'التطبيق المباشر', href: '/app-controls', icon: '📸' },
    { title: 'أسطول الطيران الخاص (Private Jets)', category: 'الأسطول', href: '/jets', icon: '✈️' },
    { title: 'أسطول اليخوت الملكية الفاخرة', category: 'الأسطول', href: '/yachts', icon: '⛵' },
    { title: 'الفنادق والمنتجعات 5 نجوم', category: 'الإقامة', href: '/hotels', icon: '🏨' },
    { title: 'البرامج والجولات السياحية الملكية', category: 'البرامج', href: '/services/packages', icon: '🧭' },
    { title: 'أسطول الليموزين وسيارات الاستقبال', category: 'الأسطول', href: '/transfers', icon: '🚗' },
    { title: 'الوجهات والمدن السياحية العالمية', category: 'المحتوى', href: '/destinations', icon: '📍' },
    { title: 'العروض وأكواد الخصم الترويجية', category: 'العروض', href: '/offers', icon: '🏷️' },
    { title: 'معرض الصور والوسائط الملكي', category: 'الوسائط', href: '/gallery', icon: '🖼️' },
    { title: 'الحجوزات والطلبات المباشرة', category: 'العمليات', href: '/bookings', icon: '📋' },
    { title: 'إرسال إشعار سحابي فوري (FCM)', category: 'الإشعارات', href: '/notifications', icon: '🔔' },
    { title: 'بيانات العملاء وضيوف VIP', category: 'المستخدمين', href: '/users', icon: '👑' },
    { title: 'المساعد السياحي الذكي VIP Concierge', category: 'الذكاء الاصطناعي', href: '/ai-studio', icon: '🤖' },
  ];

  const searchResults = searchValue.trim()
    ? SEARCH_ITEMS.filter(
        item =>
          item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          item.category.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : [];

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  function handleSelectResult(href: string) {
    window.location.href = href;
    setSearchValue('');
    setSearchFocused(false);
  }

  return (
    <header className="relative flex h-16 sm:h-20 flex-shrink-0 items-center justify-between gap-2 sm:gap-4 border-b border-white/[0.08] bg-[#0d0d12]/95 px-3 sm:px-6 backdrop-blur-md">
      {/* Mobile Drawer Toggle & Page Title */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={toggle}
          aria-label="فتح القائمة الرئيسية"
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-[#16161e] text-[#c9a84c] hover:bg-white/[0.05] transition-all shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-bold text-[#F8F9FA] tracking-wide truncate">{page.title}</h1>
          {page.subtitle && (
            <p className="hidden sm:block mt-0.5 truncate text-xs text-[#8892B0]">{page.subtitle}</p>
          )}
        </div>
      </div>

      {/* Center Search Bar & Command Palette */}
      <div className="relative hidden lg:block">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="بحث في الحجوزات، الصور، الأسطول، العملاء…"
          value={searchValue}
          onFocus={() => setSearchFocused(true)}
          onChange={e => setSearchValue(e.target.value)}
          className="w-72 xl:w-80 rounded-xl border border-white/[0.1] bg-[#16161e] py-2.5 pr-10 pl-14 text-sm text-[#F8F9FA] placeholder-[#64748B] focus:border-[#c9a84c] focus:outline-none transition-colors text-right"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md border border-white/[0.1] px-1.5 py-0.5 text-[10px] font-mono text-[#8892B0]">
          ⌘K
        </span>

        {/* Live Search Results Dropdown */}
        {searchFocused && searchValue.trim() && (
          <div className="absolute top-full mt-2 right-0 w-96 rounded-2xl border border-[rgba(201,168,76,0.3)] bg-[#12121c] p-2 shadow-2xl z-50 text-right backdrop-blur-xl">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onMouseDown={() => handleSelectResult(item.href)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs hover:bg-[rgba(201,168,76,0.12)] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <span className="font-semibold text-[#F8F9FA] group-hover:text-[#c9a84c]">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8892B0] bg-white/[0.04] px-2 py-0.5 rounded-md font-mono">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#8892B0]">
                لا توجد نتائج مطابقة لـ "{searchValue}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Live Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>مباشر</span>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => router.push('/notifications')}
          className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#16161e] text-[#8892B0] hover:text-[#F8F9FA] hover:border-white/[0.18] transition-all"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#c9a84c]" />
        </button>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          title="تسجيل الخروج"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
