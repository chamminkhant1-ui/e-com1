import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { useStudentFormContext } from '../hooks/useStudentForm';
import {
  RELIGIONS,
  INTAKE_YEARS,
  MATRI_PLACE_CODES,
  MYANMAR_RACES,
} from '../data/formConstants';
import { NrcInput } from './NrcInput';

import { AddressSelector } from './AddressSelector';
import { PhotoUpload } from './PhotoUpload';
import { toMyanmarDigits, toMyanmarNumber } from '../utils/myanmarDigits';

/* ─── shared cell-level styles (light table theme) ──────────────────── */
const cellSel =
  'border border-gray-500 bg-white text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400';
const cellInput =
  'w-full border border-gray-400 bg-white text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 box-border';
const td = 'border border-black px-2 py-1 text-sm align-middle';
const tdLabel = `${td} text-center font-medium`;

/* ─── Enrollment Metadata Table ─────────────────────────────────────── */
export const EnrollmentSection = () => {
  const { entrance } = useStudentFormContext();
  const serverDate = useMemo(() => new Date().toISOString(), []);

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

  return (
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
  );
};

/* ─── Names Row ─────────────────────────────────────────────────────── */
export const NamesRow = () => {
  const {
    form: { register },
    entrance,
  } = useStudentFormContext();
  const nameMm = entrance?.applicantNameMm ?? '';
  const fatherNameMm = entrance?.fatherNameMm ?? '';

  return (
    <>
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
            {...register('motherNameMm')}
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
            {...register('nameEn')}
            placeholder='Mg/Ma ......'
            required
            className={cellInput}
          />
        </td>
        <td className={td}>
          <input
            {...register('fatherNameEn')}
            placeholder='U ......'
            required
            className={cellInput}
          />
        </td>
        <td className={td}>
          <input
            {...register('motherNameEn')}
            placeholder='Daw ......'
            required
            className={cellInput}
          />
        </td>
      </tr>
    </>
  );
};

/* ─── NRC Row ───────────────────────────────────────────────────────── */
export const NrcRow = () => {
  const {
    form: { control },
    entrance,
  } = useStudentFormContext();
  const EXPECTED_STUDENT_NRC = entrance?.nrcNumber ?? '';

  return (
    <tr style={{ minHeight: 110 }}>
      <td className={tdLabel} colSpan={2}>
        <span className='text-xs leading-tight'>
          နိုင်ငံသားစိစစ်ရေး
          <br />
          ကတ်ပြားအမှတ်
        </span>
      </td>
      <td className={`${td} text-left`}>
        <Controller
          name='studentNrc'
          control={control}
          render={({ field }) => (
            <NrcInput
              value={field.value}
              onChange={field.onChange}
              expectedNrc={EXPECTED_STUDENT_NRC}
            />
          )}
        />
      </td>
      <td className={`${td} text-left`}>
        <Controller
          name='fatherNrc'
          control={control}
          render={({ field }) => (
            <NrcInput value={field.value} onChange={field.onChange} />
          )}
        />
      </td>
      <td className={`${td} text-left`}>
        <Controller
          name='motherNrc'
          control={control}
          render={({ field }) => (
            <NrcInput value={field.value} onChange={field.onChange} />
          )}
        />
      </td>
    </tr>
  );
};

/* ─── Race Row ──────────────────────────────────────────────────────── */
export const RaceRow = () => {
  const {
    form: { register },
  } = useStudentFormContext();

  return (
    <tr>
      <td className={tdLabel} colSpan={2}>
        လူမျိုး
      </td>
      <td className={`${td} text-left`}>
        <select {...register('ethnicity')} className={`${cellSel} w-full`}>
          <option value=''>---</option>
          {MYANMAR_RACES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className={`${td} text-left`}>
        <select
          {...register('fatherEthnicity')}
          className={`${cellSel} w-full`}
        >
          <option value=''>---</option>
          {MYANMAR_RACES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className={`${td} text-left`}>
        <select
          {...register('motherEthnicity')}
          className={`${cellSel} w-full`}
        >
          <option value=''>---</option>
          {MYANMAR_RACES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
};

/* ─── Religion Row ──────────────────────────────────────────────────── */
export const ReligionRow = () => {
  const {
    form: { register },
  } = useStudentFormContext();

  return (
    <tr style={{ height: 50 }}>
      <td className={tdLabel} colSpan={2}>
        ကိုးကွယ်သည့်ဘာသာ
      </td>
      <td className={td}>
        <select
          {...register('religion')}
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
          {...register('fatherReligion')}
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
          {...register('motherReligion')}
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
  );
};

/* ─── Personal Rows (DOB, Gender) ───────────────────────────────────── */
export const PersonalRows = () => {
  const {
    form: { register },
  } = useStudentFormContext();

  return (
    <>
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
            {...register('dob')}
            required
            className={`${cellInput} w-auto`}
            style={{ minWidth: 180 }}
          />
        </td>
      </tr>
      <tr style={{ height: 50 }}>
        <td className={`${td} text-left`}>ကျား/မ</td>
        <td className={td} colSpan={3}>
          <div className='flex gap-6 justify-start pl-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                value='ကျား'
                {...register('gender')}
                className='w-4 h-4 accent-blue-600'
              />
              <span>ကျား</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                value='မ'
                {...register('gender')}
                className='w-4 h-4 accent-blue-600'
              />
              <span>မ</span>
            </label>
          </div>
        </td>
      </tr>
    </>
  );
};

/* ─── Matriculation Rows ────────────────────────────────────────────── */
export const MatriculationRows = () => {
  const {
    form: { register, watch },
    entrance,
    yearMsg,
    rollMsg,
    clearRollFields,
  } = useStudentFormContext();

  const matriPlaceSelect = watch('matriPlaceSelect');

  return (
    <>
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
              {...register('entryAcademicYear')}
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
      <tr style={{ height: 50 }}>
        <td className={`${td} text-left`}>ခုံအမှတ်</td>
        <td className={td} colSpan={3}>
          <div className='flex items-center gap-1 pl-2'>
            <select
              {...register('matriPlaceSelect', {
                onChange: (e) => {
                  const val = e.target.value;
                  if (val && val !== entrance?.matricExamRollNo.split('-')[0]) {
                    clearRollFields();
                  }
                },
              })}
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
              {...register('matriRollNumber', {
                onChange: (e) => {
                  e.target.value = toMyanmarDigits(e.target.value);
                },
              })}
              disabled={!matriPlaceSelect}
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
      <tr style={{ height: 50 }}>
        <td className={`${td} text-left`}>စာစစ်ဌာန</td>
        <td className={td} colSpan={3}>
          <div className='pl-2'>
            <input
              type='text'
              {...register('highSchoolName')}
              className={`${cellInput}`}
              style={{ width: 320 }}
              placeholder='အထက(၁)‌နေပြည်‌တော်(‌ဇေယျာသီရိ)'
              required
            />
          </div>
        </td>
      </tr>
    </>
  );
};

/* ─── Parent Occupation Row ─────────────────────────────────────────── */
export const ParentOccupationRow = () => {
  const {
    form: { register },
  } = useStudentFormContext();

  return (
    <tr style={{ height: 50 }}>
      <td className={tdLabel} colSpan={3}>
        မိဘအလုပ်အကိုင်
      </td>
      <td className={td}>
        <input
          {...register('fatherJob')}
          placeholder='ဝန်ထမ်း'
          required
          className={cellInput}
        />
      </td>
      <td className={td}>
        <input
          {...register('motherJob')}
          placeholder='မှီခို'
          required
          className={cellInput}
        />
      </td>
    </tr>
  );
};

/* ─── Contact Rows ──────────────────────────────────────────────────── */
export const ContactRows = () => {
  const {
    form: { register, control },
    emailMsg,
    parentPhoneMsg,
    studentPhoneMsg,
  } = useStudentFormContext();

  return (
    <>
      {/* Parent Address */}
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
          <Controller
            name='parentContact'
            control={control}
            render={({ field }) => (
              <AddressSelector value={field.value} onChange={field.onChange} />
            )}
          />
        </td>
      </tr>

      {/* Parent Phone */}
      <tr style={{ height: 50 }}>
        <td className={`${td} text-left`}>ဖုန်းနံပါတ်</td>
        <td className={td} colSpan={3}>
          <div className='flex items-center gap-2 pl-2'>
            <input
              type='tel'
              {...register('parentPhone', {
                onChange: (e) => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length > 11) val = val.slice(0, 11);
                  e.target.value = val;
                },
              })}
              placeholder='091234567'
              pattern='[0-9]{8,11}'
              required
              className={`${cellInput} w-48`}
            />
            {parentPhoneMsg.text && (
              <span className={`text-xs font-semibold ${parentPhoneMsg.color}`}>
                {parentPhoneMsg.text}
              </span>
            )}
          </div>
        </td>
      </tr>

      {/* Student Address */}
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
          <Controller
            name='studentContact'
            control={control}
            render={({ field }) => (
              <AddressSelector value={field.value} onChange={field.onChange} />
            )}
          />
        </td>
      </tr>

      {/* Student Phone */}
      <tr style={{ height: 50 }}>
        <td className={`${td} text-left`}>ဖုန်းနံပါတ်</td>
        <td className={td} colSpan={3}>
          <div className='flex items-center gap-2 pl-2'>
            <input
              type='tel'
              {...register('phoneNumber', {
                onChange: (e) => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length > 11) val = val.slice(0, 11);
                  e.target.value = val;
                },
              })}
              placeholder='091234567'
              pattern='[0-9]{8,11}'
              required
              className={`${cellInput} w-48`}
            />
            {studentPhoneMsg.text && (
              <span
                className={`text-xs font-semibold ${studentPhoneMsg.color}`}
              >
                {studentPhoneMsg.text}
              </span>
            )}
          </div>
        </td>
      </tr>

      {/* Email */}
      <tr style={{ height: 50 }}>
        <td className={`${td} text-left`}>E-mail</td>
        <td className={td} colSpan={3}>
          <div className='flex items-center gap-2 pl-2'>
            <input
              type='email'
              {...register('stdEmail')}
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
    </>
  );
};

/* ─── Signature Section ──────────────────────────────────────────────── */
export const SignatureSection = () => {
  const { sigPreview, setSigPreview } = useStudentFormContext();

  const handleSigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      const r = new FileReader();
      r.onload = () => setSigPreview(r.result as string);
      r.readAsDataURL(f);
    } else {
      setSigPreview('');
    }
  };

  return (
    <div className='flex justify-end mt-6 pr-4'>
      <div className='flex flex-col items-center gap-2'>
        <p className='text-sm'>လျှောက်ထားသူ လက်မှတ် -</p>
        <PhotoUpload
          label={'ကျောင်းသား/သူ\nလက်မှတ်တင်ရန်'}
          preview={sigPreview}
          onChange={handleSigChange}
        />
      </div>
    </div>
  );
};
