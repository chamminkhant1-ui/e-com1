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
  _onClearRollFields?: () => void, // Unused parameter, kept for signature compatibility
  expectedIntakeYear: string = '',
  expectedMatriPrefix: string = '',
  expectedMatriRollNo: string = '',
): MatriValidationResult => {
  const yearMsg =
    intakeYear && intakeYear !== expectedIntakeYear
      ? '❌ ရွေးချယ်ထားသောအချက်အလက်နှင့် မကိုက်ညီပါ။'
      : '';

  const rollMsg = (() => {
    if (!matriPlaceSelect) return '';
    if (matriPlaceSelect !== expectedMatriPrefix) {
      console.log(expectedMatriPrefix);
      return '❌ ရွေးချယ်ထားသောအချက်အလက် မကိုက်ညီမှု မရှိပါ။';
    }
    if (!matriRollNumber) return '';
    return toMyanmarDigits(matriRollNumber) !== expectedMatriRollNo
      ? '❌ ခုံနံပါတ်မှားယွင်းနေပါသည်။'
      : '';
  })();

  return { yearMsg, rollMsg };
};
