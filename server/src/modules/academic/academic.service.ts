import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { Major } from '../../database/entities/Major';
import { AcademicYear } from '../../database/entities/AcademicYear';
import { Semester } from '../../database/entities/Semester';
import AppError from '../../common/utils/AppError';
import {
  AcademicCreateMajorInput,
  AcademicUpdateMajorInput,
  AcademicCreateYearInput,
  AcademicUpdateYearInput,
  AcademicCreateSemesterInput,
  AcademicUpdateSemesterInput,
} from './academic.schema';

const MajorRepository = AppDataSource.getRepository(Major);
const AcademicYearRepository = AppDataSource.getRepository(AcademicYear);
const SemesterRepository = AppDataSource.getRepository(Semester);

export class AcademicService {
  // ── Majors ───────────────────────────────────────────────────────────────
  async listMajors(): Promise<Major[]> {
    return await MajorRepository.find();
  }

  async createMajor(data: AcademicCreateMajorInput): Promise<Major> {
    const existing = await MajorRepository.findOne({ where: { majorCode: data.majorCode } });
    if (existing) {
      throw AppError.badRequest(`Major code "${data.majorCode}" already exists.`);
    }
    const major = MajorRepository.create({
      majorCode: data.majorCode,
      majorNameMm: data.majorNameMm,
      majorNameEn: data.majorNameEn || undefined,
      institution: data.institution,
    });
    return await MajorRepository.save(major);
  }

  async updateMajor(code: string, data: AcademicUpdateMajorInput): Promise<Major> {
    const major = await MajorRepository.findOne({ where: { majorCode: code } });
    if (!major) {
      throw AppError.notFound('Major not found.');
    }
    if (data.majorNameMm !== undefined) major.majorNameMm = data.majorNameMm;
    if (data.majorNameEn !== undefined) major.majorNameEn = data.majorNameEn || undefined;
    if (data.institution !== undefined) major.institution = data.institution;
    return await MajorRepository.save(major);
  }

  async deleteMajor(code: string): Promise<void> {
    const result = await MajorRepository.delete(code);
    if (result.affected === 0) {
      throw AppError.notFound('Major not found.');
    }
  }

  // ── Academic Years ───────────────────────────────────────────────────────
  async listAcademicYears(): Promise<AcademicYear[]> {
    return await AcademicYearRepository.find({ order: { academicYearId: 'DESC' } });
  }

  async createAcademicYear(data: AcademicCreateYearInput): Promise<AcademicYear> {
    const existing = await AcademicYearRepository.findOne({ where: { academicYearId: data.academicYearId } });
    if (existing) {
      throw AppError.badRequest(`Academic year "${data.academicYearId}" already exists.`);
    }

    // If setting active, deactivate others
    if (data.isActive) {
      await AcademicYearRepository.update({}, { isActive: false });
    }

    const year = AcademicYearRepository.create(data);
    return await AcademicYearRepository.save(year);
  }

  async updateAcademicYear(id: string, data: AcademicUpdateYearInput): Promise<AcademicYear> {
    const year = await AcademicYearRepository.findOne({ where: { academicYearId: id } });
    if (!year) {
      throw AppError.notFound('Academic year not found.');
    }

    if (data.isActive) {
      // Deactivate all others
      await AcademicYearRepository.update({}, { isActive: false });
    }

    year.isActive = data.isActive;
    return await AcademicYearRepository.save(year);
  }

  // ── Semesters ────────────────────────────────────────────────────────────
  async listSemesters(): Promise<Semester[]> {
    return await SemesterRepository.find({ order: { numericalLevel: 'ASC' } });
  }

  async createSemester(data: AcademicCreateSemesterInput): Promise<Semester> {
    const existing = await SemesterRepository.findOne({ where: { semesterName: data.semesterName } });
    if (existing) {
      throw AppError.badRequest(`Semester "${data.semesterName}" already exists.`);
    }
    const semester = SemesterRepository.create(data);
    return await SemesterRepository.save(semester);
  }

  async updateSemester(id: number, data: AcademicUpdateSemesterInput): Promise<Semester> {
    const semester = await SemesterRepository.findOne({ where: { semesterId: id } });
    if (!semester) {
      throw AppError.notFound('Semester not found.');
    }
    Object.assign(semester, data);
    return await SemesterRepository.save(semester);
  }

  async deleteSemester(id: number): Promise<void> {
    const result = await SemesterRepository.delete(id);
    if (result.affected === 0) {
      throw AppError.notFound('Semester not found.');
    }
  }
}
