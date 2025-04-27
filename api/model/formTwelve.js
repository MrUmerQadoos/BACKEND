import mongoose from "mongoose";

const formTwelveSchema = new mongoose.Schema({
  hasVentilationCoolingPhotos: {
    type: String,
    required: [true, "Please specify if ventilation & cooling photos are available"],
    enum: ["yes", "no"],
  },
  numberOfOpenFireplaces: {
    type: String, // Stored as string to match frontend input, but validated as numeric
    required: [true, "Number of open fireplaces is required"],
    validate: {
      validator: function (v) {
        return /^\d+$/.test(v) && parseInt(v, 10) >= 0; // Ensures it's a non-negative integer
      },
      message: "Number of open fireplaces must be a non-negative integer",
    },
  },
  mechanicalVentilation: {
    type: String,
    required: [true, "Mechanical ventilation type is required"],
    enum: ["Supply Extract System", "Fixed Space Cooling", "None"],
  },
  ventilationCoolingPhotos: { type: [String], required: false }, // Array of file paths
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formTwelveSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formTwelveSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormTwelve = mongoose.model("FormTwelve", formTwelveSchema);