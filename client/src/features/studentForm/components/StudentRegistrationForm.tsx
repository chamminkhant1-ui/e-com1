import { useState, useEffect } from 'react';
import {
  NRC_REGIONS,
  MYANMAR_RACES,
  RELIGIONS,
  STATES,
  MATRI_PLACE_CODES,
  INTAKE_YEARS,
} from '../data/formConstants';
import { NRC_CITIES_BY_REGION, NRC_PREFIXES } from '../data/nrcData';
import type { NrcValue } from './NrcInput';
import type { RaceValue } from './RaceSelector';
import type { AddressValue } from './AddressSelector';

/* ─── shared cell-level styles ───────────────────────────────────────── */
const cellSel =
  'border border-gray-500 bg-white text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';
const cellInput =
  'w-full border border-gray-400 bg-white text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 box-border';
const td = 'border border-black px-2 py-1 text-sm align-middle';
const tdLabel = `${td} text-center font-medium`;

/* ─── Compact NRC for inside a td ────────────────────────────────────── */
function NrcCell({
  value,
  onChange,
  expectedNrc,
}: {
  value: NrcValue;
  onChange: (v: NrcValue) => void;
  expectedNrc?: string;
}) {
  const [validationMsg, setValidationMsg] = useState('');

  const cities = value.region ? NRC_CITIES_BY_REGION[value.region] || [] : [];
  const prefixes = NRC_PREFIXES;

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
    <div className='flex flex-col gap-1 py-1'>
      {/* selects row */}
      <div className='flex flex-wrap items-center gap-0.5 text-sm'>
        <select
          value={value.region}
          onChange={(e) =>
            onChange({
              ...value,
              region: e.target.value,
              city: '',
              prefix: '',
              number: '',
            })
          }
          className={cellSel}
          style={{ width: 46 }}
        >
          <option value='' disabled>
            ---
          </option>
          {NRC_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <span className='px-0.5'>/</span>
        <select
          value={value.city}
          onChange={(e) =>
            onChange({ ...value, city: e.target.value, prefix: '', number: '' })
          }
          disabled={!value.region}
          className={cellSel}
          style={{ width: 72 }}
        >
          <option value='' disabled>
            ---
          </option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className='px-0.5'>(</span>
        <select
          value={value.prefix}
          onChange={(e) => onChange({ ...value, prefix: e.target.value })}
          disabled={!value.region || !value.city}
          className={cellSel}
          style={{ width: 72 }}
        >
          <option value='' disabled>
            ---
          </option>
          {prefixes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span className='px-0.5'>)</span>
      </div>
      {/* number + badge */}
      <div className='flex items-center gap-1'>
        <input
          type='text'
          value={value.number}
          onChange={(e) => onChange({ ...value, number: e.target.value })}
          disabled={!value.prefix}
          maxLength={6}
          placeholder='၀၁၂၃၄၅'
          className={`${cellInput} w-32`}
        />
        {validationMsg && (
          <span
            className={`font-bold text-base ${validationMsg === '✅' ? 'text-green-600' : 'text-red-600'}`}
          >
            {validationMsg}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Compact Race selector ───────────────────────────────────────────── */
function RaceCell({
  value,
  onChange,
}: {
  value: RaceValue;
  onChange: (v: RaceValue) => void;
}) {
  return (
    <div className='flex flex-col gap-1 py-1'>
      <select
        value={value.r1}
        onChange={(e) => onChange({ r1: e.target.value, r2: '', r3: '' })}
        className={`${cellSel} w-full`}
      >
        <option value=''>---</option>
        {MYANMAR_RACES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─── Compact Address selector ────────────────────────────────────────── */
function AddressCell({
  value,
  onChange,
}: {
  value: AddressValue;
  onChange: (v: AddressValue) => void;
}) {
  const [districts, setDistricts] = useState<string[]>([]);
  const [townships, setTownships] = useState<string[]>([]);

  useEffect(() => {
    if (!value.state) {
      setDistricts([]);
      return;
    }
    fetch(`/api/locations/districts/${encodeURIComponent(value.state)}`)
      .then((r) => r.json())
      .then((d) =>
        setDistricts(
          d.districts?.map((x: { districtName: string }) => x.districtName) ??
            [],
        ),
      )
      .catch(() => setDistricts([]));
  }, [value.state]);

  useEffect(() => {
    if (!value.district || !value.state) {
      setTownships([]);
      return;
    }
    fetch(
      `/api/locations/townships/${encodeURIComponent(value.state)}/${encodeURIComponent(value.district)}`,
    )
      .then((r) => r.json())
      .then((d) =>
        setTownships(
          d.cities?.map((x: { cityName: string }) => x.cityName) ?? [],
        ),
      )
      .catch(() => setTownships([]));
  }, [value.district, value.state]);

  return (
    <div className='flex flex-col gap-1 py-1'>
      <div className='flex flex-wrap gap-1'>
        <select
          value={value.state}
          onChange={(e) =>
            onChange({
              state: e.target.value,
              district: '',
              township: '',
              address: '',
            })
          }
          className={`${cellSel} flex-1 min-w-[130px]`}
        >
          <option value=''>--ရွေးချယ်ပါ--</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={value.district}
          onChange={(e) =>
            onChange({
              ...value,
              district: e.target.value,
              township: '',
              address: '',
            })
          }
          disabled={!value.state}
          className={`${cellSel} flex-1 min-w-[130px]`}
        >
          <option value=''>--ရွေးချယ်ပါ--</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={value.township}
          onChange={(e) => onChange({ ...value, township: e.target.value })}
          disabled={!value.district}
          className={`${cellSel} flex-1 min-w-[130px]`}
        >
          <option value=''>--ရွေးချယ်ပါ--</option>
          {townships.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
        disabled={!value.township}
        rows={3}
        placeholder='ဥပမာ - အမှတ် ၁၂၃၊ ရာဇသင်္ဂဟလမ်း၊ မင်္ဂလာဒီပရပ်ကွက်၊ ပုဗ္ဗသီရိမြို့နယ်၊ နေပြည်တော်။'
        className='w-full border border-gray-400 bg-white text-sm px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400'
      />
    </div>
  );
}

/* ─── Photo Upload Box ────────────────────────────────────────────────── */
function PhotoUploadBox({
  label,
  preview,
  onChange,
}: {
  label: string;
  preview: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className='flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg'
      style={{ width: 120, height: 160 }}
    >
      {preview ? (
        <img
          src={preview}
          alt={label}
          className='w-full h-full object-cover rounded-lg'
        />
      ) : (
        <div className='flex flex-col items-center gap-1 p-2 text-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-8 h-8 text-gray-400'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5'
            />
          </svg>
          <span className='text-xs text-gray-500 font-semibold leading-tight'>
            {label}
          </span>
        </div>
      )}
      <input
        type='file'
        accept='image/*'
        onChange={onChange}
        className='hidden'
      />
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Form Component
   ═══════════════════════════════════════════════════════════════════════ */
interface StudentRegistrationFormProps {
  onSubmitSuccess: (data: unknown) => void;
  isSubmitting?: boolean;
  entrance?: { applicantNameMm: string; fatherNameMm: string; examYear: string; examRollNo: string; institution: string } | null;
  serverDate?: string;
}

export const StudentRegistrationForm = ({
  onSubmitSuccess,
  isSubmitting = false,
  entrance,
  serverDate,
}: StudentRegistrationFormProps) => {
  /* ── Myanmar digit helper ────────────────────────────────────────── */
  const mm = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  const toMM = (n: number) => String(n).replace(/[0-9]/g, (x) => mm[+x]);

  /* ── enrollment (read-only from server) ─────────────────────────── */
  const enrollment = (() => {
    // Format registrationDate from server ISO string or fall back to client date
    const dateObj = serverDate ? new Date(serverDate) : new Date();
    const registrationDate = `${toMM(dateObj.getDate())}-${toMM(dateObj.getMonth() + 1)}-${toMM(dateObj.getFullYear())}`;

    // Derive acYear: examYear e.g. "2025" → "၂၀၂၅-၂၀၂၆"
    const acYear = entrance?.examYear
      ? (() => {
          const y = parseInt(entrance.examYear, 10);
          return `${toMM(y)}-${toMM(y + 1)}`;
        })()
      : '၂၀၂၅-၂၀၂၆';

    // admissionId: examRollNo from entrance record
    const admissionId = entrance?.examRollNo ?? 'နည်းပညာ-၃';

    return {
      registrationDate,
      yearLevel: 'ပထမနှစ်',
      acYear,
      admissionId,
    };
  })();

  /* ── names ───────────────────────────────────────────────────────── */
  // Student and father Myanmar names are read-only, pre-filled from entrance record
  const nameMm = entrance?.applicantNameMm ?? '';
  const fatherNameMm = entrance?.fatherNameMm ?? '';
  const [motherNameMm, setMotherNameMm] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [fatherNameEn, setFatherNameEn] = useState('');
  const [motherNameEn, setMotherNameEn] = useState('');

  /* ── NRC ─────────────────────────────────────────────────────────── */
  const emptyNrc: NrcValue = { region: '', city: '', prefix: '', number: '' };
  const [studentNrc, setStudentNrc] = useState<NrcValue>(emptyNrc);
  const [fatherNrc, setFatherNrc] = useState<NrcValue>(emptyNrc);
  const [motherNrc, setMotherNrc] = useState<NrcValue>(emptyNrc);

  /* ── race ────────────────────────────────────────────────────────── */
  const emptyRace: RaceValue = { r1: '', r2: '', r3: '' };
  const [ethnicity, setEthnicity] = useState<RaceValue>(emptyRace);
  const [fatherEthnicity, setFatherEthnicity] = useState<RaceValue>(emptyRace);
  const [motherEthnicity, setMotherEthnicity] = useState<RaceValue>(emptyRace);

  /* ── religion ────────────────────────────────────────────────────── */
  const [religion, setReligion] = useState('');
  const [fatherReligion, setFatherReligion] = useState('');
  const [motherReligion, setMotherReligion] = useState('');

  /* ── personal ────────────────────────────────────────────────────── */
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  /* ── matriculation ───────────────────────────────────────────────── */
  const [entryAcademicYear, setEntryAcademicYear] = useState('');
  const [matriPlaceSelect, setMatriPlaceSelect] = useState('');
  const [matriRollNumber, setMatriRollNumber] = useState('');
  const [highSchoolName, setHighSchoolName] = useState('');
  const [yearMsg, setYearMsg] = useState('');
  const [rollMsg, setRollMsg] = useState('');

  /* ── occupations ─────────────────────────────────────────────────── */
  const [fatherJob, setFatherJob] = useState('');
  const [motherJob, setMotherJob] = useState('');

  /* ── contact ─────────────────────────────────────────────────────── */
  const emptyAddr: AddressValue = {
    state: '',
    district: '',
    township: '',
    address: '',
  };
  const [parentContact, setParentContact] = useState<AddressValue>(emptyAddr);
  const [parentPhone, setParentPhone] = useState('');
  const [studentContact, setStudentContact] = useState<AddressValue>(emptyAddr);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stdEmail, setStdEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ text: string; color: string }>({
    text: '',
    color: '',
  });

  /* ── photo / signature ───────────────────────────────────────────── */
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [sigPreview, setSigPreview] = useState('');
  const [sigFile, setSigFile] = useState<File | null>(null);

  /* ── form-level error ────────────────────────────────────────────── */
  const [formError, setFormError] = useState('');

  /* ─── effects ─────────────────────────────────────────────────── */
  // Validate intake year
  useEffect(() => {
    if (!entryAcademicYear) {
      setYearMsg('');
      return;
    }
    setYearMsg(
      entryAcademicYear !== '၂၀၂၅'
        ? '❌ ရွေးချယ်ထားသောအချက်အလက်နှင်• မကိုက်ညိပာသည်။'
        : '',
    );
  }, [entryAcademicYear]);

  // Validate matri prefix selected
  useEffect(() => {
    if (!matriPlaceSelect) {
      setRollMsg('');
      return;
    }
    if (matriPlaceSelect !== 'နဇယ') {
      setRollMsg('❌ ရွေးချယ်ထားသောအချက်အလက် မကိုက်ညိမှု မရှိပဪ။');
      setHighSchoolName('');
      setMatriRollNumber('');
      return;
    }
    setRollMsg('');
  }, [matriPlaceSelect]);

  // Validate roll number
  useEffect(() => {
    if (!matriRollNumber) return;
    const toMM = (s: string) =>
      s.replace(
        /[0-9]/g,
        (x) => ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'][+x],
      );
    setRollMsg(
      toMM(matriRollNumber) !== '၂၇' ? '❌ ခုံနံပါတ်မှားယွင်းနေပါသည်။' : '',
    );
  }, [matriRollNumber]);

  // Validate email (debounced)
  useEffect(() => {
    if (!stdEmail) {
      setEmailMsg({ text: '', color: '' });
      return;
    }
    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!regex.test(stdEmail)) {
      setEmailMsg({ text: 'Invalid email format.', color: 'text-red-600' });
      return;
    }
    setEmailMsg({ text: 'Checking...', color: 'text-gray-500' });
    const t = setTimeout(() => {
      fetch('/api/locations/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: stdEmail }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (!d.is_valid)
            setEmailMsg({
              text: 'Invalid email format.',
              color: 'text-red-600',
            });
          else if (!d.is_verified)
            setEmailMsg({
              text: 'Email domain/server not verified.',
              color: 'text-orange-500',
            });
          else
            setEmailMsg({
              text: 'Valid and verified email. ✓',
              color: 'text-green-600',
            });
        })
        .catch(() =>
          setEmailMsg({ text: 'Error checking email.', color: 'text-red-600' }),
        );
    }, 600);
    return () => clearTimeout(t);
  }, [stdEmail]);

  /* ─── file helpers ────────────────────────────────────────────── */
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setPhotoFile(f);
    if (f) {
      const r = new FileReader();
      r.onload = () => setPhotoPreview(r.result as string);
      r.readAsDataURL(f);
    } else setPhotoPreview('');
  };
  const handleSig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setSigFile(f);
    if (f) {
      const r = new FileReader();
      r.onload = () => setSigPreview(r.result as string);
      r.readAsDataURL(f);
    } else setSigPreview('');
  };

  /* ─── submit ──────────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Basic required-field checks
    if (!nameEn.trim()) {
      setFormError('ကျောင်းသား/သူ အင်္ဂလိပ်အမည် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!motherNameMm.trim() || !motherNameEn.trim()) {
      setFormError('မိခင်အမည် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!studentNrc.region || !studentNrc.city || !studentNrc.prefix || !studentNrc.number) {
      setFormError('ကျောင်းသား/သူ NRC ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!fatherNrc.region || !fatherNrc.city || !fatherNrc.prefix || !fatherNrc.number) {
      setFormError('အဘ NRC ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!motherNrc.region || !motherNrc.city || !motherNrc.prefix || !motherNrc.number) {
      setFormError('အမိ NRC ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!religion) {
      setFormError('ကျောင်းသား/သူ ဘာသာ ရွေးချယ်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!fatherReligion || !motherReligion) {
      setFormError('မိဘ ဘာသာ ရွေးချယ်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!dob) {
      setFormError('မွေးသက္ကရာဇ် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!gender) {
      setFormError('ကျား/မ ရွေးချယ်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!entryAcademicYear) {
      setFormError('တက္ကသိုလ်ဝင်တန်းအောင်မြင်သည့် ခုနှစ် ရွေးချယ်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!matriPlaceSelect || !matriRollNumber.trim()) {
      setFormError('ခုံအမှတ် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!highSchoolName.trim()) {
      setFormError('စာစစ်ဌာန ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!fatherJob.trim() || !motherJob.trim()) {
      setFormError('မိဘ အလုပ်အကိုင် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!parentContact.state || !parentContact.district || !parentContact.township || !parentContact.address.trim()) {
      setFormError('မိဘ လိပ်စာ အပြည့်အစုံ ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!parentPhone.trim()) {
      setFormError('မိဘ ဖုန်းနံပါတ် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!studentContact.state || !studentContact.district || !studentContact.township || !studentContact.address.trim()) {
      setFormError('ကျောင်းသား/သူ လိပ်စာ အပြည့်အစုံ ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError('ကျောင်းသား/သူ ဖုန်းနံပါတ် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }

    // Map Myanmar gender string to DB enum value expected by the backend
    const genderMap: Record<string, 'M' | 'F' | 'Other'> = {
      'ကျား': 'M',
      'မ': 'F',
    };
    const genderDb = genderMap[gender] ?? 'Other';

    // Build the full payload matching the backend StudentProfileInput schema
    const payload = {
      nameMm,
      nameEn,
      fatherNameMm,
      fatherNameEn,
      motherNameMm,
      motherNameEn,

      studentNrc,
      fatherNrc,
      motherNrc,

      ethnicity,
      fatherEthnicity,
      motherEthnicity,

      religion,
      fatherReligion,
      motherReligion,

      dob,
      gender: genderDb,

      entryAcademicYear,
      matriPlaceSelect,
      matriRollNumber,
      highSchoolName,

      fatherJob,
      motherJob,

      parent_contact: parentContact,
      parentPhone,

      student_contact: studentContact,
      phoneNumber,
      std_email: stdEmail,
    };

    onSubmitSuccess(payload);
  };

  /* ─── JSX ─────────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className='font-myanmar'>
      {/* ── outer card ─────────────────────────────────────────────── */}
      <div
        className='border border-gray-400 rounded-lg bg-white p-5 mx-auto'
        style={{ maxWidth: 1000 }}
      >
        {/* ── Title ──────────────────────────────────────────────── */}
        <h2 className='text-center text-blue-600 font-bold text-lg mb-1'>
          University of Computer Studies, Pyay
        </h2>
        <h3 className='text-center font-semibold text-sm mb-0.5'>
          ကျောင်းသား/သူအဖြစ် မှတ်ပုံတင်ခွင့်တောင်းခံလွှာ
        </h3>
        <h3 className='text-center font-medium text-sm mb-4'>
          (ပထမနှစ်အတွက်သာ)
        </h3>

        {/* ── Top section: Photo (left) + Enrollment table (right) ── */}
        <div className='flex justify-between items-start gap-4 mb-4'>
          {/* Photo upload */}
          <div className='flex flex-col items-center gap-1'>
            <PhotoUploadBox
              label={'Passport ဓာတ်ပုံ\nတင်ရန်'}
              preview={photoPreview}
              onChange={handlePhoto}
            />
          </div>

          {/* Enrollment info table */}
          <div style={{ width: '62%' }}>
            <table className='w-full border-collapse text-sm'>
              <tbody>
                <tr>
                  <td className={`${td} w-1/2`}>ကျောင်းအပ်သည့်ရက်စွဲ</td>
                  <td className={td}>{enrollment.registrationDate}</td>
                </tr>
                <tr>
                  <td className={td}>အတန်း</td>
                  <td className={td}>{enrollment.yearLevel}</td>
                </tr>
                <tr>
                  <td className={td}>ပညာသင်နှစ်</td>
                  <td className={td}>{enrollment.acYear}</td>
                </tr>
                <tr>
                  <td className={td}>ဝင်ခွင့်အမှတ်စဥ်</td>
                  <td className={td}>{enrollment.admissionId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Error banner ────────────────────────────────────────── */}
        {formError && (
          <div className='mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700'>
            {formError}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            MAIN TABLE
            ══════════════════════════════════════════════════════════ */}
        <table className='w-full border-collapse text-sm text-center'>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '27%' }} />
            <col style={{ width: '27%' }} />
            <col style={{ width: '27%' }} />
          </colgroup>

          {/* ── Header row ──────────────────────────────────────── */}
          <thead>
            <tr>
              <th className={`${tdLabel} font-bold`} colSpan={2}>
                အကြောင်းအရာ
              </th>
              <th className={tdLabel}>ကျောင်းသား/သူ</th>
              <th className={tdLabel}>အဘ</th>
              <th className={tdLabel}>အမိ</th>
            </tr>
          </thead>

          <tbody>
            {/* ── Names ─────────────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={tdLabel} rowSpan={2}>
                အမည်
              </td>
              <td className={`${td} text-left`}>မြန်မာ</td>
              <td className={td}>
                <input
                  readOnly
                  value={nameMm}
                  className={`${cellInput} bg-gray-50`}
                />
              </td>
              <td className={td}>
                <input
                  readOnly
                  value={fatherNameMm}
                  className={`${cellInput} bg-gray-50`}
                />
              </td>
              <td className={td}>
                <input
                  value={motherNameMm}
                  onChange={(e) => setMotherNameMm(e.target.value)}
                  placeholder='ဒေါ်......'
                  required
                  className={cellInput}
                />
              </td>
            </tr>
            <tr style={{ height: 50 }}>
              <td className={`${td} text-left`}>အင်္ဂလိပ်</td>
              <td className={td}>
                <input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder='Mg/Ma ......'
                  required
                  className={cellInput}
                />
              </td>
              <td className={td}>
                <input
                  value={fatherNameEn}
                  onChange={(e) => setFatherNameEn(e.target.value)}
                  placeholder='U ......'
                  required
                  className={cellInput}
                />
              </td>
              <td className={td}>
                <input
                  value={motherNameEn}
                  onChange={(e) => setMotherNameEn(e.target.value)}
                  placeholder='Daw ......'
                  required
                  className={cellInput}
                />
              </td>
            </tr>

            {/* ── NRC ───────────────────────────────────────────── */}
            <tr style={{ minHeight: 110 }}>
              <td className={tdLabel} colSpan={2}>
                <span className='text-xs leading-tight'>
                  နိုင်ငံသားစိစစ်ရေး
                  <br />
                  ကတ်ပြားအမှတ်
                </span>
              </td>
              <td className={`${td} text-left`}>
                <NrcCell
                  value={studentNrc}
                  onChange={setStudentNrc}
                  expectedNrc='၁/ဇယသ(နိုင်)၀၂၄၀၂၃'
                />
              </td>
              <td className={`${td} text-left`}>
                <NrcCell value={fatherNrc} onChange={setFatherNrc} />
              </td>
              <td className={`${td} text-left`}>
                <NrcCell value={motherNrc} onChange={setMotherNrc} />
              </td>
            </tr>

            {/* ── Race ──────────────────────────────────────────── */}
            <tr>
              <td className={tdLabel} colSpan={2}>
                လူမျိုး
              </td>
              <td className={`${td} text-left`}>
                <RaceCell value={ethnicity} onChange={setEthnicity} />
              </td>
              <td className={`${td} text-left`}>
                <RaceCell value={fatherEthnicity} onChange={setFatherEthnicity} />
              </td>
              <td className={`${td} text-left`}>
                <RaceCell value={motherEthnicity} onChange={setMotherEthnicity} />
              </td>
            </tr>

            {/* ── Religion ──────────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={tdLabel} colSpan={2}>
                ကိုးကွယ်သည့်ဘာသာ
              </td>
              <td className={td}>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  required
                  className={`${cellSel} w-full`}
                >
                  <option value='' disabled>
                    --ရွေးချယ်ပါ--
                  </option>
                  {RELIGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
              <td className={td}>
                <select
                  value={fatherReligion}
                  onChange={(e) => setFatherReligion(e.target.value)}
                  required
                  className={`${cellSel} w-full`}
                >
                  <option value='' disabled>
                    --ရွေးချယ်ပါ--
                  </option>
                  {RELIGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
              <td className={td}>
                <select
                  value={motherReligion}
                  onChange={(e) => setMotherReligion(e.target.value)}
                  required
                  className={`${cellSel} w-full`}
                >
                  <option value='' disabled>
                    --ရွေးချယ်ပါ--
                  </option>
                  {RELIGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            {/* ── DOB ───────────────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={tdLabel} rowSpan={2}>
                ကျောင်းသား/
                <br />
                သူ
              </td>
              <td className={`${td} text-left`}>မွေးသက္ကရာဇ် (ရက်/လ/နှစ်)</td>
              <td className={td} colSpan={3}>
                <input
                  type='date'
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className={`${cellInput} w-auto`}
                  style={{ minWidth: 180 }}
                />
              </td>
            </tr>

            {/* ── Gender ────────────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={`${td} text-left`}>ကျား/မ</td>
              <td className={td} colSpan={3}>
                <div className='flex gap-6 justify-start pl-4'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='gender'
                      value='ကျား'
                      checked={gender === 'ကျား'}
                      onChange={(e) => setGender(e.target.value)}
                      className='w-4 h-4 accent-blue-600'
                    />
                    <span>ကျား</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='gender'
                      value='မ'
                      checked={gender === 'မ'}
                      onChange={(e) => setGender(e.target.value)}
                      className='w-4 h-4 accent-blue-600'
                    />
                    <span>မ</span>
                  </label>
                </div>
              </td>
            </tr>

            {/* ── Intake Year ───────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={tdLabel} rowSpan={3}>
                <span className='text-xs leading-tight'>
                  တက္ကသိုလ်ဝင်
                  <br />
                  စာမေးပွဲအောင်
                  <br />
                  မြင်သည့်
                </span>
              </td>
              <td className={`${td} text-left`}>ခုနှစ်</td>
              <td className={td} colSpan={3}>
                <div className='flex items-center gap-2 pl-2'>
                  <select
                    value={entryAcademicYear}
                    onChange={(e) => setEntryAcademicYear(e.target.value)}
                    required
                    className={`${cellSel}`}
                    style={{ width: 120 }}
                  >
                    <option value='' disabled>
                      --ရွေးချယ်ပါ--
                    </option>
                    {INTAKE_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {yearMsg && (
                    <span className='text-xs text-red-600 font-semibold'>
                      {yearMsg}
                    </span>
                  )}
                </div>
              </td>
            </tr>

            {/* ── Roll Number ───────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={`${td} text-left`}>ခုံအမှတ်</td>
              <td className={td} colSpan={3}>
                <div className='flex items-center gap-1 pl-2'>
                  <select
                    value={matriPlaceSelect}
                    onChange={(e) => setMatriPlaceSelect(e.target.value)}
                    required
                    className={cellSel}
                    style={{ width: 80 }}
                  >
                    <option value=''>---</option>
                    {MATRI_PLACE_CODES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className='text-gray-500'>-</span>
                  <input
                    type='text'
                    value={matriRollNumber}
                    onChange={(e) => setMatriRollNumber(e.target.value)}
                    disabled={!matriPlaceSelect || matriPlaceSelect !== 'နဇယ'}
                    placeholder='၁၁'
                    className={`${cellInput} w-20`}
                    required
                  />
                  {rollMsg && (
                    <span className='text-xs text-red-600 font-semibold'>
                      {rollMsg}
                    </span>
                  )}
                </div>
              </td>
            </tr>

            {/* ── Exam School ───────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={`${td} text-left`}>စာစစ်ဌာန</td>
              <td className={td} colSpan={3}>
                <div className='pl-2'>
                  <input
                    type='text'
                    value={highSchoolName}
                    onChange={(e) => setHighSchoolName(e.target.value)}
                    className={`${cellInput}`}
                    style={{ width: 320 }}
                    placeholder='အထက(၁)‌နေပြည်‌တော်(‌ဇေယျာသီရိ)'
                    required
                  />
                </div>
              </td>
            </tr>

            {/* ── Parent Occupation ─────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={tdLabel} colSpan={3}>
                မိဘအလုပ်အကိုင်
              </td>
              <td className={td}>
                <input
                  value={fatherJob}
                  onChange={(e) => setFatherJob(e.target.value)}
                  placeholder='ဝန်ထမ်း'
                  required
                  className={cellInput}
                />
              </td>
              <td className={td}>
                <input
                  value={motherJob}
                  onChange={(e) => setMotherJob(e.target.value)}
                  placeholder='မှီခို'
                  required
                  className={cellInput}
                />
              </td>
            </tr>

            {/* ── Parent Address ────────────────────────────────── */}
            <tr>
              <td className={tdLabel} rowSpan={2}>
                <span className='text-xs leading-tight'>
                  မိဘ/
                  <br />
                  အုပ်ထိန်းသူထံ
                  <br />
                  ဆက်သွယ်ရန်
                </span>
              </td>
              <td className={`${td} text-left`}>
                <span className='text-xs'>
                  လိပ်စာ
                  <br />
                  အပြည့်အစုံ
                </span>
              </td>
              <td className={td} colSpan={3}>
                <AddressCell
                  value={parentContact}
                  onChange={setParentContact}
                />
              </td>
            </tr>

            {/* ── Parent Phone ──────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={`${td} text-left`}>ဖုန်းနံပါတ်</td>
              <td className={td} colSpan={3}>
                <input
                  type='tel'
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder='091234567'
                  pattern='\d{7,11}'
                  required
                  className={`${cellInput} w-48`}
                />
              </td>
            </tr>

            {/* ── Student Address ───────────────────────────────── */}
            <tr>
              <td className={tdLabel} rowSpan={3}>
                <span className='text-xs leading-tight'>
                  ကျောင်းသား/
                  <br />
                  သူများထံ
                  <br />
                  ဆက်သွယ်ရန်
                </span>
              </td>
              <td className={`${td} text-left`}>
                <span className='text-xs'>
                  လိပ်စာ
                  <br />
                  အပြည့်အစုံ
                </span>
              </td>
              <td className={td} colSpan={3}>
                <AddressCell
                  value={studentContact}
                  onChange={setStudentContact}
                />
              </td>
            </tr>

            {/* ── Student Phone ─────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={`${td} text-left`}>ဖုန်းနံပါတ်</td>
              <td className={td} colSpan={3}>
                <input
                  type='tel'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder='091234567'
                  pattern='\d{7,11}'
                  required
                  className={`${cellInput} w-48`}
                />
              </td>
            </tr>

            {/* ── Email ─────────────────────────────────────────── */}
            <tr style={{ height: 50 }}>
              <td className={`${td} text-left`}>E-mail</td>
              <td className={td} colSpan={3}>
                <div className='flex items-center gap-2 pl-2'>
                  <input
                    type='email'
                    value={stdEmail}
                    onChange={(e) => setStdEmail(e.target.value)}
                    placeholder='example@email.com'
                    className={`${cellInput} w-64`}
                  />
                  {emailMsg.text && (
                    <span className={`text-xs font-semibold ${emailMsg.color}`}>
                      {emailMsg.text}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Signature section ─────────────────────────────────── */}
        <div className='flex justify-end mt-6 pr-4'>
          <div className='flex flex-col items-center gap-2'>
            <p className='text-sm'>လျှောက်ထားသူ လက်မှတ် -</p>
            <PhotoUploadBox
              label={'ကျောင်းသား/သူ\nလက်မှတ်တင်ရန်'}
              preview={sigPreview}
              onChange={handleSig}
            />
          </div>
        </div>
      </div>
      {/* /outer card */}

      {/* ── Submit button (outside card) ─────────────────────────── */}
      <div
        className='flex justify-end mt-5'
        style={{ maxWidth: 1000, margin: '20px auto 0' }}
      >
        <button
          type='submit'
          disabled={isSubmitting}
          className='flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-all'
        >
          {isSubmitting ? (
            <>
              <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              တင်သွင်းနေသည်...
            </>
          ) : (
            'တင်သွင်းရန်'
          )}
        </button>
      </div>
    </form>
  );
};
