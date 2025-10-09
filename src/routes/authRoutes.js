import { Router } from 'express';
import mongoose from 'mongoose';
import { register } from '../controllers/authController.js';

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

router.post('/login', (req, res) => {
  res.status(200).json({ message: 'Login route' });
  // res.json({ message: 'Login route' });
});

router.post('/register', (req, res) => {
  register(req, res);
});

router.post('/refresh', (req, res) => {
  res.send('Refresh token route');
});

router.post('/logout', (req, res) => {
  res.send('Logout route');
});

export default router;