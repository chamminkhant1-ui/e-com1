import { Router } from 'express';
import { getStates, getDistricts, getTownships, checkEmail } from './location.controller';

const router = Router();

/**
 * @route  GET /api/locations/states
 * @desc   Returns all Myanmar states/regions
 * @access Public
 */
router.get('/states', getStates);

/**
 * @route  GET /api/locations/districts/:stateName
 * @desc   Returns all districts for a given state name (in Myanmar script)
 * @access Public
 */
router.get('/districts/:stateName', getDistricts);

/**
 * @route  GET /api/locations/townships/:stateName/:districtName
 * @desc   Returns all townships for a given state + district name (in Myanmar script)
 * @access Public
 */
router.get('/townships/:stateName/:districtName', getTownships);

/**
 * @route  POST /api/locations/check-email
 * @desc   Validates and verifies an email address
 * @access Public
 */
router.post('/check-email', checkEmail);

export default router;
