import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    enum: ["admin", "doctore", "infermeri", "accueil", "patient"]
  },
  description: { type: String },
  permissions: {
    // Users
    create_user: { type: Boolean, default: false },
    delete_user: { type: Boolean, default: false },
    update_user: { type: Boolean, default: false },
    
    // Patients / Medical Records
    create_patient_record: { type: Boolean, default: false },
    view_patient_record: { type: Boolean, default: false },
    update_patient_record: { type: Boolean, default: false },
    
    // Appointments
    create_appointment: { type: Boolean, default: false },
    update_appointment: { type: Boolean, default: false },
    cancel_appointment: { type: Boolean, default: false },
    view_appointment: { type: Boolean, default: false },
  }
}, { timestamps: true });

roleSchema.methods.hasPermission = function(permissionName) {
  return this.permissions[permissionName] === true;
};

const allowedFields = ["name", "description", "permissions"];

// Update single field
roleSchema.methods.updateField = async function(field, value) {
  if(!allowedFields.includes(field)) throw new Error("Field cannot be updated");

  if(field === "permissions" && typeof value === "object") {
    this.permissions = { ...this.permissions, ...value };
  } else {
    this[field] = value;
  }

  await this.save();
  return this;
};

// update multiple filds
roleSchema.methods.updateFields = async function(fieldsObj) {
  for(const key in fieldsObj) {
    if(!allowedFields.includes(key)) continue;

    if(key === "permissions" && typeof fieldsObj[key] === "object") {
      this.permissions = { ...this.permissions, ...fieldsObj[key] };
    } else {
      this[key] = fieldsObj[key];
    }
  }

  await this.save();
  return this;
};

const Role = mongoose.model("Role", roleSchema);
export default Role;
