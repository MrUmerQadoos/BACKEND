import { FormNineteen } from "../model/formNineteen.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Nineteen
export const createFormNineteen = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a Form Nineteen document already exists for this processId
    const existingForm = await FormNineteen.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Nineteen document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      otherDetailsPhotos: [],
    };

    // Handle file uploads for otherDetailsPhotos
    if (req.files && req.files.otherDetailsPhotos) {
      const otherDetailsPhotos = Array.isArray(req.files.otherDetailsPhotos)
        ? req.files.otherDetailsPhotos
        : [req.files.otherDetailsPhotos];
      for (const file of otherDetailsPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-nineteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.otherDetailsPhotos.push(result.secure_url);
      }
    }

    const newForm = new FormNineteen({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Nineteen created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Nineteen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Nineteen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Nineteen data by processId
export const getFormNineteenByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormNineteen.find({ processId });
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error("Error fetching Form Nineteen data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Nineteen with photo uploads and deletions
export const updateFormNineteen = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deleted images for otherDetailsPhotos
    let deletedOtherDetailsPhotos = [];
    if (req.body.deletedOtherDetailsPhotos) {
      deletedOtherDetailsPhotos =
        typeof req.body.deletedOtherDetailsPhotos === "string"
          ? JSON.parse(req.body.deletedOtherDetailsPhotos)
          : req.body.deletedOtherDetailsPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormNineteen.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Nineteen not found" });
    }

    // Remove deleted images from existing array
    let updatedOtherDetailsPhotos = existingForm.otherDetailsPhotos.filter(
      (photo) => !deletedOtherDetailsPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-nineteen`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedOtherDetailsPhotos.map(deleteImage));

    // Process new file uploads for otherDetailsPhotos
    let newOtherDetailsPhotos = [];
    if (req.files && req.files.otherDetailsPhotos) {
      const otherDetailsPhotos = Array.isArray(req.files.otherDetailsPhotos)
        ? req.files.otherDetailsPhotos
        : [req.files.otherDetailsPhotos];
      for (const file of otherDetailsPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-nineteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newOtherDetailsPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedOtherDetailsPhotos = [...updatedOtherDetailsPhotos, ...newOtherDetailsPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      otherDetailsPhotos: updatedOtherDetailsPhotos,
    };

    // Update the document
    const updatedForm = await FormNineteen.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Nineteen updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Nineteen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Nineteen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};