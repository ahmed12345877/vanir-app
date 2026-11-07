'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  SlidersHorizontal,
  Sparkles,
  Plane,
  Building,
  Globe,
  FileText,
  ShieldCheck,
  Compass,
  ShipWheel,
  CarFront,
  Bot,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  UploadCloud,
  Smartphone,
  Check,
  Crown,
  ChevronUp,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import {
  fetchAppControlsFromFirestore,
  fetchFeedCardsFromFirestore,
  saveAppControlsToFirestore,
  saveFeedCardsToFirestore,
  ServiceControls,
  HomeFeedCard,
  INITIAL_SERVICE_CONTROLS,
  INITIAL_FEED_CARDS,
} from '@/lib/firestoreService';
import { DeviceImageUploader, compressImageFile } from '@/components/DeviceImageUploader';

export default function AppControlsPage() {
  const [activeTab, setActiveTab] = useState<'images' | 'buttons' | 'welcome'>('images');
  const [controls, setControls] = useState<ServiceControls>(INITIAL_SERVICE_CONTROLS);
  const [feedCards, setFeedCards] = useState<HomeFeedCard[]>(INITIAL_FEED_CARDS);
  const [loading, setLoading] = useState(true);
  const [savingControls, setSavingControls] = useState(false);
  const [savingCards, setSavingCards] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Card modal state
  const [editingCard, setEditingCard] = useState<HomeFeedCard | null>(null);

  // Quick upload ref for direct card replacement
  const [quickUploadCardId, setQuickUploadCardId] = useState<string | null>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [loadedControls, loadedCards] = await Promise.all([
          fetchAppControlsFromFirestore(),
          fetchFeedCardsFromFirestore(),
        ]);
        setControls(loadedControls);
        if (loadedCards && loadedCards.length > 0) {
          setFeedCards(loadedCards);
        }
      } catch (err) {
        console.error('Failed to load controls:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  const toggleControl = (key: keyof ServiceControls) => {
    if (key === 'emergency_notice' || key === 'welcome_bg_image') return;
    setControls(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveControls = async () => {
    setSavingControls(true);
    try {
      await saveAppControlsToFirestore(controls);
      showToast('تم تحديث إعدادات التطبيق وشاشة الترحيب بنجاح! التغييرات حية الآن على كافة هواتف العملاء.');
    } catch (err: any) {
      alert('خطأ أثناء حفظ الإعدادات: ' + (err.message || 'يرجى التحقق من الاتصال'));
    } finally {
      setSavingControls(false);
    }
  };

  const handleSaveCards = async (updatedCards: HomeFeedCard[]) => {
    setSavingCards(true);
    try {
      await saveFeedCardsToFirestore(updatedCards);
      setFeedCards(updatedCards);
      setEditingCard(null);
      showToast('تم حفظ وتحديث صور وبانرات الشاشة الرئيسية بنجاح! تظهر الآن لحظياً للمستخدمين.');
    } catch (err: any) {
      alert('خطأ أثناء حفظ الصور: ' + (err.message || 'يرجى التحقق من الاتصال'));
    } finally {
      setSavingCards(false);
    }
  };

  const handleDeleteCard = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه البطاقة من الشاشة الرئيسية للتطبيق؟')) return;
    const updated = feedCards.filter(c => c.id !== id);
    handleSaveCards(updated);
  };

  // Quick single card image file upload from device with adaptive Firestore safe compression
  const handleQuickCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickUploadCardId) return;

    try {
      showToast('جاري ضغط ومعالجة الصورة بمقاييس سحابية آمنة...');
      const dataUrl = await compressImageFile(file, 800, 0.70, 55000);
      const updated = feedCards.map(c =>
        c.id === quickUploadCardId
          ? { ...c, image: dataUrl, images: [dataUrl] }
          : c,
      );
      await handleSaveCards(updated);
      showToast('تم تحديث صورة البطاقة بنجاح من جهازك!');
    } catch (err: any) {
      alert('حدث خطأ أثناء معالجة الصورة: ' + (err.message || 'يرجى المحاولة مجدداً'));
    } finally {
      setQuickUploadCardId(null);
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  const serviceButtonsList = [
    { key: 'flights' as const, label: 'رحلات الطيران والطيران الخاص', icon: Plane, desc: 'حجوزات الدرجة الأولى والطائرات الخاصة الفاخرة' },
    { key: 'apartments' as const, label: 'الشقق الفندقية الفاخرة', icon: Building, desc: 'أجنحة وبنتهاوس وشقق فندقية مخدومة' },
    { key: 'esim' as const, label: 'شرائح الإنترنت العالمية (eSIM)', icon: Globe, desc: 'باقات بيانات وإنترنت فوري لأكثر من 180 دولة' },
    { key: 'visa' as const, label: 'خدمات التأشيرات الإلكترونية', icon: FileText, desc: 'إصدار ومعالجة التأشيرات السياحية العالمية' },
    { key: 'fasttrack' as const, label: 'المسار السريع بالمطارات', icon: ShieldCheck, desc: 'خدمات الاستقبال VIP وصالات كبار الشخصيات' },
    { key: 'tours' as const, label: 'البرامج والرحلات السياحية', icon: Compass, desc: 'باقات وجولات سياحية ملكية حصرية' },
    { key: 'yachts' as const, label: 'اليخوت الفاخرة', icon: ShipWheel, desc: 'تأجير اليخوت الفارهة والرحلات البحرية الخاصة' },
    { key: 'cars' as const, label: 'أسطول الليموزين والسيارات', icon: CarFront, desc: 'سيارات فارهة مع سائق خاص وخدمات نقل المطار' },
    { key: 'ai_concierge' as const, label: 'المساعد الذكي VIP Concierge', icon: Bot, desc: 'مساعد سياحي ذكي متاح على مدار الساعة للمستخدمين' },
  ];

  return (
    <div className="space-y-6 text-right font-sans">
      {/* Hidden file input for fast card image replacement */}
      <input
        ref={quickFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleQuickCardUpload}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border border-[rgba(201,168,76,0.4)] bg-[#112240] p-4 text-[#F8F9FA] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 text-[#c9a84c]" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Hero Master Header */}
      <div className="relative overflow-hidden rounded-[28px] border border-[rgba(201,168,76,0.25)] bg-[linear-gradient(135deg,#0e1522_0%,#12121a_100%)] p-6 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#c9a84c]">
                مركز التحكم الحي في تطبيق الهاتف (VANIR MOBILE CMS)
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                مزامنة فورية حية
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-[#F8F9FA]">
              إدارة صور وخدمات وبانرات التطبيق
            </h1>
            <p className="mt-2 max-w-2xl text-xs md:text-sm leading-6 text-[#8892B0]">
              ارفع أي صورة مباشرة من جهازك (الكمبيوتر أو الهاتف) بدون الحاجة لروابط إنترنت. يتم ضغط الصور وتجهيزها بأعلى جودة وتحديثها لحظياً في هواتف العملاء بنقرة زر واحدة.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-white/[0.1] bg-[#161622] p-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'images'
                  ? 'bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#0d0d12] shadow-lg scale-105'
                  : 'text-[#8892B0] hover:text-[#F8F9FA]'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>صور وبطاقات الرئيسية ({feedCards.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('welcome')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'welcome'
                  ? 'bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#0d0d12] shadow-lg scale-105'
                  : 'text-[#8892B0] hover:text-[#F8F9FA]'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>شاشة الترحيب والدخول</span>
            </button>
            <button
              onClick={() => setActiveTab('buttons')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'buttons'
                  ? 'bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#0d0d12] shadow-lg scale-105'
                  : 'text-[#8892B0] hover:text-[#F8F9FA]'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>مفاتيح خدمات التطبيق</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#12121a]">
          <RefreshCw className="h-9 w-9 animate-spin text-[#c9a84c]" />
          <p className="text-xs text-[#8892B0]">جاري مزامنة بيانات التطبيق المباشرة...</p>
        </div>
      ) : activeTab === 'images' ? (
        /* ══════════════════════════════════════════════════════════════
           TAB 1: HOME FEED CARDS & BANNERS (WITH DIRECT DEVICE UPLOADER)
           ══════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Quick Navigator Hub for All Images in App */}
          <div className="rounded-2xl border border-[rgba(201,168,76,0.3)] bg-[linear-gradient(135deg,#12121e_0%,#161626_100%)] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a84c]/20 text-[#c9a84c]">
                  <HardDrive className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F8F9FA]">مجمع التحكم السريع بكافة صور التطبيق (App Visual Assets Hub)</h3>
                  <p className="text-[11px] text-[#8892B0]">
                    اختر القسم الذي تريد استبدال صوره المباشرة — كل قسم يتيح رفع وحذف الصور مباشرة من جهازك وتحديثها في التطبيق لحظياً:
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <a
                href="/jets"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/[0.08] bg-[#0d0d14] hover:border-[#c9a84c] hover:bg-white/[0.03] transition-all group text-center"
              >
                <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">✈️</span>
                <span className="text-xs font-bold text-[#F8F9FA] group-hover:text-[#c9a84c]">الطيران الخاص</span>
                <span className="text-[10px] text-[#8892B0] mt-0.5">أسطول الطائرات</span>
              </a>

              <a
                href="/yachts"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/[0.08] bg-[#0d0d14] hover:border-[#c9a84c] hover:bg-white/[0.03] transition-all group text-center"
              >
                <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">⛵</span>
                <span className="text-xs font-bold text-[#F8F9FA] group-hover:text-[#c9a84c]">اليخوت الفاخرة</span>
                <span className="text-[10px] text-[#8892B0] mt-0.5">أسطول اليخوت</span>
              </a>

              <a
                href="/hotels"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/[0.08] bg-[#0d0d14] hover:border-[#c9a84c] hover:bg-white/[0.03] transition-all group text-center"
              >
                <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🏨</span>
                <span className="text-xs font-bold text-[#F8F9FA] group-hover:text-[#c9a84c]">الفنادق والشقق</span>
                <span className="text-[10px] text-[#8892B0] mt-0.5">الأجنحة والبنتهاوس</span>
              </a>

              <a
                href="/transfers"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/[0.08] bg-[#0d0d14] hover:border-[#c9a84c] hover:bg-white/[0.03] transition-all group text-center"
              >
                <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🚗</span>
                <span className="text-xs font-bold text-[#F8F9FA] group-hover:text-[#c9a84c]">الليموزين والسيارات</span>
                <span className="text-[10px] text-[#8892B0] mt-0.5">سيارات الاستقبال</span>
              </a>

              <a
                href="/destinations"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/[0.08] bg-[#0d0d14] hover:border-[#c9a84c] hover:bg-white/[0.03] transition-all group text-center"
              >
                <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">📍</span>
                <span className="text-xs font-bold text-[#F8F9FA] group-hover:text-[#c9a84c]">الوجهات والمسارات</span>
                <span className="text-[10px] text-[#8892B0] mt-0.5">شريط الوجهات بالرئيسية</span>
              </a>

              <a
                href="/gallery"
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/[0.08] bg-[#0d0d14] hover:border-[#c9a84c] hover:bg-white/[0.03] transition-all group text-center"
              >
                <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🖼️</span>
                <span className="text-xs font-bold text-[#F8F9FA] group-hover:text-[#c9a84c]">معرض الصور VIP</span>
                <span className="text-[10px] text-[#8892B0] mt-0.5">معرض الوسائط الكامل</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#12121a] p-6 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#F8F9FA]">بطاقات وصور الصفحة الرئيسية الحية</h2>
                  <span className="rounded-md bg-[#c9a84c]/20 px-2 py-0.5 text-[11px] font-bold text-[#c9a84c]">
                    {feedCards.length} بطاقة نشطة
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#8892B0]">
                  يمكنك استبدال صورة أي بطاقة مباشرة من جهازك بالضغط على &quot;تغيير الصورة من الجهاز&quot;، أو تعديل نصوصها وأسعارها بالكامل.
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingCard({
                    id: 'f' + (Date.now() % 10000),
                    category: 'hotels',
                    tag: 'عرض حصري جديد ✨',
                    tagColor: '#c9a84c',
                    image: '',
                    title: 'تجربة فندقية فاخرة جديدة',
                    subtitle: 'تفاصيل العرض والمميزات المشمولة للعميل',
                    price: '$500/ليلة',
                    rating: 5.0,
                    routeTarget: 'HotelDetails',
                  })
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-5 py-2.5 text-xs font-bold text-[#0d0d12] shadow-[0_4px_16px_rgba(201,168,76,0.3)] transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة بطاقة جديدة +</span>
              </button>
            </div>

            {/* Cards Grid */}
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {feedCards.map(card => (
                <div
                  key={card.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#161622] shadow-lg transition-all hover:border-[rgba(201,168,76,0.45)] hover:shadow-2xl"
                >
                  {/* Card Image Display */}
                  <div className="relative h-48 w-full bg-[#0d0d12] overflow-hidden">
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-[#64748B]">
                        <UploadCloud className="h-8 w-8 text-[#c9a84c]/60" />
                        <span>اضغط لرفع صورة من جهازك</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Tag Badge */}
                    <span
                      style={{ backgroundColor: card.tagColor || 'rgba(10,25,47,0.85)' }}
                      className="absolute right-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-sm"
                    >
                      {card.tag}
                    </span>

                    {/* Direct Upload Overlay Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setQuickUploadCardId(card.id);
                        quickFileInputRef.current?.click();
                      }}
                      className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/70 px-3 py-1.5 text-[11px] font-bold text-[#F8F9FA] backdrop-blur-md shadow-lg hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all"
                    >
                      <HardDrive className="h-3.5 w-3.5" />
                      <span>تغيير الصورة من جهازك 📂</span>
                    </button>
                  </div>

                  {/* Card Info Body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#c9a84c]">
                        {card.category}
                      </span>
                      {card.rating && (
                        <span className="text-[11px] font-bold text-amber-400">
                          ★ {card.rating.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1.5 text-sm font-bold text-[#F8F9FA] line-clamp-1">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#8892B0] line-clamp-2 leading-5">
                      {card.subtitle}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
                      <div>
                        {card.price ? (
                          <span className="text-xs font-black text-[#F8F9FA]">{card.price}</span>
                        ) : (
                          <span className="text-[10px] text-[#64748B]">بدون سعر محدد</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCard({ ...card })}
                          className="rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-1.5 text-xs font-bold text-[#CCD6F6] hover:border-[#c9a84c] hover:text-white transition-all"
                        >
                          تعديل البطاقة
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition-all"
                          title="حذف البطاقة"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'welcome' ? (
        /* ══════════════════════════════════════════════════════════════
           TAB 2: WELCOME & LOGIN SCREEN BACKDROP (WITH REALISTIC PHONE PREVIEW)
           ══════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#12121a] p-6 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
              <div>
                <h2 className="text-lg font-bold text-[#F8F9FA]">
                  صورة خلفية شاشة الترحيب والدخول (Welcome & Login Screen)
                </h2>
                <p className="mt-1 text-xs text-[#8892B0]">
                  هذه هي الصورة البانورامية الكبرى التي تظهر خلف شاشة تسجيل الدخول وأول ما يراه العميل عند فتح التطبيق.
                </p>
              </div>

              <button
                onClick={handleSaveControls}
                disabled={savingControls}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-5 py-2.5 text-xs font-bold text-[#0d0d12] shadow-lg transition-all hover:scale-105 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{savingControls ? 'جاري الحفظ…' : 'حفظ ونشر التعديل الآن'}</span>
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-12 items-start">
              {/* Uploader Column (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <DeviceImageUploader
                  title="صورة شاشة الترحيب والدخول الكبرى"
                  subtitle="ارفع صورة عمودية أو سينمائية عالية الدقة من جهازك لتظهر خلف شاشة الدخول"
                  recommendedAspect="9:16 عمودية للهواتف (Full Screen 1080x1920)"
                  folder="welcome_screens"
                  currentImageUrl={controls.welcome_bg_image || ''}
                  onImageSelected={url => setControls(prev => ({ ...prev, welcome_bg_image: url }))}
                />

                <div className="rounded-xl border border-white/[0.08] bg-[#161622] p-4 text-xs text-[#8892B0] space-y-1">
                  <p className="font-bold text-[#c9a84c]">💡 نصيحة لتحقيق أفضل مظهر:</p>
                  <p>
                    اختر صورة سينمائية ذات ألوان غنية وإضاءة ساحرة (مثل طائرة في السماء، فيلا فوق الماء، أو معلم أثري فخم). التطبيق يضيف تلقائياً طبقة تدرج لوني مريح للعين لقراءة النصوص.
                  </p>
                </div>
              </div>

              {/* Realistic Mobile Phone Preview Frame (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <span className="mb-2 text-xs font-bold text-[#c9a84c] flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4" />
                  <span>معاينة حية لشاشة هاتف العميل (Live Mobile Frame)</span>
                </span>

                <div className="relative h-[560px] w-[280px] rounded-[44px] border-[6px] border-[#222230] bg-black p-2 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                  {/* Dynamic Island / Speaker */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 h-4 w-24 rounded-full bg-black/90 border border-white/10" />

                  {/* Backdrop Screen Image */}
                  <div className="relative h-full w-full rounded-[34px] overflow-hidden bg-[#070b10]">
                    {controls.welcome_bg_image ? (
                      <img
                        src={controls.welcome_bg_image}
                        alt="Welcome Screen Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#64748B]">
                        لا توجد صورة
                      </div>
                    )}

                    {/* Gradient Overlay matching mobile code */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b10] via-[#070b10]/40 to-black/30" />

                    {/* Header Brand */}
                    <div className="absolute top-10 left-0 right-0 flex justify-center z-10">
                      <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 backdrop-blur-md">
                        <Crown className="h-3 w-3 text-[#c9a84c]" />
                        <span className="text-[10px] font-extrabold text-white tracking-widest">
                          VANIR VIP
                        </span>
                      </div>
                    </div>

                    {/* Bottom Area mockup matching LoginScreen */}
                    <div className="absolute bottom-6 left-4 right-4 z-10 space-y-3 text-center">
                      <h3 className="text-lg font-black text-white leading-tight">
                        Discover Amazing Destinations
                      </h3>
                      <p className="text-[10px] text-white/80 line-clamp-2">
                        Explore popular places, hidden gems, and experiences from around the world.
                      </p>

                      {/* Pill Capsule with glowing Go */}
                      <div className="mx-auto flex h-11 w-44 items-center justify-between rounded-full border border-white/30 bg-white/20 px-3 backdrop-blur-md">
                        <div className="flex flex-col items-center">
                          <ChevronUp className="h-3 w-3 text-white/70 -mb-2" />
                          <ChevronUp className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-600 text-xs font-black text-white shadow-lg">
                          Go
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#c9a84c]">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>VIP Member Sign In</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           TAB 3: APP SERVICE BUTTONS & EMERGENCY NOTICE
           ══════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#12121a] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#F8F9FA]">مفاتيح تشغيل وإيقاف خدمات التطبيق</h2>
                <p className="mt-1 text-xs text-[#8892B0]">
                  اضغط على أي خدمة لتفعيلها أو إيقافها مؤقتاً في التطبيق. التغيير يتم فوراً.
                </p>
              </div>
              <button
                onClick={handleSaveControls}
                disabled={savingControls}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-5 py-2.5 text-xs font-bold text-[#0d0d12] shadow-lg transition-all hover:scale-105 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{savingControls ? 'جاري الحفظ…' : 'حفظ التعديلات الحية'}</span>
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {serviceButtonsList.map(item => {
                const isEnabled = controls[item.key];
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleControl(item.key)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      isEnabled
                        ? 'border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.06)] shadow-[0_4px_20px_rgba(201,168,76,0.06)]'
                        : 'border-white/[0.08] bg-[#161622]/50 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(201,168,76,0.2)] bg-[#161622] text-[#c9a84c]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          isEnabled ? 'bg-[#c9a84c]' : 'bg-[#2a2a38]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            isEnabled ? 'right-6' : 'right-1'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-[#F8F9FA]">{item.label}</p>
                      <p className="mt-1 text-xs text-[#8892B0] leading-5">{item.desc}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
                      <span className={`h-2 w-2 rounded-full ${isEnabled ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span className={isEnabled ? 'text-emerald-400' : 'text-rose-400'}>
                        {isEnabled ? 'مفعل في التطبيق' : 'متوقف مؤقتاً'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Broadcast Notice Field */}
            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#161622] p-5">
              <label className="block text-sm font-semibold text-[#F8F9FA]">
                شريط الإعلانات والتنبيهات الفورية أعلى التطبيق (اختياري)
              </label>
              <p className="mt-1 text-xs text-[#8892B0]">
                إذا كتبت أي نص هنا، سيظهر كشريط إعلان وتنبيه ذهبي أنيق في أعلى الشاشة الرئيسية لجميع مستخدمي التطبيق فوراً. اتركه فارغاً لإخفائه.
              </p>
              <input
                type="text"
                value={controls.emergency_notice || ''}
                onChange={e => setControls(prev => ({ ...prev, emergency_notice: e.target.value }))}
                placeholder="مثال: خصم خاص 20% على رحلات الطيران الخاص هذا الأسبوع بمناسبة الافتتاح!"
                className="mt-3 w-full rounded-xl border border-white/[0.1] bg-[#12121a] px-4 py-3 text-sm text-[#F8F9FA] placeholder-[#64748B] focus:border-[#c9a84c] focus:outline-none text-right"
              />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
         EDIT / CREATE CARD MODAL (POWERED BY DEVICE IMAGE UPLOADER)
         ══════════════════════════════════════════════════════════════ */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md text-right">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[rgba(201,168,76,0.35)] bg-[#12121a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#F8F9FA]">تعديل بطاقة وصورة الشاشة الرئيسية</h3>
                <p className="mt-0.5 text-xs text-[#8892B0]">
                  ارفع الصورة مباشرة من جهازك وسيتم نشرها لكافة مستخدمي التطبيق فوراً
                </p>
              </div>
              <span className="rounded-xl border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-3 py-1 text-xs font-bold text-[#c9a84c]">
                ID: {editingCard.id}
              </span>
            </div>

            <div className="mt-5 space-y-5">
              {/* Device Image Uploader Component */}
              <DeviceImageUploader
                title="صورة البطاقة الرئيسية"
                subtitle="اختر صورة من جهازك (كمبيوتر / هاتف) أو اختر من مكتبة صور فانير الملكية"
                recommendedAspect="16:9 عريض (1200x675)"
                folder="app_feed"
                currentImageUrl={editingCard.image}
                onImageSelected={url =>
                  setEditingCard({
                    ...editingCard,
                    image: url,
                    images: [url],
                  })
                }
              />

              {/* Title & Subtitle */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[#8892B0]">العنوان الرئيسي للبطاقة</label>
                  <input
                    type="text"
                    value={editingCard.title}
                    onChange={e => setEditingCard({ ...editingCard, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/[0.1] bg-[#161622] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none"
                    placeholder="مثال: رحلة الدرجة الأولى طيران الإمارات"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0]">الوصف الفرعي</label>
                  <input
                    type="text"
                    value={editingCard.subtitle}
                    onChange={e => setEditingCard({ ...editingCard, subtitle: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/[0.1] bg-[#161622] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none"
                    placeholder="مثال: القاهرة ➔ لندن • شامل الإقامة الفندقية"
                  />
                </div>
              </div>

              {/* Tag & Price */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-[#8892B0]">وسم البطاقة (Badge)</label>
                  <input
                    type="text"
                    value={editingCard.tag}
                    onChange={e => setEditingCard({ ...editingCard, tag: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/[0.1] bg-[#161622] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none"
                    placeholder="عرض حصري VIP"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0]">عرض السعر</label>
                  <input
                    type="text"
                    value={editingCard.price || ''}
                    onChange={e => setEditingCard({ ...editingCard, price: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/[0.1] bg-[#161622] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none"
                    placeholder="From $3,450 أو $450/ليلة"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#8892B0]">القسم (Category)</label>
                  <select
                    value={editingCard.category}
                    onChange={e => setEditingCard({ ...editingCard, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/[0.1] bg-[#161622] px-3.5 py-2.5 text-xs text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none"
                  >
                    <option value="flights">رحلات طيران (Flights)</option>
                    <option value="jets">طيران خاص (Private Jet)</option>
                    <option value="hotels">فنادق فاخرة (Hotels)</option>
                    <option value="apartments">شقق فندقية (Apartments)</option>
                    <option value="yachts">يخوت (Yachts)</option>
                    <option value="cars">سيارات وليموزين (Cars)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex justify-end gap-3 border-t border-white/[0.08] pt-4">
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="rounded-xl border border-white/[0.1] px-5 py-2.5 text-xs font-bold text-[#8892B0] hover:text-white transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  const exists = feedCards.some(c => c.id === editingCard.id);
                  const updated = exists
                    ? feedCards.map(c => (c.id === editingCard.id ? editingCard : c))
                    : [editingCard, ...feedCards];
                  handleSaveCards(updated);
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-6 py-2.5 text-xs font-bold text-[#0d0d12] shadow-lg hover:scale-105 transition-all"
              >
                <Check className="h-4 w-4" />
                <span>حفظ ونشر التعديل في التطبيق</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
