import React, { useState } from 'react';
import {
  useAdminPaymentsQuery,
  useUpdatePaymentStatusMutation,
} from '@/features/admin/hooks/useAdminQueries';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { getExportPayments } from '@/features/admin/api/admin.service';

export const PaymentsPage: React.FC = () => {
  const toast = useToast();

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'paymentTime',
    sortOrder: 'DESC' as 'ASC' | 'DESC',
    status: '',
  });

  // Queries
  const { data: paymentsRes, isLoading, refetch } = useAdminPaymentsQuery(params);

  // Mutations
  const updateStatusMutation = useUpdatePaymentStatusMutation();

  // Dialog & Lightbox State
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    paymentId: string;
    studentName: string;
    action: 'approved' | 'rejected';
  }>({
    isOpen: false,
    paymentId: '',
    studentName: '',
    action: 'approved',
  });

  const payments = paymentsRes?.ok ? paymentsRes.data.items : [];
  const total = paymentsRes?.ok ? paymentsRes.data.total : 0;

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleSort = (key: string, order: 'ASC' | 'DESC') => {
    setParams((prev) => ({ ...prev, sortBy: key, sortOrder: order }));
  };

  const handleStatusChangeClick = (row: any, action: 'approved' | 'rejected') => {
    setDialogState({
      isOpen: true,
      paymentId: row.paymentId,
      studentName: row.registration?.student?.nameMm || row.payerName,
      action,
    });
  };

  const handleConfirmStatusChange = (remarks?: string) => {
    updateStatusMutation.mutate(
      {
        id: dialogState.paymentId,
        status: dialogState.action,
        remarks,
      },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success(
              `${dialogState.studentName} ၏ ငွေပေးသွင်းမှုကို ${
                dialogState.action === 'approved' ? 'လက်ခံလိုက်ပါပြီ' : 'ငြင်းပယ်လိုက်ပါပြီ'
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

  const cleanImgUrl = (path: string) => {
    if (!path) return '';
    const cleaned = path.replace(/\\/g, '/');
    return cleaned.startsWith('/') ? cleaned : '/' + cleaned;
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const res = await getExportPayments({
        status: params.status,
      });
      if (res.ok && res.data.length > 0) {
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
        link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('ငွေပေးချေမှု CSV ထုတ်ယူမှု အောင်မြင်ပါသည်။');
      } else {
        toast.warning('ထုတ်ယူရန် ဒေတာမရှိပါ။');
      }
    } catch {
      toast.error('ထုတ်ယူမှု မအောင်မြင်ပါ။');
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge content="အောင်မြင်သည်" variant="success" />;
      case 'rejected':
        return <Badge content="ငြင်းပယ်သည်" variant="danger" />;
      case 'pending':
        return <Badge content="စိစစ်ဆဲ" variant="warning" />;
      default:
        return <Badge content={status} variant="draft" />;
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'studentName',
      header: 'ကျောင်းသားအမည်',
      render: (row) => row.registration?.student?.nameMm || '-',
    },
    { key: 'payerName', header: 'ငွေပေးသွင်းသူအမည်', sortable: true },
    { key: 'transactionCode', header: 'ကုဒ် (ဂဏန်း၆လုံး)', sortable: true },
    {
      key: 'paymentTime',
      header: 'တင်သွင်းချိန်',
      sortable: true,
      render: (row) => new Date(row.paymentTime).toLocaleString(),
    },
    {
      key: 'status',
      header: 'ပြေစာအခြေအနေ',
      sortable: true,
      render: (row) => getPaymentBadge(row.status),
    },
    {
      key: 'receipt',
      header: 'ပြေစာပုံ',
      render: (row) =>
        row.paymentScreenshot ? (
          <button
            onClick={() => setLightboxImg(cleanImgUrl(row.paymentScreenshot))}
            className="text-xs text-blue-600 font-semibold hover:text-blue-800"
          >
            ပြေစာကြည့်ရန်
          </button>
        ) : (
          '-'
        ),
    },
    {
      key: 'actions',
      header: 'လုပ်ဆောင်ချက်များ',
      render: (row) => {
        if (row.status !== 'pending') return '-';
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChangeClick(row, 'approved')}
              className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
            >
              လက်ခံမည်
            </button>
            <button
              onClick={() => handleStatusChangeClick(row, 'rejected')}
              className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              ငြင်းပယ်မည်
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="ငွေပေးသွင်းမှုများ"
        breadcrumbs={[{ label: 'Admin' }, { label: 'ငွေပေးချေမှုများ' }]}
        actions={
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            ပြေစာအစီရင်ခံစာ ထုတ်ရန်
          </Button>
        }
      />

      {/* Filter Options */}
      <div className="p-4 bg-white border border-gray-150 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">ငွေသွင်းသူအမည်/ကုဒ် ရှာရန်</label>
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
            <option value="pending">စိစစ်ဆဲ</option>
            <option value="approved">အောင်မြင်သည်</option>
            <option value="rejected">ငြင်းပယ်သည်</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={isLoading}
        page={params.page}
        limit={params.limit}
        total={total}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
      />

      {/* Receipt Lightbox */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxImg}
            alt="Receipt preview"
            className="max-h-[92vh] max-w-[92vw] object-contain rounded shadow-2xl"
          />
        </div>
      )}

      {/* Confirm Approve/Reject Payment */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmStatusChange}
        title={dialogState.action === 'approved' ? 'ငွေသွင်းပြေစာ လက်ခံရန် အတည်ပြုချက်' : 'ငွေသွင်းပြေစာ ငြင်းပယ်ရန် အတည်ပြုချက်'}
        message={`ကျောင်းသား "${dialogState.studentName}" ၏ ငွေပေးချေမှုပြေစာအား ${
          dialogState.action === 'approved' ? 'လက်ခံရန် သေချာပါသလား?' : 'ငြင်းပယ်ရန် သေချာပါသလား?'
        }`}
        variant={dialogState.action === 'approved' ? 'success' : 'danger'}
        requireRemarks={dialogState.action === 'rejected'}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
};

export default PaymentsPage;
