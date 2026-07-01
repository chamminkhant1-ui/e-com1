import { MYANMAR_RACES } from '../data/formConstants';

export interface RaceValue {
  r1: string;
  r2: string;
  r3: string;
}

interface RaceSelectorProps {
  label: string;
  value: RaceValue;
  onChange: (val: RaceValue) => void;
  error?: string;
}

const selectClass =
  'rounded-lg border border-white/15 bg-slate-800 px-2 py-2 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-1 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all';

export const RaceSelector = ({ label, value, onChange, error }: RaceSelectorProps) => {
  const combined = [value.r1, value.r2, value.r3].filter(Boolean).join(' / ');

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        <select
          value={value.r1}
          onChange={(e) => onChange({ r1: e.target.value, r2: '', r3: '' })}
          className={selectClass}
          style={{ width: '100px' }}
        >
          <option value="">---</option>
          {MYANMAR_RACES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={value.r2}
          onChange={(e) => onChange({ ...value, r2: e.target.value, r3: '' })}
          disabled={!value.r1}
          className={selectClass}
          style={{ width: '100px' }}
        >
          <option value="">---</option>
          {MYANMAR_RACES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={value.r3}
          onChange={(e) => onChange({ ...value, r3: e.target.value })}
          disabled={!value.r2}
          className={selectClass}
          style={{ width: '100px' }}
        >
          <option value="">---</option>
          {MYANMAR_RACES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {combined && (
        <div className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300">
          {combined}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
