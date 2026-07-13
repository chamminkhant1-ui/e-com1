import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAdminStudentDetailQuery,
  useUpdateStudentStatusMutation,
  useAssignRollNumberMutation,
} from '@/features/admin/hooks/useAdminQueries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { getStatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const studentId = Number(id);

  // Queries
  const { data: detailRes, isLoading, refetch } = useAdminStudentDetailQuery(studentId);

  // Mutations
  const updateStatusMutation = useUpdateStudentStatusMutation();
  const assignRollNoMutation = useAssignRollNumberMutation();

  // State
  const [rollNoInput, setRollNoInput] = useState('');
  const [showRollDialog, setShowRollDialog] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    action: 'APPROVED' | 'REJECTED';
  }>({
    isOpen: false,
    action: 'APPROVED',
  });

  if (isLoading) {
    return <LoadingSpinner message="ကျောင်းသားအချက်အလက် ဆွဲယူနေပါသည်..." />;
  }

  const s = detailRes?.ok ? detailRes.data : null;
  if (!s) {
    return (
      <div className="text-center p-12">
        <h2 className="text-lg font-bold text-red-600 mb-2">မတွေ့ရှိပါ</h2>
        <p className="text-sm text-gray-500">တောင်းဆိုထားသော ကျောင်းသားအကောင့်အား မတွေ့ရှိပါ။</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/admin/students')}>
          ပြန်သွားရန်
        </Button>
      </div>
    );
  }

  const handleStatusClick = (action: 'APPROVED' | 'REJECTED') => {
    setDialogState({ isOpen: true, action });
  };

  const handleConfirmStatus = (remarks?: string) => {
    updateStatusMutation.mutate(
      { id: studentId, status: dialogState.action, remarks },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success(
              `လျှောက်လွှာအား ${dialogState.action === 'APPROVED' ? 'လက်ခံပြီးပါပြီ' : 'ငြင်းပယ်ပြီးပါပြီ'}`
            );
            refetch();
          } else {
            toast.error(res.message || 'လုပ်ဆောင်ချက် မအောင်မြင်ပါ။');
          }
          setDialogState((prev) => ({ ...prev, isOpen: false }));
        },
        onError: () => {
          toast.error('ဆာဗာချိတ်ဆက်မှု မအောင်မြင်ပါ။');
          setDialogState((prev) => ({ ...prev, isOpen: false }));
        },
      }
    );
  };

  const handleAssignRollNo = () => {
    if (!rollNoInput.trim()) return;
    assignRollNoMutation.mutate(
      { id: studentId, rollNo: rollNoInput.trim() },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success('တက္ကသိုလ်ခုံအမှတ် သတ်မှတ်ပြီးပါပြီ။');
            setShowRollDialog(false);
            setRollNoInput('');
            refetch();
          } else {
            toast.error(res.message || 'ခုံအမှတ်သတ်မှတ်မှု မအောင်မြင်ပါ။');
          }
        },
        onError: () => {
          toast.error('ဆာဗာချိတ်ဆက်မှု မအောင်မြင်ပါ။');
        },
      }
    );
  };

  const cleanImgUrl = (path: string) => {
    if (!path) return '';
    const cleaned = path.replace(/\\/g, '/');
    return cleaned.startsWith('/') ? cleaned : '/' + cleaned;
  };

  const currentReg = s.registrations?.[0] || {};

  const docList = [
    { key: 'passportPhoto', label: 'ပတ်စ်ပို့ဓာတ်ပုံ' },
    { key: 'studentNrcPhotoFront', label: 'မှတ်ပုံတင် (အရှေ့)' },
    { key: 'studentNrcPhotoBack', label: 'မှတ်ပုံတင် (အနောက်)' },
    { key: 'fathNrcPhotoFront', label: 'ဖခင် မှတ်ပုံတင် (အရှေ့)' },
    { key: 'fathNrcPhotoBack', label: 'ဖခင် မှတ်ပုံတင် (အနောက်)' },
    { key: 'mothNrcPhotoFront', label: 'မိခင် မှတ်ပုံတင် (အရှေ့)' },
    { key: 'mothNrcPhotoBack', label: 'မိခင် မှတ်ပုံတင် (အနောက်)' },
    { key: 'houseRegistrationPhoto', label: 'အိမ်ထောင်စုဇယား' },
    { key: 'matriculationMarkPhoto', label: 'အမှတ်စာရင်း' },
    { key: 'matriculationCertificate', label: 'အောင်လက်မှတ်' },
    { key: 'policeApprovedLetter', label: 'ရဲစခန်းထောက်ခံစာ' },
    { key: 'quarterApprovedLetter', label: 'ရပ်ကွက်ထောက်ခံစာ' },
    { key: 'medicalCertificate', label: 'ဆေးထောက်ခံစာ' },
  ];

  return (
    <div className="flex flex-col gap-6 print-container">
      {/* Page Header */}
      <PageHeader
        title={`${s.nameMm} (${s.nameEn})`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'ကျောင်းသားများ', href: '/admin/students' },
          { label: 'ကျောင်းသားအသေးစိတ်' },
        ]}
        actions={
          <div className="flex gap-2 no-print">
            <Button variant="secondary" size="sm" onClick={() => navigate('/admin/students')}>
              ပြန်သွားရန်
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              ပရင့်ထုတ်ရန်
            </Button>
            {s.account?.applicationStatus === 'APPROVED' && (
              <Button variant="primary" size="sm" onClick={() => setShowRollDialog(true)}>
                ခုံအမှတ်သတ်မှတ်ရန်
              </Button>
            )}
            {['PAYMENT_SUBMITTED', 'PROFILE_COMPLETED', 'DOCUMENTS_UPLOADED'].includes(s.account?.applicationStatus) && (
              <>
                <Button variant="success" size="sm" onClick={() => handleStatusClick('APPROVED')}>
                  လက်ခံရန်
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleStatusClick('REJECTED')}>
                  ငြင်းပယ်ရန်
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Information */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Personal Info Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              ကိုယ်ရေးအချက်အလက်
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">အမည် (မြန်မာ)</span>
                <span className="text-gray-800 font-medium">{s.nameMm}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">အမည် (အင်္ဂလိပ်)</span>
                <span className="text-gray-800 font-medium">{s.nameEn}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">ကျား/မ</span>
                <span className="text-gray-800 font-medium">
                  {s.gender === 'M' ? 'ကျား' : s.gender === 'F' ? 'မ' : 'အခြား'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">မွေးသက္ကရာဇ်</span>
                <span className="text-gray-800 font-medium">
                  {s.dob ? new Date(s.dob).toLocaleDateString('en-GB') : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">မှတ်ပုံတင်အမှတ်</span>
                <span className="text-gray-800 font-medium">{s.studentNrc || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">ဖုန်းနံပါတ်</span>
                <span className="text-gray-800 font-medium">{s.phoneNumber || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">လူမျိုး</span>
                <span className="text-gray-800 font-medium">{s.ethnicity || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">ကိုးကွယ်သည့်ဘာသာ</span>
                <span className="text-gray-800 font-medium">{s.religion || '-'}</span>
              </div>
            </div>
          </div>

          {/* Academic / Matriculation Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              တက္ကသိုလ်ဝင်တန်းအောင်မြင်မှု အချက်အလက်
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">အောင်မြင်သည့်ခုနှစ်</span>
                <span className="text-gray-800 font-medium">{s.entryAcademicYear || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">တက္ကသိုလ်ဝင်တန်းခုံအမှတ်</span>
                <span className="text-gray-800 font-medium">{s.highSchoolRollNo || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">စာစစ်ဌာန/ကျောင်းအမည်</span>
                <span className="text-gray-800 font-medium">{s.highSchoolName || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">ဝင်ခွင့်စုစုပေါင်းရမှတ်</span>
                <span className="text-gray-800 font-medium">{s.account?.entrance?.totalScore || '-'}</span>
              </div>
            </div>
          </div>

          {/* Family details Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              မိဘ/အုပ်ထိန်းသူ အချက်အလက်
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">ဖခင်အမည်</span>
                <span className="text-gray-800 font-medium">
                  {s.parentProfile?.fatherNameMm} ({s.parentProfile?.fatherNameEn})
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">ဖခင်မှတ်ပုံတင်အမှတ်</span>
                <span className="text-gray-800 font-medium">{s.parentProfile?.fatherNrc || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">ဖခင်အလုပ်အကိုင်</span>
                <span className="text-gray-800 font-medium">{s.parentProfile?.fatherJob || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">မိခင်အမည်</span>
                <span className="text-gray-800 font-medium">
                  {s.parentProfile?.motherNameMm} ({s.parentProfile?.motherNameEn})
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">မိခင်မှတ်ပုံတင်အမှတ်</span>
                <span className="text-gray-800 font-medium">{s.parentProfile?.motherNrc || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block mb-0.5">မိခင်အလုပ်အကိုင်</span>
                <span className="text-gray-800 font-medium">{s.parentProfile?.motherJob || '-'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-400 font-semibold block mb-0.5">မိဘဖုန်းနံပါတ်</span>
                <span className="text-gray-800 font-medium">{s.parentProfile?.parentPhone || '-'}</span>
              </div>
            </div>
          </div>

          {/* Addresses Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              နေရပ်လိပ်စာ အချက်အလက်
            </h3>
            
            <div className="flex flex-col gap-4 text-sm">
              {s.addresses?.map((addr: any) => {
                const locationStr = [
                  addr.streetAddress,
                  addr.township?.nameMm,
                  addr.township?.district?.nameMm,
                  addr.township?.district?.state?.nameMm,
                ]
                  .filter(Boolean)
                  .join(', ');
                return (
                  <div key={addr.type}>
                    <span className="text-gray-400 font-semibold block mb-0.5">
                      {addr.type === 'current' ? 'လက်ရှိနေရပ်လိပ်စာ' : 'မိဘနေရပ်လိပ်စာ'}
                    </span>
                    <span className="text-gray-800 font-medium">{locationStr || '-'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Status, RollNo, Uploaded Photos list */}
        <div className="flex flex-col gap-6">
          {/* Status & Enrollment Card */}
          <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              မှတ်ပုံတင်မှု အခြေအနေ
            </h3>
            
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">လျှောက်လွှာအခြေအနေ:</span>
                {getStatusBadge(s.account?.applicationStatus)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">မေဂျာ:</span>
                <span className="text-gray-800 font-bold">
                  {currentReg.major?.majorNameMm || currentReg.majorCode || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">ပညာသင်နှစ်:</span>
                <span className="text-gray-800 font-medium">{currentReg.academicYearId || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Semester:</span>
                <span className="text-gray-800 font-medium">{currentReg.semester?.semesterName || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">တက္ကသိုလ်ခုံအမှတ်:</span>
                <span className="text-blue-600 font-bold text-base">{currentReg.rollNo || 'မသတ်မှတ်ရသေးပါ'}</span>
              </div>
            </div>
          </div>

          {/* Payment receipt Screenshot (if submitted) */}
          {currentReg.payment && (
            <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-3">
                ငွေပေးသွင်းမှု ပြေစာ
              </h3>
              <div className="text-xs text-gray-500 mb-3 space-y-1">
                <div>ပေးသွင်းသူ: <span className="font-semibold text-gray-800">{currentReg.payment.payerName}</span></div>
                <div>ကုဒ် (ဂဏန်း၆လုံး): <span className="font-semibold text-gray-800">{currentReg.payment.transactionCode}</span></div>
                <div>အချိန်: <span className="font-semibold text-gray-800">{new Date(currentReg.payment.paymentTime).toLocaleString()}</span></div>
                <div className="flex justify-between">
                  <span>ပြေစာအခြေအနေ:</span>
                  <span className="font-bold">{currentReg.payment.status === 'approved' ? 'လက်ခံပြီး' : currentReg.payment.status === 'rejected' ? 'ငြင်းပယ်ပြီး' : 'စိစစ်ဆဲ'}</span>
                </div>
              </div>
              
              {currentReg.payment.paymentScreenshot && (
                <div
                  onClick={() => setLightboxImg(cleanImgUrl(currentReg.payment.paymentScreenshot))}
                  className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity"
                >
                  <img
                    src={cleanImgUrl(currentReg.payment.paymentScreenshot)}
                    alt="Receipt"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Uploaded Documents Grid */}
          <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              စာရွက်စာတမ်းပုံများ
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {docList.map((doc) => {
                const path = s.photo?.[doc.key];
                if (!path) return null;
                const url = cleanImgUrl(path);
                return (
                  <div
                    key={doc.key}
                    onClick={() => setLightboxImg(url)}
                    className="flex flex-col gap-1 cursor-zoom-in group"
                  >
                    <div className="aspect-[3/4] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative">
                      <img
                        src={url}
                        alt={doc.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold truncate text-center block mt-0.5">
                      {doc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox dialog */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out no-print"
        >
          <img
            src={lightboxImg}
            alt="Expanded view"
            className="max-h-[92vh] max-w-[92vw] object-contain rounded shadow-2xl transition-transform"
          />
        </div>
      )}

      {/* Assign Roll Number Dialog */}
      {showRollDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 no-print">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">တက္ကသိုလ်ခုံအမှတ် သတ်မှတ်ရန်</h3>
            <p className="text-xs text-gray-500 mb-4 leading-normal">
              ကျောင်းသား "{s.nameMm}" အား သတ်မှတ်ပေးမည့် တက္ကသိုလ်ဝင်ခွင့် ခုံအမှတ်အား ရေးထည့်ပါ။
            </p>
            <div className="mb-4">
              <input
                type="text"
                value={rollNoInput}
                onChange={(e) => setRollNoInput(e.target.value)}
                placeholder="ဥပမာ - 002283"
                className="block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setShowRollDialog(false); setRollNoInput(''); }}>
                မလုပ်တော့ပါ
              </Button>
              <Button variant="primary" size="sm" onClick={handleAssignRollNo} disabled={!rollNoInput.trim()}>
                သတ်မှတ်မည်
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Approve/Reject Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmStatus}
        title={dialogState.action === 'APPROVED' ? 'လျှောက်လွှာ လက်ခံရန် အတည်ပြုချက်' : 'လျှောက်လွှာ ငြင်းပယ်ရန် အတည်ပြုချက်'}
        message={`ကျောင်းသား "${s.nameMm}" ၏ လျှောက်လွှာအား ${
          dialogState.action === 'APPROVED' ? 'လက်ခံရန် သေချာပါသလား?' : 'ငြင်းပယ်ရန် သေချာပါသလား?'
        }`}
        variant={dialogState.action === 'APPROVED' ? 'success' : 'danger'}
        requireRemarks={dialogState.action === 'REJECTED'}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default StudentDetailPage;
