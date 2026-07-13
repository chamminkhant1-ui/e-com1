import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAdminStudentsQuery,
  useUpdateStudentStatusMutation,
  useAcademicMajorsQuery,
  useAcademicYearsQuery,
} from '@/features/admin/hooks/useAdminQueries';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { getStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { getExportStudents } from '@/features/admin/api/admin.service';

export const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Table parameters state
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC' as 'ASC' | 'DESC',
    status: '',
    majorCode: '',
    academicYearId: '',
  });

  // Queries
  const { data: studentsRes, isLoading, refetch } = useAdminStudentsQuery(params);
  const { data: majorsRes } = useAcademicMajorsQuery();
  const { data: yearsRes } = useAcademicYearsQuery();

  // Mutations
  const updateStatusMutation = useUpdateStudentStatusMutation();

  // Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    studentId: number;
    studentName: string;
    action: 'APPROVED' | 'REJECTED';
  }>({
    isOpen: false,
    studentId: 0,
    studentName: '',
    action: 'APPROVED',
  });

  const students = studentsRes?.ok ? studentsRes.data.items : [];
  const total = studentsRes?.ok ? studentsRes.data.total : 0;
  const majors = majorsRes?.ok ? majorsRes.data : [];
  const years = yearsRes?.ok ? yearsRes.data : [];

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleSort = (key: string, order: 'ASC' | 'DESC') => {
    setParams((prev) => ({ ...prev, sortBy: key, sortOrder: order }));
  };

  const handleStatusChangeClick = (e: React.MouseEvent, row: any, action: 'APPROVED' | 'REJECTED') => {
    e.stopPropagation(); // Prevent row click navigation
    setDialogState({
      isOpen: true,
      studentId: row.studentId,
      studentName: row.nameMm,
      action,
    });
  };

  const handleConfirmStatusChange = (remarks?: string) => {
    updateStatusMutation.mutate(
      {
        id: dialogState.studentId,
        status: dialogState.action,
        remarks,
      },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success(
              `${dialogState.studentName} ၏ လျှောက်လွှာအား ${
                dialogState.action === 'APPROVED' ? 'လက်ခံပြီးပါပြီ' : 'ငြင်းပယ်ပြီးပါပြီ'
              }`
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

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const res = await getExportStudents({
        status: params.status,
        majorCode: params.majorCode,
      });
      if (res.ok && res.data.length > 0) {
        // Convert to CSV
        const headers = Object.keys(res.data[0]).join(',');
        const rows = res.data.map((row: any) =>
          Object.values(row)
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(',')
        );
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV ဖိုင် ထုတ်ယူမှု အောင်မြင်ပါသည်။');
      } else {
        toast.warning('ထုတ်ယူရန် ဒေတာမရှိပါ။');
      }
    } catch {
      toast.error('ထုတ်ယူမှု မအောင်မြင်ပါ။');
    }
  };

  const columns: Column<any>[] = [
    { key: 'nameMm', header: 'အမည် (မြန်မာ)', sortable: true },
    { key: 'studentNrc', header: 'မှတ်ပုံတင်အမှတ်', sortable: true },
    {
      key: 'major',
      header: 'မေဂျာ',
      render: (row) => row.registrations?.[0]?.major?.majorNameMm || row.registrations?.[0]?.majorCode || '-',
    },
    {
      key: 'academicYear',
      header: 'ပညာသင်နှစ်',
      render: (row) => row.registrations?.[0]?.academicYearId || '-',
    },
    {
      key: 'status',
      header: 'လျှောက်လွှာအခြေအနေ',
      sortable: true,
      render: (row) => getStatusBadge(row.account?.applicationStatus),
    },
    {
      key: 'actions',
      header: 'လုပ်ဆောင်ချက်များ',
      render: (row) => {
        const status = row.account?.applicationStatus;
        return (
          <div className="flex gap-2">
            {['PAYMENT_SUBMITTED', 'PROFILE_COMPLETED', 'DOCUMENTS_UPLOADED'].includes(status) && (
              <>
                <button
                  onClick={(e) => handleStatusChangeClick(e, row, 'APPROVED')}
                  className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                >
                  လက်ခံရန်
                </button>
                <button
                  onClick={(e) => handleStatusChangeClick(e, row, 'REJECTED')}
                  className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  ငြင်းပယ်ရန်
                </button>
              </>
            )}
            <button
              onClick={() => navigate(`/admin/students/${row.studentId}`)}
              className="px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              အသေးစိတ်
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="ကျောင်းသားများစာရင်း"
        breadcrumbs={[{ label: 'Admin' }, { label: 'ကျောင်းသားများ' }]}
        actions={
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            Excel/CSV ထုတ်ရန်
          </Button>
        }
      />

      {/* Filters & Search Block */}
      <div className="p-4 bg-white border border-gray-150 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">အမည်/NRC ရှာရန်</label>
          <SearchInput
            value={params.search}
            onChange={(val) => setParams((prev) => ({ ...prev, search: val, page: 1 }))}
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">အခြေအနေ</label>
          <select
            value={params.status}
            onChange={(e) => setParams((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">အားလုံး</option>
            <option value="PROFILE_COMPLETED">ကိုယ်ရေးအချက်အလက်ပြည့်စုံ</option>
            <option value="NRC_UPLOADED">NRC တင်ပြီး</option>
            <option value="DOCUMENTS_UPLOADED">စာရွက်စာတမ်းတင်ပြီး</option>
            <option value="PAYMENT_SUBMITTED">ငွေပေးချေပြီး</option>
            <option value="APPROVED">အတည်ပြုပြီး</option>
            <option value="REJECTED">ငြင်းပယ်ပြီး</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">မေဂျာ</label>
          <select
            value={params.majorCode}
            onChange={(e) => setParams((prev) => ({ ...prev, majorCode: e.target.value, page: 1 }))}
            className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">အားလုံး</option>
            {majors.map((m: any) => (
              <option key={m.majorCode} value={m.majorCode}>
                {m.majorNameMm}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">ပညာသင်နှစ်</label>
          <select
            value={params.academicYearId}
            onChange={(e) => setParams((prev) => ({ ...prev, academicYearId: e.target.value, page: 1 }))}
            className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">အားလုံး</option>
            {years.map((y: any) => (
              <option key={y.academicYearId} value={y.academicYearId}>
                {y.academicYearId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        page={params.page}
        limit={params.limit}
        total={total}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        onRowClick={(row) => navigate(`/admin/students/${row.studentId}`)}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmStatusChange}
        title={dialogState.action === 'APPROVED' ? 'လျှောက်လွှာ လက်ခံရန် အတည်ပြုချက်' : 'လျှောက်လွှာ ငြင်းပယ်ရန် အတည်ပြုချက်'}
        message={`ကျောင်းသား "${dialogState.studentName}" ၏ လျှောက်လွှာအား ${
          dialogState.action === 'APPROVED' ? 'လက်ခံရန် သေချာပါသလား?' : 'ငြင်းပယ်ရန် သေချာပါသလား?'
        }`}
        variant={dialogState.action === 'APPROVED' ? 'success' : 'danger'}
        requireRemarks={dialogState.action === 'REJECTED'}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default StudentsPage;
