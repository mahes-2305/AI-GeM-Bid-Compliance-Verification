const { createWorker } = require("tesseract.js");
const fs = require("fs");
const pdf = require("pdf-parse");

let sharedWorker = null;

/**
 * Get or initialize reusable singleton Tesseract worker instance
 */
const getWorker = async () => {
  if (!sharedWorker) {
    console.log("Initializing persistent Tesseract OCR worker instance...");
    sharedWorker = await createWorker("eng");
  }
  return sharedWorker;
};

/**
 * Extract text from image using pooled Tesseract OCR worker
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log(`[OCR SERVICE] Processing image OCR: ${imagePath}`);
    const worker = await getWorker();

    const {
      data: { text }
    } = await worker.recognize(imagePath);

    console.log(`[OCR SERVICE] Image OCR completed successfully (${text.length} chars extracted).`);
    return text;
  } catch (error) {
    console.error("Image OCR Error:", error.message);
    throw error;
  }
};

/**
 * Extract text directly from PDF with graceful fallback
 */
const extractTextFromPDF = async (pdfPath) => {
  try {
    console.log(`[OCR SERVICE] Parsing PDF document: ${pdfPath}`);
    const pdfBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(pdfBuffer);

    let extractedText = data.text ? data.text.trim() : "";

    if (extractedText.length < 20) {
      console.warn("[OCR SERVICE] Low text density detected (scanned PDF image). Providing document metadata.");
      extractedText += "\n[SCANNED PDF DOCUMENT NOTICE: Optical text layer is image-based.]";
    }

    console.log(`[OCR SERVICE] PDF text extraction completed (${extractedText.length} chars).`);
    return extractedText;
  } catch (error) {
    console.error("PDF Extraction Error:", error.message);
    throw error;
  }
};

module.exports = {
  extractTextFromImage,
  extractTextFromPDF
};