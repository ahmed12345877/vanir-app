'use client';

import { useState } from 'react';
import { FileText, Plus, Eye, Edit2, Trash2 } from 'lucide-react';

const STATIC_PAGES = [
  { id: 1, title: 'عن فانير جروب (About Us)', slug: '/about', status: 'منشورة', updated: '2026-04-10' },
  { id: 2, title: 'عضوية نادي فانير للنخبة (VIP Club)', slug: '/vip-membership', status: 'منشورة', updated: '2026-04-05' },
  { id: 3, title: 'شروط الخدمة والخصوصية (Privacy & Terms)', slug: '/terms', status: 'منشورة', updated: '2026-03-20' },
  { id: 4, title: 'سياسة حجز الطيران الخاص واليخوت', slug: '/charter-policy', status: 'منشورة', updated: '2026-03-15' },
];

export default function PagesManagementPage() {
  return (
    <div className="space-y-6 text-right font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F8F9FA]">إدارة الصفحات الثابتة (Pages)</h2>
          <p className="text-xs text-[#8892B0] mt-1">تعديل محتوى الصفحات التعريفية، السياسات وشروط العضوية</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-4 py-2.5 text-xs font-bold text-[#0d0d12] shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:opacity-95">
          <Plus className="h-4 w-4" />
          <span>إنشاء صفحة جديدة</span>
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] overflow-hidden">
        <table className="min-w-full text-right text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-6 py-4 font-bold text-[#8892B0]">اسم الصفحة</th>
              <th className="px-6 py-4 font-bold text-[#8892B0]">الرابط (Slug)</th>
              <th className="px-6 py-4 font-bold text-[#8892B0]">الحالة</th>
              <th className="px-6 py-4 font-bold text-[#8892B0]">آخر تحديث</th>
              <th className="px-6 py-4 font-bold text-[#8892B0]">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {STATIC_PAGES.map(page => (
              <tr key={page.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-bold text-[#F8F9FA]">{page.title}</td>
                <td className="px-6 py-4 font-mono text-[#8892B0] text-left dir-ltr">{page.slug}</td>
                <td className="px-6 py-4">
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#8892B0]">{page.updated}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg p-1.5 text-[#8892B0] hover:text-[#c9a84c]">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-[#8892B0] hover:text-[#c9a84c]">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-[#8892B0] hover:text-rose-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
