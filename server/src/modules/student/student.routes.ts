import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../../database/data-source';
import { StudentProfile } from '../../database/entities/StudentProfile';
import { validate } from '../../common/middleware/validate';
import { verifyAuth } from '../../common/middleware/auth.middleware';
import { StudentSchema } from './student.schema';
import { StudentController } from './student.controller';

const router = Router();
const studentController = new StudentController();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const studentId = req.params.studentId;
      
      const studentRepo = AppDataSource.getRepository(StudentProfile);
      const student = await studentRepo.findOne({ where: { studentId: Number(studentId) } });
      
      if (!student) {
        return cb(new Error('Student not found'), '');
      }

      const dirName = `${studentId}+${student.nameEn}`;
      const uploadPath = path.join(__dirname, '../../../uploads/photos', dirName);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const documentType = req.params.documentType;
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now();
    const fileName = `${documentType}+${uniqueSuffix}${ext}`;
    cb(null, fileName);
  }
});
const upload = multer({ storage });

router.use(verifyAuth);

/**
 * @route POST /api/students/profile
 * @desc Saves (upserts) the student's full registration profile submitted from the /dashboard form.
 * @access Private (student)
 */
router.post(
  '/profile',
  validate({ body: StudentSchema.studentProfile }),
  studentController.saveProfile
);

/**
 * @route PATCH /api/students/status
 * @desc Updates the student's registration progress status.
 * @access Private (student)
 */
router.patch(
  '/status',
  validate({ body: StudentSchema.updateStatus }),
  studentController.updateStatus
);

/**
 * @route POST /api/students/:studentId/photos/:documentType
 * @desc Uploads a single photo to the student's photo record.
 * @access Private (student)
 */
router.post(
  '/:studentId/photos/:documentType',
  upload.single('photo'),
  studentController.uploadPhoto
);

export default router;
