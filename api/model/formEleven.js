import mongoose from "mongoose";

const formElevenSchema = new mongoose.Schema({
  additionalStructureType: {
    type: String,
    required: [true, "Additional structure type is required"],
    enum: ["Extension", "Conservatory", "Porch", "Garage", "None"],
  },
  insulationStatus: {
    type: String,
    required: [true, "Insulation status is required"],
    enum: ["Installed", "Not Installed", "Unknown"],
  },
  insulationThickness: {
    type: String,
    required: [
      function () {
        return this.insulationStatus === "Installed";
      },
      "Insulation thickness is required when insulation is installed",
    ],
    enum: ["50mm", "100mm", "150mm", "200mm", "Unknown", ""], // Allow empty string when not required
    default: "",
  },
  additionalNotes: { type: String, required: false },
  uValue: { type: String, required: false }, // Optional field for U-value
  structurePhotos: { type: [String], required: false }, // Array of file paths
  insulationPhotos: { type: [String], required: false }, // Array of file paths
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formElevenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formElevenSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormEleven = mongoose.model("FormEleven", formElevenSchema);