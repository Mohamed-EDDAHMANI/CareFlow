import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["email", "whatsapp"], required: true },
  message: { type: String, required: true },
  relatedAppointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
