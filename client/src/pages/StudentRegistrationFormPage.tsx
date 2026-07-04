import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentRegistrationForm } from '@/features/studentForm/components/StudentRegistrationForm';
import { useSubmitStudentProfileMutation, extractApiError } from '@/features/auth/hooks/useAuthQueries';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';

export const StudentRegistrationFormPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuthUser();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<unknown>(null);
  const [pageError, setPageError] = useState('');

  const submitMutation = useSubmitStudentProfileMutation();

  const handleSuccess = (data: unknown) => {
    setPageError('');
    submitMutation.mutate(data, {
      onSuccess: (res) => {
        if (res.ok) {
          setSubmittedData(data);
          setIsSuccess(true);
        }
      },
      onError: (error) => {
        const apiError = extractApiError(error);
        setPageError(
          apiError.message ?? 'တင်သွင်းမှု မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားပါ။',
        );
      },
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/', { replace: true });
  };

  if (isAuthLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-100'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-8 w-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent' />
          <p className='text-sm font-medium tracking-wide text-gray-500'>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12'>
        <div className='w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 mb-5'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
              className='w-7 h-7'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m4.5 12.75 6 6 9-13.5'
              />
            </svg>
          </div>

          <h2 className='text-xl font-bold text-gray-800 mb-2'>
            မှတ်ပုံတင်ခြင်း အောင်မြင်ပါသည်။
          </h2>
          <p className='text-sm text-gray-500 mb-6'>
            ကျောင်းသား/သူအဖြစ် မှတ်ပုံတင်ခွင့်တောင်းခံလွှာအား စနစ်သို့
            အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ။
          </p>

          {submittedData != null &&
            (() => {
              const d = submittedData as Record<string, unknown>;
              return (
                <div className='text-left rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs space-y-2 mb-6 max-h-48 overflow-y-auto'>
                  <p className='font-semibold text-gray-700 border-b border-gray-200 pb-1.5 mb-1.5'>
                    ကျောင်းအပ်အချက်အလက် အနှစ်ချုပ်
                  </p>
                  <p>
                    <span className='text-gray-400'>ကျောင်းသား/သူ အမည်:</span>{' '}
                    {String(d.nameMm ?? '')}
                  </p>
                  <p>
                    <span className='text-gray-400'>ဖခင် အမည်:</span>{' '}
                    {String(d.fatherNameMm ?? '')}
                  </p>
                  <p>
                    <span className='text-gray-400'>ဖုန်းနံပါတ်:</span>{' '}
                    {String(d.phoneNumber ?? '')}
                  </p>
                  <p>
                    <span className='text-gray-400'>Email:</span>{' '}
                    {String(d.std_email ?? '')}
                  </p>
                </div>
              );
            })()}

          <div className='flex gap-3 justify-center'>
            <button
              onClick={() => setIsSuccess(false)}
              className='rounded-full border border-gray-300 hover:bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 transition-all'
            >
              အချက်အလက်ပြင်ဆင်ရန်
            </button>
            <button
              onClick={handleLogout}
              className='rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all'
            >
              ပြီးမြောက်ပြီ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Navbar */}
      <header className='bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20'>
        <div className='mx-auto flex max-w-[1040px] items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2 text-blue-600 font-bold text-sm'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-5 h-5'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z'
              />
            </svg>
            <span>UCSPyay Portal</span>
          </div>
          <button
            onClick={handleLogout}
            className='flex items-center gap-1.5 rounded border border-gray-300 hover:bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all'
          >
            ထွက်ခွာရန်
          </button>
        </div>
      </header>

      {/* API error banner (shown below navbar, above form) */}
      {pageError && (
        <div className='max-w-[1040px] mx-auto mt-4 px-4'>
          <div className='rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700'>
            {pageError}
          </div>
        </div>
      )}

      {/* Form */}
      <main className='py-6 px-4'>
        <StudentRegistrationForm
          onSubmitSuccess={handleSuccess}
          isSubmitting={submitMutation.isPending}
          entrance={user?.entrance}
          serverDate={user?.serverDate}
        />
      </main>
    </div>
  );
};

export default StudentRegistrationFormPage;
