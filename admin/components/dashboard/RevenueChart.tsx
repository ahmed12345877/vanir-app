'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenueDataPoint } from '@/lib/types';
import { useState } from 'react';

const MOCK_DATA: RevenueDataPoint[] = [
  { month: 'Jan', hotels: 420, flights: 180, cars: 90, experiences: 140 },
  { month: 'Feb', hotels: 380, flights: 220, cars: 80, experiences: 165 },
  { month: 'Mar', hotels: 510, flights: 260, cars: 110, experiences: 190 },
  { month: 'Apr', hotels: 580, flights: 295, cars: 130, experiences: 210 },
  { month: 'May', hotels: 620, flights: 310, cars: 145, experiences: 250 },
  { month: 'Jun', hotels: 710, flights: 340, cars: 160, experiences: 290 },
  { month: 'Jul', hotels: 890, flights: 410, cars: 200, experiences: 340 },
  { month: 'Aug', hotels: 960, flights: 450, cars: 220, experiences: 380 },
  { month: 'Sep', hotels: 820, flights: 390, cars: 185, experiences: 320 },
  { month: 'Oct', hotels: 740, flights: 360, cars: 170, experiences: 295 },
  { month: 'Nov', hotels: 680, flights: 320, cars: 150, experiences: 270 },
  { month: 'Dec', hotels: 950, flights: 480, cars: 240, experiences: 420 },
];

const COLORS = {
  hotels: '#c9a84c',
  flights: '#7eb3ff',
  cars: '#3fb98f',
  experiences: '#a97fff',
};

const CATEGORY_NAMES: Record<string, string> = {
  hotels: 'الفنادق والمنتجعات',
  flights: 'الطيران الخاص',
  cars: 'الليموزين والسيارات',
  experiences: 'اليخوت والرحلات الملكية',
};

type ChartType = 'area' | 'bar';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="bg-[#14141f] border border-[rgba(201,168,76,0.3)] rounded-2xl p-4 shadow-2xl min-w-48 text-right font-sans">
      <p className="text-[#c9a84c] text-xs font-bold tracking-wider mb-2.5">شهر: {label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#8892B0] text-xs font-medium">{CATEGORY_NAMES[entry.name] || entry.name}</span>
          </div>
          <span className="text-[#f5f0e8] text-xs font-bold font-mono">${entry.value}K</span>
        </div>
      ))}
      <div className="border-t border-white/[0.08] mt-2.5 pt-2 flex justify-between items-center">
        <span className="text-[#64748B] text-xs">إجمالي الشهر:</span>
        <span className="text-[#c9a84c] text-sm font-extrabold font-mono">${total}K</span>
      </div>
    </div>
  );
}

export function RevenueChart() {
  const [chartType, setChartType] = useState<ChartType>('area');

  return (
    <div className="bg-[#14141e] border border-white/[0.08] rounded-3xl p-6 shadow-[0_18px_45px_rgba(0,0,0,0.3)] text-right font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-[#c9a84c] mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">مؤشرات الأداء المالي</span>
          </div>
          <h3 className="text-[#f5f0e8] font-bold text-lg">تحليل وتوزيع الإيرادات الشهرية</h3>
          <p className="text-[#8892B0] text-xs mt-1">حجم المعاملات الفاخرة حسب كل فئة (بآلاف الدولارات USD)</p>
        </div>
        <div className="flex gap-1.5 bg-[#0d0d12] rounded-xl p-1 border border-white/[0.08]">
          <button
            onClick={() => setChartType('area')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              chartType === 'area'
                ? 'bg-[rgba(201,168,76,0.18)] text-[#c9a84c] border border-[rgba(201,168,76,0.3)] shadow-sm'
                : 'text-[#8892B0] hover:text-[#CCD6F6]'
            }`}
          >
            ∿ منحنى بياني
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              chartType === 'bar'
                ? 'bg-[rgba(201,168,76,0.18)] text-[#c9a84c] border border-[rgba(201,168,76,0.3)] shadow-sm'
                : 'text-[#8892B0] hover:text-[#CCD6F6]'
            }`}
          >
            ▭ أعمدة تفصيلية
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={290}>
        {chartType === 'area' ? (
          <AreaChart data={MOCK_DATA} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <defs>
              {Object.entries(COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#8892B0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8892B0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
            <Tooltip content={<CustomTooltip />} />
            {Object.entries(COLORS).map(([key, color]) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#grad-${key})`}
                dot={false}
                activeDot={{ r: 5, fill: color, stroke: '#0d0d12', strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        ) : (
          <BarChart data={MOCK_DATA} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#8892B0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8892B0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
            <Tooltip content={<CustomTooltip />} />
            {Object.entries(COLORS).map(([key, color]) => (
              <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} opacity={0.88} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-6 justify-center border-t border-white/[0.05] pt-4">
        {Object.entries(COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[#8892B0] text-xs font-semibold">{CATEGORY_NAMES[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
