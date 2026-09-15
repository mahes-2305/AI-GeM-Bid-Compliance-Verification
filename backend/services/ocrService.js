const { createWorker } = require("tesseract.js");
const fs = require("fs");
const pdf = require("pdf-parse");

// Extract text from image using OCR
const extractTextFromImage = async (imagePath) => {
  try {
    console.log("Starting image OCR...");

    const worker = await createWorker("eng");

    const {
      data: { text }
    } = await worker.recognize(imagePath);

    await worker.terminate();

    console.log("Image OCR completed!");

    return text;
  } catch (error) {
    console.error("Image OCR Error:", error.message);
    throw error;
  }
};

// Extract text directly from PDF
const extractTextFromPDF = async (pdfPath) => {
  try {
    console.log("Starting PDF text extraction...");

    const pdfBuffer = fs.readFileSync(pdfPath);

    const data = await pdf(pdfBuffer);

    console.log("PDF text extraction completed!");

    return data.text;
  } catch (error) {
    console.error("PDF Extraction Error:", error.message);
    throw error;
  }
};

module.exports = {
  extractTextFromImage,
  extractTextFromPDF
};