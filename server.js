require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { execSync } = require("child_process");
const { initBot } = require("./bot");
const keywordRoutes = require("./routes/keywords");

const app = express();
const PORT = process.env.PORT || 5000;

try {
  const chromePath = execSync("find /opt/render/.cache/puppeteer -name 'chrome' -type f 2>/dev/null").toString().trim();
  console.log("🔍 Chrome found at:", chromePath);
} catch (e) {
  console.log("⚠️ Chrome find error:", e.message);
}

app.use(cors());
app.use(express.json());

app.use("/api", (req, res, next) => {
  const authHeader = req.headers["x-admin-key"];
  if (authHeader !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.use("/api", keywordRoutes);

app.get("/", (req, res) => {
  res.json({ status: "WhatsApp Bot running ✅" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
    initBot();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
