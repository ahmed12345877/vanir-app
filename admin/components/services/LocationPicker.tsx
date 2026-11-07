'use client';

import React, { Component, ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 w-full items-center justify-center bg-[#091630] text-xs text-[#8892B0]">
      جاري تحميل الخريطة التفاعلية...
    </div>
  ),
});

class MapErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('LocationPickerMap error intercepted:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-80 w-full flex-col items-center justify-center bg-[#091630] p-6 text-center text-xs text-[#8892B0]">
          <p className="font-bold text-[#F8F9FA]">تعذر تحميل الخريطة في المتصفح</p>
          <p className="mt-1 text-[#64748B]">يمكنك إدخال الإحداثيات يدوياً من الحقول أدناه أو اختيار إحدى الوجهات الجاهزة</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const LABEL_BASE = 'block text-[#8892B0] text-xs font-semibold uppercase tracking-wider mb-1.5';
const INPUT_BASE =
  'w-full bg-[#091630] border border-[rgba(136,146,176,0.25)] rounded-lg px-3 py-2.5 ' +
  'text-[#F8F9FA] text-sm placeholder-[#4A5568] ' +
  'focus:outline-none focus:border-[#8892B0] focus:ring-1 focus:ring-[rgba(136,146,176,0.3)] ' +
  'transition-colors';

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  label?: string;
  description?: string;
  interactive?: boolean;
  showInputs?: boolean;
}

const DESTINATION_PRESETS = [
  { label: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { label: 'Maldives', lat: 5.1601, lng: 73.0382 },
  { label: 'Monaco', lat: 43.7384, lng: 7.4246 },
  { label: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { label: 'Paris', lat: 48.8566, lng: 2.3522 },
];

export function LocationPicker({
  lat = 0,
  lng = 0,
  onChange,
  label = 'Location',
  description = 'Click the map or drag the marker to pin the exact destination coordinates.',
  interactive = true,
  showInputs = true,
}: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasCoordinates = (lat !== 0 || lng !== 0) && !isNaN(lat) && !isNaN(lng);

  return (
    <div className="col-span-full">
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <label className={LABEL_BASE}>{label}</label>
          <p className="text-xs text-[#64748B]">{description}</p>
        </div>
        {interactive && (
          <div className="flex flex-wrap gap-2">
            {DESTINATION_PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.lat, preset.lng)}
                className="rounded-full border border-[rgba(136,146,176,0.2)] bg-[rgba(136,146,176,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#CCD6F6] transition-all hover:border-[rgba(168,178,209,0.42)] hover:text-[#F8F9FA]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[rgba(136,146,176,0.2)] bg-[#0A192F]">
        {mounted ? (
          <MapErrorBoundary>
            <LocationPickerMap
              lat={lat}
              lng={lng}
              onPick={onChange}
              interactive={interactive}
            />
          </MapErrorBoundary>
        ) : (
          <div className="flex h-80 w-full items-center justify-center bg-[#091630] text-xs text-[#8892B0]">
            جاري تحضير الخريطة...
          </div>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[rgba(136,146,176,0.14)] bg-[rgba(17,34,64,0.82)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">Latitude</p>
          <p className="mt-2 text-lg font-semibold text-[#F8F9FA]">{lat ? lat.toFixed(6) : '—'}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(136,146,176,0.14)] bg-[rgba(17,34,64,0.82)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">Longitude</p>
          <p className="mt-2 text-lg font-semibold text-[#F8F9FA]">{lng ? lng.toFixed(6) : '—'}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(136,146,176,0.14)] bg-[rgba(17,34,64,0.82)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">Map status</p>
          <p className="mt-2 text-lg font-semibold text-[#F8F9FA]">{hasCoordinates ? 'Pinned' : 'Awaiting pin'}</p>
        </div>
      </div>

      {showInputs && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lat-input" className={LABEL_BASE}>Latitude</label>
            <input
              id="lat-input"
              type="number"
              step="0.000001"
              value={lat || ''}
              onChange={e => onChange(parseFloat(e.target.value) || 0, lng)}
              placeholder="e.g. 25.204849"
              className={INPUT_BASE}
            />
          </div>
          <div>
            <label htmlFor="lng-input" className={LABEL_BASE}>Longitude</label>
            <input
              id="lng-input"
              type="number"
              step="0.000001"
              value={lng || ''}
              onChange={e => onChange(lat, parseFloat(e.target.value) || 0)}
              placeholder="e.g. 55.270783"
              className={INPUT_BASE}
            />
          </div>
        </div>
      )}
    </div>
  );
}
