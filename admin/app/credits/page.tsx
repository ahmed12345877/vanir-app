'use client';

import { CreditCard, ArrowUpRight, ArrowDownLeft, DollarSign, Wallet, CheckCircle2 } from 'lucide-react';

const TRANSACTIONS = [
  { id: 'TXN-9021', client: 'الشيخ عبدالله بن راشد', desc: 'حجز طائرة بومباردييه جلوبال 7500', amount: '+$45,000', type: 'in', date: '2026-04-14', status: 'مكتمل' },
  { id: 'TXN-9020', client: 'مارينا موناكو لتشغيل اليخوت', desc: 'رسوم رسو ووقود يخت ماجيستي 120', amount: '-$8,400', type: 'out', date: '2026-04-13', status: 'مكتمل' },
  { id: 'TXN-9019', client: 'فيكتوريا وورثينجتون', desc: 'باقة نايل كروز VIP الفاخرة', amount: '+$14,800', type: 'in', date: '2026-04-12', status: 'مكتمل' },
  { id: 'TXN-9018', client: 'منتجع سوفيل فاخر المالديف', desc: 'تسوية حجز فيلا رئاسية 7 ليالٍ', amount: '-$12,200', type: 'out', date: '2026-04-10', status: 'مكتمل' },
];

export default function CreditsPage() {
  return (
    <div className="space-y-6 text-right font-sans">
      <div>
        <h2 className="text-xl font-bold text-[#F8F9FA]">الرصيد والمعاملات المالية</h2>
        <p className="text-xs text-[#8892B0] mt-1">متابعة المحفظة، الإيداعات، وتسويات حجوزات الخدمات الفاخرة</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[rgba(201,168,76,0.3)] bg-gradient-to-b from-[#1c1a14] to-[#14141e] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8892B0]">الرصيد المتاح حالياً</span>
            <div className="rounded-xl bg-[rgba(201,168,76,0.15)] p-2 text-[#c9a84c]">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#c9a84c] font-mono">$1,482,900</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-semibold">+18% نمو السيولة الشهرية</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8892B0]">معاملات معلقة تحت التحصيل</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[#F8F9FA] font-mono">$86,400</p>
          <p className="mt-1 text-[11px] text-[#8892B0]">3 حجوزات قيد التسوية البنكية</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8892B0]">إجمالي أرباح الربع الحالي</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-400 font-mono">$420,150</p>
          <p className="mt-1 text-[11px] text-[#8892B0]">مقارنة بالمستهدف: 112%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] overflow-hidden">
        <div className="p-5 border-b border-white/[0.08]">
          <h3 className="text-sm font-bold text-[#F8F9FA]">سجل المعاملات والتحويلات الأخيرة</h3>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {TRANSACTIONS.map(tx => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    tx.type === 'in'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {tx.type === 'in' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F8F9FA]">{tx.desc}</p>
                  <div className="flex items-center gap-3 text-xs text-[#8892B0] mt-0.5 font-mono">
                    <span>{tx.client}</span>
                    <span>•</span>
                    <span>{tx.id}</span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <p className={`text-sm font-bold font-mono ${tx.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.amount}
                </p>
                <p className="text-[10px] text-[#8892B0] mt-0.5">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
