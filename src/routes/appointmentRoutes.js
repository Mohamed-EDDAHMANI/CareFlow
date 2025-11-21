import Router from 'express';
import { 
    createAppointment, 
    getAllAppointments, 
    getDoctorAppointments,
    getAppointmentById, 
    searchAppointments,
    updateAppointmentStatus,
    getOwnAppointments,
    getAppointmentDocuments
} from '../controllers/appoitmentController.js'
import { protect, authorize } from '../middlewares/authorize.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';
import validate from '../middlewares/validate.js';
import { updateAppointmentStatusSchemaJoi } from '../validations/joiValidation.js';

const router = Router();

/**
 * @route   POST /api/appointments/create/:patientId
 * @desc    Create a new appointment with optional document uploads
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   patientId: string (required) - Patient's user ID
 * }
 * @body    {
 *   doctoreChose: string (optional) - Doctor ID or null for auto-assignment,
 *   reason: string (required) - Min 3 characters,
 *   type: string (optional) - "consultation générale" | "suivi" (default: consultation générale),
 *   weekOffset: number (optional) - Week offset for scheduling (default: 0),
 *   documents: file[] (optional) - Max 5 files, 10MB each (PDF, DOC, DOCX, images)
 * }
 */
router.post('/create/:patientId', protect, authorize('appointment_create'), uploadFiles, createAppointment);

/**
 * @route   GET /api/appointments/search
 * @desc    Search appointments by patient name, doctor name, or reason
 * @access  Private (requires: administration permission)
 * @query   {
 *   q: string (required) - Search query (min 2 characters),
 *   type: string (optional) - Filter by appointment type,
 *   status: string (optional) - Filter by status,
 *   from: date (optional) - Start date filter (ISO format),
 *   to: date (optional) - End date filter (ISO format),
 *   page: number (optional) - Page number (default: 1),
 *   limit: number (optional) - Items per page (default: 20)
 * }
 */
router.get('/search', protect, authorize('appointment_view_all'), searchAppointments);

/**
 * @route   GET /api/appointments/all
 * @desc    Get all appointments with optional filters
 * @access  Private (requires: administration permission)
 * @query   {
 *   page: number (optional) - Page number,
 *   limit: number (optional) - Items per page,
 *   type: string (optional) - Filter by type,
 *   status: string (optional) - Filter by status,
 *   from: date (optional) - Start date,
 *   to: date (optional) - End date
 * }
 */
router.get('/all', protect, authorize('appointment_view_all'), getAllAppointments);

/**
 * @route   GET /api/appointments/doctor/:doctorId
 * @desc    Get all appointments for a specific doctor
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   doctorId: string (required) - Doctor's user ID
 * }
 * @query   {
 *   page: number (optional) - Page number,
 *   limit: number (optional) - Items per page,
 *   type: string (optional) - Filter by type,
 *   status: string (optional) - Filter by status,
 *   from: date (optional) - Start date,
 *   to: date (optional) - End date
 * }
 */
router.get('/doctor/:doctorId', protect, authorize('appointment_view_all'), getDoctorAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get a single appointment by ID
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   id: string (required) - Appointment ID
 * }
 */
router.get('/:id/own', protect, authorize('appointment_view_own'), getOwnAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get a single appointment by ID
 * @access  Private (requires: manage_system permission)
 * @params  {
 *   id: string (required) - Appointment ID
 * }
 */
router.get('/:id', protect, authorize('appointment_view_all'), getAppointmentById);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status (for doctors and admins)
 * @access  Private (assigned doctor or admin only)
 * @params  {
 *   id: string (required) - Appointment ID
 * }
 * @body    {
 *   status: string (required) - "scheduled" | "completed" | "cancelled"
 * }
 */
router.patch('/:id/status', protect,  authorize('appointment_update'), validate(updateAppointmentStatusSchemaJoi), updateAppointmentStatus);

/**
 * @route   GET /api/appointments/:id/documents
 * @desc    Get all documents for a specific appointment with presigned URLs
 * @access  Private (requires: appointment_view_all or appointment_view_own permission)
 * @params  {
 *   id: string (required) - Appointment ID
 * }
 * @response {
 *   success: boolean,
 *   count: number,
 *   data: [{
 *     originalName: string,
 *     fileName: string,
 *     mimeType: string,
 *     size: number,
 *     category: string,
 *     _id: string,
 *     createdAt: date,
 *     updatedAt: date,
 *     url: string (presigned URL valid for 24h)
 *   }]
 * }
 */
router.get('/:id/documents', protect, authorize('appointment_view_all', 'appointment_view_own'), getAppointmentDocuments);

export default router;