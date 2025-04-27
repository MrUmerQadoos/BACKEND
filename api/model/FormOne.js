import mongoose from "mongoose";

const formOneSchema = new mongoose.Schema(
  {
    processId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Process",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    surveyorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyAddress: {
      type: String,
      required: true,
    },
    postcode: {
      type: String,
      required: true,
    },
    inspectionDate: {
      type: Date,
      required: true,
    },
    surveyorName: {
      type: String,
      required: true,
    },
    surveyorID: {
      type: String,
      required: true,
    },
    epcRRN: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { updatedAt: "updatedAt" },
  }
);

formOneSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.inspectionDate) {
      ret.inspectionDate = ret.inspectionDate.toISOString().split("T")[0];
    }
    return ret;
  },
});

// Check if the model is already compiled
const FormOne = mongoose.models.FormOne || mongoose.model("FormOne", formOneSchema);

export { FormOne };