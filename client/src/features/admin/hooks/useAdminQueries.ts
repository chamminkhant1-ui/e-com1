import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from '../api/admin.service';

// Dashboard Metrics
export const useAdminStatsQuery = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getDashboardStats(),
  });
};

// Students
export const useAdminStudentsQuery = (params: any) => {
  return useQuery({
    queryKey: ['admin-students', params],
    queryFn: () => adminService.listStudents(params),
  });
};

export const useAdminStudentDetailQuery = (id: number) => {
  return useQuery({
    queryKey: ['admin-student-detail', id],
    queryFn: () => adminService.getStudentDetail(id),
    enabled: !!id,
  });
};

export const useUpdateStudentStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: number; status: 'APPROVED' | 'REJECTED'; remarks?: string }) =>
      adminService.updateStudentStatus(id, status, remarks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-student-detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

export const useAssignRollNumberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rollNo }: { id: number; rollNo: string }) =>
      adminService.assignRollNumber(id, rollNo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-student-detail', variables.id] });
    },
  });
};

// Payments
export const useAdminPaymentsQuery = (params: any) => {
  return useQuery({
    queryKey: ['admin-payments', params],
    queryFn: () => adminService.listPayments(params),
  });
};

export const useUpdatePaymentStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: 'approved' | 'rejected'; remarks?: string }) =>
      adminService.updatePaymentStatus(id, status, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

// Entrance
export const useAdminEntranceQuery = (params: any) => {
  return useQuery({
    queryKey: ['admin-entrance', params],
    queryFn: () => adminService.listEntrance(params),
  });
};

// Accounts
export const useAdminAccountsQuery = (params: any) => {
  return useQuery({
    queryKey: ['admin-accounts', params],
    queryFn: () => adminService.listAccounts(params),
  });
};

export const useCreateAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
  });
};

export const useUpdateAccountRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      adminService.updateAccountRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
  });
};

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
  });
};

// Semester Registration Trigger
export const useTriggerSemesterRegistrationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ academicYearId, semesterId }: { academicYearId: string; semesterId: number }) =>
      adminService.triggerSemesterRegistration(academicYearId, semesterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

// Academics (Majors, Years, Semesters)
export const useAcademicMajorsQuery = () => {
  return useQuery({
    queryKey: ['academic-majors'],
    queryFn: () => adminService.listMajors(),
  });
};

export const useCreateMajorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.createMajor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-majors'] });
    },
  });
};

export const useUpdateMajorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: any }) => adminService.updateMajor(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-majors'] });
    },
  });
};

export const useDeleteMajorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => adminService.deleteMajor(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-majors'] });
    },
  });
};

export const useAcademicYearsQuery = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: () => adminService.listAcademicYears(),
  });
};

export const useCreateAcademicYearMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.createAcademicYear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  });
};

export const useUpdateAcademicYearMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateAcademicYear(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
  });
};

export const useAcademicSemestersQuery = () => {
  return useQuery({
    queryKey: ['academic-semesters'],
    queryFn: () => adminService.listSemesters(),
  });
};

export const useCreateSemesterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.createSemester(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-semesters'] });
    },
  });
};

export const useUpdateSemesterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminService.updateSemester(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-semesters'] });
    },
  });
};

export const useDeleteSemesterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deleteSemester(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-semesters'] });
    },
  });
};
