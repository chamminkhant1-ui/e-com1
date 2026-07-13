import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AdminService } from './admin.service';
import type { AuthTokenPayload } from '../../common/utils/jwt.utils';
import AppError from '../../common/utils/AppError';
import {
  AdminAssignRollNumberInput,
  AdminUpdateStudentStatusInput,
  AdminUpdatePaymentStatusInput,
  AdminCreateAccountInput,
  AdminUpdateAccountRoleInput,
} from './admin.schema';

const adminService = new AdminService();

export class AdminController {
  listStudents = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req as any).validatedQuery ?? req.query;
    const result = await adminService.listStudents(payload);
    res.status(200).json({ ok: true, message: 'Students retrieved successfully.', data: result });
  });

  getStudentDetail = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);
    if (isNaN(studentId)) {
      throw AppError.badRequest('Invalid student ID');
    }
    const student = await adminService.getStudentDetail(studentId);
    res.status(200).json({ ok: true, message: 'Student detail retrieved.', data: student });
  });

  updateStudentStatus = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);
    if (isNaN(studentId)) {
      throw AppError.badRequest('Invalid student ID');
    }
    const user = (req as any).user as AuthTokenPayload;
    const payload = ((req as any).validatedBody ?? req.body) as AdminUpdateStudentStatusInput;

    const account = await adminService.updateStudentStatus(studentId, payload.status, user.id);
    res.status(200).json({ ok: true, message: 'Student status updated.', data: account });
  });

  assignRollNumber = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(req.params.id);
    if (isNaN(studentId)) {
      throw AppError.badRequest('Invalid student ID');
    }
    const user = (req as any).user as AuthTokenPayload;
    const payload = ((req as any).validatedBody ?? req.body) as AdminAssignRollNumberInput;

    const reg = await adminService.assignRollNumber(studentId, payload.rollNo, user.id);
    res.status(200).json({ ok: true, message: 'Roll number assigned.', data: reg });
  });

  listPayments = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req as any).validatedQuery ?? req.query;
    const result = await adminService.listPayments(payload);
    res.status(200).json({ ok: true, message: 'Payments retrieved successfully.', data: result });
  });

  updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = req.params.id as string;
    const user = (req as any).user as any;
    const payload = ((req as any).validatedBody ?? req.body) as AdminUpdatePaymentStatusInput;

    const payment = await adminService.updatePaymentStatus(paymentId, payload.status, user.id, payload.remarks);
    res.status(200).json({ ok: true, message: 'Payment status updated.', data: payment });
  });

  listEntrance = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req as any).validatedQuery ?? req.query;
    const result = await adminService.listEntranceRecords(payload);
    res.status(200).json({ ok: true, message: 'Entrance records retrieved.', data: result });
  });

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ ok: true, message: 'Dashboard stats retrieved.', data: stats });
  });

  listAccounts = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req as any).validatedQuery ?? req.query;
    const result = await adminService.listAccounts(payload);
    res.status(200).json({ ok: true, message: 'Staff accounts retrieved.', data: result });
  });

  createAccount = asyncHandler(async (req: Request, res: Response) => {
    const payload = ((req as any).validatedBody ?? req.body) as AdminCreateAccountInput;
    const account = await adminService.createStaffAccount(payload);
    res.status(201).json({ ok: true, message: 'Staff account created successfully.', data: account });
  });

  updateAccountRole = asyncHandler(async (req: Request, res: Response) => {
    const accountId = Number(req.params.id);
    if (isNaN(accountId)) {
      throw AppError.badRequest('Invalid account ID');
    }
    const actor = (req as any).user as any;
    const payload = ((req as any).validatedBody ?? req.body) as AdminUpdateAccountRoleInput;

    const account = await adminService.updateAccountRole(accountId, payload.role, actor.role);
    res.status(200).json({ ok: true, message: 'Account role updated.', data: account });
  });

  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const accountId = Number(req.params.id);
    if (isNaN(accountId)) {
      throw AppError.badRequest('Invalid account ID');
    }
    const actor = (req as any).user as any;

    await adminService.deleteAccount(accountId, actor.id, actor.role);
    res.status(200).json({ ok: true, message: 'Account deleted successfully.' });
  });

  exportStudents = asyncHandler(async (req: Request, res: Response) => {
    const students = await adminService.exportStudentsCSV(req.query);
    res.status(200).json({ ok: true, message: 'Students export data retrieved.', data: students });
  });

  exportPayments = asyncHandler(async (req: Request, res: Response) => {
    const payments = await adminService.exportPaymentsCSV(req.query);
    res.status(200).json({ ok: true, message: 'Payments export data retrieved.', data: payments });
  });

  triggerSemesterRegistration = asyncHandler(async (req: Request, res: Response) => {
    const { academicYearId, semesterId } = req.body;
    if (!academicYearId || !semesterId) {
      throw AppError.badRequest('academicYearId and semesterId are required.');
    }
    const user = (req as any).user as AuthTokenPayload;
    const result = await adminService.triggerSemesterRegistration(academicYearId, Number(semesterId), user.id);
    res.status(200).json({ ok: true, message: `${result.processedCount} students registered for the new semester.`, data: result });
  });
}
