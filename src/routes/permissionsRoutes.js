import express from 'express';
import { updatePermissions }  from '../controllers/permissionsController.js'
import { authorize, protect } from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';
import { updatePermissionsSchema } from '../validations/joiValidation.js'

const router = express();

router.put('/update/:id', protect, authorize("administration") , validate(updatePermissionsSchema),  updatePermissions)


export default router;