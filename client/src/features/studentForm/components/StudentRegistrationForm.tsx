import { useState, useMemo, useCallback } from 'react';
import {
  RELIGIONS,
  INTAKE_YEARS,
  MATRI_PLACE_CODES,
} from '../data/formConstants';
import type { NrcValue } from './NrcInput';
import { NrcInput } from './NrcInput';
import type { RaceValue } from './RaceSelector';
import { RaceSelector } from './RaceSelector';
import type { AddressValue } from './AddressSelector';
import { AddressSelector } from './AddressSelector';
import { PhotoUpload } from './PhotoUpload';
import { toMyanmarNumber } from '../utils/myanmarDigits';
import { useEmailValidation } from '../hooks/useEmailValidation';
import { useMatriValidation } from '../hooks/useMatriValidation';
import { useEntranceQuery } from '@/features/entrance/hooks/useEntranceQueries';

/* ─── shared cell-level styles (light table theme) ──────────────────── */
const cellSel =
  'border border-gray-500 bg-white text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';
const cellInput =
  'w-full border border-gray-400 bg-white text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 box-border';
const td = 'border border-black px-2 py-1 text-sm align-middle';
const tdLabel = `${td} text-center font-medium`;

/* ─── constants ──────────────────────────────────────────────────────── */
const EMPTY_NRC: NrcValue = { region: '', city: '', prefix: '', number: '' };
const EMPTY_RACE: RaceValue = { r1: '', r2: '', r3: '' };
const EMPTY_ADDR: AddressValue = {
  state: '',
  district: '',
  township: '',
  address: '',
};

/** Map Myanmar gender label to the DB enum value expected by the backend. */
const GENDER_MAP: Record<string, 'M' | 'F' | 'Other'> = {
  ကျား: 'M',
  မ: 'F',
};

/* ═══════════════════════════════════════════════════════════════════════
   Main Form Component
   ═══════════════════════════════════════════════════════════════════════ */
interface StudentRegistrationFormProps {
  onSubmitSuccess: (data: unknown) => void;
  isSubmitting?: boolean;
}

export const StudentRegistrationForm = ({
  onSubmitSuccess,
  isSubmitting = false,
}: StudentRegistrationFormProps) => {
  /* ── Fetch entrance record from backend ───────────────────────── */
  const {
    data: entrance,
    isLoading: isEntranceLoading,
    isError: isEntranceError,
  } = useEntranceQuery(true);

  const EXPECTED_STUDENT_NRC = entrance?.nrcNumber ?? '';

  /* ── server date ─────────────────────────────────────────────────── */
  const serverDate = new Date().toISOString();

  /* ── enrollment (read-only, derived from entrance) ──────────────── */
  const enrollment = useMemo(() => {
    const dateObj = new Date(serverDate);
    const registrationDate = `${toMyanmarNumber(dateObj.getDate())}-${toMyanmarNumber(
      dateObj.getMonth() + 1,
    )}-${toMyanmarNumber(dateObj.getFullYear())}`;

    return {
      registrationDate,
      yearLevel: 'ပထမနှစ်',
      acYear: '၂၀၂၅-၂၀၂၆',
      admissionId: entrance?.applicationNo ?? 'null',
    };
  }, [entrance, serverDate]);

  /* ── names ───────────────────────────────────────────────────────── */
  // Student and father Myanmar names are read-only, pre-filled from entrance record.
  const nameMm = entrance?.applicantNameMm ?? '';
  const fatherNameMm = entrance?.fatherNameMm ?? '';
  const [motherNameMm, setMotherNameMm] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [fatherNameEn, setFatherNameEn] = useState('');
  const [motherNameEn, setMotherNameEn] = useState('');

  /* ── NRC ─────────────────────────────────────────────────────────── */
  const [studentNrc, setStudentNrc] = useState<NrcValue>(EMPTY_NRC);
  const [fatherNrc, setFatherNrc] = useState<NrcValue>(EMPTY_NRC);
  const [motherNrc, setMotherNrc] = useState<NrcValue>(EMPTY_NRC);

  /* ── race ────────────────────────────────────────────────────────── */
  const [ethnicity, setEthnicity] = useState<RaceValue>(EMPTY_RACE);
  const [fatherEthnicity, setFatherEthnicity] = useState<RaceValue>(EMPTY_RACE);
  const [motherEthnicity, setMotherEthnicity] = useState<RaceValue>(EMPTY_RACE);

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

  const clearRollFields = useCallback(() => {
    setHighSchoolName('');
    setMatriRollNumber('');
  }, []);

  const { yearMsg, rollMsg } = useMatriValidation(
    entryAcademicYear,
    matriPlaceSelect,
    matriRollNumber,
    clearRollFields,
  );

  /* ── occupations ─────────────────────────────────────────────────── */
  const [fatherJob, setFatherJob] = useState('');
  const [motherJob, setMotherJob] = useState('');

  /* ── contact ─────────────────────────────────────────────────────── */
  const [parentContact, setParentContact] = useState<AddressValue>(EMPTY_ADDR);
  const [parentPhone, setParentPhone] = useState('');
  const [studentContact, setStudentContact] =
    useState<AddressValue>(EMPTY_ADDR);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stdEmail, setStdEmail] = useState('');

  const emailMsg = useEmailValidation(stdEmail);

  /* ── photo / signature ───────────────────────────────────────────── */
  const [photoPreview, setPhotoPreview] = useState('');
  const [sigPreview, setSigPreview] = useState('');

  /* ── form-level error ────────────────────────────────────────────── */
  const [formError, setFormError] = useState('');

  /* ─── file helpers ────────────────────────────────────────────── */
  const readPreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (s: string) => void,
  ) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      const r = new FileReader();
      r.onload = () => setPreview(r.result as string);
      r.readAsDataURL(f);
    } else {
      setPreview('');
    }
  };
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) =>
    readPreview(e, setPhotoPreview);
  const handleSig = (e: React.ChangeEvent<HTMLInputElement>) =>
    readPreview(e, setSigPreview);

  /* ─── submit ──────────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation warning/error checks
    if (stdEmail && emailMsg.text && emailMsg.color.includes('text-red-600')) {
      setFormError('အီးမေးလ်ပုံစံ မှားယွင်းနေပါသည်။ ❌');
      return;
    }
    if (yearMsg) {
      setFormError(yearMsg);
      return;
    }
    if (rollMsg) {
      setFormError(rollMsg);
      return;
    }

    // Basic required-field checks
    if (!nameEn.trim()) {
      setFormError('ကျောင်းသား/သူ အင်္ဂလိပ်အမည် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!motherNameMm.trim() || !motherNameEn.trim()) {
      setFormError('မိခင်အမည် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }

    const nrcFilled = (n: NrcValue) =>
      !!(n.region && n.city && n.prefix && n.number);
    if (!nrcFilled(studentNrc)) {
      setFormError('ကျောင်းသား/သူ NRC ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!nrcFilled(fatherNrc)) {
      setFormError('အဘ NRC ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!nrcFilled(motherNrc)) {
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
      setFormError(
        'တက္ကသိုလ်ဝင်တန်းအောင်မြင်သည့် ခုနှစ် ရွေးချယ်ရန် လိုအပ်ပါသည်။ ❌',
      );
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

    const addrFilled = (a: AddressValue) =>
      !!(a.state && a.district && a.township && a.address.trim());
    if (!addrFilled(parentContact)) {
      setFormError('မိဘ လိပ်စာ အပြည့်အစုံ ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!parentPhone.trim()) {
      setFormError('မိဘ ဖုန်းနံပါတ် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!addrFilled(studentContact)) {
      setFormError('ကျောင်းသား/သူ လိပ်စာ အပြည့်အစုံ ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError('ကျောင်းသား/သူ ဖုန်းနံပါတ် ဖြည့်ရန် လိုအပ်ပါသည်။ ❌');
      return;
    }

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
      gender: GENDER_MAP[gender] ?? 'Other',

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

  /* ─── loading / error guards ─────────────────────────────────── */
  if (isEntranceLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-8 w-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent' />
          <p className='text-sm font-medium tracking-wide text-gray-500'>
            ခုံစာရင်းရယူနေပါသည်...
          </p>
        </div>
      </div>
    );
  }

  if (isEntranceError || !entrance) {
    return (
      <div className='flex min-h-[400px] items-center justify-center px-4'>
        <div className='w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z'
              />
            </svg>
          </div>
          <h3 className='text-base font-semibold text-red-700 mb-1'>
            ခုံစာရင်း ရှာမတွေ့ပါ။
          </h3>
          <p className='text-sm text-red-600'>
            ကျေးဇူးပြု၍ နောက်တစ်ကြိမ် ကြိုးစားပါ။
          </p>
        </div>
      </div>
    );
  }

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
            <PhotoUpload
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
                <NrcInput
                  variant='light'
                  value={studentNrc}
                  onChange={setStudentNrc}
                  expectedNrc={EXPECTED_STUDENT_NRC}
                />
              </td>
              <td className={`${td} text-left`}>
                <NrcInput
                  variant='light'
                  value={fatherNrc}
                  onChange={setFatherNrc}
                />
              </td>
              <td className={`${td} text-left`}>
                <NrcInput
                  variant='light'
                  value={motherNrc}
                  onChange={setMotherNrc}
                />
              </td>
            </tr>

            {/* ── Race ──────────────────────────────────────────── */}
            <tr>
              <td className={tdLabel} colSpan={2}>
                လူမျိုး
              </td>
              <td className={`${td} text-left`}>
                <RaceSelector
                  variant='light'
                  value={ethnicity}
                  onChange={setEthnicity}
                />
              </td>
              <td className={`${td} text-left`}>
                <RaceSelector
                  variant='light'
                  value={fatherEthnicity}
                  onChange={setFatherEthnicity}
                />
              </td>
              <td className={`${td} text-left`}>
                <RaceSelector
                  variant='light'
                  value={motherEthnicity}
                  onChange={setMotherEthnicity}
                />
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setMatriPlaceSelect(val);
                      if (val && val !== 'နဇယ') {
                        clearRollFields();
                      }
                    }}
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
                <AddressSelector
                  variant='light'
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
                <AddressSelector
                  variant='light'
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
            <PhotoUpload
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
