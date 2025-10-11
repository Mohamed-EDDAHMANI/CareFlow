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
  cin: { type: String , required: true, unique: true },
  permissions: {
    create_user: { type: Boolean, default: false },
    delete_user: { type: Boolean, default: false },
    update_user: { type: Boolean, default: false },

    create_appointment: { type: Boolean, default: false },
    update_appointment: { type: Boolean, default: false },
    cancel_appointment: { type: Boolean, default: false },
    view_appointment: { type: Boolean, default: false },

    create_medical_record: { type: Boolean, default: false },
    view_medical_record: { type: Boolean, default: false },
    update_medical_record: { type: Boolean, default: false },

    send_notification: { type: Boolean, default: false },
    manage_system: { type: Boolean, default: false }
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
