import path from "path";
import fs from "fs";
import { FormSeven } from "../model/formSeven.js";

// Create a new Form Seven
export const createFormSeven = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormSeven document already exists for this processId
    const existingForm = await FormSeven.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Seven document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      wallInsulationPhotos: [],
      alternativeWallsPhotos: [],
      wallThicknessPhotos: [],
    };

    // Handle file uploads for each group
    if (req.files) {
      for (let field in req.files) {
        req.files[field].forEach((file) => {
          let filePath = path.join("uploads", `user-${formData.userId}`, "form-seven", file.filename);
          filePath = filePath.replace(/\\/g, "/");
          if (field === "wallInsulationPhotos") {
            filePaths.wallInsulationPhotos.push(filePath);
          } else if (field === "alternativeWallsPhotos") {
            filePaths.alternativeWallsPhotos.push(filePath);
          } else if (field === "wallThicknessPhotos") {
            filePaths.wallThicknessPhotos.push(filePath);
          }
        });
      }
    }

    const newForm = new FormSeven({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Seven created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Seven:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Seven document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Seven data by processId
export const getFormSevenByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormSeven.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Seven data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Seven with photo uploads and deletions
export const updateFormSeven = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deleted images for each group
    let deletedWallInsulation = [];
    let deletedAlternativeWalls = [];
    let deletedWallThickness = [];

    if (req.body.deletedWallInsulation) {
      deletedWallInsulation =
        typeof req.body.deletedWallInsulation === "string"
          ? JSON.parse(req.body.deletedWallInsulation)
          : req.body.deletedWallInsulation;
    }
    if (req.body.deletedAlternativeWalls) {
      deletedAlternativeWalls =
        typeof req.body.deletedAlternativeWalls === "string"
          ? JSON.parse(req.body.deletedAlternativeWalls)
          : req.body.deletedAlternativeWalls;
    }
    if (req.body.deletedWallThickness) {
      deletedWallThickness =
        typeof req.body.deletedWallThickness === "string"
          ? JSON.parse(req.body.deletedWallThickness)
          : req.body.deletedWallThickness;
    }

    // Convert absolute URLs to relative paths for comparison
    const relativeDeletedWallInsulation = deletedWallInsulation.map((img) =>
      img.replace("http://localhost:3000/", "")
    );
    const relativeDeletedAlternativeWalls = deletedAlternativeWalls.map((img) =>
      img.replace("http://localhost:3000/", "")
    );
    const relativeDeletedWallThickness = deletedWallThickness.map((img) =>
      img.replace("http://localhost:3000/", "")
    );

    // Fetch the existing document
    const existingForm = await FormSeven.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Seven not found" });
    }

    // Remove deleted images from existing arrays
    let updatedWallInsulationPhotos = existingForm.wallInsulationPhotos.filter(
      (photo) => !relativeDeletedWallInsulation.includes(photo)
    );
    let updatedAlternativeWallsPhotos = existingForm.alternativeWallsPhotos.filter(
      (photo) => !relativeDeletedAlternativeWalls.includes(photo)
    );
    let updatedWallThicknessPhotos = existingForm.wallThicknessPhotos.filter(
      (photo) => !relativeDeletedWallThickness.includes(photo)
    );

    // Delete physical files from the server
    const deleteImage = (relativeImg) => {
      if (relativeImg && relativeImg.trim()) {
        const filePath = path.join(process.cwd(), relativeImg);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } else {
          console.log(`File not found: ${filePath}`);
        }
      }
    };

    relativeDeletedWallInsulation.forEach(deleteImage);
    relativeDeletedAlternativeWalls.forEach(deleteImage);
    relativeDeletedWallThickness.forEach(deleteImage);

    // Process new file uploads
    let newWallInsulationPhotos = [];
    let newAlternativeWallsPhotos = [];
    let newWallThicknessPhotos = [];

    if (req.files) {
      if (req.files.wallInsulationPhotos) {
        newWallInsulationPhotos = req.files.wallInsulationPhotos.map((file) => {
          let filePath = path.join("uploads", `user-${formData.userId}`, "form-seven", file.filename);
          return filePath.replace(/\\/g, "/");
        });
      }
      if (req.files.alternativeWallsPhotos) {
        newAlternativeWallsPhotos = req.files.alternativeWallsPhotos.map((file) => {
          let filePath = path.join("uploads", `user-${formData.userId}`, "form-seven", file.filename);
          return filePath.replace(/\\/g, "/");
        });
      }
      if (req.files.wallThicknessPhotos) {
        newWallThicknessPhotos = req.files.wallThicknessPhotos.map((file) => {
          let filePath = path.join("uploads", `user-${formData.userId}`, "form-seven", file.filename);
          return filePath.replace(/\\/g, "/");
        });
      }
    }

    // Combine remaining images with new uploads
    updatedWallInsulationPhotos = [...updatedWallInsulationPhotos, ...newWallInsulationPhotos];
    updatedAlternativeWallsPhotos = [...updatedAlternativeWallsPhotos, ...newAlternativeWallsPhotos];
    updatedWallThicknessPhotos = [...updatedWallThicknessPhotos, ...newWallThicknessPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      wallInsulationPhotos: updatedWallInsulationPhotos,
      alternativeWallsPhotos: updatedAlternativeWallsPhotos,
      wallThicknessPhotos: updatedWallThicknessPhotos,
    };

    // Update the document
    const updatedForm = await FormSeven.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Seven updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Seven:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Seven document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};