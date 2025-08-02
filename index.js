const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const cron = require("node-cron");

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

let users = [];

// بارگذاری کاربران از فایل
if (fs.existsSync("users.json")) {
  users = JSON.parse(fs.readFileSync("users.json"));
}

// ذخیره کاربران در فایل
function saveUsers() {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// ثبت‌نام کاربر جدید
app.post("/register", (req, res) => {
  const { wallet, refer } = req.body;
  if (!wallet) return res.status(400).send("Wallet address required");
  if (users.find(u => u.wallet === wallet))
    return res.status(400).send("Already registered");

  const newUser = {
    wallet,
    refer,
    left: null,
    right: null,
    balance: 0,
    dailyProfit: 0,
    joined: Date.now(),
    investment: 20,
    reward: 0,
  };

  // اتصال به درخت باینری
  const parent = users.find(u => u.wallet === refer);
  if (parent) {
    if (!parent.left) parent.left = wallet;
    else if (!parent.right) parent.right = wallet;
  }

  users.push(newUser);
  saveUsers();
  res.send("Registered successfully");
});

// نمایش وضعیت کاربر
app.get("/user/:wallet", (req, res) => {
  const user = users.find(u => u.wallet === req.params.wallet);
  if (!user) return res.status(404).send("User not found");
  res.json(user);
});

// برداشت اتوماتیک روزانه (اجرای هر روز ساعت 00:00)
cron.schedule("0 0 * * *", () => {
  users.forEach(u => {
    const profit = u.investment * 0.05; // ۵٪ روزانه
    u.dailyProfit += profit;
    u.balance += profit;
  });
  saveUsers();
  console.log("🎉 Daily profits added to all users");
});

// واریز پول (با ۱۰٪ برای سازنده)
app.post("/deposit", (req, res) => {
  const { wallet } = req.body;
  const user = users.find(u => u.wallet === wallet);
  if (!user) return res.status(404).send("User not found");

  user.investment += 20;
  user.balance += 0;
  user.reward += 0;

  // ۲ دلار مستقیم به والت سازنده
  // (تراکنش واقعی خارج از سیستم انجام می‌شود)

  saveUsers();
  res.send("Deposit successful");
});

// برداشت پول
app.post("/withdraw", (req, res) => {
  const { wallet } = req.body;
  const user = users.find(u => u.wallet === wallet);
  if (!user) return res.status(404).send("User not found");

  const fee = 0.02;
  const amount = user.balance - fee;
  if (amount <= 0) return res.status(400).send("Nothing to withdraw");

  user.balance = 0;
  saveUsers();

  // انتقال واقعی باید دستی یا با ربات انجام شود
  res.send(`Withdraw processed. Amount: ${amount.toFixed(2)} USDT`);
});

app.get("/", (req, res) => {
  res.send("🟢 YASA SMART PRO is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});