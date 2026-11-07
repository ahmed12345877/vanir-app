'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchAppControlsFromFirestore,
  saveAppControlsToFirestore,
  fetchLifestyleServicesFromFirestore,
  saveLifestyleServiceToFirestore,
  deleteLifestyleServiceFromFirestore,
  seedInitialLifestyleServices,
  type ServiceControls,
  type LifestyleServiceAdminItem,
  type LifestyleServicePackageAdmin,
  INITIAL_SERVICE_CONTROLS,
} from '@/lib/firestoreService';
import { DeviceImageUploader } from '@/components/DeviceImageUploader';
import {
  Plane,
  Building,
  Globe,
  FileText,
  ShieldCheck,
  Compass,
  ShipWheel,
  CarFront,
  Bot,
  Image as ImageIcon,
  BookOpen,
  MapPin,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Camera,
  UtensilsCrossed,
  HeartPulse,
  Dumbbell,
  Plus,
  Trash2,
  Edit3,
  X,
  Star,
} from 'lucide-react';

interface AdminServiceItem {
  key: keyof ServiceControls;
  name: string;
  nameEn: string;
  category: string;
  desc: string;
  icon: any;
  manageLink?: string;
  manageLabel?: string;
}

const ALL_SERVICES_CATALOG: { category: string; categoryEn: string; services: AdminServiceItem[] }[] = [
  {
    category: 'خدمات الطيران والمطارات',
    categoryEn: 'Aviation & Airport VIP',
    services: [
      {
        key: 'flights',
        name: 'رحلات الطيران التجاري ودرجة أولى',
        nameEn: 'Commercial & VIP Flights',
        category: 'Aviation',
        desc: 'حجوزات الدرجة الأولى وأجنحة الطيران التجاري والخطوط العالمية',
        icon: Plane,
        manageLink: '/app-controls',
        manageLabel: 'إدارة مسارات الطيران',
      },
      {
        key: 'private_jet',
        name: 'الطيران الخاص وتأجير الطائرات',
        nameEn: 'Private Aviation & Jets',
        category: 'Aviation',
        desc: 'أسطول طائرات جلف ستريم، بومباردييه، ورحلات التشارتر الملكية',
        icon: Plane,
        manageLink: '/jets',
        manageLabel: 'إدارة أسطول الطائرات',
      },
      {
        key: 'fasttrack',
        name: 'المسار السريع وصالات VIP بالمطار',
        nameEn: 'Airport Fast-Track & Lounges',
        category: 'Aviation',
        desc: 'استقبال خاص على مدرج الطائرات وصالات كبار الشخصيات وإنهاء الجوازات',
        icon: ShieldCheck,
        manageLink: '/app-controls',
        manageLabel: 'إدارة خدمات المطار',
      },
    ],
  },
  {
    category: 'الإقامة الفندقية والقصور',
    categoryEn: 'Luxury Stays & Residences',
    services: [
      {
        key: 'hotels',
        name: 'الفنادق والمنتجعات الفاخرة',
        nameEn: 'Luxury Hotels & Resorts',
        category: 'Stays',
        desc: 'أفخم الفنادق والمنتجعات 5 نجوم والفلل الشاطئية الخاصة حول العالم',
        icon: Building,
        manageLink: '/hotels',
        manageLabel: 'إدارة كتالوج الفنادق',
      },
      {
        key: 'apartments',
        name: 'الشقق الفندقية والبنتهاوس',
        nameEn: 'Hotel Apartments & Penthouses',
        category: 'Stays',
        desc: 'أجنحة مخدومة، بنتهاوس وإقامات ملكية طويلة الأمد في أرقى العواصم',
        icon: Building,
        manageLink: '/hotels',
        manageLabel: 'إدارة الشقق والبنتهاوس',
      },
    ],
  },
  {
    category: 'اليخوت والأسطول الأرضي الفاخر',
    categoryEn: 'Superyachts & Chauffeur Fleet',
    services: [
      {
        key: 'yachts',
        name: 'اليخوت الفارهة والرحلات البحرية',
        nameEn: 'Luxury Superyachts',
        category: 'Fleet',
        desc: 'تأجير الميجا يخت الخاصة والرحلات البحرية الفاخرة في المالديف وموناكو',
        icon: ShipWheel,
        manageLink: '/yachts',
        manageLabel: 'إدارة أسطول اليخوت',
      },
      {
        key: 'cars',
        name: 'أسطول الليموزين والسيارات الفارهة',
        nameEn: 'Limousine & Executive Fleet',
        category: 'Fleet',
        desc: 'سيارات رولز رويس، مايباخ، وسيارات مصفحة مع سائق خاص معتمد',
        icon: CarFront,
        manageLink: '/transfers',
        manageLabel: 'إدارة أسطول السيارات',
      },
    ],
  },
  {
    category: 'التجارب السياحية والكونسيرج والمحتوى',
    categoryEn: 'Curated Expeditions & VIP Concierge',
    services: [
      {
        key: 'tours',
        name: 'البرامج والجولات السياحية الملكية',
        nameEn: 'Luxury Tours & Expeditions',
        category: 'Concierge',
        desc: 'جولات خاصة مرشدة، رحلات سفاري، وتجارب سياحية واستكشافية حصرية',
        icon: Compass,
        manageLink: '/services/packages',
        manageLabel: 'إدارة البرامج والرحلات',
      },
      {
        key: 'ai_concierge',
        name: 'المساعد الذكي 24/7 (AI Concierge)',
        nameEn: 'AI 24/7 Travel Concierge',
        category: 'Concierge',
        desc: 'مساعد ذكي مدعوم بالذكاء الاصطناعي لحجز وتنسيق طلبات النخبة لحظياً',
        icon: Bot,
        manageLink: '/ai-studio',
        manageLabel: 'إدارة الذكاء الاصطناعي',
      },
      {
        key: 'gallery',
        name: 'معرض الأسطول والوحدات الملكية',
        nameEn: 'VIP Fleet & Residence Gallery',
        category: 'Concierge',
        desc: 'معرض صور تحريري سينمائي عالي الدقة لكافة الطائرات واليخوت والأجنحة',
        icon: ImageIcon,
        manageLink: '/gallery',
        manageLabel: 'إدارة صور المعرض',
      },
      {
        key: 'blog',
        name: 'مجلة السفر والمدونة الفاخرة',
        nameEn: 'Vanir Luxury Magazine',
        category: 'Concierge',
        desc: 'مقالات تحريرية حصرية، أسرار الوجهات، وتغطيات أسلوب حياة النخبة',
        icon: BookOpen,
        manageLink: '/blog',
        manageLabel: 'إدارة مقالات المجلة',
      },
    ],
  },
  {
    category: 'خدمات السفر والاتصال العالمية',
    categoryEn: 'Global Travel Utilities',
    services: [
      {
        key: 'esim',
        name: 'شرائح الإنترنت العالمية (eSIM)',
        nameEn: 'Global High-Speed eSIM',
        category: 'Utilities',
        desc: 'إنترنت 5G عالي السرعة وتفعيل فوري لأكثر من 180 دولة حول العالم',
        icon: Globe,
        manageLink: '/app-controls',
        manageLabel: 'إدارة باقات eSIM',
      },
      {
        key: 'visa',
        name: 'خدمات التأشيرات الدبلوماسية والسياحية',
        nameEn: 'VIP Visa Services',
        category: 'Utilities',
        desc: 'تنسيق واستخراج التأشيرات الإلكترونية المعتمدة لرجال الأعمال وكبار الشخصيات',
        icon: FileText,
        manageLink: '/app-controls',
        manageLabel: 'إدارة طلبات التأشيرات',
      },
      {
        key: 'offices',
        name: 'شبكة المكاتب الدبلوماسية العالمية',
        nameEn: 'Global VIP Offices',
        category: 'Utilities',
        desc: 'عناوين ومكاتب التمثيل الدبلوماسي والكونسيرج الخاص في لندن، دبي والقاهرة',
        icon: MapPin,
        manageLink: '/destinations',
        manageLabel: 'إدارة شبكة المكاتب',
      },
    ],
  },
];

const LIFESTYLE_CATEGORIES: {
  key: 'all' | LifestyleServiceAdminItem['serviceCategoryKey'];
  labelAr: string;
  labelEn: string;
  icon: any;
}[] = [
  { key: 'all', labelAr: 'الكل (All Services)', labelEn: 'All', icon: Sparkles },
  { key: 'massage', labelAr: 'سبا ومساج (Spa & Massage)', labelEn: 'Spa & Massage', icon: HeartPulse },
  { key: 'photography', labelAr: 'جلسات تصوير (Photography)', labelEn: 'Photography', icon: Camera },
  { key: 'makeup', labelAr: 'مكياج وتجميل (Makeup & Glam)', labelEn: 'Makeup & Glam', icon: Sparkles },
  { key: 'chef', labelAr: 'شيف خاص (Private Chef)', labelEn: 'Private Chef', icon: UtensilsCrossed },
  { key: 'training', labelAr: 'تدريب رياضي (Personal Training)', labelEn: 'Personal Training', icon: Dumbbell },
  { key: 'car', labelAr: 'تأجير سيارات (Car Rental)', labelEn: 'Car Rental', icon: CarFront },
  { key: 'experiences', labelAr: 'تجارب السفر (Experiences)', labelEn: 'Experiences', icon: Compass },
];

export default function ServicesHubPage() {
  const [controls, setControls] = useState<ServiceControls>(INITIAL_SERVICE_CONTROLS);
  const [lifestyleServices, setLifestyleServices] = useState<LifestyleServiceAdminItem[]>([]);
  const [selectedLifestyleFilter, setSelectedLifestyleFilter] = useState<
    'all' | LifestyleServiceAdminItem['serviceCategoryKey']
  >('all');
  const [editingItem, setEditingItem] = useState<LifestyleServiceAdminItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingLifestyle, setSavingLifestyle] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [emergencyText, setEmergencyText] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ctrlData, lsData] = await Promise.all([
          fetchAppControlsFromFirestore(),
          fetchLifestyleServicesFromFirestore(),
        ]);
        setControls(ctrlData);
        setEmergencyText(ctrlData.emergency_notice || '');
        setLifestyleServices(lsData);
      } catch (err) {
        console.error('Failed to load services data:', err);
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

  const handleToggle = async (key: keyof ServiceControls) => {
    const updated = {
      ...controls,
      [key]: !controls[key],
    };
    setControls(updated);

    try {
      await saveAppControlsToFirestore(updated);
      const isNowActive = updated[key];
      showToast(`تم ${isNowActive ? 'تفعيل' : 'إيقاف مؤقت لـ'} الخدمة بنجاح! تم المزامنة مع هواتف العملاء.`);
    } catch (err: any) {
      alert('خطأ أثناء حفظ حالة الخدمة: ' + err.message);
      setControls(controls);
    }
  };

  const handleSaveBroadcast = async () => {
    setSaving(true);
    try {
      const updated = {
        ...controls,
        emergency_notice: emergencyText.trim(),
      };
      await saveAppControlsToFirestore(updated);
      setControls(updated);
      showToast('تم بث إشعار الكونسيرج العام لتطبيق الهاتف بنجاح!');
    } catch (err: any) {
      alert('خطأ أثناء حفظ الإشعار: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewLifestyleService = () => {
    const newItem: LifestyleServiceAdminItem = {
      id: `prov-custom-${Date.now()}`,
      serviceCategoryKey: selectedLifestyleFilter === 'all' ? 'massage' : selectedLifestyleFilter,
      title: 'New Luxury In-Suite Service',
      subtitle: 'Hosted by Certified Specialist • Available at your suite',
      description:
        'Describe this bespoke service experience in detail. When guests tap this provider in the mobile app, they will see this full description, host badge, coverage map, and selectable packages below.',
      hostName: 'Vanir Specialist',
      hostRole: 'Certified Luxury Partner in Cairo',
      hostBadgeText: 'VS',
      hostBadgeColor: '#0E2442',
      deliveryNote: 'Delivered at your hotel suite or private residence',
      priceFrom: '$140',
      priceUnit: '/ guest',
      rating: 4.98,
      reviewsCount: 64,
      badge: 'New VIP Service',
      coverImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=85',
      packages: [
        {
          id: `pkg-${Date.now()}-1`,
          title: 'Signature 60-Min Royal Session',
          description: 'Includes full setup at your residence with premium organic amenities.',
          price: '$140',
          unit: '/ guest',
          image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=85',
        },
      ],
      status: 'active',
    };
    setEditingItem(newItem);
  };

  const handleSaveLifestyleItem = async () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      alert('يرجى إدخال اسم الخدمة / مقدم الخدمة.');
      return;
    }
    setSavingLifestyle(true);
    try {
      await saveLifestyleServiceToFirestore(editingItem);
      setLifestyleServices(prev => {
        const exists = prev.some(i => i.id === editingItem.id);
        if (exists) {
          return prev.map(i => (i.id === editingItem.id ? editingItem : i));
        }
        return [editingItem, ...prev];
      });
      setEditingItem(null);
      showToast('تم حفظ الخدمة وصورها وباقاتها ومزامنتها فوراً مع شاشات التطبيق التفاعلية!');
    } catch (err: any) {
      alert('حدث خطأ أثناء حفظ الخدمة التفاعلية: ' + err.message);
    } finally {
      setSavingLifestyle(false);
    }
  };

  const handleDeleteLifestyleItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة التفاعلية من التطبيق؟')) return;
    try {
      await deleteLifestyleServiceFromFirestore(id);
      setLifestyleServices(prev => prev.filter(i => i.id !== id));
      showToast('تم حذف الخدمة من قاعدة البيانات بنجاح.');
    } catch (err: any) {
      alert('خطأ أثناء الحذف: ' + err.message);
    }
  };

  const handleAddPackageToEditing = () => {
    if (!editingItem) return;
    const newPkg: LifestyleServicePackageAdmin = {
      id: `pkg-${Date.now()}`,
      title: 'VIP Extended Package',
      description: 'Private session tailored for couples or groups at your residence.',
      price: editingItem.priceFrom || '$180',
      unit: '/ guest',
      image: editingItem.coverImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=85',
    };
    setEditingItem({
      ...editingItem,
      packages: [...(editingItem.packages || []), newPkg],
    });
  };

  const handleUpdatePackage = (pkgIdx: number, field: keyof LifestyleServicePackageAdmin, value: string) => {
    if (!editingItem) return;
    const nextPackages = [...editingItem.packages];
    nextPackages[pkgIdx] = {
      ...nextPackages[pkgIdx],
      [field]: value,
    };
    setEditingItem({
      ...editingItem,
      packages: nextPackages,
    });
  };

  const handleRemovePackage = (pkgIdx: number) => {
    if (!editingItem) return;
    const nextPackages = editingItem.packages.filter((_, idx) => idx !== pkgIdx);
    setEditingItem({
      ...editingItem,
      packages: nextPackages,
    });
  };

  const filteredLifestyle =
    selectedLifestyleFilter === 'all'
      ? lifestyleServices
      : lifestyleServices.filter(item => item.serviceCategoryKey === selectedLifestyleFilter);

  const totalServices = 14;
  const activeCount = Object.keys(controls).filter(
    k => k !== 'emergency_notice' && k !== 'welcome_bg_image' && controls[k as keyof ServiceControls] !== false,
  ).length;

  return (
    <div className="space-y-8 text-right font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border border-[rgba(201,168,76,0.5)] bg-[#112240] p-4 text-[#F8F9FA] shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 text-[#c9a84c]" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Hero Master Header */}
      <div className="relative overflow-hidden rounded-[28px] border border-[rgba(201,168,76,0.3)] bg-[linear-gradient(135deg,#0e1522_0%,#12121a_100%)] p-6 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[radial-gradient(circle,rgba(201,168,76,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#c9a84c]">
                مركز إدارة خدمات التطبيق والخدمات التفاعلية (SERVICES & LIFESTYLE HUB)
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                مرتبط حياً بـ Firestore (lifestyle_services)
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-[#F8F9FA]">
              إدارة الخدمات التفاعلية، الجلسات، والباقات والصور
            </h1>
            <p className="mt-2 max-w-2xl text-xs md:text-sm leading-6 text-[#8892B0]">
              يمكنك من هنا تغيير صور أي خدمة تفاعلية (جلسات التصوير، السبا والتدليك، المكياج، الشيف الخاص، والتجارب)، وتعديل الباقات الفرعية والأسعار لتنعكس فوراً في التطبيق بدون أي بكسلة.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-[#161622] border border-white/[0.08] p-4 rounded-2xl">
            <div className="text-center">
              <p className="text-[10px] font-bold text-[#8892B0]">مقدمي الخدمات التفاعلية</p>
              <p className="text-xl font-bold font-mono text-[#c9a84c]">{lifestyleServices.length}</p>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-[#8892B0]">الأقسام الرئيسية</p>
              <p className="text-xl font-bold font-mono text-emerald-400">
                {activeCount} / {totalServices}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* INTERACTIVE LIFESTYLE SERVICES & PROVIDERS MANAGER (NEW)              */}
      {/* ===================================================================== */}
      <div className="rounded-[26px] border border-[rgba(201,168,76,0.35)] bg-[#13131d] p-6 shadow-2xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#c9a84c]" />
              <h2 className="text-lg md:text-xl font-extrabold text-[#F8F9FA]">
                كتالوج الخدمات التفاعلية ومقدمي الخدمات (Interactive Services & Packages)
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#8892B0]">
              اضغط على «تعديل الصور والباقات» لأي خدمة لرفع صور جديدة عالية الدقة من جهازك أو تعديل الباقات التي تظهر عند فتح الخدمة داخل التطبيق.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNewLifestyleService}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-4 py-2.5 text-xs font-extrabold text-[#080810] shadow-lg hover:brightness-110 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة خدمة تفاعلية جديدة</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                await seedInitialLifestyleServices();
                const fresh = await fetchLifestyleServicesFromFirestore();
                setLifestyleServices(fresh);
                setLoading(false);
                showToast('تمت مزامنة وتحديث جميع الخدمات التفاعلية الافتراضية في Firestore بنجاح!');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-[#1a1a28] px-3.5 py-2.5 text-xs font-bold text-[#CCD6F6] hover:border-[#c9a84c]"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#c9a84c]" />
              <span>مزامنة البيانات الافتراضية</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {LIFESTYLE_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = selectedLifestyleFilter === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedLifestyleFilter(cat.key)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#c9a84c] text-[#080810] shadow-md'
                    : 'bg-[#1a1a28] text-[#8892B0] border border-white/[0.06] hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.labelAr}</span>
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLifestyle.map(item => (
            <div
              key={item.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#181824] transition-all hover:border-[rgba(201,168,76,0.45)] shadow-lg"
            >
              <div>
                {/* Cover Image Preview */}
                <div className="relative h-48 w-full overflow-hidden bg-[#0d0d14]">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category & Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="rounded-lg bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase text-[#c9a84c] backdrop-blur-md border border-[rgba(201,168,76,0.3)]">
                      {item.serviceCategoryKey}
                    </span>
                    {item.badge && (
                      <span className="rounded-lg bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Host Avatar Badge */}
                  <div
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-extrabold text-white shadow-md"
                    style={{ backgroundColor: item.hostBadgeColor || '#0E2442' }}
                  >
                    {item.hostBadgeText || 'VP'}
                  </div>

                  {/* Price & Rating overlay */}
                  <div className="absolute bottom-3 left-3 text-left">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{item.rating}</span>
                      <span className="text-[10px] text-gray-300">({item.reviewsCount})</span>
                    </div>
                    <p className="text-sm font-extrabold text-white">
                      {item.priceFrom} <span className="text-[10px] font-normal text-gray-300">{item.priceUnit}</span>
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-extrabold text-[#F8F9FA] line-clamp-1">{item.title}</h3>
                  <p className="text-[11px] font-semibold text-[#c9a84c] line-clamp-1">{item.subtitle}</p>
                  <p className="text-xs text-[#8892B0] line-clamp-2 leading-5">{item.description}</p>

                  {/* Packages count pill */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#CCD6F6]">
                    <span className="rounded-lg bg-white/[0.05] px-2.5 py-1 font-semibold">
                      📦 {item.packages?.length || 0} باقات فرعية قابلة للحجز
                    </span>
                    <span className="font-mono text-[10px] text-[#64748B]">{item.id}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] bg-[#14141f] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.35)] px-3 py-2 text-xs font-bold text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#080810] transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>تعديل الصور والباقات والأسعار</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLifestyleItem(item.id)}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20"
                  title="حذف الخدمة"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL FOR EDITING LIFESTYLE SERVICE, COVER PHOTO & SUB-PACKAGES       */}
      {/* ===================================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[rgba(201,168,76,0.4)] bg-[#12121c] p-6 shadow-2xl space-y-6 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 sticky top-0 bg-[#12121c] z-10">
              <div>
                <h3 className="text-lg font-extrabold text-[#F8F9FA]">
                  تعديل الخدمة التفاعلية والصور والباقات
                </h3>
                <p className="text-xs text-[#8892B0]">
                  أي تعديل على الصورة الرئيسية أو صور الباقات أو الأسعار يظهر فوراً في شاشة الخدمات التفاعلية بالتطبيق
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-xl border border-white/[0.1] bg-white/[0.05] p-2 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#CCD6F6] mb-1">اسم الخدمة / الجلسة (Title)</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.12] bg-[#181826] px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CCD6F6] mb-1">القسم (Category)</label>
                <select
                  value={editingItem.serviceCategoryKey}
                  onChange={e =>
                    setEditingItem({
                      ...editingItem,
                      serviceCategoryKey: e.target.value as LifestyleServiceAdminItem['serviceCategoryKey'],
                    })
                  }
                  className="w-full rounded-xl border border-white/[0.12] bg-[#181826] px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none"
                >
                  <option value="massage">Spa & Massage (سبا ومساج)</option>
                  <option value="photography">Photography (جلسات تصوير)</option>
                  <option value="makeup">Makeup & Glam (مكياج وتجميل)</option>
                  <option value="chef">Private Chef (شيف خاص)</option>
                  <option value="training">Personal Training (تدريب رياضي)</option>
                  <option value="car">Car Rental (تأجير سيارات)</option>
                  <option value="experiences">Cultural Experiences (تجارب السفر)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CCD6F6] mb-1">العنوان الفرعي (Subtitle)</label>
                <input
                  type="text"
                  value={editingItem.subtitle}
                  onChange={e => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.12] bg-[#181826] px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none text-left"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#CCD6F6] mb-1">السعر يبدأ من</label>
                  <input
                    type="text"
                    value={editingItem.priceFrom}
                    onChange={e => setEditingItem({ ...editingItem, priceFrom: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.12] bg-[#181826] px-3 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#CCD6F6] mb-1">السعر قبل الخصم</label>
                  <input
                    type="text"
                    placeholder="اختياري مثل $190"
                    value={editingItem.originalPrice || ''}
                    onChange={e => setEditingItem({ ...editingItem, originalPrice: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.12] bg-[#181826] px-3 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#CCD6F6] mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={editingItem.priceUnit}
                    onChange={e => setEditingItem({ ...editingItem, priceUnit: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.12] bg-[#181826] px-3 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CCD6F6] mb-1">اسم المضيف / الاستوديو (Host Name)</label>
                <input
                  type="text"
                  value={editingItem.hostName}
                  onChange={e => setEditingItem({ ...editingItem, hostName: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.12] bg-[#181826] px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#CCD6F6] mb-1">مكان تقديم الخدمة (Delivery Note)</label>
                <input
                  type="text"
                  value={editingItem.deliveryNote}
                  onChange={e => setEditingItem({ ...editingItem, deliveryNote: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.12] bg-[#181826] px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none text-left"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#CCD6F6] mb-1">
                الوصف الكامل للخدمة (يظهر عند فتح صفحة الخدمة في التطبيق)
              </label>
              <textarea
                rows={3}
                value={editingItem.description}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full rounded-xl border border-white/[0.12] bg-[#181826] p-3.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none text-left"
              />
            </div>

            {/* Cover Image Uploader */}
            <DeviceImageUploader
              title="الصورة الرئيسية للخدمة (Hero Cover Image)"
              subtitle="ارفع صورة فائقة الوضوح من جهازك أو ضع رابط صورة مباشر"
              currentImageUrl={editingItem.coverImage}
              folder="lifestyle_services"
              onImageSelected={url => setEditingItem({ ...editingItem, coverImage: url })}
            />

            {/* Sub-Packages Section */}
            <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#161622] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-[#c9a84c]">
                    الباقات الفرعية داخل الخدمة (Selectable Service Packages)
                  </h4>
                  <p className="text-[11px] text-[#8892B0]">
                    هذه الباقات تظهر للعميل عند الضغط على الخدمة (مثل: جلسة تصوير الأهرامات، جلسة الأزواج، إلخ) مع صورة مصغرة لكل باقة
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPackageToEditing}
                  className="flex items-center gap-1.5 rounded-xl bg-[#c9a84c] px-3 py-2 text-xs font-bold text-[#080810] hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>إضافة باقة فرعية</span>
                </button>
              </div>

              <div className="space-y-4">
                {(editingItem.packages || []).map((pkg, idx) => (
                  <div
                    key={pkg.id || idx}
                    className="rounded-2xl border border-white/[0.08] bg-[#11111a] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#c9a84c]">الباقة #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(idx)}
                        className="text-xs font-bold text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>حذف الباقة</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-[#8892B0] mb-1">عنوان الباقة</label>
                        <input
                          type="text"
                          value={pkg.title}
                          onChange={e => handleUpdatePackage(idx, 'title', e.target.value)}
                          className="w-full rounded-xl border border-white/[0.1] bg-[#181826] px-3 py-2 text-xs text-white text-left"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#8892B0] mb-1">سعر الباقة</label>
                        <input
                          type="text"
                          value={pkg.price}
                          onChange={e => handleUpdatePackage(idx, 'price', e.target.value)}
                          className="w-full rounded-xl border border-white/[0.1] bg-[#181826] px-3 py-2 text-xs text-white text-left"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#8892B0] mb-1">وصف الباقة</label>
                      <input
                        type="text"
                        value={pkg.description}
                        onChange={e => handleUpdatePackage(idx, 'description', e.target.value)}
                        className="w-full rounded-xl border border-white/[0.1] bg-[#181826] px-3 py-2 text-xs text-white text-left"
                      />
                    </div>

                    <DeviceImageUploader
                      title={`صورة الباقة #${idx + 1} (${pkg.title})`}
                      subtitle="تظهر كصورة مربعة بجانب تفاصيل الباقة داخل صفحة الخدمة"
                      currentImageUrl={pkg.image}
                      folder="lifestyle_services"
                      onImageSelected={url => handleUpdatePackage(idx, 'image', url)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-xl border border-white/[0.12] px-5 py-2.5 text-xs font-bold text-gray-300 hover:bg-white/[0.05]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveLifestyleItem}
                disabled={savingLifestyle}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a84c] to-[#e6c875] px-6 py-2.5 text-xs font-extrabold text-[#080810] shadow-lg hover:brightness-110 disabled:opacity-50"
              >
                {savingLifestyle ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>حفظ ومزامنة مع التطبيق الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Emergency Notice Section */}
      <div className="bg-[#14141e] border border-[rgba(201,168,76,0.25)] rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#c9a84c]" />
          <h3 className="text-sm font-bold text-[#F8F9FA]">
            بث إشعار كونسيرج عام (Concierge Notice Broadcast)
          </h3>
          <span className="text-[10px] text-[#8892B0]">
            (يظهر كشريط مميز بأعلى صفحة الخدمات لكافة المستخدمين)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={emergencyText}
            onChange={e => setEmergencyText(e.target.value)}
            placeholder="مثال: يرجى العلم بأن حجوزات الطيران الخاص لعطلة نهاية الأسبوع تتطلب إشعاراً مسبقاً قبل 6 ساعات نظراً لضغط الرحلات..."
            className="flex-1 bg-[#0d0d12] border border-white/[0.1] rounded-xl text-xs px-4 py-2.5 text-[#F8F9FA] placeholder-[#64748B] focus:outline-none focus:border-[#c9a84c] text-right"
          />
          <button
            onClick={handleSaveBroadcast}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#080810] rounded-xl text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50 transition-all whitespace-nowrap"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>حفظ وبث الإشعار</span>
          </button>
        </div>
      </div>

      {/* Categories & Services Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#c9a84c] mx-auto" />
          <p className="text-xs text-[#8892B0]">جاري قراءة حالة الخدمات المباشرة من Firestore...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {ALL_SERVICES_CATALOG.map(group => (
            <div key={group.category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                  <h2 className="text-base font-extrabold text-[#F8F9FA]">{group.category}</h2>
                  <span className="text-[11px] text-[#8892B0] font-mono">({group.categoryEn})</span>
                </div>
                <span className="text-xs font-bold text-[#c9a84c] bg-[rgba(201,168,76,0.1)] px-2.5 py-0.5 rounded-full border border-[rgba(201,168,76,0.2)]">
                  {group.services.length} خدمات
                </span>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.services.map(svc => {
                  const Icon = svc.icon;
                  const isActive = controls[svc.key] !== false;

                  return (
                    <div
                      key={svc.key}
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-md ${
                        isActive
                          ? 'bg-[#14141e] border-white/[0.08] hover:border-[rgba(201,168,76,0.4)]'
                          : 'bg-[#101017] border-red-500/20 opacity-75'
                      }`}
                    >
                      {/* Top Row: Icon + Toggle */}
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                              isActive
                                ? 'bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.3)] text-[#c9a84c]'
                                : 'bg-gray-800 border border-gray-700 text-gray-400'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {isActive ? 'نشط بالتطبيق' : 'معطل مؤقتاً'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggle(svc.key)}
                              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                                isActive ? 'bg-emerald-500' : 'bg-gray-700'
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <h3 className="text-sm font-bold text-[#F8F9FA] mb-1">{svc.name}</h3>
                        <p className="text-[10px] font-bold text-[#c9a84c] mb-2 font-mono">
                          {svc.nameEn}
                        </p>
                        <p className="text-xs text-[#8892B0] leading-5">{svc.desc}</p>
                      </div>

                      {/* Bottom Action: Manage Catalog */}
                      <div className="pt-4 mt-4 border-t border-white/[0.05] flex items-center justify-between">
                        <span className="text-[10px] text-[#64748B]">مربوط حياً بـ Firestore</span>
                        {svc.manageLink && (
                          <Link
                            href={svc.manageLink}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#c9a84c] hover:text-[#e8c97a] hover:underline"
                          >
                            <span>{svc.manageLabel || 'إدارة الكتالوج'}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
