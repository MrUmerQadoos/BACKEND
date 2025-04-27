import mongoose from "mongoose";

const formFourSchema = new mongoose.Schema({
  // Fields for "Is there a Conservatory?" section
  isConservatory: { type: String, required: false }, // "yes" or "no"
  isThermallySeparated: { type: String, required: false }, // "yes" or "no"
  photoThermalSeparation: { type: [String], required: false }, // Array to store multiple file paths
  isFixedHeaters: { type: String, required: false }, // "yes" or "no"

  // Floor Area, Double Glazed, Glazed Perimeter, etc.
  floorArea: { type: String, required: false },
  doubleGlazed: { type: String, required: false }, // "yes" or "no"
  glazedPerimeter: { type: String, required: false },
  roomHeight: { type: String, required: false }, // e.g. "1 Storey", "2 Storey", etc.

  userId: { type: String, required: false },
  processId: { type: String, required: false, unique: true }, // Ensure one FormFour per processId

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the `updatedAt` timestamp on every update
formFourSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formFourSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormFour = mongoose.model("FormFour", formFourSchema);