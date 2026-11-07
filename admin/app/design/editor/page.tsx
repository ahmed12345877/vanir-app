'use client';

import { useState } from 'react';
import { Edit3, Monitor, Smartphone, Tablet, Save, Eye, Layers } from 'lucide-react';

export default function VisualEditorPage() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 text-right font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F8F9FA]">المحرر المرئي المباشر (Live Visual Editor)</h2>
          <p className="text-xs text-[#8892B0] mt-1">تعديل مكونات وواجهات الموقع والتطبيق مع معاينة مباشرة لكافة الشاشات</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Device Switcher */}
          <div className="flex rounded-xl border border-white/[0.08] bg-[#14141e] p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`rounded-lg p-2 ${device === 'desktop' ? 'bg-[#c9a84c] text-[#0d0d12]' : 'text-[#8892B0]'}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`rounded-lg p-2 ${device === 'tablet' ? 'bg-[#c9a84c] text-[#0d0d12]' : 'text-[#8892B0]'}`}
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`rounded-lg p-2 ${device === 'mobile' ? 'bg-[#c9a84c] text-[#0d0d12]' : 'text-[#8892B0]'}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-4 py-2.5 text-xs font-bold text-[#0d0d12]"
          >
            <Save className="h-4 w-4" />
            <span>{saved ? 'تم الحفظ ✓' : 'حفظ ونشر التعديلات'}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Editor Controls Sidebar */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#c9a84c]">
            <Layers className="h-4 w-4" />
            <span>طبقات وأقسام الصفحة</span>
          </div>

          <div className="space-y-2 text-xs">
            {['1. الهيدر وشريط التنقل', '2. واجهة البداية (Hero)', '3. شريط الخدمات التفاعلي', '4. باقات السفر المميزة', '5. أسطول الطيران واليخوت', '6. الفنادق والمنتجعات', '7. تقييمات العملاء VIP', '8. الفوتر وحقوق الملكية'].map((sec, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 text-[#F8F9FA] hover:bg-white/[0.06] cursor-pointer"
              >
                <span>{sec}</span>
                <span className="text-[10px] text-emerald-400 font-bold">نشط</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Canvas */}
        <div className="lg:col-span-3 flex justify-center items-start">
          <div
            className={`transition-all duration-300 rounded-3xl border border-white/[0.1] bg-[#0d0d14] p-6 shadow-2xl overflow-hidden ${
              device === 'mobile'
                ? 'w-[375px] min-h-[600px]'
                : device === 'tablet'
                ? 'w-[640px] min-h-[600px]'
                : 'w-full min-h-[600px]'
            }`}
          >
            <div className="text-center py-16 space-y-4">
              <span className="inline-block rounded-full bg-[rgba(201,168,76,0.15)] px-4 py-1 text-xs font-bold text-[#c9a84c]">
                VANIR LUXURY TRAVEL
              </span>
              <h2 className="text-2xl font-bold text-[#F8F9FA]">رحلات النخبة إلى أكثر وجهات العالم سحراً</h2>
              <p className="text-xs text-[#8892B0] max-w-md mx-auto leading-relaxed">
                معاينة تفاعلية للشاشات المختلفة في الوقت الفعلي
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
