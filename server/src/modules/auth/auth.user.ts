import type { Account } from '../../database/entities/Account';
import { StudentProfile } from '../../database/entities/StudentProfile';
import { EntranceRegistration } from '../../database/entities/EntranceRegistration';
import { AppDataSource } from '../../database/data-source';
import type { EntranceMatchDto } from './auth.schema';

export interface AuthUserDto {
  id: number;
  email: string;
  role: Account['role'];
  hasStudentProfile?: boolean;
  studentId?: number;
  entrance?: EntranceMatchDto | null;
  serverDate?: string;
}

const StudentProfileRepository = AppDataSource.getRepository(StudentProfile);
const EntranceRepository = AppDataSource.getRepository(EntranceRegistration);

/**
 * Builds the auth user payload returned by login, verify-otp, and /me.
 * Student profile flags come from student_profiles (source of truth).
 */
export async function buildAuthUserDto(account: Account): Promise<AuthUserDto> {
  const base: AuthUserDto = {
    id: account.id,
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

  let entranceDto: EntranceMatchDto | null = null;
  if (account.entranceId) {
    const entrance = await EntranceRepository.findOne({
      where: { entranceId: account.entranceId },
      select: [
        'entranceId',
        'applicantNameMm',
        'fatherNameMm',
        'examYear',
        'matricExamRollNo',
        'institution',
        'totalScore',
      ],
    });
    if (entrance) {
      entranceDto = {
        entranceId: entrance.entranceId,
        applicantNameMm: entrance.applicantNameMm,
        fatherNameMm: entrance.fatherNameMm,
        examYear: entrance.examYear,
        matricExamRollNo: entrance.matricExamRollNo,
        institution: entrance.institution as 'computer' | 'technology',
        totalScore: Number(entrance.totalScore),
      };
    }
  }

  return {
    ...base,
    hasStudentProfile: Boolean(studentRecord),
    ...(studentRecord ? { studentId: studentRecord.studentId } : {}),
    entrance: entranceDto,
  };
}
