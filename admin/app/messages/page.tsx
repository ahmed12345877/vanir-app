'use client';

import { useState } from 'react';
import { MessageSquare, Mail, Phone, Clock, Check, Reply, Trash2 } from 'lucide-react';

const MESSAGES = [
  { id: 1, sender: 'سعادة السفير طارق الهلالي', email: 't.hilali@diplomacy.gov.sa', phone: '+966 50 123 4567', service: 'حجز طائرة خاصة لوفد رسمي', date: 'منذ ساعتين', message: 'نود الاستفسار عن إمكانية حجز طائرة خاصة تتسع لـ 12 شخصاً من الرياض إلى باريس مع عودة بعد 5 أيام، ونطلب ترتيبات أمنية واستقبال دبلوماسي في المطار.', unread: true },
  { id: 2, sender: 'المهندس كريم الشاذلي', email: 'karim.shazly@invest.ae', phone: '+971 55 987 6543', service: 'تأجير يخت لمناسبة خاصة', date: 'أمس', message: 'مرحباً، أود تنظيم حفل عائلي خاص على متن يخت فاخر في دبي مارينا لمدة يوم كامل، مع توفير طاهٍ خاص وضيافة 5 نجوم.', unread: false },
  { id: 3, sender: 'لورا ديفيدسون', email: 'laura.d@luxuryconcierge.uk', phone: '+44 7911 123456', service: 'طلب نايل كروز VIP لشهر العسل', date: 'منذ يومين', message: 'أبحث عن دهبية نيلية خاصة بالكامل لزوجين بين الأقصر وأسوان في نوفمبر القادم، مع مرشد سياحي خاص باللغة الإنجليزية.', unread: false },
];

export default function MessagesPage() {
  return (
    <div className="space-y-6 text-right font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F8F9FA]">صندوق الرسائل والاستفسارات</h2>
          <p className="text-xs text-[#8892B0] mt-1">طلبات العملاء وضيوف VIP الواردة من خلال الموقع والتطبيق</p>
        </div>
        <div className="rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] px-3 py-1.5 text-xs font-bold text-[#c9a84c]">
          1 رسالة جديدة غير مقروءة
        </div>
      </div>

      <div className="space-y-4">
        {MESSAGES.map(msg => (
          <div
            key={msg.id}
            className={`rounded-2xl border p-5 space-y-3 transition-all ${
              msg.unread
                ? 'border-[rgba(201,168,76,0.4)] bg-[#171724] shadow-[0_4px_20px_rgba(201,168,76,0.08)]'
                : 'border-white/[0.08] bg-[#14141e]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] text-xs font-bold text-[#c9a84c]">
                  {msg.sender.split(' ').slice(0, 2).map(p => p[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#F8F9FA]">{msg.sender}</h3>
                    {msg.unread && (
                      <span className="rounded-full bg-[#c9a84c] px-2 py-0.5 text-[9px] font-bold text-[#0d0d12]">جديد</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#8892B0] mt-0.5 font-mono">
                    <span>{msg.email}</span>
                    <span>{msg.phone}</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-[#8892B0] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {msg.date}
              </span>
            </div>

            <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
              <span className="block text-xs font-semibold text-[#c9a84c] mb-1">الخدمة المطلوبة: {msg.service}</span>
              <p className="text-xs leading-relaxed text-[#CCD6F6]">{msg.message}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button className="flex items-center gap-1.5 rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] px-3 py-1.5 text-xs font-semibold text-[#c9a84c] hover:bg-[rgba(201,168,76,0.2)]">
                <Reply className="h-3.5 w-3.5 rotate-180" />
                <span>الرد على العميل</span>
              </button>
              <button className="rounded-xl p-2 text-[#8892B0] hover:text-rose-400 hover:bg-rose-500/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
