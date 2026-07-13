import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { useLogoutMutation } from '@/features/auth/hooks/useAuthQueries';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getRoleBadge } from '@/components/ui/Badge';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthUser();
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="ပြင်ဆင်နေပါသည်..." />;
  }

  // If not logged in, or if user is a student role, they shouldn't be here
  if (!user || user.role === 'student') {
    // Redirect to login or student form
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-red-600 mb-2">ခွင့်ပြုချက်မရှိပါ</h2>
          <p className="text-sm text-gray-500 mb-4">ဤစာမျက်နှာအား ဝင်ရောက်ကြည့်ရှုရန် ခွင့်ပြုချက်မရှိပါ။</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-750"
          >
            အကောင့်ထွက်ရန်
          </button>
        </div>
      </div>
    );
  }

  // Filter links by user role
  const role = user.role;
  const showStudents = ['owner', 'super', 'admin'].includes(role);
  const showEntrance = ['owner', 'super', 'admin'].includes(role);
  const showPayments = ['owner', 'super', 'finance'].includes(role);
  const showAcademics = ['owner', 'super'].includes(role);
  const showAccounts = ['owner', 'super'].includes(role);

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ), show: true },
    { to: '/admin/students', label: 'ကျောင်းသားများ', icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ), show: showStudents },
    { to: '/admin/payments', label: 'ငွေပေးချေမှုများ', icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ), show: showPayments },
    { to: '/admin/entrance', label: 'ဝင်ခွင့်စာရင်းများ', icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ), show: showEntrance },
    { to: '/admin/academics', label: 'မေဂျာ/နှစ်/Semester', icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ), show: showAcademics },
    { to: '/admin/accounts', label: 'အကောင့်များ', icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ), show: showAccounts },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Hidden on print */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-150 flex-shrink-0 no-print">
        {/* Brand/Logo */}
        <div className="px-6 py-5 border-b border-gray-150 flex items-center gap-3 bg-white">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            U
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-base">University Portal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-gray-150 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm border border-gray-200">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-gray-900 truncate max-w-[130px]">{user.email}</span>
              {getRoleBadge(user.role)}
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>အကောင့်ထွက်ရန်</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header - Hidden on print */}
        <header className="bg-white border-b border-gray-150 h-16 flex items-center justify-between px-6 flex-shrink-0 no-print">
          <h2 className="text-sm font-semibold text-gray-500 md:hidden">University Portal</h2>
          <div className="hidden md:block" />
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-medium">မြန်မာဘာသာ (Burmese)</span>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
