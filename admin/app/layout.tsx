import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AuthProvider } from '@/components/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'فانير جروب · لوحة تحكم المسؤول | Vanir Admin',
  description: 'لوحة التحكم الإدارية لمنظومة فانير للسياحة الفاخرة وإدارة التطبيق',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-[#0d0d12] text-[#f5f0e8] min-h-screen antialiased selection:bg-[#c9a84c] selection:text-[#0d0d12]">
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
