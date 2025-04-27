import mongoose from "mongoose";

const formNineSchema = new mongoose.Schema({
  hasMainRoomInRoof: { 
    type: String, 
    required: [true, "Main room in roof selection is required"],
    enum: ["yes", "no"]
  },
  insulationType: { 
    type: String, 
    required: [true, "Insulation type is required"],
    enum: ["Flat ceiling only", "All elements", "As Built", "Unknown"]
  },
  insulationThicknessCeiling: { 
    type: String, 
    required: [true, "Insulation thickness at ceiling is required"],
    enum: [
      "12mm", "25mm", "50mm", "75mm", "100mm", "150mm", 
      "200mm", "250mm", "270mm", "300mm", "350mm", "400+mm", 
      "Not Applicable"
    ],
  },
  insulationOtherParts: { 
    type: String, 
    required: [true, "Insulation of other parts is required"],
    enum: ["None", "As Built", "50mm", "100mm", "150mm or more", "Unknown"],
  },
  mainRoomPhotos: { type: [String], required: false }, // Array of file paths
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formNineSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formNineSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormNine = mongoose.model("FormNine", formNineSchema);