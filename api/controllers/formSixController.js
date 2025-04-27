import { FormSix } from "../model/formSix.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Six
export const createFormSix = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormSix document already exists for this processId
    const existingForm = await FormSix.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Six document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      constructionPhotos: [],
      insulationPhotos: [],
      thicknessPhotos: [],
    };

    // Handle file uploads for each group
    if (req.files) {
      for (let field in req.files) {
        const files = Array.isArray(req.files[field]) ? req.files[field] : [req.files[field]];
        for (const file of files) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${formData.userId}/form-six` },
              (error, result) => {
                if (error) reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          if (field === "constructionPhotos") {
            filePaths.constructionPhotos.push(result.secure_url);
          } else if (field === "insulationPhotos") {
            filePaths.insulationPhotos.push(result.secure_url);
          } else if (field === "thicknessPhotos") {
            filePaths.thicknessPhotos.push(result.secure_url);
          }
        }
      }
    }

    const newForm = new FormSix({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Six created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Six:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Six document already exists for this process.",
      });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Six data by processId
export const getFormSixByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormSix.findOne({ processId });
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error("Error fetching Form Six data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Six with photo uploads and deletions
export const updateFormSix = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deleted images for each group
    let deletedConstruction = [];
    let deletedInsulation = [];
    let deletedThickness = [];

    if (req.body.deletedConstruction) {
      deletedConstruction =
        typeof req.body.deletedConstruction === "string"
          ? JSON.parse(req.body.deletedConstruction)
          : req.body.deletedConstruction;
    }
    if (req.body.deletedInsulation) {
      deletedInsulation =
        typeof req.body.deletedInsulation === "string"
          ? JSON.parse(req.body.deletedInsulation)
          : req.body.deletedInsulation;
    }
    if (req.body.deletedThickness) {
      deletedThickness =
        typeof req.body.deletedThickness === "string"
          ? JSON.parse(req.body.deletedThickness)
          : req.body.deletedThickness;
    }

    // Fetch the existing document
    const existingForm = await FormSix.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Six not found" });
    }

    // Remove deleted images from existing arrays
    let updatedConstructionPhotos = existingForm.constructionPhotos.filter(
      (photo) => !deletedConstruction.includes(photo)
    );
    let updatedInsulationPhotos = existingForm.insulationPhotos.filter(
      (photo) => !deletedInsulation.includes(photo)
    );
    let updatedThicknessPhotos = existingForm.thicknessPhotos.filter(
      (photo) => !deletedThickness.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-six`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedConstruction.map(deleteImage));
    await Promise.all(deletedInsulation.map(deleteImage));
    await Promise.all(deletedThickness.map(deleteImage));

    // Process new file uploads
    let newConstructionPhotos = [];
    let newInsulationPhotos = [];
    let newThicknessPhotos = [];

    if (req.files) {
      if (req.files.constructionPhotos) {
        const constructionPhotos = Array.isArray(req.files.constructionPhotos)
          ? req.files.constructionPhotos
          : [req.files.constructionPhotos];
        for (const file of constructionPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${formData.userId}/form-six` },
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
      if (req.files.insulationPhotos) {
        const insulationPhotos = Array.isArray(req.files.insulationPhotos)
          ? req.files.insulationPhotos
          : [req.files.insulationPhotos];
        for (const file of insulationPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${formData.userId}/form-six` },
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
      if (req.files.thicknessPhotos) {
        const thicknessPhotos = Array.isArray(req.files.thicknessPhotos)
          ? req.files.thicknessPhotos
          : [req.files.thicknessPhotos];
        for (const file of thicknessPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${formData.userId}/form-six` },
              (error, result) => {
                if (error) reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          newThicknessPhotos.push(result.secure_url);
        }
      }
    }

    // Combine remaining images with new uploads
    updatedConstructionPhotos = [...updatedConstructionPhotos, ...newConstructionPhotos];
    updatedInsulationPhotos = [...updatedInsulationPhotos, ...newInsulationPhotos];
    updatedThicknessPhotos = [...updatedThicknessPhotos, ...newThicknessPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      constructionPhotos: updatedConstructionPhotos,
      insulationPhotos: updatedInsulationPhotos,
      thicknessPhotos: updatedThicknessPhotos,
    };

    // Update the document
    const updatedForm = await FormSix.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Six updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Six:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Six document already exists for this process.",
      });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};