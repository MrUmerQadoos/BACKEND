import mongoose from "mongoose";

const formThreeSchema = new mongoose.Schema({
  // Dropdown
  mainPropertyDimensions: { type: String, required: false }, // "Internal" or "External"

  // Room/s in Roof
  roofFloorArea: { type: String, required: false },
  roofRoomHeight: { type: String, required: false },
  roofHeatLossPerimeter: { type: String, required: false },
  roofPartyWallLength: { type: String, required: false },

  // 5th Floor
  fifthFloorArea: { type: String, required: false },
  fifthFloorHeight: { type: String, required: false },
  fifthHeatLossPerimeter: { type: String, required: false },
  fifthPartyWallLength: { type: String, required: false },

  // 4th Floor
  fourthFloorArea: { type: String, required: false },
  fourthFloorHeight: { type: String, required: false },
  fourthHeatLossPerimeter: { type: String, required: false },
  fourthPartyWallLength: { type: String, required: false },

  // 3rd Floor
  thirdFloorArea: { type: String, required: false },
  thirdFloorHeight: { type: String, required: false },
  thirdHeatLossPerimeter: { type: String, required: false },
  thirdPartyWallLength: { type: String, required: false },

  // 2nd Floor
  secondFloorArea: { type: String, required: false },
  secondFloorHeight: { type: String, required: false },
  secondHeatLossPerimeter: { type: String, required: false },
  secondPartyWallLength: { type: String, required: false },

  // 1st Floor
  firstFloorArea: { type: String, required: false },
  firstFloorHeight: { type: String, required: false },
  firstHeatLossPerimeter: { type: String, required: false },
  firstPartyWallLength: { type: String, required: false },

  // Lowest Floor
  lowestFloorArea: { type: String, required: false },
  lowestFloorHeight: { type: String, required: false },
  lowestHeatLossPerimeter: { type: String, required: false },
  lowestPartyWallLength: { type: String, required: false },

  userId: { type: String, required: false },
  processId: { type: String, required: false, unique: true }, // Ensure one FormThree per processId

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the `updatedAt` timestamp on every update
formThreeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

formThreeSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export const FormThree = mongoose.model("FormThree", formThreeSchema);