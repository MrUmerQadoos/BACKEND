import mongoose from "mongoose";

const formFifteenSchema = new mongoose.Schema({
  hasSolarWaterHeating: {
    type: String,
    required: [true, "Solar water heating selection is required"],
    enum: ["yes", "no"],
  },
  areDetailsKnown: {
    type: String,
    required: [true, "Details known selection is required"],
    enum: ["yes", "no"],
  },
  collectorElevation: {
    type: String,
    required: [true, "Collector elevation is required"],
    enum: ["Horizontal", "30°", "45°", "60°", "Vertical"],
  },
  overshading: {
    type: String,
    required: [true, "Overshading selection is required"],
    enum: ["Heavy", "Significant", "Modest", "None or Little"],
  },
  solarPump: {
    type: String,
    required: [true, "Solar pump selection is required"],
    enum: ["Unknown", "Electrically powered", "PV powered"],
  },
  solarCollectorDetailsKnown: {
    type: String,
    required: [true, "Solar collector details known selection is required"],
    enum: ["yes", "no"],
  },
  solarPhotos: { type: [String], required: false }, // Array of file paths (optional)
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formFifteenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formFifteenSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormFifteen = mongoose.model("FormFifteen", formFifteenSchema);