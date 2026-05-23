const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const Keyword = require("./models/Keyword");
const Welcome = require("./models/Welcome");
const SeenUser = require("./models/SeenUser");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome-stable",
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

client.on("call", async (call) => {
  await call.reject();
  console.log("📵 Call rejected from:", call.from);
});

client.on("message", async (msg) => {
  try {
    if (msg.from.includes("@g.us")) return;
    if (msg.from === "status@broadcast") return;
    if (msg.type !== "chat") return;

    const senderNumber = msg.from;
    const incomingText = msg.body.trim().toLowerCase();

    const isSeenUser = await SeenUser.findOne({ phoneNumber: senderNumber });

    if (!isSeenUser) {
      const welcomeDoc = await Welcome.findOne({ isActive: true });
      if (welcomeDoc) {
        await msg.reply(welcomeDoc.message);
      }
      await SeenUser.create({ phoneNumber: senderNumber });
      return;
    }

    const keywordDoc = await Keyword.findOne({
      keyword: incomingText,
      isActive: true,
    });

    if (keywordDoc) {
      await msg.reply(keywordDoc.reply);
    }
  } catch (err) {
    console.error("Message handling error:", err.message);
  }
});

const initBot = () => {
  client.initialize();
};

module.exports = { initBot, client };
