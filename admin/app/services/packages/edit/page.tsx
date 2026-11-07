'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PackageFormPageClient from '../[id]/PageClient';

function PackageEditContent() {
  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get('id');
  const idFromPath = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : null;
  const id = idFromQuery || (idFromPath && idFromPath !== 'edit' ? idFromPath : 'new');

  return <PackageFormPageClient params={{ id }} />;
}

export default function PackageEditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#c9a84c] text-center">جاري التحميل...</div>}>
      <PackageEditContent />
    </Suspense>
  );
}
