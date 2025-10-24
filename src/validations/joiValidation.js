import Joi from 'joi';

// register dont have an roleId cuz it will be always patient
export const registerSchemaJoi = Joi.object({
  name: Joi.string().min(3).max(50).required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit contenir au moins 3 caractères',
      'string.max': 'Le nom doit contenir au maximum 50 caractères',
      'any.required': 'Le nom est requis'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': "L'email n'est pas valide",
      'string.empty': "L'email est requis",
      'any.required': "L'email est requis"
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'string.empty': 'Le mot de passe est requis',
      'any.required': 'Le mot de passe est requis'
    }),
  birthDate: Joi.date().optional()
    .messages({ 'date.base': 'La date de naissance doit être une date valide' }),
  status: Joi.string().valid('active', 'suspended').default('active')
    .messages({ 'any.only': "Le statut doit être 'active' ou 'suspended'" }),
  cin: Joi.string().optional()
    .messages({ 'string.base': 'Le CIN doit être une chaîne de caractères' })
});

export const loginSchemaJoi = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': "L'email n'est pas valide",
      'string.empty': "L'email est requis",
      'any.required': "L'email est requis"
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'string.empty': 'Le mot de passe est requis',
      'any.required': 'Le mot de passe est requis'
    })
});

export const userSchemaJoi = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': "L'email n'est pas valide",
      'string.empty': "L'email est requis",
      'any.required': "L'email est requis"
    }),
  name: Joi.string().min(3).max(50).required()
    .messages({
      'string.min': 'Le nom doit contenir au moins 3 caractères',
      'string.max': 'Le nom doit contenir au maximum 50 caractères',
      'any.required': 'Le nom est requis'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Le mot de passe est requis'
    }),
  birthDate: Joi.date().optional().messages({ 'date.base': 'La date de naissance doit être une date valide' }),
  roleId: Joi.string().required().messages({ 'any.required': "L'identifiant du rôle est requis" }),
  status: Joi.string().valid('active', 'suspended').default('active')
    .messages({ 'any.only': "Le statut doit être 'active' ou 'suspended'" }),
  cin: Joi.string().required().messages({ 'any.required': 'Le CIN est requis' })
});

export const updatePermissionsSchema = Joi.object({
  // System / users
  manage_system: Joi.boolean().optional(),
  manage_users_view: Joi.boolean().optional(),
  manage_users_create: Joi.boolean().optional(),
  manage_users_update: Joi.boolean().optional(),
  manage_users_delete: Joi.boolean().optional(),
  manage_users_suspend: Joi.boolean().optional(),

  // Patients
  patient_view: Joi.boolean().optional(),
  patient_create: Joi.boolean().optional(),
  patient_update: Joi.boolean().optional(),
  patient_delete: Joi.boolean().optional(),
  patient_search: Joi.boolean().optional(),
  patient_view_history: Joi.boolean().optional(),

  // Appointments
  appointment_view_own: Joi.boolean().optional(),
  appointment_view_all: Joi.boolean().optional(),
  appointment_create: Joi.boolean().optional(),
  appointment_update: Joi.boolean().optional(),
  appointment_cancel: Joi.boolean().optional(),

  // Consultations
  consultation_create: Joi.boolean().optional(),
  consultation_view: Joi.boolean().optional(),
  consultation_update: Joi.boolean().optional(),

  // Documents
  document_upload: Joi.boolean().optional(),
  document_view: Joi.boolean().optional(),
  document_delete: Joi.boolean().optional(),
  document_download: Joi.boolean().optional(),

  // Laboratory
  lab_order_create: Joi.boolean().optional(),
  lab_order_view: Joi.boolean().optional(),
  lab_result_upload: Joi.boolean().optional(),
  lab_result_validate: Joi.boolean().optional(),
  lab_result_view: Joi.boolean().optional(),

  // Pharmacy
  prescription_create: Joi.boolean().optional(),
  prescription_sign: Joi.boolean().optional(),
  prescription_view: Joi.boolean().optional(),
  prescription_assign_pharmacy: Joi.boolean().optional(),
  pharmacy_view_assigned: Joi.boolean().optional(),
  pharmacy_dispense_prescription: Joi.boolean().optional(),
  pharmacy_manage_partners: Joi.boolean().optional()
}).min(1).messages({ 'object.min': 'Fournissez au moins une permission à mettre à jour' });

// Appointment validation
// Note: documents field handled by multer, not validated in Joi
export const appointmentSchemaJoi = Joi.object({
  patientId: Joi.string().required().messages({ 'any.required': 'Le patient est requis' }),
  doctoreChose: Joi.string().optional().allow(null, '', 0).messages({ 'string.base': "Le médecin choisi doit être une chaîne" }),
  reason: Joi.string().required().min(3).messages({ 'string.min': 'Le motif doit contenir au moins 3 caractères', 'any.required': 'Le motif est requis' }),
  type: Joi.string().valid('consultation générale', 'suivi').default('consultation générale')
    .messages({ 'any.only': "Le type doit être 'consultation générale' ou 'suivi'" }),
  weekOffset: Joi.number().integer().min(0).default(0).messages({ 'number.base': "L'offset doit être un nombre entier positif" })
});

// Appointment Status Update validation
export const updateAppointmentStatusSchemaJoi = Joi.object({
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').required()
    .messages({ 'any.only': "Le statut doit être 'scheduled', 'completed' ou 'cancelled'", 'any.required': 'Le statut est requis' })
});

// Medical Record validation
// Note: documents field handled by multer, not validated in Joi
export const medicalRecordSchemaJoi = Joi.object({
  patientId: Joi.string().required().messages({ 'any.required': 'Le patient est requis' }),
  appointmentId: Joi.string().required().messages({ 'any.required': "L'identifiant du rendez-vous est requis" }),
  priority: Joi.string().valid('Normal', 'À suivre', 'Traitement nécessaire', 'Urgent').default('Normal')
    .messages({ 'any.only': 'Priorité invalide' }),
  typeMedical: Joi.string().required().min(3).messages({ 'string.min': 'Le type médical doit contenir au moins 3 caractères', 'any.required': 'Le type médical est requis' }),
  description: Joi.string().optional().allow(''),
  resultDate: Joi.date().optional().messages({ 'date.base': 'La date de résultat doit être une date valide' })
});

// Medical Record Update validation
export const updateMedicalRecordSchemaJoi = Joi.object({
  priority: Joi.string().valid('Normal', 'À suivre', 'Traitement nécessaire', 'Urgent').optional().messages({ 'any.only': 'Priorité invalide' }),
  typeMedical: Joi.string().min(3).optional().messages({ 'string.min': 'Le type médical doit contenir au moins 3 caractères' }),
  description: Joi.string().optional().allow(''),
  resultDate: Joi.date().optional().messages({ 'date.base': 'La date de résultat doit être une date valide' })
});

// Medical Record Action validation
export const medicalRecordActionSchemaJoi = Joi.object({
  type: Joi.string().valid('treatment', 'scanner', 'analysis').required().messages({ 'any.only': 'Type d action invalide', 'any.required': "Le type d'action est requis" }),
  description: Joi.string().required().min(3).messages({ 'string.min': 'La description doit contenir au moins 3 caractères', 'any.required': 'La description est requise' })
});

// Holiday validation
export const holidaySchemaJoi = Joi.object({
  name: Joi.string().required().min(3).max(100).messages({ 'string.min': 'Le nom doit contenir au moins 3 caractères', 'any.required': 'Le nom est requis' }),
  date: Joi.date().required().messages({ 'date.base': 'La date doit être une date valide', 'any.required': 'La date est requise' }),
  description: Joi.string().optional().allow(''),
  active: Joi.boolean().optional()
});

// Holiday Update validation
export const updateHolidaySchemaJoi = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({ 'string.min': 'Le nom doit contenir au moins 3 caractères' }),
  date: Joi.date().optional().messages({ 'date.base': 'La date doit être une date valide' }),
  description: Joi.string().optional().allow(''),
  active: Joi.boolean().optional()
});

// Working Hour validation
export const workingHourSchemaJoi = Joi.object({
  day: Joi.string().valid('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche').required(),
  start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    .messages({ 'string.pattern.base': 'L heure de début doit être au format HH:MM (24h)' }),
  end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    .messages({ 'string.pattern.base': 'L heure de fin doit être au format HH:MM (24h)' }),
  active: Joi.boolean().optional()
});

// Working Hour Update validation
export const updateWorkingHourSchemaJoi = Joi.object({
  day: Joi.string().valid('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche').optional(),
  start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
    .messages({ 'string.pattern.base': 'L heure de début doit être au format HH:MM (24h)' }),
  end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
    .messages({ 'string.pattern.base': 'L heure de fin doit être au format HH:MM (24h)' }),
  active: Joi.boolean().optional()
});

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message("ObjectId invalide");

export const createOrderSchema = Joi.object({
  patientId: objectId.required().messages({ 'any.required': 'Le patient est requis' }),
  medecinId: objectId.required().messages({ 'any.required': "L'identifiant du médecin est requis" }),
  consultationId: objectId.allow(null).optional(),
  orderDate: Joi.date().iso().optional().default(() => new Date()),
  status: Joi.string().valid('ordered', 'received', 'validated').optional().default('ordered')
    .messages({ 'any.only': "Le statut doit être 'ordered', 'received' ou 'validated'" }),
  tests: Joi.array().items(Joi.string().min(1)).min(1).required().messages({ 'array.min': 'Au moins un test est requis', 'array.base': 'Les tests doivent être un tableau' })
});

export const updateOrderSchema = Joi.object({
  patientId: objectId.optional(),
  medecinId: objectId.optional(),
  consultationId: objectId.allow(null).optional(),
  orderDate: Joi.date().iso().optional(),
  status: Joi.string().valid('ordered', 'received', 'validated').optional(),
  tests: Joi.array().items(Joi.string().min(1)).optional()
}).min(1).messages({ 'object.min': 'Fournissez au moins un champ à mettre à jour' });

