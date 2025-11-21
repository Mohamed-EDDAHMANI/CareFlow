import mongoose from "mongoose";
import fileSchema from "./fileModel.js";

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["consultation générale", "suivi", "follow-up", "emergency", "check-up"], default: "consultation générale" },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  reason: { type: String },
  document: [fileSchema], // documents for suivi
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" }
}, { timestamps: true });

// 🔒 PREVENT DOUBLE BOOKING: Unique index ensures no overlapping appointments for same doctor at same time
// Only enforced for scheduled appointments (completed/cancelled can overlap)
appointmentSchema.index(
  { doctorId: 1, start: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'scheduled' },
    name: 'unique_doctor_scheduled_slot'
  }
);

// Additional index for efficient querying
appointmentSchema.index({ patientId: 1, start: 1 });
appointmentSchema.index({ doctorId: 1, start: 1, end: 1 });
appointmentSchema.index({ status: 1, start: 1 });

// Mark appointment as completed
appointmentSchema.methods.markCompleted = async function() {
  this.status = "completed";
  return this.save();
};

// Cancel appointment
appointmentSchema.methods.cancel = async function() {
  this.status = "cancelled";
  return this.save();
};

// Check if appointment is in the past
appointmentSchema.methods.isPast = function() {
  return new Date() > this.end;
};

// Check if appointment is today
appointmentSchema.methods.isToday = function() {
  const today = new Date();
  const appointmentDate = new Date(this.start);
  return today.toDateString() === appointmentDate.toDateString();
};

// Get duration in minutes
appointmentSchema.methods.getDuration = function() {
  return Math.round((this.end - this.start) / (1000 * 60));
};

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
