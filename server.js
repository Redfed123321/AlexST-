import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up the Express app
const app = express();
const server = createServer(app);

// Serve static files
app.use(express.static("."));

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle errors
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Set up Vite in development mode
if (process.env.NODE_ENV === "development") {
  console.log("[express] serving in development mode");
  
  const viteConnect = async () => {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    
    app.use("*", async (req, res) => {
      try {
        const url = req.originalUrl;
        
        // Always serve the index.html for any non-API GET request
        let template = await vite.transformIndexHtml(
          url,
          fs.readFileSync(resolve(__dirname, "index.html"), "utf-8")
        );
        
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        console.log(e.stack);
        res.status(500).end(e.stack);
      }
    });
  };
  
  viteConnect();
} else {
  // Production mode
  console.log("[express] serving in production mode");
  
  // Always serve the index.html for any non-API GET request
  app.get("*", (_req, res) => {
    res.sendFile(resolve(__dirname, "index.html"));
  });
}

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`[express] serving on port ${port}`);
});