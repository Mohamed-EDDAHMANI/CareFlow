import express from 'express';
import { updatePermissions }  from '../controllers/permissionsController.js'
import { authorize, protect } from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { updatePermissionsSchema } from '../validations/joiValidation.js'

const router = express();

/**
 * @route   PUT /api/permissions/update/:id
 * @desc    Update role permissions
 * @access  Private (requires: administration permission)
 * @params  {
 *   id: string (required) - Role ID
 * }
 * @body    {
 *   create_user: boolean (required),
 *   delete_user: boolean (required),
 *   update_user: boolean (required),
 *   create_appointment: boolean (required),
 *   update_appointment: boolean (required),
 *   cancel_appointment: boolean (required),
 *   view_appointment: boolean (required),
 *   create_medical_record: boolean (required),
 *   view_medical_record: boolean (required),
 *   update_medical_record: boolean (required),
 *   send_notification: boolean (required),
 *   manage_system: boolean (required)
 * }
 */
router.put('/update/:id', protect, authorize("administration") , validate(updatePermissionsSchema),  updatePermissions)


export default router;