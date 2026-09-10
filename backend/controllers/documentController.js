const {
  extractTenderRequirements
} = require("../services/tenderService");

const {
  extractTextFromImage,
  extractTextFromPDF
} = require("../services/ocrService");

const {
  extractBidData,
} = require("../services/dataExtractionService");

const {
  checkCompliance
} = require("../services/complianceService");

const testDocument = (req, res) => {
  res.json({
    success: true,
    message: "Document API is working!"
  });
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    let extractedText = "";
    let processingMethod = "";

    // Process images
    if (req.file.mimetype.startsWith("image/")) {
      processingMethod = "OCR";
      extractedText = await extractTextFromImage(req.file.path);
    }

    // Process PDFs
    else if (req.file.mimetype === "application/pdf") {
      processingMethod = "PDF Text Extraction";
      extractedText = await extractTextFromPDF(req.file.path);
    }

    // Extract structured bid data
    const extractedData = extractBidData(extractedText);

    // Temporary tender requirements
    const requirements = extractTenderRequirements(extractedText);

    // Check compliance
    const complianceResult = checkCompliance(
      extractedData,
      requirements
    );

    res.status(200).json({
      success: true,
      message: "Document uploaded and processed successfully!",
      processingMethod,

      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      },

      extractedText,
      extractedData,
      requirements,
      complianceResult
    });

  } catch (error) {
    console.error("Document processing error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to process document",
      error: error.message
    });
  }
};

const verifyDocuments = async (req, res) => {
  try {
    const tenderFile = req.files?.tenderDocument?.[0];
    const bidderFile = req.files?.bidderDocument?.[0];

    if (!tenderFile || !bidderFile) {
      return res.status(400).json({
        success: false,
        message: "Both tender and bidder documents are required"
      });
    }

    // Extract tender text
    let tenderText = "";

    if (tenderFile.mimetype.startsWith("image/")) {
      tenderText = await extractTextFromImage(tenderFile.path);
    } else {
      tenderText = await extractTextFromPDF(tenderFile.path);
    }

    // Extract bidder text
    let bidderText = "";

    if (bidderFile.mimetype.startsWith("image/")) {
      bidderText = await extractTextFromImage(bidderFile.path);
    } else {
      bidderText = await extractTextFromPDF(bidderFile.path);
    }

    // Extract requirements from tender
    const requirements = extractTenderRequirements(tenderText);

    // Extract bidder information
    const extractedData = extractBidData(bidderText);

    // Check compliance
    const complianceResult = checkCompliance(
      extractedData,
      requirements
    );

    res.status(200).json({
      success: true,
      message: "Tender and bidder documents verified successfully",

      tenderDocument: {
        originalName: tenderFile.originalname
      },

      bidderDocument: {
        originalName: bidderFile.originalname
      },

      requirements,
      extractedData,
      complianceResult
    });

  } catch (error) {
    console.error("Verification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify documents",
      error: error.message
    });
  }
};

module.exports = {
  testDocument,
  uploadDocument,
  verifyDocuments
};