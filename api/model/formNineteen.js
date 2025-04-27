import mongoose from "mongoose";

const formNineteenSchema = new mongoose.Schema({
  terrainType: {
    type: String,
    required: [true, "Terrain type is required"],
    enum: [
      "Urban (closely spaced buildings of 4 storeys or more)",
      "Suburban",
      "Rural",
    ],
  },
  windTurbinePresent: {
    type: String,
    required: [true, "Wind turbine presence is required"],
    enum: ["yes", "no"],
  },
  windTurbineDetailsKnown: {
    type: String,
    required: [
      function () {
        return this.windTurbinePresent === "yes";
      },
      "Wind turbine details known selection is required when wind turbine is present",
    ],
    enum: ["yes", "no"],
  },
  numberOfTurbines: {
    type: String,
    required: [
      function () {
        return this.windTurbineDetailsKnown === "yes";
      },
      "Number of turbines is required when details are known",
    ],
    validate: {
      validator: function (v) {
        return this.windTurbineDetailsKnown !== "yes" || (!isNaN(v) && Number(v) >= 0);
      },
      message: "Number of turbines must be a valid non-negative number",
    },
  },
  rotorDiameter: {
    type: String,
    required: [
      function () {
        return this.windTurbineDetailsKnown === "yes";
      },
      "Rotor diameter is required when details are known",
    ],
    validate: {
      validator: function (v) {
        return this.windTurbineDetailsKnown !== "yes" || (!isNaN(v) && Number(v) > 0);
      },
      message: "Rotor diameter must be a valid positive number",
    },
  },
  heightAboveRidge: {
    type: String,
    required: [
      function () {
        return this.windTurbineDetailsKnown === "yes";
      },
      "Height above ridge is required when details are known",
    ],
    validate: {
      validator: function (v) {
        return this.windTurbineDetailsKnown !== "yes" || !isNaN(v);
      },
      message: "Height above ridge must be a valid number",
    },
  },
  otherDetailsPhotos: { type: [String], required: false }, // Array of file paths
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamps
formNineteenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formNineteenSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormNineteen = mongoose.model("FormNineteen", formNineteenSchema);