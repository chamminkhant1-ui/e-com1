import React, { useState } from 'react';
import {
  useAcademicMajorsQuery,
  useCreateMajorMutation,
  useDeleteMajorMutation,
  useAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  useAcademicSemestersQuery,
  useCreateSemesterMutation,
  useDeleteSemesterMutation,
  useTriggerSemesterRegistrationMutation,
} from '@/features/admin/hooks/useAdminQueries';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

type ActiveTab = 'majors' | 'years' | 'semesters';

export const AcademicsPage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('majors');

  // Queries
  const { data: majorsRes, isLoading: majorsLoading, refetch: refetchMajors } = useAcademicMajorsQuery();
  const { data: yearsRes, isLoading: yearsLoading, refetch: refetchYears } = useAcademicYearsQuery();
  const { data: semestersRes, isLoading: semestersLoading, refetch: refetchSemesters } = useAcademicSemestersQuery();

  // Mutations
  const createMajorMut = useCreateMajorMutation();
  const deleteMajorMut = useDeleteMajorMutation();
  const createYearMut = useCreateAcademicYearMutation();
  const updateYearMut = useUpdateAcademicYearMutation();
  const createSemesterMut = useCreateSemesterMutation();
  const deleteSemesterMut = useDeleteSemesterMutation();
  const triggerSemesterRegMut = useTriggerSemesterRegistrationMutation();

  // Input states
  const [majorForm, setMajorForm] = useState({ majorCode: '', majorNameMm: '', majorNameEn: '', institution: 'computer' as 'computer' | 'technology' });
  const [yearForm, setYearForm] = useState({ academicYearId: '', isActive: true });
  const [semesterForm, setSemesterForm] = useState({ semesterName: '', numericalLevel: 1 });
  const [triggerForm, setTriggerForm] = useState({ academicYearId: '', semesterId: '' });

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; type: ActiveTab; id: string | number; name: string }>({
    isOpen: false,
    type: 'majors',
    id: '',
    name: '',
  });

  const [triggerDialog, setTriggerDialog] = useState(false);

  const majors = majorsRes?.ok ? majorsRes.data : [];
  const years = yearsRes?.ok ? yearsRes.data : [];
  const semesters = semestersRes?.ok ? semestersRes.data : [];

  const handleCreateMajor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!majorForm.majorCode || !majorForm.majorNameMm) return;
    createMajorMut.mutate(majorForm, {
      onSuccess: (res) => {
        if (res.ok) {
          toast.success('မေဂျာအသစ် ထည့်သွင်းပြီးပါပြီ။');
          setMajorForm({ majorCode: '', majorNameMm: '', majorNameEn: '', institution: 'computer' });
          refetchMajors();
        } else {
          toast.error(res.message || 'မအောင်မြင်ပါ။');
        }
      },
    });
  };

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearForm.academicYearId) return;
    createYearMut.mutate(yearForm, {
      onSuccess: (res) => {
        if (res.ok) {
          toast.success('ပညာသင်နှစ်အသစ် ထည့်သွင်းပြီးပါပြီ။');
          setYearForm({ academicYearId: '', isActive: true });
          refetchYears();
        } else {
          toast.error(res.message || 'မအောင်မြင်ပါ။');
        }
      },
    });
  };

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semesterForm.semesterName || semesterForm.numericalLevel < 1) return;
    createSemesterMut.mutate(semesterForm, {
      onSuccess: (res) => {
        if (res.ok) {
          toast.success('Semester အသစ် ထည့်သွင်းပြီးပါပြီ။');
          setSemesterForm({ semesterName: '', numericalLevel: semesterForm.numericalLevel + 1 });
          refetchSemesters();
        } else {
          toast.error(res.message || 'မအောင်မြင်ပါ။');
        }
      },
    });
  };

  const toggleYearActive = (id: string, active: boolean) => {
    updateYearMut.mutate(
      { id, data: { isActive: !active } },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success('ပညာသင်နှစ် အခြေအနေ ပြောင်းလဲပြီးပါပြီ။');
            refetchYears();
          } else {
            toast.error(res.message || 'မအောင်မြင်ပါ။');
          }
        },
      }
    );
  };

  const handleDeleteClick = (type: ActiveTab, id: string | number, name: string) => {
    setDeleteDialog({ isOpen: true, type, id, name });
  };

  const handleConfirmDelete = () => {
    const muts = {
      majors: () => deleteMajorMut.mutate(String(deleteDialog.id), {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success('မေဂျာ ဖြတ်တောက်ပြီးပါပြီ။');
            refetchMajors();
          } else {
            toast.error(res.message || 'မအောင်မြင်ပါ။');
          }
          setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
        },
      }),
      semesters: () => deleteSemesterMut.mutate(Number(deleteDialog.id), {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success('Semester ဖြတ်တောက်ပြီးပါပြီ။');
            refetchSemesters();
          } else {
            toast.error(res.message || 'မအောင်မြင်ပါ။');
          }
          setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
        },
      }),
      years: () => {}, // No year deletion supported
    };

    if (deleteDialog.type !== 'years') {
      muts[deleteDialog.type]();
    }
  };

  const handleTriggerSemesterReg = () => {
    if (!triggerForm.academicYearId || !triggerForm.semesterId) return;
    triggerSemesterRegMut.mutate(
      {
        academicYearId: triggerForm.academicYearId,
        semesterId: Number(triggerForm.semesterId),
      },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success(res.message || 'အကောင့်ဝင်ခွင့်ရကျောင်းသားများအားလုံးကို Semester အသစ်စာရင်းသွင်းပြီးပါပြီ။');
            setTriggerForm({ academicYearId: '', semesterId: '' });
            setTriggerDialog(false);
          } else {
            toast.error(res.message || 'လုပ်ဆောင်ချက် မအောင်မြင်ပါ။');
          }
        },
        onError: () => {
          toast.error('ဆာဗာချိတ်ဆက်မှု မအောင်မြင်ပါ။');
        },
      }
    );
  };

  const majorColumns: Column<any>[] = [
    { key: 'majorCode', header: 'မေဂျာကုဒ်' },
    { key: 'majorNameMm', header: 'မေဂျာအမည် (မြန်မာ)' },
    { key: 'majorNameEn', header: 'မေဂျာအမည် (အင်္ဂလိပ်)' },
    {
      key: 'institution',
      header: 'တက္ကသိုလ်အမျိုးအစား',
      render: (row) => (row.institution === 'computer' ? 'ကွန်ပျူတာတက္ကသိုလ်' : 'နည်းပညာတက္ကသိုလ်'),
    },
    {
      key: 'actions',
      header: 'လုပ်ဆောင်ချက်',
      render: (row) => (
        <button
          onClick={() => handleDeleteClick('majors', row.majorCode, row.majorNameMm)}
          className="text-xs text-red-650 font-semibold hover:text-red-800"
        >
          ဖျက်မည်
        </button>
      ),
    },
  ];

  const yearColumns: Column<any>[] = [
    { key: 'academicYearId', header: 'ပညာသင်နှစ်' },
    {
      key: 'isActive',
      header: 'အခြေအနေ (Active)',
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full select-none cursor-pointer ${
            row.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
          onClick={() => toggleYearActive(row.academicYearId, row.isActive)}
        >
          {row.isActive ? 'Active ဖြစ်နေသည်' : 'Active မဟုတ်ပါ'}
        </span>
      ),
    },
  ];

  const semesterColumns: Column<any>[] = [
    { key: 'numericalLevel', header: 'အဆင့် (Numerical Level)' },
    { key: 'semesterName', header: 'Semester အမည်' },
    {
      key: 'actions',
      header: 'လုပ်ဆောင်ချက်',
      render: (row) => (
        <button
          onClick={() => handleDeleteClick('semesters', row.semesterId, row.semesterName)}
          className="text-xs text-red-650 font-semibold hover:text-red-800"
        >
          ဖျက်မည်
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="ပညာရေးဆိုင်ရာသတ်မှတ်ချက်များ"
        breadcrumbs={[{ label: 'Admin' }, { label: 'မေဂျာ/နှစ်/Semester' }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setTriggerDialog(true)}>
            Semester အသစ် ဖွင့်လှစ်ရန်
          </Button>
        }
      />

      {/* Tabs list */}
      <div className="flex border-b border-gray-200">
        {(['majors', 'years', 'semesters'] as const).map((tab) => {
          const labels = {
            majors: 'မေဂျာများ (Majors)',
            years: 'ပညာသင်နှစ်များ (Academic Years)',
            semesters: 'Semesters',
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors -mb-[2px] cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Add New Form */}
        <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm h-fit">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
            {activeTab === 'majors'
              ? 'မေဂျာအသစ် ထည့်သွင်းရန်'
              : activeTab === 'years'
              ? 'ပညာသင်နှစ်အသစ် ထည့်သွင်းရန်'
              : 'Semester အသစ် ထည့်သွင်းရန်'}
          </h3>

          {activeTab === 'majors' && (
            <form onSubmit={handleCreateMajor} className="flex flex-col gap-4 text-sm">
              <div>
                <label className="block text-gray-500 font-bold mb-1">မေဂျာကုဒ် (ဥပမာ - CE)</label>
                <input
                  type="text"
                  required
                  value={majorForm.majorCode}
                  onChange={(e) => setMajorForm((prev) => ({ ...prev, majorCode: e.target.value.toUpperCase() }))}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-bold mb-1">မေဂျာအမည် (မြန်မာ)</label>
                <input
                  type="text"
                  required
                  value={majorForm.majorNameMm}
                  onChange={(e) => setMajorForm((prev) => ({ ...prev, majorNameMm: e.target.value }))}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-bold mb-1">မေဂျာအမည် (အင်္ဂလိပ် - Optional)</label>
                <input
                  type="text"
                  value={majorForm.majorNameEn}
                  onChange={(e) => setMajorForm((prev) => ({ ...prev, majorNameEn: e.target.value }))}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-bold mb-1">တက္ကသိုလ်အမျိုးအစား</label>
                <select
                  value={majorForm.institution}
                  onChange={(e) => setMajorForm((prev) => ({ ...prev, institution: e.target.value as any }))}
                  className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="computer">ကွန်ပျူတာတက္ကသိုလ်</option>
                  <option value="technology">နည်းပညာတက္ကသိုလ်</option>
                </select>
              </div>
              <Button type="submit" isLoading={createMajorMut.isPending} className="w-full">
                ထည့်သွင်းမည်
              </Button>
            </form>
          )}

          {activeTab === 'years' && (
            <form onSubmit={handleCreateYear} className="flex flex-col gap-4 text-sm">
              <div>
                <label className="block text-gray-500 font-bold mb-1">ပညာသင်နှစ် ID (ဥပမာ - 2025-2026)</label>
                <input
                  type="text"
                  required
                  placeholder="2025-2026"
                  value={yearForm.academicYearId}
                  onChange={(e) => setYearForm((prev) => ({ ...prev, academicYearId: e.target.value }))}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="yearActive"
                  checked={yearForm.isActive}
                  onChange={(e) => setYearForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="yearActive" className="text-gray-700 font-semibold select-none">
                  Active ပညာသင်နှစ်အဖြစ် သတ်မှတ်ရန်
                </label>
              </div>
              <Button type="submit" isLoading={createYearMut.isPending} className="w-full">
                ထည့်သွင်းမည်
              </Button>
            </form>
          )}

          {activeTab === 'semesters' && (
            <form onSubmit={handleCreateSemester} className="flex flex-col gap-4 text-sm">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Semester အမည် (ဥပမာ - Semester I)</label>
                <input
                  type="text"
                  required
                  placeholder="Semester I"
                  value={semesterForm.semesterName}
                  onChange={(e) => setSemesterForm((prev) => ({ ...prev, semesterName: e.target.value }))}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-500 font-bold mb-1">အဆင့် (Numerical Level - ဥပမာ - 1)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={semesterForm.numericalLevel}
                  onChange={(e) => setSemesterForm((prev) => ({ ...prev, numericalLevel: Number(e.target.value) }))}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button type="submit" isLoading={createSemesterMut.isPending} className="w-full">
                ထည့်သွင်းမည်
              </Button>
            </form>
          )}
        </div>

        {/* Right Columns - DataTable List */}
        <div className="lg:col-span-2">
          {activeTab === 'majors' && (
            <DataTable columns={majorColumns} data={majors} loading={majorsLoading} />
          )}

          {activeTab === 'years' && (
            <DataTable columns={yearColumns} data={years} loading={yearsLoading} />
          )}

          {activeTab === 'semesters' && (
            <DataTable columns={semesterColumns} data={semesters} loading={semestersLoading} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title="ဖျက်ရန် အတည်ပြုချက်"
        message={`"${deleteDialog.name}" အား သတ်မှတ်ချက်များစာရင်းမှ ဖျက်ပစ်ရန် သေချာပါသလား?`}
        variant="danger"
        isLoading={deleteMajorMut.isPending || deleteSemesterMut.isPending}
      />

      {/* Trigger Semester Registration Dialog */}
      {triggerDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 no-print">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-150">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">Semester အသစ် ဖွင့်လှစ်ရန်</h3>
            <p className="text-xs text-gray-500 mb-4 leading-normal">
              လက်ခံအတည်ပြုထားသော ကျောင်းသားများအားလုံးကို သတ်မှတ်ထားသော ပညာသင်နှစ်နှင့် Semester သို့ စာရင်းသွင်းပေးမည် ဖြစ်သည်။ (ထိုကျောင်းသားများမှ Semester အသစ်အတွက် ငွေပေးချေမှုပြေစာ ထပ်မံတင်သွင်းရမည်ဖြစ်သည်)
            </p>
            
            <div className="flex flex-col gap-4 text-sm mb-6">
              <div>
                <label className="block text-gray-500 font-bold mb-1">ပညာသင်နှစ်ကို ရွေးပါ</label>
                <select
                  value={triggerForm.academicYearId}
                  onChange={(e) => setTriggerForm((prev) => ({ ...prev, academicYearId: e.target.value }))}
                  className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- ရွေးချယ်ရန် --</option>
                  {years.map((y: any) => (
                    <option key={y.academicYearId} value={y.academicYearId}>
                      {y.academicYearId} {y.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Semester ကို ရွေးပါ</label>
                <select
                  value={triggerForm.semesterId}
                  onChange={(e) => setTriggerForm((prev) => ({ ...prev, semesterId: e.target.value }))}
                  className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- ရွေးချယ်ရန် --</option>
                  {semesters.map((s: any) => (
                    <option key={s.semesterId} value={s.semesterId}>
                      {s.semesterName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setTriggerDialog(false);
                  setTriggerForm({ academicYearId: '', semesterId: '' });
                }}
              >
                မလုပ်တော့ပါ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleTriggerSemesterReg}
                disabled={!triggerForm.academicYearId || !triggerForm.semesterId}
                isLoading={triggerSemesterRegMut.isPending}
              >
                အတည်ပြု ဖွင့်လှစ်မည်
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicsPage;
