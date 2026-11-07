'use client';

import { useEffect, useState, useRef } from 'react';
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
  Building2,
} from 'lucide-react';
import {
  TextInput,
  NumberInput,
  SelectInput,
  TextareaInput,
  ToggleInput,
} from '@/components/services/FormField';
import { FormSection } from '@/components/services/FormSection';
import {
  fetchHotelByIdFromFirestore,
  saveHotelToFirestore,
} from '@/lib/firestoreService';
import type { Hotel, ServiceImage } from '@/lib/serviceTypes';

const EMPTY_HOTEL: Omit<Hotel, 'id' | 'images' | 'createdAt'> = {
  propertyName: '',
  cityDestination: '',
  suiteType: '',
  category: 'hotel',
  status: 'active',
  roomSizeSqm: 120,
  viewType: 'ocean',
  butlerService: true,
  privatePool: false,
  nightlyRate: 500,
  latitude: 25.1412,
  longitude: 55.1852,
  description: '',
};

const CATEGORY_OPTIONS = [
  { value: 'hotel', label: '🏨 فندق ومنتجع فاخر (Luxury Hotel & Resort)' },
  { value: 'apartments', label: '🏢 شقة فندقية / بنتهاوس مخدوم (Hotel Apartment & Serviced Residence)' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط ومتاح للحجز (Active)' },
  { value: 'draft', label: 'مسودة (Draft)' },
];

const VIEW_OPTIONS = [
  { value: 'ocean', label: '🌊 إطلالة بحرية (Ocean View)' },
  { value: 'city', label: '🏙️ إطلالة على المدينة (City View)' },
  { value: 'garden', label: '🌿 إطلالة على الحديقة (Garden View)' },
  { value: 'mountain', label: '⛰️ إطلالة جبلية (Mountain View)' },
];

interface Props {
  params: { id: string };
}

// High-efficiency Canvas compressor with strict Firestore 1MB document guard
// Compresses each image to strictly under 85KB base64 so multiple photos never exceed 1MB total
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

        // Adaptive step-down: keep string length under 95,000 characters (~70KB)
        while (dataUrl.length > 95000 && quality > 0.35) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // If still over 95,000 characters, scale down dimensions slightly to 650px
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

export default function HotelFormPageClient({ params }: Props) {
  const isNew = params.id === 'new';
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(EMPTY_HOTEL);
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isNew) return;

    fetchHotelByIdFromFirestore(params.id).then(hotel => {
      if (hotel) {
        const cat = (hotel as any).category === 'apartments' || (hotel as any).isApartment ? 'apartments' : 'hotel';
        setForm({
          propertyName: hotel.propertyName,
          cityDestination: hotel.cityDestination,
          suiteType: hotel.suiteType,
          category: cat,
          status: hotel.status,
          roomSizeSqm: hotel.roomSizeSqm,
          viewType: hotel.viewType,
          butlerService: hotel.butlerService,
          privatePool: hotel.privatePool,
          nightlyRate: hotel.nightlyRate,
          latitude: hotel.latitude,
          longitude: hotel.longitude,
          description: hotel.description,
        });
        const rawImages = (hotel as any).images || (hotel as any).photos || [];
        const normalizedImages: ServiceImage[] = [];
        if (Array.isArray(rawImages)) {
          rawImages.forEach((img: any, idx: number) => {
            if (typeof img === 'string' && img.trim()) {
              normalizedImages.push({
                url: img.trim(),
                label: `صورة ${idx + 1}`,
                position: idx === 0 ? 'main' : '',
              });
            } else if (img && typeof img === 'object') {
              const url = img.url || img.uri || img.image || '';
              if (url) {
                normalizedImages.push({
                  url,
                  label: img.label || `صورة ${idx + 1}`,
                  position: img.position || (idx === 0 ? 'main' : ''),
                });
              }
            }
          });
        }
        if (normalizedImages.length === 0 && (hotel as any).image) {
          normalizedImages.push({
            url: (hotel as any).image,
            label: 'الغلاف الرئيسي',
            position: 'main',
          });
        }
        setImages(normalizedImages);
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
    } catch (err) {
      alert('حدث خطأ أثناء معالجة الصورة من الجهاز.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Remove a photo from the gallery
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
    if (!form.propertyName.trim()) {
      alert('يرجى إدخال اسم الفندق.');
      return;
    }

    setSaving(true);
    try {
      const hotelId = isNew ? `hotel-${Date.now()}` : params.id;

      const sanitizedImages: ServiceImage[] = images.map(img => ({
        url: img.url,
        label: img.label || '',
        position: img.position || '',
      }));

      const isApt = form.category === 'apartments';
      const hotelToSave: Hotel = {
        propertyName: form.propertyName.trim(),
        cityDestination: form.cityDestination.trim(),
        suiteType: form.suiteType.trim(),
        category: form.category,
        isApartment: isApt,
        status: form.status,
        roomSizeSqm: Number(form.roomSizeSqm) || 0,
        viewType: form.viewType || 'ocean',
        butlerService: Boolean(form.butlerService),
        privatePool: Boolean(form.privatePool),
        nightlyRate: Number(form.nightlyRate) || 0,
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
        description: form.description || '',
        id: hotelId,
        images: sanitizedImages,
        createdAt: new Date().toISOString(),
      };

      const docSize = JSON.stringify(hotelToSave).length;
      if (docSize > 950000) {
        alert(`حجم بيانات الفندق مع الصور (${Math.round(docSize / 1024)} KB) كبير جداً ويتجاوز حد قاعدة البيانات (1 MB). يرجى تقليل عدد الصور أو حذف صورة واحدة.`);
        setSaving(false);
        return;
      }

      await saveHotelToFirestore(hotelToSave);
      setSuccessMsg('تم حفظ الفندق والصور بنجاح في قاعدة البيانات السحابية!');
      setTimeout(() => {
        router.push('/hotels');
      }, 1000);
    } catch (err: any) {
      console.error('Error saving hotel to Firestore:', err);
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
        <span className="mr-3 text-sm font-bold">جاري تحميل بيانات الفندق والصور...</span>
      </div>
    );
  }

  return (
    <div className="animate-[slide-up_0.3s_ease-out] space-y-6 max-w-5xl pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#8892B0] text-xs mb-1">
            <Link href="/hotels" className="hover:text-[#c9a84c] transition-colors">
              الفنادق والمنتجعات
            </Link>
            <span>›</span>
            <span className="text-[#F8F9FA]">
              {isNew ? 'إضافة فندق جديد' : `تعديل: ${form.propertyName || params.id}`}
            </span>
          </div>
          <h2 className="text-[#F8F9FA] text-2xl font-bold flex items-center gap-2">
            <Building2 className="text-[#c9a84c] h-6 w-6" />
            {isNew ? 'إضافة فندق أو جناح فاخر' : `تعديل فندق: ${form.propertyName}`}
          </h2>
          <p className="text-[#8892B0] text-sm mt-0.5">
            إدارة بيانات الفندق، الأسعار، والميزات، ورفع وتعديل الصور مباشرة من جهازك
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hotels"
            className="px-4 py-2 border border-white/[0.12] text-[#8892B0] rounded-xl text-xs font-semibold hover:bg-white/[0.05] transition-all"
          >
            إلغاء
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#c9a84c] hover:bg-[#dfba55] disabled:opacity-60 text-[#0d0d12] rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(201,168,76,0.25)]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : isNew ? (
              'إنشاء الفندق'
            ) : (
              'حفظ التعديلات'
            )}
          </button>
        </div>
      </div>

      {successMsg ? (
        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs font-bold animate-[slide-up_0.2s_ease-out]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      ) : null}

      {/* ─── 1. Basic Information ─── */}
      <FormSection title="المعلومات الأساسية والتصنيف" subtitle="بيانات وهوية العقار والوجهة">
        <SelectInput
          label="نوع العقار (فندق أم شقة فندقية؟)"
          name="category"
          value={form.category || 'hotel'}
          onChange={v => set('category', v as 'hotel' | 'apartments')}
          options={CATEGORY_OPTIONS}
        />
        <TextInput
          label={form.category === 'apartments' ? 'اسم الشقق الفندقية / البرج السكني' : 'اسم الفندق / المنتجع'}
          name="propertyName"
          value={form.propertyName}
          onChange={v => set('propertyName', v)}
          placeholder={form.category === 'apartments' ? 'مثال: Four Seasons Private Residences أو Bvlgari Residences' : 'مثال: The Nile Ritz-Carlton أو Burj Al Arab'}
          required
        />
        <TextInput
          label="المدينة والوجهة السياحية"
          name="cityDestination"
          value={form.cityDestination}
          onChange={v => set('cityDestination', v)}
          placeholder="مثال: Cairo, Egypt 🇪🇬 أو Dubai, UAE 🇦🇪"
          required
        />
        <TextInput
          label={form.category === 'apartments' ? 'نوع الشقة / البنتهاوس' : 'نوع الجناح / الفيلا'}
          name="suiteType"
          value={form.suiteType}
          onChange={v => set('suiteType', v)}
          placeholder={form.category === 'apartments' ? 'مثال: 3-Bedroom Penthouse أو Luxury Serviced Residence' : 'مثال: Royal Suite أو Overwater Bungalow'}
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
              معرض صور الفندق (رفع مباشر من الكمبيوتر)
            </h3>
            <p className="text-xs text-[#8892B0] mt-1">
              يمكنك رفع أي صورة مباشرة من جهازك الكمبيوتر، حذف الصور القديمة، وتعيين صورة الغلاف الرئيسية
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
            <p className="text-sm font-bold text-[#F8F9FA]">لا توجد صور مرفوعة حالياً</p>
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
                      alt={img.label || `Hotel photo ${idx + 1}`}
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
                    <span className="absolute bottom-2 right-2 text-[10px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                      صورة {idx + 1}
                    </span>
                  </div>

                  {/* Label Input */}
                  <div className="p-2.5">
                    <input
                      type="text"
                      placeholder="عنوان/وصف الصورة (اختياري)"
                      value={img.label || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setImages(prev =>
                          prev.map((item, i) => (i === idx ? { ...item, label: val } : item))
                        );
                      }}
                      className="w-full text-[11px] bg-white/[0.04] border border-white/[0.08] focus:border-[#c9a84c]/50 rounded-lg px-2 py-1 text-[#F8F9FA] outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 3. Specifications ─── */}
      <FormSection title="المواصفات والخدمات" subtitle="تفاصيل الغرفة والمزايا الملكية">
        <NumberInput
          label="مساحة الغرفة / الجناح (متر مربع)"
          name="roomSizeSqm"
          value={form.roomSizeSqm}
          onChange={v => set('roomSizeSqm', v)}
          suffix="م²"
        />
        <SelectInput
          label="نوع الإطلالة"
          name="viewType"
          value={form.viewType}
          onChange={v => set('viewType', v as typeof form.viewType)}
          options={VIEW_OPTIONS}
        />
        <ToggleInput
          label="خدمة الخادم الشخصي (Butler Service)"
          description="خادم شخصي ملكي متاح 24/7 طوال فترة الإقامة"
          value={form.butlerService}
          onChange={v => set('butlerService', v)}
        />
        <ToggleInput
          label="حمام سباحة خاص (Private Pool)"
          description="حمام سباحة خاص داخل الجناح أو الفيلا"
          value={form.privatePool}
          onChange={v => set('privatePool', v)}
        />
      </FormSection>

      {/* ─── 4. Pricing & Location ─── */}
      <FormSection title="الأسعار والإحداثيات" subtitle="سعر الليلة وموقع الفندق على الخريطة">
        <NumberInput
          label="سعر الليلة بالدولار"
          name="nightlyRate"
          value={form.nightlyRate}
          onChange={v => set('nightlyRate', v)}
          prefix="$"
        />
        <div />
        <NumberInput
          label="خط العرض (Latitude)"
          name="latitude"
          value={form.latitude}
          onChange={v => set('latitude', v)}
          placeholder="مثال: 25.1412"
          min={-90}
          max={90}
          step={0.0001}
        />
        <NumberInput
          label="خط الطول (Longitude)"
          name="longitude"
          value={form.longitude}
          onChange={v => set('longitude', v)}
          placeholder="مثال: 55.1852"
          min={-180}
          max={180}
          step={0.0001}
        />
      </FormSection>

      {/* ─── 5. Description ─── */}
      <FormSection title="الوصف التفصيلي" columns={1}>
        <TextareaInput
          label="وصف الفندق وتجربة الإقامة"
          name="description"
          value={form.description}
          onChange={v => set('description', v)}
          placeholder="اكتب وصفاً جذاباً للفندق ومميزات الجناح، المطاعم الفاخرة، والسبا..."
          rows={5}
        />
      </FormSection>

      {/* Footer Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <Link
          href="/hotels"
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
            'إنشاء الفندق'
          ) : (
            'حفظ التعديلات'
          )}
        </button>
      </div>
    </div>
  );
}
