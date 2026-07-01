import { useState, useEffect } from 'react';
import { NRC_REGIONS } from '../data/formConstants';

export interface NrcValue {
  region: string;
  city: string;
  prefix: string;
  number: string;
}

interface NrcInputProps {
  label: string;
  value: NrcValue;
  onChange: (val: NrcValue) => void;
  /** If true, shows a validation checkmark/X comparing to expected NRC */
  expectedNrc?: string;
  error?: string;
}

const selectClass =
  'rounded-lg border border-white/15 bg-slate-800 px-2 py-2 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-1 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all';

export const NrcInput = ({ label, value, onChange, expectedNrc, error }: NrcInputProps) => {
  const [cities, setCities] = useState<string[]>([]);
  const [prefixes, setPrefixes] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPrefixes, setLoadingPrefixes] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string>('');

  // Fetch cities when region changes
  useEffect(() => {
    if (!value.region) return;
    setLoadingCities(true);
    fetch(`/fetchCitiesForNRC/${value.region}`)
      .then((r) => r.json())
      .then((data) => {
        setCities(data.cities?.map((c: { prefixName: string }) => c.prefixName) ?? []);
        setLoadingCities(false);
      })
      .catch(() => {
        setCities([]);
        setLoadingCities(false);
      });
  }, [value.region]);

  // Fetch prefixes when city changes
  useEffect(() => {
    if (!value.city) return;
    setLoadingPrefixes(true);
    fetch(`/fetchNrcType`)
      .then((r) => r.json())
      .then((data) => {
        setPrefixes(data.nrcTypes?.map((t: { nrcTypeName: string }) => t.nrcTypeName) ?? []);
        setLoadingPrefixes(false);
      })
      .catch(() => {
        setPrefixes([]);
        setLoadingPrefixes(false);
      });
  }, [value.city]);

  // Validate against expected NRC
  useEffect(() => {
    if (!expectedNrc) return;
    if (!value.region || !value.city || !value.prefix || !value.number) {
      setValidationMsg('');
      return;
    }
    const built = `${value.region}/${value.city}(${value.prefix})${value.number}`;
    setValidationMsg(built === expectedNrc ? '✅' : '❌');
  }, [value, expectedNrc]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">{label}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Region */}
        <select
          value={value.region}
          onChange={(e) =>
            onChange({ ...value, region: e.target.value, city: '', prefix: '', number: '' })
          }
          className={selectClass}
          style={{ width: '52px' }}
        >
          <option value="" disabled>
            ---
          </option>
          {NRC_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <span className="text-slate-400">/</span>

        {/* City */}
        <select
          value={value.city}
          onChange={(e) =>
            onChange({ ...value, city: e.target.value, prefix: '', number: '' })
          }
          disabled={!value.region || loadingCities}
          className={selectClass}
          style={{ width: '80px' }}
        >
          <option value="" disabled>
            {loadingCities ? '...' : '---'}
          </option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-slate-400">(</span>

        {/* Prefix */}
        <select
          value={value.prefix}
          onChange={(e) => onChange({ ...value, prefix: e.target.value })}
          disabled={!value.city || loadingPrefixes}
          className={selectClass}
          style={{ width: '80px' }}
        >
          <option value="" disabled>
            {loadingPrefixes ? '...' : '---'}
          </option>
          {prefixes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span className="text-slate-400">)</span>

        {/* Number */}
        <input
          type="text"
          value={value.number}
          onChange={(e) => onChange({ ...value, number: e.target.value })}
          disabled={!value.prefix}
          maxLength={6}
          placeholder="၀၁၂၃၄၅"
          className={`${selectClass} w-24`}
        />

        {validationMsg && (
          <span
            className={`text-base font-bold ${validationMsg === '✅' ? 'text-green-400' : 'text-red-400'}`}
          >
            {validationMsg}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
