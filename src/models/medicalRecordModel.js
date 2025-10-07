import mongoose from "mongoose";

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
  document: { type: String }, // optional main document
  actions: [actionSchema], // ici toutes les actions liées à ce record
  resultDate: { type: Date, default: Date.now }
}, { timestamps: true });

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
