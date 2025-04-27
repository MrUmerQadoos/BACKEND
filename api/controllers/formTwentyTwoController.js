import { FormTwentyTwo } from "../model/formTwentyTwo.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Twenty-Two
export const createFormTwentyTwo = async (req, res) => {
  try {
    const { processId, userId } = req.body;

    // Check if a FormTwentyTwo document already exists for this processId
    const existingForm = await FormTwentyTwo.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Two document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      extensionRoomPhotos: [],
    };

    // Handle file uploads for extensionRoomPhotos
    if (req.files && req.files.extensionRoomPhotos) {
      const extensionRoomPhotos = Array.isArray(req.files.extensionRoomPhotos)
        ? req.files.extensionRoomPhotos
        : [req.files.extensionRoomPhotos];
      for (const file of extensionRoomPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${userId}/form-twenty-two` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.extensionRoomPhotos.push(result.secure_url);
      }
    }

    const newForm = new FormTwentyTwo({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Twenty-Two created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Twenty-Two:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Two document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Twenty-Two data by processId
export const getFormTwentyTwoByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormTwentyTwo.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Twenty-Two data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Twenty-Two with photo uploads and deletions
export const updateFormTwentyTwo = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Parse deleted images
    let deletedExtensionRoomPhotos = [];
    if (req.body.deletedExtensionRoomPhotos) {
      deletedExtensionRoomPhotos =
        typeof req.body.deletedExtensionRoomPhotos === "string"
          ? JSON.parse(req.body.deletedExtensionRoomPhotos)
          : req.body.deletedExtensionRoomPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormTwentyTwo.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Twenty-Two not found" });
    }

    // Remove deleted images from existing array
    let updatedExtensionRoomPhotos = existingForm.extensionRoomPhotos.filter(
      (photo) => !deletedExtensionRoomPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${userId}/form-twenty-two`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedExtensionRoomPhotos.map(deleteImage));

    // Process new file uploads
    let newExtensionRoomPhotos = [];
    if (req.files && req.files.extensionRoomPhotos) {
      const extensionRoomPhotos = Array.isArray(req.files.extensionRoomPhotos)
        ? req.files.extensionRoomPhotos
        : [req.files.extensionRoomPhotos];
      for (const file of extensionRoomPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${userId}/form-twenty-two` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newExtensionRoomPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedExtensionRoomPhotos = [...updatedExtensionRoomPhotos, ...newExtensionRoomPhotos];

    // Prepare the update object
    const updateData = {
      ...req.body,
      extensionRoomPhotos: updatedExtensionRoomPhotos,
    };

    // Update the document
    const updatedForm = await FormTwentyTwo.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Twenty-Two updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Twenty-Two:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Two document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};