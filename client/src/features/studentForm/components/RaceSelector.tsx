import { MYANMAR_RACES } from '../data/formConstants';

export interface RaceValue {
  r1: string;
  r2: string;
  r3: string;
}

/* ── Theme-specific class maps ─────────────────────────────────────── */

const darkSelect =
  'rounded-lg border border-white/15 bg-slate-800 px-2 py-2 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-1 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all';

const lightSelect =
  'border border-gray-500 bg-white text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';

type Variant = 'dark' | 'light';

interface RaceSelectorProps {
  label?: string;
  value: RaceValue;
  onChange: (val: RaceValue) => void;
  error?: string;
  variant?: Variant;
}

export const RaceSelector = ({
  label,
  value,
  onChange,
  error,
  variant = 'dark',
}: RaceSelectorProps) => {
  const selClass = variant === 'dark' ? darkSelect : lightSelect;

  if (variant === 'light') {
    // Compact: just a single select for table cell use
    return (
      <select
        value={value.r1}
        onChange={(e) => onChange({ r1: e.target.value, r2: '', r3: '' })}
        className={`${selClass} w-full`}
      >
        <option value=''>---</option>
        {MYANMAR_RACES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    );
  }

  // Dark variant: full card-style layout
  return (
    <div className='flex flex-col gap-2'>
      {label && <span className='text-xs font-semibold text-slate-300'>{label}</span>}
      <div className='flex flex-wrap gap-1.5'>
        <select
          value={value.r1}
          onChange={(e) => onChange({ r1: e.target.value, r2: '', r3: '' })}
          className={`${selClass} w-full`}
        >
          <option value=''>---</option>
          {MYANMAR_RACES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      {error && <p className='text-xs text-red-400'>{error}</p>}
    </div>
  );
};
