import { FormSection } from './FormSection';
import { FormInput } from './FormFields';

/** Column header badge */
const ColBadge = ({ label }: { label: string }) => (
  <div className="rounded-lg bg-indigo-500/15 px-3 py-1.5 text-center text-xs font-semibold text-indigo-300">
    {label}
  </div>
);

interface NamesTableProps {
  // Myanmar names
  stdMyanName: string;
  dadMyanName: string;
  mumMyanName: string;
  onMumMyanNameChange: (v: string) => void;

  // English names
  stdEngName: string;
  onStdEngNameChange: (v: string) => void;
  dadEngName: string;
  onDadEngNameChange: (v: string) => void;
  mumEngName: string;
  onMumEngNameChange: (v: string) => void;
}

export const NamesSection = ({
  stdMyanName,
  dadMyanName,
  mumMyanName,
  onMumMyanNameChange,
  stdEngName,
  onStdEngNameChange,
  dadEngName,
  onDadEngNameChange,
  mumEngName,
  onMumEngNameChange,
}: NamesTableProps) => (
  <FormSection title="အမည်" icon="badge">
    {/* Column headers */}
    <div className="mb-3 grid grid-cols-4 gap-3">
      <div /> {/* label col */}
      <ColBadge label="ကျောင်းသား/သူ" />
      <ColBadge label="အဘ" />
      <ColBadge label="အမိ" />
    </div>

    {/* Myanmar row */}
    <div className="mb-3 grid grid-cols-4 items-end gap-3">
      <div className="flex items-center">
        <span className="rounded-lg bg-white/8 px-3 py-2 text-xs font-medium text-slate-300">
          မြန်မာ
        </span>
      </div>
      <FormInput
        label=""
        value={stdMyanName}
        readOnly
        placeholder="မ......"
        onChange={() => {}}
      />
      <FormInput
        label=""
        value={dadMyanName}
        readOnly
        placeholder="ဦး......"
        onChange={() => {}}
      />
      <FormInput
        label=""
        value={mumMyanName}
        placeholder="ဒေါ်......"
        onChange={(e) => onMumMyanNameChange(e.target.value)}
      />
    </div>

    {/* English row */}
    <div className="grid grid-cols-4 items-end gap-3">
      <div className="flex items-center">
        <span className="rounded-lg bg-white/8 px-3 py-2 text-xs font-medium text-slate-300">
          အင်္ဂလိပ်
        </span>
      </div>
      <FormInput
        label=""
        value={stdEngName}
        placeholder="Mg/Ma ......"
        onChange={(e) => onStdEngNameChange(e.target.value)}
      />
      <FormInput
        label=""
        value={dadEngName}
        placeholder="U ......"
        onChange={(e) => onDadEngNameChange(e.target.value)}
      />
      <FormInput
        label=""
        value={mumEngName}
        placeholder="Daw ......"
        onChange={(e) => onMumEngNameChange(e.target.value)}
      />
    </div>
  </FormSection>
);
