import { MYANMAR_RACES } from '../data/formConstants';

const selClass =
  'border border-gray-500 bg-white text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';

interface RaceSelectorProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export const RaceSelector = ({ value, onChange, error }: RaceSelectorProps) => (
  <div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${selClass} w-full`}
    >
      <option value=''>---</option>
      {MYANMAR_RACES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
    {error && <p className='text-xs text-red-600'>{error}</p>}
  </div>
);
