import mongoose from "mongoose";

const formSevenSchema = new mongoose.Schema({
  hasAlternativeWalls: { 
    type: String, 
    required: [true, "Alternative walls selection is required"],
    enum: ["yes", "no"]
  },
  wallArea: { 
    type: String, 
    required: [true, "Wall area is required"],
    validate: {
      validator: function (value) {
        return !isNaN(value) && Number(value) > 0;
      },
      message: "Wall area must be a positive number",
    },
  },
  shelteredWall: { 
    type: String, 
    required: [true, "Sheltered wall selection is required"],
    enum: ["yes", "no"]
  },
  wallType: { 
    type: String, 
    required: [true, "Wall type is required"],
    enum: [
      "granite or whinstone",
      "sandstone or limestone",
      "Solid Brick",
      "Cob",
      "Cavity",
      "Timber Frame",
      "System Build",
    ],
  },
  insulation: { 
    type: String, 
    required: [true, "Insulation type is required"],
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
    ],
  },
  externalWallThickness: { 
    type: String, 
    required: [true, "External wall thickness is required"],
    validate: {
      validator: function (value) {
        return !isNaN(value) && Number(value) > 0;
      },
      message: "External wall thickness must be a positive number",
    },
  },
  wallThicknessUnknown: { 
    type: String, 
    required: [true, "Wall thickness unknown selection is required"],
    enum: ["yes", "no"]
  },
  insulationThickness: { 
    type: String, 
    required: [true, "Insulation thickness is required"],
    enum: ["50mm", "100mm", "150mm", "200mm", "Unknown"],
  },
  wallInsulationPhotos: { type: [String], required: false }, // Array of file paths
  alternativeWallsPhotos: { type: [String], required: false }, // Array of file paths
  wallThicknessPhotos: { type: [String], required: false }, // Array of file paths
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formSevenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formSevenSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormSeven = mongoose.model("FormSeven", formSevenSchema);