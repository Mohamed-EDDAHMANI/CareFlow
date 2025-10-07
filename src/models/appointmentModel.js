import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  practitionerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["consultation générale", "suivi"], default: "consultation générale" },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  reason: { type: String },
  document: [{ type: String }], // here the dokument has a value just when type is suivi
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" }
}, { timestamps: true });

// method to mark as completed
appointmentSchema.methods.markCompleted = async function() {
  this.status = "completed";
  await this.save();
};

appointmentSchema.methods.cancel = async function() {
  this.status = "cancelled";
  await this.save();
};

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
