import type { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  readOnly?: boolean;
}

export const FormInput = ({
  label,
  error,
  readOnly,
  className = '',
  ...props
}: FormInputProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-300">{label}</label>
    <input
      readOnly={readOnly}
      className={[
        'w-full rounded-xl border bg-white/8 px-3.5 py-2.5 text-sm text-white transition-all',
        'placeholder:text-slate-500',
        readOnly
          ? 'cursor-default border-white/10 bg-white/5 text-slate-300'
          : 'border-white/15 focus:border-indigo-400/70 focus:bg-white/12 focus:outline-none focus:ring-2 focus:ring-indigo-400/20',
        error ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/20' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

interface FormSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const FormSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = '--ရွေးချယ်ပါ--',
  error,
  disabled,
  className = '',
}: FormSelectProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-300">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={[
        'w-full rounded-xl border bg-slate-800 px-3.5 py-2.5 text-sm text-white transition-all',
        'focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/20',
        disabled ? 'cursor-not-allowed border-white/8 opacity-50' : 'border-white/15',
        error ? 'border-red-400/60' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

interface FormTextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
}

export const FormTextArea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  rows = 3,
}: FormTextAreaProps) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-300">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      rows={rows}
      className={[
        'w-full resize-none rounded-xl border bg-white/8 px-3.5 py-2.5 text-sm text-white transition-all',
        'placeholder:text-slate-500',
        disabled
          ? 'cursor-not-allowed border-white/8 opacity-50'
          : 'border-white/15 focus:border-indigo-400/70 focus:bg-white/12 focus:outline-none focus:ring-2 focus:ring-indigo-400/20',
        error ? 'border-red-400/60' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);
