import { FormTwentyOne } from "../model/formTwentyOne.js";

// Create a new Form Twenty-One
export const createFormTwentyOne = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormTwentyOne document already exists for this processId
    const existingForm = await FormTwentyOne.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-One document already exists for this process.",
      });
    }

    const formData = req.body;
    const newForm = new FormTwentyOne({ ...formData });
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Twenty-One created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Twenty-One:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-One document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Twenty-One data by processId
export const getFormTwentyOneByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormTwentyOne.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Twenty-One data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Twenty-One
export const updateFormTwentyOne = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Fetch the existing document
    const existingForm = await FormTwentyOne.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Twenty-One not found" });
    }

    // Update the document
    const updatedForm = await FormTwentyOne.findByIdAndUpdate(id, formData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Twenty-One updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Twenty-One:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-One document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};