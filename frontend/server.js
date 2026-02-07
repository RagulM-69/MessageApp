const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Enable CORS (optional, mostly needed if frontend talks to backend)
app.use(cors());

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, "dist")));

// Serve index.html for all routes (for React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Use PORT from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
