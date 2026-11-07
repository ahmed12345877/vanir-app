'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { ServiceImage } from '@/lib/serviceTypes';

interface ImageSlot extends ServiceImage {}

const EMPTY_SLOT: ImageSlot = { url: '', label: '', position: '' };

function makeSlots(count: number): ImageSlot[] {
  return Array.from({ length: count }, () => ({ ...EMPTY_SLOT }));
}

interface UploadBoxProps {
  slot: ImageSlot;
  onChange: (updated: ImageSlot) => void;
  isMain?: boolean;
}

async function compressMediaFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let maxDim = 850;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target?.result as string);
        ctx.drawImage(img, 0, 0, w, h);
        let q = 0.70;
        let dataUrl = canvas.toDataURL('image/jpeg', q);
        while (dataUrl.length > 95000 && q > 0.35) {
          q -= 0.08;
          dataUrl = canvas.toDataURL('image/jpeg', q);
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

function UploadBox({ slot, onChange, isMain }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    try {
      const dataUrl = await compressMediaFile(file);
      onChange({ ...slot, url: dataUrl });
    } catch {
      const reader = new FileReader();
      reader.onload = e => onChange({ ...slot, url: (e.target?.result as string) ?? '' });
      reader.readAsDataURL(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed overflow-hidden
          flex flex-col items-center justify-center text-center
          transition-all duration-200 group
          ${isMain ? 'h-48' : 'h-28'}
          ${slot.url
            ? 'border-[#8892B0] bg-[#091630]'
            : 'border-[rgba(136,146,176,0.3)] bg-[#091630] hover:border-[#8892B0] hover:bg-[#0D2137]'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {slot.url ? (
          <>
            <Image
              src={slot.url}
              alt={slot.label || 'Service image upload preview'}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[rgba(10,25,47,0.6)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[#F8F9FA] text-xs font-semibold">Replace Image</span>
            </div>
          </>
        ) : (
          <>
            <div className={`text-[#8892B0] mb-1 ${isMain ? 'text-3xl' : 'text-xl'}`}>↑</div>
            <p className="text-[#8892B0] text-xs font-medium">
              {isMain ? 'Main Image' : 'Upload'}
            </p>
            <p className="text-[#4A5568] text-[10px] mt-0.5">PNG, JPG, WebP</p>
          </>
        )}

        {isMain && (
          <span className="absolute top-2 left-2 bg-[#8892B0] text-[#0A192F] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Main
          </span>
        )}
      </div>

      {/* Label & Position */}
      <input
        type="text"
        placeholder="Image label"
        value={slot.label}
        onChange={e => onChange({ ...slot, label: e.target.value })}
        className="
          w-full bg-[#091630] border border-[rgba(136,146,176,0.2)] rounded-md
          px-2.5 py-1.5 text-[#F8F9FA] text-xs placeholder-[#4A5568]
          focus:outline-none focus:border-[#8892B0] transition-colors
        "
      />
      <input
        type="text"
        placeholder="Position (e.g. hero, gallery-1)"
        value={slot.position}
        onChange={e => onChange({ ...slot, position: e.target.value })}
        className="
          w-full bg-[#091630] border border-[rgba(136,146,176,0.2)] rounded-md
          px-2.5 py-1.5 text-[#F8F9FA] text-xs placeholder-[#4A5568]
          focus:outline-none focus:border-[#8892B0] transition-colors
        "
      />
    </div>
  );
}

interface MediaGridProps {
  value?: ServiceImage[];
  onChange?: (images: ServiceImage[]) => void;
}

function normalizeSlots(value: ServiceImage[] = []) {
  const mainSlot = value[0] ?? { ...EMPTY_SLOT };
  const optionalSlots = makeSlots(8).map((slot, index) => value[index + 1] ?? slot);
  return { mainSlot, optionalSlots };
}

function persistSlots(
  mainSlot: ImageSlot,
  optionalSlots: ImageSlot[],
  onChange?: MediaGridProps['onChange'],
) {
  onChange?.([mainSlot, ...optionalSlots].filter(slot => Boolean(slot.url || slot.label || slot.position)));
}

export function MediaGrid({ value = [], onChange }: MediaGridProps) {
  const { mainSlot, optionalSlots } = normalizeSlots(value);

  function updateMain(updated: ImageSlot) {
    persistSlots(updated, optionalSlots, onChange);
  }

  function updateOptional(index: number, updated: ImageSlot) {
    const nextSlots = optionalSlots.map((slot, slotIndex) => (slotIndex === index ? updated : slot));
    persistSlots(mainSlot, nextSlots, onChange);
  }

  return (
    <div className="bg-[#0D2137] border border-[rgba(136,146,176,0.15)] rounded-xl p-5">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-[rgba(136,146,176,0.1)]">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-[#8892B0]" />
          <h3 className="text-[#F8F9FA] font-semibold text-sm tracking-wide">Media Gallery</h3>
        </div>
        <p className="text-[#4A5568] text-xs mt-1 ml-3">
          Upload a main image and up to 8 additional images. Each asset stores its own label and placement tag for package presentation.
        </p>
      </div>

      {/* Main image */}
      <div className="mb-5">
        <p className="text-[#8892B0] text-xs font-semibold uppercase tracking-wider mb-2">Main Image</p>
        <div className="max-w-sm">
          <UploadBox slot={mainSlot} onChange={updateMain} isMain />
        </div>
      </div>

      {/* Optional images grid */}
      <div>
        <p className="text-[#8892B0] text-xs font-semibold uppercase tracking-wider mb-3">
          Additional Images <span className="text-[#4A5568] font-normal normal-case">(optional)</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {optionalSlots.map((slot, i) => (
            <UploadBox key={i} slot={slot} onChange={updated => updateOptional(i, updated)} />
          ))}
        </div>
      </div>
    </div>
  );
}
