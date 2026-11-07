'use client';

import { useState } from 'react';
import { Navigation, Plus, Save, GripVertical, Trash2 } from 'lucide-react';

const INITIAL_LINKS = [
  { id: 1, label: 'الرئيسية', url: '/' },
  { id: 2, label: 'البرامج السياحية', url: '/packages' },
  { id: 3, label: 'الطيران الخاص', url: '/jets' },
  { id: 4, label: 'اليخوت الفاخرة', url: '/yachts' },
  { id: 5, label: 'الفنادق والمنتجعات', url: '/hotels' },
  { id: 6, label: 'المدونة', url: '/blog' },
  { id: 7, label: 'اتصل بنا', url: '/contact' },
];

export default function NavbarDesignPage() {
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 text-right font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F8F9FA]">شريط التنقل العلوي (Navbar)</h2>
          <p className="text-xs text-[#8892B0] mt-1">تحديد روابط القائمة الرئيسية وترتيبها وظهورها في الموقع</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-5 py-2.5 text-xs font-bold text-[#0d0d12] shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:opacity-95"
        >
          <Save className="h-4 w-4" />
          <span>{saved ? 'تم الحفظ بنجاح ✓' : 'حفظ التعديلات'}</span>
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#F8F9FA]">روابط القائمة الرئيسية</h3>
        <div className="space-y-2">
          {links.map((link, idx) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-[#0d0d12] p-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-[#64748B] cursor-grab" />
                <span className="font-semibold text-[#F8F9FA]">{link.label}</span>
                <span className="font-mono text-[#8892B0] text-[11px] dir-ltr">{link.url}</span>
              </div>
              <button
                onClick={() => setLinks(links.filter(l => l.id !== link.id))}
                className="rounded-lg p-1 text-[#8892B0] hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
