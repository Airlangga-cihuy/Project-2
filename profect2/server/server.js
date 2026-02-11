import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";

// ======================
// Init
// ======================
const app = express();
const PORT = 3000;

// Pastikan folder upload ada
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer config
const upload = multer({ dest: "uploads/" });

// Rekognition (gunakan IAM Role EC2)
const rekognition = new RekognitionClient({
  region: "us-east-1"
});

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());

// ======================
// Health check (penting untuk test)
// ======================
app.get("/health", (req, res) => {
  res.json({ status: "API running" });
});

// ======================
// Upload + Rekognition
// Endpoint ini diakses dari:
// Browser: /api/upload
// Apache : /api → localhost:3000/
// Node   : /upload
// ======================
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("Request received");

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const imageBytes = fs.readFileSync(filePath);

    const command = new DetectLabelsCommand({
      Image: { Bytes: imageBytes },
      MaxLabels: 10,
      MinConfidence: 70
    });

    const response = await rekognition.send(command);

    // Hapus file sementara
    fs.unlinkSync(filePath);

    res.json({
      labels: response.Labels || []
    });

  } catch (error) {
    console.error("Rekognition error:", error);
    res.status(500).json({
      error: "Rekognition failed",
      message: error.message
    });
  }
});

// ======================
// Start server
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});
