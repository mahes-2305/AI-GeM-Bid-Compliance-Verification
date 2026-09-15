const express = require("express");
const cors = require("cors");
require("dotenv").config();

const documentRoutes = require("./routes/documentRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Temporary testing UI
app.use(express.static("public"));

// API routes
app.use("/api/documents", documentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});