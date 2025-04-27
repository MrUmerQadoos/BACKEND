import mongoose from "mongoose";

const formTwoSchema = new mongoose.Schema(
  {
    processId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Process",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    surveyorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyTenure: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    numberOfStoreys: {
      type: String,
      required: true,
    },
    numberOfHabitableRooms: {
      type: String,
      required: true,
    },
    numberOfHeatedHabitableRooms: {
      type: String,
      required: true,
    },
    mainPropertyDateBand: {
      type: String,
      required: true,
    },
    mainPropertyRoomInRoofDateBand: {
      type: String,
      required: true,
    },
    elevationPhotoSelection: { // Renamed to avoid conflict with the array field
      type: String, // Dropdown selection (e.g., "Front", "Rear")
      required: true,
    },
    elevationPhotos: [String], // Array of file paths for elevation photos
    additionalPhotos: [String], // Array of file paths for additional photos
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { updatedAt: "updatedAt" },
  }
);

const FormTwo = mongoose.models.FormTwo || mongoose.model("FormTwo", formTwoSchema);

export { FormTwo };