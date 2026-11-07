'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Images, MapPin, Sparkles } from 'lucide-react';
import { TextInput, NumberInput, SelectInput, TextareaInput } from '@/components/services/FormField';
import { FormSection } from '@/components/services/FormSection';
import { LocationPicker } from '@/components/services/LocationPicker';
import { MediaGrid } from '@/components/services/MediaGrid';
import { EMPTY_PACKAGE_DRAFT, MOCK_PACKAGES } from '@/lib/mockPackages';
import type { LuxuryPackageDraft } from '@/lib/mockPackages';
import type { LuxuryPackage, ServiceImage } from '@/lib/serviceTypes';
import { fetchPackageByIdFromFirestore, savePackageToFirestore } from '@/lib/firestoreService';

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط ومتاح للحجز (Active)' },
  { value: 'draft', label: 'مسودة (Draft)' },
];

interface Props {
  params: { id: string };
}

export default function PackageFormPageClient({ params }: Props) {
  const isNew = params.id === 'new';
  const router = useRouter();
  const [form, setForm] = useState<LuxuryPackageDraft>(EMPTY_PACKAGE_DRAFT);
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetchPackageByIdFromFirestore(params.id).then(pkg => {
      if (pkg) {
        setForm({
          name: pkg.name,
          destination: pkg.destination,
          durationNights: pkg.durationNights,
          maxVipGuests: pkg.maxVipGuests,
          includedServices: pkg.includedServices,
          pricePerPerson: pkg.pricePerPerson,
          latitude: pkg.latitude,
          longitude: pkg.longitude,
          status: pkg.status,
          description: pkg.description,
          images: pkg.images || [],
        });
        setImages(pkg.images || []);
      }
      setLoading(false);
    });
  }, [params.id, isNew]);

  function set<K extends keyof LuxuryPackageDraft>(key: K, value: LuxuryPackageDraft[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleLocationPick(lat: number, lng: number) {
    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.destination.trim()) {
      alert('يرجى إدخال اسم البرنامج السياحي والوجهة');
      return;
    }
    setSaving(true);
    try {
      const pkgId = isNew ? `pkg-${Date.now()}` : params.id;
      const pkgToSave: LuxuryPackage = {
        ...form,
        id: pkgId,
        images: images.length > 0 ? images : form.images,
        createdAt: new Date().toISOString(),
      };
      await savePackageToFirestore(pkgToSave);
      router.push('/services/packages');
    } catch {
      alert('حدث خطأ أثناء حفظ البرنامج السياحي.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl space-y-5 animate-[slide-up_0.3s_ease-out]">
      <div className="rounded-[32px] border border-[rgba(136,146,176,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(168,178,209,0.16),transparent_34%),linear-gradient(180deg,rgba(17,34,64,0.98),rgba(10,25,47,0.98))] p-6 shadow-[0_24px_60px_rgba(10,25,47,0.34)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link href="/services/packages" className="transition-colors hover:text-[#8892B0]">
                Luxury Packages
              </Link>
              <span>›</span>
              <span className="text-[#8892B0]">{isNew ? 'New Package' : `Edit Package #${params.id}`}</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-[#F8F9FA]">
              {isNew ? 'Create an Ocean Pearl itinerary' : 'Refine this luxury package'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8892B0]">
              Compose the itinerary details, pin the destination, and connect the complete image set so the package is ready for concierge review.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/services/packages"
              className="rounded-2xl border border-[rgba(136,146,176,0.24)] px-4 py-2.5 text-sm font-medium text-[#CCD6F6] transition-all hover:border-[rgba(168,178,209,0.4)] hover:text-[#F8F9FA]"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-[#8892B0] px-5 py-2.5 text-sm font-bold text-[#0A192F] transition-all hover:bg-[#A8B2D8] disabled:opacity-60"
            >
              {saving ? 'Saving…' : isNew ? 'Create Package' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[rgba(136,146,176,0.14)] bg-[rgba(10,25,47,0.44)] p-4">
            <Sparkles className="h-5 w-5 text-[#CCD6F6]" />
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#64748B]">Status</p>
            <p className="mt-2 text-lg font-semibold text-[#F8F9FA] capitalize">{form.status}</p>
          </div>
          <div className="rounded-2xl border border-[rgba(136,146,176,0.14)] bg-[rgba(10,25,47,0.44)] p-4">
            <MapPin className="h-5 w-5 text-[#CCD6F6]" />
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#64748B]">Destination</p>
            <p className="mt-2 text-lg font-semibold text-[#F8F9FA]">{form.destination || 'Awaiting selection'}</p>
          </div>
          <div className="rounded-2xl border border-[rgba(136,146,176,0.14)] bg-[rgba(10,25,47,0.44)] p-4">
            <Images className="h-5 w-5 text-[#CCD6F6]" />
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#64748B]">Media coverage</p>
            <p className="mt-2 text-lg font-semibold text-[#F8F9FA]">{form.images?.length || 0} linked assets</p>
          </div>
        </div>
      </div>

      <FormSection title="Basic Information" subtitle="Core details for this luxury package">
        <TextInput
          label="Package Name"
          name="name"
          value={form.name}
          onChange={value => set('name', value)}
          placeholder="e.g. Royal Dubai Escape"
          required
        />
        <TextInput
          label="Destination"
          name="destination"
          value={form.destination}
          onChange={value => set('destination', value)}
          placeholder="e.g. Dubai, UAE"
          required
        />
        <SelectInput
          label="Status"
          name="status"
          value={form.status}
          onChange={value => set('status', value as LuxuryPackageDraft['status'])}
          options={STATUS_OPTIONS}
        />
      </FormSection>

      <FormSection title="Package Details" subtitle="Duration, guest limits, and price positioning" columns={3}>
        <NumberInput
          label="Duration (Nights)"
          name="durationNights"
          value={form.durationNights}
          onChange={value => set('durationNights', value)}
          suffix="nights"
          min={1}
        />
        <NumberInput
          label="Max VIP Guests"
          name="maxVipGuests"
          value={form.maxVipGuests}
          onChange={value => set('maxVipGuests', value)}
          suffix="guests"
          min={1}
        />
        <NumberInput
          label="Price per Person"
          name="pricePerPerson"
          value={form.pricePerPerson}
          onChange={value => set('pricePerPerson', value)}
          prefix="$"
          min={0}
        />
      </FormSection>

      <FormSection title="Experience Narrative" subtitle="Explain what is included and how the itinerary should be positioned" columns={1}>
        <TextareaInput
          label="Included Services"
          name="includedServices"
          value={form.includedServices}
          onChange={value => set('includedServices', value)}
          placeholder="e.g. Private Jet, 5-Star Hotel, VIP Transfer, Yacht Day, Michelin Dining…"
          rows={3}
        />
        <TextareaInput
          label="Full Description"
          name="description"
          value={form.description}
          onChange={value => set('description', value)}
          placeholder="Describe the package highlights, service tone, and guest promise…"
          rows={5}
        />
      </FormSection>

      <FormSection title="Destination Location" subtitle="Pin the destination on the map and keep the coordinates synced" columns={1}>
        <LocationPicker
          lat={form.latitude}
          lng={form.longitude}
          onChange={handleLocationPick}
          label="Destination pin"
        />
      </FormSection>

      <MediaGrid
        value={form.images || []}
        onChange={imgs => {
          set('images', imgs);
          setImages(imgs);
        }}
      />

      <div className="flex justify-end gap-3 pb-6 pt-2">
        <Link
          href="/services/packages"
          className="rounded-2xl border border-[rgba(136,146,176,0.24)] px-4 py-2.5 text-sm font-medium text-[#CCD6F6] transition-all hover:border-[rgba(168,178,209,0.4)] hover:text-[#F8F9FA]"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-2xl bg-[#8892B0] px-6 py-2.5 text-sm font-bold text-[#0A192F] transition-all hover:bg-[#A8B2D8] disabled:opacity-60"
        >
          {saving ? 'Saving…' : isNew ? 'Create Package' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
