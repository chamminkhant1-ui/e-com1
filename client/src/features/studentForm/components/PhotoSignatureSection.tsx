import { useState } from 'react';
import { FormSection } from './FormSection';

interface PhotoSignatureSectionProps {
  photoFile: File | null;
  onPhotoChange: (file: File | null) => void;

  sigFile: File | null;
  onSigChange: (file: File | null) => void;
}

export const PhotoSignatureSection = ({
  photoFile: _photoFile,
  onPhotoChange,
  sigFile: _sigFile,
  onSigChange,
}: PhotoSignatureSectionProps) => {
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [sigPreview, setSigPreview] = useState<string>('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onPhotoChange(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview('');
    }
  };

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onSigChange(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSigPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setSigPreview('');
    }
  };

  return (
    <FormSection title="ဓါတ်ပုံနှင့် လက်မှတ်" icon="photo_camera">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Passport Photo */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">ကျောင်းသား/သူ၏ ပတ်စပို့ဓာတ်ပုံ</span>
          <label className="group relative flex h-60 w-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 transition-all hover:border-indigo-400 hover:bg-white/10">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Passport Preview"
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-indigo-400 transition-colors">
                  add_a_photo
                </span>
                <span className="mt-2 text-xs font-semibold text-slate-300">ဓာတ်ပုံတင်ရန်</span>
                <span className="mt-1 text-[10px] text-slate-400">Click သို့မဟုတ် drag standard image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>

        {/* Signature */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">လျှောက်ထားသူ လက်မှတ်</span>
          <label className="group relative flex h-60 w-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 transition-all hover:border-indigo-400 hover:bg-white/10">
            {sigPreview ? (
              <img
                src={sigPreview}
                alt="Signature Preview"
                className="h-full w-full rounded-2xl object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-indigo-400 transition-colors">
                  signature
                </span>
                <span className="mt-2 text-xs font-semibold text-slate-300">လက်မှတ်တင်ရန်</span>
                <span className="mt-1 text-[10px] text-slate-400">Click သို့မဟုတ် drag signature image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleSigUpload}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>
    </FormSection>
  );
};
