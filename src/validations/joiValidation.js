import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  birthDate: Joi.date().optional(),
  roleId: Joi.string().required(),
  status: Joi.string().valid('active', 'suspended').default('active'),
  cin: Joi.string().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});