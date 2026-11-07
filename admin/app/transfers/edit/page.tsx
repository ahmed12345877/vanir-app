'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TransferFormPageClient from '../[id]/PageClient';

function TransferEditContent() {
  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get('id');
  const idFromPath = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : null;
  const id = idFromQuery || (idFromPath && idFromPath !== 'edit' ? idFromPath : 'new');

  return <TransferFormPageClient params={{ id }} />;
}

export default function TransferEditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#c9a84c] text-center">جاري التحميل...</div>}>
      <TransferEditContent />
    </Suspense>
  );
}
