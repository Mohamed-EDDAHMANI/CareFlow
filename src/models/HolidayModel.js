import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  date: { type: Date, required: true },  // ex: 2025-11-05
  name: { type: String },                // ex: "Fête Nationale"
  active: { type: Boolean, default: true } // si le jour est férié (true = closed)
}, { timestamps: true });

export default mongoose.model("Holiday", holidaySchema);
