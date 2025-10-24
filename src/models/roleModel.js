import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    enum: ["admin", "doctore", "infermeri", "accueil", "patient", "pharmacist", "responsabe"]
  },
  description: { type: String }
}, { timestamps: true });

const allowedFields = ["name", "description"];

// Update single field
roleSchema.methods.updateField = async function(field, value) {
  if(!allowedFields.includes(field)) throw new Error("Field cannot be updated");
  this[field] = value;
  await this.save();
  return this;
};

// Update multiple fields
roleSchema.methods.updateFields = async function(fieldsObj) {
  for(const key in fieldsObj) {
    if(!allowedFields.includes(key)) continue;
    this[key] = fieldsObj[key];
  }
  await this.save();
  return this;
};

const Role = mongoose.model("Role", roleSchema);
export default Role;
