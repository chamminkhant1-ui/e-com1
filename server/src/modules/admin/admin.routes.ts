import { Router } from 'express';
import { AdminController } from './admin.controller';
import { validate } from '../../common/middleware/validate';
import { verifyAuth, allowTo } from '../../common/middleware/auth.middleware';
import { AdminSchema } from './admin.schema';

const router = Router();
const ctrl = new AdminController();

router.use(verifyAuth);

// Dashboard metrics
router.get(
  '/dashboard/stats',
  allowTo('owner', 'super', 'admin', 'finance'),
  ctrl.getDashboardStats
);

// Students endpoints
router.get(
  '/students',
  allowTo('owner', 'super', 'admin'),
  validate({ query: AdminSchema.listStudents }),
  ctrl.listStudents
);
router.get(
  '/students/export',
  allowTo('owner', 'super', 'admin'),
  ctrl.exportStudents
);
router.get(
  '/students/:id',
  allowTo('owner', 'super', 'admin'),
  ctrl.getStudentDetail
);
router.patch(
  '/students/:id/status',
  allowTo('owner', 'super', 'admin'),
  validate({ body: AdminSchema.updateStudentStatus }),
  ctrl.updateStudentStatus
);
router.patch(
  '/students/:id/roll-number',
  allowTo('owner', 'super', 'admin'),
  validate({ body: AdminSchema.assignRollNumber }),
  ctrl.assignRollNumber
);

// Payments endpoints
router.get(
  '/payments',
  allowTo('owner', 'super', 'finance'),
  validate({ query: AdminSchema.listPayments }),
  ctrl.listPayments
);
router.get(
  '/payments/export',
  allowTo('owner', 'super', 'finance'),
  ctrl.exportPayments
);
router.patch(
  '/payments/:id/status',
  allowTo('owner', 'super', 'finance'),
  validate({ body: AdminSchema.updatePaymentStatus }),
  ctrl.updatePaymentStatus
);

// Entrance records
router.get(
  '/entrance',
  allowTo('owner', 'super', 'admin'),
  validate({ query: AdminSchema.listEntrance }),
  ctrl.listEntrance
);

// Accounts management
router.get(
  '/accounts',
  allowTo('owner', 'super'),
  validate({ query: AdminSchema.listAccounts }),
  ctrl.listAccounts
);
router.post(
  '/accounts',
  allowTo('owner', 'super'),
  validate({ body: AdminSchema.createAccount }),
  ctrl.createAccount
);
router.patch(
  '/accounts/:id/role',
  allowTo('owner', 'super'),
  validate({ body: AdminSchema.updateAccountRole }),
  ctrl.updateAccountRole
);
router.delete(
  '/accounts/:id',
  allowTo('owner', 'super'),
  ctrl.deleteAccount
);

// Semester registration trigger
router.post(
  '/semester-registration/trigger',
  allowTo('owner', 'super'),
  ctrl.triggerSemesterRegistration
);

export default router;
