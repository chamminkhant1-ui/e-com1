import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StudentService } from './student.service';
import type { AuthTokenPayload } from '../../common/utils/jwt.utils';
import AppError from '../../common/utils/AppError';
import type { StudentProfileInput, UpdateStatusInput } from './student.schema';

const studentService = new StudentService();

export class StudentController {
  
  /**
   * POST /api/students/profile
   * Saves the full student registration profile from the dashboard form.
   * Resolves address names to IDs and persists all related records.
   */
  saveProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user as AuthTokenPayload;
    if (!user) {
      throw AppError.unauthorized('Authentication failed in saveProfile.');
    }

    const payload: StudentProfileInput = (req as any).validatedBody ?? req.body;
    const profile = await studentService.saveStudentProfile(user.id, payload);

    res.status(200).json({
      ok: true,
      message: 'Profile saved successfully.',
      data: { studentId: profile.studentId },
    });
  });

  /**
   * PATCH /api/students/status
   * Updates the application status of the authenticated student.
   */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user as AuthTokenPayload;
    if (!user) {
      throw AppError.unauthorized('Authentication failed in updateStatus.');
    }

    const payload: UpdateStatusInput = (req as any).validatedBody ?? req.body;
    const account = await studentService.updateAccountStatus(user.id, payload);
    
    res.status(200).json({
      ok: true,
      message: 'Status updated successfully.',
      data: { applicationStatus: account.applicationStatus },
    });
  });

  /**
   * POST /api/students/:studentId/photos/:documentType
   * Uploads a single photo and links it to the student's photo record.
   */
  uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId;
    const documentType = req.params.documentType as string;
    
    if (!req.file) {
      throw AppError.badRequest('No file uploaded');
    }

    // The file is saved by multer, we just need to save the path in the DB
    const filePath = req.file.path.replace(/\\/g, '/'); // normalize for Windows
    
    const photo = await studentService.savePhoto(Number(studentId), documentType, filePath);
    
    const responseData: any = { photoId: photo.studentId };
    responseData[documentType] = filePath;

    res.status(200).json({
      ok: true,
      message: `${documentType} uploaded successfully.`,
      data: responseData
    });
  });
}
