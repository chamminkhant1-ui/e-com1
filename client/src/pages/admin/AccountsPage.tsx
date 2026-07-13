import React, { useState } from 'react';
import {
  useAdminAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountRoleMutation,
  useDeleteAccountMutation,
} from '@/features/admin/hooks/useAdminQueries';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { getRoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';

export const AccountsPage: React.FC = () => {
  const toast = useToast();
  const { user: currentUser } = useAuthUser();

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC' as 'ASC' | 'DESC',
    role: '',
  });

  // Queries
  const { data: accountsRes, isLoading, refetch } = useAdminAccountsQuery(params);

  // Mutations
  const createAccountMut = useCreateAccountMutation();
  const updateRoleMut = useUpdateAccountRoleMutation();
  const deleteAccountMut = useDeleteAccountMutation();

  // Input states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', password: '', role: 'admin' as 'admin' | 'super' | 'finance' });

  // Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; accountId: number; email: string }>({
    isOpen: false,
    accountId: 0,
    email: '',
  });

  const accounts = accountsRes?.ok ? accountsRes.data.items : [];
  const total = accountsRes?.ok ? accountsRes.data.total : 0;

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleSort = (key: string, order: 'ASC' | 'DESC') => {
    setParams((prev) => ({ ...prev, sortBy: key, sortOrder: order }));
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.email || !addForm.password) return;
    createAccountMut.mutate(addForm, {
      onSuccess: (res) => {
        if (res.ok) {
          toast.success('စီမံခန့်ခွဲသူ အကောင့်သစ် ဖွင့်လှစ်ပြီးပါပြီ။');
          setAddForm({ email: '', password: '', role: 'admin' });
          setShowAddModal(false);
          refetch();
        } else {
          toast.error(res.message || 'မအောင်မြင်ပါ။');
        }
      },
      onError: () => {
        toast.error('ဆာဗာချိတ်ဆက်မှု မအောင်မြင်ပါ။');
      },
    });
  };

  const handleRoleChange = (id: number, role: string) => {
    updateRoleMut.mutate(
      { id, role },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast.success('အကောင့် တာဝန်အဆင့်မြှင့်တင်ပြီးပါပြီ။');
            refetch();
          } else {
            toast.error(res.message || 'မအောင်မြင်ပါ။');
          }
        },
      }
    );
  };

  const handleDeleteClick = (row: any) => {
    setDeleteDialog({
      isOpen: true,
      accountId: row.id,
      email: row.email,
    });
  };

  const handleConfirmDelete = () => {
    deleteAccountMut.mutate(deleteDialog.accountId, {
      onSuccess: (res) => {
        if (res.ok) {
          toast.success('စီမံခန့်ခွဲသူအကောင့်ကို ဖျက်ပစ်ပြီးပါပြီ။');
          refetch();
        } else {
          toast.error(res.message || 'မအောင်မြင်ပါ။');
        }
        setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onError: () => {
        toast.error('ဆာဗာချိတ်ဆက်မှု မအောင်မြင်ပါ။');
        setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const columns: Column<any>[] = [
    { key: 'email', header: 'အီးမေးလ်', sortable: true },
    {
      key: 'role',
      header: 'တာဝန်/အခွင့်အာဏာ',
      sortable: true,
      render: (row) => {
        const isSelf = row.id === currentUser?.id;
        const isOwner = currentUser?.role === 'owner';
        const isSuper = currentUser?.role === 'super';
        
        // Disable role changes on yourself, or if you don't have enough permission
        const disabled = isSelf || (!isOwner && !isSuper) || (row.role === 'owner' && !isSelf);

        if (disabled) {
          return getRoleBadge(row.role);
        }

        return (
          <select
            value={row.role}
            onChange={(e) => handleRoleChange(row.id, e.target.value)}
            className="block text-xs text-gray-700 bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="finance">Finance</option>
            <option value="super">Super Admin</option>
            {isOwner && <option value="owner">Owner</option>}
          </select>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'ပြုလုပ်သည့်နေ့ရက်',
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-GB'),
    },
    {
      key: 'actions',
      header: 'လုပ်ဆောင်ချက်',
      render: (row) => {
        const isSelf = row.id === currentUser?.id;
        const isHigherRank = row.role === 'owner' && currentUser?.role !== 'owner';
        const isSameRank = row.role === currentUser?.role;

        if (isSelf || isHigherRank || isSameRank) return '-';

        return (
          <button
            onClick={() => handleDeleteClick(row)}
            className="text-xs text-red-655 font-semibold hover:text-red-800"
          >
            ဖျက်မည်
          </button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="တာဝန်ခံအကောင့်များစီမံခန့်ခွဲမှု"
        breadcrumbs={[{ label: 'Admin' }, { label: 'အကောင့်များ' }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            အကောင့်အသစ် ဖွင့်လှစ်ရန်
          </Button>
        }
      />

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-150 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">အီးမေးလ် ရှာရန်</label>
          <SearchInput
            value={params.search}
            onChange={(val) => setParams((prev) => ({ ...prev, search: val, page: 1 }))}
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">အခွင့်အာဏာ</label>
          <select
            value={params.role}
            onChange={(e) => setParams((prev) => ({ ...prev, role: e.target.value, page: 1 }))}
            className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">အားလုံး</option>
            <option value="admin">Admin</option>
            <option value="finance">Finance</option>
            <option value="super">Super Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <DataTable
        columns={columns}
        data={accounts}
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

      {/* Add Staff Account Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 no-print">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl border border-gray-150">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">တာဝန်ခံအကောင့်အသစ် ဖွင့်လှစ်ရန်</h3>
            <p className="text-xs text-gray-500 mb-4 leading-normal">
              စီမံခန့်ခွဲမှုစနစ်ကို ဝင်ရောက်ကိုင်တွယ်မည့် ဝန်ထမ်းအကောင့်အတွက် အီးမေးလ်နှင့် စကားဝှက် သတ်မှတ်ပေးပါ။
            </p>

            <form onSubmit={handleCreateAccount} className="flex flex-col gap-4 text-sm">
              <div>
                <label className="block text-gray-500 font-bold mb-1">အီးမေးလ်</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">စကားဝှက်</label>
                <input
                  type="password"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">တာဝန်ခံအမျိုးအစား</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, role: e.target.value as any }))}
                  className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="finance">Finance</option>
                  <option value="super">Super Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  မလုပ်တော့ပါ
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={createAccountMut.isPending}>
                  အကောင့်ဖွင့်မည်
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Account Confirm */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title="ဝန်ထမ်းအကောင့်အား ဖျက်သိမ်းရန် အတည်ပြုချက်"
        message={`"${deleteDialog.email}" ၏ ဝန်ထမ်းအကောင့်အား စနစ်ထဲမှ ရာသက်ပန် ဖျက်သိမ်းပစ်ရန် သေချာပါသလား?`}
        variant="danger"
        isLoading={deleteAccountMut.isPending}
      />
    </div>
  );
};

export default AccountsPage;
