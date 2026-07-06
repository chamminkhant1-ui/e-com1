import { MYANMAR_RACES } from '../data/formConstants';

export interface RaceValue {
  r1: string;
  r2: string;
  r3: string;
}

const selClass =
  'border border-gray-500 bg-white text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';

interface RaceSelectorProps {
  value: RaceValue;
  onChange: (val: RaceValue) => void;
  error?: string;
}

export const RaceSelector = ({ value, onChange, error }: RaceSelectorProps) => (
  <div>
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
    {error && <p className='text-xs text-red-600'>{error}</p>}
  </div>
);
