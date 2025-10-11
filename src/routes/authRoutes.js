import { Router } from 'express';
import mongoose from 'mongoose';
import { register, login } from '../controllers/authController.js';
import { registerSchemaJoi, loginSchemaJoi } from '../validations/joiValidation.js';
import validate from '../middlewares/validate.js';
import multer from 'multer';
const upload = multer();

const router = Router();

// Test database connection and create collections
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

router.post('/login',  upload.none(), validate(loginSchemaJoi), login);

router.post('/register', validate(registerSchemaJoi), register);

router.post('/refresh', (req, res) => {
  res.send('Refresh token route');
});

router.post('/logout', (req, res) => {
  res.send('Logout route');
});

export default router;