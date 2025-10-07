import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthDate: { type: Date },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  roleType: { type: String, enum: ["admin", "doctore", "infermeri","accueil", "patient"], default: "patient" },
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  refreshToken: { type: String }
}, { timestamps: true });


userSchema.pre("save", async function(next) {
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = function() {
  return jwt.sign({ id: this._id, role: this.roleType }, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
};

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign({ id: this._id, role: this.roleType }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

userSchema.methods.isAdmin = function() {
  return this.roleType === "admin";
};

userSchema.methods.isActive = function() {
  return this.status === "active";
};

// whitelist of fields allowed to update
const allowedFields = ["name", "birthDate", "password"];

// update a single field
userSchema.methods.updateField = async function(field, value) {
  if(!allowedFields.includes(field)) throw new Error("Field cannot be updated");

  if(field === "password") {
    this.password = await bcrypt.hash(value, 10);
  } else {
    this[field] = value;
  }

  await this.save();
  return this;
};

// update multiple fields at once
userSchema.methods.updateFields = async function(fieldsObj) {
  for(const key in fieldsObj) {
    if(!allowedFields.includes(key)) continue;
    
    if(key === "password") {
      this.password = await bcrypt.hash(fieldsObj[key], 10);
    } else {
      this[key] = fieldsObj[key];
    }
  }

  await this.save();
  return this;
};

const User = mongoose.model("User", userSchema);
export default User;
