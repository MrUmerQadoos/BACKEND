import mongoose from "mongoose";

const formTwentyOneSchema = new mongoose.Schema({
  propertyAddress: {
    type: String,
    required: [true, "Property Address is required"],
  },
  extension: {
    type: String,
    required: [true, "Extension selection is required"],
    enum: ["1", "2", "3", "4"],
  },
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

formTwentyOneSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formTwentyOneSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormTwentyOne = mongoose.model("FormTwentyOne", formTwentyOneSchema);