import mongoose from "mongoose";

const floorSchema = new mongoose.Schema({
  floorArea: {
    type: String,
    required: [true, "Floor Area is required"],
  },
  roomHeight: {
    type: String,
    required: [true, "Room Height is required"],
  },
  heatLossPerimeter: {
    type: String,
    required: [true, "Heat Loss Perimeter is required"],
  },
  partyWallLength: {
    type: String,
    required: [true, "Party Wall Length is required"],
  },
});

const formTwentyThreeSchema = new mongoose.Schema({
  extensionDimensions: {
    type: String,
    required: [true, "Extension Dimensions is required"],
    enum: ["Internal", "External"],
  },
  fifthFloor: {
    type: floorSchema,
    required: [true, "Fifth Floor data is required"],
  },
  fourthFloor: {
    type: floorSchema,
    required: [true, "Fourth Floor data is required"],
  },
  thirdFloor: {
    type: floorSchema,
    required: [true, "Third Floor data is required"],
  },
  secondFloor: {
    type: floorSchema,
    required: [true, "Second Floor data is required"],
  },
  lowestFloor: {
    type: floorSchema,
    required: [true, "Lowest Floor data is required"],
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

formTwentyThreeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formTwentyThreeSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormTwentyThree = mongoose.model("FormTwentyThree", formTwentyThreeSchema);