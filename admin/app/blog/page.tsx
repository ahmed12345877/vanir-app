'use client';


import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  BookOpen,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  status: 'منشورة' | 'مسودة';
  date: string;
}

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'وانشر مقالاً فاخراً في المدونة عن رحلات دبي مع انشاء صورة',
    category: 'Luxury Travel',
    author: 'A Roshdi',
    status: 'منشورة',
    date: '2026-10-15',
  },
  {
    id: 'b2',
    title: 'وانشر مقالاً فاخراً في المدونة عن رحلات الأهرامات والنايل كروز',
    category: 'Luxury Travel',
    author: 'A Roshdi',
    status: 'منشورة',
    date: '2026-10-14',
  },
  {
    id: 'b3',
    title: 'دليل السفر الملكي وأسرار الأهرامات مع فانير جروب',
    category: 'Luxury Tours',
    author: 'فريق التحرير',
    status: 'منشورة',
    date: '2026-10-12',
  },
  {
    id: 'b4',
    title: 'Rome: The Eternal City of Art, History, and Culture',
    category: 'Cultural Heritage / Cities',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-10-08',
  },
  {
    id: 'b5',
    title: 'Santorini Romance: Blue Domes and Sunset Views',
    category: 'Honeymoon / Islands',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-10-05',
  },
  {
    id: 'b6',
    title: 'Swiss Alps Luxury Guide: Nature, Lakes, and Mountain Magic',
    category: 'Nature / Mountain Resorts',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-10-01',
  },
  {
    id: 'b7',
    title: 'The Amalfi Coast: Italy\'s Scenic Summer Paradise',
    category: 'Beach Resorts / Scenery',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-09-28',
  },
  {
    id: 'b8',
    title: 'Exploring London: A Royal and Modern Adventure',
    category: 'European Getaways / History',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-09-22',
  },
  {
    id: 'b9',
    title: 'The Paris Luxury Guide: Romance, Art, and Elegance',
    category: 'European Getaways / Cities',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-09-18',
  },
  {
    id: 'b10',
    title: 'Unveiling the Wonders of Egypt: A Journey Through Time',
    category: 'Cultural Heritage / History',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-09-14',
  },
  {
    id: 'b11',
    title: 'Maldives Vacation Guide: Paradise on Earth',
    category: 'Honeymoon / Resorts',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-09-10',
  },
  {
    id: 'b12',
    title: '48 Hours in Dubai: The Ultimate Luxury Travel Itinerary',
    category: 'Luxury Travel / Cities',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-09-05',
  },
  {
    id: 'b13',
    title: 'The Ultimate Guide to Cappadocia: The Land of Fairy Chimneys',
    category: 'Travel Guides / Destinations',
    author: 'Vanir Editorial',
    status: 'منشورة',
    date: '2026-09-01',
  },
];

import { useEffect, useState } from 'react';
import {
  fetchBlogPostsFromFirestore,
  saveBlogPostToFirestore,
  deleteBlogPostFromFirestore,
  type BlogPostItem,
} from '@/lib/firestoreService';

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Luxury Travel');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPostsFromFirestore().then(items => {
      setBlogs(items);
      setLoading(false);
    });
  }, []);

  const filteredBlogs = blogs.filter(
    b =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  async function handleAddPost(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const id = 'blog-' + Date.now();
    const post: BlogPostItem = {
      id,
      slug: newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id,
      title: newTitle.trim(),
      category: newCategory,
      author: 'A Roshdi',
      status: 'منشورة',
      date: new Date().toISOString().split('T')[0],
      excerpt: newExcerpt.trim() || newTitle.trim(),
      content: newExcerpt.trim() || newTitle.trim(),
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85',
      readingTime: 5,
    };

    try {
      await saveBlogPostToFirestore(post);
      setBlogs([post, ...blogs]);
      setNewTitle('');
      setNewExcerpt('');
      setShowAddModal(false);
      setToast('تم نشر المقالة الجديدة بنجاح في قاعدة البيانات السحابية!');
      setTimeout(() => setToast(null), 3000);
    } catch {
      alert('حدث خطأ أثناء حفظ المقالة.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه المقالة؟')) return;
    try {
      await deleteBlogPostFromFirestore(id);
      setBlogs(blogs.filter(b => b.id !== id));
      setToast('تم حذف المقالة من السحابة.');
      setTimeout(() => setToast(null), 2500);
    } catch {
      alert('حدث خطأ أثناء الحذف.');
    }
  }

  return (
    <div className="space-y-6 text-right font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-xl border border-[rgba(201,168,76,0.3)] bg-[#16161e] p-4 text-[#F8F9FA] shadow-2xl">
          <CheckCircle2 className="h-5 w-5 text-[#c9a84c]" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Row matching Image 2 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8F9FA] flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-[#c9a84c]" />
            <span>إدارة المدونة</span>
          </h1>
          <p className="mt-1 text-xs text-[#8892B0]">
            نشر وإدارة مقالات المدونة وأدلة السفر الملكية في موقع وتطبيق فانير
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#e5c158] hover:bg-[#d4af37] px-5 py-2.5 text-sm font-bold text-[#0d0d12] shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مقالة جديدة +</span>
        </button>
      </div>

      {/* Search Bar matching Image 2 */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="...البحث عن مقالة"
          className="w-full rounded-xl border border-white/[0.08] bg-[#16161e] py-2.5 pr-10 pl-4 text-sm text-[#F8F9FA] placeholder-[#64748B] focus:border-[#c9a84c] focus:outline-none transition-colors text-right"
        />
      </div>

      {/* Blog Articles Table matching Image 2 */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-white/[0.08] bg-white/[0.02] text-[#8892B0]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">العنوان</th>
                <th className="py-3.5 px-4 font-semibold">الفئة</th>
                <th className="py-3.5 px-4 font-semibold">المؤلف</th>
                <th className="py-3.5 px-4 font-semibold text-center">الحالة</th>
                <th className="py-3.5 px-4 font-semibold">التاريخ</th>
                <th className="py-3.5 px-4 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredBlogs.map(blog => (
                <tr key={blog.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Title */}
                  <td className="py-4 px-4 font-medium text-[#F8F9FA] max-w-xs md:max-w-md truncate">
                    {blog.title}
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 text-[#8892B0]">
                    {blog.category}
                  </td>

                  {/* Author */}
                  <td className="py-4 px-4 text-[#64748B]">
                    {blog.author}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block rounded-md bg-[#c9a84c]/20 border border-[#c9a84c]/40 px-2.5 py-1 text-[11px] font-bold text-[#ecd58e]">
                      {blog.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-[#64748B] font-mono text-[11px]">
                    {blog.date}
                  </td>

                  {/* Actions (View, Edit, Delete) matching Image 2 */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        title="معاينة المقالة"
                        className="rounded-lg p-1.5 text-[#8892B0] hover:text-[#F8F9FA] hover:bg-white/[0.06] transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        title="تعديل المقالة"
                        className="rounded-lg p-1.5 text-[#8892B0] hover:text-[#c9a84c] hover:bg-white/[0.06] transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        title="حذف المقالة"
                        className="rounded-lg p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBlogs.length === 0 && (
          <div className="p-8 text-center text-sm text-[#64748B]">
            لا توجد مقالات تطابق بحثك.
          </div>
        )}
      </div>

      {/* Add New Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[rgba(201,168,76,0.3)] bg-[#12121a] p-6 text-right shadow-2xl">
            <h3 className="text-lg font-bold text-[#F8F9FA]">إضافة مقالة جديدة للمدونة</h3>
            <p className="mt-1 text-xs text-[#8892B0]">
              سيتم نشر المقالة وتظهر مباشرة لزوار الموقع والتطبيق
            </p>

            <form onSubmit={handleAddPost} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8892B0] mb-1">
                  عنوان المقالة
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثال: دليل السفر الملكي وأسرار الأهرامات..."
                  className="w-full rounded-xl border border-white/[0.1] bg-[#161622] px-3.5 py-2.5 text-sm text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8892B0] mb-1">
                  فئة المقالة
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-[#161622] px-3.5 py-2.5 text-sm text-[#F8F9FA] focus:border-[#c9a84c] focus:outline-none"
                >
                  <option value="Luxury Travel">Luxury Travel</option>
                  <option value="Luxury Tours">Luxury Tours</option>
                  <option value="Cultural Heritage / Cities">Cultural Heritage / Cities</option>
                  <option value="Honeymoon / Islands">Honeymoon / Islands</option>
                  <option value="Nature / Mountain Resorts">Nature / Mountain Resorts</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-white/[0.1] px-4 py-2 text-xs font-semibold text-[#8892B0] hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#e5c158] hover:bg-[#d4af37] px-5 py-2 text-xs font-bold text-[#0d0d12]"
                >
                  نشر المقالة الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
