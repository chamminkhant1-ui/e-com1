import type { Account } from '../../database/entities/Account';
import { StudentProfile } from '../../database/entities/StudentProfile';
import { AppDataSource } from '../../database/data-source';

export interface AuthUserDto {
  id: number;
  username: string;
  email: string;
  role: Account['role'];
  hasStudentProfile?: boolean;
  studentId?: number;
}

const StudentProfileRepository = AppDataSource.getRepository(StudentProfile);

/**
 * Builds the auth user payload returned by login, verify-otp, and /me.
 * Student profile flags come from student_profiles (source of truth).
 */
export async function buildAuthUserDto(account: Account): Promise<AuthUserDto> {
  const base: AuthUserDto = {
    id: account.id,
    username: account.username,
    email: account.email,
    role: account.role,
  };

  if (account.role !== 'student') {
    return base;
  }

  const studentRecord = await StudentProfileRepository.findOne({
    where: { studentId: account.id },
    select: ['studentId'],
  });

  return {
    ...base,
    hasStudentProfile: Boolean(studentRecord),
    ...(studentRecord ? { studentId: studentRecord.studentId } : {}),
  };
}
