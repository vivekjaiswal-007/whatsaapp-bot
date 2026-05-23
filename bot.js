const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const Keyword = require("./models/Keyword");
const Welcome = require("./models/Welcome");
const SeenUser = require("./models/SeenUser");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  },
});

client.on("qr", (qr) => {
  console.log("\n📱 Scan this QR code with WhatsApp:\n");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp Bot is ready!");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Auth failed:", msg);
});

client.on("disconnected", (reason) => {
  console.log("⚠️ Bot disconnected:", reason);
});

// ❌ Call reject karo
client.on("call", async (call) => {
  await call.reject();
  console.log("📵 Call rejected from:", call.from);
});

client.on("message", async (msg) => {
  try {
    // Ignore group messages
    if (msg.from.includes("@g.us")) return;

    // Ignore status messages
    if (msg.from === "status@broadcast") return;

    // ❌ Media block karo (photo, video, audio, document)
    if (msg.type !== "chat") return;

    const senderNumber = msg.from;
    const incomingText = msg.body.trim().toLowerCase();

    // Check if first time user
    const isSeenUser = await SeenUser.findOne({ phoneNumber: senderNumber });

    if (!isSeenUser) {
      // First time — send welcome message
      const welcomeDoc = await Welcome.findOne({ isActive: true });
      if (welcomeDoc) {
        await msg.reply(welcomeDoc.message);
      }
      // Mark as seen
      await SeenUser.create({ phoneNumber: senderNumber });
      return;
    }

    // Returning user — check keyword match (exact match)
    const keywordDoc = await Keyword.findOne({
      keyword: incomingText,
      isActive: true,
    });

    if (keywordDoc) {
      await msg.reply(keywordDoc.reply);
    }
    // No match = no reply (silent)
  } catch (err) {
    console.error("Message handling error:", err.message);
  }
});

const initBot = () => {
  client.initialize();
};

module.exports = { initBot, client };
