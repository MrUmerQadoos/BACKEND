import { FormEleven } from "../model/formEleven.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Eleven
export const createFormEleven = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormEleven document already exists for this processId
    const existingForm = await FormEleven.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Eleven document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      structurePhotos: [],
      insulationPhotos: [],
    };

    // Handle file uploads for structurePhotos
    if (req.files && req.files.structurePhotos) {
      const structurePhotos = Array.isArray(req.files.structurePhotos)
        ? req.files.structurePhotos
        : [req.files.structurePhotos];
      for (const file of structurePhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-eleven` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.structurePhotos.push(result.secure_url);
      }
    }

    // Handle file uploads for insulationPhotos
    if (req.files && req.files.insulationPhotos) {
      const insulationPhotos = Array.isArray(req.files.insulationPhotos)
        ? req.files.insulationPhotos
        : [req.files.insulationPhotos];
      for (const file of insulationPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-eleven` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.insulationPhotos.push(result.secure_url);
      }
    }

    const newForm = new FormEleven({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Eleven created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Eleven:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Eleven document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Eleven data by processId
export const getFormElevenByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormEleven.find({ processId });
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error("Error fetching Form Eleven data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Eleven with photo uploads and deletions
export const updateFormEleven = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deleted images for structurePhotos
    let deletedStructurePhotos = [];
    if (req.body.deletedStructurePhotos) {
      deletedStructurePhotos =
        typeof req.body.deletedStructurePhotos === "string"
          ? JSON.parse(req.body.deletedStructurePhotos)
          : req.body.deletedStructurePhotos;
    }

    // Parse deleted images for insulationPhotos
    let deletedInsulationPhotos = [];
    if (req.body.deletedInsulationPhotos) {
      deletedInsulationPhotos =
        typeof req.body.deletedInsulationPhotos === "string"
          ? JSON.parse(req.body.deletedInsulationPhotos)
          : req.body.deletedInsulationPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormEleven.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Eleven not found" });
    }

    // Remove deleted images from existing arrays
    let updatedStructurePhotos = existingForm.structurePhotos.filter(
      (photo) => !deletedStructurePhotos.includes(photo)
    );
    let updatedInsulationPhotos = existingForm.insulationPhotos.filter(
      (photo) => !deletedInsulationPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-eleven`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedStructurePhotos.map(deleteImage));
    await Promise.all(deletedInsulationPhotos.map(deleteImage));

    // Process new file uploads for structurePhotos
    let newStructurePhotos = [];
    if (req.files && req.files.structurePhotos) {
      const structurePhotos = Array.isArray(req.files.structurePhotos)
        ? req.files.structurePhotos
        : [req.files.structurePhotos];
      for (const file of structurePhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-eleven` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newStructurePhotos.push(result.secure_url);
      }
    }

    // Process new file uploads for insulationPhotos
    let newInsulationPhotos = [];
    if (req.files && req.files.insulationPhotos) {
      const insulationPhotos = Array.isArray(req.files.insulationPhotos)
        ? req.files.insulationPhotos
        : [req.files.insulationPhotos];
      for (const file of insulationPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-eleven` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newInsulationPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedStructurePhotos = [...updatedStructurePhotos, ...newStructurePhotos];
    updatedInsulationPhotos = [...updatedInsulationPhotos, ...newInsulationPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      structurePhotos: updatedStructurePhotos,
      insulationPhotos: updatedInsulationPhotos,
    };

    // Update the document
    const updatedForm = await FormEleven.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Eleven updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Eleven:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Eleven document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};