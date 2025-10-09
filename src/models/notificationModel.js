import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["email", "whatsapp"], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  isRead: { type: Boolean, default: false },
  relatedAppointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }
}, { timestamps: true });

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Mark notification as sent
notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

// Mark notification as failed
notificationSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  return this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
