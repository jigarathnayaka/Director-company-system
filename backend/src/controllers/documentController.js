import { processUploadedDocument } from "../services/documentProcessingService.js";

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded."
      });
    }

    const result = await processUploadedDocument(req.file);

    return res.status(201).json({
      success: true,
      message: "Document processed successfully.",
      data: result
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Document processing failed."
    });
  }
}
