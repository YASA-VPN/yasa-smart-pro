app.post('/api/register', async (req, res) => {
  const { username, password, ref } = req.body;

  if (!username || !password || !ref) {
    return res.status(400).send('همه فیلدها الزامی هستند.');
  }

  // چک تکراری بودن
  const existingUser = await db.get('users').findOne({ username });
  if (existingUser) {
    return res.status(400).send('این نام کاربری قبلاً ثبت شده است.');
  }

  // چک وجود معرف
  const refUser = await db.get('users').findOne({ username: ref });
  if (!refUser) {
    return res.status(400).send('کد معرف نامعتبر است.');
  }

  // اگه چپ و راست معرف پر باشن، ثبت‌نام غیرممکن
  if (refUser.left && refUser.right && ref !== 'admin') {
    return res.status(400).send('این معرف ظرفیتش تکمیل شده.');
  }

  // ثبت کاربر جدید
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

  // اتصال به چپ یا راست معرف
  if (!refUser.left) {
    await db.get('users').update({ username: ref }, { $set: { left: username } });
  } else if (!refUser.right) {
    await db.get('users').update({ username: ref }, { $set: { right: username } });
  }

  // بررسی وجود جفت برای معرف
  const updatedRef = await db.get('users').findOne({ username: ref });
  if (updatedRef.left && updatedRef.right) {
    await db.get('users').update({ username: ref }, { $inc: { balance: 6 } });
  }

  return res.send('ثبت‌نام با موفقیت انجام شد.');
});