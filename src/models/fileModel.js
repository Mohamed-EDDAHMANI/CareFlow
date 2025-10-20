import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  category: { type: String, enum: ['report', 'imaging']},
}, { timestamps: true });

fileSchema.pre("save", function (next) {
  if (this.mimeType === "application/pdf") {
    this.category = "report";
  } else if (["image/jpeg", "image/png"].includes(this.mimeType)) {
    this.category = "imaging";
  } else {
    this.category = "report"; 
  }
  next();
});

export default fileSchema;
