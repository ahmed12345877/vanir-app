'use client';

import { useEffect, useState } from 'react';
import { Monitor, Save, Eye, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { DeviceImageUploader } from '@/components/DeviceImageUploader';
import {
  fetchFeedCardsFromFirestore,
  saveFeedCardsToFirestore,
  HomeFeedCard,
  INITIAL_FEED_CARDS,
} from '@/lib/firestoreService';

export default function HeroDesignPage() {
  const [cards, setCards] = useState<HomeFeedCard[]>(INITIAL_FEED_CARDS);
  const [headline, setHeadline] = useState('فخامة لا مثيل لها · تجارب سياحية ملكية');
  const [subheadline, setSubheadline] = useState('بوابتكم الحصرية لحجز الطيران الخاص، أسطول اليخوت السوبر، وأفخم المنتجعات حول العالم.');
  const [ctaText, setCtaText] = useState('Global First Class & Private Jet ✈️');
  const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const loaded = await fetchFeedCardsFromFirestore();
        if (loaded && loaded.length > 0) {
          setCards(loaded);
          const hero = loaded[0];
          if (hero) {
            setHeadline(hero.title || '');
            setSubheadline(hero.subtitle || '');
            setCtaText(hero.tag || '');
            setBgUrl(hero.image || '');
          }
        }
      } catch (err) {
        console.error('Failed to load hero banner:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updatedCards = [...cards];
      if (updatedCards.length > 0) {
        updatedCards[0] = {
          ...updatedCards[0],
          title: headline,
          subtitle: subheadline,
          tag: ctaText,
          image: bgUrl,
          images: [bgUrl],
        };
      } else {
        updatedCards.push({
          id: 'f1',
          category: 'flights',
          tag: ctaText,
          title: headline,
          subtitle: subheadline,
          image: bgUrl,
          images: [bgUrl],
          routeTarget: 'FlightBooking',
        });
      }

      await saveFeedCardsToFirestore(updatedCards);
      setCards(updatedCards);
      setSaved(true);
      showToast('تم حفظ بانر الواجهة الرئيسية وتحديث الصورة في قاعدة البيانات السحابية لحظياً!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('خطأ أثناء حفظ التعديلات: ' + (err.message || 'تأكد من الاتصال'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 text-right font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border border-[rgba(201,168,76,0.4)] bg-[#112240] p-4 text-[#F8F9FA] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 text-[#c9a84c]" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#F8F9FA]">تصميم الواجهة الرئيسية (Hero Banner)</h2>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5">
              متصل لحظياً بالسيرفر
            </span>
          </div>
          <p className="text-xs text-[#8892B0] mt-1">
            تعديل نصوص وصور البانر الرئيسي الأول في الصفحة الرئيسية للتطبيق والموقع
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/app-controls"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.1] bg-[#14141e] text-xs font-semibold text-[#8892B0] hover:text-[#F8F9FA] hover:border-[#c9a84c] transition-all"
          >
            <span>مركز تحكم كافة البطاقات</span>
            <ArrowRight className="h-3.5 w-3.5 rotate-180 text-[#c9a84c]" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-5 py-2.5 text-xs font-bold text-[#0d0d12] shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:opacity-95 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'جاري الحفظ بالسيرفر...' : saved ? 'تم الحفظ بنجاح ✓' : 'حفظ التعديلات في التطبيق'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] min-h-[300px] flex flex-col justify-end p-6 sm:p-8 shadow-2xl">
        {bgUrl ? (
          <img
            src={bgUrl}
            alt="Hero Background"
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-[#0d0d14]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.25)] px-3 py-1 text-[11px] font-bold text-[#c9a84c] backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            <span>{ctaText || 'معاينة حية لشاشة التطبيق'}</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8F9FA]">{headline}</h1>
          <p className="text-xs text-[#CCD6F6] leading-relaxed max-w-lg">{subheadline}</p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#14141e] p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#c9a84c] mb-2">
            صورة خلفية البانر الرئيسي (رفع مباشر من الكمبيوتر أو الهاتف):
          </label>
          <DeviceImageUploader
            currentImage={bgUrl}
            onImageSelected={url => setBgUrl(url)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#F8F9FA] mb-2">العنوان الرئيسي للبانر (Hero Title)</label>
          <input
            type="text"
            value={headline}
            onChange={e => setHeadline(e.target.value)}
            className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-4 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
            placeholder="مثال: رحلات الطيران الخاص وطائرات النخبة العالمية..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#F8F9FA] mb-2">الوصف التعريفي (Sub-headline)</label>
          <textarea
            rows={3}
            value={subheadline}
            onChange={e => setSubheadline(e.target.value)}
            className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-4 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right leading-relaxed"
            placeholder="مثال: بوابتكم الحصرية لحجز أسطول الطيران الخاص واليخوت السوبر..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#F8F9FA] mb-2">نص الشارة العلوية (Badge Tag)</label>
          <input
            type="text"
            value={ctaText}
            onChange={e => setCtaText(e.target.value)}
            className="w-full rounded-xl border border-white/[0.1] bg-[#0d0d12] px-4 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none text-right"
            placeholder="مثال: Global First Class & Private Jet ✈️"
          />
        </div>
      </div>
    </div>
  );
}
