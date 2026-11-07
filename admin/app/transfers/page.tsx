'use client';

import { useEffect, useState } from 'react';
import { DataTable, type TableColumn } from '@/components/services/DataTable';
import type { VIPTransfer } from '@/lib/serviceTypes';
import { fetchTransfersFromFirestore, deleteTransferFromFirestore } from '@/lib/firestoreService';

const MOCK_TRANSFERS: VIPTransfer[] = [
  {
    id: '1', vehicleMakeModel: 'Rolls-Royce Phantom VIII', category: 'sedan', status: 'active',
    passengerCapacity: 4, luggageCapacity: 3, armored: false, englishChauffeur: true,
    hourlyRate: 800, airportTransferRate: 1200,
    description: 'The pinnacle of luxury motoring with hand-crafted Starlight Headliner.',
    images: [], createdAt: '2024-10-01T09:00:00Z',
  },
  {
    id: '2', vehicleMakeModel: 'Mercedes-Maybach S680', category: 'sedan', status: 'active',
    passengerCapacity: 4, luggageCapacity: 3, armored: true, englishChauffeur: true,
    hourlyRate: 650, airportTransferRate: 950,
    description: 'Executive sedan with massage seats and Burmester 3D audio.',
    images: [], createdAt: '2024-09-15T10:00:00Z',
  },
  {
    id: '3', vehicleMakeModel: 'Bentley Bentayga EWB', category: 'suv', status: 'active',
    passengerCapacity: 4, luggageCapacity: 6, armored: false, englishChauffeur: true,
    hourlyRate: 700, airportTransferRate: 1100,
    description: 'Ultra-luxury SUV with panoramic sunroof and rear entertainment.',
    images: [], createdAt: '2024-08-20T11:00:00Z',
  },
  {
    id: '4', vehicleMakeModel: 'Mercedes-Benz V-Class VIP', category: 'van', status: 'draft',
    passengerCapacity: 7, luggageCapacity: 10, armored: false, englishChauffeur: true,
    hourlyRate: 450, airportTransferRate: 700,
    description: 'Spacious VIP van ideal for group airport transfers and city tours.',
    images: [], createdAt: '2024-07-10T08:00:00Z',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  sedan: 'سيارة سيدان فاخرة',
  suv: 'دفع رباعي فاره (SUV)',
  van: 'فان VIP تنفيذي',
};

const COLUMNS: TableColumn<VIPTransfer>[] = [
  {
    key: 'vehicleMakeModel',
    label: 'السيارة / الموديل',
    render: row => (
      <div>
        <p className="text-[#F8F9FA] font-bold text-xs">{row.vehicleMakeModel}</p>
        <p className="text-[#c9a84c] text-[11px]">{CATEGORY_LABELS[row.category]}</p>
      </div>
    ),
  },
  {
    key: 'passengerCapacity',
    label: 'الركاب',
    render: row => <span className="text-[#CCD6F6] text-xs font-mono">{row.passengerCapacity} ركاب</span>,
  },
  {
    key: 'armored',
    label: 'مصفحة ضد الرصاص',
    render: row => (
      <span className={`text-[11px] font-bold ${row.armored ? 'text-emerald-400' : 'text-[#64748B]'}`}>
        {row.armored ? '✓ مصفحة (B6/B7)' : '— قياسية'}
      </span>
    ),
  },
  {
    key: 'hourlyRate',
    label: 'سعر الساعة مع سائق',
    render: row => <span className="text-[#F8F9FA] text-xs font-bold font-mono">${row.hourlyRate.toLocaleString()}</span>,
  },
  {
    key: 'airportTransferRate',
    label: 'استقبال المطار VIP',
    render: row => <span className="text-[#c9a84c] text-xs font-bold font-mono">${row.airportTransferRate.toLocaleString()}</span>,
  },
  { key: 'status', label: 'الحالة' },
];

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<VIPTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransfersFromFirestore().then(data => {
      setTransfers(data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه السيارة من أسطول الليموزين؟')) return;
    try {
      await deleteTransferFromFirestore(id);
      setTransfers(prev => prev.filter(t => t.id !== id));
    } catch {
      alert('حدث خطأ أثناء الحذف.');
    }
  }

  return (
    <div className="animate-[slide-up_0.3s_ease-out]">
      <DataTable
        title="الليموزين والسيارات الفارهة (VIP Transfers)"
        subtitle="إدارة أسطول السيارات الفاخرة، السيارات المصفحة وخدمات التوصيل من وإلى المطار"
        addLabel="+ إضافة سيارة جديدة"
        addHref="/transfers/edit?id=new"
        editHref={id => `/transfers/edit?id=${id}`}
        columns={COLUMNS}
        data={transfers}
        searchKeys={['vehicleMakeModel', 'category']}
        onDelete={handleDelete}
      />
    </div>
  );
}
