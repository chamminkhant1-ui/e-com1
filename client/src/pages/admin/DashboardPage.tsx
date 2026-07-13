import React from 'react';
import { useAdminStatsQuery, useAdminStudentsQuery } from '@/features/admin/hooks/useAdminQueries';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getStatusBadge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: statsRes, isLoading: statsLoading } = useAdminStatsQuery();
  const { data: studentsRes, isLoading: studentsLoading } = useAdminStudentsQuery({
    page: 1,
    limit: 5,
    status: 'PAYMENT_SUBMITTED',
  });

  if (statsLoading || studentsLoading) {
    return <LoadingSpinner message="အချက်အလက်များ ဆွဲယူနေပါသည်..." />;
  }

  const stats = statsRes?.ok ? statsRes.data : {};
  const recentStudents = studentsRes?.ok ? studentsRes.data.items : [];

  const columns = [
    { key: 'nameMm', header: 'အမည်' },
    { key: 'studentNrc', header: 'မှတ်ပုံတင်အမှတ်' },
    {
      key: 'status',
      header: 'အခြေအနေ',
      render: (row: any) => getStatusBadge(row.account?.applicationStatus),
    },
    {
      key: 'actions',
      header: 'လုပ်ဆောင်ချက်',
      render: (row: any) => (
        <button
          onClick={() => navigate(`/admin/students/${row.studentId}`)}
          className="text-xs text-blue-600 font-semibold hover:text-blue-800"
        >
          ကြည့်ရှုရန်
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]} />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ကျောင်းသား စုစုပေါင်း"
          value={stats.totalStudents || 0}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="ကိုယ်ရေးအချက်အလက် စိစစ်ဆဲ"
          value={stats.pendingProfile || 0}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatCard
          title="ငွေပေးချေမှု စိစစ်ဆဲ"
          value={stats.pendingPayment || 0}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="လက်ခံပြီးသူများ"
          value={stats.approved || 0}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent submissions table */}
      <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          လတ်တလော ငွေပေးချေမှုတင်သွင်းထားသော ကျောင်းသားများ
        </h3>
        
        <DataTable
          columns={columns}
          data={recentStudents}
          loading={studentsLoading}
          emptyMessage="ငွေပေးသွင်းပြီး စိစစ်ရန် ကျောင်းသား မရှိသေးပါ။"
        />
      </div>
    </div>
  );
};

export default DashboardPage;
