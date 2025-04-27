import { FormTwentyFour } from "../model/formTwentyFour.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Twenty-Four
export const createFormTwentyFour = async (req, res) => {
  try {
    const { processId, userId } = req.body;

    // Check if a FormTwentyFour document already exists for this processId
    const existingForm = await FormTwentyFour.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Four document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      constructionPhotos: [],
      wallInsulationPhotos: [],
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.constructionPhotos) {
        const constructionPhotos = Array.isArray(req.files.constructionPhotos)
          ? req.files.constructionPhotos
          : [req.files.constructionPhotos];
        for (const file of constructionPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${userId}/form-twenty-four` },
              (error, result) => {
                if (error) reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          filePaths.constructionPhotos.push(result.secure_url);
        }
      }
      if (req.files.wallInsulationPhotos) {
        const wallInsulationPhotos = Array.isArray(req.files.wallInsulationPhotos)
          ? req.files.wallInsulationPhotos
          : [req.files.wallInsulationPhotos];
        for (const file of wallInsulationPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${userId}/form-twenty-four` },
              (error, result) => {
                if (error) reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          filePaths.wallInsulationPhotos.push(result.secure_url);
        }
      }
    }

    const newForm = new FormTwentyFour({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Twenty-Four created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Twenty-Four:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Four document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Twenty-Four data by processId
export const getFormTwentyFourByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormTwentyFour.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Twenty-Four data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Twenty-Four with photo uploads and deletions
export const updateFormTwentyFour = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Parse deleted images
    let deletedConstructionPhotos = [];
    if (req.body.deletedConstructionPhotos) {
      deletedConstructionPhotos =
        typeof req.body.deletedConstructionPhotos === "string"
          ? JSON.parse(req.body.deletedConstructionPhotos)
          : req.body.deletedConstructionPhotos;
    }
    let deletedWallInsulationPhotos = [];
    if (req.body.deletedWallInsulationPhotos) {
      deletedWallInsulationPhotos =
        typeof req.body.deletedWallInsulationPhotos === "string"
          ? JSON.parse(req.body.deletedWallInsulationPhotos)
          : req.body.deletedWallInsulationPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormTwentyFour.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Twenty-Four not found" });
    }

    // Remove deleted images from existing arrays
    let updatedConstructionPhotos = existingForm.constructionPhotos.filter(
      (photo) => !deletedConstructionPhotos.includes(photo)
    );
    let updatedWallInsulationPhotos = existingForm.wallInsulationPhotos.filter(
      (photo) => !deletedWallInsulationPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${userId}/form-twenty-four`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedConstructionPhotos.map(deleteImage));
    await Promise.all(deletedWallInsulationPhotos.map(deleteImage));

    // Process new file uploads
    let newConstructionPhotos = [];
    if (req.files && req.files.constructionPhotos) {
      const constructionPhotos = Array.isArray(req.files.constructionPhotos)
        ? req.files.constructionPhotos
        : [req.files.constructionPhotos];
      for (const file of constructionPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${userId}/form-twenty-four` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newConstructionPhotos.push(result.secure_url);
      }
    }
    let newWallInsulationPhotos = [];
    if (req.files && req.files.wallInsulationPhotos) {
      const wallInsulationPhotos = Array.isArray(req.files.wallInsulationPhotos)
        ? req.files.wallInsulationPhotos
        : [req.files.wallInsulationPhotos];
      for (const file of wallInsulationPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${userId}/form-twenty-four` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newWallInsulationPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedConstructionPhotos = [...updatedConstructionPhotos, ...newConstructionPhotos];
    updatedWallInsulationPhotos = [...updatedWallInsulationPhotos, ...newWallInsulationPhotos];

    // Prepare the update object
    const updateData = {
      ...req.body,
      constructionPhotos: updatedConstructionPhotos,
      wallInsulationPhotos: updatedWallInsulationPhotos,
    };

    // Update the document
    const updatedForm = await FormTwentyFour.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Twenty-Four updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Twenty-Four:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Four document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};