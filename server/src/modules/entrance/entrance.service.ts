import { AppDataSource } from '../../database/data-source';
import { EntranceRegistration } from '../../database/entities/EntranceRegistration';
import { Account } from '../../database/entities/Account';
import AppError from '../../common/utils/AppError';
import type { EntranceDto } from './entrance.schema';

const EntranceRepository = AppDataSource.getRepository(EntranceRegistration);
const AccountRepository = AppDataSource.getRepository(Account);

export class EntranceService {
  /**
   * Returns the full entrance record linked to the authenticated student's account.
   * Throws if the account has no linked entrance or the entrance is not found.
   */
  async findMyEntrance(accountId: number): Promise<EntranceDto> {
    const account = await AccountRepository.findOne({
      where: { id: accountId },
      select: ['id', 'entranceId'],
    });

    if (!account) {
      throw AppError.unauthorized('Account not found.');
    }

    if (!account.entranceId) {
      throw AppError.notFound('No entrance record linked to your account.');
    }

    const entrance = await EntranceRepository.findOne({
      where: { entranceId: account.entranceId },
      select: [
        'entranceId',
        'examYear',
        'matricExamRollNo',
        'applicantNameMm',
        'fatherNameMm',
        'nrcNumber',
        'institution',
        'majorCode',
        'totalScore',
        'subjectGroupScore',
        'applicationNo',
      ],
    });

    if (!entrance) {
      throw AppError.notFound('Linked entrance record not found.');
    }

    return {
      entranceId: entrance.entranceId,
      examYear: entrance.examYear,
      matricExamRollNo: entrance.matricExamRollNo,
      applicantNameMm: entrance.applicantNameMm,
      fatherNameMm: entrance.fatherNameMm,
      nrcNumber: entrance.nrcNumber,
      institution: entrance.institution as 'computer' | 'technology',
      majorCode: entrance.majorCode,
      totalScore: Number(entrance.totalScore),
      subjectGroupScore: entrance.subjectGroupScore
        ? Number(entrance.subjectGroupScore)
        : null,
      applicationNo: entrance.applicationNo,
    };
  }
}
