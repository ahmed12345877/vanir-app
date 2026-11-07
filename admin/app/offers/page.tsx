'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Calendar,
  Percent,
  CheckCircle2,
  Trash2,
  Edit2,
  Copy,
  Check,
  X,
  Sparkles,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import {
  fetchOffersFromFirestore,
  saveOfferToFirestore,
  deleteOfferFromFirestore,
  seedInitialOffers,
  type OfferItem,
} from '@/lib/firestoreService';

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formTarget, setFormTarget] = useState('اليخوت الفاخرة');
  const [formValidUntil, setFormValidUntil] = useState('2026-12-31');
  const [formStatus, setFormStatus] = useState('نشط');

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    setLoading(true);
    try {
      const items = await fetchOffersFromFirestore();
      setOffers(items);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function handleCopy(id: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`تم نسخ كود الخصم: ${code}`);
  }

  function generateRandomCode() {
    const prefixes = ['VANIR', 'VIP', 'ROYAL', 'ELITE', 'SUMMER'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setFormCode(`${prefix}-${num}`);
  }

  function handleOpenAdd() {
    setEditingOffer(null);
    setFormTitle('');
    setFormCode('');
    generateRandomCode();
    setFormDiscount('15%');
    setFormTarget('اليخوت الفاخرة');
    setFormValidUntil('2026-12-31');
    setFormStatus('نشط');
    setModalOpen(true);
  }

  function handleOpenEdit(offer: OfferItem) {
    setEditingOffer(offer);
    setFormTitle(offer.title);
    setFormCode(offer.code);
    setFormDiscount(offer.discount);
    setFormTarget(offer.target);
    setFormValidUntil(offer.validUntil);
    setFormStatus(offer.status);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formTitle.trim() || !formCode.trim() || !formDiscount.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSaving(true);
    try {
      const itemToSave: OfferItem = {
        id: editingOffer ? editingOffer.id : 'off_' + Date.now(),
        title: formTitle.trim(),
        code: formCode.toUpperCase().trim(),
        discount: formDiscount.trim(),
        target: formTarget,
        validUntil: formValidUntil,
        status: formStatus,
        uses: editingOffer ? editingOffer.uses : 0,
      };

      await saveOfferToFirestore(itemToSave);

      if (editingOffer) {
        setOffers(prev =>
          prev.map(o => (o.id === itemToSave.id ? itemToSave : o)),
        );
        showToast(`تم تحديث كود العرض "${formCode}" وحفظه في السيرفر!`);
      } else {
        setOffers(prev => [itemToSave, ...prev]);
        showToast(`تم إنشاء كود العرض "${formCode}" الجديد وحفظه في السيرفر!`);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving offer:', err);
      alert('خطأ أثناء حفظ العرض: ' + (err.message || 'تأكد من الاتصال'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`هل أنت متأكد من حذف كود الخصم "${code}" نهائياً من قاعدة البيانات السحابية؟`)) return;
    try {
      await deleteOfferFromFirestore(id);
      setOffers(prev => prev.filter(o => o.id !== id));
      showToast(`تم حذف كود "${code}".`);
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  }

  async function handleResetToDefaults() {
    if (!confirm('هل تريد استعادة نماذج العروض الأصلية وتثبيتها في قاعدة البيانات؟')) return;
    setLoading(true);
    try {
      await seedInitialOffers();
      const fresh = await fetchOffersFromFirestore();
      setOffers(fresh);
      showToast('تمت استعادة العروض الافتراضية وحفظها بنجاح!');
    } catch (err: any) {
      alert('خطأ أثناء الاستعادة: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 text-right font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border border-[rgba(201,168,76,0.4)] bg-[#112240] p-4 text-[#F8F9FA] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 text-[#c9a84c]" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#c9a84c] mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">مزامنة سحابية حية (Firestore Live)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#F8F9FA]">العروض والخصومات الترويجية</h2>
          <p className="text-xs text-[#8892B0] mt-1">إدارة أكواد الخصم والعروض الموسمية الخاصة بعملاء التطبيق والموقع، محفوظة بالسيرفر لحظياً.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-[#14141e] px-3.5 py-2.5 text-xs font-bold text-[#8892B0] hover:text-[#F8F9FA] hover:border-white/[0.2] transition-all"
            title="استعادة النماذج الأصلية"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>استعادة النماذج</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-5 py-2.5 text-xs font-bold text-[#0d0d12] shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء كود عرض جديد +</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-white/[0.08] bg-[#14141e]">
          <RefreshCw className="h-8 w-8 animate-spin text-[#c9a84c]" />
          <p className="text-xs text-[#8892B0]">جاري جلب العروض من قاعدة البيانات السحابية...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/[0.1] bg-[#14141e]/50 p-6 text-center">
          <Tag className="h-10 w-10 text-[#64748B]" />
          <p className="text-sm font-bold text-[#F8F9FA]">لا توجد عروض ترويجية حالياً</p>
          <p className="text-xs text-[#8892B0]">اضغط على زر "إنشاء كود عرض جديد +" لإضافة أكواد ترويجية.</p>
        </div>
      ) : (
        /* Grid of Offers */
        <div className="grid gap-5 md:grid-cols-2">
          {offers.map(offer => (
            <div
              key={offer.id}
              className="rounded-3xl border border-white/[0.08] bg-[#14141e] p-6 space-y-4 hover:border-[rgba(201,168,76,0.35)] shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-md border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] px-2.5 py-1 text-[11px] font-bold text-[#c9a84c]">
                    {offer.target}
                  </span>
                  <h3 className="text-base font-bold text-[#F8F9FA] mt-2.5">{offer.title}</h3>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  {offer.status}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-4 border border-dashed border-white/[0.12]">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-[#c9a84c]" />
                  <span className="font-mono text-base font-extrabold tracking-widest text-[#F8F9FA]">{offer.code}</span>
                  <button
                    onClick={() => handleCopy(offer.id, offer.code)}
                    className="rounded-lg p-1.5 text-[#8892B0] hover:text-[#c9a84c] hover:bg-white/[0.05] transition-colors"
                    title="نسخ الكود"
                  >
                    {copiedId === offer.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-base">
                  <Percent className="h-4 w-4" />
                  <span>{offer.discount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#8892B0] border-t border-white/[0.06] pt-3.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#8892B0]" />
                  <span>ينتهي في: {offer.validUntil}</span>
                </div>
                <span className="font-mono text-[#CCD6F6]">تم الاستخدام: {offer.uses} مرة</span>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] pt-3">
                <button
                  onClick={() => handleOpenEdit(offer)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#8892B0] hover:text-[#c9a84c] hover:border-[rgba(201,168,76,0.3)] transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDelete(offer.id, offer.code)}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition-all"
                  title="حذف العرض"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Offer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-[rgba(201,168,76,0.3)] bg-[#12121c] p-6 text-right shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-[#F8F9FA]">
                {editingOffer ? `تعديل عرض: ${editingOffer.code}` : 'إنشاء كود عرض وخصم ترويجي جديد'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-2 text-[#8892B0] hover:text-[#F8F9FA] hover:bg-white/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#8892B0] block mb-1">عنوان العرض</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="مثال: خصم الصيف الحصري على الطيران الخاص"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#8892B0]">كود البرومو</label>
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="text-[11px] text-[#c9a84c] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      توليد كود
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value.toUpperCase())}
                    placeholder="مثال: VIP-SUMMER"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs font-bold font-mono text-[#c9a84c] focus:border-[#c9a84c] focus:outline-none text-right uppercase tracking-wider"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">قيمة الخصم</label>
                  <input
                    type="text"
                    value={formDiscount}
                    onChange={e => setFormDiscount(e.target.value)}
                    placeholder="مثال: 15% أو $1,000"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">الخدمة المستهدفة</label>
                  <select
                    value={formTarget}
                    onChange={e => setFormTarget(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  >
                    <option value="اليخوت الفاخرة">اليخوت الفاخرة</option>
                    <option value="الطيران الخاص">الطيران الخاص</option>
                    <option value="الفنادق والمنتجعات">الفنادق والمنتجعات</option>
                    <option value="البرامج السياحية">البرامج السياحية</option>
                    <option value="الليموزين والسيارات">الليموزين والسيارات</option>
                    <option value="كافة الخدمات">كافة الخدمات (شامل)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">صالح حتى تاريخ</label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={e => setFormValidUntil(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8892B0] block mb-1">حالة العرض</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                >
                  <option value="نشط">نشط (متاح للاستخدام الآن)</option>
                  <option value="معلق">معلق مؤقتاً</option>
                  <option value="منتهي">منتهي الصلاحية</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-white/[0.1] px-5 py-2 text-xs font-semibold text-[#8892B0] hover:bg-white/[0.05]"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-6 py-2 text-xs font-bold text-[#0d0d12] shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ بالسيرفر...' : 'حفظ كود العرض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
