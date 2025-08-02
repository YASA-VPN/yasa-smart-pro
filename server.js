import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// دیتابیس ساده موقتی
const users = [];
const transactions = [];

const OWNER_WALLET = process.env.OWNER_WALLET_ADDRESS;
const ENTRY_AMOUNT = 20; // دلار
const DAILY_REWARD = 1; // سود روزانه
const BINARY_REWARD = 6; // پاداش جفت

// 📌 ساختار یوزر
function createUser({ wallet, referrer }) {
  const user = {
    wallet,
    referrer,
    left: null,
    right: null,
    joinedAt: Date.now(),
    lastClaimed: Date.now(),
    balance: 0,
  };
  users.push(user);
  return user;
}

// 📌 ثبت‌نام
app.post('/api/register', (req, res) => {
  const { wallet, referrer } = req.body;

  if (!wallet || !referrer) {
    return res.status(400).json({ error: 'Wallet and referrer required' });
  }

  const exists = users.find(u => u.wallet === wallet);
  if (exists) return res.status(400).json({ error: 'User already registered' });

  const ref = users.find(u => u.wallet === referrer);
  if (!ref) return res.status(400).json({ error: 'Referrer not found' });

  const user = createUser({ wallet, referrer });

  if (!ref.left) ref.left = wallet;
  else if (!ref.right) ref.right = wallet;

  return res.json({ message: 'Registered successfully', user });
});

// 📌 دریافت اطلاعات کاربر
app.get('/api/user/:wallet', (req, res) => {
  const user = users.find(u => u.wallet === req.params.wallet);
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json(user);
});

// 📌 شبیه‌سازی واریز
app.post('/api/deposit', (req, res) => {
  const { wallet } = req.body;
  const user = users.find(u => u.wallet === wallet);
  if (!user) return res.status(404).json({ error: 'User not found' });

  transactions.push({
    from: wallet,
    to: OWNER_WALLET,
    amount: 2,
    type: 'owner-fee',
    timestamp: Date.now(),
  });

  user.balance += ENTRY_AMOUNT - 2;
  return res.json({ message: 'Deposit successful', balance: user.balance });
});

// 📌 سود روزانه
app.post('/api/claim', (req, res) => {
  const { wallet } = req.body;
  const user = users.find(u => u.wallet === wallet);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const now = Date.now();
  const diff = now - user.lastClaimed;

  if (diff < 24 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'You can only claim every 24h' });
  }

  user.balance += DAILY_REWARD;
  user.lastClaimed = now;

  return res.json({ message: 'Daily reward claimed', balance: user.balance });
});

// 📌 برداشت
app.post('/api/withdraw', (req, res) => {
  const { wallet } = req.body;
  const user = users.find(u => u.wallet === wallet);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.balance < 1) return res.status(400).json({ error: 'Insufficient balance' });

  const amount = user.balance - 0.02;
  user.balance = 0;

  transactions.push({
    from: 'system',
    to: wallet,
    amount,
    type: 'withdraw',
    timestamp: Date.now(),
  });

  return res.json({ message: 'Withdraw successful', amount });
});

// شروع سرور
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});