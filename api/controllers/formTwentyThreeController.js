import { FormTwentyThree } from "../model/formTwentyThree.js";

// Create a new Form Twenty-Three
export const createFormTwentyThree = async (req, res) => {
  try {
    const { processId } = req.body;

    // Check if a FormTwentyThree document already exists for this processId
    const existingForm = await FormTwentyThree.findOne({ processId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Three document already exists for this process.",
      });
    }

    const newForm = new FormTwentyThree(req.body);
    await newForm.save();

    return res.status(201).json({
      success: true,
      message: "Form Twenty-Three created successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error creating Form Twenty-Three:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Three document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get Form Twenty-Three data by processId
export const getFormTwentyThreeByProcess = async (req, res) => {
  try {
    const { processId } = req.query;
    if (!processId) {
      return res.status(400).json({ success: false, error: "Process ID is required" });
    }

    const form = await FormTwentyThree.findOne({ processId });
    return res.status(200).json({ success: true, data: form ? [form] : [] });
  } catch (error) {
    console.error("Error fetching Form Twenty-Three data:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update Form Twenty-Three
export const updateFormTwentyThree = async (req, res) => {
  try {
    const { id } = req.params;

    const existingForm = await FormTwentyThree.findById(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Form Twenty-Three not found" });
    }

    const updatedForm = await FormTwentyThree.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Form Twenty-Three updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error updating Form Twenty-Three:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "A Form Twenty-Three document already exists for this process.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};