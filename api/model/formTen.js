import mongoose from "mongoose";

const formTenSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, "Location is required"],
    enum: [
      "Ground floor",
      "Above partially heated space",
      "Above unheated space",
      "To external air",
      "Same dwelling below",
      "Another dwelling below",
    ],
  },
  type: {
    type: String,
    required: [true, "Type is required"],
    enum: ["Solid", "Suspended timber", "Suspended, not timber", "Unknown"],
  },
  insulation: {
    type: String,
    required: [true, "Insulation is required"],
    enum: ["As Built", "Retro-fitted", "Unknown"],
  },
  insulationThickness: {
    type: String,
    required: [
      function () {
        return this.insulation === "Retro-fitted";
      },
      "Insulation thickness is required for retro-fitted insulation",
    ],
    enum: ["50mm", "100mm", "150mm", "Unknown", ""], // "" allows it to be empty when not required
  },
  additionalNotes: { type: String, required: false },
  floorPhotos: { type: [String], required: false }, // Array of file paths
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formTenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formTenSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormTen = mongoose.model("FormTen", formTenSchema);