'use client';

import { useState, useEffect } from 'react';
import type { Booking, BookingStatus, BookingCategory } from '@/lib/types';
import { fetchBookingsFromFirestore, updateBookingStatusInFirestore } from '@/lib/firestoreService';
import { Plus, Search, Calendar, User, DollarSign, CheckCircle, Clock } from 'lucide-react';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1', confirmationCode: 'VNR-2026-001', guestName: 'صاحب السمو الشيخ عبدالله بن راشد',
    guestEmail: 'a.rashid@private.ae', category: 'hotel', propertyName: 'برج العرب جميرا - جناح ملكي',
    destination: 'دبي، الإمارات', checkIn: '2026-05-20', checkOut: '2026-05-28',
    guests: 4, totalAmount: 19200, currency: 'USD', status: 'confirmed', createdAt: '2026-04-14T09:15:00Z',
  },
  {
    id: '2', confirmationCode: 'VNR-2026-002', guestName: 'فيكتوريا وورثينجتون',
    guestEmail: 'v.worthington@vc.com', category: 'flight', propertyName: 'طيران خاص - لندن إلى دبي',
    destination: 'دبي، الإمارات', checkIn: '2026-05-15', checkOut: '2026-05-15',
    guests: 2, totalAmount: 38000, currency: 'USD', status: 'pending', createdAt: '2026-04-13T14:30:00Z',
  },
  {
    id: '3', confirmationCode: 'VNR-2026-003', guestName: 'ديمتري فولكونسكي',
    guestEmail: 'd.volkonsky@invest.ch', category: 'hotel', propertyName: 'فيلا أمانزوي الخاصة',
    destination: 'بورتو هيلي، اليونان', checkIn: '2026-06-10', checkOut: '2026-06-18',
    guests: 6, totalAmount: 25600, currency: 'USD', status: 'confirmed', createdAt: '2026-04-12T11:00:00Z',
  },
  {
    id: '4', confirmationCode: 'VNR-2026-004', guestName: 'بريا ميهتا',
    guestEmail: 'p.mehta@titan.in', category: 'experience', propertyName: 'رحلة دهبية النيل الملكية الفاخرة',
    destination: 'الأقصر ← أسوان، مصر', checkIn: '2026-06-01', checkOut: '2026-06-08',
    guests: 2, totalAmount: 14800, currency: 'USD', status: 'pending', createdAt: '2026-04-11T16:45:00Z',
  },
  {
    id: '5', confirmationCode: 'VNR-2026-005', guestName: 'جان بيير مارشان',
    guestEmail: 'jp.marchand@lvmh.fr', category: 'car', propertyName: 'رولز رويس فانتوم أسبوعي مع سائق VIP',
    destination: 'موناكو والريفييرا', checkIn: '2026-05-22', checkOut: '2026-05-29',
    guests: 1, totalAmount: 8400, currency: 'USD', status: 'completed', createdAt: '2026-04-10T10:00:00Z',
  },
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
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
  car: 'ليموزين وتوصيل',
  experience: 'رحلة وتجربة',
};

export default function BookingsPage() {
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<BookingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingsList, setBookingsList] = useState<Booking[]>(MOCK_BOOKINGS);

  useEffect(() => {
    fetchBookingsFromFirestore()
      .then(items => {
        if (items.length > 0) {
          setBookingsList(items);
        }
      })
      .catch(console.error);
  }, []);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatusInFirestore(id, newStatus);
      setBookingsList(prev => prev.map(b => (b.id === id ? { ...b, status: newStatus } : b)));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = bookingsList.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterCategory !== 'all' && b.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!b.guestName.toLowerCase().includes(q) && !b.confirmationCode.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalRevenue = filtered.reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div className="space-y-5 animate-[slide-up_0.3s_ease-out] text-right font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F8F9FA]">إدارة الحجوزات والطلبات المباشرة</h2>
          <p className="text-xs text-[#8892B0] mt-1">متابعة تأكيد حجوزات الطيران الخاص، اليخوت، الفنادق والجولات السياحية</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#c9a84c] to-[#e6c875] rounded-xl text-[#080810] text-xs font-bold shadow-[0_4px_16px_rgba(201,168,76,0.3)]">
          <Plus className="h-4 w-4" />
          <span>إضافة حجز جديد</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الحجوزات', value: bookingsList.length.toString(), color: 'text-[#c9a84c]' },
          { label: 'طلبات قيد المراجعة', value: bookingsList.filter(b => b.status === 'pending').length.toString(), color: 'text-amber-400' },
          { label: 'حجوزات مؤكدة', value: bookingsList.filter(b => b.status === 'confirmed').length.toString(), color: 'text-emerald-400' },
          { label: 'إجمالي القيمة (المعروضة)', value: `$${(totalRevenue / 1000).toFixed(1)}K`, color: 'text-[#c9a84c]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#14141e] border border-white/[0.08] rounded-2xl p-4">
            <p className={`${stat.color} text-2xl font-bold font-mono`}>{stat.value}</p>
            <p className="text-[#8892B0] text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#14141e] border border-white/[0.08] rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="بحث باسم الضيف أو رمز الحجز..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-[#0d0d12] border border-white/[0.08] rounded-xl text-[#F8F9FA] placeholder-[#64748B] text-xs px-4 py-2.5 w-64 focus:outline-none focus:border-[#c9a84c] text-right"
        />
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterStatus === s
                  ? 'bg-[rgba(201,168,76,0.15)] text-[#c9a84c] border-[rgba(201,168,76,0.3)]'
                  : 'bg-white/[0.03] border-white/[0.05] text-[#8892B0] hover:text-[#CCD6F6]'
              }`}
            >
              {s === 'all' ? 'كافة الحالات' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#14141e] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                {['رمز الحجز والإنشاء', 'بيانات الضيف', 'الخدمة والموقع', 'تواريخ الإقامة / السفر', 'المبلغ الإجمالي', 'الحالة', 'الإجراءات'].map(col => (
                  <th key={col} className="text-right px-5 py-3.5 text-[11px] font-bold text-[#8892B0] whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(booking => (
                <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-[#c9a84c] font-mono font-bold">{booking.confirmationCode}</p>
                    <p className="text-[#8892B0] text-[10px] mt-0.5">{new Date(booking.createdAt).toLocaleDateString('ar-EG')}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[#F8F9FA] font-bold">{booking.guestName}</p>
                    <p className="text-[#8892B0] text-[11px] font-mono">{booking.guestEmail}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-[#CCD6F6]">
                      {CATEGORY_LABELS[booking.category]}
                    </span>
                    <p className="text-[#F8F9FA] mt-1 font-medium">{booking.propertyName}</p>
                    <p className="text-[#8892B0] text-[11px]">{booking.destination}</p>
                  </td>
                  <td className="px-5 py-4 font-mono">
                    <p className="text-[#CCD6F6]">{booking.checkIn} ← {booking.checkOut}</p>
                    <p className="text-[#8892B0] text-[10px] mt-0.5">{booking.guests} ضيوف</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-[#F8F9FA] font-mono">${booking.totalAmount.toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLES[booking.status]}`}>
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'confirmed')}
                          className="text-xs text-emerald-400 hover:underline font-semibold"
                        >
                          تأكيد
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          className="text-xs text-rose-400 hover:underline font-semibold"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
