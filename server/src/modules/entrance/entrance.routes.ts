import { Router } from 'express';
import { EntranceController } from './entrance.controller';
import { verifyAuth } from '../../common/middleware/auth.middleware';

const router = Router();
const entranceController = new EntranceController();

/**
 * @route GET /api/entrance/me
 * @desc  Returns the full entrance record linked to the authenticated student's account.
 * @access Private (student)
 */
router.get('/me', verifyAuth, entranceController.getMyEntrance);

export default router;
