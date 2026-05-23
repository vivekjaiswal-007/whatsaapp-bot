require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { initBot } = require("./bot");
const keywordRoutes = require("./routes/keywords");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple admin auth middleware
app.use("/api", (req, res, next) => {
  const authHeader = req.headers["x-admin-key"];
  if (authHeader !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Routes
app.use("/api", keywordRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "WhatsApp Bot running ✅" });
});

// Connect MongoDB then start server + bot
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
    // Start WhatsApp bot
    initBot();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
