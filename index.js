import express from "express";
import bodyParser from "body-parser";
import qr from "qr-image";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle QR generation
app.post("/generate", (req, res) => {
  const url = req.body.url.trim();

  // Validate URL/text input
  if (!url) {
    return res.status(400).send("Invalid input.");
  }

  // Path to save QR image
  const qrPath = path.join(__dirname, "public", "qr-code.png");

  // Generate QR and write to file
  const qr_svg = qr.image(url, { type: "png" });
  const qrStream = fs.createWriteStream(qrPath);
  qr_svg.pipe(qrStream);

  // Save URL to a log file (optional)
  fs.writeFile("URL.txt", url, (err) => {
    if (err) console.error("Failed to save URL:", err);
    else console.log("URL saved to URL.txt");
  });

  // Wait for QR file to finish writing before redirect
  qrStream.on("finish", () => {
    res.redirect(`/generate.html?url=${encodeURIComponent(url)}`);
  });

  qrStream.on("error", (err) => {
    console.error("Error generating QR code:", err);
    res.status(500).send("Failed to generate QR code.");
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at: http://localhost:${port}`);
});
