const express // server.js
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// برای اینکه ریکوئست‌های JSON رو راحت بخونی
app.use(express.json());

// مسیر اصلی تست
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// مسیر /api/metrics
app.get("/api/metrics", (req, res) => {
  res.json({
    utc: new Date().toUTCString(),
    project_online_days: 0,
    treasury_balance_usd: 18,
    registrants: ["0xTESTUSER_1"]
  });
});

// استارت سرور
app.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
});
