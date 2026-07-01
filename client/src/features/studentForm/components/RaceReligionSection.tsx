import { FormSection } from './FormSection';
import { RaceSelector, type RaceValue } from './RaceSelector';
import { FormSelect } from './FormFields';
import { RELIGIONS } from '../data/formConstants';

interface RaceReligionSectionProps {
  raceStd: RaceValue;
  onRaceStdChange: (val: RaceValue) => void;
  raceDad: RaceValue;
  onRaceDadChange: (val: RaceValue) => void;
  raceMum: RaceValue;
  onRaceMumChange: (val: RaceValue) => void;

  stdReligion: string;
  onStdReligionChange: (val: string) => void;
  dadReligion: string;
  onDadReligionChange: (val: string) => void;
  mumReligion: string;
  onMumReligionChange: (val: string) => void;
}

export const RaceReligionSection = ({
  raceStd,
  onRaceStdChange,
  raceDad,
  onRaceDadChange,
  raceMum,
  onRaceMumChange,
  stdReligion,
  onStdReligionChange,
  dadReligion,
  onDadReligionChange,
  mumReligion,
  onMumReligionChange,
}: RaceReligionSectionProps) => {
  return (
    <FormSection title="လူမျိုးနှင့် ကိုးကွယ်သည့်ဘာသာ" icon="diversity_3">
      {/* Race Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <RaceSelector
          label="ကျောင်းသား/သူ လူမျိုး"
          value={raceStd}
          onChange={onRaceStdChange}
        />
        <RaceSelector
          label="ဖခင် လူမျိုး"
          value={raceDad}
          onChange={onRaceDadChange}
        />
        <RaceSelector
          label="မိခင် လူမျိုး"
          value={raceMum}
          onChange={onRaceMumChange}
        />
      </div>

      <div className="h-px bg-white/10 my-5" />

      {/* Religion Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormSelect
          label="ကျောင်းသား/သူ ကိုးကွယ်သည့်ဘာသာ"
          options={RELIGIONS}
          value={stdReligion}
          onChange={onStdReligionChange}
        />
        <FormSelect
          label="ဖခင် ကိုးကွယ်သည့်ဘာသာ"
          options={RELIGIONS}
          value={dadReligion}
          onChange={onDadReligionChange}
        />
        <FormSelect
          label="မိခင် ကိုးကွယ်သည့်ဘာသာ"
          options={RELIGIONS}
          value={mumReligion}
          onChange={onMumReligionChange}
        />
      </div>
    </FormSection>
  );
};
