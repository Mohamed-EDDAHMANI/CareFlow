import mongoose from "mongoose";
import fileSchema from "./fileModel.js";

const actionSchema = new mongoose.Schema({
  type: { type: String, enum: ["treatment", "scanner", "analysis"], required: true },
  description: { type: String },
  document: { type: String }, // path or URL
  createdAt: { type: Date, default: Date.now }
});

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  priority: { type: String, enum: ["Normal", "À suivre", "Traitement nécessaire", "Urgent"], default: "Normal" },
  typeMedical: { type: String, required: true },
  description: { type: String },
  document: [fileSchema], // optional main document
  actions: [actionSchema],
  resultDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Add new action
medicalRecordSchema.methods.addAction = function(type, description, document = null) {
  this.actions.push({
    type,
    description,
    document,
    createdAt: new Date()
  });
  return this.save();
};

// Get latest action
medicalRecordSchema.methods.getLatestAction = function() {
  return this.actions.sort((a, b) => b.createdAt - a.createdAt)[0];
};

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
