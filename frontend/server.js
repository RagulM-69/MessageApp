// frontend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS (if needed for API calls to backend)
app.use(cors());

// Serve static files from Vite's build output
app.use(express.static(path.join(__dirname, "dist")));

// Support React Router: serve index.html for all unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
