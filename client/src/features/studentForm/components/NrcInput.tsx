import { NRC_REGIONS } from '../data/formConstants';
import { NRC_CITIES_BY_REGION, NRC_PREFIXES } from '../data/nrcData';
import { toMyanmarDigits } from '../utils/myanmarDigits';

export interface NrcValue {
  region: string;
  city: string;
  prefix: string;
  number: string;
}

const selClass =
  'border border-gray-500 bg-white text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';

const inputClass =
  'w-full border border-gray-400 bg-white text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 box-border';

interface NrcInputProps {
  value: NrcValue;
  onChange: (val: NrcValue) => void;
  /** If provided, shows a validation badge comparing to expected NRC */
  expectedNrc?: string;
  error?: string;
}

const onRegionChange = (
  value: NrcValue,
  onChange: (v: NrcValue) => void,
  region: string,
) => onChange({ ...value, region, city: '', prefix: '', number: '' });

const onCityChange = (
  value: NrcValue,
  onChange: (v: NrcValue) => void,
  city: string,
) => onChange({ ...value, city, prefix: '', number: '' });

export const NrcInput = ({ value, onChange, expectedNrc, error }: NrcInputProps) => {
  const cities = value.region ? NRC_CITIES_BY_REGION[value.region] || [] : [];
  const prefixes = NRC_PREFIXES;

  // Validate against expected NRC (synchronously calculated during render)
  const validationMsg = (() => {
    if (!expectedNrc) return '';
    if (!value.region || !value.city || !value.prefix || !value.number) return '';
    const built = `${value.region}/${value.city}(${value.prefix})${value.number}`;
    return built === expectedNrc ? '✅' : '❌';
  })();

  return (
    <div className='flex flex-col gap-1 py-1'>
      {/* selects row */}
      <div className='flex flex-wrap items-center gap-0.5 text-sm'>
        <select
          value={value.region}
          onChange={(e) => onRegionChange(value, onChange, e.target.value)}
          className={selClass}
          style={{ width: 46 }}
        >
          <option value='' disabled>---</option>
          {NRC_REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span className='px-0.5'>/</span>
        <select
          value={value.city}
          onChange={(e) => onCityChange(value, onChange, e.target.value)}
          disabled={!value.region}
          className={selClass}
          style={{ width: 72 }}
        >
          <option value='' disabled>---</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className='px-0.5'>(</span>
        <select
          value={value.prefix}
          onChange={(e) => onChange({ ...value, prefix: e.target.value })}
          disabled={!value.region || !value.city}
          className={selClass}
          style={{ width: 72 }}
        >
          <option value='' disabled>---</option>
          {prefixes.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <span className='px-0.5'>)</span>
      </div>
      {/* number + badge */}
      <div className='flex items-center gap-1'>
        <input
          type='text'
          value={value.number}
          onChange={(e) => onChange({ ...value, number: toMyanmarDigits(e.target.value) })}
          disabled={!value.prefix}
          maxLength={6}
          placeholder='၀၁၂၃၄၅'
          className={`${inputClass} w-32`}
        />
        {validationMsg && (
          <span
            className={`font-bold text-base ${validationMsg === '✅' ? 'text-green-600' : 'text-red-600'}`}
          >
            {validationMsg}
          </span>
        )}
      </div>
      {error && <p className='text-xs text-red-600'>{error}</p>}
    </div>
  );
};
