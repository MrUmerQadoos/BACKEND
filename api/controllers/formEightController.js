import { FormEight } from "../model/formEight.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Eight
export const createFormEight = async (req, res) => {
  try {
    const { processId } = req.body;

    const existingForm = await FormEight.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Eight document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      constructionPhotos: [],
      loftInsulationPhotos: [],
    };

    if (req.files) {
      if (req.files.constructionPhotos) {
        const constructionPhotos = Array.isArray(req.files.constructionPhotos)
          ? req.files.constructionPhotos
          : [req.files.constructionPhotos];
        for (const file of constructionPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${formData.userId}/form-eight` },
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

      if (req.files.loftInsulationPhotos) {
        const loftInsulationPhotos = Array.isArray(req.files.loftInsulationPhotos)
          ? req.files.loftInsulationPhotos
          : [req.files.loftInsulationPhotos];
        for (const file of loftInsulationPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${formData.userId}/form-eight` },
              (error, result) => {
                if (error) reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          filePaths.loftInsulationPhotos.push(result.secure_url);
        }
      }
    }

    const newForm = new FormEight({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Eight created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Eight:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Eight document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Eight data by processId
export const getFormEightByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormEight.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Eight data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Eight with photo uploads and deletions
export const updateFormEight = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    let deletedConstruction = [];
    let deletedLoftInsulation = [];

    if (req.body.deletedConstruction) {
      deletedConstruction =
        typeof req.body.deletedConstruction === "string"
          ? JSON.parse(req.body.deletedConstruction)
          : req.body.deletedConstruction;
    }
    if (req.body.deletedLoftInsulation) {
      deletedLoftInsulation =
        typeof req.body.deletedLoftInsulation === "string"
          ? JSON.parse(req.body.deletedLoftInsulation)
          : req.body.deletedLoftInsulation;
    }

    const existingForm = await FormEight.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Eight not found" });
    }

    let updatedConstructionPhotos = existingForm.constructionPhotos.filter(
      (photo) => !deletedConstruction.includes(photo)
    );
    let updatedLoftInsulationPhotos = existingForm.loftInsulationPhotos.filter(
      (photo) => !deletedLoftInsulation.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-eight`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedConstruction.map(deleteImage));
    await Promise.all(deletedLoftInsulation.map(deleteImage));

    let newConstructionPhotos = [];
    let newLoftInsulationPhotos = [];

    if (req.files) {
      if (req.files.constructionPhotos) {
        const constructionPhotos = Array.isArray(req.files.constructionPhotos)
          ? req.files.constructionPhotos
          : [req.files.constructionPhotos];
        for (const file of constructionPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${formData.userId}/form-eight` },
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
      if (req.files.loftInsulationPhotos) {
        const loftInsulationPhotos = Array.isArray(req.files.loftInsulationPhotos)
          ? req.files.loftInsulationPhotos
          : [req.files.loftInsulationPhotos];
        for (const file of loftInsulationPhotos) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: `user-${formData.userId}/form-eight` },
              (error, result) => {
                if (error) reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });
          newLoftInsulationPhotos.push(result.secure_url);
        }
      }
    }

    updatedConstructionPhotos = [...updatedConstructionPhotos, ...newConstructionPhotos];
    updatedLoftInsulationPhotos = [...updatedLoftInsulationPhotos, ...newLoftInsulationPhotos];

    const updateData = {
      ...formData,
      constructionPhotos: updatedConstructionPhotos,
      loftInsulationPhotos: updatedLoftInsulationPhotos,
    };

    const updatedForm = await FormEight.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Eight updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Eight:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Eight document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};