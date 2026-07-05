import { useState, useEffect } from 'react';
import { toMyanmarDigits } from '../utils/myanmarDigits';

interface MatriValidationResult {
  /** Validation message for intake year (empty when valid/idle) */
  yearMsg: string;
  /** Validation message for roll number (empty when valid/idle) */
  rollMsg: string;
}

/**
 * Validates intake year and matriculation roll number against expected values.
 * Returns human-readable error messages when values don't match.
 */
export const useMatriValidation = (
  intakeYear: string,
  matriPlaceSelect: string,
  matriRollNumber: string,
  onClearRollFields?: () => void,
  expectedIntakeYear = '၂၀၂၅',
  expectedMatriPrefix = 'နဇယ',
): MatriValidationResult => {
  const [yearMsg, setYearMsg] = useState('');
  const [rollMsg, setRollMsg] = useState('');

  // Validate intake year
  useEffect(() => {
    if (!intakeYear) {
      setYearMsg('');
      return;
    }
    setYearMsg(
      intakeYear !== expectedIntakeYear
        ? '❌ ရွေးချယ်ထားသောအချက်အလက်နှင့် မကိုက်ညီပါ။'
        : '',
    );
  }, [intakeYear, expectedIntakeYear]);

  // Validate matri place prefix
  useEffect(() => {
    if (!matriPlaceSelect) {
      setRollMsg('');
      return;
    }
    if (matriPlaceSelect !== expectedMatriPrefix) {
      setRollMsg('❌ ရွေးချယ်ထားသောအချက်အလက် မကိုက်ညီမှု မရှိပါ။');
      onClearRollFields?.();
      return;
    }
    setRollMsg('');
  }, [matriPlaceSelect, expectedMatriPrefix, onClearRollFields]);

  // Validate roll number
  useEffect(() => {
    if (!matriRollNumber) return;
    setRollMsg(
      toMyanmarDigits(matriRollNumber) !== '၂၇'
        ? '❌ ခုံနံပါတ်မှားယွင်းနေပါသည်။'
        : '',
    );
  }, [matriRollNumber]);

  return { yearMsg, rollMsg };
};
