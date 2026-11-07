'use client';

import { useEffect, useState } from 'react';
import { DataTable, type TableColumn } from '@/components/services/DataTable';
import type { LuxuryYacht } from '@/lib/serviceTypes';
import { fetchYachtsFromFirestore, deleteYachtFromFirestore } from '@/lib/firestoreService';

const MOCK_YACHTS: LuxuryYacht[] = [
  {
    id: '1', name: 'Azure Empress', builder: 'Feadship', marinaLocation: 'Dubai Marina',
    status: 'active',
    lengthFt: 164, cabins: 6, guestCapacity: 12, crewSize: 14, jacuzzi: true, helipad: true,
    dailyRate: 65000, weeklyRate: 390000,
    description: 'Award-winning superyacht with helipad and beach club.',
    images: [], createdAt: '2024-10-01T09:00:00Z',
  },
  {
    id: '2', name: 'Pearl of the Gulf', builder: 'Lürssen', marinaLocation: 'Abu Dhabi',
    status: 'active',
    lengthFt: 246, cabins: 10, guestCapacity: 20, crewSize: 26, jacuzzi: true, helipad: true,
    dailyRate: 120000, weeklyRate: 720000,
    description: 'Flagship superyacht with full spa and cinema.',
    images: [], createdAt: '2024-09-10T11:00:00Z',
  },
  {
    id: '3', name: 'Ivory Wave', builder: 'Sunseeker', marinaLocation: 'Monaco',
    status: 'draft',
    lengthFt: 95, cabins: 4, guestCapacity: 8, crewSize: 6, jacuzzi: true, helipad: false,
    dailyRate: 28000, weeklyRate: 168000,
    description: 'Sleek motor yacht ideal for Mediterranean day charters.',
    images: [], createdAt: '2024-08-15T08:00:00Z',
  },
  {
    id: '4', name: 'Horizon Star', builder: 'Benetti', marinaLocation: 'Maldives',
    status: 'active',
    lengthFt: 131, cabins: 5, guestCapacity: 10, crewSize: 11, jacuzzi: true, helipad: false,
    dailyRate: 48000, weeklyRate: 290000,
    description: 'Custom-built Benetti with tropical interior design.',
    images: [], createdAt: '2024-07-20T10:00:00Z',
  },
];

const COLUMNS: TableColumn<LuxuryYacht>[] = [
  {
    key: 'name',
    label: 'اسم اليخت / الشركة المصنعة',
    render: row => (
      <div>
        <p className="text-[#F8F9FA] font-bold text-xs">{row.name}</p>
        <p className="text-[#c9a84c] text-[11px]">{row.builder}</p>
      </div>
    ),
  },
  {
    key: 'marinaLocation',
    label: 'المرسى الحالي',
    render: row => <span className="text-[#8892B0] text-xs">{row.marinaLocation}</span>,
  },
  {
    key: 'lengthFt',
    label: 'الطول',
    render: row => <span className="text-[#CCD6F6] text-xs font-mono">{row.lengthFt} قدم</span>,
  },
  {
    key: 'guestCapacity',
    label: 'الضيوف',
    render: row => <span className="text-[#CCD6F6] text-xs font-mono">{row.guestCapacity} ضيوف</span>,
  },
  {
    key: 'dailyRate',
    label: 'السعر اليومي',
    render: row => <span className="text-[#F8F9FA] text-xs font-bold font-mono">${row.dailyRate.toLocaleString()}</span>,
  },
  { key: 'status', label: 'الحالة' },
];

export default function YachtsPage() {
  const [yachts, setYachts] = useState<LuxuryYacht[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYachtsFromFirestore().then(data => {
      setYachts(data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا اليخت من الأسطول؟')) return;
    try {
      await deleteYachtFromFirestore(id);
      setYachts(prev => prev.filter(y => y.id !== id));
    } catch {
      alert('حدث خطأ أثناء الحذف.');
    }
  }

  return (
    <div className="animate-[slide-up_0.3s_ease-out]">
      <DataTable
        title="اليخوت الفاخرة والسوبر يخت"
        subtitle="إدارة أسطول اليخوت الفارهة، مواقع المراسي وأسعار التأجير اليومية والأسبوعية"
        addLabel="+ إضافة يخت جديد"
        addHref="/yachts/edit?id=new"
        editHref={id => `/yachts/edit?id=${id}`}
        columns={COLUMNS}
        data={yachts}
        searchKeys={['name', 'builder', 'marinaLocation']}
        onDelete={handleDelete}
      />
    </div>
  );
}
