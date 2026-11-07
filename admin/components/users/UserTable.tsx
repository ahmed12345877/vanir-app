'use client';

import { useState, useEffect } from 'react';
import type { User, UserTier } from '@/lib/types';
import {
  fetchUsersFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
} from '@/lib/firestoreService';
import {
  Crown,
  ShieldCheck,
  Coins,
  CreditCard,
  Edit,
  Trash2,
  X,
  Save,
  CheckCircle2,
  RefreshCw,
  Phone,
  Mail,
  UserCheck,
  Sparkles,
} from 'lucide-react';

const TIER_STYLES: Record<UserTier, string> = {
  royal: 'bg-[rgba(201,168,76,0.25)] text-[#f3cf7a] border-[rgba(201,168,76,0.6)] shadow-[0_0_12px_rgba(201,168,76,0.2)]',
  ultra: 'bg-[rgba(201,168,76,0.15)] text-[#e8c97a] border-[rgba(201,168,76,0.35)]',
  elite: 'bg-[rgba(126,179,255,0.1)] text-[#7eb3ff] border-[rgba(126,179,255,0.25)]',
  standard: 'bg-[#14141f] text-[#a8a099] border-white/[0.1]',
};

const TIER_LABELS: Record<UserTier, string> = {
  royal: 'العضوية الملكية (Royal Tier)',
  ultra: 'ألترا VIP',
  elite: 'النخبة Elite',
  standard: 'كلاسيك',
};

const TIER_ICONS: Record<UserTier, string> = {
  royal: '👑',
  ultra: '⭐',
  elite: '💎',
  standard: '✨',
};

interface UserTableProps {
  searchQuery?: string;
  filterTier?: 'all' | 'royal' | 'ultra' | 'elite' | 'standard';
  refreshTrigger?: number;
  onUserCountChange?: (count: number, royalCount: number, eliteCount: number) => void;
}

export function UserTable({
  searchQuery = '',
  filterTier = 'all',
  refreshTrigger = 0,
  onUserCountChange,
}: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Editing/Creating
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsersFromFirestore();
      setUsers(data);
      const royals = data.filter(u => u.tier === 'royal').length;
      const elites = data.filter(u => u.tier === 'elite' || u.tier === 'ultra').length;
      onUserCountChange?.(data.length, royals, elites);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  const handleEditClick = (u: User) => {
    setSelectedUser(u);
    setEditForm({
      ...u,
      memberId: u.memberId || 'VN-0042',
      walletBalance: u.walletBalance ?? 15000,
      coins: u.coins ?? 1500,
      isVerified: u.isVerified !== false,
      status: u.status || 'active',
      phone: u.phone || '+971 50 000 0000',
      assignedConcierge: u.assignedConcierge || 'صوفيا د. (Chief Concierge)',
    });
    setIsEditing(true);
  };

  const handleSaveUser = async () => {
    if (!editForm.id || !editForm.name) {
      alert('يرجى التأكد من كتابة الاسم ورقم المعرف');
      return;
    }

    setSaving(true);
    try {
      await saveUserToFirestore(editForm as any);
      showToast(`تم حفظ وتحديث ملف العضو (${editForm.name}) بنجاح! تظهر التحديثات لحظياً على هاتفه.`);
      setIsEditing(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      alert('خطأ أثناء حفظ بيانات العضو: ' + (err.message || 'يرجى المحاولة مجدداً'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف عضوية العميل (${name})؟`)) return;
    try {
      await deleteUserFromFirestore(id);
      showToast('تم حذف العضوية بنجاح.');
      await loadUsers();
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.memberId && u.memberId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTier = filterTier === 'all' || u.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-4 font-sans text-right">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border border-[rgba(201,168,76,0.5)] bg-[#112240] p-4 text-[#F8F9FA] shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 text-[#c9a84c]" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-[#14141e] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                {[
                  'العميل ورقم العضوية VIP',
                  'فئة العضوية (Tier)',
                  'التوثيق والحالة',
                  'المحفظة والنقاط',
                  'إجمالي الحجوزات والإنفاق',
                  'مدير الكونسيرج',
                  'التحكم والإجراءات',
                ].map(col => (
                  <th
                    key={col}
                    className="text-right px-5 py-3.5 text-[11px] font-bold text-[#8892B0] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#8892B0]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-[#c9a84c]" />
                      <span className="text-xs">جاري مزامنة بيانات أعضاء VIP من قاعدة البيانات المباشرة...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(user => {
                  const tierKey = (user.tier || 'royal') as UserTier;
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Client info & Member ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center text-[#080810] font-bold text-sm flex-shrink-0 shadow-md">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[#F8F9FA] text-xs font-bold">{user.name}</p>
                              {user.memberId && (
                                <span className="bg-[#1c1c2a] border border-[#c9a84c]/30 text-[#c9a84c] font-mono text-[10px] px-2 py-0.5 rounded">
                                  {user.memberId}
                                </span>
                              )}
                            </div>
                            <p className="text-[#8892B0] text-[11px] font-mono mt-0.5">{user.email}</p>
                            {user.phone && (
                              <p className="text-[#64748B] text-[10px] font-mono">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-full border tracking-wide inline-flex items-center gap-1.5 ${TIER_STYLES[tierKey] || TIER_STYLES.royal}`}
                        >
                          <span>{TIER_ICONS[tierKey] || '👑'}</span>
                          <span>{TIER_LABELS[tierKey] || 'العضوية الملكية'}</span>
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 w-fit ${
                              user.isVerified !== false
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                            }`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            <span>{user.isVerified !== false ? 'موثق VIP' : 'عادي'}</span>
                          </span>

                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded w-fit ${
                              user.status === 'suspended'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-300'
                            }`}
                          >
                            {user.status === 'suspended' ? 'حساب معلق' : 'حساب نشط'}
                          </span>
                        </div>
                      </td>

                      {/* Wallet Balance & Coins */}
                      <td className="px-5 py-4">
                        <div className="space-y-1 font-mono">
                          <div className="flex items-center gap-1.5 text-[#F8F9FA] font-bold text-xs">
                            <CreditCard className="h-3.5 w-3.5 text-[#c9a84c]" />
                            <span>{(user.walletBalance ?? 15000).toLocaleString()} AED</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#c9a84c] text-[11px]">
                            <Coins className="h-3 w-3" />
                            <span>{(user.coins ?? 1500).toLocaleString()} Vanir Coins</span>
                          </div>
                        </div>
                      </td>

                      {/* Total Bookings & Spend */}
                      <td className="px-5 py-4">
                        <p className="text-[#F8F9FA] font-bold font-mono">{user.totalBookings || 12} حجز VIP</p>
                        <p className="text-[#c9a84c] font-bold font-mono text-[11px] mt-0.5">
                          ${((user.totalSpend || 150000) / 1000).toFixed(0)}K إجمالي
                        </p>
                      </td>

                      {/* Assigned Concierge */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[rgba(201,168,76,0.2)] flex items-center justify-center text-[9px] text-[#c9a84c] font-bold">
                            {(user.assignedConcierge || 'صوفيا').charAt(0)}
                          </div>
                          <span className="text-[#CCD6F6] text-xs">
                            {user.assignedConcierge || 'صوفيا د. (VIP Desk)'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(201,168,76,0.15)] text-[#e8c97a] hover:bg-[rgba(201,168,76,0.25)] border border-[rgba(201,168,76,0.3)] text-xs font-bold transition-all shadow-sm"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>تحكم بالبروفيل</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                            title="حذف العضو"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <Sparkles className="h-8 w-8 text-[#c9a84c] mx-auto opacity-50" />
            <p className="text-[#F8F9FA] text-sm font-bold">لا يوجد أعضاء يطابقون معايير البحث</p>
            <p className="text-[#8892B0] text-xs">جرب تغيير فلتر الفئة أو كلمة البحث أعلاه</p>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* VIP PROFILE EDITOR MODAL (التحكم الكامل بالبروفيل من لوحة التحكم) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0f1422] border border-[rgba(201,168,76,0.35)] rounded-[24px] p-6 shadow-2xl space-y-5 animate-[scale-in_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#8b6914] flex items-center justify-center text-[#080810] font-bold">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F8F9FA]">
                    التحكم في بروفيل العضو VIP ({editForm.name})
                  </h3>
                  <p className="text-[#8892B0] text-xs mt-0.5">
                    أي تعديل هنا ينعكس لحظياً على بطاقة العضو وشاشته في تطبيق الهاتف
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedUser(null);
                }}
                className="p-2 rounded-xl text-[#8892B0] hover:text-[#F8F9FA] hover:bg-white/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1.5">
                  اسم العميل الكامل
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-right"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-left font-mono"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1.5">
                  رقم الهاتف المباشر
                </label>
                <input
                  type="text"
                  value={editForm.phone || ''}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-left font-mono"
                  placeholder="+971 50 123 4567"
                />
              </div>

              {/* Member ID (e.g. VN-0042) */}
              <div>
                <label className="block text-[11px] font-bold text-[#c9a84c] mb-1.5 flex items-center justify-between">
                  <span>رقم العضوية VIP (Member No)</span>
                  <span className="text-[10px] text-[#8892B0]">يظهر على البطاقة</span>
                </label>
                <input
                  type="text"
                  value={editForm.memberId || ''}
                  onChange={e => setEditForm({ ...editForm, memberId: e.target.value })}
                  className="w-full bg-[#181d2e] border border-[#c9a84c]/40 rounded-xl text-[#c9a84c] font-mono text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-left font-bold"
                  placeholder="VN-0042"
                />
              </div>

              {/* Tier Selection */}
              <div>
                <label className="block text-[11px] font-bold text-[#c9a84c] mb-1.5">
                  فئة العضوية الملكية (VIP Tier)
                </label>
                <select
                  value={editForm.tier || 'royal'}
                  onChange={e => setEditForm({ ...editForm, tier: e.target.value as any })}
                  className="w-full bg-[#181d2e] border border-[#c9a84c]/40 rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-right font-bold"
                >
                  <option value="royal">👑 العضوية الملكية (Royal Tier)</option>
                  <option value="ultra">⭐ فئة ألترا VIP (Ultra VIP)</option>
                  <option value="elite">💎 فئة النخبة (Elite Tier)</option>
                  <option value="standard">✨ عضوية كلاسيك (Classic)</option>
                </select>
              </div>

              {/* Concierge Advisor */}
              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1.5">
                  مدير الكونسيرج المخصص
                </label>
                <input
                  type="text"
                  value={editForm.assignedConcierge || ''}
                  onChange={e => setEditForm({ ...editForm, assignedConcierge: e.target.value })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#F8F9FA] text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-right"
                  placeholder="صوفيا د. (Chief Concierge)"
                />
              </div>

              {/* Wallet Balance (AED) */}
              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1.5">
                  رصيد المحفظة (AED)
                </label>
                <input
                  type="number"
                  value={editForm.walletBalance ?? 15000}
                  onChange={e => setEditForm({ ...editForm, walletBalance: Number(e.target.value) })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#F8F9FA] font-mono text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-left"
                />
              </div>

              {/* Vanir Coins */}
              <div>
                <label className="block text-[11px] font-bold text-[#8892B0] mb-1.5">
                  نقاط فانير الملكية (Vanir Coins)
                </label>
                <input
                  type="number"
                  value={editForm.coins ?? 1500}
                  onChange={e => setEditForm({ ...editForm, coins: Number(e.target.value) })}
                  className="w-full bg-[#181d2e] border border-white/[0.1] rounded-xl text-[#c9a84c] font-mono text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#c9a84c] text-left font-bold"
                />
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.08]">
              {/* Verified Badge Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a29] border border-white/[0.06]">
                <div>
                  <p className="text-xs font-bold text-[#F8F9FA]">شارة التوثيق الملكي (Verified VIP)</p>
                  <p className="text-[10px] text-[#8892B0]">تظهر بجانب رتبة العضو على البطاقة</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, isVerified: !editForm.isVerified })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    editForm.isVerified !== false ? 'bg-[#c9a84c]' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      editForm.isVerified !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Account Active Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#161a29] border border-white/[0.06]">
                <div>
                  <p className="text-xs font-bold text-[#F8F9FA]">حالة حساب العضوية</p>
                  <p className="text-[10px] text-[#8892B0]">تفعيل أو تعليق وصول العميل للخدمات</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditForm({
                      ...editForm,
                      status: editForm.status === 'suspended' ? 'active' : 'suspended',
                    })
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    editForm.status !== 'suspended' ? 'bg-emerald-500' : 'bg-red-600'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      editForm.status !== 'suspended' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8892B0] hover:text-[#F8F9FA] hover:bg-white/[0.05]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#080810] text-xs font-bold shadow-lg hover:brightness-110 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>حفظ ومزامنة البروفيل مع هاتف العميل</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
