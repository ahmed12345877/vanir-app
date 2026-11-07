'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import {
  fetchToursFromFirestore,
  saveTourToFirestore,
  deleteTourFromFirestore,
  seedInitialTours,
  type TourItem,
} from '@/lib/firestoreService';
import { DeviceImageUploader } from '@/components/DeviceImageUploader';

export default function ActivitiesPage() {
  const [tours, setTours] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<TourItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDuration, setFormDuration] = useState('4 ساعات');
  const [formPrice, setFormPrice] = useState('$650');
  const [formRating, setFormRating] = useState(4.9);
  const [formReviews, setFormReviews] = useState(120);
  const [formCategory, setFormCategory] = useState<'all' | 'day-trips' | 'packages' | 'cultural'>('day-trips');
  const [formBadge, setFormBadge] = useState('حصري VIP');
  const [formImage, setFormImage] = useState('');
  const [formHighlightsText, setFormHighlightsText] = useState('استقبال خاص VIP, سيارة رولز رويس خاصة, وجبة فاخرة');
  const [formStatus, setFormStatus] = useState<'active' | 'draft'>('active');

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    try {
      const items = await fetchToursFromFirestore();
      setTours(items);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function handleOpenAdd() {
    setEditingTour(null);
    setFormName('');
    setFormLocation('دبي، الإمارات');
    setFormDuration('4 ساعات');
    setFormPrice('$750');
    setFormRating(5.0);
    setFormReviews(85);
    setFormCategory('day-trips');
    setFormBadge('حصري VIP');
    setFormImage('https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800');
    setFormHighlightsText('استقبال ملكي خاص, مرشد سياحي شخصي, ضيافة 5 نجوم');
    setFormStatus('active');
    setModalOpen(true);
  }

  function handleOpenEdit(tour: TourItem) {
    setEditingTour(tour);
    setFormName(tour.name);
    setFormLocation(tour.location);
    setFormDuration(tour.duration);
    setFormPrice(tour.price);
    setFormRating(tour.rating);
    setFormReviews(tour.reviews);
    setFormCategory(tour.category);
    setFormBadge(tour.badge || '');
    setFormImage(tour.image);
    setFormHighlightsText(Array.isArray(tour.highlights) ? tour.highlights.join(', ') : '');
    setFormStatus(tour.status);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formName.trim() || !formLocation.trim() || !formPrice.trim()) {
      alert('يرجى ملء اسم النشاط، الموقع، والسعر');
      return;
    }
    if (!formImage) {
      alert('يرجى اختيار صورة للنشاط من جهازك أولاً');
      return;
    }

    setSaving(true);
    const highlights = formHighlightsText
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    const tourData: TourItem = {
      id: editingTour ? editingTour.id : 'act_' + Date.now(),
      name: formName.trim(),
      location: formLocation.trim(),
      duration: formDuration.trim(),
      price: formPrice.startsWith('$') ? formPrice.trim() : `$${formPrice.trim()}`,
      rating: Number(formRating) || 5.0,
      reviews: Number(formReviews) || 100,
      category: formCategory,
      badge: formBadge.trim() || null,
      image: formImage,
      fallbackImage: formImage,
      highlights: highlights.length > 0 ? highlights : ['خدمة كونسيرج مخصصة VIP'],
      status: formStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveTourToFirestore(tourData);
      if (editingTour) {
        setTours(prev => prev.map(t => (t.id === editingTour.id ? tourData : t)));
        showToast(`تم تعديل نشاط "${tourData.name}" بنجاح! التحديث مباشر في التطبيق الآن.`);
      } else {
        setTours(prev => [tourData, ...prev]);
        showToast(`تمت إضافة نشاط "${tourData.name}" بنجاح وحفظه في السيرفر!`);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert('خطأ أثناء حفظ النشاط في قاعدة البيانات: ' + (err.message || 'يرجى التحقق من الاتصال'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`هل أنت متأكد من حذف نشاط "${name}" نهائياً من التطبيق وقاعدة البيانات؟`)) return;
    try {
      await deleteTourFromFirestore(id);
      setTours(prev => prev.filter(t => t.id !== id));
      showToast(`تم حذف نشاط "${name}".`);
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  }

  async function handleSeed() {
    if (!confirm('هل تريد إعادة تعبئة الأنشطة الملكية الأولية في قاعدة البيانات؟')) return;
    setLoading(true);
    try {
      await seedInitialTours();
      const updated = await fetchToursFromFirestore();
      setTours(updated);
      showToast('تمت تعبئة الأنشطة والفعاليات الأولية بنجاح!');
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = tours.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <span className="text-xs font-bold uppercase tracking-wider">مزامنة حية مع قسم Tours في التطبيق</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#F8F9FA]">إدارة الأنشطة والفعاليات الحصرية</h2>
          <p className="text-xs text-[#8892B0] mt-1">
            تجارب السفر الفريدة والأنشطة المعروضة لضيوف VIP في التطبيق. أي تعديل أو صورة ترفعها تنعكس لحظياً.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSeed}
            className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#14141e] px-4 py-2.5 text-xs font-bold text-[#8892B0] hover:text-[#F8F9FA] hover:border-white/[0.2] transition-all"
            title="تعبئة النماذج الأولية"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#c9a84c]" />
            <span>استعادة النماذج الأولية</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-5 py-2.5 text-xs font-bold text-[#0d0d12] shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة نشاط وتجربة جديدة +</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#14141e] px-4 py-2.5 flex-1">
          <input
            type="text"
            placeholder="بحث في الأنشطة، التجارب، والمدن..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#F8F9FA] placeholder-[#64748B] focus:outline-none text-right"
          />
        </div>

        <div className="flex gap-1.5 bg-[#14141e] border border-white/[0.08] rounded-2xl p-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'day-trips', label: 'جولات يومية' },
            { id: 'packages', label: 'باقات متكاملة' },
            { id: 'cultural', label: 'تراثية وثقافية' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === c.id
                  ? 'bg-[#c9a84c] text-[#0d0d12] shadow-sm'
                  : 'text-[#8892B0] hover:text-[#F8F9FA]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Activities */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-white/[0.08] bg-[#14141e]">
          <RefreshCw className="h-8 w-8 animate-spin text-[#c9a84c]" />
          <p className="text-xs text-[#8892B0]">جاري تحميل الأنشطة من قاعدة البيانات السحابية...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/[0.1] bg-[#14141e]/50 p-6 text-center">
          <Calendar className="h-10 w-10 text-[#64748B]" />
          <p className="text-sm font-bold text-[#F8F9FA]">لا توجد أنشطة تطابق البحث</p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 text-xs font-bold text-[#c9a84c] hover:underline"
          >
            + إضافة نشاط جديد الآن
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(act => (
            <div
              key={act.id}
              className="group overflow-hidden rounded-3xl border border-white/[0.08] bg-[#14141e] transition-all hover:border-[rgba(201,168,76,0.4)] shadow-[0_15px_35px_rgba(0,0,0,0.3)] flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-[#0d0d12]">
                  <img
                    src={act.image}
                    alt={act.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {act.badge && (
                    <span className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0d0d12] shadow-md">
                      {act.badge}
                    </span>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-bold text-[#c9a84c] backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-current text-[#c9a84c]" />
                    <span>{act.rating}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-bold text-[#F8F9FA] line-clamp-2 leading-relaxed" title={act.name}>
                    {act.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#8892B0]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#c9a84c]" />
                      <span className="truncate">{act.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#8892B0]" />
                      <span>{act.duration}</span>
                    </div>
                  </div>

                  {Array.isArray(act.highlights) && act.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 border-t border-white/[0.05] pt-2">
                      {act.highlights.slice(0, 2).map((h, i) => (
                        <span key={i} className="text-[10px] bg-white/[0.04] text-[#CCD6F6] px-2 py-0.5 rounded-md truncate max-w-full">
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-base font-extrabold text-[#c9a84c] font-mono">{act.price}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(act)}
                      title="تعديل النشاط"
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-[#8892B0] hover:text-[#c9a84c] hover:bg-white/[0.08] transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(act.id, act.name)}
                      title="حذف النشاط من التطبيق"
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-[rgba(201,168,76,0.3)] bg-[#12121c] p-6 text-right shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#F8F9FA]">
                  {editingTour ? `تعديل نشاط: ${editingTour.name}` : 'إضافة نشاط وتجربة VIP جديدة'}
                </h3>
                <p className="text-xs text-[#8892B0] mt-0.5">
                  أي تعديل هنا يحفظ مباشرة في السيرفر ويظهر فوراً في هواتف العملاء
                </p>
              </div>
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
                <label className="text-xs font-bold text-[#c9a84c] block mb-2">صورة النشاط (من جهازك أو النماذج الفاخرة):</label>
                <DeviceImageUploader
                  currentImage={formImage}
                  onImageSelected={url => setFormImage(url)}
                />
              </div>

              {/* Title & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">اسم النشاط أو التجربة</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="مثال: جولة هليكوبتر خاصة فوق الأهرامات"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">المدينة / الموقع</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    placeholder="مثال: القاهرة، مصر"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  />
                </div>
              </div>

              {/* Price, Duration, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">السعر (USD)</label>
                  <input
                    type="text"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="مثال: $850"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs font-mono font-bold text-[#c9a84c] focus:border-[#c9a84c] focus:outline-none text-right"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">المدة الزمنية</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                    placeholder="مثال: 4 ساعات"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">التصنيف</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  >
                    <option value="day-trips">جولات يومية (Day Trips)</option>
                    <option value="packages">باقات متكاملة (Packages)</option>
                    <option value="cultural">تراثية وثقافية (Cultural)</option>
                    <option value="all">عام وشامل</option>
                  </select>
                </div>
              </div>

              {/* Rating, Badge, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">التقييم (0 - 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formRating}
                    onChange={e => setFormRating(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">شارة مميزة (Badge)</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={e => setFormBadge(e.target.value)}
                    placeholder="مثال: حصري VIP"
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0] block mb-1">حالة النشر</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                  >
                    <option value="active">نشط في التطبيق (Active)</option>
                    <option value="draft">مسودة مخفية (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="text-xs font-semibold text-[#8892B0] block mb-1">
                  المزايا والنقاط البارزة (افصل بينها بفاصلة ,)
                </label>
                <input
                  type="text"
                  value={formHighlightsText}
                  onChange={e => setFormHighlightsText(e.target.value)}
                  placeholder="مثال: استقبال VIP, سيارة خاصة, وجبة فاخرة مطلة على البحر"
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                />
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
                {saving ? 'جاري الحفظ بالسيرفر...' : editingTour ? 'حفظ التعديلات في التطبيق' : 'إضافة النشاط وحفظه الآن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
