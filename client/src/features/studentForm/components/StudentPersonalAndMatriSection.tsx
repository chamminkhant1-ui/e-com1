import { useState, useEffect } from 'react';
import { FormSection } from './FormSection';
import { FormInput, FormSelect } from './FormFields';
import { INTAKE_YEARS, MATRI_PLACE_CODES } from '../data/formConstants';

interface StudentPersonalAndMatriSectionProps {
  stdDob: string;
  onStdDobChange: (val: string) => void;
  stdGender: string;
  onStdGenderChange: (val: string) => void;

  intakeYear: string;
  onIntakeYearChange: (val: string) => void;
  matriPlaceSelect: string;
  onMatriPlaceSelectChange: (val: string) => void;
  matriRollNumber: string;
  onMatriRollNumberChange: (val: string) => void;
  stdMatPassSchool: string;
  onStdMatPassSchoolChange: (val: string) => void;

  dadWork: string;
  onDadWorkChange: (val: string) => void;
  mumWork: string;
  onMumWorkChange: (val: string) => void;

  expectedIntakeYear?: string;
  expectedMatriPrefix?: string;
  expectedRollNumber?: string;
}

export const StudentPersonalAndMatriSection = ({
  stdDob,
  onStdDobChange,
  stdGender,
  onStdGenderChange,
  intakeYear,
  onIntakeYearChange,
  matriPlaceSelect,
  onMatriPlaceSelectChange,
  matriRollNumber,
  onMatriRollNumberChange,
  stdMatPassSchool,
  onStdMatPassSchoolChange,
  dadWork,
  onDadWorkChange,
  mumWork,
  onMumWorkChange,
  expectedIntakeYear = '၂၀၂၅',
  expectedMatriPrefix = 'နဇယ',
  expectedRollNumber = '၂၇',
}: StudentPersonalAndMatriSectionProps) => {
  const [yearValidationMsg, setYearValidationMsg] = useState('');
  const [rollValidationMsg, setRollValidationMsg] = useState('');

  // Validate Intake Year
  useEffect(() => {
    if (!intakeYear) return;
    if (intakeYear !== expectedIntakeYear) {
      setYearValidationMsg('❌ ရွေးချယ်ထားသောအချက်အလက်နှင့် စနစ်ရှိအချက်အလက် မကိုက်ညီပါ။');
    } else {
      setYearValidationMsg('');
    }
  }, [intakeYear, expectedIntakeYear]);

  // Load Exam Place / School when matriPrefix matches
  useEffect(() => {
    if (!matriPlaceSelect) {
      return;
    }

    if (matriPlaceSelect !== expectedMatriPrefix) {
      setRollValidationMsg('❌ ရွေးချယ်ထားသောအချက်အလက် မကိုက်ညီမှု မရှိပါ။');
      onStdMatPassSchoolChange('');
      onMatriRollNumberChange('');
      return;
    }

    setRollValidationMsg('');
  }, [matriPlaceSelect, expectedMatriPrefix]);

  // Validate Roll Number
  useEffect(() => {
    if (!matriRollNumber) return;
    // Helper to convert digits to Myanmar numbers
    const toMyanmarNumber = (eng: string) => {
      const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
      return eng.replace(/[0-9]/g, (d) => myanmarDigits[parseInt(d, 10)]);
    };

    const inputMyan = toMyanmarNumber(matriRollNumber);
    if (inputMyan !== expectedRollNumber) {
      setRollValidationMsg('❌ ခုံနံပါတ်မှားယွင်းနေပါသည်။');
    } else {
      setRollValidationMsg('');
    }
  }, [matriRollNumber, expectedRollNumber]);

  return (
    <FormSection title="ကိုယ်ရေးအချက်အလက်နှင့် တက္ကသိုလ်ဝင်တန်းအောင်မြင်မှု" icon="history_edu">
      {/* Student Birth and Gender */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormInput
          type="date"
          label="မွေးသက္ကရာဇ်"
          value={stdDob}
          onChange={(e) => onStdDobChange(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-300">ကျား/မ</label>
          <div className="flex gap-6 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
              <input
                type="radio"
                name="gender"
                value="ကျား"
                checked={stdGender === 'ကျား'}
                onChange={(e) => onStdGenderChange(e.target.value)}
                className="h-4 w-4 accent-indigo-500"
              />
              <span>ကျား</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
              <input
                type="radio"
                name="gender"
                value="မ"
                checked={stdGender === 'မ'}
                onChange={(e) => onStdGenderChange(e.target.value)}
                className="h-4 w-4 accent-indigo-500"
              />
              <span>မ</span>
            </label>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10 my-5" />

      {/* Matriculation Year, Roll prefix, Roll number */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <FormSelect
            label="အောင်မြင်သည့်ခုနှစ်"
            options={INTAKE_YEARS}
            value={intakeYear}
            onChange={onIntakeYearChange}
          />
          {yearValidationMsg && (
            <p className="mt-1 text-xs text-red-400 font-semibold">{yearValidationMsg}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-300">ခုံအမှတ်</label>
          <div className="flex gap-2">
            <select
              value={matriPlaceSelect}
              onChange={(e) => onMatriPlaceSelectChange(e.target.value)}
              className="rounded-xl border border-white/15 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all w-24 shrink-0"
            >
              <option value="">---</option>
              {MATRI_PLACE_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <FormInput
              label=""
              placeholder="၁၁"
              value={matriRollNumber}
              disabled={!matriPlaceSelect || matriPlaceSelect !== expectedMatriPrefix}
              onChange={(e) => onMatriRollNumberChange(e.target.value)}
              className="flex-1"
            />
          </div>
          {rollValidationMsg && (
            <p className="mt-1 text-xs text-red-400 font-semibold">{rollValidationMsg}</p>
          )}
        </div>

        <div>
          <FormInput
            label="စာစစ်ဌာန"
            placeholder="အထက(၁)‌နေပြည်‌တော်(‌ဇေယျာသီရိ)"
            value={stdMatPassSchool}
            onChange={(e) => onStdMatPassSchoolChange(e.target.value)}
          />
        </div>
      </div>

      <div className="h-px bg-white/10 my-5" />

      {/* Parents' Work */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormInput
          label="ဖခင် အလုပ်အကိုင်"
          placeholder="ဝန်ထမ်း"
          value={dadWork}
          onChange={(e) => onDadWorkChange(e.target.value)}
        />
        <FormInput
          label="မိခင် အလုပ်အကိုင်"
          placeholder="မှီခို"
          value={mumWork}
          onChange={(e) => onMumWorkChange(e.target.value)}
        />
      </div>
    </FormSection>
  );
};
