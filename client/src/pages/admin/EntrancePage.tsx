import React, { useState } from 'react';
import { useAdminEntranceQuery } from '@/features/admin/hooks/useAdminQueries';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { getStatusBadge } from '@/components/ui/Badge';

export const EntrancePage: React.FC = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC' as 'ASC' | 'DESC',
    isClaimed: '',
  });

  const { data: entranceRes, isLoading } = useAdminEntranceQuery(params);

  const entrance = entranceRes?.ok ? entranceRes.data.items : [];
  const total = entranceRes?.ok ? entranceRes.data.total : 0;

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleSort = (key: string, order: 'ASC' | 'DESC') => {
    setParams((prev) => ({ ...prev, sortBy: key, sortOrder: order }));
  };

  const columns: Column<any>[] = [
    { key: 'examYear', header: 'တက္ကသိုလ်ဝင်တန်းခုနှစ်', sortable: true },
    { key: 'matricExamRollNo', header: 'တက္ကသိုလ်ဝင်တန်းခုံအမှတ်', sortable: true },
    { key: 'applicantNameMm', header: 'အမည်', sortable: true },
    { key: 'fatherNameMm', header: 'ဖခင်အမည်', sortable: true },
    { key: 'nrcNumber', header: 'မှတ်ပုံတင်အမှတ်' },
    { key: 'totalScore', header: 'ရမှတ်', sortable: true },
    {
      key: 'isClaimed',
      header: 'မှတ်ပုံတင်မှုအခြေအနေ',
      render: (row) => getStatusBadge(row.isClaimed ? 'claimed' : 'unclaimed'),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="ဝင်ခွင့်ရကျောင်းသားများစာရင်း"
        breadcrumbs={[{ label: 'Admin' }, { label: 'ဝင်ခွင့်စာရင်းများ' }]}
      />

      {/* Filters & Search Block */}
      <div className="p-4 bg-white border border-gray-150 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">အမည်/ခုံအမှတ်/NRC ရှာရန်</label>
          <SearchInput
            value={params.search}
            onChange={(val) => setParams((prev) => ({ ...prev, search: val, page: 1 }))}
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">အကောင့်ဖွင့်ပြီးမှု</label>
          <select
            value={params.isClaimed}
            onChange={(e) => setParams((prev) => ({ ...prev, isClaimed: e.target.value, page: 1 }))}
            className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">အားလုံး</option>
            <option value="false">အကောင့်မဖွင့်ရသေး</option>
            <option value="true">အကောင့်ဖွင့်ပြီး</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={entrance}
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
    </div>
  );
};

export default EntrancePage;
