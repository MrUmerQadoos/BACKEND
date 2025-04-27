import { FormSixteen } from "../model/formSixteen.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Sixteen
export const createFormSixteen = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormSixteen document already exists for this processId
    const existingForm = await FormSixteen.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Sixteen document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = {
      wwhrsPhotos: [],
    };

    // Handle file uploads for wwhrsPhotos
    if (req.files && req.files.wwhrsPhotos) {
      const wwhrsPhotos = Array.isArray(req.files.wwhrsPhotos) ? req.files.wwhrsPhotos : [req.files.wwhrsPhotos];
      for (const file of wwhrsPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-sixteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.wwhrsPhotos.push(result.secure_url);
      }
    }

    const newForm = new FormSixteen({ ...formData, ...filePaths });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Sixteen created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Sixteen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Sixteen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Sixteen data by processId
export const getFormSixteenByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormSixteen.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Sixteen data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Sixteen with photo uploads and deletions
export const updateFormSixteen = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deleted images
    let deletedWwhrsPhotos = [];
    if (req.body.deletedWwhrsPhotos) {
      deletedWwhrsPhotos =
        typeof req.body.deletedWwhrsPhotos === "string"
          ? JSON.parse(req.body.deletedWwhrsPhotos)
          : req.body.deletedWwhrsPhotos;
    }

    // Fetch the existing document
    const existingForm = await FormSixteen.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Sixteen not found" });
    }

    // Remove deleted images from existing array
    let updatedWwhrsPhotos = existingForm.wwhrsPhotos.filter(
      (photo) => !deletedWwhrsPhotos.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-sixteen`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedWwhrsPhotos.map(deleteImage));

    // Process new file uploads
    let newWwhrsPhotos = [];
    if (req.files && req.files.wwhrsPhotos) {
      const wwhrsPhotos = Array.isArray(req.files.wwhrsPhotos) ? req.files.wwhrsPhotos : [req.files.wwhrsPhotos];
      for (const file of wwhrsPhotos) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-sixteen` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newWwhrsPhotos.push(result.secure_url);
      }
    }

    // Combine remaining images with new uploads
    updatedWwhrsPhotos = [...updatedWwhrsPhotos, ...newWwhrsPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      wwhrsPhotos: updatedWwhrsPhotos,
    };

    // Update the document
    const updatedForm = await FormSixteen.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Sixteen updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Sixteen:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Sixteen document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};