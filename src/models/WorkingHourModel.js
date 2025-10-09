import mongoose from "mongoose";

const workingHourSchema = new mongoose.Schema({
  day: { 
    type: String, 
    enum: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"], 
    required: true 
  },
  start: { type: String, required: true }, // format "08:00"
  end: { type: String, required: true },   // format "17:00"
  active: { type: Boolean, default: true } // si ce jour est actif
}, { timestamps: true });

export default mongoose.model("WorkingHour", workingHourSchema);
