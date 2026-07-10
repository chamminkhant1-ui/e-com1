import type { EntranceMatchInfo } from '@/types/auth';
import { AuthFormCard } from './AuthFormCard';
import {
  authFormSubtitleClass,
  authFormTitleClass,
  authSubmitButtonClass,
} from './authFormStyles';

interface EntranceConfirmCardProps {
  info: EntranceMatchInfo;
  onConfirm: () => void;
  onBack: () => void;
}

const infoRowClass =
  'flex items-center justify-between gap-4 border-b border-outline-variant/60 py-2.5 last:border-0';
const infoKeyClass = 'text-sm text-on-surface-variant';
const infoValueClass = 'text-sm font-semibold text-on-surface text-right';

export const EntranceConfirmCard = ({
  info,
  onConfirm,
  onBack,
}: EntranceConfirmCardProps) => {
  return (
    <>
      <AuthFormCard>
        <header className='mb-5 space-y-1.5'>
          <h1 className={authFormTitleClass}>Confirm your record</h1>
          <p className={authFormSubtitleClass}>
            Please confirm these details belong to you before creating an
            account.
          </p>
        </header>

        <div className='mb-5 rounded-2xl border border-outline-variant/60 bg-surface-1/50 px-4 py-1'>
          <div className={infoRowClass}>
            <span className={infoKeyClass}>Name</span>
            <span className={infoValueClass}>{info.applicantNameMm}</span>
          </div>
          <div className={infoRowClass}>
            <span className={infoKeyClass}>Father&apos;s name</span>
            <span className={infoValueClass}>{info.fatherNameMm}</span>
          </div>
          <div className={infoRowClass}>
            <span className={infoKeyClass}>Exam year</span>
            <span className={infoValueClass}>{info.examYear}</span>
          </div>
          <div className={infoRowClass}>
            <span className={infoKeyClass}>Roll number</span>
            <span className={infoValueClass}>{info.matricExamRollNo}</span>
          </div>
          <div className={infoRowClass}>
            <span className={infoKeyClass}>Institution</span>
            <span className={`${infoValueClass} capitalize`}>
              {info.institution}
            </span>
          </div>
          <div className={infoRowClass}>
            <span className={infoKeyClass}>Total score</span>
            <span className={infoValueClass}>{info.totalScore}</span>
          </div>
        </div>

        <div className='space-y-2.5'>
          <button
            type='button'
            className={authSubmitButtonClass}
            onClick={onConfirm}
          >
            Yes, this is me
            <span className='material-symbols-outlined text-base'>
              check_circle
            </span>
          </button>
          <button
            type='button'
            onClick={onBack}
            className='w-full rounded-full py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-1'
          >
            Edit details
          </button>
        </div>
      </AuthFormCard>
    </>
  );
};
