import { FormTen } from "../model/formTen.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Ten
export const createFormTen = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormTen document already exists for this processId
    const existingForm = await FormTen.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Ten document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      floorPhotos: [],
    };

    // Handle file uploads for floorPhotos
    if (req.files && req.files.floorPhotos) {
      const floorPhotos = Array.isArray(req.files.floorPhotos) ? req.files.floorPhotos : [req.files.floorPhotos];
      for (const file of floorPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-ten` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.floorPhotos.push(result.secure_url);
      }
    }

    const newForm = new FormTen({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Ten created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Ten:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Ten document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Ten data by processId
export const getFormTenByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormTen.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Ten data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Ten with photo uploads and deletions
export const updateFormTen = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deleted images
    let deletedFloorPhotos = [];
    if (req.body.deletedFloorPhotos) {
      deletedFloorPhotos =
        typeof req.body.deletedFloorPhotos === "string"
          ? JSON.parse(req.body.deletedFloorPhotos)
          : req.body.deletedFloorPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormTen.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Ten not found" });
    }

    // Remove deleted images from existing array
    let updatedFloorPhotos = existingForm.floorPhotos.filter(
      (photo) => !deletedFloorPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-ten`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedFloorPhotos.map(deleteImage));

    // Process new file uploads
    let newFloorPhotos = [];
    if (req.files && req.files.floorPhotos) {
      const floorPhotos = Array.isArray(req.files.floorPhotos) ? req.files.floorPhotos : [req.files.floorPhotos];
      for (const file of floorPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-ten` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newFloorPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedFloorPhotos = [...updatedFloorPhotos, ...newFloorPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      floorPhotos: updatedFloorPhotos,
    };

    // Update the document
    const updatedForm = await FormTen.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Ten updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Ten:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Ten document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};