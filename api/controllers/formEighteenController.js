import path from "path";
import fs from "fs";
import { FormEighteen } from "../model/formEighteen.js";

// Create a new Form Eighteen
export const createFormEighteen = async (req, res) => {
  try {
    const { processId, userId } = req.body;

    // Check if a Form Eighteen document already exists for this processId
    const existingForm = await FormEighteen.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Eighteen document already exists for this process.",
      });
    }

    // Parse pvPanels if sent as a string
    let formData = req.body;
    if (formData.pvPanels && typeof formData.pvPanels === "string") {
      formData.pvPanels = JSON.parse(formData.pvPanels);
    }

    const filePaths = {
      newTechPhotos: [],
    };

    // Handle file uploads for newTechPhotos
    if (req.files && req.files.newTechPhotos) {
      const files = Array.isArray(req.files.newTechPhotos)
        ? req.files.newTechPhotos
        : [req.files.newTechPhotos];
      files.forEach((file) => {
        let filePath = path.join("uploads", `user-${userId}`, "form-eighteen", file.filename);
        filePath = filePath.replace(/\\/g, "/");
        filePaths.newTechPhotos.push(filePath);
      });
    }

    const newForm = new FormEighteen({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Eighteen created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Eighteen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Eighteen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Eighteen data by processId
export const getFormEighteenByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormEighteen.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Eighteen data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Eighteen with photo uploads and deletions
export const updateFormEighteen = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Parse deleted images
    let deletedNewTechPhotos = [];
    if (req.body.deletedNewTechPhotos) {
      deletedNewTechPhotos =
        typeof req.body.deletedNewTechPhotos === "string"
          ? JSON.parse(req.body.deletedNewTechPhotos)
          : req.body.deletedNewTechPhotos;
    }

    // Convert absolute URLs to relative paths
    const relativeDeletedPhotos = deletedNewTechPhotos.map((img) =>
      img.replace("http://localhost:3000/", "")
    );

    // Fetch the existing document
    const existingForm = await FormEighteen.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Eighteen not found" });
    }

    // Remove deleted images from existing array
    let updatedNewTechPhotos = existingForm.newTechPhotos.filter(
      (photo) => !relativeDeletedPhotos.includes(photo)
    );

    // Delete physical files from the server
    const deleteImage = (relativeImg) => {
      if (relativeImg && relativeImg.trim()) {
        const filePath = path.join(process.cwd(), relativeImg);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } else {
          console.log(`File not found for deletion: ${filePath}`);
        }
      }
    };

    relativeDeletedPhotos.forEach(deleteImage);

    // Process new file uploads
    let newTechPhotos = [];
    if (req.files && req.files.newTechPhotos) {
      const files = Array.isArray(req.files.newTechPhotos)
        ? req.files.newTechPhotos
        : [req.files.newTechPhotos];
      newTechPhotos = files.map((file) => {
        let filePath = path.join("uploads", `user-${userId}`, "form-eighteen", file.filename);
        return filePath.replace(/\\/g, "/");
      });
    }

    // Combine remaining images with new uploads
    updatedNewTechPhotos = [...updatedNewTechPhotos, ...newTechPhotos];

    // Parse pvPanels if sent as a string
    let formData = req.body;
    if (formData.pvPanels && typeof formData.pvPanels === "string") {
      formData.pvPanels = JSON.parse(formData.pvPanels);
    }

    // Prepare the update object
    const updateData = {
      ...formData,
      newTechPhotos: updatedNewTechPhotos,
    };

    // Update the document
    const updatedForm = await FormEighteen.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Eighteen updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Eighteen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Eighteen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};