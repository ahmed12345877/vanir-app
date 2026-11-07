import Link from 'next/link';
import {
  CalendarCheck2,
  Compass,
  CreditCard,
  Sparkles,
  TrendingUp,
  Plane,
  ShipWheel,
  CarFront,
  SlidersHorizontal,
  Bell,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Zap,
  Globe2,
  CheckCircle2,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { RevenueChart } from '@/components/dashboard/RevenueChart';

interface KpiCardProps {
  title: string;
  value: string;
  context: string;
  delta: string;
  progress: number;
  icon: ComponentType<{ className?: string }>;
}

const KPI_CARDS: KpiCardProps[] = [
  {
    title: 'الحجوزات المؤكدة',
    value: '347',
    context: 'حجوزات نشطة تشمل الطيران الخاص، اليخوت، الفنادق والسيارات',
    delta: '+12% مقارنة بالشهر السابق',
    progress: 84,
    icon: CalendarCheck2,
  },
  {
    title: 'إجمالي قيمة الحجوزات',
    value: '$2.84M',
    context: 'حجم المعاملات للشهر الحالي شاملاً باقات كبار الشخصيات VIP',
    delta: '+18% مقارنة بالشهر السابق',
    progress: 92,
    icon: CreditCard,
  },
  {
    title: 'ضيوف VIP والعملاء',
    value: '1,284',
    context: 'عملاء النخبة المسجلين والمستفيدين من خدمات الكونسيرج الحصرية',
    delta: '+9% مقارنة بالشهر السابق',
    progress: 76,
    icon: Sparkles,
  },
  {
    title: 'الوجهات النشطة',
    value: '28',
    context: 'برامج ورحلات سياحية نشطة في أفخم العواصم والمنتجعات العالمية',
    delta: '+4 وجهات جديدة هذا الأسبوع',
    progress: 88,
    icon: Compass,
  },
];

const FLEET_STATUS = [
  {
    id: '1',
    name: 'Gulfstream G650ER',
    type: 'jet',
    code: 'N700GV',
    route: 'دبي (DXB) ✈️ باريس (LBG)',
    status: 'في الجو الآن',
    statusColor: 'emerald',
    subtext: 'ارتفاع 43,000 قدم · سرعة Mach 0.90 · الوصول بعد 1:40 س',
  },
  {
    id: '2',
    name: 'Bombardier Global 7500',
    type: 'jet',
    code: 'C-GLBL',
    route: 'مطار القاهرة الدولي VIP ✈️ الرياض',
    status: 'جاهزة للإقلاع',
    statusColor: 'amber',
    subtext: 'اكتمل تجهيز مقصورة الـ VIP · الإقلاع المتوقع 11:30 ص',
  },
  {
    id: '3',
    name: 'Mega Yacht "Vanir Royal I"',
    type: 'yacht',
    code: '85m Superyacht',
    route: 'مرسى موناكو ← كان والريفييرا',
    status: 'إبحار فاخر نشط',
    statusColor: 'emerald',
    subtext: 'على متنها 12 ضيف VIP · طاقم من 22 بحاراً ومضيفاً',
  },
  {
    id: '4',
    name: 'Rolls-Royce Phantom VIII',
    type: 'car',
    code: 'DXB-ROYAL-01',
    route: 'مطار دبي مبنى الطيران الخاص ← برج العرب',
    status: 'في مهمة استقبال',
    statusColor: 'blue',
    subtext: 'خدمة استقبال كبار الشخصيات مع سائق خاص VIP',
  },
];

function KpiCard({ title, value, context, delta, progress, icon: Icon }: KpiCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(180deg,#14141e,#0e0e16)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.3)] text-right transition-all duration-300 hover:border-[rgba(201,168,76,0.3)] hover:shadow-[0_20px_50px_rgba(201,168,76,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] text-[#c9a84c] transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
          {delta}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs font-semibold tracking-wider text-[#8892B0]">{title}</p>
        <p className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-[#F8F9FA]">{value}</p>
        <p className="mt-2 text-xs leading-5 text-[#8892B0]">{context}</p>
      </div>
      {/* Progress Bar Accent */}
      <div className="mt-4 pt-3 border-t border-white/[0.05]">
        <div className="flex justify-between items-center text-[10px] text-[#64748B] mb-1 font-mono">
          <span>معدل الإنجاز الشهري</span>
          <span className="text-[#c9a84c]">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e6c875] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </article>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-6 animate-[slide-up_0.3s_ease-out] text-right font-sans">
      {/* Real-Time System Heartbeat & Cloud Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#11111a] px-5 py-3 text-xs shadow-md">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-[#F8F9FA]">سيرفر المزامنة السحابية:</span>
            <span className="text-emerald-400 font-mono font-semibold">متصل ونشط لحظياً (Firebase Live)</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[#8892B0]">
            <Zap className="h-3.5 w-3.5 text-[#c9a84c]" />
            <span>زمن الاستجابة: <strong className="text-[#CCD6F6] font-mono">18ms</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[#8892B0]">
            <Globe2 className="h-3.5 w-3.5 text-blue-400" />
            <span>المستخدمين النشطين بالتطبيق: <strong className="text-[#CCD6F6] font-mono">342 متصل</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#8892B0]">حالة بوابة الإشعارات:</span>
          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
            FCM جاهز للبث
          </span>
        </div>
      </div>

      {/* Hero Executive Banner */}
      <section className="relative overflow-hidden rounded-[32px] border border-[rgba(201,168,76,0.25)] bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.14),transparent_45%),linear-gradient(180deg,#161624,#0d0d15)] p-6 md:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-[#c9a84c]">
              <div className="h-px w-10 bg-[#c9a84c]/60" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">لوحة القيادة التنفيذية الملكية</span>
            </div>
            <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight text-[#F8F9FA]">
              رؤية تنفيذية شاملة لأسطول فانير الفاخر، الإيرادات، وتجربة ضيوف VIP.
            </h2>
            <p className="mt-3 max-w-xl text-xs md:text-sm leading-6 text-[#8892B0]">
              تحكم كامل في كافة محتويات وصور التطبيق مباشرة من جهازك، متابعة تحركات الطائرات واليخوت، وتنسيق خدمات الكونسيرج الفورية.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-right backdrop-blur-sm">
              <p className="text-xs font-semibold text-[#8892B0]">التوقيت والتقويم</p>
              <p className="mt-1 text-sm font-bold text-[#F8F9FA]">
                {new Date().toLocaleDateString('ar-EG', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-right backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[#c9a84c]">
                <TrendingUp className="h-4 w-4" />
                <p className="text-xs font-semibold text-[#8892B0]">مؤشر الحجوزات</p>
              </div>
              <p className="mt-1 text-sm font-bold text-emerald-400">نشاط استثنائي (+18% نمو)</p>
            </div>
          </div>
        </div>

        {/* Executive Quick Actions Toolbar */}
        <div className="mt-8 border-t border-white/[0.08] pt-6">
          <p className="text-xs font-bold text-[#c9a84c] mb-3">الوصول السريع والإجراءات الفورية:</p>
          <div className="flex flex-wrap gap-2.5">
            <a
              href="/app-controls"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-4 py-2.5 text-xs font-bold text-[#0d0d12] shadow-md hover:scale-105 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>إدارة صور وبانرات التطبيق 📸</span>
            </a>
            <a
              href="/notifications"
              className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#14141e] px-4 py-2.5 text-xs font-semibold text-[#F8F9FA] hover:border-[rgba(201,168,76,0.4)] hover:bg-[#1c1c28] transition-all"
            >
              <Bell className="h-4 w-4 text-[#c9a84c]" />
              <span>إرسال إشعار فوري للعملاء 🔔</span>
            </a>
            <a
              href="/jets"
              className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#14141e] px-4 py-2.5 text-xs font-semibold text-[#F8F9FA] hover:border-[rgba(201,168,76,0.4)] hover:bg-[#1c1c28] transition-all"
            >
              <Plane className="h-4 w-4 text-blue-400" />
              <span>أسطول الطيران الخاص ✈️</span>
            </a>
            <a
              href="/yachts"
              className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#14141e] px-4 py-2.5 text-xs font-semibold text-[#F8F9FA] hover:border-[rgba(201,168,76,0.4)] hover:bg-[#1c1c28] transition-all"
            >
              <ShipWheel className="h-4 w-4 text-emerald-400" />
              <span>اليخوت الفاخرة ⛵</span>
            </a>
            <a
              href="/hotels"
              className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#14141e] px-4 py-2.5 text-xs font-semibold text-[#F8F9FA] hover:border-[rgba(201,168,76,0.4)] hover:bg-[#1c1c28] transition-all"
            >
              <Building2 className="h-4 w-4 text-purple-400" />
              <span>الفنادق والمنتجعات 🏨</span>
            </a>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {KPI_CARDS.map(card => (
          <KpiCard key={card.title} {...card} />
        ))}
      </section>

      {/* Live Fleet Movement & Radar */}
      <section className="rounded-3xl border border-white/[0.08] bg-[#14141e] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#c9a84c] mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">الرادار الميداني المباشر</span>
            </div>
            <h3 className="text-lg font-bold text-[#F8F9FA]">تحركات أسطول فانير الفاخر (LIVE FLEET RADAR)</h3>
            <p className="text-xs text-[#8892B0] mt-0.5">متابعة تحركات الطائرات، اليخوت، وسيارات الاستقبال الفارهة في الوقت الفعلي</p>
          </div>
          <Link
            href="/jets"
            className="flex items-center gap-1.5 text-xs font-bold text-[#c9a84c] hover:underline"
          >
            <span>عرض تفاصيل الأسطول</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {FLEET_STATUS.map(item => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.06] bg-[#0e0e16] p-4 hover:border-[rgba(201,168,76,0.3)] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-[#c9a84c]">
                    {item.type === 'jet' && <Plane className="h-5 w-5" />}
                    {item.type === 'yacht' && <ShipWheel className="h-5 w-5" />}
                    {item.type === 'car' && <CarFront className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F8F9FA]">{item.name}</h4>
                    <p className="text-xs font-mono text-[#c9a84c]">{item.code}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    item.statusColor === 'emerald'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : item.statusColor === 'amber'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="border-t border-white/[0.04] pt-2.5">
                <p className="text-xs font-semibold text-[#CCD6F6]">{item.route}</p>
                <p className="text-[11px] text-[#8892B0] mt-0.5">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Chart Section */}
      <RevenueChart />

      {/* Recent Bookings Section */}
      <RecentBookings />
    </div>
  );
}
