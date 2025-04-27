import mongoose from "mongoose";

const formTwentySchema = new mongoose.Schema({
  electricityMeterType: {
    type: String,
    required: [true, "Electricity meter type is required"],
    enum: ["Single", "Dual", "18 Hour", "24 Hour", "Unknown"],
  },
  mainsGas: {
    type: String,
    required: [true, "Mains gas selection is required"],
    enum: [
      "Mains gas supply available",
      "Confirm you have checked for the existence of an EPC before carrying out another energy assessment",
    ],
  },
  epcExists: {
    type: String,
    required: [true, "EPC existence selection is required"],
    enum: ["yes", "no"],
  },
  relatedPartyDisclosure: {
    type: String,
    required: [true, "Related party disclosure is required"],
    enum: [
      "No related party",
      "Relative of homeowner or occupier of the property",
      "Residing at the property",
      "Financial interest in the property",
      "Owner or director of the organisation dealing with the property transaction",
      "Employed by the professional dealing with the property transaction",
    ],
  },
  addenda: {
    type: String,
    required: [true, "Addenda selection is required"],
    enum: [
      "Wall type does not correspond to options available in RdSAP",
      "Dwelling has a swimming pool",
      "Dwelling has micro-CHP not found in database",
      "Storage heater or dual immersion, and single electric meter",
      "PVs or wind turbine present on the property (England, Wales or Scotland)",
      "Two main heating systems and heating system upgrade is recommended",
      "Dual electricity meter selected but there is also an electricity meter for an off-peak tarif",
      "Single electricity meter but there is also an electricity meter for an off-peak tarif",
      "Dwelling is using a biomass fuel that is not in the RdSAP fuel options",
      "Dwelling has a special energy saving feature",
    ],
  },
  doubleGlazingAppropriate: {
    type: String,
    required: [true, "Double glazing selection is required"],
    enum: ["yes", "no"],
  },
  wallInsulationIssues: {
    type: String,
    required: [true, "Wall insulation issues selection is required"],
    enum: [
      "Has the property any ‘Access Issues’ for potential wall insulation?",
      "Has the property any ‘narrow cavity(s)’ (<50mm)?",
    ],
  },
  photoChecklist: {
    type: String,
    required: [true, "Photo checklist selection is required"],
    enum: [
      "External elevations - showing openings, extensions, conservatories, roof rooms, wall construction etc.",
      "Insulation levels - level and coverage of loft insulation, wall insulation etc.",
      "Heating systems - radiators, boiler showing key features, heating controls, water heating etc.",
      "Other features - PV, solar water heating, wind turbine, LPG cylinder etc.",
    ],
  },
  siteInspectionNotes: { type: String },
  checklistPhotos: { type: [String] },
  userId: { type: String, required: [true, "User ID is required"] },
  processId: { type: String, required: [true, "Process ID is required"], unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

formTwentySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formTwentySchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormTwenty = mongoose.model("FormTwenty", formTwentySchema);