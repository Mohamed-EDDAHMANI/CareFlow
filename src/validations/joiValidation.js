import Joi from 'joi';

// register dont have an roleId cuz it will be always patient
export const registerSchemaJoi = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  birthDate: Joi.date().optional(),
  status: Joi.string().valid('active', 'suspended').default('active'),
  cin: Joi.string().optional()
});

export const loginSchemaJoi = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const userSchemaJoi = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  birthDate: Joi.date().optional(),
  roleId: Joi.string().required(),
  status: Joi.string().valid('active', 'suspended').default('active'),
  cin: Joi.string().optional()
})