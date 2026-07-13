import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

// ── Admin Endpoints ────────────────────────────────────────────────────────
export const getDashboardStats = async (): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/admin/dashboard/stats');
  return res.data;
};

export const listStudents = async (params: any): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/admin/students', { params });
  return res.data;
};

export const getStudentDetail = async (id: number): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>(`/admin/students/${id}`);
  return res.data;
};

export const updateStudentStatus = async (
  id: number,
  status: 'APPROVED' | 'REJECTED',
  remarks?: string
): Promise<ApiResponse<any>> => {
  const res = await api.patch<ApiResponse<any>>(`/admin/students/${id}/status`, { status, remarks });
  return res.data;
};

export const assignRollNumber = async (id: number, rollNo: string): Promise<ApiResponse<any>> => {
  const res = await api.patch<ApiResponse<any>>(`/admin/students/${id}/roll-number`, { rollNo });
  return res.data;
};

export const listPayments = async (params: any): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/admin/payments', { params });
  return res.data;
};

export const updatePaymentStatus = async (
  id: string,
  status: 'approved' | 'rejected',
  remarks?: string
): Promise<ApiResponse<any>> => {
  const res = await api.patch<ApiResponse<any>>(`/admin/payments/${id}/status`, { status, remarks });
  return res.data;
};

export const listEntrance = async (params: any): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/admin/entrance', { params });
  return res.data;
};

export const listAccounts = async (params: any): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/admin/accounts', { params });
  return res.data;
};

export const createAccount = async (data: any): Promise<ApiResponse<any>> => {
  const res = await api.post<ApiResponse<any>>('/admin/accounts', data);
  return res.data;
};

export const updateAccountRole = async (id: number, role: string): Promise<ApiResponse<any>> => {
  const res = await api.patch<ApiResponse<any>>(`/admin/accounts/${id}/role`, { role });
  return res.data;
};

export const deleteAccount = async (id: number): Promise<ApiResponse<any>> => {
  const res = await api.delete<ApiResponse<any>>(`/admin/accounts/${id}`);
  return res.data;
};

export const getExportStudents = async (params: any): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/admin/students/export', { params });
  return res.data;
};

export const getExportPayments = async (params: any): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/admin/payments/export', { params });
  return res.data;
};

export const triggerSemesterRegistration = async (
  academicYearId: string,
  semesterId: number
): Promise<ApiResponse<any>> => {
  const res = await api.post<ApiResponse<any>>('/admin/semester-registration/trigger', {
    academicYearId,
    semesterId,
  });
  return res.data;
};

// ── Academic Endpoints ─────────────────────────────────────────────────────
export const listMajors = async (): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/academic/majors');
  return res.data;
};

export const createMajor = async (data: any): Promise<ApiResponse<any>> => {
  const res = await api.post<ApiResponse<any>>('/academic/majors', data);
  return res.data;
};

export const updateMajor = async (code: string, data: any): Promise<ApiResponse<any>> => {
  const res = await api.patch<ApiResponse<any>>(`/academic/majors/${code}`, data);
  return res.data;
};

export const deleteMajor = async (code: string): Promise<ApiResponse<any>> => {
  const res = await api.delete<ApiResponse<any>>(`/academic/majors/${code}`);
  return res.data;
};

export const listAcademicYears = async (): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/academic/years');
  return res.data;
};

export const createAcademicYear = async (data: any): Promise<ApiResponse<any>> => {
  const res = await api.post<ApiResponse<any>>('/academic/years', data);
  return res.data;
};

export const updateAcademicYear = async (id: string, data: any): Promise<ApiResponse<any>> => {
  const res = await api.patch<ApiResponse<any>>(`/academic/years/${id}`, data);
  return res.data;
};

export const listSemesters = async (): Promise<ApiResponse<any>> => {
  const res = await api.get<ApiResponse<any>>('/academic/semesters');
  return res.data;
};

export const createSemester = async (data: any): Promise<ApiResponse<any>> => {
  const res = await api.post<ApiResponse<any>>('/academic/semesters', data);
  return res.data;
};

export const updateSemester = async (id: number, data: any): Promise<ApiResponse<any>> => {
  const res = await api.patch<ApiResponse<any>>(`/academic/semesters/${id}`, data);
  return res.data;
};

export const deleteSemester = async (id: number): Promise<ApiResponse<any>> => {
  const res = await api.delete<ApiResponse<any>>(`/academic/semesters/${id}`);
  return res.data;
};
