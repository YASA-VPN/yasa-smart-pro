const expre// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// تست روت اصلی
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// متریک‌ها
app.get("/api/metrics", (req, res) => {
  res.json({
    utc: new Date().toUTCString(),
    project_online_days: 0,
    treasury_balance_usd: 18,
    registrants: ["0xTESTUSER_1"],
  });
});

// سرور اجرا
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
