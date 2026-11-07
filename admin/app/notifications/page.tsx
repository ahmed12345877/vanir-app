'use client';

import { useState } from 'react';
import { Send, Bell, CheckCircle2, Clock, Users } from 'lucide-react';

type Audience = 'all' | 'elite' | 'ultra' | 'segment';

const SENT_NOTIFICATIONS = [
  {
    id: '1',
    title: 'حصرياً: حجز رحلات نايل كروز الملكية — أسبقية الحجز',
    body: 'بصفتك عضواً في نادي فانير للنخبة، استمتع بأسبقية حجز لمدة 48 ساعة لباقات الدهبيات النيلية الجديدة.',
    audience: 'ultra' as Audience,
    sentAt: '2026-04-12T10:00:00Z',
    status: 'sent' as const,
    openRate: 88,
  },
  {
    id: '2',
    title: 'باقات صيف 2026 الفاخرة — متاحة الآن عبر التطبيق',
    body: 'استكشف تشكيلتنا الحصرية من الملاذات الصيفية واليخوت الفاخرة في موناكو، كان وجزر المالديف.',
    audience: 'all' as Audience,
    sentAt: '2026-04-05T09:00:00Z',
    status: 'sent' as const,
    openRate: 74,
  },
  {
    id: '3',
    title: 'رسالة خاصة من مدير الكونسيرج الخاص بك',
    body: 'قام مستشارك الشخصي بإعداد برنامج استثنائي وتوصيات مخصصة لرحلتك القادمة.',
    audience: 'segment' as Audience,
    sentAt: '2026-03-28T15:30:00Z',
    status: 'sent' as const,
    openRate: 94,
  },
];

const AUDIENCE_STYLES: Record<Audience, string> = {
  all: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  elite: 'bg-[rgba(201,168,76,0.1)] text-[#c9a84c] border-[rgba(201,168,76,0.3)]',
  ultra: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  segment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const AUDIENCE_LABELS: Record<Audience, { name: string; count: string }> = {
  all: { name: 'كافة مستخدمي التطبيق', count: '2,418 مستخدم' },
  elite: { name: 'أعضاء النخبة Elite', count: '847 عضو' },
  ultra: { name: 'أعضاء ألترا VIP الملكي', count: '124 عضو' },
  segment: { name: 'شريحة مخصصة', count: 'حسب الاختيار' },
};

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [scheduleFor, setScheduleFor] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setSent(true);
    setTitle('');
    setBody('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="space-y-5 animate-[slide-up_0.3s_ease-out] text-right font-sans">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-px w-8 bg-[rgba(201,168,76,0.5)]" />
          <span className="text-[#c9a84c] text-xs font-bold tracking-wider">الإشعارات السحابية (Push Notifications)</span>
        </div>
        <h2 className="text-2xl font-bold text-[#F8F9FA]">إرسال إشعارات فورية للهواتف</h2>
        <p className="text-[#8892B0] text-xs mt-1">بث التنبيهات، العروض الحصرية والرسائل الخاصة مباشرة لتطبيق ضيوف VIP</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Compose form */}
        <div className="xl:col-span-2 bg-[#14141e] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <h3 className="text-[#F8F9FA] font-bold text-sm">إنشاء إشعار جديد</h3>

          <div>
            <label className="text-xs font-bold text-[#c9a84c] block mb-2">عنوان الإشعار</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: ترقية مجانية لجناحك الفندقي..."
              maxLength={60}
              className="w-full bg-[#0d0d12] border border-white/[0.08] rounded-xl text-[#F8F9FA] text-xs px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] text-right"
            />
            <p className="text-[#8892B0] text-[10px] mt-1 text-left font-mono">{title.length}/60</p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#c9a84c] block mb-2">نص الرسالة</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="اكتب نص الإشعار الذي سيظهر على شاشة قفل هاتف العميل..."
              rows={4}
              maxLength={200}
              className="w-full bg-[#0d0d12] border border-white/[0.08] rounded-xl text-[#F8F9FA] text-xs px-4 py-2.5 resize-none focus:outline-none focus:border-[#c9a84c] text-right leading-relaxed"
            />
            <p className="text-[#8892B0] text-[10px] mt-1 text-left font-mono">{body.length}/200</p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#c9a84c] block mb-2">الجمهور المستهدف</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(AUDIENCE_LABELS) as Audience[]).map(a => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`p-2.5 rounded-xl border text-right transition-all ${
                    audience === a
                      ? 'bg-[rgba(201,168,76,0.15)] border-[#c9a84c] text-[#c9a84c]'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#8892B0] hover:text-[#CCD6F6]'
                  }`}
                >
                  <p className="text-xs font-bold">{AUDIENCE_LABELS[a].name}</p>
                  <p className="text-[10px] opacity-70 mt-0.5 font-mono">{AUDIENCE_LABELS[a].count}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!title.trim() || !body.trim() || sending}
            className={`
              w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2
              ${sent
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#0d0d12] shadow-[0_4px_16px_rgba(201,168,76,0.3)]'
              }
              ${(!title.trim() || !body.trim() || sending) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-95'}
            `}
          >
            <Send className="h-4 w-4" />
            <span>{sending ? 'جاري الإرسال...' : sent ? '✓ تم إرسال الإشعار بنجاح!' : 'إرسال الإشعار الآن'}</span>
          </button>
        </div>

        {/* History */}
        <div className="xl:col-span-3 space-y-3">
          <h3 className="text-[#F8F9FA] font-bold text-sm">سجل الإشعارات المرسلة سابقاً</h3>
          {SENT_NOTIFICATIONS.map(notif => (
            <div key={notif.id} className="bg-[#14141e] border border-white/[0.08] rounded-2xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${AUDIENCE_STYLES[notif.audience]}`}>
                      {AUDIENCE_LABELS[notif.audience].name}
                    </span>
                    <span className="text-[#8892B0] text-[10px]">
                      {new Date(notif.sentAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <p className="text-[#F8F9FA] text-xs font-bold mb-1">{notif.title}</p>
                  <p className="text-[#8892B0] text-xs leading-relaxed">{notif.body}</p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="text-[#c9a84c] text-xl font-bold font-mono">{notif.openRate}%</p>
                  <p className="text-[#8892B0] text-[10px]">معدل الفتح</p>
                </div>
              </div>
              {/* Open rate bar */}
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-[#c9a84c] to-[#e6c875] rounded-full"
                  style={{ width: `${notif.openRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
