interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
  prefix?: string;
  suffix?: string;
  color?: 'gold' | 'green' | 'blue' | 'purple';
}

const colorMap = {
  gold: {
    icon: 'text-[#c9a84c]',
    bg: 'bg-[rgba(201,168,76,0.08)]',
    border: 'border-[rgba(201,168,76,0.15)]',
    badge: 'bg-[rgba(201,168,76,0.1)] text-[#c9a84c] border-[rgba(201,168,76,0.2)]',
    glow: '0 0 24px rgba(201,168,76,0.12)',
  },
  green: {
    icon: 'text-[#3fb98f]',
    bg: 'bg-[rgba(63,185,143,0.08)]',
    border: 'border-[rgba(63,185,143,0.15)]',
    badge: 'bg-[rgba(63,185,143,0.1)] text-[#3fb98f] border-[rgba(63,185,143,0.2)]',
    glow: '0 0 24px rgba(63,185,143,0.08)',
  },
  blue: {
    icon: 'text-[#7eb3ff]',
    bg: 'bg-[rgba(126,179,255,0.08)]',
    border: 'border-[rgba(126,179,255,0.15)]',
    badge: 'bg-[rgba(126,179,255,0.1)] text-[#7eb3ff] border-[rgba(126,179,255,0.2)]',
    glow: '0 0 24px rgba(126,179,255,0.08)',
  },
  purple: {
    icon: 'text-[#a97fff]',
    bg: 'bg-[rgba(169,127,255,0.08)]',
    border: 'border-[rgba(169,127,255,0.15)]',
    badge: 'bg-[rgba(169,127,255,0.1)] text-[#a97fff] border-[rgba(169,127,255,0.2)]',
    glow: '0 0 24px rgba(169,127,255,0.08)',
  },
};

export function StatsCard({
  title,
  value,
  change,
  icon,
  color = 'gold',
}: StatsCardProps) {
  const c = colorMap[color];
  const isPositive = change >= 0;

  return (
    <div
      className={`
        bg-[#0f0f1a] border rounded-2xl p-5
        hover:scale-[1.01] transition-all duration-300 cursor-default
        ${c.border}
      `}
      style={{ boxShadow: c.glow }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${c.bg} ${c.icon}`}>
          {icon}
        </div>
        <span
          className={`
            text-xs font-bold px-2 py-1 rounded-full border
            ${c.badge}
            ${isPositive ? '' : '!bg-[rgba(216,106,106,0.1)] !text-[#d86a6a] !border-[rgba(216,106,106,0.2)]'}
          `}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      </div>

      {/* Value */}
      <p className="text-[#f5f0e8] text-3xl font-bold tracking-tight mb-1">{value}</p>

      {/* Title + period */}
      <div className="flex items-center justify-between">
        <p className="text-[#5a5560] text-xs font-medium tracking-wide uppercase">{title}</p>
        <p className="text-[#5a5560] text-[10px]">vs last month</p>
      </div>
    </div>
  );
}
