const mongoose = require("mongoose");

const welcomeSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      default: "Welcome to Newmahadev247! 🙏\nHow can we help you today?",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Welcome", welcomeSchema);
