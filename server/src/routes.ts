import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import locationRoutes from './modules/location/location.routes';
import entranceRoutes from './modules/entrance/entrance.routes';
import studentRoutes from './modules/student/student.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);
router.use('/entrance', entranceRoutes);
router.use('/students', studentRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
