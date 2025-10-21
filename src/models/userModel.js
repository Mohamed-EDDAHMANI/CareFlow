import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthDate: { type: Date },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  refreshToken: { type: String },
  cin: { type: String, required: true, unique: true },
  permissions: {
    // --- Gestion Système & Admin ---
    manage_system: { type: Boolean, default: false }, // Accès super-admin
    manage_users_view: { type: Boolean, default: false },
    manage_users_create: { type: Boolean, default: false },
    manage_users_update: { type: Boolean, default: false },
    manage_users_delete: { type: Boolean, default: false },
    manage_users_suspend: { type: Boolean, default: false },

    // --- Gestion Patients (CliniqueService) ---
    patient_view: { type: Boolean, default: false },
    patient_create: { type: Boolean, default: false },
    patient_update: { type: Boolean, default: false },
    patient_delete: { type: Boolean, default: false },
    patient_search: { type: Boolean, default: false },
    patient_view_history: { type: Boolean, default: false }, // Vue agrégée

    // --- Gestion Rendez-vous (CliniqueService) ---
    appointment_view_own: { type: Boolean, default: false },
    appointment_view_all: { type: Boolean, default: false }, // Pour secrétaires/admin
    appointment_create: { type: Boolean, default: false },
    appointment_update: { type: Boolean, default: false },
    appointment_cancel: { type: Boolean, default: false },

    // --- Gestion Consultations (CliniqueService) ---
    consultation_create: { type: Boolean, default: false }, // Créer + enregistrer vitales
    consultation_view: { type: Boolean, default: false },
    consultation_update: { type: Boolean, default: false }, // Modifier diagnostics, notes

    // --- Gestion Documents (CliniqueService) ---
    document_upload: { type: Boolean, default: false },
    document_view: { type: Boolean, default: false },
    document_delete: { type: Boolean, default: false },
    document_download: { type: Boolean, default: false }, // (Générer URL présignée)

    // --- Gestion Laboratoire (LaboratoireService) ---
    lab_order_create: { type: Boolean, default: false }, // Médecin
    lab_order_view: { type: Boolean, default: false }, // Médecin, Patient, Labo
    lab_result_upload: { type: Boolean, default: false }, // Labo
    lab_result_validate: { type: Boolean, default: false }, // Labo (responsable)
    lab_result_view: { type: Boolean, default: false }, // Médecin, Patient

    // --- Gestion Pharmacie (PharmacyService) ---
    prescription_create: { type: Boolean, default: false }, // Médecin
    prescription_sign: { type: Boolean, default: false }, // Médecin (valider un 'draft')
    prescription_view: { type: Boolean, default: false }, // Médecin, Patient
    prescription_assign_pharmacy: { type: Boolean, default: false }, // Médecin/Patient
    
    // Permissions spécifiques Pharmacien
    pharmacy_view_assigned: { type: Boolean, default: false }, // Pharmacien
    pharmacy_dispense_prescription: { type: Boolean, default: false }, // Pharmacien
    
    // Permissions Admin pour gérer les partenaires
    pharmacy_manage_partners: { type: Boolean, default: false }, // Admin (CRUD pharmacies)
  }
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update single field
const allowedFields = ["name", "birthDate", "password"];
userSchema.methods.updateField = async function (field, value) {
  if (!allowedFields.includes(field)) throw new Error("Field cannot be updated");

  if (field === "password") {
    this.password = await bcrypt.hash(value, 10);
  } else {
    this[field] = value;
  }

  await this.save();
  return this;
};

// Update multiple fields
userSchema.methods.updateFields = async function (fieldsObj) {
  for (const key in fieldsObj) {
    if (!allowedFields.includes(key)) continue;
    if (key === "password") {
      this.password = await bcrypt.hash(fieldsObj[key], 10);
    } else {
      this[key] = fieldsObj[key];
    }
  }
  await this.save();
  return this;
};

// Check if active
userSchema.methods.isActive = function () {
  return this.status === "active";
};

// Suspend / activate user
userSchema.methods.suspend = async function () {
  this.status = "suspended";
  await this.save();
  return this;
};

userSchema.methods.activate = async function () {
  this.status = "active";
  await this.save();
  return this;
};

const User = mongoose.model("User", userSchema);
export default User;
