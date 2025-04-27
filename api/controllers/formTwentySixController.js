import { FormTwentySix } from "../model/formTwentySix.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Twenty-Six
export const createFormTwentySix = async (req, res) => {
  try {
    const { processId, userId } = req.body;

    // Check if a FormTwentySix document already exists for this processId
    const existingForm = await FormTwentySix.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Six document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      constructionPhotos: [],
      loftInsulationDepthPhotos: [],
      extensionRoomInRoofPhotos: [],
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
              { folder: `user-${userId}/form-twenty-six` },
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
      if (req.files.loftInsulationDepthPhotos) {
        const loftInsulationDepthPhotos = Array.isArray(req.files.loftInsulationDepthPhotos)
          ? req.files.loftInsulationDepthPhotos
          : [req.files.loftInsulationDepthPhotos];
        for (const file of loftInsulationDepthPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${userId}/form-twenty-six` },
              (error, result) => {
                if (error) reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          filePaths.loftInsulationDepthPhotos.push(result.secure_url);
        }
      }
      if (req.files.extensionRoomInRoofPhotos) {
        const extensionRoomInRoofPhotos = Array.isArray(req.files.extensionRoomInRoofPhotos)
          ? req.files.extensionRoomInRoofPhotos
          : [req.files.extensionRoomInRoofPhotos];
        for (const file of extensionRoomInRoofPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${userId}/form-twenty-six` },
              (error, result) => {
                if (error) reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          filePaths.extensionRoomInRoofPhotos.push(result.secure_url);
        }
      }
    }

    const newForm = new FormTwentySix({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Twenty-Six created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Twenty-Six:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Six document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Twenty-Six data by processId
export const getFormTwentySixByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormTwentySix.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Twenty-Six data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Twenty-Six with photo uploads and deletions
export const updateFormTwentySix = async (req, res) => {
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
    let deletedLoftInsulationDepthPhotos = [];
    if (req.body.deletedLoftInsulationDepthPhotos) {
      deletedLoftInsulationDepthPhotos =
        typeof req.body.deletedLoftInsulationDepthPhotos === "string"
          ? JSON.parse(req.body.deletedLoftInsulationDepthPhotos)
          : req.body.deletedLoftInsulationDepthPhotos;
    }
    let deletedExtensionRoomInRoofPhotos = [];
    if (req.body.deletedExtensionRoomInRoofPhotos) {
      deletedExtensionRoomInRoofPhotos =
        typeof req.body.deletedExtensionRoomInRoofPhotos === "string"
          ? JSON.parse(req.body.deletedExtensionRoomInRoofPhotos)
          : req.body.deletedExtensionRoomInRoofPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormTwentySix.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Twenty-Six not found" });
    }

    // Remove deleted images from existing arrays
    let updatedConstructionPhotos = existingForm.constructionPhotos.filter(
      (photo) => !deletedConstructionPhotos.includes(photo)
    );
    let updatedLoftInsulationDepthPhotos = existingForm.loftInsulationDepthPhotos.filter(
      (photo) => !deletedLoftInsulationDepthPhotos.includes(photo)
    );
    let updatedExtensionRoomInRoofPhotos = existingForm.extensionRoomInRoofPhotos.filter(
      (photo) => !deletedExtensionRoomInRoofPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${userId}/form-twenty-six`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedConstructionPhotos.map(deleteImage));
    await Promise.all(deletedLoftInsulationDepthPhotos.map(deleteImage));
    await Promise.all(deletedExtensionRoomInRoofPhotos.map(deleteImage));

    // Process new file uploads
    let newConstructionPhotos = [];
    if (req.files && req.files.constructionPhotos) {
      const constructionPhotos = Array.isArray(req.files.constructionPhotos)
        ? req.files.constructionPhotos
        : [req.files.constructionPhotos];
      for (const file of constructionPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${userId}/form-twenty-six` },
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
    let newLoftInsulationDepthPhotos = [];
    if (req.files && req.files.loftInsulationDepthPhotos) {
      const loftInsulationDepthPhotos = Array.isArray(req.files.loftInsulationDepthPhotos)
        ? req.files.loftInsulationDepthPhotos
        : [req.files.loftInsulationDepthPhotos];
      for (const file of loftInsulationDepthPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${userId}/form-twenty-six` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newLoftInsulationDepthPhotos.push(result.secure_url);
      }
    }
    let newExtensionRoomInRoofPhotos = [];
    if (req.files && req.files.extensionRoomInRoofPhotos) {
      const extensionRoomInRoofPhotos = Array.isArray(req.files.extensionRoomInRoofPhotos)
        ? req.files.extensionRoomInRoofPhotos
        : [req.files.extensionRoomInRoofPhotos];
      for (const file of extensionRoomInRoofPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${userId}/form-twenty-six` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newExtensionRoomInRoofPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedConstructionPhotos = [...updatedConstructionPhotos, ...newConstructionPhotos];
    updatedLoftInsulationDepthPhotos = [...updatedLoftInsulationDepthPhotos, ...newLoftInsulationDepthPhotos];
    updatedExtensionRoomInRoofPhotos = [...updatedExtensionRoomInRoofPhotos, ...newExtensionRoomInRoofPhotos];

    // Prepare the update object
    const updateData = {
      ...req.body,
      constructionPhotos: updatedConstructionPhotos,
      loftInsulationDepthPhotos: updatedLoftInsulationDepthPhotos,
      extensionRoomInRoofPhotos: updatedExtensionRoomInRoofPhotos,
    };

    // Update the document
    const updatedForm = await FormTwentySix.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Twenty-Six updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Twenty-Six:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Six document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};