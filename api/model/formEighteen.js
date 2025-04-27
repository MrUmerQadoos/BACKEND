import mongoose from "mongoose";

const pvPanelSchema = new mongoose.Schema({
  pvCellsKwPeak: { type: String, required: false },
  orientation: { type: String, required: false },
  elevation: { type: String, required: false },
  overshading: { type: String, required: false },
  connected: { type: String, required: false },
});

const formEighteenSchema = new mongoose.Schema({
  hasNewTechPhotos: {
    type: String,
    required: [true, "New technologies photos selection is required"],
    enum: ["yes", "no"],
  },
  photovoltaicPanel: {
    type: String,
    required: [true, "Photovoltaic panel selection is required"],
    enum: ["None", "Panel Details", "% of roof area"],
  },
  pvPanels: {
    type: [pvPanelSchema],
    validate: {
      validator: function (v) {
        if (this.photovoltaicPanel === "Panel Details") {
          return v.every(
            (panel) =>
              panel.pvCellsKwPeak &&
              panel.orientation &&
              panel.elevation &&
              panel.overshading &&
              panel.connected
          );
        }
        return true;
      },
      message: "All PV panel fields are required when 'Panel Details' is selected.",
    },
  },
  proportionOfRoofArea: {
    type: String,
    required: function () {
      return this.photovoltaicPanel === "% of roof area";
    },
    validate: {
      validator: function (v) {
        return this.photovoltaicPanel !== "% of roof area" || (v && !isNaN(v));
      },
      message: "Proportion of roof area must be a valid number when '% of roof area' is selected.",
    },
  },
  connectedToDwellingMeter: {
    type: String,
    required: [true, "Connected to dwelling’s electricity meter selection is required"],
    enum: ["yes", "no"],
  },
  newTechPhotos: { type: [String], required: false }, // Array of file paths
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamps
formEighteenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formEighteenSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormEighteen = mongoose.model("FormEighteen", formEighteenSchema); 