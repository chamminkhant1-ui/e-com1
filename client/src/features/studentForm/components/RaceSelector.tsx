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
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        <select
          value={value.r1}
          onChange={(e) => onChange({ r1: e.target.value, r2: '', r3: '' })}
          className={`${selectClass} w-full`}
        >
          <option value="">---</option>
          {MYANMAR_RACES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
