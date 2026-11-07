'use client';

import { useState } from 'react';
import { Star, CheckCircle, Trash2, MessageSquare, ThumbsUp } from 'lucide-react';

const REVIEWS = [
  { id: 1, guest: 'صاحب السمو الشيخ عبدالله بن راشد', service: 'طيران خاص - بومباردييه جلوبال 7500', rating: 5, date: '2026-04-12', comment: 'تجربة استثنائية من الاستقبال بالمطار الخاص حتى الوصول لدبي. طاقم الضيافة كان على أعلى مستويات الاحترافية والدقة.', status: 'معتمد' },
  { id: 2, guest: 'د. خالد المنصوري', service: 'رحلة نيلية ملكية خاصة - دهبية الأقصر', rating: 5, date: '2026-03-28', comment: 'أجمل رحلة نيلية خضتها في حياتي، خدمة الكونسيرج والتنظيم التاريخي كانا مبهرين بكل المقاييس.', status: 'معتمد' },
  { id: 3, guest: 'م. سارة القحطاني', service: 'إقامة فيلا مائية خاصة - المالديف', rating: 5, date: '2026-03-15', comment: 'شكراً لفريق فانير على توفير أفضل فيلا في المنتجع مع كافة الترتيبات الخاصة بدقة متناهية.', status: 'معتمد' },
  { id: 4, guest: 'السيد ألكسندر فولكوف', service: 'يخت سوبر فاخر - موناكو والريفييرا', rating: 4, date: '2026-02-20', comment: 'اليخت والطاقم رائعون، استمتعنا جداً بالأسبوع في كان وموناكو. نوصي بهم بشدة.', status: 'معتمد' },
];

export default function ReviewsPage() {
  return (
    <div className="space-y-6 text-right font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F8F9FA]">تقييمات وآراء ضيوف VIP</h2>
          <p className="text-xs text-[#8892B0] mt-1">مراجعات العملاء وتجاربهم المعروضة في التطبيق والصفحة الرئيسية</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] px-4 py-2 text-xs font-bold text-[#c9a84c]">
          <Star className="h-4 w-4 fill-current" />
          <span>متوسط التقييم: 4.95 / 5.0 (148 تقييم)</span>
        </div>
      </div>

      <div className="grid gap-4">
        {REVIEWS.map(rev => (
          <div
            key={rev.id}
            className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F8F9FA]">{rev.guest}</h3>
                <p className="text-xs text-[#c9a84c] mt-0.5">{rev.service}</p>
              </div>
              <div className="flex items-center gap-1 text-[#c9a84c]">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#CCD6F6] bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              "{rev.comment}"
            </p>

            <div className="flex items-center justify-between text-xs text-[#8892B0] pt-2">
              <span>تاريخ التقييم: {rev.date}</span>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {rev.status}
                </span>
                <button className="rounded-lg p-1.5 text-[#8892B0] hover:text-rose-400 hover:bg-rose-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
