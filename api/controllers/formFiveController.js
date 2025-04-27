import { FormFive } from "../model/FormFive.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new Form Five document
export const createFormFive = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormFive document already exists for this processId
    const existingForm = await FormFive.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Five document already exists for this process.",
      });
    }

    const formData = req.body;
    const filePaths = [];

    // If files are uploaded, upload them to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-five` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        filePaths.push(result.secure_url);
      }
      formData.corridorPhotos = filePaths;
    }

    const newForm = new FormFive(formData);
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Five created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Five:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Five document already exists for this process.",
      });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Five with multiple photo uploads
export const updateFormFive = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Parse deletedImages (it might be sent as a JSON string or an array)
    let deletedImages = [];
    if (req.body.deletedImages) {
      if (typeof req.body.deletedImages === "string") {
        try {
          deletedImages = JSON.parse(req.body.deletedImages);
        } catch (error) {
          deletedImages = [req.body.deletedImages];
        }
      } else {
        deletedImages = req.body.deletedImages;
      }
    }

    // Fetch the existing document from the database
    const existingForm = await FormFive.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Five not found" });
    }

    // Remove images marked for deletion from the existing images array
    let updatedPhotos = existingForm.corridorPhotos.filter(
      (photo) => !deletedImages.includes(photo)
    );

    // Delete images from Cloudinary
    const deleteImage = async (url) => {
      if (url) {
        const publicId = url.split("/").slice(-1)[0].split(".")[0];
        const folderPath = `user-${formData.userId}/form-five`;
        await cloudinary.uploader.destroy(`${folderPath}/${publicId}`);
      }
    };

    await Promise.all(deletedImages.map(deleteImage));

    // Process newly uploaded files (if any)
    let newPhotos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: `user-${formData.userId}/form-five` },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        newPhotos.push(result.secure_url);
      }
    }

    // Combine the remaining images with the newly uploaded ones
    updatedPhotos = [...updatedPhotos, ...newPhotos];

    // Prepare the update object
    const updateData = {
      ...formData,
      corridorPhotos: updatedPhotos,
    };

    // Update the document and return the updated record
    const updatedForm = await FormFive.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    return res.status(200).json({
      success: true,
      message: "Form Five updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Five:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Five document already exists for this process.",
      });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Five data for a given processId
export const getFormFiveByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormFive.findOne({ processId });
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error("Error fetching Form Five data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};