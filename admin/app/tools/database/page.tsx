'use client';

import { useState } from 'react';
import { Database, RefreshCw, Download, Server, HardDrive, CheckCircle2, ShieldCheck } from 'lucide-react';

const COLLECTIONS = [
  { name: 'app_settings', docs: 1, size: '2.4 KB', sync: 'مباشر (Realtime)', desc: 'إعدادات أزرار وصور وبانرات التطبيق' },
  { name: 'bookings', docs: 347, size: '820 KB', sync: 'مباشر (Realtime)', desc: 'سجلات الحجوزات وطلبات السفر' },
  { name: 'packages', docs: 18, size: '142 KB', sync: 'مباشر (Realtime)', desc: 'باقات وجولات السفر الحصرية' },
  { name: 'jets', docs: 12, size: '94 KB', sync: 'مباشر (Realtime)', desc: 'أسطول الطائرات الخاصة ومواصفاتها' },
  { name: 'yachts', docs: 16, size: '128 KB', sync: 'مباشر (Realtime)', desc: 'أسطول اليخوت الفاخرة والأسعار' },
  { name: 'hotels', docs: 45, size: '360 KB', sync: 'مباشر (Realtime)', desc: 'قائمة الفنادق والمنتجعات 5 نجوم' },
  { name: 'users', docs: 1284, size: '1.2 MB', sync: 'مباشر (Realtime)', desc: 'بيانات حسابات العملاء المسجلين' },
  { name: 'blog_posts', docs: 13, size: '280 KB', sync: 'مباشر (Realtime)', desc: 'مقالات وأدلة السفر السياحية' },
];

export default function DatabaseToolsPage() {
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  return (
    <div className="space-y-6 text-right font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F8F9FA]">قاعدة البيانات السحابية المباشرة (Live Database)</h2>
          <p className="text-xs text-[#8892B0] mt-1">Cloud Firestore · المزامنة اللحظية بين لوحة التحكم وتطبيق الجوال</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#14141e] px-4 py-2.5 text-xs font-semibold text-[#CCD6F6] hover:bg-white/[0.04]"
          >
            <RefreshCw className={`h-4 w-4 text-[#c9a84c] ${refreshing ? 'animate-spin' : ''}`} />
            <span>تحديث البيانات</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-4 py-2.5 text-xs font-bold text-[#0d0d12]">
            <Download className="h-4 w-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>
        </div>
      </div>

      {/* Cloud Status Badges */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8892B0]">حالة السيرفر والمزامنة</span>
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="mt-3 text-lg font-bold text-emerald-400">متصل بنجاح 100%</p>
          <p className="mt-1 text-[11px] text-[#8892B0]">Google Cloud Firestore (us-central1)</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8892B0]">قواعد الحماية (Security Rules)</span>
            <ShieldCheck className="h-5 w-5 text-[#c9a84c]" />
          </div>
          <p className="mt-3 text-lg font-bold text-[#F8F9FA]">مفعلة ومحمية</p>
          <p className="mt-1 text-[11px] text-[#8892B0]">الوصول مقيد بصلاحيات المسؤول والعميل</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8892B0]">إجمالي المستندات المخزنة</span>
            <HardDrive className="h-5 w-5 text-[#8892B0]" />
          </div>
          <p className="mt-3 text-lg font-bold text-[#F8F9FA] font-mono">1,732 مستند</p>
          <p className="mt-1 text-[11px] text-[#8892B0]">الحجم الإجمالي: ~3.1 MB</p>
        </div>
      </div>

      {/* Collections Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] overflow-hidden">
        <div className="p-5 border-b border-white/[0.08]">
          <h3 className="text-sm font-bold text-[#F8F9FA]">جداول ومجموعات البيانات (Firestore Collections)</h3>
        </div>
        <table className="min-w-full text-right text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-6 py-4 font-bold text-[#8892B0]">اسم المجموعة (Collection)</th>
              <th className="px-6 py-4 font-bold text-[#8892B0]">الوصف والغرض</th>
              <th className="px-6 py-4 font-bold text-[#8892B0]">عدد المستندات</th>
              <th className="px-6 py-4 font-bold text-[#8892B0]">الحجم</th>
              <th className="px-6 py-4 font-bold text-[#8892B0]">المزامنة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {COLLECTIONS.map(col => (
              <tr key={col.name} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-[#c9a84c] dir-ltr text-right">{col.name}</td>
                <td className="px-6 py-4 text-[#F8F9FA]">{col.desc}</td>
                <td className="px-6 py-4 font-mono text-[#CCD6F6]">{col.docs}</td>
                <td className="px-6 py-4 font-mono text-[#8892B0]">{col.size}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {col.sync}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
