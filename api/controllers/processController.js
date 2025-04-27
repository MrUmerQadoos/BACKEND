import { Process } from "../model/Process.js";
import { Task } from "../model/task.js";

export const createProcess = async (req, res) => {
  try {
    const { taskId, formType, formData } = req.body;
    const surveyorId = req.user._id; // From verifyToken

    const task = await Task.findById(taskId);
    if (!task || task.assignedTo.toString() !== surveyorId.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized or task not found" });
    }

    const newProcess = new Process({
      taskId,
      surveyorId,
      formType,
      formData,
    });
    await newProcess.save();

    // Update task with processId
    task.processId = newProcess._id;
    task.status = "in_progress";
    await task.save();

    return res.status(201).json({
      success: true,
      message: "Process created successfully",
      data: newProcess,
    });
  } catch (error) {
    console.error("Error creating process:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getProcessesByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    const role = req.user.role;

    let processes;
    if (role === "admin" || role === "manager" || role === "viewer") {
      processes = await Process.find().populate("taskId surveyorId", "title name email");
    } else if (role === "surveyor") {
      processes = await Process.find({ surveyorId: userId }).populate("taskId", "title");
    } else {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    return res.status(200).json({ success: true, data: processes });
  } catch (error) {
    console.error("Error fetching processes:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};