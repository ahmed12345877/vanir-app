'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  HardDrive,
  Eye,
} from 'lucide-react';


interface DeviceImageUploaderProps {
  currentImageUrl?: string;
  currentImage?: string;
  onImageSelected: (url: string) => void;
  title?: string;
  subtitle?: string;
  recommendedAspect?: string;
  folder?: string;
}

// 12 Curated VIP Vanir Presets
const VANIR_VIP_PRESETS = [
  {
    category: '✈️ الطيران والدرجة الأولى',
    items: [
      { label: 'طائرة خاصة في السماء الزرقاء', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=85' },
      { label: 'مقصورة الدرجة الأولى الملكية', url: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1600&q=85' },
      { label: 'جلف ستريم G650ER مدرج المطار', url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1600&q=85' },
    ],
  },
  {
    category: '🏨 فنادق ومنتجعات 5 نجوم',
    items: [
      { label: 'فيلات المالديف فوق الماء الفيروزي', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=85' },
      { label: 'منتجع نخلة جميرا الفاخر دبي', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&q=85' },
      { label: 'جناح بنتهاوس إطلالة برج خليفة', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=85' },
    ],
  },
  {
    category: '⛵ يخوت وليموزين ملكي',
    items: [
      { label: 'سوبر يخت ملكي في موناكو', url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1600&q=85' },
      { label: 'مرسيدس مايباخ ليموزين VIP', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1600&q=85' },
      { label: 'رحلة بحرية عند الغروب', url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600&q=85' },
    ],
  },
  {
    category: '🏛️ وجهات وسياحة ملكية',
    items: [
      { label: 'الأهرامات ونهر النيل الخالد', url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1600&q=85' },
      { label: 'شوارع باريس والشانزلزيه', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=85' },
      { label: 'شاليهات جبال الألب السويسرية', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1600&q=85' },
    ],
  },
];

// High-speed client-side Canvas compressor with adaptive Firestore 1MB guard
export async function compressImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.75,
  maxChars = 800000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        let dim = maxDimension;
        let q = quality;
        let result = '';

        for (let attempt = 0; attempt < 6; attempt++) {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > dim || height > dim) {
            if (width > height) {
              height = Math.round((height * dim) / width);
              width = dim;
            } else {
              width = Math.round((width * dim) / height);
              height = dim;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) break;

          ctx.drawImage(img, 0, 0, width, height);
          result = canvas.toDataURL('image/jpeg', q);

          // If size is safely within target limit, accept it
          if (result.length <= maxChars) {
            break;
          }

          // Otherwise, step down dimension and quality adaptively
          dim = Math.round(dim * 0.82);
          q = Math.max(0.35, q - 0.12);
        }

        resolve(result || (e.target?.result as string));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DeviceImageUploader({
  currentImageUrl,
  currentImage,
  onImageSelected,
  title = 'صورة البطاقة / المحتوى',
  subtitle = 'ارفع الصورة مباشرة من جهازك (الكمبيوتر أو الهاتف)',
  recommendedAspect = '16:9 أو 4:3 عالي الدقة',
  folder = 'app_feed',
}: DeviceImageUploaderProps) {
  const initialUrl = currentImageUrl || currentImage || '';
  const [activeTab, setActiveTab] = useState<'device' | 'presets' | 'url'>('device');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop
  React.useEffect(() => {
    const val = currentImageUrl || currentImage || '';
    if (val) {
      setPreviewUrl(val);
    }
  }, [currentImageUrl, currentImage]);

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, WEBP)');
      return;
    }

    setIsUploading(true);
    try {
      // For home_feed cards, compress strictly to <= 55,000 chars (~40KB) so the whole array never hits 1MB
      const isFeed = folder === 'app_feed';
      const maxDim = isFeed ? 800 : 1200;
      const targetQuality = isFeed ? 0.70 : 0.75;
      const targetMaxChars = isFeed ? 55000 : 800000;

      const dataUrl = await compressImageFile(file, maxDim, targetQuality, targetMaxChars);
      setPreviewUrl(dataUrl);
      setFileDetails({
        name: file.name,
        size: `${(dataUrl.length / 1024).toFixed(0)} KB (مضغوطة وآمنة)`,
      });

      // Directly use optimized DataURL stored in Firestore
      onImageSelected(dataUrl);
    } catch (err) {
      console.error('Error processing image:', err);
      alert('حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مجدداً.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleSelectPreset = (url: string) => {
    setPreviewUrl(url);
    setFileDetails(null);
    onImageSelected(url);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setPreviewUrl(customUrlInput.trim());
    setFileDetails(null);
    onImageSelected(customUrlInput.trim());
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setFileDetails(null);
    onImageSelected('');
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.1] bg-[#12121a] p-4 text-right">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-3">
        <div>
          <label className="text-xs font-bold text-[#F8F9FA] flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#c9a84c]" />
            <span>{title}</span>
          </label>
          <p className="mt-0.5 text-[11px] text-[#8892B0]">{subtitle}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-white/[0.08] bg-[#161622] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('device')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              activeTab === 'device'
                ? 'bg-[#c9a84c] text-[#0d0d12] shadow-sm'
                : 'text-[#8892B0] hover:text-[#F8F9FA]'
            }`}
          >
            <HardDrive className="h-3 w-3" />
            <span>رفع من الجهاز</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              activeTab === 'presets'
                ? 'bg-[#c9a84c] text-[#0d0d12] shadow-sm'
                : 'text-[#8892B0] hover:text-[#F8F9FA]'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>مكتبة فانير VIP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              activeTab === 'url'
                ? 'bg-[#c9a84c] text-[#0d0d12] shadow-sm'
                : 'text-[#8892B0] hover:text-[#F8F9FA]'
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            <span>رابط خارجي</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* TAB 1: Direct Device Upload (Primary) */}
      {activeTab === 'device' && (
        <div className="space-y-3">
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
              isDragging
                ? 'border-[#c9a84c] bg-[rgba(201,168,76,0.12)] shadow-[0_0_24px_rgba(201,168,76,0.2)]'
                : 'border-white/[0.15] bg-[#161622]/60 hover:border-[#c9a84c]/60 hover:bg-[#161622]'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <RefreshCw className="h-8 w-8 animate-spin text-[#c9a84c]" />
                <p className="text-xs font-bold text-[#F8F9FA]">جاري رفع وضغط الصورة بجودة فائقة...</p>
                <p className="text-[10px] text-[#8892B0]">يرجى الانتظار بضع ثوانٍ</p>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[#0d0d12] text-[#c9a84c] shadow-md mb-2">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-[#F8F9FA]">
                  اضغط هنا لاختيار صورة من جهازك، أو اسحب الصورة وأفلتها هنا
                </h4>
                <p className="mt-1 text-[11px] text-[#8892B0]">
                  يدعم صور الكمبيوتر أو الهاتف (PNG, JPG, WEBP, HEIC) • الأبعاد المفضلة: {recommendedAspect}
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-4 py-2 text-xs font-bold text-[#0d0d12] shadow-lg hover:opacity-95">
                  <HardDrive className="h-3.5 w-3.5" />
                  <span>تصفح ملفات جهازك 📂</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Curated VIP Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <p className="text-[11px] text-[#8892B0]">
            اختر صورة ملكية فائقة الجودة تم إعدادها مسبقاً لتطبيق فانير بنقرة واحدة:
          </p>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {VANIR_VIP_PRESETS.map(group => (
              <div key={group.category} className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#c9a84c]">{group.category}</span>
                <div className="grid grid-cols-3 gap-2">
                  {group.items.map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectPreset(item.url)}
                      className={`group relative h-20 w-full overflow-hidden rounded-xl border text-right transition-all ${
                        previewUrl === item.url
                          ? 'border-[#c9a84c] ring-2 ring-[#c9a84c]/50'
                          : 'border-white/[0.08] hover:border-[#c9a84c]/50'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.label}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-1.5 flex items-end">
                        <span className="text-[9px] font-bold text-[#F8F9FA] line-clamp-1">
                          {item.label}
                        </span>
                      </div>
                      {previewUrl === item.url && (
                        <div className="absolute top-1 left-1 rounded-full bg-[#c9a84c] p-0.5 text-[#0d0d12]">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: External URL (Secondary/Fallback) */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <label className="text-[11px] text-[#8892B0]">أدخل رابط الصورة المباشر من الإنترنت:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrlInput}
              onChange={e => setCustomUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... أو رابط صورتك"
              className="flex-1 rounded-xl border border-white/[0.1] bg-[#161622] px-3 py-2 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-left font-mono"
            />
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              className="rounded-xl bg-[#c9a84c] px-4 py-2 text-xs font-bold text-[#0d0d12] hover:bg-[#d8b85c]"
            >
              تطبيق
            </button>
          </div>
        </div>
      )}

      {/* Live Preview Bar */}
      {previewUrl ? (
        <div className="rounded-xl border border-[rgba(201,168,76,0.3)] bg-[#161622] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-[#F8F9FA]">معاينة الصورة الحالية المختارة:</span>
              {fileDetails && (
                <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#c9a84c]">
                  {fileDetails.name} ({fileDetails.size})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-[#CCD6F6] hover:text-white"
              >
                <RefreshCw className="h-3 w-3" />
                <span>تغيير</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/20"
              >
                <Trash2 className="h-3 w-3" />
                <span>حذف</span>
              </button>
            </div>
          </div>

          <div className="relative mt-2.5 h-36 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d12]">
            <img
              src={previewUrl}
              alt="معاينة الصورة"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-[#c9a84c] backdrop-blur-sm">
              جاهزة للعرض المباشر في التطبيق ✓
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
