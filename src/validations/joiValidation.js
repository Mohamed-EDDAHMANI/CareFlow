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
  email: Joi.string().email().required(),
  name: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  birthDate: Joi.date().optional(),
  roleId: Joi.string().required(),
  status: Joi.string().valid('active', 'suspended').default('active'),
  cin: Joi.string().required()
});

export const updatePermissionsSchema = Joi.object({
  create_user: Joi.boolean().required(),
  delete_user: Joi.boolean().required(),
  update_user: Joi.boolean().required(),

  create_appointment: Joi.boolean().required(),
  update_appointment: Joi.boolean().required(),
  cancel_appointment: Joi.boolean().required(),
  view_appointment: Joi.boolean().required(),

  create_medical_record: Joi.boolean().required(),
  view_medical_record: Joi.boolean().required(),
  update_medical_record: Joi.boolean().required(),

  send_notification: Joi.boolean().required(),
  manage_system: Joi.boolean().required(),
});

// Appointment validation
// Note: documents field handled by multer, not validated in Joi
export const appointmentSchemaJoi = Joi.object({
  patientId: Joi.string().required(),
  doctoreChose: Joi.string().optional().allow(null, '', 0),
  reason: Joi.string().required().min(3),
  type: Joi.string().valid('consultation générale', 'suivi').default('consultation générale'),
  weekOffset: Joi.number().integer().min(0).default(0)
});

// Appointment Status Update validation
export const updateAppointmentStatusSchemaJoi = Joi.object({
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').required()
});

// Medical Record validation
// Note: documents field handled by multer, not validated in Joi
export const medicalRecordSchemaJoi = Joi.object({
  patientId: Joi.string().required(),
  appointmentId: Joi.string().required(),
  priority: Joi.string().valid('Normal', 'À suivre', 'Traitement nécessaire', 'Urgent').default('Normal'),
  typeMedical: Joi.string().required().min(3),
  description: Joi.string().optional().allow(''),
  resultDate: Joi.date().optional()
});

// Medical Record Update validation
export const updateMedicalRecordSchemaJoi = Joi.object({
  priority: Joi.string().valid('Normal', 'À suivre', 'Traitement nécessaire', 'Urgent').optional(),
  typeMedical: Joi.string().min(3).optional(),
  description: Joi.string().optional().allow(''),
  resultDate: Joi.date().optional()
});

// Medical Record Action validation
export const medicalRecordActionSchemaJoi = Joi.object({
  type: Joi.string().valid('treatment', 'scanner', 'analysis').required(),
  description: Joi.string().required().min(3)
});
