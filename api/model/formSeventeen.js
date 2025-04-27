import mongoose from "mongoose";

const formSeventeenSchema = new mongoose.Schema({
  hasFghrsPhotos: {
    type: String,
    required: [true, "FGHRS photos selection is required"],
    enum: ["yes", "no"],
  },
  isFghrsPresent: {
    type: String,
    required: [true, "FGHRS presence selection is required"],
    enum: ["yes", "no"],
  },
  indexNumber: {
    type: Number,
    required: false, // Required in frontend validation if isFghrsPresent is "yes"
  },
  brandModel: {
    type: String,
    required: false, // Required in frontend validation if isFghrsPresent is "yes"
  },
  pvCellsKwp: {
    type: Number,
    required: false, // Required in frontend validation if isFghrsPresent is "yes"
  },
  elevation: {
    type: Number,
    required: false, // Required in frontend validation if isFghrsPresent is "yes"
  },
  fghrsPhotos: { type: [String], required: false }, // Array of file paths for photos
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formSeventeenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formSeventeenSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormSeventeen = mongoose.model("FormSeventeen", formSeventeenSchema);