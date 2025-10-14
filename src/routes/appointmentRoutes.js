import Router from 'express';
import { createAppointment } from '../controllers/appoitmentController.js'
import { protect, authorize } from '../middlewares/authorize.js';

const router = Router();

router.post('/create/:patientId' ,protect ,authorize('administration'),  createAppointment );

export default router;