import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import locationRoutes from './modules/location/location.routes';
import entranceRoutes from './modules/entrance/entrance.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/locations', locationRoutes);
router.use('/entrance', entranceRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
