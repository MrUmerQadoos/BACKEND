import mongoose from "mongoose";

const heatingSchema = new mongoose.Schema({
  type: { type: String, required: [true, "Heating type is required"] },
  makeAndModel: { type: String, required: false },
  pcdfBoilerReference: { type: String, required: false },
  heatingCode: { type: String, required: false },
  heatingPumpAge: {
    type: String,
    enum: ["2012 or earlier", "2013 or later", "Unknown", ""],
    default: "",
  },
  heatEmitter: {
    type: String,
    enum: ["Underfloor Heating", "Radiators", ""],
    default: "",
  },
  designFlowTemperature: {
    type: String,
    enum: ["Unknown", "Normal (>45°C)", "35°C-45°C", "<=35°C", ""],
    default: "",
  },
  flueType: {
    type: String,
    enum: ["Balanced", "Open", ""],
    default: "",
  },
  fanAssistedFlue: {
    type: String,
    enum: ["No", "Yes", ""],
    default: "",
  },
  pcdfHeatingControls: { type: String, required: false },
  compensatorFromPcdf: { type: String, required: false },
  percentageOfHeat: {
    type: String, // Stored as string to match frontend input
    required: false,
    validate: {
      validator: function (v) {
        if (!v) return true; // Allow empty
        const num = parseFloat(v);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      message: "Percentage of heat must be between 0 and 100",
    },
  },
  mainHeating1Controls: { type: String, required: false }, // Only for mainHeating1
  mainHeating2Controls: { type: String, required: false }, // Only for mainHeating2
});

const formThirteenSchema = new mongoose.Schema({
  mainHeating1: {
    type: heatingSchema,
    required: [true, "Main Heating 1 details are required"],
  },
  mainHeating2: {
    type: heatingSchema,
    required: false, // Optional, as Main Heating 2 is not mandatory
    default: {},
  },
  secondaryHeating: { type: String, required: false },
  mainHeating1Photos: { type: [String], required: false }, // Array of file paths
  mainHeating2Photos: { type: [String], required: false }, // Array of file paths
  secondaryHeatingPhotos: { type: [String], required: false }, // Array of file paths
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Custom validation for total percentage of heat
formThirteenSchema.pre("save", function (next) {
  const totalPercentage =
    (parseFloat(this.mainHeating1.percentageOfHeat) || 0) +
    (parseFloat(this.mainHeating2.percentageOfHeat) || 0);
  if (totalPercentage > 100) {
    return next(new Error("Total percentage of heat from Main Heating 1 and 2 cannot exceed 100%"));
  }
  this.updatedAt = Date.now();
  next();
});

formThirteenSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const totalPercentage =
    (parseFloat(update.mainHeating1?.percentageOfHeat) || 0) +
    (parseFloat(update.mainHeating2?.percentageOfHeat) || 0);
  if (totalPercentage > 100) {
    return next(new Error("Total percentage of heat from Main Heating 1 and 2 cannot exceed 100%"));
  }
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormThirteen = mongoose.model("FormThirteen", formThirteenSchema);