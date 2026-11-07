import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Booking, BookingStatus } from '@/lib/types';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    confirmationCode: 'VNR-2024-001',
    guestName: 'Sheikh Abdullah Al-Rashid',
    guestEmail: 'a.rashid@private.ae',
    category: 'hotel',
    propertyName: 'Burj Al Arab Jumeirah',
    destination: 'Dubai, UAE',
    checkIn: '2024-12-20',
    checkOut: '2024-12-28',
    guests: 4,
    totalAmount: 19200,
    currency: 'USD',
    status: 'confirmed',
    createdAt: '2024-11-28T09:15:00Z',
  },
  {
    id: '2',
    confirmationCode: 'VNR-2024-002',
    guestName: 'Victoria Worthington',
    guestEmail: 'v.worthington@vc.com',
    category: 'flight',
    propertyName: 'Emirates First Class — LHR → DXB',
    destination: 'Dubai, UAE',
    checkIn: '2024-12-15',
    checkOut: '2024-12-15',
    guests: 2,
    totalAmount: 7600,
    currency: 'USD',
    status: 'pending',
    createdAt: '2024-11-27T14:30:00Z',
  },
  {
    id: '3',
    confirmationCode: 'VNR-2024-003',
    guestName: 'Dmitri Volkonsky',
    guestEmail: 'd.volkonsky@oligarch.ru',
    category: 'hotel',
    propertyName: 'Amanzoe Private Villa',
    destination: 'Porto Heli, Greece',
    checkIn: '2025-01-10',
    checkOut: '2025-01-18',
    guests: 6,
    totalAmount: 25600,
    currency: 'USD',
    status: 'confirmed',
    createdAt: '2024-11-26T11:00:00Z',
  },
  {
    id: '4',
    confirmationCode: 'VNR-2024-004',
    guestName: 'Priya Mehta',
    guestEmail: 'p.mehta@titanindustries.in',
    category: 'experience',
    propertyName: 'Private Nile Cruise — Luxury Dahabiya',
    destination: 'Luxor → Aswan, Egypt',
    checkIn: '2025-02-01',
    checkOut: '2025-02-08',
    guests: 2,
    totalAmount: 14800,
    currency: 'USD',
    status: 'pending',
    createdAt: '2024-11-25T16:45:00Z',
  },
  {
    id: '5',
    confirmationCode: 'VNR-2024-005',
    guestName: 'Jean-Pierre Marchand',
    guestEmail: 'jp.marchand@lvmh.fr',
    category: 'car',
    propertyName: 'Rolls-Royce Phantom — Weekly',
    destination: 'Monaco',
    checkIn: '2024-12-22',
    checkOut: '2024-12-29',
    guests: 1,
    totalAmount: 8400,
    currency: 'USD',
    status: 'completed',
    createdAt: '2024-11-24T10:00:00Z',
  },
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  confirmed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  completed: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const CATEGORY_LABELS: Record<string, string> = {
  hotel: 'إقامة وفنادق',
  flight: 'طيران خاص',
  car: 'توصيل وليموزين',
  experience: 'رحلة حصرية',
};

function formatRange(checkIn: string, checkOut: string) {
  return `${new Date(checkIn).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })} ← ${new Date(checkOut).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}`;
}

export function RecentBookings() {
  return (
    <section className="overflow-hidden rounded-[32px] border border-white/[0.08] bg-[linear-gradient(180deg,#14141e,#0e0e16)] shadow-[0_20px_55px_rgba(0,0,0,0.3)] text-right font-sans">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a84c]">أحدث الحجوزات والطلبات</p>
          <h3 className="mt-2 text-xl font-bold text-[#F8F9FA]">حجوزات العملاء المباشرة التي تتطلب مراجعة الكونسيرج</h3>
          <p className="mt-1 text-xs text-[#8892B0]">متابعة حية للضيوف، تواريخ السفر، وتأكيد الخدمات المجدولة.</p>
        </div>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.1)] px-4 py-2 text-xs font-bold text-[#c9a84c] transition-all hover:bg-[rgba(201,168,76,0.2)]"
        >
          <span>عرض كافة الحجوزات</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-right">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              {['العميل والرمز', 'الخدمة والوجهة', 'فترة الإقامة / السفر', 'المبلغ الإجمالي', 'الحالة'].map(col => (
                <th
                  key={col}
                  className="px-6 py-3.5 text-right text-[11px] font-bold text-[#8892B0]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {MOCK_BOOKINGS.map(booking => (
              <tr
                key={booking.id}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.1)] text-xs font-bold text-[#c9a84c]">
                      {booking.guestName.split(' ').slice(0, 2).map(part => part[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F8F9FA]">{booking.guestName}</p>
                      <p className="mt-0.5 text-xs text-[#8892B0] font-mono">{booking.guestEmail}</p>
                      <p className="mt-1 text-[10px] font-mono font-semibold text-[#c9a84c]">{booking.confirmationCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-[#CCD6F6]">
                      {CATEGORY_LABELS[booking.category]}
                    </span>
                    <p className="mt-1.5 text-xs font-medium text-[#F8F9FA]">{booking.propertyName}</p>
                    <p className="mt-0.5 text-[11px] text-[#8892B0]">{booking.destination}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-medium text-[#F8F9FA]">{formatRange(booking.checkIn, booking.checkOut)}</p>
                  <p className="mt-0.5 text-[11px] text-[#8892B0]">{booking.guests} ضيوف</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[#F8F9FA]">${booking.totalAmount.toLocaleString()}</p>
                  <p className="mt-0.5 text-[10px] text-[#8892B0] font-mono">{booking.currency}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}>
                    {STATUS_LABELS[booking.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
