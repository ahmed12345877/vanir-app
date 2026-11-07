'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DataTable, type TableColumn } from '@/components/services/DataTable';
import {
  fetchHotelsFromFirestore,
  deleteHotelFromFirestore,
} from '@/lib/firestoreService';
import type { Hotel } from '@/lib/serviceTypes';

const VIEW_LABELS: Record<string, string> = {
  ocean: '🌊 إطلالة بحرية',
  city: '🏙️ إطلالة على المدينة',
  garden: '🌿 إطلالة على الحديقة',
  mountain: '⛰️ إطلالة جبلية',
};

function isApartment(row: Hotel): boolean {
  const cat = (row as any).category;
  const isApt = (row as any).isApartment;
  const suite = (row.suiteType || '').toLowerCase();
  const name = (row.propertyName || '').toLowerCase();
  return (
    cat === 'apartments' ||
    isApt === true ||
    suite.includes('residence') ||
    suite.includes('apartment') ||
    suite.includes('شقة') ||
    name.includes('residence') ||
    name.includes('apartment') ||
    name.includes('شقق')
  );
}

function getHotelCoverImage(row: any): string | null {
  if (!row) return null;
  if (Array.isArray(row.images) && row.images.length > 0) {
    const first = row.images[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first === 'object' && first.url) return first.url;
  }
  if (Array.isArray(row.photos) && row.photos.length > 0) {
    const first = row.photos[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first === 'object' && first.url) return first.url;
  }
  if (typeof row.image === 'string' && row.image.trim()) return row.image.trim();
  if (typeof row.coverImage === 'string' && row.coverImage.trim()) return row.coverImage.trim();
  return null;
}

const COLUMNS: TableColumn<Hotel>[] = [
  {
    key: 'propertyName',
    label: 'العقار / الجناح الملكي',
    render: row => {
      const cover = getHotelCoverImage(row);
      const apt = isApartment(row);
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-16 overflow-hidden rounded-xl border border-white/[0.08] bg-[#14141e] shrink-0">
            {cover ? (
              <Image
                src={cover}
                alt={row.propertyName}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-[#8892B0]">
                لا صورة
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[#F8F9FA] font-bold text-xs">{row.propertyName}</p>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                  apt
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}
              >
                {apt ? '🏢 شقة فندقية' : '🏨 فندق فاخر'}
              </span>
            </div>
            <p className="text-[#c9a84c] text-[11px] mt-0.5">{row.suiteType || (apt ? 'شقة مخدومة VIP' : 'جناح فندقي فاخر')}</p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'cityDestination',
    label: 'المدينة والوجهة',
    render: row => <span className="text-[#8892B0] text-xs">{row.cityDestination}</span>,
  },
  {
    key: 'viewType',
    label: 'الإطلالة',
    render: row => <span className="text-[#8892B0] text-xs">{VIEW_LABELS[row.viewType] || row.viewType}</span>,
  },
  {
    key: 'images',
    label: 'الصور المرفوعة',
    render: row => {
      const count = Array.isArray(row.images)
        ? row.images.length
        : Array.isArray((row as any).photos)
        ? (row as any).photos.length
        : (row as any).image ? 1 : 0;
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#CCD6F6] bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
          📸 {count} صور
        </span>
      );
    },
  },
  {
    key: 'nightlyRate',
    label: 'سعر الليلة',
    render: row => <span className="text-[#F8F9FA] text-xs font-bold font-mono">${row.nightlyRate?.toLocaleString?.() || row.nightlyRate}</span>,
  },
  { key: 'status', label: 'الحالة' },
];

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'hotels' | 'apartments'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotelsFromFirestore().then(data => {
      setHotels(data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) return;
    try {
      await deleteHotelFromFirestore(id);
      setHotels(prev => prev.filter(h => h.id !== id));
    } catch {
      alert('حدث خطأ أثناء الحذف.');
    }
  }

  const aptCount = hotels.filter(h => isApartment(h)).length;
  const hotelCount = hotels.filter(h => !isApartment(h)).length;

  const filteredHotels = hotels.filter(h => {
    if (categoryFilter === 'hotels') return !isApartment(h);
    if (categoryFilter === 'apartments') return isApartment(h);
    return true;
  });

  return (
    <div className="space-y-4 animate-[slide-up_0.3s_ease-out]">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            categoryFilter === 'all'
              ? 'bg-[linear-gradient(135deg,#c9a84c_0%,#e6c875_100%)] text-[#0d0d12] shadow-lg shadow-[#c9a84c]/20'
              : 'border border-white/[0.08] bg-[#14141e] text-[#8892B0] hover:text-[#F8F9FA]'
          }`}
        >
          <span>الكل</span>
          <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px] font-mono">{hotels.length}</span>
        </button>
        <button
          onClick={() => setCategoryFilter('hotels')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            categoryFilter === 'hotels'
              ? 'bg-[linear-gradient(135deg,#c9a84c_0%,#e6c875_100%)] text-[#0d0d12] shadow-lg shadow-[#c9a84c]/20'
              : 'border border-white/[0.08] bg-[#14141e] text-[#8892B0] hover:text-[#F8F9FA]'
          }`}
        >
          <span>🏨 الفنادق والمنتجعات</span>
          <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px] font-mono">{hotelCount}</span>
        </button>
        <button
          onClick={() => setCategoryFilter('apartments')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            categoryFilter === 'apartments'
              ? 'bg-[linear-gradient(135deg,#c9a84c_0%,#e6c875_100%)] text-[#0d0d12] shadow-lg shadow-[#c9a84c]/20'
              : 'border border-white/[0.08] bg-[#14141e] text-[#8892B0] hover:text-[#F8F9FA]'
          }`}
        >
          <span>🏢 الشقق الفندقية والبنتهاوس</span>
          <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px] font-mono">{aptCount}</span>
        </button>
      </div>

      <DataTable
        title={
          categoryFilter === 'apartments'
            ? 'الشقق الفندقية والأجنحة المخدومة (Hotel Apartments)'
            : categoryFilter === 'hotels'
            ? 'الفنادق والمنتجعات الفاخرة (Hotels & Resorts)'
            : 'الفنادق والشقق الفندقية الفاخرة (Hotels & Apartments)'
        }
        subtitle="إدارة محفظة الفنادق والشقق، رفع وتعديل الصور مباشرة من جهازك، وتحديث الأسعار والمواصفات"
        addLabel={categoryFilter === 'apartments' ? '+ إضافة شقة فندقية جديدة' : '+ إضافة فندق / شقة جديدة'}
        addHref="/hotels/edit?id=new"
        editHref={id => `/hotels/edit?id=${id}`}
        columns={COLUMNS}
        data={filteredHotels}
        searchKeys={['propertyName', 'cityDestination', 'suiteType']}
        onDelete={handleDelete}
      />
    </div>
  );
}
