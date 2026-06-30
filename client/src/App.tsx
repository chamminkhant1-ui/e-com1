import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from '@/pages/Login';
import { FirstYearRegistration } from '@/pages/FirstYearRegistration';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

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
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path='/' element={<Login />} />
          <Route path='/first-year-registration' element={<FirstYearRegistration />} />

          {/* Protected - any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path='/dashboard' element={<div>Protected dashboard</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
