'use client';

import { useEffect, useState } from 'react';
import { DataTable, type TableColumn } from '@/components/services/DataTable';
import type { PrivateJet } from '@/lib/serviceTypes';
import { fetchJetsFromFirestore, deleteJetFromFirestore } from '@/lib/firestoreService';

const MOCK_JETS: PrivateJet[] = [
  {
    id: '1', name: 'Gulfstream G700', tailNumber: 'N700GV',
    category: 'ultra_long_range', status: 'active',
    guestCapacity: 19, flightRange: 7500, wifiIncluded: true, bedConfiguration: 2, petFriendly: true,
    departureCity: 'Dubai', arrivalCity: 'London', hourlyRate: 12000, flatRoutePrice: 85000,
    description: 'Ultra-long-range flagship with full stand-up cabin.',
    images: [], createdAt: '2024-11-01T10:00:00Z',
  },
  {
    id: '2', name: 'Bombardier Global 7500', tailNumber: 'C-GLBL',
    category: 'heavy', status: 'active',
    guestCapacity: 14, flightRange: 7700, wifiIncluded: true, bedConfiguration: 2, petFriendly: false,
    departureCity: 'Paris', arrivalCity: 'New York', hourlyRate: 11000, flatRoutePrice: 78000,
    description: 'World-class range with four living spaces.',
    images: [], createdAt: '2024-10-15T08:30:00Z',
  },
  {
    id: '3', name: 'Cessna Citation Longitude', tailNumber: 'N700CL',
    category: 'super_midsize', status: 'draft',
    guestCapacity: 12, flightRange: 3500, wifiIncluded: true, bedConfiguration: 0, petFriendly: true,
    departureCity: 'Miami', arrivalCity: 'Nassau', hourlyRate: 7500, flatRoutePrice: 18000,
    description: 'Efficient super-midsize ideal for regional routes.',
    images: [], createdAt: '2024-09-22T12:00:00Z',
  },
  {
    id: '4', name: 'Dassault Falcon 10X', tailNumber: 'F-HFAL',
    category: 'ultra_long_range', status: 'active',
    guestCapacity: 16, flightRange: 7500, wifiIncluded: true, bedConfiguration: 3, petFriendly: false,
    departureCity: 'Riyadh', arrivalCity: 'Monaco', hourlyRate: 13500, flatRoutePrice: 92000,
    description: "Dassault's most advanced ultra-long-range jet.",
    images: [], createdAt: '2024-08-10T09:00:00Z',
  },
];

import Image from 'next/image';

const CATEGORY_LABELS: Record<string, string> = {
  super_midsize: 'طائرة متوسطة ممتازة',
  heavy: 'طائرة نفاثة ثقيلة (Heavy)',
  ultra_long_range: 'طائرة طويلة المدى (Ultra-Long)',
};

const COLUMNS: TableColumn<PrivateJet>[] = [
  {
    key: 'name',
    label: 'الطائرة / الموديل',
    render: row => {
      const cover = row.images?.find(i => i.position === 'main')?.url || row.images?.[0]?.url;
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#0A192F] border border-[rgba(136,146,176,0.2)]">
            {cover ? (
              <Image
                src={cover}
                alt={row.name}
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
            <p className="text-[#F8F9FA] font-bold text-xs">{row.name}</p>
            <p className="text-[#c9a84c] text-[11px] font-mono">{row.tailNumber || 'VIP Flagship'}</p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'category',
    label: 'الفئة والتصنيف',
    render: row => (
      <span className="text-[#8892B0] text-xs">{CATEGORY_LABELS[row.category] || row.category}</span>
    ),
  },
  {
    key: 'images',
    label: 'الصور المرفوعة',
    render: row => (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#CCD6F6] bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
        📸 {row.images?.length || 0} صور
      </span>
    ),
  },
  {
    key: 'guestCapacity',
    label: 'السعة والمدى',
    render: row => (
      <div>
        <p className="text-[#CCD6F6] text-xs font-mono">{row.guestCapacity} مقعد VIP</p>
        <p className="text-[#8892B0] text-[10px] font-mono">{row.flightRange?.toLocaleString?.() || row.flightRange} nm</p>
      </div>
    ),
  },
  {
    key: 'route',
    label: 'خط الرحلة الأكثر طلباً',
    render: row => (
      <span className="text-[#8892B0] text-xs">{row.departureCity || 'دبي / القاهرة'} ← {row.arrivalCity || 'لندن / باريس'}</span>
    ),
  },
  {
    key: 'hourlyRate',
    label: 'سعر الساعة',
    render: row => <span className="text-[#F8F9FA] text-xs font-bold font-mono">${row.hourlyRate?.toLocaleString?.() || row.hourlyRate}</span>,
  },
  { key: 'status', label: 'الحالة' },
];

export default function JetsPage() {
  const [jets, setJets] = useState<PrivateJet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJetsFromFirestore().then(data => {
      setJets(data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الطائرة من الأسطول؟')) return;
    try {
      await deleteJetFromFirestore(id);
      setJets(prev => prev.filter(j => j.id !== id));
    } catch {
      alert('حدث خطأ أثناء الحذف.');
    }
  }

  return (
    <div className="animate-[slide-up_0.3s_ease-out]">
      <DataTable
        title="أسطول الطيران الخاص (Private Jets)"
        subtitle="إدارة طائرات الأسطول الخاص، خطوط الطيران المباشرة والأسعار"
        addLabel="+ إضافة طائرة جديدة"
        addHref="/jets/edit?id=new"
        editHref={id => `/jets/edit?id=${id}`}
        columns={COLUMNS}
        data={jets}
        searchKeys={['name', 'tailNumber', 'departureCity', 'arrivalCity']}
        onDelete={handleDelete}
      />
    </div>
  );
}
