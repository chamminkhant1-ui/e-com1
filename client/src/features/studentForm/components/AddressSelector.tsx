import { useState, useEffect } from 'react';
import { STATES } from '../data/formConstants';

export interface AddressValue {
  state: string;
  district: string;
  township: string;
  address: string;
}

const selClass =
  'border border-gray-500 bg-white text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400 flex-1 min-w-[130px]';

const textareaClass =
  'w-full border border-gray-400 bg-white text-sm px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';

interface AddressSelectorProps {
  value: AddressValue;
  onChange: (val: AddressValue) => void;
  error?: string;
}

export const AddressSelector = ({ value, onChange, error }: AddressSelectorProps) => {
  const [districts, setDistricts] = useState<string[]>([]);
  const [townships, setTownships] = useState<string[]>([]);

  useEffect(() => {
    if (!value.state) return;
    let active = true;
    fetch(`/api/locations/districts/${encodeURIComponent(value.state)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setDistricts(data.districts?.map((d: { districtName: string }) => d.districtName) ?? []);
      })
      .catch(() => {
        if (!active) return;
        setDistricts([]);
      });
    return () => {
      active = false;
    };
  }, [value.state]);

  useEffect(() => {
    if (!value.district || !value.state) return;
    let active = true;
    fetch(
      `/api/locations/townships/${encodeURIComponent(value.state)}/${encodeURIComponent(value.district)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setTownships(data.cities?.map((c: { cityName: string }) => c.cityName) ?? []);
      })
      .catch(() => {
        if (!active) return;
        setTownships([]);
      });
    return () => {
      active = false;
    };
  }, [value.district, value.state]);

  return (
    <div className='flex flex-col gap-1 py-1'>
      <div className='flex flex-wrap gap-1'>
        <select
          value={value.state}
          onChange={(e) => {
            setDistricts([]);
            setTownships([]);
            onChange({ state: e.target.value, district: '', township: '', address: '' });
          }}
          className={selClass}
        >
          <option value=''>--ရွေးချယ်ပါ--</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={value.district}
          onChange={(e) => {
            setTownships([]);
            onChange({ ...value, district: e.target.value, township: '', address: '' });
          }}
          disabled={!value.state}
          className={selClass}
        >
          <option value=''>--ရွေးချယ်ပါ--</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={value.township}
          onChange={(e) => onChange({ ...value, township: e.target.value })}
          disabled={!value.district}
          className={selClass}
        >
          <option value=''>--ရွေးချယ်ပါ--</option>
          {townships.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <textarea
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
        disabled={!value.township}
        rows={3}
        placeholder='ဥပမာ - အမှတ် ၁၂၃၊ ရာဇသင်္ဂဟလမ်း၊ မင်္ဂလာဒီပရပ်ကွက်၊ ပုဗ္ဗသီရိမြို့နယ်၊ နေပြည်တော်။'
        className={textareaClass}
      />
      {error && <p className='text-xs text-red-600'>{error}</p>}
    </div>
  );
};
