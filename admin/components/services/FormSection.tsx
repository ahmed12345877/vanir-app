interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}

export function FormSection({ title, subtitle, children, columns = 2 }: FormSectionProps) {
  const gridClass =
    columns === 1 ? 'grid grid-cols-1 gap-4' :
    columns === 3 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' :
    'grid grid-cols-1 sm:grid-cols-2 gap-4';

  return (
    <div className="bg-[#0D2137] border border-[rgba(136,146,176,0.15)] rounded-xl p-5">
      {/* Section header */}
      <div className="mb-4 pb-3 border-b border-[rgba(136,146,176,0.1)]">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-[#8892B0]" />
          <h3 className="text-[#F8F9FA] font-semibold text-sm tracking-wide">{title}</h3>
        </div>
        {subtitle && (
          <p className="text-[#4A5568] text-xs mt-1 ml-3">{subtitle}</p>
        )}
      </div>
      <div className={gridClass}>{children}</div>
    </div>
  );
}
