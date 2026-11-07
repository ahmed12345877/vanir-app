'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  HardDrive,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import {
  fetchGalleryFromFirestore,
  saveGalleryItemToFirestore,
  deleteGalleryItemFromFirestore,
  seedInitialGallery,
  type GalleryItem,
} from '@/lib/firestoreService';
import { DeviceImageUploader } from '@/components/DeviceImageUploader';

export default function GalleryPage() {
  const [mediaItems, setMediaItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Image Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('الطيران الخاص');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Quick multi-upload input ref
  const quickInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    setLoading(true);
    try {
      const items = await fetchGalleryFromFirestore();
      setMediaItems(items);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('تم نسخ رابط الصورة إلى الحافظة!');
  }

  // Fast direct file upload from device via Canvas compression
  async function handleQuickFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSaving(true);
    showToast(`جاري معالجة وحفظ ${files.length} صورة من جهازك في قاعدة البيانات...`);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await compressFile(file);
          const uploadCategory = selectedCategory && selectedCategory !== 'الكل' 
            ? selectedCategory 
            : 'مجموعة النخبة VIP';

          const newItem: GalleryItem = {
            id: 'g_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            title: file.name.replace(/\.[^/.]+$/, ''),
            category: uploadCategory,
            url: dataUrl,
            createdAt: new Date().toISOString(),
          };
          await saveGalleryItemToFirestore(newItem);
          setMediaItems(prev => [newItem, ...prev]);
        }
      }
      showToast('تم حفظ الصور بنجاح في قاعدة البيانات وتظهر الآن لحظياً في التطبيق!');
    } catch (err: any) {
      alert('خطأ أثناء حفظ الصور: ' + (err.message || 'يرجى المحاولة مجدداً'));
    } finally {
      setSaving(false);
      if (quickInputRef.current) quickInputRef.current.value = '';
    }
  }

  // Client-side Canvas compressor
  function compressFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          let q = 0.75;
          let result = canvas.toDataURL('image/jpeg', q);
          while (result.length > 800000 && q > 0.4) {
            q -= 0.1;
            result = canvas.toDataURL('image/jpeg', q);
          }
          resolve(result);
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = err => reject(err);
    });
  }

  async function handleSaveNewImage() {
    if (!newImageUrl) {
      alert('يرجى اختيار صورة من جهازك أولاً');
      return;
    }
    if (!newTitle.trim()) {
      alert('يرجى كتابة عنوان أو وصف للصورة');
      return;
    }

    setSaving(true);
    try {
      const item: GalleryItem = {
        id: 'g_' + Date.now(),
        title: newTitle.trim(),
        category: newCategory,
        url: newImageUrl,
        createdAt: new Date().toISOString(),
      };
      await saveGalleryItemToFirestore(item);
      setMediaItems(prev => [item, ...prev]);
      setModalOpen(false);
      setNewTitle('');
      setNewImageUrl('');
      showToast('تم حفظ الصورة بنجاح وتثبيتها في قاعدة البيانات السحابية!');
    } catch (err: any) {
      alert('خطأ أثناء حفظ الصورة: ' + (err.message || 'تأكد من الاتصال'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`هل أنت متأكد من حذف صورة "${title}" نهائياً من المعرض وقاعدة البيانات؟`)) return;
    try {
      await deleteGalleryItemFromFirestore(id);
      setMediaItems(prev => prev.filter(item => item.id !== id));
      showToast('تم حذف الصورة من قاعدة البيانات وتحديث التطبيق.');
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  }

  const categories = ['الكل', 'الطيران الخاص', 'اليخوت', 'الفنادق', 'الليموزين', 'الوجهات', 'مجموعة النخبة VIP'];

  const filteredItems = selectedCategory === 'الكل'
    ? mediaItems
    : mediaItems.filter(item => {
        if (selectedCategory === 'مجموعة النخبة VIP') {
          return item.category === 'مجموعة النخبة VIP' || item.category === 'مرفوعة من الجهاز';
        }
        return item.category === selectedCategory;
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

      {/* Hidden file input for fast multi-upload */}
      <input
        ref={quickInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleQuickFileUpload}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#c9a84c] mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">مزامنة سحابية حية مع التطبيق (Firestore Live)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#F8F9FA]">معرض الصور والوسائط الملكي</h2>
          <p className="text-xs text-[#8892B0] mt-1">
            ارفع الصور مباشرة من جهازك (الكمبيوتر أو الهاتف). يتم حفظها فورياً في السيرفر وتظهر للمستخدمين مباشرة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => quickInputRef.current?.click()}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#14141e] px-4 py-2.5 text-xs font-bold text-[#F8F9FA] hover:border-[rgba(201,168,76,0.4)] hover:bg-[#1c1c28] transition-all disabled:opacity-50"
          >
            <HardDrive className="h-4 w-4 text-[#c9a84c]" />
            <span>رفع سريع من جهازك 📂</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-5 py-2.5 text-xs font-bold text-[#0d0d12] shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة صورة مخصصة +</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#c9a84c] text-[#0d0d12] shadow-sm'
                  : 'border border-white/[0.08] bg-[#14141e] text-[#8892B0] hover:text-[#F8F9FA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#8892B0]">
          إجمالي الصور المحفوظة: <strong className="text-[#c9a84c] font-mono">{mediaItems.length}</strong>
        </span>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-white/[0.08] bg-[#14141e]">
          <RefreshCw className="h-8 w-8 animate-spin text-[#c9a84c]" />
          <p className="text-xs text-[#8892B0]">جاري جلب معرض الصور من قاعدة البيانات...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/[0.1] bg-[#14141e]/50 p-6 text-center">
          <ImageIcon className="h-10 w-10 text-[#64748B]" />
          <p className="text-sm font-bold text-[#F8F9FA]">لا توجد صور في هذا التصنيف حالياً</p>
          <p className="text-xs text-[#8892B0]">اضغط على زر "رفع سريع من جهازك" لإضافة صور وحفظها فورياً.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-3xl border border-white/[0.08] bg-[#14141e] transition-all hover:border-[rgba(201,168,76,0.4)] shadow-[0_15px_35px_rgba(0,0,0,0.3)]"
            >
              <div className="relative h-48 w-full overflow-hidden bg-[#0d0d12]">
                <img
                  src={item.url}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 right-3 rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-bold text-[#c9a84c] border border-white/[0.1] backdrop-blur-sm">
                  {item.category === 'مرفوعة من الجهاز' ? 'مجموعة النخبة VIP' : item.category}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[#F8F9FA] truncate max-w-[190px]" title={item.title}>
                  {item.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyUrl(item.id, item.url)}
                    title="نسخ رابط الصورة"
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2 text-[#8892B0] hover:text-[#c9a84c] hover:bg-white/[0.08] transition-all"
                  >
                    {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    title="حذف نهائي من قاعدة البيانات"
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Image Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-[rgba(201,168,76,0.3)] bg-[#12121c] p-6 text-right shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-[#F8F9FA]">إضافة صورة جديدة لمعرض الوسائط</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-2 text-[#8892B0] hover:text-[#F8F9FA] hover:bg-white/[0.05]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#c9a84c] block mb-2">اختر الصورة من جهازك أو النماذج:</label>
                <DeviceImageUploader
                  currentImage={newImageUrl}
                  onImageSelected={url => setNewImageUrl(url)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8892B0] block mb-1">عنوان أو وصف الصورة:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثال: يخت ملكي في خليج موناكو..."
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8892B0] block mb-1">التصنيف:</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
                >
                  <option value="الطيران الخاص">الطيران الخاص</option>
                  <option value="اليخوت">اليخوت الفاخرة</option>
                  <option value="الفنادق">الفنادق والمنتجعات</option>
                  <option value="الليموزين">الليموزين والسيارات</option>
                  <option value="الوجهات">الوجهات العالمية</option>
                  <option value="مجموعة النخبة VIP">مجموعة النخبة VIP</option>
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
                onClick={handleSaveNewImage}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-6 py-2 text-xs font-bold text-[#0d0d12] shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ بالسيرفر...' : 'حفظ الصورة في المعرض الآن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
