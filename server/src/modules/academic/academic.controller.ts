import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AcademicService } from './academic.service';
import AppError from '../../common/utils/AppError';
import {
  AcademicCreateMajorInput,
  AcademicUpdateMajorInput,
  AcademicCreateYearInput,
  AcademicUpdateYearInput,
  AcademicCreateSemesterInput,
  AcademicUpdateSemesterInput,
} from './academic.schema';

const service = new AcademicService();

export class AcademicController {
  // Majors
  listMajors = asyncHandler(async (req: Request, res: Response) => {
    const majors = await service.listMajors();
    res.status(200).json({ ok: true, message: 'Majors retrieved.', data: majors });
  });

  createMajor = asyncHandler(async (req: Request, res: Response) => {
    const payload = ((req as any).validatedBody ?? req.body) as AcademicCreateMajorInput;
    const major = await service.createMajor(payload);
    res.status(201).json({ ok: true, message: 'Major created successfully.', data: major });
  });

  updateMajor = asyncHandler(async (req: Request, res: Response) => {
    const code = req.params.code as string;
    const payload = ((req as any).validatedBody ?? req.body) as AcademicUpdateMajorInput;
    const major = await service.updateMajor(code, payload);
    res.status(200).json({ ok: true, message: 'Major updated.', data: major });
  });

  deleteMajor = asyncHandler(async (req: Request, res: Response) => {
    const code = req.params.code as string;
    await service.deleteMajor(code);
    res.status(200).json({ ok: true, message: 'Major deleted successfully.' });
  });

  // Academic Years
  listAcademicYears = asyncHandler(async (req: Request, res: Response) => {
    const years = await service.listAcademicYears();
    res.status(200).json({ ok: true, message: 'Academic years retrieved.', data: years });
  });

  createAcademicYear = asyncHandler(async (req: Request, res: Response) => {
    const payload = ((req as any).validatedBody ?? req.body) as AcademicCreateYearInput;
    const year = await service.createAcademicYear(payload);
    res.status(201).json({ ok: true, message: 'Academic year created.', data: year });
  });

  updateAcademicYear = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const payload = ((req as any).validatedBody ?? req.body) as AcademicUpdateYearInput;
    const year = await service.updateAcademicYear(id, payload);
    res.status(200).json({ ok: true, message: 'Academic year updated.', data: year });
  });

  // Semesters
  listSemesters = asyncHandler(async (req: Request, res: Response) => {
    const semesters = await service.listSemesters();
    res.status(200).json({ ok: true, message: 'Semesters retrieved.', data: semesters });
  });

  createSemester = asyncHandler(async (req: Request, res: Response) => {
    const payload = ((req as any).validatedBody ?? req.body) as AcademicCreateSemesterInput;
    const semester = await service.createSemester(payload);
    res.status(201).json({ ok: true, message: 'Semester created.', data: semester });
  });

  updateSemester = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw AppError.badRequest('Invalid semester ID');
    const payload = ((req as any).validatedBody ?? req.body) as AcademicUpdateSemesterInput;
    const semester = await service.updateSemester(id, payload);
    res.status(200).json({ ok: true, message: 'Semester updated.', data: semester });
  });

  deleteSemester = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw AppError.badRequest('Invalid semester ID');
    await service.deleteSemester(id);
    res.status(200).json({ ok: true, message: 'Semester deleted successfully.' });
  });
}
