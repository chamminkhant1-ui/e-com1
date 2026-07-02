import { useState, useEffect } from 'react';
import { FormSection } from './FormSection';
import { AddressSelector, type AddressValue } from './AddressSelector';
import { FormInput } from './FormFields';

interface ContactSectionProps {
  parentContact: AddressValue;
  onParentContactChange: (val: AddressValue) => void;
  parentPhone: string;
  onParentPhoneChange: (val: string) => void;

  studentContact: AddressValue;
  onStudentContactChange: (val: AddressValue) => void;
  stdPhone: string;
  onStdPhoneChange: (val: string) => void;

  stdEmail: string;
  onStdEmailChange: (val: string) => void;
}

export const ContactSection = ({
  parentContact,
  onParentContactChange,
  parentPhone,
  onParentPhoneChange,
  studentContact,
  onStudentContactChange,
  stdPhone,
  onStdPhoneChange,
  stdEmail,
  onStdEmailChange,
}: ContactSectionProps) => {
  const [emailStatus, setEmailStatus] = useState<{
    message: string;
    type: 'idle' | 'loading' | 'success' | 'warning' | 'error';
  }>({ message: '', type: 'idle' });

  // Check email validation
  useEffect(() => {
    if (!stdEmail) {
      setEmailStatus({ message: '', type: 'idle' });
      return;
    }

    // Basic regex check before API call
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(stdEmail)) {
      setEmailStatus({ message: 'Invalid email format.', type: 'error' });
      return;
    }

    setEmailStatus({ message: 'Checking email...', type: 'loading' });
    const timer = setTimeout(() => {
      fetch('/api/locations/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: stdEmail }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (!data.is_valid) {
            setEmailStatus({ message: 'Invalid email format.', type: 'error' });
          } else if (!data.is_verified) {
            setEmailStatus({ message: 'Email domain/server not verified.', type: 'warning' });
          } else {
            setEmailStatus({ message: 'Valid and verified email.', type: 'success' });
          }
        })
        .catch(() => {
          setEmailStatus({ message: 'Error checking email.', type: 'error' });
        });
    }, 500); // debounce API call

    return () => clearTimeout(timer);
  }, [stdEmail]);

  return (
    <FormSection title="ဆက်သွယ်ရန်လိပ်စာနှင့် ဖုန်းနံပါတ်များ" icon="perm_contact_calendar">
      {/* Parent Contact */}
      <div className="mb-6 flex flex-col gap-4">
        <AddressSelector
          label="မိဘ/အုပ်ထိန်းသူထံ ဆက်သွယ်ရန် လိပ်စာအပြည့်အစုံ"
          value={parentContact}
          onChange={onParentContactChange}
          stateId="pState"
          districtId="pDistrict"
          townshipId="pTownship"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="မိဘ/အုပ်ထိန်းသူ ဖုန်းနံပါတ်"
            placeholder="091234567"
            type="tel"
            value={parentPhone}
            onChange={(e) => onParentPhoneChange(e.target.value)}
          />
        </div>
      </div>

      <div className="h-px bg-white/10 my-6" />

      {/* Student Contact */}
      <div className="flex flex-col gap-4">
        <AddressSelector
          label="ကျောင်းသား/သူထံ ဆက်သွယ်ရန် လိပ်စာအပြည့်အစုံ"
          value={studentContact}
          onChange={onStudentContactChange}
          stateId="sState"
          districtId="sDistrict"
          townshipId="sTownship"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="ကျောင်းသား/သူ ဖုန်းနံပါတ်"
            placeholder="091234567"
            type="tel"
            value={stdPhone}
            onChange={(e) => onStdPhoneChange(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <FormInput
              label="ကျောင်းသား/သူ၏ E-mail လိပ်စာ"
              placeholder="example@email.com"
              type="email"
              value={stdEmail}
              onChange={(e) => onStdEmailChange(e.target.value)}
            />
            {emailStatus.message && (
              <p
                className={`text-xs font-semibold mt-1 ${
                  emailStatus.type === 'success'
                    ? 'text-green-400'
                    : emailStatus.type === 'warning'
                    ? 'text-yellow-400'
                    : emailStatus.type === 'error'
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}
              >
                {emailStatus.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </FormSection>
  );
};
