import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from '@/pages/Login';
import { FirstYearRegistration } from '@/pages/FirstYearRegistration';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { StudentRegistrationFormPage } from '@/pages/StudentRegistrationFormPage';

// Admin layout and pages
import { AdminLayout } from '@/layouts/AdminLayout';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { StudentsPage } from '@/pages/admin/StudentsPage';
import { StudentDetailPage } from '@/pages/admin/StudentDetailPage';
import { PaymentsPage } from '@/pages/admin/PaymentsPage';
import { EntrancePage } from '@/pages/admin/EntrancePage';
import { AcademicsPage } from '@/pages/admin/AcademicsPage';
import { AccountsPage } from '@/pages/admin/AccountsPage';

// Toast System
import { ToastProvider } from '@/components/ui/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path='/' element={<Login />} />
            <Route path='/first-year-registration' element={<FirstYearRegistration />} />

            {/* Protected - Student Portal */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path='/dashboard' element={<StudentRegistrationFormPage />} />
            </Route>

            {/* Protected - Admin Panel */}
            <Route element={<ProtectedRoute allowedRoles={['owner', 'super', 'admin', 'finance']} />}>
              <Route element={<AdminLayout />}>
                <Route path='/admin/dashboard' element={<DashboardPage />} />
                <Route path='/admin/students' element={<StudentsPage />} />
                <Route path='/admin/students/:id' element={<StudentDetailPage />} />
                <Route path='/admin/payments' element={<PaymentsPage />} />
                <Route path='/admin/entrance' element={<EntrancePage />} />
                <Route path='/admin/academics' element={<AcademicsPage />} />
                <Route path='/admin/accounts' element={<AccountsPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
