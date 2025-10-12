import { Router } from 'express';
import { createUser , deleteUser, getUserById, getUsers, updateUser, searchUsers } from '../controllers/userController.js';
import { userSchemaJoi } from '../validations/joiValidation.js';
import validate from '../middlewares/validate.js';
import { authorize, protect } from '../middlewares/authorize.js';

const router = Router();

router.post('/create', protect, authorize('create_user') ,  validate(userSchemaJoi), createUser);
router.get('/search', protect , searchUsers);
router.get('/', protect ,getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, authorize('update_user') ,validate(userSchemaJoi), updateUser);
router.delete('/:id', protect, authorize('delete_user') ,deleteUser);


export default router ;
