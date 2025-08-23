// server.js — YASA SMART PRO API
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const cron = require("node-cron");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const CREATOR_WALLET = (process.env.CREATOR_WALLET || "").toLowerCase();
const ENTRY_FEE_USD = Number(process.env.ENTRY_FEE_USD || 20);

let treasuryUSD = 0;
let registrants = [];
let teamStatsByAddress = {};

function rotatingCode() {
  const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
  const h = crypto
    .createHmac("sha256", process.env.ROTATE_SECRET || "secret")
    .update(String(bucket))
    .digest("hex");
  return h.slice(0, 8).toUpperCase();
}

cron.schedule(
  "0 0 * * *",
  () => {
    console.log("[PAYOUT] Auto payout at 00:00 UTC (simulation)");
  },
  { timezone: "UTC" }
);

// ✅ Health check (for Render)
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// Treasury balance
app.get("/api/treasury/balance", (req, res) => {
  res.json({ balance_usd: treasuryUSD });
});

// All registrants
app.get("/api/registrants", (req, res) => {
  const items = [...registrants].sort((a, b) => b.ts - a.ts);
  res.json(items);
});

// Team stats
app.get("/api/team/stats", (req, res) => {
  const addr = (req.query.address || "").toLowerCase();
  const stats = teamStatsByAddress[addr] || { total: 0, left: 0, right: 0 };
  res.json(stats);
});

// Register
app.post("/api/register", (req, res) => {
  try {
    const sponsor =
      (req.body.sponsor && String(req.body.sponsor).toLowerCase()) ||
      CREATOR_WALLET;
    const amount = Number(req.body.entry_fee_usd || ENTRY_FEE_USD);
    const userAddress = (req.body.address || `0xUSER_${Date.now()}`).toLowerCase();

    if (amount !== ENTRY_FEE_USD) {
      return res.status(400).json({ error: "Amount must be exactly $20." });
    }

    console.log("[REGISTER] sponsor=%s amount=%s address=%s", sponsor, amount, userAddress);

    const commission = amount * 0.1;
    treasuryUSD += amount - commission;

    registrants.push({ address: userAddress, sponsor, ts: Date.now() });

    if (!teamStatsByAddress[sponsor]) {
      teamStatsByAddress[sponsor] = { total: 0, left: 0, right: 0 };
    }
    const s = teamStatsByAddress[sponsor];
    s.total += 1;
    if (s.left <= s.right) s.left += 1;
    else s.right += 1;

    const txHash = "stub-" + crypto.randomBytes(8).toString("hex");
    res.json({ txHash, registered: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Rotating code
app.get("/api/security/rotating-code", (req, res) => {
  res.json({ code: rotatingCode() });
});

// Metrics
app.get("/api/metrics", (req, res) => {
  res.json({
    utc: new Date().toUTCString(),
    project_online_days: 0,
    treasury_balance_usd: treasuryUSD,
    registrants: registrants.map(r => r.address)
  });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
