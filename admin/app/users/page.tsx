'use client';

import { useState } from 'react';
import { UserTable } from '@/components/users/UserTable';
import { saveUserToFirestore } from '@/lib/firestoreService';
import type { UserTier } from '@/lib/types';
import { Crown, Sparkles, UserPlus, X, RefreshCw, Save } from 'lucide-react';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'royal' | 'ultra' | 'elite' | 'standard'>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [royalCount, setRoyalCount] = useState(0);
  const [eliteCount, setEliteCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New Client Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    email: '',
    phone: '',
    memberId: `VN-00${Math.floor(Math.random() * 90 + 10)}`,
    tier: 'royal' as UserTier,
    walletBalance: 25000,
    coins: 2500,
    isVerified: true,
    assignedConcierge: 'صوفيا د. (Chief Concierge)',
  });

  const handleCreateNewUser = async () => {
    if (!newForm.name || !newForm.email) {
      alert('يرجى كتابة الاسم والبريد الإلكتروني للعميل');
      return;
    }

    setCreating(true);
    try {
      const newId = `user_${Date.now()}`;
      await saveUserToFirestore({
        id: newId,
        name: newForm.name,
        email: newForm.email,
        phone: newForm.phone,
        memberId: newForm.memberId,
        tier: newForm.tier,
        walletBalance: newForm.walletBalance,
        coins: newForm.coins,
        isVerified: newForm.isVerified,
        status: 'active',
        totalBookings: 1,
        totalSpend: 15000,
        currency: 'USD',
        lastActive: new Date().toISOString().split('T')[0],
        joinedAt: new Date().toISOString().split('T')[0],
        preferredDestinations: ['دبي', 'المالديف'],
        assignedConcierge: newForm.assignedConcierge,
      });

      alert('تم إنشاء عضوية VIP وحفظها مباشرة في قاعدة البيانات!');
      setIsAddOpen(false);
      setNewForm({
        name: '',
        email: '',
        phone: '',
        memberId: `VN-00${Math.floor(Math.random() * 90 + 10)}`,
        tier: 'royal',
        walletBalance: 25000,
        coins: 2500,
        isVerified: true,
        assignedConcierge: 'صوفيا د. (Chief Concierge)',
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      alert('خطأ أثناء إضافة العميل: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5 animate-[slide-up_0.3s_ease-out] text-right font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px w-8 bg-[rgba(201,168,76,0.5)]" />
            <span className="text-[#c9a84c] text-xs font-bold tracking-wider">
              إدارة علاقات العملاء والبروفايلات الحية (VIP CRM)
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#F8F9FA]">ملفات العملاء وأعضاء النخبة VIP</h2>
          <p className="text-[#8892B0] text-xs mt-1">
            التحكم المباشر برتب العضوية الملكية، أرصدة المحفظة، وأرقام العضويات مع المزامنة اللحظية لهواتف العملاء
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e6c875] rounded-xl text-[#080810] text-xs font-bold shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:brightness-110 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ إضافة عضو VIP جديد</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: 'أعضاء العضوية الملكية (Royal Tier)',
            value: royalCount || '3',
            badge: '👑',
            color: 'text-[#e8c97a]',
            bg: 'bg-[rgba(201,168,76,0.12)] border-[rgba(201,168,76,0.3)]',
          },
          {
            label: 'أعضاء النخبة وألترا VIP',
            value: eliteCount || '8',
            badge: '💎',
            color: 'text-[#7eb3ff]',
            bg: 'bg-[rgba(126,179,255,0.08)] border-[rgba(126,179,255,0.15)]',
          },
          {
            label: 'إجمالي الأعضاء المربوطين حياً',
            value: totalCount || '14',
            badge: '✨',
            color: 'text-[#CCD6F6]',
            bg: 'bg-[#14141e] border-white/[0.08]',
          },
        ].map(stat => (
          <div key={stat.label} className={`border rounded-2xl p-4 ${stat.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{stat.badge}</span>
              <span className={`text-xs font-bold ${stat.color}`}>{stat.label}</span>
            </div>
            <p className="text-[#F8F9FA] text-3xl font-bold font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#14141e] border border-white/[0.08] rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="بحث بالاسم، البريد أو رقم العضوية (VN-0042)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-[#0d0d12] border border-white/[0.08] rounded-xl text-[#F8F9FA] placeholder-[#64748B] text-xs px-4 py-2.5 w-80 focus:outline-none focus:border-[#c9a84c] text-right"
        />

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'royal', label: '👑 العضوية الملكية' },
            { id: 'ultra', label: '⭐ ألترا VIP' },
            { id: 'elite', label: '💎 النخبة Elite' },
            { id: 'standard', label: 'كلاسيك' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterTier(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterTier === t.id
                  ? 'bg-[rgba(201,168,76,0.18)] text-[#c9a84c] border border-[rgba(201,168,76,0.35)]'
                  : 'bg-white/[0.03] text-[#8892B0] hover:text-[#F8F9FA]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <UserTable
        searchQuery={searchQuery}
        filterTier={filterTier}
        refreshTrigger={refreshTrigger}
        onUserCountChange={(total, royals, elites) => {
          setTotalCount(total);
          setRoyalCount(royals);
          setEliteCount(elites);
        }}
      />

      {/* Add New User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0f1422] border border-[rgba(201,168,76,0.35)] rounded-[24px] p-6 shadow-2xl space-y-5 animate-[scale-in_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center text-[#080810] font-bold">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F8F9FA]">تسجيل عضو VIP جديد</h3>
                  <p className="text-[#8892B0] text-xs">إصدار بطاقة رقمية وإرسالها مباشرة لقاعدة البيانات</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl text-[#8892B0] hover:text-[#F8F9FA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1">اسم العميل</label>
                <input
                  type="text"
                  placeholder="مثال: الشيخ راشد بن علي"
                  value={newForm.name}
                  onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-right"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="r.ali@vip.com"
                  value={newForm.email}
                  onChange={e => setNewForm({ ...newForm, email: e.target.value })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  placeholder="+971 50 123 4567"
                  value={newForm.phone}
                  onChange={e => setNewForm({ ...newForm, phone: e.target.value })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#c9a84c] mb-1">رقم العضوية (Member ID)</label>
                <input
                  type="text"
                  value={newForm.memberId}
                  onChange={e => setNewForm({ ...newForm, memberId: e.target.value })}
                  className="w-full bg-[#181d2e] border border-[#c9a84c]/40 rounded-xl text-[#c9a84c] font-mono font-bold text-xs px-3.5 py-2.5 focus:outline-none text-left"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#c9a84c] mb-1">رتبة العضوية</label>
                <select
                  value={newForm.tier}
                  onChange={e => setNewForm({ ...newForm, tier: e.target.value as any })}
                  className="w-full bg-[#181d2e] border border-[#c9a84c]/40 rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 font-bold text-right"
                >
                  <option value="royal">👑 العضوية الملكية (Royal Tier)</option>
                  <option value="ultra">⭐ ألترا VIP</option>
                  <option value="elite">💎 النخبة Elite</option>
                  <option value="standard">✨ كلاسيك</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1">الرصيد الافتتاحي (AED)</label>
                <input
                  type="number"
                  value={newForm.walletBalance}
                  onChange={e => setNewForm({ ...newForm, walletBalance: Number(e.target.value) })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 text-left font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8892B0] hover:text-[#F8F9FA]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleCreateNewUser}
                disabled={creating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#080810] text-xs font-bold shadow-lg hover:brightness-110 disabled:opacity-50"
              >
                {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>حفظ وتفعيل العضوية</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
