import { Router } from 'express';
import { createUser , deleteUser, getUserById, getUsers, updateUser, searchUsers } from '../controllers/userController.js';
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
router.post('/create', protect, authorize('create_user') ,  validate(userSchemaJoi), createUser);

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
router.get('/', protect ,getUsers);

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
router.get('/search', protect , searchUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Private
 * @params  {
 *   id: string (required) - User ID
 * }
 */
router.get('/:id', protect, getUserById);

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
router.put('/:id', protect, authorize('update_user') ,validate(userSchemaJoi), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (requires: delete_user permission)
 * @params  {
 *   id: string (required) - User ID
 * }
 */
router.delete('/:id', protect, authorize('delete_user') ,deleteUser);


export default router ;
