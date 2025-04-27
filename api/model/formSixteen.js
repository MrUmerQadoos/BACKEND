import mongoose from "mongoose";

const formSixteenSchema = new mongoose.Schema({
  totalRoomsWithBathOrShower: {
    type: Number,
    required: [true, "Total number of rooms with bath or shower is required"],
    min: [0, "Total number of rooms cannot be negative"],
  },
  roomsWithMixerShowerNoBath: {
    type: Number,
    required: [true, "Number of rooms with mixer shower and no bath is required"],
    min: [0, "Number of rooms cannot be negative"],
  },
  roomsWithBathAndMixerShower: {
    type: Number,
    required: [true, "Number of rooms with bath and mixer shower is required"],
    min: [0, "Number of rooms cannot be negative"],
  },
  isWwhrsPresent: {
    type: String,
    required: [true, "WWHRS presence selection is required"],
    enum: ["No/Unknown", "Yes - Instantaneous Type", "Yes - Storage", "Yes - Both"],
  },
  wwhrsPhotos: { type: [String], required: false }, // Array of file paths for documentary evidence
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formSixteenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formSixteenSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormSixteen = mongoose.model("FormSixteen", formSixteenSchema);