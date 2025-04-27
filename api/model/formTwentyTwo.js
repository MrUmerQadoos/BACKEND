import mongoose from "mongoose";

const formTwentyTwoSchema = new mongoose.Schema({
  extensionDateBand: {
    type: Number,
    required: [true, "Extension Date Band is required"],
  },
  extensionRoomsInRoofDateBand: {
    type: String,
    required: [true, "Extension Rooms in Roof Date Band is required"],
  },
  extensionRoomPhotos: {
    type: [String],
    required: false,
  },
  userId: {
    type: String,
    required: [true, "User ID is required"],
  },
  processId: {
    type: String,
    required: [true, "Process ID is required"],
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

formTwentyTwoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formTwentyTwoSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormTwentyTwo = mongoose.model("FormTwentyTwo", formTwentyTwoSchema);