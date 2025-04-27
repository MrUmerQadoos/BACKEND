import mongoose from "mongoose";

const formSixSchema = new mongoose.Schema({
  wallType: { type: String, required: false },
  insulationType: { type: String, required: false },
  dryLining: { type: String, required: false },
  insulationThickness: { type: String, required: false },
  externalThickness: { type: String, required: false },
  uValue: { type: String, required: false },
  partyWallType: { type: String, required: false },
  constructionPhoto: { type: String, required: false },
  wallThicknessUnknown: { type: String, required: false },
  constructionPhotos: { type: [String], required: false },
  insulationPhotos: { type: [String], required: false },
  thicknessPhotos: { type: [String], required: false },
  userId: { type: String, required: false },
  processId: { type: String, required: false, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` timestamp on every update
formSixSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formSixSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormSix = mongoose.model("FormSix", formSixSchema);