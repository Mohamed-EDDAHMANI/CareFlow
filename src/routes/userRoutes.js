import { Router } from 'express';
import { createUser , deleteUser, getUserById, getUsers, updateUser } from '../controllers/userController.js';
import { userSchemaJoi } from '../validations/joiValidation.js';
import validate from '../middlewares/validate.js';

const router = Router();

router.post('/create', validate(userSchemaJoi), createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', validate(userSchemaJoi), updateUser);
router.delete('/:id', deleteUser);


export default router ;
