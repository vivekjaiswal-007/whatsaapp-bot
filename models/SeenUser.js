const mongoose = require("mongoose");

const seenUserSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeenUser", seenUserSchema);
