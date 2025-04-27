import { FormThree } from "../model/FormThree.js";

// Create a new Form Three document
export const createFormThree = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormThree document already exists for this processId
    const existingForm = await FormThree.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Three document already exists for this process.",
      });
    }

    const newForm = new FormThree(req.body);
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Three created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Three:", error);
    if (error.code === 11000) {
      // Duplicate key error (e.g., processId already exists)
      return res.status(400).json({
        success: false,
        error: "A Form Three document already exists for this process.",
      });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Three data for a given processId
export const getFormThreeByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormThree.findOne({ processId });
    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error("Error fetching Form Three data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Three by its ID
export const updateFormThree = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedDoc = await FormThree.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: "Form Three not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Form Three updated successfully",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error updating Form Three:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Three document already exists for this process.",
      });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};