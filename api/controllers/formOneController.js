
import { FormOne } from "../model/FormOne.js";
import { Process } from "../model/Process.js";
import { Task } from "../model/task.js";

export const createFormOne = async (req, res) => {
  try {
    const { taskId, propertyAddress, postcode, inspectionDate, surveyorName, surveyorID, epcRRN } = req.body;
    const surveyorId = req.user._id;

    // Validate task and surveyor
    const task = await Task.findById(taskId);
    if (!task || task.assignedTo.toString() !== surveyorId.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized or task not found" });
    }

    // Create or update Process
    let process = await Process.findOne({ taskId, surveyorId });
    if (!process) {
      process = new Process({
        taskId,
        surveyorId,
        formType: "formOne",
        formData: new Map(), // Initially empty, updated later if needed
        status: "in-progress",
      });
      await process.save();
      task.processId = process._id;
      task.status = "in_progress";
      await task.save();
    }

    // Create FormOne
    const formOne = new FormOne({
      processId: process._id,
      taskId,
      surveyorId,
      propertyAddress,
      postcode,
      inspectionDate,
      surveyorName,
      surveyorID,
      epcRRN,
    });
    await formOne.save();

    return res.status(201).json({
      success: true,
      message: "Form One created successfully",
      data: formOne,
    });
  } catch (error) {
    console.error("Error creating FormOne:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const getFormOne = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const formOne = await FormOne.findOne({ processId })
      .populate("taskId", "title")
      .populate("surveyorId", "name email");
    if (!formOne) {
      return res.status(404).json({ success: false, message: "Form One not found" });
    }

    return res.status(200).json({
      success: true,
      data: formOne,
    });
  } catch (error) {
    console.error("Error fetching FormOne:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const updateFormOne = async (req, res) => {
  try {
    const { formId } = req.params;
    const { propertyAddress, postcode, inspectionDate, surveyorName, surveyorID, epcRRN } = req.body;
    const surveyorId = req.user._id;

    const formOne = await FormOne.findById(formId);
    if (!formOne) {
      return res.status(404).json({ success: false, message: "Form One not found" });
    }
    if (formOne.surveyorId.toString() !== surveyorId.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized - Not your form" });
    }

    formOne.propertyAddress = propertyAddress || formOne.propertyAddress;
    formOne.postcode = postcode || formOne.postcode;
    formOne.inspectionDate = inspectionDate || formOne.inspectionDate;
    formOne.surveyorName = surveyorName || formOne.surveyorName;
    formOne.surveyorID = surveyorID || formOne.surveyorID;
    formOne.epcRRN = epcRRN || formOne.epcRRN;
    await formOne.save();

    return res.status(200).json({
      success: true,
      message: "Form One updated successfully",
      data: formOne,
    });
  } catch (error) {
    console.error("Error updating FormOne:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
}; 