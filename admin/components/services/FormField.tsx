'use client';

// ─── Ocean Pearl Design Tokens ───────────────────────────────────────────────
// BG:          #0A192F  Surface: #0D2137  Surface-alt: #112840
// Accent:      #8892B0  Text:    #F8F9FA  Text-muted:  #64748B
// Border:      rgba(136,146,176,0.2)  Border-focus: rgba(136,146,176,0.5)
// ─────────────────────────────────────────────────────────────────────────────

const INPUT_BASE =
  'w-full bg-[#091630] border border-[rgba(136,146,176,0.25)] rounded-lg px-3 py-2.5 ' +
  'text-[#F8F9FA] text-sm placeholder-[#4A5568] ' +
  'focus:outline-none focus:border-[#8892B0] focus:ring-1 focus:ring-[rgba(136,146,176,0.3)] ' +
  'transition-colors';

const LABEL_BASE = 'block text-[#8892B0] text-xs font-semibold uppercase tracking-wider mb-1.5';
const SELECT_ARROW =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238892B0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`;

// ─── TextInput ───────────────────────────────────────────────────────────────
interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function TextInput({ label, name, value, onChange, placeholder, required }: TextInputProps) {
  return (
    <div>
      <label htmlFor={name} className={LABEL_BASE}>
        {label}{required && <span className="text-[#8892B0] ml-1">*</span>}
      </label>
      <input
        id={name}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className={INPUT_BASE}
      />
    </div>
  );
}

// ─── NumberInput ─────────────────────────────────────────────────────────────
interface NumberInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberInput({ label, name, value, onChange, placeholder, prefix, suffix, min = 0, max, step = 1 }: NumberInputProps) {
  return (
    <div>
      <label htmlFor={name} className={LABEL_BASE}>{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-[#8892B0] text-sm font-medium pointer-events-none">{prefix}</span>
        )}
        <input
          id={name}
          type="number"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder ?? '0'}
          min={min}
          max={max}
          step={step}
          className={`${INPUT_BASE} ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 text-[#8892B0] text-xs pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── SelectInput ─────────────────────────────────────────────────────────────
interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function SelectInput({ label, name, value, onChange, options }: SelectInputProps) {
  return (
    <div>
      <label htmlFor={name} className={LABEL_BASE}>{label}</label>
      <select
        id={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${INPUT_BASE} appearance-none cursor-pointer bg-no-repeat [background-position:right_12px_center]`}
        style={{ backgroundImage: SELECT_ARROW }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#091630]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── TextareaInput ───────────────────────────────────────────────────────────
interface TextareaInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextareaInput({ label, name, value, onChange, placeholder, rows = 4 }: TextareaInputProps) {
  return (
    <div>
      <label htmlFor={name} className={LABEL_BASE}>{label}</label>
      <textarea
        id={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}…`}
        rows={rows}
        className={`${INPUT_BASE} resize-y min-h-[100px]`}
      />
    </div>
  );
}

// ─── ToggleInput ─────────────────────────────────────────────────────────────
interface ToggleInputProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleInput({ label, description, value, onChange }: ToggleInputProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[rgba(136,146,176,0.1)] last:border-0">
      <div>
        <p className="text-[#CCD6F6] text-sm font-medium">{label}</p>
        {description && <p className="text-[#4A5568] text-xs mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
          transition-colors duration-200 ease-in-out focus:outline-none
          ${value
            ? 'bg-[#8892B0] border-[#8892B0]'
            : 'bg-[#112840] border-[rgba(136,146,176,0.3)]'
          }
        `}
        aria-pressed={value}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-[#F8F9FA] shadow-lg 
            transition-transform duration-200 ease-in-out mt-0.5
            ${value ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}
