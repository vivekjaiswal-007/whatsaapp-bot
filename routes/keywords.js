const express = require("express");
const router = express.Router();
const Keyword = require("../models/Keyword");
const Welcome = require("../models/Welcome");

// --- KEYWORD ROUTES ---

// Get all keywords
router.get("/keywords", async (req, res) => {
  try {
    const keywords = await Keyword.find().sort({ createdAt: -1 });
    res.json(keywords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add keyword
router.post("/keywords", async (req, res) => {
  try {
    const { keyword, reply } = req.body;
    if (!keyword || !reply)
      return res.status(400).json({ error: "Keyword and reply required" });

    const existing = await Keyword.findOne({ keyword: keyword.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ error: "Keyword already exists" });

    const newKeyword = new Keyword({ keyword: keyword.toLowerCase().trim(), reply });
    await newKeyword.save();
    res.json(newKeyword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update keyword
router.put("/keywords/:id", async (req, res) => {
  try {
    const { keyword, reply, isActive } = req.body;
    const updated = await Keyword.findByIdAndUpdate(
      req.params.id,
      { keyword: keyword?.toLowerCase().trim(), reply, isActive },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete keyword
router.delete("/keywords/:id", async (req, res) => {
  try {
    await Keyword.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- WELCOME MESSAGE ROUTES ---

// Get welcome message
router.get("/welcome", async (req, res) => {
  try {
    let welcome = await Welcome.findOne();
    if (!welcome) {
      welcome = await Welcome.create({
        message: "Welcome to Newmahadev247! 🙏\nHow can we help you today?",
      });
    }
    res.json(welcome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update welcome message
router.put("/welcome", async (req, res) => {
  try {
    const { message, isActive } = req.body;
    let welcome = await Welcome.findOne();
    if (!welcome) {
      welcome = await Welcome.create({ message, isActive });
    } else {
      welcome.message = message ?? welcome.message;
      welcome.isActive = isActive ?? welcome.isActive;
      await welcome.save();
    }
    res.json(welcome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
