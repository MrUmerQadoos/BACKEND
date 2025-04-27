import mongoose from "mongoose";

const formFiveSchema = new mongoose.Schema({
  corridor: { type: String, required: false }, // "None", "Heated", "Unheated"
  corridorPhotos: { type: [String], required: false }, // Store an array of file paths for the images
  shelteredWallLength: { type: String, required: false }, // Length of Sheltered Wall (m)
  positionInBlock: { type: String, required: false }, // e.g., "Basement", "Ground Floor", etc.
  whichFloor: { type: String, required: false }, // e.g., "2nd"
  userId: { type: String, required: false },
  processId: { type: String, required: false, unique: true }, // Ensure one FormFive per processId
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
formFiveSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formFiveSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormFive = mongoose.model("FormFive", formFiveSchema);