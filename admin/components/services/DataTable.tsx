'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string; status?: string; createdAt?: string }> {
  title: string;
  subtitle?: string;
  addLabel?: string;
  addHref: string;
  editHref: (id: string) => string;
  columns: TableColumn<T>[];
  data: T[];
  searchKeys?: (keyof T)[];
  onDelete?: (id: string) => void;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  selectedId?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  draft: 'bg-white/[0.05] text-[#8892B0] border-white/[0.1]',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  draft: 'مسودة',
};

function getVisiblePageNumbers(currentPage: number, totalPages: number, maxVisible = 5): number[] {
  const count = Math.min(maxVisible, totalPages);
  const start = Math.max(1, Math.min(totalPages - count + 1, currentPage - Math.floor(count / 2)));
  return Array.from({ length: count }, (_, i) => start + i);
}

export function DataTable<T extends { id: string; status?: string; createdAt?: string }>({
  title,
  subtitle,
  addLabel = '+ إضافة جديد',
  addHref,
  editHref,
  columns,
  data,
  searchKeys = [],
  onDelete,
  pageSize = 10,
  onRowClick,
  selectedId,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter(row =>
      searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
    );
  }, [data, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(p => Math.min(p, totalPages));
  }, [totalPages]);

  function getCellValue(row: T, key: string) {
    return (row as Record<string, unknown>)[key];
  }

  return (
    <div className="space-y-4 text-right font-sans">
      {/* Header + Search + Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-[#F8F9FA] text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-[#8892B0] text-xs mt-1">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial w-full sm:w-auto">
            <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8892B0] h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="بحث في القائمة..."
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              className="
                bg-[#14141e] border border-white/[0.08] rounded-xl
                pr-9 pl-3 py-2 text-[#F8F9FA] text-xs placeholder-[#64748B] w-full sm:w-52
                focus:outline-none focus:border-[#c9a84c] transition-colors text-right
              "
            />
          </div>

          {/* Add New */}
          <a
            href={addHref}
            className="
              flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#c9a84c] to-[#e6c875] text-[#0d0d12] text-xs font-bold
              rounded-xl shadow-[0_4px_16px_rgba(201,168,76,0.3)] hover:opacity-95 transition-all whitespace-nowrap shrink-0
            "
          >
            <span>{addLabel}</span>
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#14141e] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                {columns.map(col => (
                  <th
                    key={String(col.key)}
                    className="text-right px-5 py-3.5 text-[11px] font-bold text-[#8892B0] whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="text-right px-5 py-3.5 text-[11px] font-bold text-[#8892B0]">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-16 text-center text-[#8892B0] text-xs">
                    لا توجد سجلات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                paged.map(row => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={`group transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${
                      row.id === selectedId
                        ? 'bg-[rgba(201,168,76,0.06)]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {columns.map(col => (
                      <td key={String(col.key)} className={`px-5 py-4 ${col.className ?? ''}`}>
                        {col.render
                          ? col.render(row)
                          : col.key === 'status'
                          ? (
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[row.status ?? 'draft']}`}>
                              {STATUS_LABELS[row.status ?? 'draft'] ?? row.status}
                            </span>
                          )
                          : (
                            <span className="text-[#CCD6F6] text-xs">
                              {String(getCellValue(row, String(col.key)) ?? '—')}
                            </span>
                          )
                        }
                      </td>
                    ))}
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <a
                          href={editHref(row.id)}
                          className="flex items-center gap-1 text-xs text-[#c9a84c] font-semibold px-2.5 py-1 rounded-lg hover:bg-[rgba(201,168,76,0.1)] transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>تعديل</span>
                        </a>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={event => {
                              event.stopPropagation();
                              onDelete(row.id);
                            }}
                            className="flex items-center gap-1 text-xs text-rose-400 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#8892B0]">
          <p>
            عرض {paged.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} من أصل {filtered.length} سجل
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-white/[0.1] text-xs disabled:opacity-30 hover:bg-white/[0.05] disabled:cursor-not-allowed"
            >
              السابق
            </button>
            {getVisiblePageNumbers(currentPage, totalPages).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  p === currentPage
                    ? 'bg-[#c9a84c] text-[#0d0d12]'
                    : 'text-[#8892B0] hover:bg-white/[0.05]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/[0.1] text-xs disabled:opacity-30 hover:bg-white/[0.05] disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
