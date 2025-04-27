import { FormThirteen } from "../model/formThirteen.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Thirteen
export const createFormThirteen = async (req, res) => {
  try {
    const { processId, mainHeating1, mainHeating2, secondaryHeating } = req.body;

    // Check if a FormThirteen document already exists for this processId
    const existingForm = await FormThirteen.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Thirteen document already exists for this process.",
      });
    }

    const formData = {
      ...req.body,
      mainHeating1: JSON.parse(mainHeating1),
      mainHeating2: JSON.parse(mainHeating2),
      secondaryHeating,
    };

    const filePaths = {
      mainHeating1Photos: [],
      mainHeating2Photos: [],
      secondaryHeatingPhotos: [],
    };

    // Handle file uploads for mainHeating1Photos
    if (req.files && req.files.mainHeating1Photos) {
      const mainHeating1Photos = Array.isArray(req.files.mainHeating1Photos)
        ? req.files.mainHeating1Photos
        : [req.files.mainHeating1Photos];
      for (const file of mainHeating1Photos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-thirteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.mainHeating1Photos.push(result.secure_url);
      }
    }

    // Handle file uploads for mainHeating2Photos
    if (req.files && req.files.mainHeating2Photos) {
      const mainHeating2Photos = Array.isArray(req.files.mainHeating2Photos)
        ? req.files.mainHeating2Photos
        : [req.files.mainHeating2Photos];
      for (const file of mainHeating2Photos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-thirteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.mainHeating2Photos.push(result.secure_url);
      }
    }

    // Handle file uploads for secondaryHeatingPhotos
    if (req.files && req.files.secondaryHeatingPhotos) {
      const secondaryHeatingPhotos = Array.isArray(req.files.secondaryHeatingPhotos)
        ? req.files.secondaryHeatingPhotos
        : [req.files.secondaryHeatingPhotos];
      for (const file of secondaryHeatingPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-thirteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.secondaryHeatingPhotos.push(result.secure_url);
      }
    }

    const newForm = new FormThirteen({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Thirteen created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Thirteen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Thirteen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Thirteen data by processId
export const getFormThirteenByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormThirteen.find({ processId });
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error("Error fetching Form Thirteen data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Thirteen with photo uploads and deletions
export const updateFormThirteen = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainHeating1, mainHeating2, secondaryHeating } = req.body;

    const formData = {
      ...req.body,
      mainHeating1: JSON.parse(mainHeating1),
      mainHeating2: JSON.parse(mainHeating2),
      secondaryHeating,
    };

    // Parse deleted images
    let deletedMainHeating1Photos = [];
    if (req.body.deletedMainHeating1Photos) {
      deletedMainHeating1Photos =
        typeof req.body.deletedMainHeating1Photos === "string"
          ? JSON.parse(req.body.deletedMainHeating1Photos)
          : req.body.deletedMainHeating1Photos;
    }

    let deletedMainHeating2Photos = [];
    if (req.body.deletedMainHeating2Photos) {
      deletedMainHeating2Photos =
        typeof req.body.deletedMainHeating2Photos === "string"
          ? JSON.parse(req.body.deletedMainHeating2Photos)
          : req.body.deletedMainHeating2Photos;
    }

    let deletedSecondaryHeatingPhotos = [];
    if (req.body.deletedSecondaryHeatingPhotos) {
      deletedSecondaryHeatingPhotos =
        typeof req.body.deletedSecondaryHeatingPhotos === "string"
          ? JSON.parse(req.body.deletedSecondaryHeatingPhotos)
          : req.body.deletedSecondaryHeatingPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormThirteen.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Thirteen not found" });
    }

    // Remove deleted images from existing arrays
    let updatedMainHeating1Photos = existingForm.mainHeating1Photos.filter(
      (photo) => !deletedMainHeating1Photos.includes(photo)
    );
    let updatedMainHeating2Photos = existingForm.mainHeating2Photos.filter(
      (photo) => !deletedMainHeating2Photos.includes(photo)
    );
    let updatedSecondaryHeatingPhotos = existingForm.secondaryHeatingPhotos.filter(
      (photo) => !deletedSecondaryHeatingPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-thirteen`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedMainHeating1Photos.map(deleteImage));
    await Promise.all(deletedMainHeating2Photos.map(deleteImage));
    await Promise.all(deletedSecondaryHeatingPhotos.map(deleteImage));

    // Process new file uploads
    let newMainHeating1Photos = [];
    if (req.files && req.files.mainHeating1Photos) {
      const mainHeating1Photos = Array.isArray(req.files.mainHeating1Photos)
        ? req.files.mainHeating1Photos
        : [req.files.mainHeating1Photos];
      for (const file of mainHeating1Photos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-thirteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newMainHeating1Photos.push(result.secure_url);
      }
    }

    let newMainHeating2Photos = [];
    if (req.files && req.files.mainHeating2Photos) {
      const mainHeating2Photos = Array.isArray(req.files.mainHeating2Photos)
        ? req.files.mainHeating2Photos
        : [req.files.mainHeating2Photos];
      for (const file of mainHeating2Photos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-thirteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newMainHeating2Photos.push(result.secure_url);
      }
    }

    let newSecondaryHeatingPhotos = [];
    if (req.files && req.files.secondaryHeatingPhotos) {
      const secondaryHeatingPhotos = Array.isArray(req.files.secondaryHeatingPhotos)
        ? req.files.secondaryHeatingPhotos
        : [req.files.secondaryHeatingPhotos];
      for (const file of secondaryHeatingPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-thirteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newSecondaryHeatingPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedMainHeating1Photos = [...updatedMainHeating1Photos, ...newMainHeating1Photos];
    updatedMainHeating2Photos = [...updatedMainHeating2Photos, ...newMainHeating2Photos];
    updatedSecondaryHeatingPhotos = [...updatedSecondaryHeatingPhotos, ...newSecondaryHeatingPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      mainHeating1Photos: updatedMainHeating1Photos,
      mainHeating2Photos: updatedMainHeating2Photos,
      secondaryHeatingPhotos: updatedSecondaryHeatingPhotos,
    };

    // Update the document
    const updatedForm = await FormThirteen.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Thirteen updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Thirteen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Thirteen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};