'use client';

import { useState } from 'react';
import { Palette, Save, Check } from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'الذهبي الملكي (Royal Gold)', primary: '#c9a84c', bg: '#0d0d12', card: '#14141e' },
  { name: 'الأزرق البحري العميق (Navy Sapphire)', primary: '#60a5fa', bg: '#081120', card: '#0f1c32' },
  { name: 'الزمردي الإمبراطوري (Emerald Prestige)', primary: '#10b981', bg: '#06130d', card: '#0d2218' },
  { name: 'البلاتينيوم الماسي (Diamond Platinum)', primary: '#e2e8f0', bg: '#0f172a', card: '#1e293b' },
];

export default function ThemeDesignPage() {
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 text-right font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F8F9FA]">المظهر والألوان (Theme & Colors)</h2>
          <p className="text-xs text-[#8892B0] mt-1">تحديد الهوية البصرية، ألوان العلامة التجارية ودرجات الذهبي الملكي</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-5 py-2.5 text-xs font-bold text-[#0d0d12] shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:opacity-95"
        >
          <Save className="h-4 w-4" />
          <span>{saved ? 'تم التطبيق بنجاح ✓' : 'تطبيق المظهر'}</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {COLOR_PRESETS.map((preset, i) => (
          <div
            key={i}
            onClick={() => setSelectedTheme(i)}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              selectedTheme === i
                ? 'border-[#c9a84c] bg-[#1a1820] shadow-[0_4px_24px_rgba(201,168,76,0.15)]'
                : 'border-white/[0.08] bg-[#14141e] hover:border-white/[0.2]'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F8F9FA]">{preset.name}</h3>
              {selectedTheme === i && (
                <div className="rounded-full bg-[#c9a84c] p-1 text-[#0d0d12]">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full border border-white/20" style={{ backgroundColor: preset.primary }} />
                <span className="text-xs text-[#8892B0] font-mono">{preset.primary}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full border border-white/20" style={{ backgroundColor: preset.bg }} />
                <span className="text-xs text-[#8892B0] font-mono">{preset.bg}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
