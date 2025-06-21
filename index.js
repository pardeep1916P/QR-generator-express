import express from "express";
import bodyParser from "body-parser";
import qr from "qr-image";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect production environment
const isProduction = process.env.NODE_ENV === "production";
const outputDir = isProduction ? "/tmp" : path.join(__dirname, "temp");

// Ensure local temp folder exists (for development only)
if (!isProduction && !fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve generated QR image
app.get("/qr-code.png", (req, res) => {
  const qrPath = path.join(outputDir, "qr-code.png");
  if (fs.existsSync(qrPath)) {
    res.sendFile(qrPath);
  } else {
    res.status(404).send("QR code not found.");
  }
});

// Handle QR generation
app.post("/generate", (req, res) => {
  const url = req.body.url.trim();

  if (!url) {
    return res.status(400).send("Invalid input.");
  }

  const qrPath = path.join(outputDir, "qr-code.png");
  const qr_svg = qr.image(url, { type: "png" });
  const qrStream = fs.createWriteStream(qrPath);
  qr_svg.pipe(qrStream);

  // Optional: Save the URL to a text file
  const logPath = path.join(outputDir, "URL.txt");
  fs.writeFile(logPath, url, (err) => {
    if (err) console.error("Failed to save URL:", err);
    else console.log("URL saved to", logPath);
  });

  qrStream.on("finish", () => {
    res.redirect(`/generate.html?url=${encodeURIComponent(url)}`);
  });

  qrStream.on("error", (err) => {
    console.error("Error generating QR code:", err);
    res.status(500).send("Failed to generate QR code.");
  });
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running at: http://localhost:${port}`);
});
