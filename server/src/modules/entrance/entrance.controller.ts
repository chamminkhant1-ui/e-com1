import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { EntranceService } from './entrance.service';
import type { AuthTokenPayload } from '../../common/utils/jwt.utils';

const entranceService = new EntranceService();

export class EntranceController {
  /**
   * GET /api/entrance/me
   * Returns the full entrance record for the authenticated student.
   */
  getMyEntrance = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as { user?: AuthTokenPayload }).user;
    if (!user) {
      res.status(401).json({
        ok: false,
        message: 'Authentication required.',
      });
      return;
    }

    const data = await entranceService.findMyEntrance(user.id);

    res.status(200).json({
      ok: true,
      message: 'Entrance record found.',
      data,
    });
  });
}
