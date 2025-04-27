import mongoose from "mongoose";

const formTwentyFiveSchema = new mongoose.Schema({
  hasAlternativeWallsPhotos: {
    type: String,
    required: [true, "Alternative Walls Photos selection is required"],
    enum: ["yes", "no"],
  },
  alternativeWallsPhotos: {
    type: [String],
    required: false,
  },
  wallArea: {
    type: String,
    required: [true, "Wall Area is required"],
  },
  isShelteredWall: {
    type: String,
    required: [true, "Sheltered Wall selection is required"],
    enum: ["yes", "no"],
  },
  wallType: {
    type: String,
    required: [true, "Wall Type is required"],
    enum: ["Stone", "Solid Brick", "Cob", "Cavity", "Timber Frame", "System Build"],
  },
  hasWallInsulation: {
    type: String,
    required: [true, "Wall Insulation selection is required"],
    enum: ["yes", "no"],
  },
  wallInsulationPhotos: {
    type: [String],
    required: false,
  },
  alternativeWallThickness: {
    type: String,
    required: [true, "Alternative Wall Thickness is required"],
  },
  isWallThicknessUnknown: {
    type: String,
    required: [true, "Wall Thickness Unknown selection is required"],
    enum: ["yes", "no"],
  },
  additionalNotes: {
    type: String,
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

formTwentyFiveSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formTwentyFiveSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormTwentyFive = mongoose.model("FormTwentyFive", formTwentyFiveSchema);