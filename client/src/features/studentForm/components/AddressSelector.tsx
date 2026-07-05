import { useState, useEffect } from 'react';
import { STATES } from '../data/formConstants';

export interface AddressValue {
  state: string;
  district: string;
  township: string;
  address: string;
}

/* ── Theme-specific class maps ─────────────────────────────────────── */

const darkSelect =
  'w-full rounded-xl border border-white/15 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all';

const darkTextarea =
  'w-full resize-none rounded-xl border border-white/15 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400/70 focus:bg-white/12 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all';

const lightSelect =
  'border border-gray-500 bg-white text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';

const lightTextarea =
  'w-full border border-gray-400 bg-white text-sm px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';

type Variant = 'dark' | 'light';

interface AddressSelectorProps {
  label?: string;
  value: AddressValue;
  onChange: (val: AddressValue) => void;
  error?: string;
  /** Visual theme — 'dark' for card UIs, 'light' for table cells */
  variant?: Variant;
}

export const AddressSelector = ({
  label,
  value,
  onChange,
  error,
  variant = 'dark',
}: AddressSelectorProps) => {
  const [districts, setDistricts] = useState<string[]>([]);
  const [townships, setTownships] = useState<string[]>([]);

  const selClass = variant === 'dark' ? darkSelect : lightSelect;

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

  /* ── Shared JSX fragments ──────────────────────────────────────── */

  const stateSelect = (
    <select
      value={value.state}
      onChange={(e) => {
        setDistricts([]);
        setTownships([]);
        onChange({ state: e.target.value, district: '', township: '', address: '' });
      }}
      className={variant === 'dark' ? selClass : `${selClass} flex-1 min-w-[130px]`}
    >
      <option value=''>--ရွေးချယ်ပါ--</option>
      {STATES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );

  const districtSelect = (
    <select
      value={value.district}
      onChange={(e) => {
        setTownships([]);
        onChange({ ...value, district: e.target.value, township: '', address: '' });
      }}
      disabled={!value.state}
      className={variant === 'dark' ? selClass : `${selClass} flex-1 min-w-[130px]`}
    >
      <option value=''>--ရွေးချယ်ပါ--</option>
      {districts.map((d) => (
        <option key={d} value={d}>{d}</option>
      ))}
    </select>
  );

  const townshipSelect = (
    <select
      value={value.township}
      onChange={(e) => onChange({ ...value, township: e.target.value })}
      disabled={!value.district}
      className={variant === 'dark' ? selClass : `${selClass} flex-1 min-w-[130px]`}
    >
      <option value=''>--ရွေးချယ်ပါ--</option>
      {townships.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );

  const addressArea = (
    <textarea
      value={value.address}
      onChange={(e) => onChange({ ...value, address: e.target.value })}
      disabled={!value.township}
      rows={3}
      placeholder='ဥပမာ - အမှတ် ၁၂၃၊ ရာဇသင်္ဂဟလမ်း၊ မင်္ဂလာဒီပရပ်ကွက်၊ ပုဗ္ဗသီရိမြို့နယ်၊ နေပြည်တော်။'
      className={variant === 'dark' ? darkTextarea : lightTextarea}
    />
  );

  /* ── Dark variant (card layout with labels) ──────────────────────── */
  if (variant === 'dark') {
    return (
      <div className='flex flex-col gap-3'>
        {label && <span className='text-xs font-semibold text-slate-300'>{label}</span>}

        <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-slate-400'>တိုင်း/ပြည်နယ်</label>
            {stateSelect}
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-slate-400'>ခရိုင်</label>
            {districtSelect}
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-slate-400'>မြို့နယ်</label>
            {townshipSelect}
          </div>
        </div>

        {addressArea}
        {error && <p className='text-xs text-red-400'>{error}</p>}
      </div>
    );
  }

  /* ── Light variant (compact flat layout for table cells) ─────────── */
  return (
    <div className='flex flex-col gap-1 py-1'>
      <div className='flex flex-wrap gap-1'>
        {stateSelect}
        {districtSelect}
        {townshipSelect}
      </div>
      {addressArea}
    </div>
  );
};
