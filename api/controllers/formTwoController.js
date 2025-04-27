

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Task } from "../model/task.js";
import { Process } from "../model/process.js";
import {FormTwo } from "../model/FormTwo.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createFormTwo = async (req, res) => {
  try {
    const {
      taskId,
      propertyTenure,
      transactionType,
      propertyType,
      numberOfStoreys,
      numberOfHabitableRooms,
      numberOfHeatedHabitableRooms,
      mainPropertyDateBand,
      mainPropertyRoomInRoofDateBand,
      elevationPhotoSelection, // Updated from elevationPhotos
    } = req.body;
    const surveyorId = req.user._id;

    // Validate task and user
    const task = await Task.findById(taskId);
    if (!task || task.assignedTo.toString() !== surveyorId.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized or task not found" });
    }

    // Check or create a Process
    let process = await Process.findOne({ taskId, surveyorId });
    if (!process) {
      process = new Process({
        taskId,
        surveyorId,
        formType: "formTwo",
        formData: new Map(),
        status: "in-progress",
      });
      await process.save();
      task.processId = process._id;
      task.status = "in_progress";
      await task.save();
    }

    // Handle file uploads for elevation and additional photos
    const elevationPhotos = req.files["elevationPhotos"]
      ? req.files["elevationPhotos"].map((file) =>
          path.join("uploads", `user-${surveyorId}`, "form-two", file.filename).replace(/\\/g, "/")
        )
      : [];
    const additionalPhotos = req.files["additionalPhotos"]
      ? req.files["additionalPhotos"].map((file) =>
          path.join("uploads", `user-${surveyorId}`, "form-two", file.filename).replace(/\\/g, "/")
        )
      : [];

    const formTwo = new FormTwo({
      processId: process._id,
      taskId,
      surveyorId,
      propertyTenure,
      transactionType,
      propertyType,
      numberOfStoreys,
      numberOfHabitableRooms,
      numberOfHeatedHabitableRooms,
      mainPropertyDateBand,
      mainPropertyRoomInRoofDateBand,
      elevationPhotoSelection, // Updated from elevationPhotos
      elevationPhotos,
      additionalPhotos,
    });
    await formTwo.save();

    return res.status(201).json({
      success: true,
      message: "Form Two created successfully",
      data: formTwo,
    });
  } catch (error) {
    console.error("Error creating FormTwo:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const getFormTwo = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const formTwo = await FormTwo.findOne({ processId });
    if (!formTwo) {
      return res.status(404).json({ success: false, error: "Form Two not found" });
    }

    return res.status(200).json({ success: true, data: formTwo });
  } catch (error) {
    console.error("Error fetching FormTwo:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const updateFormTwo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      propertyTenure,
      transactionType,
      propertyType,
      numberOfStoreys,
      numberOfHabitableRooms,
      numberOfHeatedHabitableRooms,
      mainPropertyDateBand,
      mainPropertyRoomInRoofDateBand,
      elevationPhotoSelection, // Updated from elevationPhotos
      deletedElevation,
      deletedAdditional,
    } = req.body;
    const surveyorId = req.user._id;

    const formTwo = await FormTwo.findById(id);
    if (!formTwo || formTwo.surveyorId.toString() !== surveyorId.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized or form not found" });
    }

    // Handle deleted elevation photos
    if (deletedElevation) {
      const deletedElevationArray = JSON.parse(deletedElevation);
      deletedElevationArray.forEach((url) => {
        const filePath = path.join(__dirname, "..", url.replace("http://localhost:3000/", ""));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      formTwo.elevationPhotos = formTwo.elevationPhotos.filter(
        (photo) => !deletedElevationArray.includes(`http://localhost:3000/${photo}`)
      );
    }

    // Handle deleted additional photos
    if (deletedAdditional) {
      const deletedAdditionalArray = JSON.parse(deletedAdditional);
      deletedAdditionalArray.forEach((url) => {
        const filePath = path.join(__dirname, "..", url.replace("http://localhost:3000/", ""));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      formTwo.additionalPhotos = formTwo.additionalPhotos.filter(
        (photo) => !deletedAdditionalArray.includes(`http://localhost:3000/${photo}`)
      );
    }

    // Append new elevation photos
    if (req.files["elevationPhotos"]) {
      const newElevationPhotos = req.files["elevationPhotos"].map((file) =>
        path.join("uploads", `user-${surveyorId}`, "form-two", file.filename).replace(/\\/g, "/")
      );
      formTwo.elevationPhotos = [...formTwo.elevationPhotos, ...newElevationPhotos];
    }

    // Append new additional photos
    if (req.files["additionalPhotos"]) {
      const newAdditionalPhotos = req.files["additionalPhotos"].map((file) =>
        path.join("uploads", `user-${surveyorId}`, "form-two", file.filename).replace(/\\/g, "/")
      );
      formTwo.additionalPhotos = [...formTwo.additionalPhotos, ...newAdditionalPhotos];
    }

    // Update form fields
    formTwo.propertyTenure = propertyTenure;
    formTwo.transactionType = transactionType;
    formTwo.propertyType = propertyType;
    formTwo.numberOfStoreys = numberOfStoreys;
    formTwo.numberOfHabitableRooms = numberOfHabitableRooms;
    formTwo.numberOfHeatedHabitableRooms = numberOfHeatedHabitableRooms;
    formTwo.mainPropertyDateBand = mainPropertyDateBand;
    formTwo.mainPropertyRoomInRoofDateBand = mainPropertyRoomInRoofDateBand;
    formTwo.elevationPhotoSelection = elevationPhotoSelection; // Updated from elevationPhotos

    await formTwo.save();

    return res.status(200).json({
      success: true,
      message: "Form Two updated successfully",
      data: formTwo,
    });
  } catch (error) {
    console.error("Error updating FormTwo:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};