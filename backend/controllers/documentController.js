const path = require("path");
const fs = require("fs");

const { extractTenderRequirements } = require("../services/tenderService");
const { extractTextFromImage, extractTextFromPDF } = require("../services/ocrService");
const { extractBidData } = require("../services/dataExtractionService");
const { checkCompliance } = require("../services/complianceService");
const { runMultiPortalVerification } = require("../services/mockPortalService");
const { analyzeComplianceWithRAG } = require("../services/ragLlmService");

// Path to persistent bid store
const DATA_DIR = path.join(__dirname, "../data");
const STORE_PATH = path.join(DATA_DIR, "submissions.json");

/**
 * Read Submissions from JSON Persistent File Store
 */
const readSubmissionsStore = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading submissions store:", err.message);
    return [];
  }
};

/**
 * Save Submissions to JSON Persistent File Store
 */
const writeSubmissionsStore = (submissions) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(submissions, null, 2));
  } catch (err) {
    console.error("Error writing submissions store:", err.message);
  }
};

/**
 * Safe File Unlinking Helper
 */
const safeUnlink = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`[STORAGE CLEANUP] Unlinked processed file: ${filePath}`);
    } catch (err) {
      console.warn(`[STORAGE CLEANUP WARN] Could not unlink ${filePath}: ${err.message}`);
    }
  }
};

const testDocument = (req, res) => {
  res.json({
    success: true,
    message: "NexVerify AI Verification API (SIH PS 26100) is operational!"
  });
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file uploaded"
      });
    }

    let extractedText = "";
    let processingMethod = "";

    if (req.file.mimetype.startsWith("image/")) {
      processingMethod = "Tesseract OCR Engine";
      extractedText = await extractTextFromImage(req.file.path);
    } else if (req.file.mimetype === "application/pdf") {
      processingMethod = "PDF Parser + Optical Text Extractor";
      extractedText = await extractTextFromPDF(req.file.path);
    }

    const extractedData = extractBidData(extractedText);
    const requirements = extractTenderRequirements(extractedText);

    const portalVerification = await runMultiPortalVerification(
      extractedData,
      extractedData.legalEntity || "Bidder Enterprise",
      extractedText
    );

    const aiAnalysis = await analyzeComplianceWithRAG(
      extractedData,
      requirements,
      portalVerification,
      extractedText
    );

    const complianceResult = checkCompliance(
      extractedData,
      requirements
    );

    // Clean up processed upload from disk
    safeUnlink(req.file.path);

    res.status(200).json({
      success: true,
      message: "Document analyzed successfully via AI RAG & Multi-Portal Verification",
      processingMethod,
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      extractedText,
      extractedData,
      requirements,
      portalVerification,
      aiAnalysis,
      complianceResult
    });

  } catch (error) {
    console.error("Document processing error:", error);
    if (req.file) safeUnlink(req.file.path);
    res.status(500).json({
      success: false,
      message: "Failed to process document",
      error: error.message
    });
  }
};

const verifyDocuments = async (req, res) => {
  try {
    const bidderFileObj = req.files?.bidderDocument?.[0];
    const bidderStringName = req.body.bidderFileName || (typeof req.body.bidderDocument === 'string' ? req.body.bidderDocument : null);

    const directTenderFile = req.files?.tenderDocument?.[0];
    const tenderFileName = req.body.tenderFileName || (typeof req.body.tenderDocument === 'string' ? req.body.tenderDocument : null);

    let requirements = {
      panRequired: true,
      gstRequired: true,
      legalEntityRequired: true,
      epfoRequired: true,
      esicRequired: true,
      debarmentCheckRequired: true,
      digilockerRequired: true,
      minTurnover: 30000000,
      minExperienceYears: 3,
      strictMode: false
    };

    let tenderText = "";
    let tenderFilePath = null;
    if (directTenderFile) {
      tenderFilePath = directTenderFile.path;
    } else if (tenderFileName) {
      tenderFilePath = path.join(__dirname, "../uploads", tenderFileName);
    }

    if (tenderFilePath && fs.existsSync(tenderFilePath)) {
      try {
        const tenderExt = path.extname(tenderFilePath).toLowerCase();
        if (tenderExt === ".png" || tenderExt === ".jpg" || tenderExt === ".jpeg") {
          tenderText = await extractTextFromImage(tenderFilePath);
        } else {
          tenderText = await extractTextFromPDF(tenderFilePath);
        }
        if (tenderText && tenderText.trim().length > 10) {
          requirements = extractTenderRequirements(tenderText);
        }
      } catch (tErr) {
        console.warn("Could not parse tender document text, using default rules:", tErr.message);
      }
    }

    let bidderText = "";
    let bidderDisplayName = "TechNova Solutions Pvt Ltd";

    if (bidderFileObj) {
      bidderDisplayName = bidderFileObj.originalname;
      try {
        if (bidderFileObj.mimetype.startsWith("image/")) {
          bidderText = await extractTextFromImage(bidderFileObj.path);
        } else {
          bidderText = await extractTextFromPDF(bidderFileObj.path);
        }
      } catch (bErr) {
        console.warn("Optical text extraction notice on bidder file:", bErr.message);
      }
    } else {
      bidderDisplayName = bidderStringName || "TechNova_bidder_details.pdf";
      bidderText = `BIDDER LEGAL ENTITY: TechNova Solutions Pvt Ltd
CONSTITUTION: Private Limited Company
PAN: ABCDE1234F
GSTIN: 27ABCDE1234F1Z5
AVERAGE ANNUAL TURNOVER: Rs 4.5 Cr
EXPERIENCE: 5 years of experience declared
SOLVENCY CERTIFICATE AMOUNT: Rs 1.2 Cr
LARGEST SINGLE ORDER VALUE: Rs 2.1 Cr
EPFO Details: Registered
ESIC Details: Registered
DigiLocker Documents: Verified
Debarred: No
Net Worth: Positive`;
    }

    const extractedData = extractBidData(bidderText);
    const bidderName = extractedData.legalEntity || bidderDisplayName.replace(/\.[^/.]+$/, "");
    const portalVerification = await runMultiPortalVerification(
      extractedData,
      bidderName,
      bidderText
    );

    const aiAnalysis = await analyzeComplianceWithRAG(
      extractedData,
      requirements,
      portalVerification,
      bidderText
    );

    const complianceResult = checkCompliance(
      extractedData,
      requirements
    );

    if (aiAnalysis.riskLevel === "HIGH" || portalVerification.debarment.isDebarred) {
      complianceResult.overallStatus = "NON-COMPLIANT";
    } else if (aiAnalysis.riskLevel === "MEDIUM") {
      complianceResult.overallStatus = "REVIEW_REQUIRED";
    } else if (complianceResult.overallStatus !== "NON-COMPLIANT") {
      complianceResult.overallStatus = "COMPLIANT";
    }

    // Prepare Bid Record for Persistent Store
    const newBidRecord = {
      id: `SUB-${Date.now()}`,
      bidId: req.body.bidId || "GeM/BID/2026",
      bidTitle: req.body.bidTitle || "Procurement Submission",
      bidderName: req.body.userName || bidderName || bidderDisplayName || "TechNova Solutions Pvt Ltd",
      submittedAt: new Date().toISOString(),
      bidderDocument: bidderDisplayName || "Bidder Document.pdf",
      tenderDocument: directTenderFile?.originalname || tenderFileName || "GeM Requirement Document",
      overallStatus: complianceResult.overallStatus,
      complianceResult: complianceResult,
      extractedData: extractedData,
      requirements: requirements,

      // Legacy fields
      tenderId: directTenderFile?.originalname || tenderFileName || "GEM/2026/B/89021",
      submissionDate: new Date().toISOString().split("T")[0],
      status: complianceResult.overallStatus,
      complianceScore: aiAnalysis.complianceScore || 88,
      riskLevel: aiAnalysis.riskLevel || "LOW",
      pan: extractedData.pan || "ABCDE1234F",
      gstin: extractedData.gst || "27ABCDE1234F1Z5",
      annualTurnover: extractedData.annualTurnover || 45000000,
      experienceYears: extractedData.experienceYears || 5,
      discrepanciesCount: (aiAnalysis.discrepancies || []).length,
      recommendation: aiAnalysis.recommendation || "QUALIFIED",
      verifiedAt: new Date().toISOString()
    };

    // Save Record to Backend Store
    const currentSubmissions = readSubmissionsStore();
    currentSubmissions.unshift(newBidRecord);
    writeSubmissionsStore(currentSubmissions);


    res.status(200).json({
      success: true,
      message: "AI Bid Verification & Multi-Portal Cross-Check completed successfully",
      tenderDocument: {
        fileName: directTenderFile?.originalname || tenderFileName || "GeM Tender Specification",
      },
      bidderDocument: {
        originalName: bidderDisplayName,
      },
      requirements,
      extractedData,
      portalVerification,
      aiAnalysis,
      complianceResult,
      savedRecord: newBidRecord
    });

  } catch (error) {
    console.error("Verification error:", error);
    if (req.files?.bidderDocument?.[0]) safeUnlink(req.files.bidderDocument[0].path);
    if (req.files?.tenderDocument?.[0]) safeUnlink(req.files.tenderDocument[0].path);

    res.status(500).json({
      success: false,
      message: "Failed to verify documents",
      error: error.message,
    });
  }
};

/**
 * Fetch All Submissions from Backend Store
 * GET /api/documents/submissions
 */
const getSubmissions = async (req, res) => {
  try {
    const submissions = readSubmissionsStore();
    res.status(200).json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message
    });
  }
};

const chatWithAI = async (req, res) => {
  try {
    const { query, context } = req.body;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }

    const { answerProcurementQuery } = require("../services/ragLlmService");
    const result = await answerProcurementQuery(query, context || "");
    res.status(200).json(result);
  } catch (error) {
    console.error("AI Chat error:", error);
    res.status(500).json({
      success: false,
      message: "AI service error",
      error: error.message
    });
  }
};

module.exports = {
  testDocument,
  uploadDocument,
  verifyDocuments,
  getSubmissions,
  chatWithAI
};