'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { MapPin, Images, Sparkles, WalletCards } from 'lucide-react';
import type { ComponentType } from 'react';
import { DataTable, type TableColumn } from '@/components/services/DataTable';
import { LocationPicker } from '@/components/services/LocationPicker';
import { MOCK_PACKAGES } from '@/lib/mockPackages';
import type { LuxuryPackage } from '@/lib/serviceTypes';
import { fetchPackagesFromFirestore, deletePackageFromFirestore } from '@/lib/firestoreService';

const COLUMNS: TableColumn<LuxuryPackage>[] = [
  {
    key: 'name',
    label: 'Package',
    render: row => (
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-20 overflow-hidden rounded-2xl border border-[rgba(136,146,176,0.18)] bg-[#112240]">
          {row.images[0]?.url ? (
            <Image
              src={row.images[0].url}
              alt={row.images[0].label || row.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-[#8892B0]">
              Vanir
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#F8F9FA]">{row.name}</p>
          <p className="mt-1 text-xs text-[#8892B0]">{row.destination}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'durationNights',
    label: 'مدة الإقامة',
    render: row => (
      <div>
        <p className="text-xs font-bold text-[#F8F9FA] font-mono">{row.durationNights} ليالٍ</p>
        <p className="mt-0.5 text-[10px] text-[#8892B0]">{row.maxVipGuests} ضيوف VIP</p>
      </div>
    ),
  },
  {
    key: 'includedServices',
    label: 'المزايا والخدمات المشمولة',
    className: 'max-w-[280px]',
    render: row => (
      <span className="block text-xs leading-relaxed text-[#8892B0]">
        {row.includedServices}
      </span>
    ),
  },
  {
    key: 'pricePerPerson',
    label: 'السعر للشخص',
    render: row => (
      <div>
        <p className="text-xs font-bold text-[#c9a84c] font-mono">${row.pricePerPerson.toLocaleString()}</p>
        <p className="mt-0.5 text-[10px] text-[#8892B0]">شامل كافة الرسوم</p>
      </div>
    ),
  },
  {
    key: 'images',
    label: 'الوسائط',
    render: row => (
      <div>
        <p className="text-xs font-bold text-[#F8F9FA]">{row.images.length} صور</p>
      </div>
    ),
  },
  { key: 'status', label: 'الحالة' },
];

function PackageSummaryCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-4 text-right">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.1)] text-[#c9a84c]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-semibold text-[#8892B0]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#F8F9FA] font-mono">{value}</p>
      <p className="mt-1 text-xs text-[#8892B0]">{helper}</p>
    </article>
  );
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<LuxuryPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState('');

  useEffect(() => {
    fetchPackagesFromFirestore().then(data => {
      setPackages(data);
      if (data.length > 0) setSelectedPackageId(data[0].id);
      setLoading(false);
    });
  }, []);

  const selectedPackage = useMemo(
    () => packages.find(pkg => pkg.id === selectedPackageId) ?? packages[0],
    [packages, selectedPackageId],
  );

  const averageStay = packages.length
    ? Math.round(packages.reduce((total, pkg) => total + pkg.durationNights, 0) / packages.length)
    : 0;

  const averagePrice = packages.length
    ? Math.round(packages.reduce((total, pkg) => total + pkg.pricePerPerson, 0) / packages.length)
    : 0;

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا البرنامج السياحي؟')) return;
    try {
      await deletePackageFromFirestore(id);
      setPackages(prev => {
        const nextPackages = prev.filter(pkg => pkg.id !== id);
        if (id === selectedPackageId) {
          setSelectedPackageId(nextPackages[0]?.id ?? '');
        }
        return nextPackages;
      });
    } catch {
      alert('حدث خطأ أثناء الحذف.');
    }
  }

  return (
    <div className="space-y-6 animate-[slide-up_0.3s_ease-out] text-right font-sans">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PackageSummaryCard
          label="الباقات السياحية النشطة"
          value={String(packages.filter(pkg => pkg.status === 'active').length).padStart(2, '0')}
          helper="برامج منشورة وجاهزة للحجز الفوري عبر التطبيق"
          icon={Sparkles}
        />
        <PackageSummaryCard
          label="متوسط مدة الإقامة"
          value={`${averageStay} ليالٍ`}
          helper="المدة النموذجية لبرامج كبار الشخصيات الحالية"
          icon={MapPin}
        />
        <PackageSummaryCard
          label="متوسط سعر البرنامج"
          value={`$${averagePrice.toLocaleString()}`}
          helper="متوسط التكلفة للشخص الواحد شاملاً الخدمات"
          icon={WalletCards}
        />
        <PackageSummaryCard
          label="الصور والوسائط المعروضة"
          value={String(packages.reduce((count, pkg) => count + (pkg.images?.length || 0), 0)).padStart(2, '0')}
          helper="صور وبانرات عالية الدقة مربوطة بالبرامج"
          icon={Images}
        />
      </section>

      {selectedPackage && (
        <section className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold text-[#c9a84c]">البرنامج المختار حالياً</p>
              <h2 className="mt-2 text-xl font-bold text-[#F8F9FA]">{selectedPackage.name}</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#8892B0]">{selectedPackage.description}</p>
            </div>
            <div className="rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] px-3 py-1.5 text-xs font-bold text-[#c9a84c]">
              {selectedPackage.destination}
            </div>
          </div>
        </section>
      )}

      <DataTable
        title="البرامج والرحلات السياحية (Luxury Packages)"
        subtitle="إدارة باقات السفر الحصرية، الجولات الخاصة وخطط الرحلات الشاملة"
        addLabel="+ إضافة برنامج جديد"
        addHref="/services/packages/edit?id=new"
        editHref={id => `/services/packages/edit?id=${id}`}
        columns={COLUMNS}
        data={packages}
        searchKeys={['name', 'destination', 'includedServices']}
        onDelete={handleDelete}
        onRowClick={row => setSelectedPackageId(row.id)}
        selectedId={selectedPackage?.id}
      />
    </div>
  );
}
