import path from "path";
import fs from "fs";
import { FormSeventeen } from "../model/formSeventeen.js";

// Create a new Form Seventeen
export const createFormSeventeen = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormSeventeen document already exists for this processId
    const existingForm = await FormSeventeen.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Seventeen document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      fghrsPhotos: [],
    };

    // Handle file uploads for fghrsPhotos
    if (req.files && req.files.fghrsPhotos) {
      const files = Array.isArray(req.files.fghrsPhotos) ? req.files.fghrsPhotos : [req.files.fghrsPhotos];
      files.forEach((file) => {
        let filePath = path.join("uploads", `user-${formData.userId}`, "form-seventeen", file.filename);
        filePath = filePath.replace(/\\/g, "/");
        filePaths.fghrsPhotos.push(filePath);
      });
    }

    const newForm = new FormSeventeen({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Seventeen created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Seventeen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Seventeen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Seventeen data by processId
export const getFormSeventeenByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormSeventeen.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Seventeen data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Seventeen with photo uploads and deletions
export const updateFormSeventeen = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deleted images
    let deletedFghrsPhotos = [];
    if (req.body.deletedFghrsPhotos) {
      deletedFghrsPhotos =
        typeof req.body.deletedFghrsPhotos === "string"
          ? JSON.parse(req.body.deletedFghrsPhotos)
          : req.body.deletedFghrsPhotos;
    }

    // Convert absolute URLs to relative paths for comparison
    const relativeDeletedFghrsPhotos = deletedFghrsPhotos.map((img) =>
      img.replace("http://localhost:3000/", "")
    );

    // Fetch the existing document
    const existingForm = await FormSeventeen.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Seventeen not found" });
    }

    // Remove deleted images from existing array
    let updatedFghrsPhotos = existingForm.fghrsPhotos.filter(
      (photo) => !relativeDeletedFghrsPhotos.includes(photo)
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

    relativeDeletedFghrsPhotos.forEach(deleteImage);

    // Process new file uploads
    let newFghrsPhotos = [];
    if (req.files && req.files.fghrsPhotos) {
      const files = Array.isArray(req.files.fghrsPhotos) ? req.files.fghrsPhotos : [req.files.fghrsPhotos];
      newFghrsPhotos = files.map((file) => {
        let filePath = path.join("uploads", `user-${formData.userId}`, "form-seventeen", file.filename);
        return filePath.replace(/\\/g, "/");
      });
    }

    // Combine remaining images with new uploads
    updatedFghrsPhotos = [...updatedFghrsPhotos, ...newFghrsPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      fghrsPhotos: updatedFghrsPhotos,
    };

    // Update the document
    const updatedForm = await FormSeventeen.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Seventeen updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Seventeen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Seventeen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};