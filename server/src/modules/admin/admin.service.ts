import { Repository, Like, In, Not } from 'typeorm';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../database/data-source';
import { Account } from '../../database/entities/Account';
import { StudentProfile } from '../../database/entities/StudentProfile';
import { SemesterRegistration } from '../../database/entities/SemesterRegistration';
import { Payment } from '../../database/entities/Payment';
import { PaymentHistory } from '../../database/entities/PaymentHistory';
import { EntranceRegistration } from '../../database/entities/EntranceRegistration';
import { Major } from '../../database/entities/Major';
import { AcademicYear } from '../../database/entities/AcademicYear';
import { Semester } from '../../database/entities/Semester';
import AppError from '../../common/utils/AppError';
import {
  AdminListStudentsInput,
  AdminListPaymentsInput,
  AdminListEntranceInput,
  AdminListAccountsInput,
  AdminCreateAccountInput,
} from './admin.schema';

const AccountRepository = AppDataSource.getRepository(Account);
const StudentProfileRepository = AppDataSource.getRepository(StudentProfile);
const SemesterRegistrationRepository = AppDataSource.getRepository(SemesterRegistration);
const PaymentRepository = AppDataSource.getRepository(Payment);
const PaymentHistoryRepository = AppDataSource.getRepository(PaymentHistory);
const EntranceRepository = AppDataSource.getRepository(EntranceRegistration);

export class AdminService {
  /** List and paginate students with filters, sorting, and search */
  async listStudents(query: AdminListStudentsInput) {
    const { page, limit, search, sortBy, sortOrder, status, majorCode, academicYearId, semesterId } = query;
    const skip = (page - 1) * limit;

    const qb = StudentProfileRepository.createQueryBuilder('profile')
      .leftJoinAndSelect('profile.account', 'account')
      .leftJoinAndSelect('profile.parentProfile', 'parent')
      .leftJoinAndSelect('profile.addresses', 'addresses')
      .leftJoinAndSelect('profile.registrations', 'semReg')
      .leftJoinAndSelect('semReg.academicYear', 'academicYear')
      .leftJoinAndSelect('semReg.semester', 'semester')
      .leftJoinAndSelect('semReg.major', 'major');

    // Filters
    if (status) {
      qb.andWhere('account.applicationStatus = :status', { status });
    }
    if (majorCode) {
      qb.andWhere('semReg.majorCode = :majorCode', { majorCode });
    }
    if (academicYearId) {
      qb.andWhere('semReg.academicYearId = :academicYearId', { academicYearId });
    }
    if (semesterId) {
      qb.andWhere('semReg.semesterId = :semesterId', { semesterId });
    }

    // Search on name (MM/EN), NRC, email
    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      qb.andWhere(
        '(profile.nameMm LIKE :search OR profile.nameEn LIKE :search OR profile.studentNrc LIKE :search OR account.email LIKE :search)',
        { search: searchPattern }
      );
    }

    // Sort
    const sortFieldMap: Record<string, string> = {
      nameMm: 'profile.nameMm',
      nameEn: 'profile.nameEn',
      studentNrc: 'profile.studentNrc',
      status: 'account.applicationStatus',
      createdAt: 'profile.createdAt',
    };
    const sortField = sortFieldMap[sortBy] ?? 'profile.createdAt';
    qb.orderBy(sortField, sortOrder);

    // Paginate
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /** Get student details by ID */
  async getStudentDetail(studentId: number) {
    const student = await StudentProfileRepository.findOne({
      where: { studentId },
      relations: [
        'account',
        'account.entrance',
        'parentProfile',
        'addresses',
        'addresses.township',
        'addresses.township.district',
        'addresses.township.district.state',
        'photo',
        'registrations',
        'registrations.academicYear',
        'registrations.semester',
        'registrations.major',
        'registrations.payment',
      ],
    });

    if (!student) {
      throw AppError.notFound('Student not found.');
    }
    return student;
  }

  /** Update student account status (APPROVED/REJECTED) */
  async updateStudentStatus(studentId: number, status: 'APPROVED' | 'REJECTED', processedById: number) {
    const account = await AccountRepository.findOne({ where: { id: studentId } });
    if (!account) {
      throw AppError.notFound('Account not found.');
    }

    account.applicationStatus = status;
    await AccountRepository.save(account);

    // If approved, verify the student registration can proceed
    return account;
  }

  /** Assign a university roll number to a student's latest semester registration */
  async assignRollNumber(studentId: number, rollNo: string, processedById: number) {
    const reg = await SemesterRegistrationRepository.findOne({
      where: { studentId },
      order: { appliedDate: 'DESC' },
    });

    if (!reg) {
      throw AppError.notFound('Active semester registration not found for this student.');
    }

    reg.rollNo = rollNo;
    reg.rollNoAssignedAt = new Date();
    reg.processedById = processedById;
    reg.processedDate = new Date();
    
    await SemesterRegistrationRepository.save(reg);
    return reg;
  }

  /** List and paginate payment records */
  async listPayments(query: AdminListPaymentsInput) {
    const { page, limit, search, sortBy, sortOrder, status } = query;
    const skip = (page - 1) * limit;

    const qb = PaymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.registration', 'registration')
      .leftJoinAndSelect('registration.student', 'student')
      .leftJoinAndSelect('student.account', 'account')
      .leftJoinAndSelect('registration.semester', 'semester')
      .leftJoinAndSelect('registration.major', 'major')
      .leftJoinAndSelect('payment.processedBy', 'processedBy');

    if (status) {
      qb.andWhere('payment.status = :status', { status });
    }

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      qb.andWhere(
        '(student.nameMm LIKE :search OR student.nameEn LIKE :search OR payment.transactionCode LIKE :search OR payment.payerName LIKE :search)',
        { search: searchPattern }
      );
    }

    const sortFieldMap: Record<string, string> = {
      payerName: 'payment.payerName',
      transactionCode: 'payment.transactionCode',
      paymentTime: 'payment.paymentTime',
      status: 'payment.status',
    };
    const sortField = sortFieldMap[sortBy] ?? 'payment.paymentTime';
    qb.orderBy(sortField, sortOrder);

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /** Approve/Reject payment, create payment history, and transition account status */
  async updatePaymentStatus(paymentId: string, status: 'approved' | 'rejected', processedById: number, remarks?: string) {
    const payment = await PaymentRepository.findOne({
      where: { paymentId },
      relations: ['registration', 'registration.student', 'registration.student.account'],
    });

    if (!payment) {
      throw AppError.notFound('Payment record not found.');
    }

    await AppDataSource.transaction(async (manager) => {
      const paymentRepo = manager.getRepository(Payment);
      const historyRepo = manager.getRepository(PaymentHistory);
      const accountRepo = manager.getRepository(Account);

      payment.status = status;
      payment.processedById = processedById;
      await paymentRepo.save(payment);

      // Save to PaymentHistory
      const history = historyRepo.create({
        paymentId,
        status,
        processedById,
        remarks: remarks || '',
      });
      await historyRepo.save(history);

      // Transition account status
      const account = payment.registration?.student?.account;
      if (account) {
        if (status === 'approved') {
          account.applicationStatus = 'APPROVED';
        } else {
          account.applicationStatus = 'REJECTED';
        }
        await accountRepo.save(account);
      }
    });

    return payment;
  }

  /** List and paginate entrance records */
  async listEntranceRecords(query: AdminListEntranceInput) {
    const { page, limit, search, sortBy, sortOrder, isClaimed } = query;
    const skip = (page - 1) * limit;

    const qb = EntranceRepository.createQueryBuilder('entrance');

    if (isClaimed) {
      qb.andWhere('entrance.isClaimed = :isClaimed', { isClaimed: isClaimed === 'true' });
    }

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      qb.andWhere(
        '(entrance.applicantNameMm LIKE :search OR entrance.fatherNameMm LIKE :search OR entrance.matricExamRollNo LIKE :search OR entrance.nrcNumber LIKE :search)',
        { search: searchPattern }
      );
    }

    const sortFieldMap: Record<string, string> = {
      applicantNameMm: 'entrance.applicantNameMm',
      totalScore: 'entrance.totalScore',
      examYear: 'entrance.examYear',
    };
    const sortField = sortFieldMap[sortBy] ?? 'entrance.createdAt';
    qb.orderBy(sortField, sortOrder);

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /** Get metrics overview counts for the Dashboard page */
  async getDashboardStats() {
    const totalStudents = await StudentProfileRepository.count();
    
    // Status counts
    const pendingProfile = await AccountRepository.count({ where: { applicationStatus: 'PROFILE_COMPLETED' } });
    const pendingDocuments = await AccountRepository.count({ where: { applicationStatus: 'DOCUMENTS_UPLOADED' } });
    const pendingPayment = await AccountRepository.count({ where: { applicationStatus: 'PAYMENT_SUBMITTED' } });
    const approved = await AccountRepository.count({ where: { applicationStatus: 'APPROVED' } });
    const rejected = await AccountRepository.count({ where: { applicationStatus: 'REJECTED' } });

    // Payment counts
    const pendingPaymentsCount = await PaymentRepository.count({ where: { status: 'pending' } });
    const approvedPaymentsCount = await PaymentRepository.count({ where: { status: 'approved' } });

    return {
      totalStudents,
      pendingProfile,
      pendingDocuments,
      pendingPayment,
      approved,
      rejected,
      pendingPaymentsCount,
      approvedPaymentsCount,
    };
  }

  /** List accounts with pagination and role filters (excluding student accounts) */
  async listAccounts(query: AdminListAccountsInput) {
    const { page, limit, search, sortBy, sortOrder, role } = query;
    const skip = (page - 1) * limit;

    const qb = AccountRepository.createQueryBuilder('account');
    
    // Exclude students
    qb.where('account.role != :studentRole', { studentRole: 'student' });

    if (role) {
      qb.andWhere('account.role = :role', { role });
    }

    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      qb.andWhere('account.email LIKE :search', { search: searchPattern });
    }

    const sortFieldMap: Record<string, string> = {
      email: 'account.email',
      role: 'account.role',
      createdAt: 'account.createdAt',
    };
    const sortField = sortFieldMap[sortBy] ?? 'account.createdAt';
    qb.orderBy(sortField, sortOrder);

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    
    // Sanitise passwords
    items.forEach((item) => {
      delete (item as any).password;
    });

    return { items, total };
  }

  /** Create a staff/admin account */
  async createStaffAccount(data: AdminCreateAccountInput) {
    const existing = await AccountRepository.findOne({ where: { email: data.email } });
    if (existing) {
      throw AppError.badRequest('This email is already in use.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const account = AccountRepository.create({
      email: data.email,
      password: passwordHash,
      role: data.role,
      isVerified: true, // staff accounts bypass OTP verify
    });

    await AccountRepository.save(account);
    delete (account as any).password;
    return account;
  }

  /** Change an account's role */
  async updateAccountRole(accountId: number, role: 'admin' | 'super' | 'finance' | 'owner', actorRole: string) {
    const account = await AccountRepository.findOne({ where: { id: accountId } });
    if (!account) {
      throw AppError.notFound('Account not found.');
    }

    if (account.role === 'student') {
      throw AppError.badRequest('Cannot change roles of student accounts.');
    }

    // Role Hierarchy enforcement
    if (actorRole === 'super' && (role === 'owner' || account.role === 'owner')) {
      throw AppError.forbidden('Super Admins cannot grant or modify Owner permissions.');
    }

    account.role = role;
    await AccountRepository.save(account);
    delete (account as any).password;
    return account;
  }

  /** Delete a staff/admin account */
  async deleteAccount(accountId: number, actorId: number, actorRole: string) {
    const account = await AccountRepository.findOne({ where: { id: accountId } });
    if (!account) {
      throw AppError.notFound('Account not found.');
    }

    if (account.id === actorId) {
      throw AppError.badRequest('You cannot delete your own account.');
    }

    // Hierarchy check: Super admin cannot delete owner, and can't delete another super admin
    if (actorRole === 'super') {
      if (account.role === 'owner' || account.role === 'super') {
        throw AppError.forbidden('You do not have permission to delete this account.');
      }
    }

    await AccountRepository.delete(accountId);
    return true;
  }

  /** Raw student records for CSV export */
  async exportStudentsCSV(query: any) {
    const qb = StudentProfileRepository.createQueryBuilder('profile')
      .leftJoinAndSelect('profile.account', 'account')
      .leftJoinAndSelect('profile.registrations', 'semReg')
      .leftJoinAndSelect('semReg.academicYear', 'academicYear')
      .leftJoinAndSelect('semReg.semester', 'semester')
      .leftJoinAndSelect('semReg.major', 'major');

    if (query.status) {
      qb.andWhere('account.applicationStatus = :status', { status: query.status });
    }
    if (query.majorCode) {
      qb.andWhere('semReg.majorCode = :majorCode', { majorCode: query.majorCode });
    }

    const students = await qb.getMany();
    return students.map((s) => {
      const reg = s.registrations?.[0];
      return {
        StudentID: s.studentId,
        NameMM: s.nameMm,
        NameEN: s.nameEn,
        Gender: s.gender,
        NRC: s.studentNrc,
        Phone: s.phoneNumber,
        Email: s.account?.email,
        Major: reg?.major?.majorNameMm || reg?.majorCode,
        AcademicYear: reg?.academicYearId,
        Semester: reg?.semester?.semesterName,
        UniversityRollNo: reg?.rollNo || 'မသတ်မှတ်ရသေးပါ',
        ApplicationStatus: s.account?.applicationStatus,
      };
    });
  }

  /** Raw payment records for CSV export */
  async exportPaymentsCSV(query: any) {
    const qb = PaymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.registration', 'registration')
      .leftJoinAndSelect('registration.student', 'student')
      .leftJoinAndSelect('registration.semester', 'semester');

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    const payments = await qb.getMany();
    return payments.map((p) => ({
      PaymentID: p.paymentId,
      StudentName: p.registration?.student?.nameMm,
      PayerName: p.payerName,
      TransactionCode: p.transactionCode,
      Status: p.status,
      SubmittedAt: p.paymentTime,
      Semester: p.registration?.semester?.semesterName,
    }));
  }

  /** Multi-student semester registration trigger */
  async triggerSemesterRegistration(academicYearId: string, semesterId: number, processedById: number) {
    // Get all accounts with APPROVED applicationStatus
    const approvedAccounts = await AccountRepository.find({
      where: { applicationStatus: 'APPROVED' },
    });

    if (approvedAccounts.length === 0) {
      throw AppError.badRequest('No approved students found to register for the semester.');
    }

    const registrationRepo = AppDataSource.getRepository(SemesterRegistration);

    let count = 0;
    await AppDataSource.transaction(async (manager) => {
      const mRegRepo = manager.getRepository(SemesterRegistration);
      
      for (const account of approvedAccounts) {
        // Find latest student registration to copy the major
        const latestReg = await registrationRepo.findOne({
          where: { studentId: account.id },
          order: { appliedDate: 'DESC' },
        });

        const majorCode = latestReg?.majorCode || 'CST';

        // Check if registration already exists for this semester + year
        const exists = await mRegRepo.findOne({
          where: {
            studentId: account.id,
            academicYearId,
            semesterId,
          },
        });

        if (!exists) {
          const newReg = mRegRepo.create({
            studentId: account.id,
            academicYearId,
            semesterId,
            majorCode,
            processedById,
            processedDate: new Date(),
          });
          await mRegRepo.save(newReg);
          count++;
        }
      }
    });

    return { processedCount: count };
  }
}
