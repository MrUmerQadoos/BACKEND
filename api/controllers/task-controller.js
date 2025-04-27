import { Task } from "../model/task.js";
import { User } from "../model/user.js";

export const createTask = async (req, res) => {
  const { title, description, assignedTo } = req.body;
  const creatorRole = req.user.role;

  try {
    if (creatorRole !== "admin" && creatorRole !== "manager") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ message: "Assigned user not found" });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      createdBy: req.user._id, // Changed to req.user._id from verifyToken
    });

    await task.save();
    res.status(201).json({ success: true, message: "Task created", task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let tasks;
    if (userRole === "surveyor") {
      tasks = await Task.find({ assignedTo: userId })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");
    } else {
      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");
    }

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { taskId, status } = req.body;
  const userRole = req.user.role;
  const userId = req.user._id;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (userRole === "surveyor" && task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (userRole !== "surveyor" && userRole !== "admin" && userRole !== "manager") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    task.status = status;
    await task.save();
    res.status(200).json({ success: true, message: "Task updated", task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};