import mongoose from "mongoose";

const formTwentyFourSchema = new mongoose.Schema({
  wallType: {
    type: String,
    required: [true, "Wall Type is required"],
    enum: [
      "Stone",
      "Solid Brick",
      "Cob",
      "Cavity",
      "Timber Frame",
      "System Build",
      "Park Home Wall",
    ],
  },
  insulationThickness: {
    type: String,
    required: [true, "Insulation Thickness is required"],
    enum: ["50mm", "100mm", "150mm", "200mm", "Unknown"],
  },
  insulationType: {
    type: String,
    required: [true, "Insulation Type is required"],
    enum: [
      "External",
      "Filled Cavity",
      "Filled Cavity + Internal",
      "Filled Cavity + External",
      "Unfilled Cavity + Internal",
      "Unfilled Cavity + External",
      "Internal",
      "As Built",
      "Unknown",
      "Dry-lining",
    ],
  },
  alternativeWallThickness: {
    type: String,
    required: [true, "Alternative Wall Thickness is required"],
  },
  wallThicknessUnknown: {
    type: String,
    required: [true, "Wall Thickness Unknown is required"],
  },
  uValueKnown: {
    type: String,
    required: [true, "U-value Known is required"],
  },
  partyWallType: {
    type: String,
    required: [true, "Party Wall Type is required"],
    enum: [
      "Solid Masonry/ Timber/ System Build",
      "Cavity Masonry unfilled",
      "Cavity Masonry filled",
      "Unable to determine",
    ],
  },
  constructionPhotos: {
    type: [String],
    required: false,
  },
  wallInsulationPhotos: {
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

formTwentyFourSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formTwentyFourSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormTwentyFour = mongoose.model("FormTwentyFour", formTwentyFourSchema);