import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AppDataSource } from '../../database/data-source';
import { State } from '../../database/entities/State';
import { District } from '../../database/entities/District';
import { Township } from '../../database/entities/Township';

const stateRepo = () => AppDataSource.getRepository(State);
const districtRepo = () => AppDataSource.getRepository(District);
const townshipRepo = () => AppDataSource.getRepository(Township);

/**
 * GET /api/locations/states
 * Returns all states/regions sorted by name.
 */
export const getStates = asyncHandler(async (_req: Request, res: Response) => {
  const states = await stateRepo().find({ order: { nameMm: 'ASC' } });
  res.json({ states: states.map((s) => ({ stateId: s.stateId, name: s.nameMm })) });
});

/**
 * GET /api/locations/districts/:stateName
 * Returns all districts that belong to the state with the given Myanmar name.
 */
export const getDistricts = asyncHandler(async (req: Request, res: Response) => {
  const stateName = String(req.params.stateName);

  // Look up the state by its Myanmar name
  const state = await stateRepo().findOne({ where: { nameMm: stateName } });
  if (!state) {
    res.status(404).json({ districts: [] });
    return;
  }

  const districts = await districtRepo().find({
    where: { stateId: state.stateId },
    order: { nameMm: 'ASC' },
  });

  res.json({
    districts: districts.map((d) => ({
      districtId: d.districtId,
      districtName: d.nameMm,
    })),
  });
});

/**
 * GET /api/locations/townships/:stateName/:districtName
 * Returns all townships that belong to the district (looked up by name within the state).
 */
export const getTownships = asyncHandler(async (req: Request, res: Response) => {
  const stateName = String(req.params.stateName);
  const districtName = String(req.params.districtName);

  // Look up the state by Myanmar name
  const state = await stateRepo().findOne({ where: { nameMm: stateName } });
  if (!state) {
    res.status(404).json({ cities: [] });
    return;
  }

  // Look up the district by name within the state
  const district = await districtRepo().findOne({
    where: { stateId: state.stateId, nameMm: districtName },
  });
  if (!district) {
    res.status(404).json({ cities: [] });
    return;
  }

  const townships = await townshipRepo().find({
    where: { stateId: state.stateId, districtId: district.districtId },
    order: { nameMm: 'ASC' },
  });

  res.json({
    cities: townships.map((t) => ({
      townshipId: t.townshipId,
      cityName: t.nameMm,
    })),
  });
});

/**
 * POST /api/locations/check-email
 * Basic email validation endpoint. Returns is_valid and is_verified flags.
 * The frontend debounces calls to this endpoint.
 */
export const checkEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== 'string') {
    res.status(400).json({ is_valid: false, is_verified: false });
    return;
  }

  const emailRegex = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;
  if (!emailRegex.test(email)) {
    res.json({ is_valid: false, is_verified: false });
    return;
  }

  // For now we verify the domain is a known/common pattern (not a throw-away domain).
  // This can be extended with actual DNS/MX lookup if needed.
  const throwawayDomains = ['mailinator.com', 'guerrillamail.com', 'tempmail.com', 'yopmail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  const is_verified = !throwawayDomains.includes(domain);

  res.json({ is_valid: true, is_verified });
});
