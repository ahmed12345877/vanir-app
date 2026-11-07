'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HotelFormPageClient from '../[id]/PageClient';

function HotelEditContent() {
  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get('id');
  const idFromPath = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : null;
  const id = idFromQuery || (idFromPath && idFromPath !== 'edit' ? idFromPath : 'new');

  return <HotelFormPageClient params={{ id }} />;
}

export default function HotelEditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#c9a84c] text-center">جاري التحميل...</div>}>
      <HotelEditContent />
    </Suspense>
  );
}
