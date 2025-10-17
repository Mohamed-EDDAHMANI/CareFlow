import { Router } from 'express';
import mongoose from 'mongoose';
import { register, login, refreshAccessToken } from '../controllers/authController.js';
import { registerSchemaJoi, loginSchemaJoi } from '../validations/joiValidation.js';
import validate from '../middlewares/validate.js';


const router = Router();

/**
 * @route   GET /api/auth/test-db
 * @desc    Test database connection and list collections
 * @access  Public
 */
router.get('/test-db', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    res.json({
      success: true,
      message: 'Database connection successful',
      database: mongoose.connection.name,
      collections: collectionNames,
      connectionState: mongoose.connection.readyState // 1 = connected
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get access/refresh tokens
 * @access  Public
 * @body    {
 *   email: string (required) - Valid email format,
 *   password: string (required) - Min 6 characters
 * }
 */
router.post('/login', validate(loginSchemaJoi), login);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new patient user
 * @access  Public
 * @body    {
 *   name: string (required) - Min 3, max 50 characters,
 *   email: string (required) - Valid email format,
 *   password: string (required) - Min 6 characters,
 *   birthDate: date (optional),
 *   status: string (optional) - "active" | "suspended" (default: active),
 *   cin: string (optional)
 * }
 */
router.post('/register', validate(registerSchemaJoi), register);

/**
 * @route   POST /api/auth/refreshAccess
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    {
 *   refreshToken: string (required) - Valid refresh token
 * }
 */
router.post('/refreshAccess', refreshAccessToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (placeholder)
 * @access  Public
 */
router.post('/logout', (req, res) => {
  res.send('Logout route');
});

export default router;