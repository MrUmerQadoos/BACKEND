import mongoose from "mongoose";

const formTwentySixSchema = new mongoose.Schema({
  isSameAsMainRoof: {
    type: String,
    required: [true, "Same as Main Roof selection is required"],
    enum: ["yes", "no"],
  },
  hasConstructionPhotos: {
    type: String,
    required: [true, "Construction Photos selection is required"],
    enum: ["yes", "no"],
  },
  constructionPhotos: {
    type: [String],
    required: false,
  },
  roofType: {
    type: String,
    required: [true, "Roof Type is required"],
    enum: [
      "Pitched (slates/tiles), access to loft",
      "Pitched (slates/tiles), no access",
      "Pitched, sloping ceiling",
      "Pitched (thatch)",
      "Flat",
      "Same dwelling above",
      "Another dwelling above",
    ],
  },
  roofInsulation: {
    type: String,
    required: [true, "Roof Insulation is required"],
    enum: [
      "12mm",
      "25mm",
      "50mm",
      "75mm",
      "100mm",
      "150mm",
      "200mm",
      "250mm",
      "270mm",
      "300mm",
      "350mm",
      "400+mm",
    ],
  },
  insulationDepthFlatSloping: {
    type: String,
    required: [true, "Insulation Depth (Flat/Sloping) is required"],
    enum: ["None", "As Built", "50mm", "100mm", "150mm or more", "Unknown"],
  },
  loftInsulationDepthPhotos: {
    type: [String],
    required: false,
  },
  hasExtensionRoomInRoofPhotos: {
    type: String,
    required: [true, "Extension Room in Roof Photos selection is required"],
    enum: ["yes", "no"],
  },
  extensionRoomInRoofPhotos: {
    type: [String],
    required: false,
  },
  roomInRoofInsulation: {
    type: String,
    required: [true, "Room in Roof Insulation is required"],
    enum: ["Flat ceiling only", "All elements", "As Built", "Unknown"],
  },
  insulationThicknessAtCeiling: {
    type: String,
    required: [true, "Insulation Thickness at Ceiling is required"],
    enum: [
      "12mm",
      "25mm",
      "50mm",
      "75mm",
      "100mm",
      "150mm",
      "200mm",
      "250mm",
      "270mm",
      "300mm",
      "350mm",
      "400+mm",
      "Not Applicable",
    ],
  },
  insulationOtherParts: {
    type: String,
    required: [true, "Insulation of Other Parts is required"],
    enum: ["None", "As Built", "50mm", "100mm", "150mm or more", "Unknown"],
  },
  isConnectedToAnotherBuildingPart: {
    type: String,
    required: [true, "Connected to Another Building Part selection is required"],
    enum: ["yes", "no"],
  },
  editRoomInRoof: {
    type: String,
    required: [true, "Edit Room in Roof selection is required"],
    enum: ["yes", "no"],
  },
  isSameAsMainFloor: {
    type: String,
    required: [true, "Same as Main Floor selection is required"],
    enum: ["yes", "no"],
  },
  insulationThicknessRetroFitted: {
    type: String,
    required: [true, "Insulation Thickness (Retro-fitted) is required"],
    enum: ["50mm", "100mm", "150mm", "Unknown"],
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

formTwentySixSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formTwentySixSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormTwentySix = mongoose.model("FormTwentySix", formTwentySixSchema);