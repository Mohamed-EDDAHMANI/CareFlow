import express from 'express';
import roleController from '../controllers/roleController.js';
import { protect, authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('manage_users_view'), roleController.getRoles);

export default router;
