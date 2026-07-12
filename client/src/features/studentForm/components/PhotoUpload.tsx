/**
 * Reusable file-upload box with image preview.
 * Extracted from StudentRegistrationForm's inline PhotoUploadBox.
 */
interface PhotoUploadProps {
  label: string;
  preview: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Box dimensions (px) */
  width?: number;
  height?: number;
  isUploading?: boolean;
  isError?: boolean;
}

export const PhotoUpload = ({
  label,
  preview,
  onChange,
  width = 120,
  height = 160,
  isUploading = false,
  isError = false,
}: PhotoUploadProps) => (
  <label
    className={`flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition-colors rounded-lg relative overflow-hidden ${
      isError
        ? 'border-red-400 bg-red-50 hover:bg-red-100'
        : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
    }`}
    style={{ width, height }}
  >
    {isUploading ? (
      <div className='flex flex-col items-center gap-2 p-2 text-center'>
        <div className='w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
        <span className='text-[10px] text-gray-500 font-semibold'>တင်သွင်းနေသည်...</span>
      </div>
    ) : preview ? (
      <img
        src={preview}
        alt={label}
        className='w-full h-full object-cover rounded-lg'
      />
    ) : (
      <div className='flex flex-col items-center gap-1 p-2 text-center'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-8 h-8 text-gray-400'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5'
          />
        </svg>
        <span className='text-xs text-gray-500 font-semibold leading-tight'>
          {label}
        </span>
      </div>
    )}
    <input
      type='file'
      accept='image/*'
      onChange={onChange}
      className='hidden'
      disabled={isUploading}
    />
  </label>
);
