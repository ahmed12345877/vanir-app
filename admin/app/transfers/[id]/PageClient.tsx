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
  Car,
} from 'lucide-react';
import { TextInput, NumberInput, SelectInput, TextareaInput, ToggleInput } from '@/components/services/FormField';
import { FormSection } from '@/components/services/FormSection';
import type { VIPTransfer, ServiceImage } from '@/lib/serviceTypes';
import {
  fetchTransferByIdFromFirestore,
  saveTransferToFirestore,
  fetchHomeFeedCardsFromFirestore,
  saveHomeFeedCardsToFirestore,
} from '@/lib/firestoreService';

const EMPTY_TRANSFER: Omit<VIPTransfer, 'id' | 'images' | 'createdAt'> = {
  vehicleMakeModel: '',
  category: 'sedan',
  status: 'active',
  passengerCapacity: 0,
  luggageCapacity: 0,
  armored: false,
  englishChauffeur: false,
  hourlyRate: 0,
  airportTransferRate: 0,
  description: '',
};

const CATEGORY_OPTIONS = [
  { value: 'sedan', label: 'سيارة سيدان فاخرة (Sedan)' },
  { value: 'suv', label: 'دفع رباعي فاره (SUV)' },
  { value: 'van', label: 'فان VIP تنفيذي (Van)' },
];

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

export default function TransferFormPageClient({ params }: Props) {
  const isNew = params.id === 'new';
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(EMPTY_TRANSFER);
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isNew) return;
    fetchTransferByIdFromFirestore(params.id).then(transfer => {
      if (transfer) {
        setForm({
          vehicleMakeModel: transfer.vehicleMakeModel,
          category: transfer.category,
          status: transfer.status,
          passengerCapacity: transfer.passengerCapacity,
          luggageCapacity: transfer.luggageCapacity,
          armored: transfer.armored,
          englishChauffeur: transfer.englishChauffeur,
          hourlyRate: transfer.hourlyRate,
          airportTransferRate: transfer.airportTransferRate,
          description: transfer.description,
        });
        setImages(transfer.images || []);
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
    if (!form.vehicleMakeModel.trim()) {
      alert('يرجى إدخال طراز ونوع السيارة');
      return;
    }
    setSaving(true);
    try {
      const transferId = isNew ? `transfer-${Date.now()}` : params.id;

      const sanitizedImages: ServiceImage[] = images.map(img => ({
        url: img.url,
        label: img.label || '',
        position: img.position || '',
      }));

      const transferToSave: VIPTransfer = {
        vehicleMakeModel: form.vehicleMakeModel.trim(),
        category: form.category,
        status: form.status,
        passengerCapacity: Number(form.passengerCapacity) || 0,
        luggageCapacity: Number(form.luggageCapacity) || 0,
        armored: Boolean(form.armored),
        englishChauffeur: Boolean(form.englishChauffeur),
        hourlyRate: Number(form.hourlyRate) || 0,
        airportTransferRate: Number(form.airportTransferRate) || 0,
        description: form.description || '',
        id: transferId,
        images: sanitizedImages,
        createdAt: new Date().toISOString(),
      };

      const docSize = JSON.stringify(transferToSave).length;
      if (docSize > 950000) {
        alert(`حجم بيانات السيارة مع الصور (${Math.round(docSize / 1024)} KB) كبير جداً ويتجاوز حد قاعدة البيانات (1 MB). يرجى تقليل عدد الصور أو حذف صورة واحدة.`);
        setSaving(false);
        return;
      }

      await saveTransferToFirestore(transferToSave);

      // Sync home feed if this is transfer f4 or default featured
      try {
        const feedCards = await fetchHomeFeedCardsFromFirestore();
        const f4Card = feedCards.find(c => c.id === 'f4');
        if (f4Card && sanitizedImages[0]?.url) {
          f4Card.title = transferToSave.vehicleMakeModel;
          f4Card.subtitle = `Uniformed Chauffeur • ${transferToSave.passengerCapacity || 4} Passengers • Wi-Fi`;
          f4Card.image = sanitizedImages[0].url;
          f4Card.price = `$${transferToSave.airportTransferRate || transferToSave.hourlyRate || 350}/transfer`;
          await saveHomeFeedCardsToFirestore(feedCards);
        }
      } catch (feedErr) {
        console.warn('Error syncing transfer to home feed card:', feedErr);
      }

      setSuccessMsg('تم حفظ بيانات السيارة والصور بنجاح في قاعدة البيانات وتحديث التطبيق!');
      setTimeout(() => {
        router.push('/transfers');
      }, 1000);
    } catch {
      alert('حدث خطأ أثناء حفظ بيانات السيارة.');
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
            <Link href="/transfers" className="hover:text-[#c9a84c] transition-colors">
              أسطول سيارات الليموزين والنقل الفاخر
            </Link>
            <span>›</span>
            <span className="text-[#CCD6F6]">{isNew ? 'إضافة سيارة جديدة' : `تعديل السيارة #${params.id}`}</span>
          </div>
          <h2 className="text-[#F8F9FA] text-2xl font-bold flex items-center gap-2">
            <Car className="text-[#c9a84c] h-6 w-6" />
            {isNew ? 'إضافة سيارة فاخرة للأسطول' : `تعديل السيارة: ${form.vehicleMakeModel || '...'}`}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/transfers"
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
              'إنشاء السيارة'
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
      <FormSection title="البيانات الأساسية للمركبة" subtitle="الطراز، الفئة، وحالة التوفر">
        <TextInput label="طراز ونوع السيارة (Make & Model)" name="vehicleMakeModel" value={form.vehicleMakeModel} onChange={v => set('vehicleMakeModel', v)} placeholder="مثال: Rolls-Royce Phantom VIII, Mercedes-Maybach S680" required />
        <SelectInput label="فئة المركبة" name="category" value={form.category} onChange={v => set('category', v as typeof form.category)} options={CATEGORY_OPTIONS} />
        <SelectInput label="حالة الإتاحة" name="status" value={form.status} onChange={v => set('status', v as typeof form.status)} options={STATUS_OPTIONS} />
      </FormSection>

      {/* ─── 2. Photo Gallery Management (Direct Computer Upload) ─── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#F8F9FA] flex items-center gap-2">
              <ImageIcon className="text-[#c9a84c] h-5 w-5" />
              معرض صور السيارة (رفع مباشر من الكمبيوتر)
            </h3>
            <p className="text-xs text-[#8892B0] mt-1">
              ارفع صور السيارة ومقصورة الركاب الفاخرة مباشرة من جهازك، وستظهر فوراً في تفاصيل التطبيق
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
            <p className="text-sm font-bold text-[#F8F9FA]">لا توجد صور مرفوعة للسيارة حالياً</p>
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
                      alt={img.label || form.vehicleMakeModel || 'Vehicle Image'}
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
                      placeholder="عنوان الصورة (مثال: المقصورة الخلفية، الواجهة الأمامية)"
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
      <FormSection title="المواصفات والسعة" subtitle="عدد الركاب، سعة الحقائب">
        <NumberInput label="سعة الركاب (VIP Passengers)" name="passengerCapacity" value={form.passengerCapacity} onChange={v => set('passengerCapacity', v)} suffix="ركاب" />
        <NumberInput label="سعة الحقائب (Luggage Bags)" name="luggageCapacity" value={form.luggageCapacity} onChange={v => set('luggageCapacity', v)} suffix="حقائب" />
      </FormSection>

      {/* ─── 4. Features & Services ─── */}
      <FormSection title="المزايا والخدمات التنفيذية" columns={2}>
        <ToggleInput label="سيارة مصفحة (Armored B6/B7)" description="حماية باليستية مصفحة ضد الرصاص لكبار الشخصيات" value={form.armored} onChange={v => set('armored', v)} />
        <ToggleInput label="سائق خاص معتمد يتحدث الإنجليزية" description="سائق بزي رسمي معتمد وملم بمسارات وبروتوكول VIP" value={form.englishChauffeur} onChange={v => set('englishChauffeur', v)} />
      </FormSection>

      {/* ─── 5. Pricing ─── */}
      <FormSection title="أسعار الخدمة والتنقل" subtitle="سعر النقل الثابت من المطار والسعر بالساعة">
        <NumberInput label="سعر النقل من/إلى المطار (Airport Flat Rate)" name="airportTransferRate" value={form.airportTransferRate} onChange={v => set('airportTransferRate', v)} prefix="$" />
        <NumberInput label="السعر بالساعة (Hourly Rate)" name="hourlyRate" value={form.hourlyRate} onChange={v => set('hourlyRate', v)} prefix="$" />
      </FormSection>

      {/* ─── 6. Description ─── */}
      <FormSection title="الوصف وتجربة الركوب" columns={1}>
        <TextareaInput label="الوصف التفصيلي للسيارة" name="description" value={form.description} onChange={v => set('description', v)} placeholder="اكتب وصفاً لفخامة المقصورة، نوع الجلد، نظام الصوت، والمزايا الحصرية..." rows={5} />
      </FormSection>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        <Link
          href="/transfers"
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
            'إنشاء السيارة'
          ) : (
            'حفظ التعديلات'
          )}
        </button>
      </div>
    </div>
  );
}
