import Router from 'express';
import { createAppointment, getAllAppointments, getDoctorAppointments, getAppointmentById } from '../controllers/appoitmentController.js'
import { protect, authorize } from '../middlewares/authorize.js';

const router = Router();

router.post('/create/:patientId' ,protect ,authorize('administration'),  createAppointment );

// List all appointments (admin/receptionist)
router.get('/', protect, authorize('administration'), getAllAppointments);

// List doctor appointments (doctor or admin)
router.get('/doctor/:doctorId', protect, authorize('administration'), getDoctorAppointments);

// Get appointment by id (owner/doctor/admin) - for now admin
router.get('/:id', protect, authorize('administration'), getAppointmentById);

export default router;