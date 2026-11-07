'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Upload,
  Trash2,
  Star,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Anchor,
} from 'lucide-react';
import { TextInput, NumberInput, SelectInput, TextareaInput, ToggleInput } from '@/components/services/FormField';
import { FormSection } from '@/components/services/FormSection';
import type { LuxuryYacht, ServiceImage } from '@/lib/serviceTypes';
import {
  fetchYachtByIdFromFirestore,
  saveYachtToFirestore,
  fetchHomeFeedCardsFromFirestore,
  saveHomeFeedCardsToFirestore,
} from '@/lib/firestoreService';

const EMPTY_YACHT: Omit<LuxuryYacht, 'id' | 'images' | 'createdAt'> = {
  name: '',
  builder: '',
  marinaLocation: '',
  status: 'active',
  lengthFt: 0,
  cabins: 0,
  guestCapacity: 0,
  crewSize: 0,
  jacuzzi: false,
  helipad: false,
  dailyRate: 0,
  weeklyRate: 0,
  description: '',
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط ومتاح للحجز (Active)' },
  { value: 'draft', label: 'مسودة (Draft)' },
];

interface Props {
  params: { id: string };
}

// High-efficiency Canvas compressor with strict Firestore 1MB document guard
async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let maxDimension = 850;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target?.result as string);

        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.70;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        while (dataUrl.length > 95000 && quality > 0.35) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (dataUrl.length > 95000) {
          maxDimension = 650;
          let w2 = img.width;
          let h2 = img.height;
          if (w2 > maxDimension || h2 > maxDimension) {
            if (w2 > h2) {
              h2 = Math.round((h2 * maxDimension) / w2);
              w2 = maxDimension;
            } else {
              w2 = Math.round((w2 * maxDimension) / h2);
              h2 = maxDimension;
            }
          }
          canvas.width = w2;
          canvas.height = h2;
          const ctx2 = canvas.getContext('2d');
          if (ctx2) {
            ctx2.drawImage(img, 0, 0, w2, h2);
            dataUrl = canvas.toDataURL('image/jpeg', 0.60);
          }
        }

        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function YachtFormPageClient({ params }: Props) {
  const isNew = params.id === 'new';
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(EMPTY_YACHT);
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isNew) return;
    fetchYachtByIdFromFirestore(params.id).then(yacht => {
      if (yacht) {
        setForm({
          name: yacht.name,
          builder: yacht.builder,
          marinaLocation: yacht.marinaLocation,
          status: yacht.status,
          lengthFt: yacht.lengthFt,
          cabins: yacht.cabins,
          guestCapacity: yacht.guestCapacity,
          crewSize: yacht.crewSize,
          jacuzzi: yacht.jacuzzi,
          helipad: yacht.helipad,
          dailyRate: yacht.dailyRate,
          weeklyRate: yacht.weeklyRate,
          description: yacht.description,
        });
        setImages(yacht.images || []);
      }
      setLoading(false);
    });
  }, [params.id, isNew]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // Handle uploading files directly from the computer
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImagesList: ServiceImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await compressImageFile(file);
          newImagesList.push({
            url: dataUrl,
            label: file.name.replace(/\.[^/.]+$/, ''),
            position: images.length === 0 && i === 0 ? 'main' : '',
          });
        }
      }

      setImages(prev => [...prev, ...newImagesList]);
    } catch {
      alert('حدث خطأ أثناء معالجة الصورة من الجهاز.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemoveImage(index: number) {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  }

  function handleSetMainCover(index: number) {
    setImages(prev => {
      const selected = prev[index];
      const others = prev.filter((_, idx) => idx !== index);
      return [
        { ...selected, position: 'main' },
        ...others.map(img => ({ ...img, position: '' })),
      ];
    });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      alert('يرجى إدخال اسم اليخت');
      return;
    }
    setSaving(true);
    try {
      const yachtId = isNew ? `yacht-${Date.now()}` : params.id;

      const sanitizedImages: ServiceImage[] = images.map(img => ({
        url: img.url,
        label: img.label || '',
        position: img.position || '',
      }));

      const yachtToSave: LuxuryYacht = {
        name: form.name.trim(),
        builder: form.builder.trim(),
        marinaLocation: form.marinaLocation.trim(),
        status: form.status,
        lengthFt: Number(form.lengthFt) || 0,
        cabins: Number(form.cabins) || 0,
        guestCapacity: Number(form.guestCapacity) || 0,
        crewSize: Number(form.crewSize) || 0,
        jacuzzi: Boolean(form.jacuzzi),
        helipad: Boolean(form.helipad),
        dailyRate: Number(form.dailyRate) || 0,
        weeklyRate: Number(form.weeklyRate) || 0,
        description: form.description || '',
        id: yachtId,
        images: sanitizedImages,
        createdAt: new Date().toISOString(),
      };

      const docSize = JSON.stringify(yachtToSave).length;
      if (docSize > 950000) {
        alert(`حجم بيانات اليخت مع الصور (${Math.round(docSize / 1024)} KB) كبير جداً ويتجاوز حد قاعدة البيانات (1 MB). يرجى تقليل عدد الصور أو حذف صورة واحدة.`);
        setSaving(false);
        return;
      }

      await saveYachtToFirestore(yachtToSave);

      // Sync home feed if this is yacht f5 or default featured
      try {
        const feedCards = await fetchHomeFeedCardsFromFirestore();
        const f5Card = feedCards.find(c => c.id === 'f5');
        if (f5Card && sanitizedImages[0]?.url) {
          f5Card.title = yachtToSave.name;
          f5Card.subtitle = `${yachtToSave.marinaLocation || 'Dubai Marina'} • Crew of ${yachtToSave.crewSize || 7}`;
          f5Card.image = sanitizedImages[0].url;
          f5Card.price = `$${yachtToSave.dailyRate?.toLocaleString() || '1,500'}/day`;
          await saveHomeFeedCardsToFirestore(feedCards);
        }
      } catch (feedErr) {
        console.warn('Error syncing yacht to home feed card:', feedErr);
      }

      setSuccessMsg('تم حفظ اليخت والصور بنجاح في قاعدة البيانات وتحديث التطبيق!');
      setTimeout(() => {
        router.push('/yachts');
      }, 1000);
    } catch {
      alert('حدث خطأ أثناء حفظ اليخت.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-[slide-up_0.3s_ease-out] space-y-6 max-w-5xl text-right font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#8892B0] text-xs mb-1.5">
            <Link href="/yachts" className="hover:text-[#c9a84c] transition-colors">
              أسطول اليخوت الفاخرة
            </Link>
            <span>›</span>
            <span className="text-[#CCD6F6]">{isNew ? 'إضافة يخت جديد' : `تعديل اليخت #${params.id}`}</span>
          </div>
          <h2 className="text-[#F8F9FA] text-2xl font-bold flex items-center gap-2">
            <Anchor className="text-[#c9a84c] h-6 w-6" />
            {isNew ? 'إضافة يخت فاخر جديد' : `تعديل بيانات اليخت: ${form.name || '...'}`}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/yachts"
            className="px-5 py-2.5 border border-white/[0.12] text-[#8892B0] rounded-xl text-xs font-semibold hover:bg-white/[0.05] transition-all"
          >
            إلغاء
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#c9a84c] hover:bg-[#dfba55] disabled:opacity-60 text-[#0d0d12] rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(201,168,76,0.25)]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : isNew ? (
              'إنشاء اليخت'
            ) : (
              'حفظ التعديلات'
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─── 1. Basic Information ─── */}
      <FormSection title="البيانات الأساسية لليخت" subtitle="الاسم، الشركة المصنعة، المارينا، وحالة الإتاحة">
        <TextInput label="اسم اليخت (Vessel Name)" name="name" value={form.name} onChange={v => set('name', v)} placeholder="مثال: Azure Empress Superyacht" required />
        <TextInput label="الشركة المصنعة / الترسانة" name="builder" value={form.builder} onChange={v => set('builder', v)} placeholder="مثال: Feadship, Lürssen, Benetti" required />
        <TextInput label="مارينا الانطلاق والرسو" name="marinaLocation" value={form.marinaLocation} onChange={v => set('marinaLocation', v)} placeholder="مثال: Dubai Marina & Arabian Gulf" />
        <SelectInput label="حالة اليخت" name="status" value={form.status} onChange={v => set('status', v as typeof form.status)} options={STATUS_OPTIONS} />
      </FormSection>

      {/* ─── 2. Photo Gallery Management (Direct Computer Upload) ─── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#F8F9FA] flex items-center gap-2">
              <ImageIcon className="text-[#c9a84c] h-5 w-5" />
              معرض صور اليخت (رفع مباشر من الكمبيوتر)
            </h3>
            <p className="text-xs text-[#8892B0] mt-1">
              ارفع صور اليخت من جهازك مباشرة، وستظهر فوراً في تفاصيل التطبيق ومعرض اليخوت
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-[rgba(201,168,76,0.15)] hover:bg-[rgba(201,168,76,0.25)] border border-[rgba(201,168,76,0.35)] text-[#c9a84c] text-xs font-bold rounded-xl transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري رفع الصورة...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  + ارفع صور من جهازك مباشرة
                </>
              )}
            </button>
          </div>
        </div>

        {images.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/[0.12] hover:border-[#c9a84c]/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all"
          >
            <Upload className="h-10 w-10 text-[#c9a84c] mb-2 opacity-80" />
            <p className="text-sm font-bold text-[#F8F9FA]">لا توجد صور مرفوعة لليخت حالياً</p>
            <p className="text-xs text-[#8892B0] mt-1">
              اضغط هنا لاختيار صور من ملفات جهاز الكمبيوتر (JPG, PNG, WebP)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {images.map((img, idx) => {
              const isMain = idx === 0 || img.position === 'main';
              return (
                <div
                  key={idx}
                  className={`group relative rounded-xl overflow-hidden border transition-all ${
                    isMain
                      ? 'border-[#c9a84c] shadow-[0_4px_16px_rgba(201,168,76,0.2)] bg-[#1b1b28]'
                      : 'border-white/[0.08] hover:border-white/[0.2] bg-[#12121a]'
                  }`}
                >
                  <div className="relative h-44 w-full bg-[#0a0a0f]">
                    <Image
                      src={img.url}
                      alt={img.label || form.name || 'Yacht Image'}
                      fill
                      unoptimized
                      className="object-cover"
                    />

                    {isMain && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 bg-[#c9a84c] text-[#0d0d12] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                        <Star className="h-3 w-3 fill-current" />
                        صورة الغلاف الرئيسية
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMainCover(idx)}
                          className="px-2.5 py-1.5 bg-[#c9a84c] text-[#0d0d12] text-[10px] font-bold rounded-lg hover:bg-white transition-all shadow-md"
                        >
                          تعيين كغلاف
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 bg-rose-600/90 text-white rounded-lg hover:bg-rose-500 transition-all shadow-md"
                        title="حذف الصورة"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <input
                      type="text"
                      placeholder="عنوان الصورة (مثال: الصالون الرئيسي، سطح التشمس)"
                      value={img.label || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setImages(prev =>
                          prev.map((item, i) => (i === idx ? { ...item, label: val } : item))
                        );
                      }}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#F8F9FA] placeholder-[#64748B] focus:outline-none focus:border-[#c9a84c] text-right"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 3. Specifications ─── */}
      <FormSection title="المواصفات الفنية لليخت" subtitle="الطول، عدد الكبائن، سعة الضيوف، وحجم الطاقم" columns={2}>
        <NumberInput label="الطول بالقدم (Length)" name="lengthFt" value={form.lengthFt} onChange={v => set('lengthFt', v)} suffix="ft" />
        <NumberInput label="عدد الكبائن (Cabins)" name="cabins" value={form.cabins} onChange={v => set('cabins', v)} />
        <NumberInput label="سعة الضيوف (Capacity)" name="guestCapacity" value={form.guestCapacity} onChange={v => set('guestCapacity', v)} suffix="ضيوف" />
        <NumberInput label="حجم طاقم الخدمة (Crew)" name="crewSize" value={form.crewSize} onChange={v => set('crewSize', v)} suffix="أفراد" />
      </FormSection>

      {/* ─── 4. Onboard Amenities ─── */}
      <FormSection title="المزايا والتجهيزات الملكية" columns={2}>
        <ToggleInput label="جاكوزي على السطح (Deck Jacuzzi)" description="مسبح جاكوزي دافئ ومطل على البحر مباشرة" value={form.jacuzzi} onChange={v => set('jacuzzi', v)} />
        <ToggleInput label="مهبط طائرات هليكوبتر (Helipad)" description="منصة هبوط معتمدة لطائرات الهليكوبتر الخاصة" value={form.helipad} onChange={v => set('helipad', v)} />
      </FormSection>

      {/* ─── 5. Charter Rates ─── */}
      <FormSection title="أسعار الاستئجار" subtitle="سعر اليوم الواحد والأسبوع بالدولار">
        <NumberInput label="سعر اليوم بالدولار (Daily Rate)" name="dailyRate" value={form.dailyRate} onChange={v => set('dailyRate', v)} prefix="$" />
        <NumberInput label="سعر الأسبوع بالدولار (Weekly Rate)" name="weeklyRate" value={form.weeklyRate} onChange={v => set('weeklyRate', v)} prefix="$" />
      </FormSection>

      {/* ─── 6. Description ─── */}
      <FormSection title="الوصف وتجربة الإبحار" columns={1}>
        <TextareaInput label="الوصف الكامل لليخت" name="description" value={form.description} onChange={v => set('description', v)} placeholder="اكتب وصفاً جذاباً لليخت والمزايا الفاخرة وخدمات الطاقم المشمولة..." rows={5} />
      </FormSection>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <Link
          href="/yachts"
          className="px-5 py-2.5 border border-white/[0.12] text-[#8892B0] rounded-xl text-xs font-semibold hover:bg-white/[0.05] transition-all"
        >
          إلغاء
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#c9a84c] hover:bg-[#dfba55] disabled:opacity-60 text-[#0d0d12] rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(201,168,76,0.25)]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الحفظ في Firestore...
            </>
          ) : isNew ? (
            'إنشاء اليخت'
          ) : (
            'حفظ التعديلات'
          )}
        </button>
      </div>
    </div>
  );
}
