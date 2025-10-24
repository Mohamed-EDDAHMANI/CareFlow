import { Router } from 'express';
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
    searchUsers,
    getPatientHistory,
    createUserPatient,
    getPatients,
    getPatientById,
    searchPatients
} from '../controllers/userController.js';
import { userSchemaJoi } from '../validations/joiValidation.js';
import validate from '../middlewares/validate.js';
import { authorize, protect } from '../middlewares/authorize.js';

const router = Router();

/**
 * @route   POST /api/users/create
 * @desc    Create a new user (admin, doctor, secretary, or patient)
 * @access  Private (requires: create_user permission)
 * @body    {
 *   email: string (required) - Valid email format,
 *   name: string (required) - Min 3, max 50 characters,
 *   password: string (required) - Min 6 characters,
 *   birthDate: date (optional),
 *   roleId: string (required) - Role ID,
 *   status: string (optional) - "active" | "suspended" (default: active),
 *   cin: string (required) - National ID
 * }
 */
router.post('/create-patient', protect, authorize('patient_create'), validate(userSchemaJoi), createUserPatient);

/**
 * @route   POST /api/users/create
 * @desc    Create a new user (admin, doctor, secretary, or patient)
 * @access  Private (requires: create_user permission)
 * @body    {
 *   email: string (required) - Valid email format,
 *   name: string (required) - Min 3, max 50 characters,
 *   password: string (required) - Min 6 characters,
 *   birthDate: date (optional),
 *   roleId: string (required) - Role ID,
 *   status: string (optional) - "active" | "suspended" (default: active),
 *   cin: string (required) - National ID
 * }
 */
router.post('/create', protect, authorize('manage_users_create'), validate(userSchemaJoi), createUser);

/**
 * @route   GET /api/users
 * @desc    Get all users with optional filters
 * @access  Private
 * @query   {
 *   page: number (optional) - Page number,
 *   limit: number (optional) - Items per page,
 *   role: string (optional) - Filter by role,
 *   status: string (optional) - Filter by status
 * }
 */
router.get('/patient', protect, authorize('patient_view'), getPatients);

/**
 * @route   GET /api/users
 * @desc    Get all users with optional filters
 * @access  Private
 * @query   {
 *   page: number (optional) - Page number,
 *   limit: number (optional) - Items per page,
 *   role: string (optional) - Filter by role,
 *   status: string (optional) - Filter by status
 * }
 */
router.get('/', protect, authorize('manage_users_view'), getUsers);

/**
 * @route   GET /api/users/search
 * @desc    Search users by name, email, or CIN
 * @access  Private
 * @query   {
 *   q: string (required) - Search query,
 *   role: string (optional) - Filter by role,
 *   status: string (optional) - Filter by status
 * }
 */
router.get('/search/patient', protect, authorize('patient_search'), searchPatients);

/**
 * @route   GET /api/users/search
 * @desc    Search users by name, email, or CIN
 * @access  Private
 * @query   {
 *   q: string (required) - Search query,
 *   role: string (optional) - Filter by role,
 *   status: string (optional) - Filter by status
 * }
 */
router.get('/search', protect, authorize('manage_users_view'), searchUsers);

/**
 * @route   GET /api/users/history/:patientId
 * @desc    Get complete patient history (appointments + medical records combined and sorted)
 * @access  Private (requires: view_medical_record or view_appointment permission)
 * @params  {
 *   patientId: string (required) - Patient's user ID
 * }
 * @query   {
 *   page: number (optional) - Page number (default: 1),
 *   limit: number (optional) - Items per page (default: 20),
 *   sortOrder: string (optional) - "asc" | "desc" (default: desc),
 *   type: string (optional) - "appointment" | "medical_record" | "all" (default: all),
 *   from: date (optional) - Start date filter (ISO format),
 *   to: date (optional) - End date filter (ISO format)
 * }
 */
router.get('/history/:patientId', protect, authorize('patient_view_history'), getPatientHistory);

/**
 * @route   GET /api/users/:id/patient
 * @desc    Get a single user by ID
 * @access  Private
 * @params  {
 *   id: string (required) - User ID
 * }
 */
router.get('/:id/patient', protect, authorize('patient_view'), getPatientById);

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Private
 * @params  {
 *   id: string (required) - User ID
 * }
 */
router.get('/:id', protect, authorize('manage_users_view'), getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user information
 * @access  Private (requires: update_user permission)
 * @params  {
 *   id: string (required) - User ID
 * }
 * @body    {
 *   email: string (required) - Valid email format,
 *   name: string (required) - Min 3, max 50 characters,
 *   password: string (required) - Min 6 characters,
 *   birthDate: date (optional),
 *   roleId: string (required) - Role ID,
 *   status: string (optional) - "active" | "suspended",
 *   cin: string (required) - National ID
 * }
 */
router.put('/:id', protect, authorize('patient_update'), validate(userSchemaJoi), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (requires: delete_user permission)
 * @params  {
 *   id: string (required) - User ID
 * }
 */
router.delete('/:id', protect, authorize('manage_users_delete'), deleteUser);


export default router;
