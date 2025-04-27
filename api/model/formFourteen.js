import mongoose from "mongoose";

const formFourteenSchema = new mongoose.Schema({
  hasWaterHeatingPhotos: {
    type: String,
    required: [true, "Please specify if water heating photos are available"],
    enum: ["yes", "no"],
  },
  waterHeatingDescription: {
    type: String,
    required: [true, "Water heating description is required"],
  },
  cylinderSize: {
    type: String,
    required: [true, "Cylinder size is required"],
    enum: ["No Access", "Normal", "Medium", "Large"],
  },
  insulated: {
    type: String,
    required: [true, "Insulation status is required"],
    enum: ["No insulation", "Jacket", "Foam"],
  },
  insulationThickness: {
    type: String,
    required: [true, "Insulation thickness is required"],
    enum: ["None", "12mm", "25mm", "38mm", "50mm", "80mm", "120mm", "160mm"],
  },
  cylinderThermostat: {
    type: String,
    required: [true, "Cylinder thermostat status is required"],
    enum: ["yes", "no"],
  },
  immersionHeater: {
    type: String,
    required: [true, "Immersion heater type is required"],
    enum: ["Single", "Dual"],
  },
  waterHeatingPhotos: { type: [String], required: false }, // Array of file paths
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formFourteenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formFourteenSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormFourteen = mongoose.model("FormFourteen", formFourteenSchema);