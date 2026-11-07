import { PromptEditor } from '@/components/ai/PromptEditor';

export default function AIStudioPage() {
  return (
    <div className="space-y-5 animate-[slide-up_0.3s_ease-out] h-full text-right font-sans">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px w-8 bg-[rgba(201,168,76,0.5)]" />
            <span className="text-[#c9a84c] text-xs font-bold tracking-wider">الذكاء الاصطناعي (AI Concierge)</span>
          </div>
          <h2 className="text-2xl font-bold text-[#F8F9FA]">استوديو المساعد الذكي VIP</h2>
          <p className="text-[#8892B0] text-xs mt-1">
            ضبط خوارزميات وتوجيهات الذكاء الاصطناعي لتقديم استشارات سياحية فاخرة وتوصيات شخصية
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#14141e] border border-white/[0.08] rounded-xl text-[#CCD6F6] text-xs hover:border-[rgba(201,168,76,0.3)] hover:text-[#c9a84c] transition-all">
            سجل المحادثات
          </button>
          <button className="px-4 py-2 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] rounded-xl text-[#c9a84c] text-xs font-bold hover:bg-[rgba(201,168,76,0.2)] transition-all">
            تجربة في بيئة الاختبار
          </button>
        </div>
      </div>

      {/* Metrics bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'محادثات اليوم التفاعلية', value: '1,284', color: 'text-[#c9a84c]' },
          { label: 'متوسط سرعة الاستجابة', value: '1.4 ثانية', color: 'text-emerald-400' },
          { label: 'رضا عملاء النخبة VIP', value: '4.95 / 5.0', color: 'text-blue-400' },
          { label: 'التحويل للكونسيرج البشري', value: '3.2%', color: 'text-amber-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#14141e] border border-white/[0.08] rounded-xl px-4 py-3">
            <p className={`${stat.color} text-lg font-bold font-mono`}>{stat.value}</p>
            <p className="text-[#8892B0] text-[11px] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Prompt editor */}
      <PromptEditor />
    </div>
  );
}
