'use client';

import { BarChart3, TrendingUp, Users, DollarSign, Globe, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 text-right font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F8F9FA]">التحليلات ومؤشرات الأداء</h2>
          <p className="text-xs text-[#8892B0] mt-1">إحصائيات تفاعلية حول الزوار، الحجوزات ونمو الإيرادات</p>
        </div>
        <div className="flex gap-2">
          {['آخر 7 أيام', 'آخر 30 يوم', 'هذا العام'].map((tab, i) => (
            <button
              key={tab}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                i === 1
                  ? 'bg-[rgba(201,168,76,0.15)] text-[#c9a84c] border border-[rgba(201,168,76,0.3)]'
                  : 'bg-white/[0.04] text-[#8892B0] hover:text-[#F8F9FA]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: 'إجمالي المبيعات', value: '$342,850', delta: '+24%', icon: DollarSign },
          { title: 'الزيارات الفريدة', value: '18,420', delta: '+15%', icon: Users },
          { title: 'معدل إتمام الحجز', value: '4.8%', delta: '+1.2%', icon: TrendingUp },
          { title: 'الدول الأكثر نشاطاً', value: '12 دولة', delta: 'السعودية، الإمارات، مصر', icon: Globe },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-[rgba(201,168,76,0.1)] p-2.5 text-[#c9a84c]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-emerald-400">{stat.delta}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-[#F8F9FA]">{stat.value}</p>
              <p className="mt-1 text-xs text-[#8892B0]">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-6">
        <h3 className="text-sm font-bold text-[#F8F9FA] mb-4">الوجهات الأكثر طلباً هذا الشهر</h3>
        <div className="space-y-3">
          {[
            { destination: 'دبي - الإمارات العربية المتحدة', percent: 84, revenue: '$148,000' },
            { destination: 'جزر المالديف - منتجعات خاصة', percent: 72, revenue: '$96,500' },
            { destination: 'القاهرة والأقصر - نايل كروز VIP', percent: 68, revenue: '$82,200' },
            { destination: 'موناكو - الريفييرا واليخوت', percent: 55, revenue: '$65,000' },
            { destination: 'باريس وسويسرا - برامج حصرية', percent: 43, revenue: '$49,000' },
          ].map((dest, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#F8F9FA]">{dest.destination}</span>
                <span className="text-[#c9a84c] font-mono">{dest.revenue}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#c9a84c] to-[#e6c875]"
                  style={{ width: `${dest.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
