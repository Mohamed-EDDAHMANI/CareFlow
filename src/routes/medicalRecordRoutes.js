import { Router } from 'express';
import {
    createMedicalRecord,
    getAllMedicalRecords,
    getPatientMedicalRecords,
    getMedicalRecordById,
    updateMedicalRecord,
    deleteMedicalRecord,
    addAction,
    searchMedicalRecords
} from '../controllers/medicalRecordController.js';
import { protect, authorize } from '../middlewares/authorize.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';
import validate from '../middlewares/validate.js';
import {
    medicalRecordSchemaJoi,
    updateMedicalRecordSchemaJoi,
    medicalRecordActionSchemaJoi
} from '../validations/joiValidation.js';

const router = Router();

/**
 * @route   POST /api/medical-records
 * @desc    Create a new medical record with optional document uploads
 * @access  Private (requires: create_medical_record permission)
 * @body    {
 *   patientId: string (required),
 *   appointmentId: string (required),
 *   priority: string (optional) - "Normal" | "À suivre" | "Traitement nécessaire" | "Urgent",
 *   typeMedical: string (required) - min 3 chars,
 *   description: string (optional),
 *   resultDate: date (optional),
 *   documents: file[] (optional) - max 10 files, 20MB each
 * }
 */
router.post(
    '/create',
    protect,
    authorize('create_medical_record'),
    uploadFiles,
    validate(medicalRecordSchemaJoi),
    createMedicalRecord
);

/**
 * @route   GET /api/medical-records/search
 * @desc    Search medical records by patient name, type, or description
 * @access  Private (requires: view_medical_record permission)
 * @query   {
 *   q: string (required) - Search query (min 2 chars),
 *   page: number (optional) - Page number (default: 1),
 *   limit: number (optional) - Items per page (default: 20),
 *   priority: string (optional) - Filter by priority,
 *   typeMedical: string (optional) - Filter by medical type,
 *   from: date (optional) - Start date filter (ISO format),
 *   to: date (optional) - End date filter (ISO format),
 *   sort: string (optional) - Sort field (default: resultDate),
 *   order: string (optional) - "asc" | "desc" (default: desc)
 * }
 */
router.get(
    '/search',
    protect,
    authorize('view_medical_record'),
    searchMedicalRecords
);

/**
 * @route   GET /api/medical-records/getAll
 * @desc    Get all medical records with optional filters
 * @access  Private (requires: view_medical_record permission)
 * @query   {
 *   page: number (optional) - Page number (default: 1),
 *   limit: number (optional) - Items per page (default: 20),
 *   patientId: string (optional) - Filter by patient ID,
 *   priority: string (optional) - Filter by priority,
 *   typeMedical: string (optional) - Filter by medical type,
 *   from: date (optional) - Start date filter (ISO format),
 *   to: date (optional) - End date filter (ISO format),
 *   sort: string (optional) - Sort field (default: resultDate),
 *   order: string (optional) - "asc" | "desc" (default: desc)
 * }
 */
router.get(
    '/getAll',
    protect,
    authorize('view_medical_record'),
    getAllMedicalRecords
);

/**
 * @route   GET /api/medical-records/patient/:patientId
 * @desc    Get all medical records for a specific patient
 * @access  Private (requires: view_medical_record permission)
 * @params  {
 *   patientId: string (required) - Patient's user ID
 * }
 * @query   {
 *   page: number (optional) - Page number (default: 1),
 *   limit: number (optional) - Items per page (default: 20),
 *   priority: string (optional) - Filter by priority,
 *   typeMedical: string (optional) - Filter by medical type,
 *   from: date (optional) - Start date filter (ISO format),
 *   to: date (optional) - End date filter (ISO format),
 *   sort: string (optional) - Sort field (default: resultDate),
 *   order: string (optional) - "asc" | "desc" (default: desc)
 * }
 */
router.get(
    '/patient/:patientId',
    protect,
    authorize('view_medical_record'),
    getPatientMedicalRecords
);

/**
 * @route   POST /api/medical-records/:id/action
 * @desc    Add an action (treatment, scanner, analysis) to a medical record
 * @access  Private (requires: update_medical_record permission)
 * @params  {
 *   id: string (required) - Medical record ID
 * }
 * @body    {
 *   type: string (required) - "treatment" | "scanner" | "analysis",
 *   description: string (required) - min 3 chars,
 *   document: file (optional) - Single document file, 20MB max
 * }
 */
router.post(
    '/:id/action',
    protect,
    authorize('update_medical_record'),
    // uploadSingleMedicalDocument,
    validate(medicalRecordActionSchemaJoi),
    addAction
);

/**
 * @route   GET /api/medical-records/:id
 * @desc    Get a single medical record by ID with full details
 * @access  Private (requires: view_medical_record permission)
 * @params  {
 *   id: string (required) - Medical record ID
 * }
 */
router.get(
    '/:id',
    protect,
    authorize('view_medical_record'),
    getMedicalRecordById
);

/**
 * @route   PUT /api/medical-records/:id
 * @desc    Update a medical record and optionally add new documents
 * @access  Private (requires: update_medical_record permission)
 * @params  {
 *   id: string (required) - Medical record ID
 * }
 * @body    {
 *   priority: string (optional) - "Normal" | "À suivre" | "Traitement nécessaire" | "Urgent",
 *   typeMedical: string (optional) - min 3 chars,
 *   description: string (optional),
 *   resultDate: date (optional),
 *   documents: file[] (optional) - New documents to append (max 10, 20MB each)
 * }
 */
router.put(
    '/:id',
    protect,
    authorize('update_medical_record'),
    // uploadMedicalDocuments,
    validate(updateMedicalRecordSchemaJoi),
    updateMedicalRecord
);

/**
 * @route   DELETE /api/medical-records/:id
 * @desc    Delete a medical record
 * @access  Private (requires: update_medical_record permission)
 * @params  {
 *   id: string (required) - Medical record ID
 * }
 */
router.delete(
    '/:id',
    protect,
    authorize('update_medical_record'),
    deleteMedicalRecord
);

export default router;
