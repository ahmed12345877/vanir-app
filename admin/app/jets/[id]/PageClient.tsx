'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Upload,
  Trash2,
  Star,
  CheckCircle2,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  Loader2,
  Plane,
} from 'lucide-react';
import {
  TextInput,
  NumberInput,
  SelectInput,
  TextareaInput,
  ToggleInput,
} from '@/components/services/FormField';
import { FormSection } from '@/components/services/FormSection';
import type { PrivateJet, ServiceImage } from '@/lib/serviceTypes';
import { fetchJetByIdFromFirestore, saveJetToFirestore } from '@/lib/firestoreService';

const EMPTY_JET: Omit<PrivateJet, 'id' | 'images' | 'createdAt'> = {
  name: '',
  tailNumber: '',
  category: 'ultra_long_range',
  status: 'active',
  guestCapacity: 16,
  flightRange: 7500,
  wifiIncluded: true,
  bedConfiguration: 2,
  petFriendly: true,
  departureCity: 'Dubai (DWC)',
  arrivalCity: 'London (LTN)',
  hourlyRate: 16500,
  flatRoutePrice: 75000,
  description: '',
};

const CATEGORY_OPTIONS = [
  { value: 'ultra_long_range', label: 'طائرة طويلة المدى وفارهة (Ultra-Long Range)' },
  { value: 'heavy', label: 'طائرة ثقيلة فاخرة (Heavy VIP Jet)' },
  { value: 'super_midsize', label: 'طائرة متوسطة ممتازة (Super Midsize)' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط ومتاح للحجز (Active)' },
  { value: 'draft', label: 'مسودة (Draft)' },
];

interface Props {
  params: { id: string };
}

// High-efficiency Canvas compressor with strict Firestore document guard (<85KB base64)
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
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

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
          ctx.drawImage(img, 0, 0, w2, h2);
          dataUrl = canvas.toDataURL('image/jpeg', 0.65);
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

export default function JetFormPageClient({ params }: Props) {
  const isNew = params.id === 'new';
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(EMPTY_JET);
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isNew) return;
    fetchJetByIdFromFirestore(params.id).then(jet => {
      if (jet) {
        setForm({
          name: jet.name,
          tailNumber: jet.tailNumber,
          category: jet.category,
          status: jet.status,
          guestCapacity: jet.guestCapacity,
          flightRange: jet.flightRange,
          wifiIncluded: jet.wifiIncluded,
          bedConfiguration: jet.bedConfiguration,
          petFriendly: jet.petFriendly,
          departureCity: jet.departureCity,
          arrivalCity: jet.arrivalCity,
          hourlyRate: jet.hourlyRate,
          flatRoutePrice: jet.flatRoutePrice,
          description: jet.description,
        });
        setImages(jet.images || []);
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

  // Remove photo
  function handleRemoveImage(index: number) {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  }

  // Set as Main Cover photo
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

  // Save changes to Firestore
  async function handleSave() {
    if (!form.name.trim()) {
      alert('يرجى إدخال اسم الطائرة وموديلها');
      return;
    }

    setSaving(true);
    try {
      const jetId = isNew ? `jet-${Date.now()}` : params.id;

      const sanitizedImages: ServiceImage[] = images.map(img => ({
        url: img.url,
        label: img.label || '',
        position: img.position || '',
      }));

      const jetToSave: PrivateJet = {
        name: form.name.trim(),
        tailNumber: form.tailNumber.trim(),
        category: form.category,
        status: form.status,
        guestCapacity: Number(form.guestCapacity) || 0,
        flightRange: Number(form.flightRange) || 0,
        wifiIncluded: Boolean(form.wifiIncluded),
        bedConfiguration: Number(form.bedConfiguration) || 0,
        petFriendly: Boolean(form.petFriendly),
        departureCity: form.departureCity.trim(),
        arrivalCity: form.arrivalCity.trim(),
        hourlyRate: Number(form.hourlyRate) || 0,
        flatRoutePrice: Number(form.flatRoutePrice) || 0,
        description: form.description || '',
        id: jetId,
        images: sanitizedImages,
        createdAt: new Date().toISOString(),
      };

      const docSize = JSON.stringify(jetToSave).length;
      if (docSize > 950000) {
        alert(`حجم بيانات الطائرة مع الصور (${Math.round(docSize / 1024)} KB) كبير جداً ويتجاوز حد قاعدة البيانات (1 MB). يرجى تقليل عدد الصور أو حذف صورة واحدة.`);
        setSaving(false);
        return;
      }

      await saveJetToFirestore(jetToSave);
      setSuccessMsg('تم حفظ الطائرة وصور الأسطول بنجاح في قاعدة البيانات السحابية!');
      setTimeout(() => {
        router.push('/jets');
      }, 1000);
    } catch (err: any) {
      console.error('Error saving jet to Firestore:', err);
      const msg = err?.message || '';
      if (msg.includes('exceeds the maximum') || msg.includes('too large')) {
        alert('حجم الصور المرفوعة يتجاوز الحد المسموح به لقاعدة البيانات (1 ميجابايت). يرجى حذف صورة أو اختيار صور أخف.');
      } else {
        alert(`حدث خطأ أثناء الحفظ: ${msg || 'يرجى المحاولة مرة أخرى'}`);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#c9a84c]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-3 text-sm font-bold">جاري تحميل بيانات الطائرة والصور...</span>
      </div>
    );
  }

  return (
    <div className="animate-[slide-up_0.3s_ease-out] space-y-6 max-w-5xl pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#8892B0] text-xs mb-1">
            <Link href="/jets" className="hover:text-[#c9a84c] transition-colors">
              أسطول الطيران الخاص (Private Jets)
            </Link>
            <span>›</span>
            <span className="text-[#F8F9FA]">
              {isNew ? 'إضافة طائرة خاصة جديدة' : `تعديل الطائرة: ${form.name || params.id}`}
            </span>
          </div>
          <h2 className="text-[#F8F9FA] text-2xl font-black flex items-center gap-2.5">
            <Plane className="text-[#c9a84c] h-7 w-7" />
            {isNew ? 'تسجيل طائرة خاصة جديدة بالأسطول' : form.name}
          </h2>
          <p className="text-[#8892B0] text-xs mt-1">
            إدارة مواصفات الطائرة، المقصورة، المدى، الأسعار ومعرض الصور عالي الجودة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/jets"
            className="px-4 py-2 border border-white/[0.12] text-[#8892B0] hover:text-[#F8F9FA] hover:bg-white/[0.04] rounded-xl text-xs font-bold transition-all"
          >
            إلغاء
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#0d0d12] hover:brightness-110 disabled:opacity-50 rounded-xl text-xs font-black shadow-[0_4px_16px_rgba(201,168,76,0.3)] transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {isNew ? 'إنشاء الطائرة بالأسطول' : 'حفظ التعديلات السحابية'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successMsg ? (
        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold animate-[slide-up_0.2s_ease-out]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      ) : null}

      {/* ─── 1. Basic Information ─── */}
      <FormSection title="المعلومات الأساسية" subtitle="بيانات وهوية الطائرة والتصنيف">
        <TextInput
          label="اسم الطائرة / الموديل"
          name="name"
          value={form.name}
          onChange={v => set('name', v)}
          placeholder="مثال: Bombardier Global 7500 أو Gulfstream G650ER"
          required
        />
        <TextInput
          label="رقم التسجيل (Tail Number)"
          name="tailNumber"
          value={form.tailNumber}
          onChange={v => set('tailNumber', v)}
          placeholder="مثال: N700GV أو C-GLBL"
          required
        />
        <SelectInput
          label="فئة الطائرة"
          name="category"
          value={form.category}
          onChange={v => set('category', v as typeof form.category)}
          options={CATEGORY_OPTIONS}
        />
        <SelectInput
          label="الحالة"
          name="status"
          value={form.status}
          onChange={v => set('status', v as typeof form.status)}
          options={STATUS_OPTIONS}
        />
      </FormSection>

      {/* ─── 2. Photo Gallery Management (Direct Computer Upload) ─── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#F8F9FA] flex items-center gap-2">
              <ImageIcon className="text-[#c9a84c] h-5 w-5" />
              معرض صور الطائرة الخاصة (رفع مباشر من الكمبيوتر)
            </h3>
            <p className="text-xs text-[#8892B0] mt-1">
              ارفع صور الهيكل الخارجي، الصالون التنفيذي، جناح النوم، وقمرة القيادة. يتم ضغط الصور وتجهيزها بأعلى نقاوة
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

        {/* Image Grid */}
        {images.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/[0.12] hover:border-[#c9a84c]/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-all"
          >
            <Upload className="h-10 w-10 text-[#c9a84c] mb-2 opacity-80" />
            <p className="text-sm font-bold text-[#F8F9FA]">لا توجد صور مرفوعة للطائرة حالياً</p>
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
                      alt={img.label || `Jet photo ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />

                    {/* Gradient Overlay for controls */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      {isMain ? (
                        <span className="flex items-center gap-1 rounded-md bg-[#c9a84c] text-[#0d0d12] text-[10px] font-bold px-2 py-0.5">
                          <Star className="h-3 w-3 fill-current" />
                          الغلاف الرئيسي
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetMainCover(idx)}
                          title="تعيين كصورة غلاف رئيسية"
                          className="flex items-center gap-1 rounded-md bg-black/60 hover:bg-[#c9a84c] text-white hover:text-[#0d0d12] text-[10px] font-semibold px-2 py-0.5 border border-white/20 transition-colors"
                        >
                          <Star className="h-3 w-3" />
                          اجعلها الغلاف
                        </button>
                      )}
                    </div>

                    {/* Delete button Top Left */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="حذف هذه الصورة"
                      className="absolute top-2 left-2 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white p-1.5 transition-colors shadow-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Image index badge */}
                    <div className="absolute bottom-2 right-2 text-[10px] font-mono text-[#8892B0] bg-black/60 px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Label input below photo */}
                  <div className="p-2.5 bg-[#12121a]">
                    <input
                      type="text"
                      placeholder="عنوان/وصف الصورة (اختياري)"
                      value={img.label || ''}
                      onChange={e => {
                        const newLabel = e.target.value;
                        setImages(prev =>
                          prev.map((item, i) => (i === idx ? { ...item, label: newLabel } : item))
                        );
                      }}
                      className="w-full bg-[#0a0a0f] border border-white/[0.08] focus:border-[#c9a84c] rounded-lg px-2 py-1 text-xs text-[#F8F9FA] placeholder-[#4A5568] focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 3. Specifications ─── */}
      <FormSection title="المواصفات الفنية للرحلة" subtitle="السعة، المدى، وتكوين الأجنحة والأسرة" columns={3}>
        <NumberInput
          label="سعة الركاب VIP (Pax)"
          name="guestCapacity"
          value={form.guestCapacity}
          onChange={v => set('guestCapacity', v)}
          suffix="مقاعد VIP"
        />
        <NumberInput
          label="مدى الطيران (Nautical Miles)"
          name="flightRange"
          value={form.flightRange}
          onChange={v => set('flightRange', v)}
          suffix="nm"
        />
        <NumberInput
          label="عدد الأسرّة المتوفرة"
          name="bedConfiguration"
          value={form.bedConfiguration}
          onChange={v => set('bedConfiguration', v)}
          suffix="أسرّة نوم"
        />
      </FormSection>

      {/* ─── 4. Onboard Features ─── */}
      <FormSection title="الميزات وخدمات المقصورة" subtitle="إنترنت الأقمار الصناعية وسياسات المقصورة" columns={2}>
        <ToggleInput
          label="إنترنت الأقمار الصناعية (Ka-Band Wi-Fi)"
          description="اتصال فائق السرعة يدعم مكالمات الفيديو 4K طوال الرحلة"
          value={form.wifiIncluded}
          onChange={v => set('wifiIncluded', v)}
        />
        <ToggleInput
          label="مسموح باصطحاب الحيوانات الأليفة"
          description="إمكانية اصطحاب الحيوانات الأليفة في الصالون الخاص"
          value={form.petFriendly}
          onChange={v => set('petFriendly', v)}
        />
      </FormSection>

      {/* ─── 5. Route & Pricing ─── */}
      <FormSection title="خطوط الطيران والأسعار" subtitle="تحديد خط الطيران الأكثر طلباً وسعر الساعة">
        <TextInput
          label="مدينة ومطار الإقلاع المعتاد"
          name="departureCity"
          value={form.departureCity}
          onChange={v => set('departureCity', v)}
          placeholder="مثال: Dubai (DWC) أو Cairo (CAI)"
        />
        <TextInput
          label="مدينة ومطار الوصول"
          name="arrivalCity"
          value={form.arrivalCity}
          onChange={v => set('arrivalCity', v)}
          placeholder="مثال: London Luton (LTN) أو Paris (LBG)"
        />
        <NumberInput
          label="سعر ساعة الطيران ($ / Flight Hour)"
          name="hourlyRate"
          value={form.hourlyRate}
          onChange={v => set('hourlyRate', v)}
          prefix="$"
        />
        <NumberInput
          label="السعر التقديري لرحلة الخط الثابت ($ Flat Route)"
          name="flatRoutePrice"
          value={form.flatRoutePrice}
          onChange={v => set('flatRoutePrice', v)}
          prefix="$"
        />
      </FormSection>

      {/* ─── 6. Description ─── */}
      <FormSection title="الوصف والامتيازات الحصرية" subtitle="وصف تجربة الطيران الخاص والمقصورة" columns={1}>
        <TextareaInput
          label="الوصف الشامل للطائرة"
          name="description"
          value={form.description}
          onChange={v => set('description', v)}
          placeholder="صف فخامة الطائرة، مناطق المعيشة الأربعة، الجناح الرئيسي، خدمات الشيف الخاص والضيافة الملكية على متن الطائرة..."
          rows={5}
        />
      </FormSection>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <Link
          href="/jets"
          className="px-5 py-2.5 border border-white/[0.12] text-[#8892B0] hover:text-[#F8F9FA] hover:bg-white/[0.04] rounded-xl text-xs font-bold transition-all"
        >
          إلغاء التعديل
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#0d0d12] hover:brightness-110 disabled:opacity-50 rounded-xl text-xs font-black shadow-[0_4px_16px_rgba(201,168,76,0.3)] transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {isNew ? 'إنشاء الطائرة بالأسطول' : 'حفظ التعديلات السحابية'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
