const express = require('express');
const router = express.Router();
const db = require('./db');

// ثبت‌نام
router.post('/register', async (req, res) => {
  const { username, password, ref } = req.body;

  if (!username || !password || !ref) {
    return res.status(400).send('همه فیلدها الزامی هستند.');
  }

  const existingUser = await db.get('users').findOne({ username });
  if (existingUser) {
    return res.status(400).send('این نام کاربری قبلاً ثبت شده است.');
  }

  const refUser = await db.get('users').findOne({ username: ref });
  if (!refUser) {
    return res.status(400).send('کد معرف نامعتبر است.');
  }

  // سیستم باینری هوشمند: چک کن کدوم سمت خالیه
  let sideToFill = null;
  if (!refUser.left) sideToFill = 'left';
  else if (!refUser.right) sideToFill = 'right';
  else return res.status(400).send('این معرف دیگر ظرفیت ندارد. فقط با لینک سازنده ثبت‌نام ممکن است.');

  // ثبت کاربر
  const newUser = {
    username,
    password,
    ref,
    balance: 0,
    invest: 20,
    left: null,
    right: null,
    createdAt: new Date()
  };
  await db.get('users').insert(newUser);

  // اضافه‌کردن به درخت باینری
  await db.get('users').update({ username: ref }, { $set: { [sideToFill]: username } });

  return res.send('ثبت‌نام با موفقیت انجام شد.');
});

module.exports = router;