'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { DeviceImageUploader } from '@/components/DeviceImageUploader';
import {
  fetchDestinationsFromFirestore,
  saveDestinationToFirestore,
  deleteDestinationFromFirestore,
  seedInitialDestinations,
  type DestinationItem,
} from '@/lib/firestoreService';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<DestinationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formPackages, setFormPackages] = useState(5);
  const [formHotels, setFormHotels] = useState(12);
  const [formStatus, setFormStatus] = useState('نشط');
  const [formImage, setFormImage] = useState('');

  useEffect(() => {
    loadDestinations();
  }, []);

  async function loadDestinations() {
    setLoading(true);
    try {
      const items = await fetchDestinationsFromFirestore();
      setDestinations(items);
    } catch (err) {
      console.error('Failed to load destinations:', err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function handleOpenAdd() {
    setEditingDest(null);
    setFormName('');
    setFormCountry('');
    setFormPackages(5);
    setFormHotels(10);
    setFormStatus('نشط');
    setFormImage('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600');
    setModalOpen(true);
  }

  function handleOpenEdit(dest: DestinationItem) {
    setEditingDest(dest);
    setFormName(dest.name);
    setFormCountry(dest.country);
    setFormPackages(dest.packages);
    setFormHotels(dest.hotels);
    setFormStatus(dest.status);
    setFormImage(dest.image);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formName.trim() || !formCountry.trim()) {
      alert('يرجى إدخال اسم الوجهة والدولة');
      return;
    }
    if (!formImage) {
      alert('يرجى اختيار صورة للوجهة');
      return;
    }

    setSaving(true);
    try {
      const itemToSave: DestinationItem = {
        id: editingDest ? String(editingDest.id) : 'dest_' + Date.now(),
        name: formName.trim(),
        country: formCountry.trim(),
        packages: Number(formPackages) || 0,
        hotels: Number(formHotels) || 0,
        status: formStatus,
        image: formImage,
        updatedAt: new Date().toISOString(),
      };

      await saveDestinationToFirestore(itemToSave);

      if (editingDest) {
        setDestinations(prev =>
          prev.map(d => (String(d.id) === String(itemToSave.id) ? itemToSave : d)),
        );
        showToast(`تم حفظ وتحديث وجهة "${formName}" في قاعدة البيانات بنجاح!`);
      } else {
        setDestinations(prev => [itemToSave, ...prev]);
        showToast(`تمت إضافة وجهة "${formName}" الجديدة وحفظها في السيرفر!`);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error saving destination:', err);
      alert('خطأ أثناء حفظ الوجهة: ' + (err.message || 'تأكد من الاتصال'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`هل أنت متأكد من حذف وجهة "${name}" نهائياً من قاعدة البيانات السحابية؟`)) return;
    try {
      await deleteDestinationFromFirestore(id);
      setDestinations(prev => prev.filter(d => d.id !== id));
      showToast(`تم حذف وجهة "${name}" بنجاح.`);
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  }

  async function handleResetToDefaults() {
    if (!confirm('هل تريد استعادة نماذج الوجهات السياحية الأصلية وتثبيتها في قاعدة البيانات؟')) return;
    setLoading(true);
    try {
      await seedInitialDestinations();
      const fresh = await fetchDestinationsFromFirestore();
      setDestinations(fresh);
      showToast('تمت استعادة الوجهات الافتراضية وحفظها بنجاح!');
    } catch (err: any) {
      alert('خطأ أثناء الاستعادة: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = destinations.filter(
    d =>
      (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.country || '').toLowerCase().includes(search.toLowerCase()),
  );

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
          <h2 className="text-xl md:text-2xl font-bold text-[#F8F9FA]">إدارة الوجهات والمدن السياحية</h2>
          <p className="text-xs text-[#8892B0] mt-1">المدن والعواصم الفاخرة لضيوف VIP، تُحفظ الصور والبيانات فورياً في السيرفر وتظهر للمستخدمين مباشرة.</p>
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
            <span>إضافة وجهة جديدة +</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#14141e] px-4 py-3">
        <Search className="h-4 w-4 text-[#8892B0]" />
        <input
          type="text"
          placeholder="بحث في الوجهات، العواصم، والدول..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-[#F8F9FA] placeholder-[#64748B] focus:outline-none text-right"
        />
        <span className="text-[11px] text-[#8892B0] font-mono whitespace-nowrap">
          {filtered.length} وجهة
        </span>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-white/[0.08] bg-[#14141e]">
          <RefreshCw className="h-8 w-8 animate-spin text-[#c9a84c]" />
          <p className="text-xs text-[#8892B0]">جاري جلب الوجهات السياحية من قاعدة البيانات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/[0.1] bg-[#14141e]/50 p-6 text-center">
          <MapPin className="h-10 w-10 text-[#64748B]" />
          <p className="text-sm font-bold text-[#F8F9FA]">لا توجد وجهات مطابقة للبحث</p>
          <p className="text-xs text-[#8892B0]">اضغط على زر "إضافة وجهة جديدة +" لإنشاء وحفظ وجهات في قاعدة البيانات.</p>
        </div>
      ) : (
        /* Grid of Destinations */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(dest => (
            <div
              key={dest.id}
              className="group overflow-hidden rounded-3xl border border-white/[0.08] bg-[#14141e] transition-all duration-300 hover:border-[rgba(201,168,76,0.4)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.4)]"
            >
              <div className="relative h-48 w-full overflow-hidden bg-[#0d0d12]">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14141e] via-transparent to-transparent" />
                <div className="absolute top-3 right-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                  {dest.status}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#F8F9FA]">{dest.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#8892B0] mt-1">
                      <MapPin className="h-3.5 w-3.5 text-[#c9a84c]" />
                      <span>{dest.country}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-[#8892B0]">
                  <span>💎 {dest.packages} برامج سياحية</span>
                  <span>🏨 {dest.hotels} فندق ومنتجع</span>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] pt-3">
                  <button
                    onClick={() => handleOpenEdit(dest)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#8892B0] hover:text-[#c9a84c] hover:border-[rgba(201,168,76,0.3)] transition-all"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDelete(dest.id, dest.name)}
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition-all"
                    title="حذف الوجهة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Destination Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-[rgba(201,168,76,0.3)] bg-[#12121c] p-6 text-right shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-[#F8F9FA]">
                {editingDest ? `تعديل وجهة: ${editingDest.name}` : 'إضافة وجهة سياحية جديدة'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-2 text-[#8892B0] hover:text-[#F8F9FA] hover:bg-white/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Uploader */}
              <div>
                <label className="text-xs font-bold text-[#c9a84c] block mb-2">صورة الوجهة (من جهازك أو النماذج)</label>
                <DeviceImageUploader
                  currentImageUrl={formImage}
                  onImageSelected={url => setFormImage(url)}
                  title="صورة الوجهة السياحية"
                  subtitle="ارفع الصورة مباشرة من هاتفك أو جهازك"
                />
              </div>

              {/* Destination Name & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">اسم الوجهة / المدينة</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="مثال: باريس وكان"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">الدولة</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={e => setFormCountry(e.target.value)}
                    placeholder="مثال: فرنسا"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  />
                </div>
              </div>

              {/* Packages & Hotels count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">عدد البرامج</label>
                  <input
                    type="number"
                    value={formPackages}
                    onChange={e => setFormPackages(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">عدد الفنادق</label>
                  <input
                    type="number"
                    value={formHotels}
                    onChange={e => setFormHotels(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">الحالة</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  >
                    <option value="نشط">نشط</option>
                    <option value="مؤقت">مؤقت</option>
                    <option value="قريباً">قريباً</option>
                  </select>
                </div>
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
                {saving ? 'جاري الحفظ بالسيرفر...' : 'حفظ الوجهة الآن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
