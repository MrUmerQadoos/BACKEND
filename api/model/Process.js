import mongoose from "mongoose";

const processSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: [true, "Task ID is required"],
  },
  surveyorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Surveyor ID is required"],
  },
  formType: {
    type: String,
    enum: [
      "formOne",
      "formTwo",
      "formThree",
      "formFour",
      "formFive",
      "formSix",
      "formSeven",
      "formEight",
      "formNine",
      "formTen",
      "formEleven",
      "formTwelve",
      "formThirteen",
      "formFourteen",
      "formFifteen",
      "formSixteen",
      "formSeventeen",
      "formEighteen",
      "formNineteen",
      "formTwenty",
      "formTwentyOne",
      "formTwentyTwo",
      "formTwentyThree",
      "formTwentyFour",
      "formTwentyFive",
      "formTwentySix",
      ""
    ],
    required: [true, "Form type is required"],
  },
  formData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Changed to Mixed to support nested objects/arrays
    required: [true, "Form data is required"],
  },
  status: {
    type: String,
    enum: ["in-progress", "completed"],
    default: "in-progress",
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

// Update timestamps for updates
processSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Check if the model is already compiled to avoid OverwriteModelError
const Process = mongoose.models.Process || mongoose.model("Process", processSchema);

export { Process };













// import mongoose from "mongoose";

// const processSchema = new mongoose.Schema({
//   taskId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Task",
//     required: true,
//   },
//   surveyorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   formType: {
//   type: String,
//   enum: [
//     "formOne",
//     "formTwo",
//     "formThree",
//     "formFour",
//     "formFive",
//     "formSix",
//     "formSeven",
//     "formEight",
//     "formNine",
//     "formTen",
//     "formEleven",
//     "formTwelve",
//     "formThirteen",
//     "formFourteen",
//     "formFifteen",
  
//   ],
//   required: true,
// },
//   formData: {
//     type: Map,
//     of: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     enum: ["in-progress", "completed"],
//     default: "in-progress",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Check if the model is already compiled to avoid OverwriteModelError
// const Process = mongoose.models.Process || mongoose.model("Process", processSchema);

// export { Process };