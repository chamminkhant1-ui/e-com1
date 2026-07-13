import { z } from 'zod';
import { TableQuerySchema } from '../../common/schemas/pagination.schema';
import { ApplicationStatus, PaymentStatus, Role } from '../../database/entities/types';

export const AdminSchema = {
  listStudents: TableQuerySchema.extend({
    status: z.string().optional(),
    majorCode: z.string().optional(),
    academicYearId: z.string().optional(),
    semesterId: z.string().optional(),
  }),

  assignRollNumber: z.object({
    rollNo: z.string().min(1, 'Roll number is required'),
  }),

  updateStudentStatus: z.object({
    status: z.enum(['APPROVED', 'REJECTED'] as const),
    remarks: z.string().optional(),
  }),

  listPayments: TableQuerySchema.extend({
    status: z.string().optional(),
  }),

  updatePaymentStatus: z.object({
    status: z.enum(['approved', 'rejected'] as const),
    remarks: z.string().optional(),
  }),

  listEntrance: TableQuerySchema.extend({
    isClaimed: z.string().optional(),
  }),

  listAccounts: TableQuerySchema.extend({
    role: z.string().optional(),
  }),

  createAccount: z.object({
    email: z.string().email('Must be a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['admin', 'super', 'finance'] as const),
  }),

  updateAccountRole: z.object({
    role: z.enum(['admin', 'super', 'finance', 'owner'] as const),
  }),
};

export type AdminListStudentsInput = z.infer<typeof AdminSchema.listStudents>;
export type AdminAssignRollNumberInput = z.infer<typeof AdminSchema.assignRollNumber>;
export type AdminUpdateStudentStatusInput = z.infer<typeof AdminSchema.updateStudentStatus>;
export type AdminListPaymentsInput = z.infer<typeof AdminSchema.listPayments>;
export type AdminUpdatePaymentStatusInput = z.infer<typeof AdminSchema.updatePaymentStatus>;
export type AdminListEntranceInput = z.infer<typeof AdminSchema.listEntrance>;
export type AdminListAccountsInput = z.infer<typeof AdminSchema.listAccounts>;
export type AdminCreateAccountInput = z.infer<typeof AdminSchema.createAccount>;
export type AdminUpdateAccountRoleInput = z.infer<typeof AdminSchema.updateAccountRole>;
