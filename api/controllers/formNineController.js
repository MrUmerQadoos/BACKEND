import { FormNine } from "../model/formNine.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Nine
export const createFormNine = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormNine document already exists for this processId
    const existingForm = await FormNine.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Nine document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      mainRoomPhotos: [],
    };

    // Handle file uploads for mainRoomPhotos
    if (req.files && req.files.mainRoomPhotos) {
      const mainRoomPhotos = Array.isArray(req.files.mainRoomPhotos)
        ? req.files.mainRoomPhotos
        : [req.files.mainRoomPhotos];
      for (const file of mainRoomPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-nine` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.mainRoomPhotos.push(result.secure_url);
      }
    }

    const newForm = new FormNine({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Nine created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Nine:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Nine document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Nine data by processId
export const getFormNineByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormNine.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Nine data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Nine with photo uploads and deletions
export const updateFormNine = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deleted images
    let deletedMainRoomPhotos = [];
    if (req.body.deletedMainRoomPhotos) {
      deletedMainRoomPhotos =
        typeof req.body.deletedMainRoomPhotos === "string"
          ? JSON.parse(req.body.deletedMainRoomPhotos)
          : req.body.deletedMainRoomPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormNine.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Nine not found" });
    }

    // Remove deleted images from existing array
    let updatedMainRoomPhotos = existingForm.mainRoomPhotos.filter(
      (photo) => !deletedMainRoomPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-nine`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedMainRoomPhotos.map(deleteImage));

    // Process new file uploads
    let newMainRoomPhotos = [];
    if (req.files && req.files.mainRoomPhotos) {
      const mainRoomPhotos = Array.isArray(req.files.mainRoomPhotos)
        ? req.files.mainRoomPhotos
        : [req.files.mainRoomPhotos];
      for (const file of mainRoomPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-nine` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newMainRoomPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedMainRoomPhotos = [...updatedMainRoomPhotos, ...newMainRoomPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      mainRoomPhotos: updatedMainRoomPhotos,
    };

    // Update the document
    const updatedForm = await FormNine.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Nine updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Nine:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Nine document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};