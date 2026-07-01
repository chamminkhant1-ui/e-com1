import { FormSection } from './FormSection';
import { FormInput } from './FormFields';

interface EnrollmentInfoProps {
  registrationDate: string;
  yearLevel: string;
  acYear: string;
  admissionId: string;
}

export const EnrollmentInfo = ({
  registrationDate,
  yearLevel,
  acYear,
  admissionId,
}: EnrollmentInfoProps) => (
  <FormSection title="မှတ်ပုံတင်အချက်အလက်" icon="school">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <FormInput
        label="ကျောင်းအပ်သည့်ရက်စွဲ"
        value={registrationDate}
        readOnly
        onChange={() => {}}
      />
      <FormInput label="အတန်း" value={yearLevel} readOnly onChange={() => {}} />
      <FormInput label="ပညာသင်နှစ်" value={acYear} readOnly onChange={() => {}} />
      <FormInput label="ဝင်ခွင့်အမှတ်စဥ်" value={admissionId} readOnly onChange={() => {}} />
    </div>
  </FormSection>
);
