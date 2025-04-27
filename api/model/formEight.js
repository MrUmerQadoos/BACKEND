import mongoose from "mongoose";

const formEightSchema = new mongoose.Schema({
  hasConstructionPhotos: { type: String, required: true }, // "yes" or "no"
  roofType: { type: String, required: true },
  insulationType: { type: String, required: true },
  insulationDepthPitched: { type: String, required: true },
  insulationDepthFlat: { type: String, required: true },
  constructionPhotos: [String], // Array of file paths
  loftInsulationPhotos: [String], // Array of file paths
  userId: { type: String, required: true },
  processId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FormEight = mongoose.model("FormEight", formEightSchema);