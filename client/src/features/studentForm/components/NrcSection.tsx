import { FormSection } from './FormSection';
import { NrcInput, type NrcValue } from './NrcInput';

interface NrcSectionProps {
  nrcStd: NrcValue;
  onNrcStdChange: (val: NrcValue) => void;
  expectedStdNrc?: string;

  nrcDad: NrcValue;
  onNrcDadChange: (val: NrcValue) => void;

  nrcMum: NrcValue;
  onNrcMumChange: (val: NrcValue) => void;
}

export const NrcSection = ({
  nrcStd,
  onNrcStdChange,
  expectedStdNrc = '၉/ဇယသ(နိုင်)၀၂၄၀၇၃',
  nrcDad,
  onNrcDadChange,
  nrcMum,
  onNrcMumChange,
}: NrcSectionProps) => {
  return (
    <FormSection title="နိုင်ငံသားစိစစ်ရေးကတ်ပြားအမှတ်" icon="contact_emergency">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <NrcInput
          label="ကျောင်းသား/သူ"
          value={nrcStd}
          onChange={onNrcStdChange}
          expectedNrc={expectedStdNrc}
        />
        <NrcInput
          label="ဖခင်"
          value={nrcDad}
          onChange={onNrcDadChange}
        />
        <NrcInput
          label="မိခင်"
          value={nrcMum}
          onChange={onNrcMumChange}
        />
      </div>
    </FormSection>
  );
};
