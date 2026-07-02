import { useState, useEffect } from 'react';
import { STATES } from '../data/formConstants';

export interface AddressValue {
  state: string;
  district: string;
  township: string;
  address: string;
}

interface AddressSelectorProps {
  label: string;
  value: AddressValue;
  onChange: (val: AddressValue) => void;
  stateId: string;
  districtId: string;
  townshipId: string;
  error?: string;
}

const selectClass =
  'w-full rounded-xl border border-white/15 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all';

export const AddressSelector = ({
  label,
  value,
  onChange,
  stateId,
  districtId,
  townshipId,
  error,
}: AddressSelectorProps) => {
  const [districts, setDistricts] = useState<string[]>([]);
  const [townships, setTownships] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTownships, setLoadingTownships] = useState(false);

  useEffect(() => {
    if (!value.state) return;
    setLoadingDistricts(true);
    fetch(`/api/locations/districts/${encodeURIComponent(value.state)}`)
      .then((r) => r.json())
      .then((data) => {
        setDistricts(data.districts?.map((d: { districtName: string }) => d.districtName) ?? []);
        setLoadingDistricts(false);
      })
      .catch(() => {
        setDistricts([]);
        setLoadingDistricts(false);
      });
  }, [value.state]);

  useEffect(() => {
    if (!value.district || !value.state) return;
    setLoadingTownships(true);
    fetch(
      `/api/locations/townships/${encodeURIComponent(value.state)}/${encodeURIComponent(value.district)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        setTownships(data.cities?.map((c: { cityName: string }) => c.cityName) ?? []);
        setLoadingTownships(false);
      })
      .catch(() => {
        setTownships([]);
        setLoadingTownships(false);
      });
  }, [value.district, value.state]);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold text-slate-300">{label}</span>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/* State */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400" htmlFor={stateId}>
            တိုင်း/ပြည်နယ်
          </label>
          <select
            id={stateId}
            value={value.state}
            onChange={(e) =>
              onChange({ state: e.target.value, district: '', township: '', address: '' })
            }
            className={selectClass}
          >
            <option value="">--ရွေးချယ်ပါ--</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400" htmlFor={districtId}>
            ခရိုင်
          </label>
          <select
            id={districtId}
            value={value.district}
            onChange={(e) =>
              onChange({ ...value, district: e.target.value, township: '', address: '' })
            }
            disabled={!value.state || loadingDistricts}
            className={selectClass}
          >
            <option value="">{loadingDistricts ? 'Loading...' : '--ရွေးချယ်ပါ--'}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Township */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400" htmlFor={townshipId}>
            မြို့နယ်
          </label>
          <select
            id={townshipId}
            value={value.township}
            onChange={(e) => onChange({ ...value, township: e.target.value })}
            disabled={!value.district || loadingTownships}
            className={selectClass}
          >
            <option value="">{loadingTownships ? 'Loading...' : '--ရွေးချယ်ပါ--'}</option>
            {townships.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Address textarea */}
      <textarea
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
        disabled={!value.township}
        rows={3}
        placeholder="ဥပမာ - အမှတ် ၁၂၃၊ ရာဇသင်္ဂဟလမ်း၊ မင်္ဂလာဒီပရပ်ကွက်၊ ပုဗ္ဗသီရိမြို့နယ်၊ နေပြည်တော်။"
        className="w-full resize-none rounded-xl border border-white/15 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/70 focus:bg-white/12 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
