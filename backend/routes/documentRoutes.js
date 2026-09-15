const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const {
  testDocument,
  uploadDocument,
  verifyDocuments
} = require("../controllers/documentController");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// Allowed file types
const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png"
];

// File validation
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, JPG, JPEG, and PNG files are allowed"),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// Test API
router.get("/test", testDocument);

// Verify tender and bidder documents
router.post(
  "/verify",
  upload.fields([
    { name: "bidderDocument", maxCount: 1 }
  ]),
  verifyDocuments
);

// Upload API
router.post("/upload", (req, res) => {
  upload.single("document")(req, res, (err) => {
    if (err) {
      // File too large
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size must not exceed 10 MB"
          });
        }
      }

      // Invalid file type
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    router.post("/compare", (req, res) => {
  upload.fields([
    { name: "tenderDocument", maxCount: 1 },
    { name: "bidderDocument", maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      if (
        err instanceof multer.MulterError &&
        err.code === "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message: "File size must not exceed 10 MB"
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    compareDocuments(req, res);
  });
});

    // No errors → send request to controller
    uploadDocument(req, res);
  });
});
module.exports = router;