import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Set up the Express app
const app = express();
const server = createServer(app);

// Serve static files from the root directory
app.use(express.static(rootDir));

// Serve index.html for all routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`[express] serving on port ${port}`);
});