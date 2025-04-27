import { FormTwelve } from "../model/formTwelve.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Twelve
export const createFormTwelve = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormTwelve document already exists for this processId
    const existingForm = await FormTwelve.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Twelve document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      ventilationCoolingPhotos: [],
    };

    // Handle file uploads for ventilationCoolingPhotos
    if (req.files && req.files.ventilationCoolingPhotos) {
      const ventilationCoolingPhotos = Array.isArray(req.files.ventilationCoolingPhotos)
        ? req.files.ventilationCoolingPhotos
        : [req.files.ventilationCoolingPhotos];
      for (const file of ventilationCoolingPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-twelve` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.ventilationCoolingPhotos.push(result.secure_url);
      }
    }

    const newForm = new FormTwelve({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Twelve created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Twelve:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twelve document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Twelve data by processId
export const getFormTwelveByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormTwelve.find({ processId });
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error("Error fetching Form Twelve data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Twelve with photo uploads and deletions
export const updateFormTwelve = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deleted images for ventilationCoolingPhotos
    let deletedVentilationCoolingPhotos = [];
    if (req.body.deletedVentilationCoolingPhotos) {
      deletedVentilationCoolingPhotos =
        typeof req.body.deletedVentilationCoolingPhotos === "string"
          ? JSON.parse(req.body.deletedVentilationCoolingPhotos)
          : req.body.deletedVentilationCoolingPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormTwelve.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Twelve not found" });
    }

    // Remove deleted images from existing array
    let updatedVentilationCoolingPhotos = existingForm.ventilationCoolingPhotos.filter(
      (photo) => !deletedVentilationCoolingPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-twelve`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedVentilationCoolingPhotos.map(deleteImage));

    // Process new file uploads for ventilationCoolingPhotos
    let newVentilationCoolingPhotos = [];
    if (req.files && req.files.ventilationCoolingPhotos) {
      const ventilationCoolingPhotos = Array.isArray(req.files.ventilationCoolingPhotos)
        ? req.files.ventilationCoolingPhotos
        : [req.files.ventilationCoolingPhotos];
      for (const file of ventilationCoolingPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-twelve` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newVentilationCoolingPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedVentilationCoolingPhotos = [...updatedVentilationCoolingPhotos, ...newVentilationCoolingPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      ventilationCoolingPhotos: updatedVentilationCoolingPhotos,
    };

    // Update the document
    const updatedForm = await FormTwelve.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Twelve updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Twelve:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twelve document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};