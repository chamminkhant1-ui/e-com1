import { Router } from 'express';
import { AcademicController } from './academic.controller';
import { validate } from '../../common/middleware/validate';
import { verifyAuth, allowTo } from '../../common/middleware/auth.middleware';
import { AcademicSchema } from './academic.schema';

const router = Router();
const ctrl = new AcademicController();

router.use(verifyAuth);

// Majors
router.get(
  '/majors',
  allowTo('owner', 'super', 'admin', 'finance'),
  ctrl.listMajors
);
router.post(
  '/majors',
  allowTo('owner', 'super'),
  validate({ body: AcademicSchema.createMajor }),
  ctrl.createMajor
);
router.patch(
  '/majors/:code',
  allowTo('owner', 'super'),
  validate({ body: AcademicSchema.updateMajor }),
  ctrl.updateMajor
);
router.delete(
  '/majors/:code',
  allowTo('owner', 'super'),
  ctrl.deleteMajor
);

// Academic Years
router.get(
  '/years',
  allowTo('owner', 'super', 'admin', 'finance'),
  ctrl.listAcademicYears
);
router.post(
  '/years',
  allowTo('owner', 'super'),
  validate({ body: AcademicSchema.createAcademicYear }),
  ctrl.createAcademicYear
);
router.patch(
  '/years/:id',
  allowTo('owner', 'super'),
  validate({ body: AcademicSchema.updateAcademicYear }),
  ctrl.updateAcademicYear
);

// Semesters
router.get(
  '/semesters',
  allowTo('owner', 'super', 'admin', 'finance'),
  ctrl.listSemesters
);
router.post(
  '/semesters',
  allowTo('owner', 'super'),
  validate({ body: AcademicSchema.createSemester }),
  ctrl.createSemester
);
router.patch(
  '/semesters/:id',
  allowTo('owner', 'super'),
  validate({ body: AcademicSchema.updateSemester }),
  ctrl.updateSemester
);
router.delete(
  '/semesters/:id',
  allowTo('owner', 'super'),
  ctrl.deleteSemester
);

export default router;
