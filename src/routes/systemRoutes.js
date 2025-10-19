import { Router } from 'express';
import {
    getAllHolidays,
    getHolidayById,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    toggleHolidayStatus,
    getAllWorkingHours,
    getWorkingHourById,
    createWorkingHour,
    updateWorkingHour,
    deleteWorkingHour,
    toggleWorkingHourStatus
} from '../controllers/systemController.js';
import { protect, authorize } from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import {
    holidaySchemaJoi,
    updateHolidaySchemaJoi,
    workingHourSchemaJoi,
    updateWorkingHourSchemaJoi
} from '../validations/joiValidation.js';

const router = Router();

// ==================== HOLIDAY ROUTES ====================

/**
 * @route   GET /api/system/holidays
 * @desc    Get all holidays with optional filters
 * @access  Private
 * @query   {
 *   active: boolean (optional) - Filter by active status,
 *   year: number (optional) - Filter by year,
 *   month: number (optional) - Filter by month (1-12, requires year)
 * }
 */
router.get('/holidays', protect , authorize("administration") , getAllHolidays);

/**
 * @route   GET /api/system/holidays/:id
 * @desc    Get single holiday by ID
 * @access  Private
 * @params  {
 *   id: string (required) - Holiday ID
 * }
 */
router.get('/holidays/:id', protect , authorize("administration") , getHolidayById);

/**
 * @route   POST /api/system/holidays
 * @desc    Create a new holiday
 * @access  Private (requires: manage_system permission)
 * @body    {
 *   name: string (required) - Holiday name (min 3, max 100 chars),
 *   date: date (required) - Holiday date (ISO format),
 *   description: string (optional) - Holiday description,
 *   active: boolean (optional) - Active status (default: true)
 * }
 */
router.post(
    '/holidays',
    protect,
    authorize('manage_system'),
    validate(holidaySchemaJoi),
    createHoliday
);

/**
 * @route   PUT /api/system/holidays/:id
 * @desc    Update a holiday
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   id: string (required) - Holiday ID
 * }
 * @body    {
 *   name: string (optional) - Holiday name,
 *   date: date (optional) - Holiday date,
 *   description: string (optional) - Holiday description,
 *   active: boolean (optional) - Active status
 * }
 */
router.put(
    '/holidays/:id',
    protect,
    authorize('manage_system'),
    validate(updateHolidaySchemaJoi),
    updateHoliday
);

/**
 * @route   PATCH /api/system/holidays/:id/toggle
 * @desc    Toggle holiday active status
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   id: string (required) - Holiday ID
 * }
 */
router.patch(
    '/holidays/:id/toggle',
    protect,
    authorize('manage_system'),
    toggleHolidayStatus
);

/**
 * @route   DELETE /api/system/holidays/:id
 * @desc    Delete a holiday
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   id: string (required) - Holiday ID
 * }
 */
router.delete(
    '/holidays/:id',
    protect,
    authorize('manage_system'),
    deleteHoliday
);

// ==================== WORKING HOURS ROUTES ====================

/**
 * @route   GET /api/system/working-hours
 * @desc    Get all working hours with optional filters
 * @access  Private
 * @query   {
 *   active: boolean (optional) - Filter by active status,
 *   day: string (optional) - Filter by day (lundi, mardi, etc.)
 * }
 */
router.get('/working-hours', protect, authorize("administration"), getAllWorkingHours);

/**
 * @route   GET /api/system/working-hours/:id
 * @desc    Get single working hour by ID
 * @access  Private
 * @params  {
 *   id: string (required) - Working hour ID
 * }
 */
router.get('/working-hours/:id', protect, authorize("administration") , getWorkingHourById);

/**
 * @route   POST /api/system/working-hours
 * @desc    Create working hours for a day
 * @access  Private (requires: manage_system permission)
 * @body    {
 *   day: string (required) - Day of week (lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche),
 *   start: string (required) - Start time in HH:MM format (24-hour),
 *   end: string (required) - End time in HH:MM format (24-hour),
 *   active: boolean (optional) - Active status (default: true)
 * }
 */
router.post(
    '/working-hours',
    protect,
    authorize('manage_system'),
    validate(workingHourSchemaJoi),
    createWorkingHour
);

/**
 * @route   PUT /api/system/working-hours/:id
 * @desc    Update working hours
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   id: string (required) - Working hour ID
 * }
 * @body    {
 *   day: string (optional) - Day of week,
 *   start: string (optional) - Start time in HH:MM format,
 *   end: string (optional) - End time in HH:MM format,
 *   active: boolean (optional) - Active status
 * }
 */
router.put(
    '/working-hours/:id',
    protect,
    authorize('manage_system'),
    validate(updateWorkingHourSchemaJoi),
    updateWorkingHour
);

/**
 * @route   PATCH /api/system/working-hours/:id/toggle
 * @desc    Toggle working hour active status
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   id: string (required) - Working hour ID
 * }
 */
router.patch(
    '/working-hours/:id/toggle',
    protect,
    authorize('manage_system'),
    toggleWorkingHourStatus
);

/**
 * @route   DELETE /api/system/working-hours/:id
 * @desc    Delete working hours
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   id: string (required) - Working hour ID
 * }
 */
router.delete(
    '/working-hours/:id',
    protect,
    authorize('manage_system'),
    deleteWorkingHour
);

export default router;
